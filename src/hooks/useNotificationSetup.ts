'use client';

import { useEffect, useState } from 'react';
import {
  getNotificationPermissionStatus,
  registerServiceWorker,
  requestNotificationPermission,
  subscribeWebPush,
  triggerLocalNotification,
} from '@/lib/notificationService';
import { APP_NOTIFICATION_TITLE } from '@/lib/constants';
import { UserRole } from '@/lib/types';

/**
 * Đăng ký service worker + web push theo role,
 * và cung cấp handler để người dùng bật thông báo thủ công.
 */
export function useNotificationSetup(role: UserRole) {
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    registerServiceWorker().then(() => {
      const status = getNotificationPermissionStatus();
      setNotificationStatus(status);
      if (status === 'granted') {
        subscribeWebPush(role);
      } else if (status === 'default') {
        requestNotificationPermission(role).then(setNotificationStatus);
      }
    });
  }, [role]);

  const enableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotificationStatus(permission);
    if (permission === 'granted') {
      triggerLocalNotification(APP_NOTIFICATION_TITLE, 'Đã bật thông báo PWA thành công trên điện thoại của bạn!');
      alert('🎉 Đã bật thông báo PWA thành công! Mọi cập nhật từ người ấy sẽ nảy thông báo trên iPhone của bạn.');
    } else {
      alert('Quyền thông báo chưa được cấp. Bạn có thể kiểm tra Cài đặt của iPhone!');
    }
  };

  return { notificationStatus, enableNotifications };
}
