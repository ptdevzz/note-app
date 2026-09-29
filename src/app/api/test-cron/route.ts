import { NextResponse } from 'next/server';
import webPush from 'web-push';
import defaultScheduleData from '@/data/schedule_26cdtt2.json';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@usweekends.app';

/**
 * API test cron: Gọi thủ công để debug push notification.
 * GET /api/test-cron  → chạy y hệt daily-schedule nhưng trả về log chi tiết
 * GET /api/test-cron?force=true → bỏ qua filter ngày/thứ, ép gửi push notification test
 */
export async function GET(request: Request) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log(`[test-cron] ${msg}`); };

  try {
    const { searchParams } = new URL(request.url);
    const forceMode = searchParams.get('force') === 'true';

    // 1. Check VAPID
    log(`VAPID_PUBLIC_KEY: ${VAPID_PUBLIC_KEY ? '✅ có (' + VAPID_PUBLIC_KEY.slice(0, 10) + '...)' : '❌ THIẾU'}`);
    log(`VAPID_PRIVATE_KEY: ${VAPID_PRIVATE_KEY ? '✅ có (' + VAPID_PRIVATE_KEY.slice(0, 6) + '...)' : '❌ THIẾU'}`);
    log(`VAPID_SUBJECT: ${VAPID_SUBJECT}`);
    log(`isFirebaseConfigured: ${isFirebaseConfigured}`);
    log(`db: ${db ? '✅ có' : '❌ null'}`);

    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
      log('webPush.setVapidDetails() ✅');
    } else {
      log('⚠️ Không thể setVapidDetails vì thiếu key!');
      return NextResponse.json({ logs, error: 'Missing VAPID keys' });
    }

    // 2. Check timezone + ngày
    const now = new Date();
    log(`Server UTC time: ${now.toISOString()}`);

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const formatted = formatter.format(now);
    log(`VN formatted: ${formatted}`);

    const parts = formatter.formatToParts(now);
    const partMap: Record<string, string> = {};
    parts.forEach(p => { partMap[p.type] = p.value; });
    log(`partMap: ${JSON.stringify(partMap)}`);

    const year = parseInt(partMap.year);
    const month = parseInt(partMap.month) - 1;
    const day = parseInt(partMap.day);
    const todayZero = new Date(year, month, day);
    log(`todayZero (VN): ${todayZero.toISOString()} → ${year}-${month + 1}-${day}`);

    const dayOfWeekMap: Record<string, number> = {
      'Mon': 2, 'Tue': 3, 'Wed': 4, 'Thu': 5, 'Fri': 6, 'Sat': 7, 'Sun': 8
    };
    const currentDow = dayOfWeekMap[partMap.weekday] || 8;
    const dowNames: Record<number, string> = { 2: 'T2', 3: 'T3', 4: 'T4', 5: 'T5', 6: 'T6', 7: 'T7', 8: 'CN' };
    log(`weekday raw: "${partMap.weekday}" → currentDow: ${currentDow} (${dowNames[currentDow] || '?'})`);

    if (!forceMode && currentDow > 7) {
      log('Hôm nay Chủ Nhật, skip (dùng ?force=true để bỏ qua)');
      return NextResponse.json({ logs, skipped: true, reason: 'Sunday' });
    }

    // 3. Lấy TKB
    let timetable: any = defaultScheduleData;
    let timetableSource = 'default JSON';
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'settings', 'timetable'));
        if (snap.exists()) {
          timetable = snap.data();
          timetableSource = 'Firestore';
        } else {
          log('⚠️ Firestore settings/timetable không tồn tại, dùng default');
        }
      } catch (e: any) {
        log(`⚠️ Lỗi đọc TKB Firestore: ${e.message}`);
      }
    }
    log(`TKB source: ${timetableSource}`);
    log(`Tổng số môn trong TKB: ${timetable?.subjects?.length || 0}`);

    // 4. Lọc môn học
    const todayItems: { name: string; session: string; lessons: string; room: string }[] = [];
    const skippedSubjects: string[] = [];

    if (timetable?.subjects) {
      timetable.subjects.forEach((sub: any) => {
        const subStart = parseDate(sub.startDate);
        const subEnd = parseDate(sub.endDate);

        if (subStart && subEnd) {
          const sStart = new Date(subStart.getFullYear(), subStart.getMonth(), subStart.getDate());
          const sEnd = new Date(subEnd.getFullYear(), subEnd.getMonth(), subEnd.getDate());
          if (todayZero < sStart || todayZero > sEnd) {
            skippedSubjects.push(`${sub.name} (${sub.startDate}-${sub.endDate}): ngoài khoảng`);
            return;
          }
        }

        sub.schedules?.forEach((sch: any) => {
          if (forceMode || sch.dayOfWeek === currentDow) {
            todayItems.push({
              name: sub.name,
              session: sch.session === 'morning' ? '☀️ Sáng' : '🌙 Chiều',
              lessons: sch.lessons,
              room: sch.room ? `P.${sch.room}` : '',
            });
          }
        });
      });
    }

    log(`Môn hôm nay (dow=${currentDow}): ${todayItems.length}`);
    if (skippedSubjects.length > 0) {
      log(`Môn bị skip (ngoài ngày): ${skippedSubjects.join(' | ')}`);
    }
    todayItems.forEach((item, i) => {
      log(`  [${i}] ${item.name} - ${item.session} - Tiết ${item.lessons} ${item.room}`);
    });

    if (!forceMode && todayItems.length === 0) {
      log('Không có lịch học hôm nay, skip (dùng ?force=true để test push)');
      return NextResponse.json({ logs, skipped: true, reason: 'No subjects today' });
    }

    // 5. Nếu force mode nhưng không có môn thì gửi test message
    let notificationPayload;
    if (todayItems.length === 0 && forceMode) {
      notificationPayload = {
        title: '🧪 Test Push Notification',
        body: `Test lúc ${formatted} - Hôm nay không có lịch học nhưng force=true`,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: { url: '/?tab=timetable' },
      };
    } else {
      const subjectListStr = todayItems
        .map(item => `• ${item.name} (${item.session} - Tiết ${item.lessons} ${item.room})`)
        .join('\n');
      notificationPayload = {
        title: `📅 Lịch Học Hôm Nay (${todayItems.length} môn)`,
        body: subjectListStr,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: { url: '/?tab=timetable' },
      };
    }
    log(`Payload title: ${notificationPayload.title}`);
    log(`Payload body: ${notificationPayload.body}`);

    // 6. Gửi push
    let sentCount = 0;
    const roles = ['GF', 'BF'];
    const pushResults: any[] = [];

    if (isFirebaseConfigured && db) {
      for (const role of roles) {
        try {
          const subSnap = await getDoc(doc(db, 'push_subscriptions', role));
          if (!subSnap.exists()) {
            log(`[${role}] ❌ Không có document push_subscriptions/${role}`);
            pushResults.push({ role, status: 'no_document' });
            continue;
          }

          const subscriptions: any[] = subSnap.data()?.subscriptions || [];
          log(`[${role}] Có ${subscriptions.length} subscription(s)`);

          if (subscriptions.length === 0) {
            pushResults.push({ role, status: 'empty_subscriptions' });
            continue;
          }

          const expiredEndpoints: string[] = [];

          for (let i = 0; i < subscriptions.length; i++) {
            const sub = subscriptions[i];
            log(`[${role}][${i}] endpoint: ...${sub.endpoint?.slice(-30)}`);
            try {
              await webPush.sendNotification(sub, JSON.stringify(notificationPayload));
              sentCount++;
              log(`[${role}][${i}] ✅ Push thành công!`);
              pushResults.push({ role, index: i, status: 'success' });
            } catch (err: any) {
              log(`[${role}][${i}] ❌ Lỗi: statusCode=${err.statusCode}, body=${err.body || err.message}`);
              pushResults.push({ role, index: i, status: 'error', statusCode: err.statusCode, message: err.body || err.message });
              if (err.statusCode === 410 || err.statusCode === 404) {
                expiredEndpoints.push(sub.endpoint);
              }
            }
          }

          if (expiredEndpoints.length > 0) {
            const cleanedSubs = subscriptions.filter((s: any) => !expiredEndpoints.includes(s.endpoint));
            await setDoc(doc(db, 'push_subscriptions', role), { subscriptions: cleanedSubs, updatedAt: Date.now() });
            log(`[${role}] 🧹 Dọn ${expiredEndpoints.length} subscription hết hạn`);
          }
        } catch (e: any) {
          log(`[${role}] ❌ Lỗi tổng: ${e.message}`);
          pushResults.push({ role, status: 'error', message: e.message });
        }
      }
    } else {
      log('⚠️ Firebase chưa cấu hình hoặc db null → không gửi push');
    }

    log(`=== KẾT QUẢ: Đã gửi ${sentCount} push notification ===`);

    return NextResponse.json({
      success: true,
      sentCount,
      todaySubjectsCount: todayItems.length,
      forceMode,
      pushResults,
      logs,
    });
  } catch (error: any) {
    log(`❌ LỖI CHUNG: ${error.message}`);
    console.error('Lỗi test-cron:', error);
    return NextResponse.json({ error: error.message, logs }, { status: 500 });
  }
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
