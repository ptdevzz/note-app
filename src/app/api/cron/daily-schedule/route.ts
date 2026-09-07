import { NextResponse } from 'next/server';
import webPush from 'web-push';
import defaultScheduleData from '@/data/schedule_26cdtt2.json';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@usweekends.app';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// Parse date string "DD/MM/YYYY" or "YYYY-MM-DD"
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  } else if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return null;
}

export async function GET() {
  try {
    const now = new Date();
    // Giờ Việt Nam UTC+7
    const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const jsDay = vnTime.getUTCDay();
    const currentDow = jsDay === 0 ? 8 : jsDay + 1; // 2: T2 -> 7: T7

    // Chỉ áp dụng cho ngày đi học T2 -> T7
    if (currentDow > 7) {
      return NextResponse.json({ message: 'Hôm nay là Chủ Nhật, không gửi thông báo.' });
    }

    // Lấy dữ liệu TKB
    let timetable: any = defaultScheduleData;
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'settings', 'timetable'));
        if (snap.exists()) {
          timetable = snap.data();
        }
      } catch (e) {
        console.warn('Lỗi đọc TKB Firestore trong Cron:', e);
      }
    }

    // Lọc môn học ngày hôm nay
    const todayItems: { name: string; session: string; lessons: string; room: string }[] = [];

    timetable.subjects.forEach((sub: any) => {
      const subStart = parseDate(sub.startDate);
      const subEnd = parseDate(sub.endDate);
      if (subStart && subEnd) {
        const todayZero = new Date(vnTime.getUTCFullYear(), vnTime.getUTCMonth(), vnTime.getUTCDate());
        const sStart = new Date(subStart.getFullYear(), subStart.getMonth(), subStart.getDate());
        const sEnd = new Date(subEnd.getFullYear(), subEnd.getMonth(), subEnd.getDate());
        if (todayZero < sStart || todayZero > sEnd) return;
      }

      sub.schedules.forEach((sch: any) => {
        if (sch.dayOfWeek === currentDow) {
          todayItems.push({
            name: sub.name,
            session: sch.session === 'morning' ? '☀️ Sáng' : '🌙 Chiều',
            lessons: sch.lessons,
            room: sch.room ? `P.${sch.room}` : '',
          });
        }
      });
    });

    // Nếu hôm nay KHÔNG CÓ LỊCH HỌC -> Bỏ qua không gửi
    if (todayItems.length === 0) {
      return NextResponse.json({ message: 'Hôm nay bé không có lịch học, bỏ qua gửi notification.' });
    }

    // Soạn câu thông báo nhắc lịch học gọn gàng
    const subjectListStr = todayItems
      .map(item => `• ${item.name} (${item.session} - Tiết ${item.lessons} ${item.room})`)
      .join('\n');

    const notificationPayload = {
      title: `📅 Lịch Học Hôm Nay (${todayItems.length} môn)`,
      body: subjectListStr,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: { url: '/?tab=timetable' },
    };

    // Gửi push notification cho CẢ HAI role (GF + BF)
    let sentCount = 0;
    const roles = ['GF', 'BF'];

    if (isFirebaseConfigured && db && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      for (const role of roles) {
        try {
          const subSnap = await getDoc(doc(db, 'push_subscriptions', role));
          if (!subSnap.exists()) {
            console.log(`[cron] Không có subscription cho role ${role}`);
            continue;
          }

          const subscriptions: any[] = subSnap.data()?.subscriptions || [];
          if (subscriptions.length === 0) {
            console.log(`[cron] Danh sách subscription rỗng cho role ${role}`);
            continue;
          }

          const expiredEndpoints: string[] = [];

          for (const sub of subscriptions) {
            try {
              await webPush.sendNotification(sub, JSON.stringify(notificationPayload));
              sentCount++;
              console.log(`[cron] ✅ Đã gửi push tới ${role}:`, sub.endpoint?.slice(-20));
            } catch (err: any) {
              console.warn(`[cron] ❌ Lỗi gửi push tới ${role}:`, err.statusCode, err.body || err.message);
              if (err.statusCode === 410 || err.statusCode === 404) {
                expiredEndpoints.push(sub.endpoint);
              }
            }
          }

          // Dọn subscription hết hạn
          if (expiredEndpoints.length > 0) {
            const { setDoc } = await import('firebase/firestore');
            const cleanedSubs = subscriptions.filter((s: any) => !expiredEndpoints.includes(s.endpoint));
            await setDoc(doc(db, 'push_subscriptions', role), { subscriptions: cleanedSubs, updatedAt: Date.now() });
            console.log(`[cron] 🧹 Đã dọn ${expiredEndpoints.length} subscription hết hạn cho ${role}`);
          }
        } catch (e) {
          console.warn(`[cron] Lỗi xử lý push cho role ${role}:`, e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      todaySubjectsCount: todayItems.length,
      message: `Đã gửi thông báo lịch học hôm nay cho cả 2 (${sentCount} thiết bị)!`,
    });
  } catch (error: any) {
    console.error('Lỗi Cron daily-schedule:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

