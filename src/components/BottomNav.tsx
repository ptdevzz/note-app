import React from 'react';
import { Home, Bookmark, CalendarDays, GraduationCap, Plus } from 'lucide-react';

export type TabType = 'home' | 'tiktok' | 'timetable' | 'plan' | 'music';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onAddClick: () => void;
  savedCount?: number;
}

export default function BottomNav({ activeTab, setActiveTab, onAddClick, savedCount = 0 }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-3 py-2 z-40">
      <div className="flex justify-around items-center relative">
        {/* Tab 1: Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
            activeTab === 'home'
              ? 'text-rose-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
          <span className="text-[11px] mt-1 font-medium tracking-tight">Trang Chủ</span>
        </button>

        {/* Tab 2: TikTok / Collection */}
        <button
          onClick={() => setActiveTab('tiktok')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 relative ${
            activeTab === 'tiktok'
              ? 'text-rose-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Bookmark className={`w-5 h-5 ${activeTab === 'tiktok' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center border border-slate-900">
                {savedCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 font-medium tracking-tight">Bộ Sưu Tập</span>
        </button>

        {/* CENTER FLOATING PLUS BUTTON */}
        <div className="relative -top-4">
          <button
            onClick={onAddClick}
            className="w-12 h-12 bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-500/40 border-4 border-slate-900 active:scale-90 transition-transform"
            title="Thêm Hoạt Động Mới"
          >
            <Plus className="w-6 h-6 stroke-[3px]" />
          </button>
        </div>

        {/* Tab 3: Timetable (Thời Khóa Biểu) - Replaced Music tab */}
        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
            activeTab === 'timetable'
              ? 'text-rose-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className={`w-5 h-5 ${activeTab === 'timetable' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
          <span className="text-[11px] mt-1 font-medium tracking-tight">Thời Khóa Biểu</span>
        </button>

        {/* Tab 4: Weekend Plan */}
        <button
          onClick={() => setActiveTab('plan')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
            activeTab === 'plan'
              ? 'text-rose-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarDays className={`w-5 h-5 ${activeTab === 'plan' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
          <span className="text-[11px] mt-1 font-medium tracking-tight">Cuối Tuần</span>
        </button>
      </div>
    </nav>
  );
}
