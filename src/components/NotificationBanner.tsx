'use client';

import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationBannerProps {
  onEnable: () => void;
}

export default function NotificationBanner({ onEnable }: NotificationBannerProps) {
  return (
    <div className="mx-1 my-2 p-3 bg-gradient-to-r from-pink-950/80 via-rose-950/80 to-purple-950/80 border border-rose-500/30 rounded-2xl flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-2.5">
        <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400">
          <Bell className="w-4 h-4 animate-bounce" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-100">Thông báo PWA iPhone 🔔</div>
          <p className="text-[10px] text-rose-200/80">Nhận thông báo tức thì khi người ấy thêm quán mới!</p>
        </div>
      </div>
      <button
        onClick={onEnable}
        className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md active:scale-95 transition-all shrink-0"
      >
        Bật Ngay ✨
      </button>
    </div>
  );
}
