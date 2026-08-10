'use client';

import React from 'react';
import { PlaceItem } from '@/lib/types';
import { getUpcomingWeeksList, WeekendDates } from '@/lib/dateUtils';
import { Calendar as CalendarIcon, X, CheckCircle2, ChevronRight } from 'lucide-react';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: PlaceItem | null;
  onAssignDate: (placeId: string, dateStr: string | null) => Promise<void>;
}

export default function DatePickerModal({ isOpen, onClose, place, onAssignDate }: DatePickerModalProps) {
  if (!isOpen || !place) return null;

  const upcomingWeeks = getUpcomingWeeksList(8);

  const handleSelect = async (dateStr: string | null) => {
    await onAssignDate(place.id, dateStr);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl relative animate-in fade-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-3 shrink-0">
          <div className="w-9 h-9 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Xếp Lịch Đi Chơi</h2>
            <p className="text-[11px] text-slate-400 line-clamp-1">{place.title}</p>
          </div>
        </div>

        <div className="overflow-y-auto space-y-3 pr-1 flex-1 my-2">
          {/* Option to clear date */}
          {place.plannedDate && (
            <button
              onClick={() => handleSelect(null)}
              className="w-full text-left p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between hover:bg-rose-500/20"
            >
              <span>Hủy xếp lịch (Chuyển về Lưu)</span>
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Chọn Tuần Cuối Tuần
          </div>

          {upcomingWeeks.map((w, idx) => {
            const isSatSelected = place.plannedDate === w.saturday;
            const isSunSelected = place.plannedDate === w.sunday;

            return (
              <div key={w.saturday} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                  <span>{w.weekLabel}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSelect(w.saturday)}
                    className={`p-2.5 rounded-xl border text-xs text-left flex items-center justify-between transition-all ${
                      isSatSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] text-amber-400 font-bold">Thứ 7</div>
                      <div>{w.saturday.split('-').slice(1).reverse().join('/')}</div>
                    </div>
                    {isSatSelected ? <CheckCircle2 className="w-4 h-4 text-amber-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                  </button>

                  <button
                    onClick={() => handleSelect(w.sunday)}
                    className={`p-2.5 rounded-xl border text-xs text-left flex items-center justify-between transition-all ${
                      isSunSelected
                        ? 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] text-rose-400 font-bold">Chủ Nhật</div>
                      <div>{w.sunday.split('-').slice(1).reverse().join('/')}</div>
                    </div>
                    {isSunSelected ? <CheckCircle2 className="w-4 h-4 text-rose-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
