'use client';

import { useEffect, useState } from 'react';
import { dataService } from '@/lib/dataService';
import { PRESENCE_HEARTBEAT_MS } from '@/lib/constants';
import { PresenceMap, UserRole } from '@/lib/types';

/**
 * Ghi nhận "lần truy cập cuối" của tài khoản hiện tại (heartbeat khi app đang mở)
 * và theo dõi realtime presence của cả hai tài khoản.
 */
export function usePresence(currentRole: UserRole): PresenceMap {
  const [presence, setPresence] = useState<PresenceMap>({});

  useEffect(() => dataService.subscribePresence(setPresence), []);

  useEffect(() => {
    const touch = () => {
      if (document.visibilityState === 'visible') {
        dataService.updateLastSeen(currentRole);
      }
    };

    touch();
    const timer = setInterval(touch, PRESENCE_HEARTBEAT_MS);
    document.addEventListener('visibilitychange', touch);
    window.addEventListener('focus', touch);
    // Ghi lần cuối khi rời app / chuyển tab (best effort)
    window.addEventListener('pagehide', touch);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', touch);
      window.removeEventListener('focus', touch);
      window.removeEventListener('pagehide', touch);
    };
  }, [currentRole]);

  return presence;
}
