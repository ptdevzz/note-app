'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlaceItem } from '@/lib/types';
import { Sparkles, X, Dices, ExternalLink, RefreshCw, Navigation, MapPin, Flame, Award, Calendar } from 'lucide-react';
import { getWeekendForWeekOffset } from '@/lib/dateUtils';
import confetti from 'canvas-confetti';

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: PlaceItem[];
  onAssignDate?: (placeId: string, dateStr: string | null) => void;
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

export default function SpinWheelModal({ isOpen, onClose, places, onAssignDate }: SpinWheelModalProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);
  const [pointerWiggle, setPointerWiggle] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const currentWeekend = getWeekendForWeekOffset(0);

  if (!isOpen) return null;

  const validPlaces = places.filter((p) => p.status !== 'PLANNED' && p.status !== 'VISITED');
  const numSlices = Math.max(validPlaces.length, 1);
  const sliceAngle = 360 / numSlices;

  // Web Audio Synth Click Tick Sound
  const playTickSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignore browser autoplay policy restrictions
    }
  };

  const handleSpin = () => {
    if (validPlaces.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setSelectedPlace(null);
    setPointerWiggle(true);

    // Pick random index
    const randomIndex = Math.floor(Math.random() * validPlaces.length);
    
    // Calculate target degree (6 full turns = 2160 deg + slice offset)
    const sliceCenterAngle = randomIndex * sliceAngle + sliceAngle / 2;
    const targetDegree = 360 * 7 + (360 - sliceCenterAngle);

    const newRotation = rotation + (targetDegree - (rotation % 360));
    setRotation(newRotation);

    // Dynamic Sound Ticks intervals
    let tickCount = 0;
    const totalDuration = 4100;
    const startSpeed = 50;

    const scheduleTicks = (delay: number) => {
      if (tickCount > 35) return;
      playTickSound();
      tickCount++;
      const progress = tickCount / 35;
      const nextDelay = startSpeed + Math.pow(progress, 2.5) * 350;
      setTimeout(() => scheduleTicks(nextDelay), nextDelay);
    };
    scheduleTicks(startSpeed);

    // Finish spinning after 4.1s
    setTimeout(() => {
      setSelectedPlace(validPlaces[randomIndex]);
      setIsSpinning(false);
      setPointerWiggle(false);

      // Fire victory confetti burst
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#f59e0b', '#8b5cf6', '#10b981']
      });
    }, totalDuration);
  };

  // Google Maps Helper
  const openGoogleMaps = (title: string, tags: string[]) => {
    const queryStr = `${title} ${tags.join(' ')}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryStr)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center overflow-hidden">
        
        {/* Glow ambient background behind wheel */}
        <div className="absolute top-1/4 inset-x-0 h-48 bg-rose-500/10 blur-3xl rounded-full pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full bg-slate-800/80 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-2 z-10">
          <div className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-rose-500/20 to-purple-500/20 border border-rose-500/40 text-rose-300 px-3 py-1 rounded-full text-xs font-bold mb-1 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Vòng Quay May Mắn Casino 💕</span>
          </div>
          <h2 className="text-base font-extrabold text-white">Hôm Nay 2 Đứa Ăn Gì?</h2>
        </div>

        {validPlaces.length === 0 ? (
          <div className="my-8 text-center text-xs text-slate-400 py-6 px-4 bg-slate-950 rounded-2xl border border-slate-800">
            Chưa có địa điểm nào trong danh sách.
            <br />
            Hãy thêm clip TikTok quán ăn trước nha!
          </div>
        ) : (
          <div className="relative my-3 flex justify-center items-center">
            
            {/* Top Pointer Arrow with wiggle animation */}
            <div className={`absolute -top-3.5 z-30 drop-shadow-[0_4px_10px_rgba(244,63,94,0.8)] transition-transform ${pointerWiggle ? 'animate-bounce' : ''}`}>
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-rose-500"></div>
            </div>

            {/* Glowing Outer Rim with LED Bulbs */}
            <div className="relative p-2.5 rounded-full bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 shadow-[0_0_35px_rgba(244,63,94,0.4)]">
              
              {/* Outer LED Bulbs */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const x = 50 + 47 * Math.cos(angle);
                const y = 50 + 47 * Math.sin(angle);
                return (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full border border-amber-200 transition-colors ${
                      isSpinning ? (i % 2 === Math.floor(Date.now() / 200) % 2 ? 'bg-amber-300 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-800') : 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                    }`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                );
              })}

              {/* Circular Spinning SVG Wheel */}
              <div className="w-64 h-64 relative rounded-full shadow-inner border-4 border-slate-950 overflow-hidden bg-slate-950">
                <div
                  className="w-full h-full relative transition-all duration-[4100ms] ease-[cubic-bezier(0.12,0.98,0.22,1)]"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {validPlaces.map((place, idx) => {
                      const startAngle = idx * sliceAngle;
                      const endAngle = (idx + 1) * sliceAngle;
                      const color = WHEEL_COLORS[idx % WHEEL_COLORS.length];

                      const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                      const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                      const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                      const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                      const largeArcFlag = sliceAngle > 180 ? 1 : 0;

                      const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                      const midAngle = startAngle + sliceAngle / 2;

                      return (
                        <g key={place.id}>
                          <defs>
                            <clipPath id={`wheel-clip-${idx}`}>
                              <circle cx="70" cy="50" r="3.8" />
                            </clipPath>
                          </defs>

                          <path d={pathData} fill={color} stroke="#0f172a" strokeWidth="0.8" />
                          
                          {/* Slice Content: Thumbnail & Title */}
                          <g transform={`rotate(${midAngle}, 50, 50)`}>
                            {place.thumbnail && (
                              <image
                                href={place.thumbnail}
                                x="66"
                                y="46"
                                width="8"
                                height="8"
                                clipPath={`url(#wheel-clip-${idx})`}
                                preserveAspectRatio="xMidYMid slice"
                              />
                            )}
                            <text
                              x="81"
                              y="51.2"
                              fill="#ffffff"
                              fontSize="3"
                              fontWeight="bold"
                              textAnchor="middle"
                              className="select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                            >
                              {place.title.length > 9 ? place.title.substring(0, 7) + '..' : place.title}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Center Pin Button with Winner Thumbnail */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-13 h-13 bg-slate-900 border-2 border-amber-400 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] z-20 overflow-hidden ring-4 ring-rose-500/30">
                  {selectedPlace?.thumbnail ? (
                    <img
                      src={selectedPlace.thumbnail}
                      alt={selectedPlace.title}
                      className="w-full h-full object-cover animate-in zoom-in-75 duration-300"
                    />
                  ) : (
                    <Award className="w-6 h-6 text-amber-400 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Winner Card Showcase */}
        {selectedPlace && !isSpinning && (
          <div className="w-full mt-2 bg-gradient-to-r from-rose-950/80 via-slate-900 to-purple-950/80 border border-rose-500/50 rounded-2xl p-3.5 text-center animate-in zoom-in-95 duration-300 shadow-xl relative overflow-hidden">
            <div className="inline-flex items-center space-x-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-3 py-0.5 rounded-full border border-emerald-500/40 mb-2 shadow-sm">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>VŨ TRỤ ĐÃ CHỌN QUÁN NÀY! 🎉</span>
            </div>
            
            <div className="flex space-x-3 items-center text-left">
              <img
                src={selectedPlace.thumbnail}
                alt={selectedPlace.title}
                className="w-16 h-16 object-cover rounded-2xl border-2 border-rose-500/50 shrink-0 shadow-md"
              />
              <div className="min-w-0 flex-1">
                <span className="inline-block bg-rose-500/20 text-rose-300 text-[9px] font-bold px-2 py-0.5 rounded-full mb-0.5">
                  {selectedPlace.category}
                </span>
                <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">{selectedPlace.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Bởi {selectedPlace.createdBy}</p>
              </div>
            </div>

            {/* Quick Actions for Winner */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
              {selectedPlace.tiktokUrl && (
                <a
                  href={selectedPlace.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-rose-300 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center space-x-1 text-[11px] border border-slate-700/60"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Xem TikTok</span>
                </a>
              )}
              
              <button
                onClick={() => openGoogleMaps(selectedPlace.title, selectedPlace.tags)}
                className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center space-x-1 text-[11px]"
              >
                <Navigation className="w-3 h-3 text-emerald-400" />
                <span>Chỉ Đường</span>
              </button>
            </div>

            {/* Quick Assign Buttons for Weekend */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-semibold mb-1.5 text-center">✨ Thêm nhanh vào lịch tuần này:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (onAssignDate && selectedPlace) {
                      onAssignDate(selectedPlace.id, currentWeekend.saturday);
                      confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
                      onClose();
                    }
                  }}
                  className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 py-2 px-2 rounded-xl font-bold text-[11px] flex items-center justify-center space-x-1 active:scale-95 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  <span>+ {currentWeekend.saturdayDisplay}</span>
                </button>

                <button
                  onClick={() => {
                    if (onAssignDate && selectedPlace) {
                      onAssignDate(selectedPlace.id, currentWeekend.sunday);
                      confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
                      onClose();
                    }
                  }}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 py-2 px-2 rounded-xl font-bold text-[11px] flex items-center justify-center space-x-1 active:scale-95 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>+ {currentWeekend.sundayDisplay}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || validPlaces.length === 0}
          className="w-full mt-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-xl shadow-rose-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-xs transition-all"
        >
          {isSpinning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
              <span className="text-amber-100">Đang Xoay Vòng Quay May Mắn... 🎲</span>
            </>
          ) : (
            <>
              <Dices className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>{selectedPlace ? 'Xoay Lại Món Khác 🎲' : 'Bấm Xoay Chọn Quán 🎲'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
