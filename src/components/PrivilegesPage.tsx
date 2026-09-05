'use client';

import React, { useEffect } from 'react';
import { Camera, ChevronLeft } from 'lucide-react';
import PhotoboothVault from '@/components/PhotoboothVault';
import DateMemoriesScrapbook from '@/components/DateMemoriesScrapbook';
import { PhotoboothMemory, PlaceItem } from '@/lib/types';

interface PrivilegesPageProps {
  onBack: () => void;
  photobooths: PhotoboothMemory[];
  isPhotoboothsLoading: boolean;
  visitedPlaces: PlaceItem[];
  onAddPhotobooth: (item: Omit<PhotoboothMemory, 'id' | 'createdAt'>) => Promise<void>;
  onDeletePhotobooth: (id: string) => Promise<void>;
}

/** Trang "Kỷ Niệm": album photobooth + scrapbook các buổi hẹn đã đi */
export default function PrivilegesPage({
  onBack,
  photobooths,
  isPhotoboothsLoading,
  visitedPlaces,
  onAddPhotobooth,
  onDeletePhotobooth,
}: PrivilegesPageProps) {
  // Nút back của điện thoại / trình duyệt cũng quay về trang chính
  useEffect(() => {
    window.history.pushState({ view: 'privileges' }, '');
    const handlePopState = () => onBack();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackClick = () => {
    // Lùi history để popstate gọi onBack, tránh để lại entry thừa
    window.history.back();
  };

  return (
    <div className="space-y-6 pb-4 animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleBackClick}
          className="p-2 -ml-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
          title="Quay lại"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Kỷ Niệm 2 Đứa 📸</h2>
        </div>
      </div>

      <PhotoboothVault
        items={photobooths}
        isLoading={isPhotoboothsLoading}
        onAddPhotobooth={onAddPhotobooth}
        onDeletePhotobooth={onDeletePhotobooth}
      />

      <DateMemoriesScrapbook visitedPlaces={visitedPlaces} />
    </div>
  );
}
