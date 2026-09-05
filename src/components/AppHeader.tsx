'use client';

import React from 'react';
import { Camera, LogOut, Music } from 'lucide-react';
import { TabType } from '@/components/BottomNav';
import { APP_VERSION } from '@/lib/constants';
import { getRoleBadge } from '@/lib/roleUtils';
import { UserRole } from '@/lib/types';

interface AppHeaderProps {
  currentRole: UserRole;
  activeTab: TabType;
  onOpenMusic: () => void;
  onOpenPrivileges: () => void;
  onLogout: () => void;
}

export default function AppHeader({ currentRole, activeTab, onOpenMusic, onOpenPrivileges, onLogout }: AppHeaderProps) {
  const isMusicActive = activeTab === 'music';

  return (
    <div className="px-3 pt-3 pb-1 flex items-center justify-between gap-2">
      <div className="flex items-center space-x-2 shrink-0">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-rose-400/40 shrink-0">
          <img src="/couple.png" alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] bg-rose-500/20 text-rose-300 font-extrabold px-2 py-0.5 rounded-full border border-rose-500/30 inline-block">
            {getRoleBadge(currentRole)}
          </span>
          <span className="text-[9px] font-mono font-bold text-slate-500 pl-1 leading-none">{APP_VERSION}</span>
        </div>
      </div>

      <div className="flex items-center space-x-1 shrink-0">
        <button
          onClick={onOpenMusic}
          className={`p-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-center active:scale-95 transition-all shadow-sm shrink-0 ${
            isMusicActive ? 'border-rose-500 text-rose-300 bg-rose-500/30' : 'border-rose-500/30 text-rose-300 bg-slate-900'
          }`}
          title="Nghe Nhạc & Góc Sở Thích"
        >
          <Music className="w-3.5 h-3.5 text-rose-400" />
        </button>

        <button
          onClick={onOpenPrivileges}
          className="bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/40 text-amber-300 px-2 py-1.5 rounded-xl text-[11px] font-bold flex items-center space-x-1 whitespace-nowrap active:scale-95 transition-all shadow-sm shrink-0"
          title="Album Photobooth & Kỷ Niệm Các Buổi Hẹn"
        >
          <Camera className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Kỷ Niệm</span>
        </button>

        <button
          onClick={onLogout}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-slate-400 hover:text-rose-400 p-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center whitespace-nowrap active:scale-95 transition-all shadow-sm shrink-0"
          title="Khóa ứng dụng / Đăng xuất"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>
    </div>
  );
}
