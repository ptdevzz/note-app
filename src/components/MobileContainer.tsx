'use client';

import React from 'react';
import { calculateLoveDays } from '@/lib/dateUtils';

interface MobileContainerProps {
  children: React.ReactNode;
  startDate?: string; // Format YYYY-MM-DD, e.g. "2026-04-18" (18/04/2026)
}

export default function MobileContainer({ children, startDate = '2026-04-18' }: MobileContainerProps) {
  const loveDays = calculateLoveDays(startDate);

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex justify-center selection:bg-rose-500 selection:text-white">
      <div className="w-full max-w-md min-h-screen bg-slate-900 flex flex-col relative shadow-2xl border-x border-slate-800/80 pb-20">
        {/* Mobile Header status bar placeholder */}
        <div className="px-5 pt-3 pb-2 flex justify-between items-center bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-800/60">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-xs font-semibold text-rose-400 tracking-wide uppercase">UsWeekends • 2 Người</span>
          </div>
          <div className="text-xs text-rose-300 font-medium bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700/50 flex items-center space-x-1">
            <span>💕 Đã yêu {loveDays} ngày</span>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
