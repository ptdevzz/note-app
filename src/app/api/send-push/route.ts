import { NextResponse } from 'next/server';
import webPush from 'web-push';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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

    if (!targetRole || !title || !body) {
      return NextResponse.json({ error: 'Thiếu thông tin bắn push' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Firestore chưa cấu hình' }, { status: 500 });
    }

    // Lấy danh sách Push Subscription của targetRole từ Firestore
    const subDocRef = doc(db, 'push_subscriptions', targetRole);
    const snap = await getDoc(subDocRef);

    if (!snap.exists()) {
      return NextResponse.json({ message: 'Chưa có thiết bị đăng ký push notification' });
    }

    const subscriptions: any[] = snap.data()?.subscriptions || [];
    const payload = JSON.stringify({ title, body, url: url || '/' });

    const pushPromises = subscriptions.map((sub) =>
      webPush.sendNotification(sub, payload).catch((err: any) => {
        console.warn('Lỗi khi gửi push đến 1 endpoint:', err.statusCode || err);
      })
    );

    await Promise.all(pushPromises);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Lỗi API send-push:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
