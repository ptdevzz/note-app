'use client';

import React, { useState } from 'react';
import { PhotoboothMemory } from '@/lib/types';
import { convertFileToBase64 } from '@/lib/imageUtils';
import { PhotoboothGridSkeleton } from '@/components/SkeletonLoader';
import { 
  Camera, Film, Plus, Calendar, MapPin, Trash2, ExternalLink, Video, Upload, Image as ImageIcon, ChevronLeft, ChevronRight, X, Loader2, Sparkles
} from 'lucide-react';

interface PhotoboothVaultProps {
  items: PhotoboothMemory[];
  isLoading?: boolean;
  onAddPhotobooth: (item: Omit<PhotoboothMemory, 'id' | 'createdAt'>) => Promise<void>;
  onDeletePhotobooth: (id: string) => Promise<void>;
}

export default function PhotoboothVault({
  items,
  isLoading = false,
  onAddPhotobooth,
  onDeletePhotobooth
}: PhotoboothVaultProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lightbox Modal State
  const [activeGallery, setActiveGallery] = useState<{ title: string; images: string[]; index: number } | null>(null);

  // Add Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-04-18');
  const [location, setLocation] = useState('Life4Cuts Q1');
  const [frameColor, setFrameColor] = useState<'pink' | 'dark' | 'cream' | 'purple'>('pink');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Handle uploading multiple image files at once
  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const base64List: string[] = [];
      for (const file of files) {
        const base64 = await convertFileToBase64(file, 500, 0.65);
        base64List.push(base64);
      }
      setUploadedImages(prev => [...prev, ...base64List]);
    } catch (err) {
      alert('Không thể đọc file ảnh, vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const coverPhoto = uploadedImages[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

      await onAddPhotobooth({
        title: title.trim(),
        date,
        location: location.trim() || 'Photobooth Studio',
        frameColor,
        stripImage: coverPhoto,
        images: uploadedImages.length > 0 ? uploadedImages : [coverPhoto],
        videoUrl: videoUrl.trim(),
        notes: notes.trim() || 'Kỷ niệm chụp Photobooth của 2 đứa 💕',
      });

      setIsModalOpen(false);
      setTitle('');
      setUploadedImages([]);
      setVideoUrl('');
      setNotes('');
    } catch (err) {
      alert('Có lỗi xảy ra khi lưu album.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFrameStyle = (color: string) => {
    switch (color) {
      case 'pink':
        return 'bg-gradient-to-b from-rose-900 via-pink-950 to-rose-900 border-rose-500/40 text-pink-200';
      case 'dark':
        return 'bg-slate-950 border-slate-800 text-slate-200';
      case 'cream':
        return 'bg-amber-950/80 border-amber-800/40 text-amber-200';
      case 'purple':
        return 'bg-purple-950/80 border-purple-800/40 text-purple-200';
      default:
        return 'bg-slate-900 border-slate-800 text-slate-200';
    }
  };

  // Render Facebook Collage Grid
  const renderFacebookCollage = (item: PhotoboothMemory) => {
    const list = item.images && item.images.length > 0 ? item.images : [item.stripImage];
    const total = list.length;

    const openGalleryAtIndex = (idx: number) => {
      setActiveGallery({
        title: item.title,
        images: list,
        index: idx
      });
    };

    if (total === 1) {
      return (
        <div 
          onClick={() => openGalleryAtIndex(0)}
          className="w-full h-64 rounded-xl overflow-hidden cursor-pointer relative group border border-slate-800"
        >
          <img src={list[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      );
    }

    if (total === 2) {
      return (
        <div className="grid grid-cols-2 gap-1.5 h-56 rounded-xl overflow-hidden border border-slate-800">
          {list.slice(0, 2).map((img, idx) => (
            <div 
              key={idx} 
              onClick={() => openGalleryAtIndex(idx)}
              className="h-full cursor-pointer relative overflow-hidden group"
            >
              <img src={img} alt={`${item.title} ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      );
    }

    if (total === 3) {
      return (
        <div className="grid grid-cols-2 gap-1.5 h-64 rounded-xl overflow-hidden border border-slate-800">
          <div 
            onClick={() => openGalleryAtIndex(0)}
            className="h-full cursor-pointer relative overflow-hidden group"
          >
            <img src={list[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="grid grid-rows-2 gap-1.5 h-full">
            {list.slice(1, 3).map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => openGalleryAtIndex(idx + 1)}
                className="h-full cursor-pointer relative overflow-hidden group"
              >
                <img src={img} alt={`${item.title} ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4 or more photos (Facebook 4-Grid layout with +N count overlay!)
    return (
      <div className="grid grid-cols-2 gap-1.5 h-64 rounded-xl overflow-hidden border border-slate-800">
        {list.slice(0, 3).map((img, idx) => (
          <div 
            key={idx} 
            onClick={() => openGalleryAtIndex(idx)}
            className="h-full cursor-pointer relative overflow-hidden group"
          >
            <img src={img} alt={`${item.title} ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        ))}

        {/* 4th photo with +N overlay */}
        <div 
          onClick={() => openGalleryAtIndex(3)}
          className="h-full cursor-pointer relative overflow-hidden group"
        >
          <img src={list[3]} alt={`${item.title} 3`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          {total > 4 && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center text-white font-extrabold transition-colors hover:bg-slate-950/65">
              <span className="text-xl font-mono">+{total - 3}</span>
              <span className="text-[10px] text-pink-200 uppercase tracking-widest mt-0.5">Xem tất cả</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-950 via-slate-900 to-purple-950 border border-pink-500/30 rounded-3xl p-4 shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-pink-400" />
            <h2 className="text-base font-bold text-white">Góc Photobooth & Video Kỷ Niệm 🎞️</h2>
          </div>
          <p className="text-xs text-pink-200/80 mt-1">
            Album dải ảnh 4 ô & clip timelapse hậu trường phong cách Facebook Grid
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-pink-600 hover:bg-pink-500 active:scale-95 text-white text-xs font-bold px-3 py-2.5 rounded-2xl shadow-lg shadow-pink-600/30 flex items-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Ảnh PTB</span>
        </button>
      </div>

      {/* Grid of Photobooth Strip Cards */}
      {isLoading ? (
        <div className="space-y-4">
          <PhotoboothGridSkeleton />
          <PhotoboothGridSkeleton />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
          <Film className="w-8 h-8 text-pink-400/50 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">Chưa có bộ ảnh Photobooth nào.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-3 text-xs text-pink-400 font-bold hover:underline"
          >
            + Bấm để tải album ảnh Photobooth đầu tiên nha
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`border rounded-3xl p-4 shadow-xl space-y-3 relative overflow-hidden transition-all ${getFrameStyle(item.frameColor)}`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 text-[10px] text-pink-300 font-semibold mb-1">
                    <Calendar className="w-3 h-3 text-pink-400" />
                    <span>{item.date}</span>
                    <span>•</span>
                    <MapPin className="w-3 h-3 text-pink-400" />
                    <span>{item.location}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{item.title}</h3>
                </div>

                <button
                  onClick={() => onDeletePhotobooth(item.id)}
                  className="text-slate-400 hover:text-rose-400 p-1.5 rounded-xl transition-colors"
                  title="Xóa bộ ảnh"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Facebook-Style Multi-Photo Collage Grid */}
              <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800/80 shadow-inner space-y-2 relative">
                {renderFacebookCollage(item)}

                {/* Floating Video Timelapse Badge */}
                {item.videoUrl && (
                  <a
                    href={item.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-rose-500/90 hover:bg-rose-500 text-white font-bold text-xs py-2 rounded-xl shadow-lg flex items-center justify-center space-x-1.5 backdrop-blur-md transition-all active:scale-95 mt-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Xem Video QR Timelapse 🎬</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}

                <div className="text-center pt-1 pb-1">
                  <p className="text-xs text-slate-300 italic">"{item.notes || 'Kỷ niệm chụp Photobooth siêu xinh'}"</p>
                  <span className="text-[10px] font-mono text-pink-300/80 mt-0.5 block">
                    UsWeekends Photobooth Studio • {(item.images?.length || 1)} Ảnh 📸
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Slideshow Modal */}
      {activeGallery && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col justify-between p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">{activeGallery.title}</h3>
              <span className="text-xs text-slate-400 font-mono">
                Ảnh {activeGallery.index + 1} / {activeGallery.images.length}
              </span>
            </div>
            <button
              onClick={() => setActiveGallery(null)}
              className="p-2 bg-slate-800 text-slate-200 hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4">
            <img
              src={activeGallery.images[activeGallery.index]}
              alt={`Gallery ${activeGallery.index}`}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl border border-slate-800"
            />

            {activeGallery.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveGallery(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full border border-slate-700 shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveGallery(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full border border-slate-700 shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="flex justify-center space-x-1.5 overflow-x-auto py-2">
            {activeGallery.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveGallery(prev => prev ? { ...prev, index: idx } : null)}
                className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  activeGallery.index === idx ? 'border-pink-500 scale-105' : 'border-slate-800 opacity-50'
                }`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Photobooth Memory (Multi-Photo Support) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-pink-400" />
                <h3 className="text-sm font-bold text-white">Thêm Album Photobooth Nổi Tải 📸</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tiêu Đề Chuyến Đi Chụp</label>
                <input
                  type="text"
                  required
                  placeholder="vd: Chụp Photobooth Kỷ Niệm 1 Năm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ngày Chụp</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Địa Điểm Studio</label>
                  <input
                    type="text"
                    placeholder="Life4Cuts Q1"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* MULTI-IMAGE UPLOAD SECTION */}
              <div>
                <label className="block text-xs font-bold text-pink-300 mb-1 flex items-center space-x-1">
                  <Upload className="w-3.5 h-3.5 text-pink-400" />
                  <span>Tải Chọn Nhiều Ảnh Cùng Lúc (FB Layout)</span>
                </label>
                
                <label className="w-full bg-slate-950 hover:bg-slate-800 border-2 border-dashed border-pink-500/40 hover:border-pink-400 rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultipleFilesUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  {isUploading ? (
                    <div className="flex items-center space-x-2 py-1">
                      <Loader2 className="w-5 h-5 text-pink-400 animate-spin" />
                      <span className="text-xs font-bold text-amber-300 animate-pulse">
                        Đang đọc & nén ảnh local... Vui lòng đợi!
                      </span>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-pink-400 mb-1" />
                      <span className="text-xs font-bold text-pink-200">
                        📱 Bấm để chọn nhiều ảnh từ Album (Không giới hạn)
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Chọn cùng lúc nhiều dải ảnh / ảnh đơn</span>
                    </>
                  )}
                </label>

                {uploadedImages.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-pink-300 font-bold">Đã nạp thành công {uploadedImages.length} ảnh:</span>
                      {isUploading && <span className="text-[9px] text-amber-400 font-bold animate-pulse">⏳ Đang xử lý thêm...</span>}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative w-full h-16 rounded-lg overflow-hidden border border-slate-800 group">
                          <img src={img} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveUploadedImage(idx)}
                            className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5 text-[8px]"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-pink-300 mb-1 flex items-center space-x-1">
                  <Video className="w-3.5 h-3.5 text-pink-400" />
                  <span>Link Video QR Timelapse Photobooth</span>
                </label>
                <input
                  type="text"
                  placeholder="Dán link video từ mã QR máy Photobooth..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-pink-500/40 rounded-xl px-3 py-2 text-xs text-pink-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Chọn Màu Khung Photobooth</label>
                <div className="flex justify-between gap-2">
                  {[
                    { id: 'pink', label: 'Hồng', bg: 'bg-rose-500' },
                    { id: 'dark', label: 'Đen Vintage', bg: 'bg-slate-950 border border-slate-700' },
                    { id: 'cream', label: 'Kem Retro', bg: 'bg-amber-700' },
                    { id: 'purple', label: 'Tím Dream', bg: 'bg-purple-600' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFrameColor(c.id as any)}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold text-white flex items-center justify-center space-x-1 transition-all ${c.bg} ${
                        frameColor === c.id ? 'ring-2 ring-white scale-105' : 'opacity-70'
                      }`}
                    >
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ghi Chú Kỷ Niệm</label>
                <input
                  type="text"
                  placeholder="Cảm xúc hôm đi chụp..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isUploading || isSubmitting || !title.trim()}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold text-xs py-3 rounded-2xl shadow-lg shadow-pink-600/30 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Đang Xử Lý Nén Ảnh... Vui Lòng Đợi ⏳</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-pink-200" />
                    <span>Đang Lưu Album Photobooth... 🎞️</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Lưu Album Photobooth ✨</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
