'use client';

import React from 'react';
import { Smile } from 'lucide-react';
import { MOOD_OPTIONS } from '@/lib/constants';
import { MoodStatus } from '@/lib/types';

interface MoodTrackerProps {
  mood: MoodStatus;
  onSelect: (emoji: string, label: string) => void;
}

export default function MoodTracker({ mood, onSelect }: MoodTrackerProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Smile className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-slate-200">Tâm Trạng Hôm Nay</h3>
        </div>
        <span className="text-[10px] text-slate-400">{mood.updatedAt}</span>
      </div>

      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{mood.emoji}</span>
          <div>
            <span className="text-xs font-bold text-slate-100">{mood.label}</span>
            <p className="text-[10px] text-slate-400">Cập nhật bởi {mood.by}</p>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 mb-2 font-medium">Chọn nhanh tâm trạng của bạn:</div>
      <div className="grid grid-cols-5 gap-1.5">
        {MOOD_OPTIONS.map((option) => (
          <button
            key={option.label}
            onClick={() => onSelect(option.emoji, option.label)}
            className={`p-2 rounded-xl border text-center transition-all active:scale-95 flex flex-col items-center justify-center ${
              mood.label === option.label
                ? 'bg-rose-500/25 border-rose-500 text-rose-200 font-bold shadow-md shadow-rose-500/20 scale-105'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
            title={option.label}
          >
            <div className="text-xl mb-0.5">{option.emoji}</div>
            <span className="text-[9px] truncate w-full block">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
