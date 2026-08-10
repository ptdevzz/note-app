'use client';

import React, { useState } from 'react';
import { PlaceItem } from '@/lib/types';
import { Sparkles, X, Dices, ExternalLink, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: PlaceItem[];
}

const WHEEL_COLORS = [
  '#f43f5e', // Rose
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
];

export default function SpinWheelModal({ isOpen, onClose, places }: SpinWheelModalProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);

  if (!isOpen) return null;

  const validPlaces = places.filter((p) => p.status !== 'VISITED');
  const numSlices = Math.max(validPlaces.length, 1);
  const sliceAngle = 360 / numSlices;

  const handleSpin = () => {
    if (validPlaces.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setSelectedPlace(null);

    // Pick random index
    const randomIndex = Math.floor(Math.random() * validPlaces.length);
    
    // Calculate final angle to align winning slice with top pointer (0 deg)
    // 5 full rotations (1800 deg) + target offset
    const sliceCenterAngle = randomIndex * sliceAngle + sliceAngle / 2;
    const targetDegree = 360 * 6 + (360 - sliceCenterAngle);

    // Add to current rotation for cumulative spinning
    const newRotation = rotation + (targetDegree - (rotation % 360));
    setRotation(newRotation);

    // Wait for CSS 4-second spin transition to complete
    setTimeout(() => {
      setSelectedPlace(validPlaces[randomIndex]);
      setIsSpinning(false);

      // Fire victory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#f59e0b', '#8b5cf6']
      });
    }, 4100);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full bg-slate-800/80 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex items-center space-x-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 px-3 py-1 rounded-full text-xs font-bold mb-1">
            <Dices className="w-3.5 h-3.5" />
            <span>Vòng Quay May Mắn</span>
          </div>
          <h2 className="text-base font-bold text-white">Hôm Nay 2 Đứa Ăn Gì?</h2>
        </div>

        {validPlaces.length === 0 ? (
          <div className="my-8 text-center text-xs text-slate-400 py-6 px-4 bg-slate-950 rounded-2xl border border-slate-800">
            Chưa có địa điểm nào trong danh sách.
            <br />
            Hãy thêm clip TikTok quán ăn trước nha!
          </div>
        ) : (
          <div className="relative my-3 flex justify-center items-center">
            {/* Top Pointer Arrow */}
            <div className="absolute -top-3 z-30 drop-shadow-md">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-rose-500 animate-bounce-short"></div>
            </div>

            {/* Circular Spinning SVG Wheel */}
            <div className="w-64 h-64 relative rounded-full shadow-2xl border-4 border-slate-800 overflow-hidden bg-slate-950">
              <div
                className="w-full h-full relative transition-all duration-[4000ms] ease-[cubic-bezier(0.15,0.99,0.24,1)]"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {validPlaces.map((place, idx) => {
                    const startAngle = idx * sliceAngle;
                    const endAngle = (idx + 1) * sliceAngle;
                    const color = WHEEL_COLORS[idx % WHEEL_COLORS.length];

                    // Convert polar to cartesian coordinates for SVG path
                    const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                    const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                    const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                    const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

                    const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                    const midAngle = startAngle + sliceAngle / 2;

                    return (
                      <g key={place.id}>
                        <path d={pathData} fill={color} stroke="#0f172a" strokeWidth="0.8" />
                        {/* Slice Text */}
                        <g transform={`rotate(${midAngle}, 50, 50)`}>
                          <text
                            x="76"
                            y="51.5"
                            fill="#ffffff"
                            fontSize="3.8"
                            fontWeight="bold"
                            textAnchor="middle"
                            className="select-none pointer-events-none drop-shadow"
                          >
                            {place.title.length > 12 ? place.title.substring(0, 10) + '..' : place.title}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Center Pin Button */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-slate-900 border-2 border-rose-500 rounded-full flex items-center justify-center shadow-lg z-20">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Selected Result Box */}
        {selectedPlace && !isSpinning && (
          <div className="w-full mt-3 bg-gradient-to-r from-rose-950/60 to-purple-950/60 border border-rose-500/40 rounded-2xl p-3.5 text-center animate-in zoom-in-95 duration-200">
            <span className="inline-block bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 mb-2">
              🎉 VŨ TRỤ ĐÃ CHỌN MÓN NÀY!
            </span>
            <div className="flex space-x-3 items-center text-left">
              <img
                src={selectedPlace.thumbnail}
                alt={selectedPlace.title}
                className="w-14 h-14 object-cover rounded-xl border border-slate-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white line-clamp-2">{selectedPlace.title}</h4>
                <a
                  href={selectedPlace.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-[11px] text-rose-400 font-semibold hover:underline mt-1"
                >
                  <span>Xem Clip TikTok</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || validPlaces.length === 0}
          className="w-full mt-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-xs"
        >
          {isSpinning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang Xoay Vòng Quay... 🎲</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{selectedPlace ? 'Xoay Lại Lần Nữa 🎲' : 'Bấm Xoay Vòng Tròn 🎲'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Heart(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
