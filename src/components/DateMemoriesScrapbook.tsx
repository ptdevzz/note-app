'use client';

import React from 'react';
import { PlaceItem } from '@/lib/types';
import { Camera, Star, MapPin, ExternalLink, Heart } from 'lucide-react';

interface DateMemoriesScrapbookProps {
  visitedPlaces: PlaceItem[];
}

export default function DateMemoriesScrapbook({ visitedPlaces }: DateMemoriesScrapbookProps) {
  const totalCost = visitedPlaces.reduce((sum, p) => sum + (p.costEstimate || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Camera className="w-5 h-5 text-rose-400" />
            <span>Nhật Ký Hẹn Hò (Date Memories)</span>
          </h2>
          <p className="text-xs text-slate-400">Các chuyến đi chơi & ăn uống 2 đứa đã chinh phục</p>
        </div>
      </div>

      {/* Summary Stat Card */}
      <div className="bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-slate-900 border border-slate-800 rounded-3xl p-4 flex justify-around text-center">
        <div>
          <span className="text-xs text-slate-400">Đã đi</span>
          <div className="text-lg font-bold text-rose-300">{visitedPlaces.length} địa điểm</div>
        </div>
        <div className="w-[1px] bg-slate-800"></div>
        <div>
          <span className="text-xs text-slate-400">Tổng chi phí</span>
          <div className="text-lg font-bold text-amber-300">
            {totalCost > 0 ? `${(totalCost / 1000).toLocaleString('vi-VN')}k` : '0k'}
          </div>
        </div>
      </div>

      {visitedPlaces.length === 0 ? (
        <div className="text-center py-8 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 text-xs text-slate-500 italic">
          Chưa có địa điểm nào trong nhật ký.
          <br />
          Sau mỗi chuyến đi chơi T7/CN, hãy bấm nút tick ✔️ để lưu lại kỉ niệm nha!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {visitedPlaces.map((place) => (
            <div
              key={place.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md space-y-2.5"
            >
              <div className="flex space-x-3">
                <img
                  src={place.thumbnail}
                  alt={place.title}
                  className="w-20 h-20 object-cover rounded-xl border border-slate-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Đã đi 🎉
                    </span>

                    {/* Star Rating */}
                    {place.rating && (
                      <div className="flex items-center space-x-0.5">
                        {[...Array(place.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-100 line-clamp-2 mt-1">{place.title}</h3>

                  <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-400">
                    <span className="flex items-center space-x-0.5">
                      <MapPin className="w-2.5 h-2.5 text-rose-400" />
                      <span>{place.tags.join(', ')}</span>
                    </span>
                    {place.costEstimate ? (
                      <span className="text-amber-300 font-medium">
                        • {place.costEstimate / 1000}k
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Review Note & Attached Memory Photo */}
              {place.photoUrl && (
                <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-800">
                  <img src={place.photoUrl} alt="Memory Photo" className="w-full h-full object-cover" />
                </div>
              )}

              {place.notes && (
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-rose-200/90 italic">
                  💬 "{place.notes}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
