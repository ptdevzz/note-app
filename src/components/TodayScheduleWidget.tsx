'use client';

import React, { useMemo } from 'react';
import { GraduationCap } from 'lucide-react';
import { CLASS_NAME } from '@/lib/constants';
import { getSubjectsForDate } from '@/lib/timetableUtils';
import { TimetableData } from '@/lib/types';

interface TodayScheduleWidgetProps {
  timetable: TimetableData;
}

export default function TodayScheduleWidget({ timetable }: TodayScheduleWidgetProps) {
  const todaySubjects = useMemo(() => getSubjectsForDate(timetable), [timetable]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-4 h-4 text-rose-400" />
          <h3 className="text-xs font-bold text-slate-200">Lịch Học Hôm Nay Của Bé</h3>
        </div>
        <span className="text-[10px] text-rose-400 font-bold">{CLASS_NAME}</span>
      </div>

      {todaySubjects.length === 0 ? (
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 text-center">
          <p className="text-xs font-bold text-emerald-400">Hôm nay bé không có lịch học 🎉</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Dành thời gian nghỉ ngơi thư giãn nhen.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {todaySubjects.map((item, idx) => (
            <div key={idx} className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      item.session === 'morning' ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {item.session === 'morning' ? 'Sáng (7h15-11h15)' : 'Chiều (12h30-16h30)'}
                  </span>
                  <span className="text-[10px] font-mono text-rose-300 font-bold">Tiết {item.lessons}</span>
                </div>
                <h4 className="text-xs font-extrabold text-white">{item.subject.name}</h4>
                {item.room && (
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Phòng: <strong className="text-rose-400">{item.room}</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
