import { NextResponse } from 'next/server';
import webPush from 'web-push';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const privateKey = process.env.VAPID_PRIVATE_KEY || '';

if (publicKey && privateKey) {
  webPush.setVapidDetails(
    'mailto:support@usweekends.app',
    publicKey,
    privateKey
  );
}

export async function POST(request: Request) {
  try {
    const { targetRole, title, body, url } = await request.json();
    console.log('[send-push] Nhận yêu cầu push tới role:', targetRole, '| title:', title);

    if (!targetRole || !title || !body) {
      console.warn('[send-push] Thiếu thông tin bắn push');
      return NextResponse.json({ error: 'Thiếu thông tin bắn push' }, { status: 400 });
    }

    if (!publicKey || !privateKey) {
      console.error('[send-push] VAPID keys chưa cấu hình!');
      return NextResponse.json({ error: 'VAPID keys chưa cấu hình' }, { status: 500 });
    }

    if (!db) {
      console.error('[send-push] Firestore chưa cấu hình');
      return NextResponse.json({ error: 'Firestore chưa cấu hình' }, { status: 500 });
    }

    // Lấy danh sách Push Subscription của targetRole từ Firestore
    const subDocRef = doc(db, 'push_subscriptions', targetRole);
    const snap = await getDoc(subDocRef);

    if (!snap.exists()) {
      console.warn('[send-push] Chưa có thiết bị đăng ký cho role:', targetRole);
      return NextResponse.json({ message: 'Chưa có thiết bị đăng ký push notification', sent: 0 });
    }

    const subscriptions: any[] = snap.data()?.subscriptions || [];
    console.log('[send-push] Tìm thấy', subscriptions.length, 'subscription(s) cho role', targetRole);

    if (subscriptions.length === 0) {
      return NextResponse.json({ message: 'Danh sách subscription rỗng', sent: 0 });
    }

    const payload = JSON.stringify({ title, body, url: url || '/' });

    // Gửi push và thu thập kết quả
    const expiredEndpoints: string[] = [];
    let successCount = 0;

    const pushPromises = subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(sub, payload);
        successCount++;
        console.log('[send-push] ✅ Gửi thành công tới endpoint:', sub.endpoint?.slice(-20));
      } catch (err: any) {
        console.warn('[send-push] ❌ Lỗi gửi push:', err.statusCode, err.body || err.message);
        // 410 Gone hoặc 404 = subscription đã hết hạn, cần xóa
        if (err.statusCode === 410 || err.statusCode === 404) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    });

    await Promise.all(pushPromises);

    // Tự động dọn dẹp subscription hết hạn
    if (expiredEndpoints.length > 0) {
      console.log('[send-push] 🧹 Dọn', expiredEndpoints.length, 'subscription hết hạn');
      const cleanedSubs = subscriptions.filter(s => !expiredEndpoints.includes(s.endpoint));
      await setDoc(subDocRef, { subscriptions: cleanedSubs, updatedAt: Date.now() });
    }

    console.log('[send-push] Kết quả: sent=', successCount, '| expired=', expiredEndpoints.length);
    return NextResponse.json({ success: true, sent: successCount, expired: expiredEndpoints.length });
  } catch (error: any) {
    console.error('[send-push] Lỗi API send-push:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

