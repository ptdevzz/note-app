'use client';

import React from 'react';
import { PlaceItem } from '@/lib/types';
import { getWeekendForWeekOffset, formatDateTime } from '@/lib/dateUtils';
import { 
  Calendar, MapPin, Navigation, ExternalLink, CheckCircle2, 
  Sparkles, Clock, Flame, Dices, Plus
} from 'lucide-react';

interface CurrentWeekendViewProps {
  places: PlaceItem[];
  onToggleVisited: (place: PlaceItem) => void;
  onOpenAddModal: () => void;
  onOpenSpinWheel: () => void;
  onAssignDate: (placeId: string, dateStr: string | null) => Promise<void>;
}

export default function CurrentWeekendView({
  places,
  onToggleVisited,
  onOpenAddModal,
  onOpenSpinWheel,
  onAssignDate,
}: CurrentWeekendViewProps) {
  // Automatically calculate nearest upcoming weekend (offset = 0)
  const currentWeekend = getWeekendForWeekOffset(0);

  const satPlaces = places.filter((p) => p.status === 'PLANNED' && p.plannedDate === currentWeekend.saturday);
  const sunPlaces = places.filter((p) => p.status === 'PLANNED' && p.plannedDate === currentWeekend.sunday);

  // Helper for Google Maps
  const openGoogleMaps = (title: string, tags: string[]) => {
    const queryStr = `${title} ${tags.join(' ')}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryStr)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Banner - Auto Filled Weekend */}
      <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-purple-950/80 border border-rose-500/30 rounded-3xl p-4 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
           
            <h2 className="text-base font-bold text-white">Lịch Hẹn Cuối Tuần Này</h2>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              {currentWeekend.saturdayDisplay} & {currentWeekend.sundayDisplay}
            </p>
          </div>

          <button
            onClick={onOpenSpinWheel}
            className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-2xl shadow-lg shadow-purple-600/30 flex items-center space-x-1 shrink-0"
          >
            <Dices className="w-4 h-4" />
            <span>Xoay Món 🎲</span>
          </button>
        </div>
      </div>

      {/* --- SATURDAY SECTION --- */}
      <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-2xl flex items-center justify-center font-bold text-xs">
              T7
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">{currentWeekend.saturdayDisplay}</h3>
              <p className="text-[10px] text-slate-400">Lịch trình hẹn hò Thứ 7</p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            {satPlaces.length} Hoạt động
          </span>
        </div>

        {satPlaces.length === 0 ? (
          <div className="text-center py-6 px-4 bg-slate-950/60 rounded-2xl border border-slate-800/60">
            <p className="text-xs text-slate-400 italic mb-2">Chưa có lịch trình cho Thứ 7 này.</p>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-500/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Hoạt Động Cho T7</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {satPlaces.map((place, idx) => (
              <div
                key={place.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2.5 relative shadow-sm"
              >
                <div className="flex space-x-3">
                  <img
                    src={place.thumbnail}
                    alt={place.title}
                    className="w-16 h-16 object-cover rounded-xl border border-slate-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1">
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        #{idx + 1} • {place.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 line-clamp-2">{place.title}</h4>
                    {(place.createdBy || place.createdAt) && (
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {place.createdBy || 'Bé Yêu'} {place.createdAt ? `• ${formatDateTime(place.createdAt)}` : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    {place.tiktokUrl ? (
                      <a
                        href={place.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-rose-400 font-semibold flex items-center space-x-1 text-[11px]"
                      >
                        <span>TikTok</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null}

                    <button
                      onClick={() => openGoogleMaps(place.title, place.tags)}
                      className="text-emerald-400 hover:underline font-semibold flex items-center space-x-1 text-[11px]"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Maps Chỉ đường</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onToggleVisited(place)}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-xl border border-emerald-500/30 flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã đi</span>
                    </button>

                    <button
                      onClick={() => onAssignDate(place.id, null)}
                      className="text-slate-500 hover:text-rose-400 p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SUNDAY SECTION --- */}
      <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-2xl flex items-center justify-center font-bold text-xs">
              CN
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">{currentWeekend.sundayDisplay}</h3>
              <p className="text-[10px] text-slate-400">Lịch trình hẹn hò Chủ Nhật</p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            {sunPlaces.length} Hoạt động
          </span>
        </div>

        {sunPlaces.length === 0 ? (
          <div className="text-center py-6 px-4 bg-slate-950/60 rounded-2xl border border-slate-800/60">
            <p className="text-xs text-slate-400 italic mb-2">Chưa có lịch trình cho Chủ Nhật này.</p>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-500/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Hoạt Động Cho CN</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sunPlaces.map((place, idx) => (
              <div
                key={place.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2.5 relative shadow-sm"
              >
                <div className="flex space-x-3">
                  <img
                    src={place.thumbnail}
                    alt={place.title}
                    className="w-16 h-16 object-cover rounded-xl border border-slate-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        #{idx + 1} • {place.category}
                      </span>
                      <span className="text-[10px] text-slate-500">Bởi {place.createdBy}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 line-clamp-2">{place.title}</h4>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    {place.tiktokUrl ? (
                      <a
                        href={place.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-rose-400 font-semibold flex items-center space-x-1 text-[11px]"
                      >
                        <span>TikTok</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null}

                    <button
                      onClick={() => openGoogleMaps(place.title, place.tags)}
                      className="text-emerald-400 hover:underline font-semibold flex items-center space-x-1 text-[11px]"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Maps Chỉ đường</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onToggleVisited(place)}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-xl border border-emerald-500/30 flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã đi</span>
                    </button>

                    <button
                      onClick={() => onAssignDate(place.id, null)}
                      className="text-slate-500 hover:text-rose-400 p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
