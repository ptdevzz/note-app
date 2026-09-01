'use client';

import React, { useState } from 'react';
import { PlaceItem } from '@/lib/types';
import { formatVndCurrency } from '@/lib/dateUtils';
import { convertFileToBase64 } from '@/lib/imageUtils';
import { X, Star, Camera, Check, Upload, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: PlaceItem | null;
  onSaveReview: (id: string, rating: number, notes: string, costEstimate?: number, photoUrl?: string) => Promise<void>;
}

export default function CheckinModal({ isOpen, onClose, place, onSaveReview }: CheckinModalProps) {
  const [rating, setRating] = useState<number>(place?.rating || 5);
  const [notes, setNotes] = useState<string>(place?.notes || '');
  const [cost, setCost] = useState<string>(place?.costEstimate ? String(place.costEstimate) : '300000');
  const [photoUrl, setPhotoUrl] = useState<string>(place?.photoUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !place) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64 = await convertFileToBase64(file, 800, 0.85);
      setPhotoUrl(base64);
    } catch (err) {
      alert('Không thể đọc file ảnh, vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveReview(place.id, rating, notes, Number(cost) || 0, photoUrl);

    // Fire confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl relative animate-in fade-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Hoàn Thành Chuyến Đi! 🎉</h2>
            <p className="text-[11px] text-slate-400 line-clamp-1">{place.title}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Chấm điểm chuyến hẹn hò này ⭐
            </label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform active:scale-125"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Upload Photo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tải Ảnh Kỷ Niệm Từ Điện Thoại</span>
            </label>

            <label className="w-full bg-slate-950 hover:bg-slate-800 border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <ImageIcon className="w-6 h-6 text-emerald-400 mb-1" />
              <span className="text-xs font-bold text-emerald-200">
                {isUploading ? 'Đang xử lý nén ảnh...' : '📱 Bấm để chọn ảnh chuyến đi'}
              </span>
            </label>

            {photoUrl && (
              <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-emerald-500/40">
                <img src={photoUrl} alt="Review Photo" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  ✓ Đã đính kèm ảnh
                </span>
              </div>
            )}
          </div>

          {/* Review Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ghi chú kỉ niệm & bí kíp (món ngon, giờ đi...)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Quán lẩu ngon ngất ngây, nên đi trước 7h tối kẻo hết bàn!"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/60"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Tổng chi phí 2 đứa (VNĐ)
              </label>
              {Number(cost) > 0 && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {formatVndCurrency(Number(cost))}
                </span>
              )}
            </div>
            <input
              type="number"
              step="50000"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="300000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/60"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center space-x-2 text-xs disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Lưu Nhật Ký Hẹn Hò</span>
          </button>
        </form>
      </div>
    </div>
  );
}
