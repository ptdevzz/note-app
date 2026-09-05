'use client';

import React, { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { PRESENCE_ONLINE_WINDOW_MS } from '@/lib/constants';
import { formatDateTime } from '@/lib/dateUtils';
import { getPartnerRole, getRoleName } from '@/lib/roleUtils';
import { PresenceMap, UserRole } from '@/lib/types';

interface PartnerPresenceProps {
  currentRole: UserRole;
  presence: PresenceMap;
}

/** Dòng trạng thái: người ấy đang online hay truy cập lần cuối lúc nào */
export default function PartnerPresence({ currentRole, presence }: PartnerPresenceProps) {
  // Tick định kỳ để trạng thái "đang online" tự hết hạn khi không có heartbeat mới
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const partnerRole = getPartnerRole(currentRole);
  const partnerName = getRoleName(partnerRole);
  const lastSeenAt = presence[partnerRole]?.lastSeenAt;

  if (!lastSeenAt) {
    return (
      <div className="px-3 pb-1 flex items-center gap-1.5 text-[10px] text-slate-500">
        <Clock3 className="w-3 h-3" />
        <span>{partnerName} chưa truy cập lần nào</span>
      </div>
    );
  }

  const isOnline = now - lastSeenAt < PRESENCE_ONLINE_WINDOW_MS;

  return (
    <div className="px-3 pb-1 flex items-center gap-1.5 text-[10px]">
      {isOnline ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 font-bold">{partnerName} đang online</span>
        </>
      ) : (
        <>
          <Clock3 className="w-3 h-3 text-slate-500" />
          <span className="text-slate-400">
            {partnerName} truy cập lần cuối: <strong className="text-rose-300">{formatDateTime(lastSeenAt)}</strong>
          </span>
        </>
      )}
    </div>
  );
}
