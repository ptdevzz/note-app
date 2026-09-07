import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * API kiểm tra trạng thái push subscription cho 1 role.
 * GET /api/debug-push?role=GF
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || 'GF';

  if (!db) {
    return NextResponse.json({ error: 'Firestore chưa cấu hình' }, { status: 500 });
  }

  const hasVapidPublic = !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const hasVapidPrivate = !!process.env.VAPID_PRIVATE_KEY;

  const subDocRef = doc(db, 'push_subscriptions', role);
  const snap = await getDoc(subDocRef);

  if (!snap.exists()) {
    return NextResponse.json({
      role,
      hasVapidPublic,
      hasVapidPrivate,
      subscriptionCount: 0,
      message: `Chưa có thiết bị nào đăng ký push cho role ${role}. Hãy mở app PWA trên điện thoại và bật thông báo.`
    });
  }

  const subscriptions: any[] = snap.data()?.subscriptions || [];

  return NextResponse.json({
    role,
    hasVapidPublic,
    hasVapidPrivate,
    subscriptionCount: subscriptions.length,
    subscriptions: subscriptions.map((s, i) => ({
      index: i,
      endpoint: s.endpoint ? `...${s.endpoint.slice(-40)}` : 'N/A',
      hasKeys: !!s.keys,
      hasP256dh: !!s.keys?.p256dh,
      hasAuth: !!s.keys?.auth,
    })),
  });
}
