'use client';

import React from 'react';
import { Dices, Flame } from 'lucide-react';
import { WeekendDates } from '@/lib/dateUtils';

interface WeekendQuickBannerProps {
  weekend: WeekendDates;
  plannedCount: number;
  onOpenPlan: () => void;
  onOpenSpinWheel: () => void;
}

export default function WeekendQuickBanner({ weekend, plannedCount, onOpenPlan, onOpenSpinWheel }: WeekendQuickBannerProps) {
  return (
    <div
      onClick={onOpenPlan}
      className="bg-gradient-to-r from-purple-900/40 via-slate-900 to-rose-900/40 border border-slate-800 rounded-3xl p-4 shadow-md flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
    >
      <div>
        <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-300">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Lịch Hẹn Cuối Tuần Này Gần Nhất</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {weekend.saturdayDisplay} & {weekend.sundayDisplay} ({plannedCount} món)
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenSpinWheel();
        }}
        className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold px-3 py-2.5 rounded-2xl shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 shrink-0"
      >
        <Dices className="w-4 h-4" />
        <span>Xoay 🎲</span>
      </button>
    </div>
  );
}
