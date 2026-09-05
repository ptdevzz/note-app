'use client';

import React, { useMemo } from 'react';
import { Plus, Search, Sparkles } from 'lucide-react';
import PlaceCard from '@/components/PlaceCard';
import { PlaceCardSkeleton } from '@/components/SkeletonLoader';
import { ALL_CATEGORIES, PLACE_CATEGORY_FILTERS } from '@/lib/constants';
import { PlaceItem } from '@/lib/types';

export type CategoryFilter = (typeof PLACE_CATEGORY_FILTERS)[number];

interface CollectionTabProps {
  places: PlaceItem[];
  isLoading: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedCategory: CategoryFilter;
  onSelectCategory: (category: CategoryFilter) => void;
  onOpenAddModal: () => void;
  onOpenDatePicker: (place: PlaceItem) => void;
  onToggleVisited: (place: PlaceItem) => void;
  onDeletePlace: (id: string) => void;
}

/** Chỉ hiển thị các địa điểm chưa được xếp lịch hoặc chưa đi */
function isAvailable(place: PlaceItem): boolean {
  return place.status !== 'PLANNED' && place.status !== 'VISITED';
}

function matchesSearch(place: PlaceItem, query: string): boolean {
  const q = query.toLowerCase();
  return place.title.toLowerCase().includes(q) || place.tags.some((tag) => tag.toLowerCase().includes(q));
}

export default function CollectionTab({
  places,
  isLoading,
  searchQuery,
  onSearchQueryChange,
  selectedCategory,
  onSelectCategory,
  onOpenAddModal,
  onOpenDatePicker,
  onToggleVisited,
  onDeletePlace,
}: CollectionTabProps) {
  const filteredPlaces = useMemo(
    () =>
      places.filter(
        (place) =>
          isAvailable(place) &&
          matchesSearch(place, searchQuery) &&
          (selectedCategory === ALL_CATEGORIES || place.category === selectedCategory),
      ),
    [places, searchQuery, selectedCategory],
  );

  return (
    <div className="space-y-4 pb-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Bộ Sưu Tập</h2>
          <p className="text-xs text-slate-400">Các địa điểm & hoạt động 2 đứa đã lưu</p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl shadow-lg shadow-rose-500/25 flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Mới</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm theo tên quán, quận (vd: Q1, Lẩu)..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/60"
        />
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {PLACE_CATEGORY_FILTERS.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <PlaceCardSkeleton />
          <PlaceCardSkeleton />
          <PlaceCardSkeleton />
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="text-center py-10 bg-slate-900/50 border border-slate-800/60 rounded-3xl p-6">
          <Sparkles className="w-8 h-8 text-rose-400/50 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">Chưa tìm thấy địa điểm nào.</p>
          <button onClick={onOpenAddModal} className="mt-3 text-xs text-rose-400 font-bold hover:underline">
            + Bấm nút cộng để thêm hoạt động đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onOpenDatePicker={onOpenDatePicker}
              onToggleVisited={onToggleVisited}
              onDelete={onDeletePlace}
            />
          ))}
        </div>
      )}
    </div>
  );
}
