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

    // Lấy token đăng ký Push Notification của Bé Yêu (Role GF) từ Firestore
    let sentCount = 0;
    if (isFirebaseConfigured && db) {
      const gfSubSnap = await getDoc(doc(db, 'push_subscriptions', 'GF'));
      if (gfSubSnap.exists()) {
        const pushSubscription = gfSubSnap.data().subscription;
        if (pushSubscription && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
          await webPush.sendNotification(pushSubscription, JSON.stringify(notificationPayload));
          sentCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      todaySubjectsCount: todayItems.length,
      message: `Đã tự động gửi thông báo lịch học hôm nay cho Bé Yêu!`,
    });
  } catch (error: any) {
    console.error('Lỗi Cron daily-schedule:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
