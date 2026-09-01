'use client';

/**
 * Service Worker & Web Push Notification Manager cho iOS PWA & Android
 */

export async function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker đã đăng ký thành công:', reg);
      return reg;
    } catch (err) {
      console.warn('Không thể đăng ký Service Worker:', err);
    }
  }
  return null;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeWebPush(role: string) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    console.warn('Thiếu NEXT_PUBLIC_VAPID_PUBLIC_KEY');
    return;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    if (sub) {
      const { dataService } = await import('@/lib/dataService');
      await dataService.savePushSubscription(role, sub.toJSON());
      console.log('Đã đăng ký Web Push VAPID vĩnh viễn cho role:', role);
    }
  } catch (e) {
    console.warn('Lỗi subscribeWebPush:', e);
  }
}

export async function requestNotificationPermission(role?: string): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerServiceWorker();
      if (role) {
        await subscribeWebPush(role);
      }
    }
    return permission;
  } catch (e) {
    console.warn('Lỗi xin quyền Notification:', e);
    return 'denied';
  }
}

export function getNotificationPermissionStatus(): NotificationPermission {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
}

export async function triggerLocalNotification(title: string, body: string, url: string = '/') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          reg.showNotification(title, {
            body,
            icon: '/couple.png',
            badge: '/icon.svg',
            vibrate: [200, 100, 200],
            data: { url }
          } as any);
          return;
        }
      }
      
      // Browser fallback notification
      new Notification(title, {
        body,
        icon: '/couple.png',
        data: { url }
      });
    } catch (e) {
      console.warn('Lỗi hiển thị Notification:', e);
    }
  }
}
