'use client';

import React from 'react';
import { Calendar as CalendarIcon, CheckCircle2, ExternalLink, MapPin, Navigation, Trash2 } from 'lucide-react';
import { formatDateTime } from '@/lib/dateUtils';
import { PlaceItem } from '@/lib/types';

interface PlaceCardProps {
  place: PlaceItem;
  onOpenDatePicker: (place: PlaceItem) => void;
  onToggleVisited: (place: PlaceItem) => void;
  onDelete: (id: string) => void;
}

/** Mở Google Maps tìm theo tên quán + tags */
function openGoogleMaps(title: string, tags: string[]) {
  const query = `${title} ${tags.join(' ')}`;
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
}

/** YYYY-MM-DD -> DD/MM */
function formatPlannedDateShort(plannedDate: string): string {
  return plannedDate.split('-').slice(1).reverse().join('/');
}

export default function PlaceCard({ place, onOpenDatePicker, onToggleVisited, onDelete }: PlaceCardProps) {
  const isPlanned = place.status === 'PLANNED';
  const isVisited = place.status === 'VISITED';

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden p-3 shadow-md hover:border-slate-700 transition-colors relative">
      <div className="flex space-x-3">
        <img
          src={place.thumbnail}
          alt={place.title}
          className="w-20 h-20 object-cover rounded-xl border border-slate-800 shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {place.category}
            </span>
          </div>

          <h3 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug">{place.title}</h3>

          {(place.createdBy || place.createdAt) && (
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
              {place.createdBy || 'Bé Yêu'} {place.createdAt ? `• ${formatDateTime(place.createdAt)}` : ''}
            </p>
          )}

          <div className="flex items-center space-x-2 mt-2">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center space-x-0.5 text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded-md border border-slate-800"
              >
                <MapPin className="w-2.5 h-2.5 text-rose-400" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
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
            <span>Chỉ đường</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenDatePicker(place)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition-colors ${
              isPlanned
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CalendarIcon className="w-3 h-3" />
            <span>{place.plannedDate ? formatPlannedDateShort(place.plannedDate) : '+ Xếp Lịch'}</span>
          </button>

          <button
            onClick={() => onToggleVisited(place)}
            className={`p-1 rounded-xl transition-colors ${
              isVisited ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>

          <button onClick={() => onDelete(place.id)} className="p-1 text-slate-600 hover:text-rose-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
