'use client';

import React from 'react';
import { BellRing, Calendar as CalendarIcon, Share2, Sparkles } from 'lucide-react';
import CurrentWeekendView from '@/components/CurrentWeekendView';
import { PlaceItem } from '@/lib/types';

export type PlanMode = 'current' | 'calendar';

interface PlanTabProps {
  planMode: PlanMode;
  onChangePlanMode: (mode: PlanMode) => void;
  places: PlaceItem[];
  onToggleVisited: (place: PlaceItem) => void;
  onOpenAddModal: () => void;
  onOpenSpinWheel: () => void;
  onAssignDate: (placeId: string, dateStr: string | null) => Promise<void>;
  onOpenStoryExport: () => void;
  onSendNudge: () => void;
  onResetWeekOffset: () => void;
}

export default function PlanTab({
  planMode,
  onChangePlanMode,
  places,
  onToggleVisited,
  onOpenAddModal,
  onOpenSpinWheel,
  onAssignDate,
  onOpenStoryExport,
  onSendNudge,
  onResetWeekOffset,
}: PlanTabProps) {
  const modeButtonClass = (mode: PlanMode) =>
    `py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
      planMode === mode ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
    }`;

  return (
    <div className="space-y-4 pb-4">
      {/* Sub-tab switcher: Tuần Này Gần Nhất vs Lịch Các Tuần Sau */}
      <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
        <button
          onClick={() => {
            onChangePlanMode('current');
            onResetWeekOffset();
          }}
          className={modeButtonClass('current')}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tuần Này Gần Nhất</span>
        </button>

        <button onClick={() => onChangePlanMode('calendar')} className={modeButtonClass('calendar')}>
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Lịch Các Tuần Sau</span>
        </button>
      </div>

      {/* Quick Action Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onOpenStoryExport}
          className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 py-2 px-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Xuất Ảnh Story 📸</span>
        </button>

        <button
          onClick={onSendNudge}
          className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 py-2 px-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all shadow-sm"
        >
          <BellRing className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
          <span>Nhắc Xem Lịch 🔔</span>
        </button>
      </div>

      {/* Cả 2 mode hiện đang dùng chung CurrentWeekendView (giữ nguyên hành vi cũ) */}
      <CurrentWeekendView
        places={places}
        onToggleVisited={onToggleVisited}
        onOpenAddModal={onOpenAddModal}
        onOpenSpinWheel={onOpenSpinWheel}
        onAssignDate={onAssignDate}
      />
    </div>
  );
}
