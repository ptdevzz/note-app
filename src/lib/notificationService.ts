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

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerServiceWorker();
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
