'use client';

import React, { useRef } from 'react';
import { PlaceItem } from '@/lib/types';
import { Sparkles, X, Download, Calendar, Heart, Share2, MapPin } from 'lucide-react';

interface StoryExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  saturdayPlaces: PlaceItem[];
  sundayPlaces: PlaceItem[];
  saturdayDisplay: string;
  sundayDisplay: string;
  weekLabel: string;
  loveDays: number;
}

export default function StoryExportModal({
  isOpen,
  onClose,
  saturdayPlaces,
  sundayPlaces,
  saturdayDisplay,
  sundayDisplay,
  weekLabel,
  loveDays,
}: StoryExportModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // HTML5 Canvas image rendering
  const handleDownloadStoryImage = () => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    // Create Canvas element
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e112a');
    bgGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Ambient Circles
    ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
    ctx.beginPath();
    ctx.arc(width / 2, 400, 400, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.beginPath();
    ctx.arc(width / 2, 1400, 450, 0, Math.PI * 2);
    ctx.fill();

    // Top Header Badge
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💕 UsWeekends • Story Card', width / 2, 140);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'extrabold 56px sans-serif';
    ctx.fillText('Lịch Hẹn Cuối Tuần Này 🥂', width / 2, 220);

    ctx.fillStyle = '#fda4af';
    ctx.font = '600 32px sans-serif';
    ctx.fillText(weekLabel, width / 2, 280);

    // Saturday Box
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';

    // Round Rect Helper
    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    // Draw Saturday Card
    drawRoundRect(100, 360, 880, 580, 40);
    ctx.fillStyle = '#fb7185';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`📅 ${saturdayDisplay}`, 150, 435);

    let currentY = 510;
    if (saturdayPlaces.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '32px sans-serif';
      ctx.fillText('Chưa có lịch hẹn cho Thứ 7', 150, currentY);
    } else {
      saturdayPlaces.slice(0, 3).forEach((place) => {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(`• ${place.title}`, 150, currentY);

        ctx.fillStyle = '#fda4af';
        ctx.font = '28px sans-serif';
        ctx.fillText(`   ${place.category} | ${place.tags.join(', ')}`, 150, currentY + 45);

        currentY += 105;
      });
    }

    // Draw Sunday Card
    drawRoundRect(100, 990, 880, 580, 40);
    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`📅 ${sundayDisplay}`, 150, 1065);

    currentY = 1140;
    if (sundayPlaces.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '32px sans-serif';
      ctx.fillText('Chưa có lịch hẹn cho Chủ Nhật', 150, currentY);
    } else {
      sundayPlaces.slice(0, 3).forEach((place) => {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(`• ${place.title}`, 150, currentY);

        ctx.fillStyle = '#e9d5ff';
        ctx.font = '28px sans-serif';
        ctx.fillText(`   ${place.category} | ${place.tags.join(', ')}`, 150, currentY + 45);

        currentY += 105;
      });
    }

    // Footer Box
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 38px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`💖 Đã bên nhau ${loveDays} ngày • Bé Yêu & Anh Iu`, width / 2, 1720);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 28px sans-serif';
    ctx.fillText('Thiết kế bởi UsWeekends App', width / 2, 1785);

    // Convert Canvas to PNG and Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `UsWeekends-LichHen-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full bg-slate-800/80 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-3">
          <div className="inline-flex items-center space-x-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 px-3 py-1 rounded-full text-xs font-bold mb-1">
            <Share2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Thẻ Story Instagram & TikTok 📸</span>
          </div>
          <h3 className="text-sm font-extrabold text-white">Xuất Ảnh Tổng Kết Cuối Tuần</h3>
        </div>

        {/* 9:16 Preview Card */}
        <div
          ref={cardRef}
          className="w-full bg-gradient-to-b from-slate-900 via-purple-950/50 to-slate-950 border border-rose-500/40 rounded-2xl p-4 shadow-2xl space-y-3.5 text-left relative overflow-hidden"
        >
          {/* Header with Couple Photo */}
          <div className="text-center border-b border-slate-800/80 pb-2.5 flex flex-col items-center">
            <img
              src="/couple.png"
              alt="Couple Photo"
              className="w-12 h-12 object-cover rounded-full border-2 border-rose-500 shadow-md mb-1.5"
            />
            <span className="text-[10px] font-extrabold tracking-widest text-rose-400 uppercase">UsWeekends 💕</span>
            <h4 className="text-xs font-bold text-white mt-0.5">Lịch Hẹn Cuối Tuần Này 🥂</h4>
            <p className="text-[10px] text-slate-400">{weekLabel}</p>
          </div>

          {/* Saturday */}
          <div className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-rose-400 font-bold text-xs mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{saturdayDisplay}</span>
            </div>
            {saturdayPlaces.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">Chưa lên lịch địa điểm nào</p>
            ) : (
              <div className="space-y-2">
                {saturdayPlaces.map((p) => (
                  <div key={p.id} className="flex items-center space-x-2">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-8 h-8 object-cover rounded-lg border border-slate-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-white truncate">{p.title}</p>
                      <p className="text-[9px] text-slate-400">{p.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sunday */}
          <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-purple-400 font-bold text-xs mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{sundayDisplay}</span>
            </div>
            {sundayPlaces.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">Chưa lên lịch địa điểm nào</p>
            ) : (
              <div className="space-y-2">
                {sundayPlaces.map((p) => (
                  <div key={p.id} className="flex items-center space-x-2">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-8 h-8 object-cover rounded-lg border border-slate-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-white truncate">{p.title}</p>
                      <p className="text-[9px] text-slate-400">{p.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            <div className="inline-flex items-center space-x-1 text-[10px] font-bold text-rose-300">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              <span>Đã bên nhau {loveDays} ngày • Bé Yêu & Anh Iu</span>
            </div>
          </div>
        </div>

        {/* Action Download Button */}
        <button
          onClick={handleDownloadStoryImage}
          className="w-full mt-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 text-white font-extrabold py-3 px-4 rounded-2xl shadow-lg shadow-rose-500/25 active:scale-95 flex items-center justify-center space-x-2 text-xs transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Tải Ảnh Story HD (1080x1920) ✨</span>
        </button>
      </div>
    </div>
  );
}
