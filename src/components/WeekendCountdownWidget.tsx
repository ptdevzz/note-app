'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, Heart, PartyPopper, Mail } from 'lucide-react';
import { getWeekendForWeekOffset } from '@/lib/dateUtils';
import { PlaceItem } from '@/lib/types';
import confetti from 'canvas-confetti';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isWeekendNow: boolean;
}

interface WeekendCountdownWidgetProps {
  places?: PlaceItem[];
  partnerEmail?: string;
}

export default function WeekendCountdownWidget({ places = [], partnerEmail }: WeekendCountdownWidgetProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isWeekendNow: false,
  });
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const currentWeekend = getWeekendForWeekOffset(0); // Current upcoming weekend

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sun, 6 = Sat

      // Check if today is already weekend (Saturday or Sunday)
      if (currentDay === 6 || currentDay === 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isWeekendNow: true };
      }

      // Target: Upcoming Saturday at 08:00 AM
      const targetSat = new Date(`${currentWeekend.saturday}T08:00:00`);
      const diff = targetSat.getTime() - now.getTime();

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isWeekendNow: true };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { days, hours, minutes, seconds, isWeekendNow: false };
    };

    const initial = calculateTimeLeft();
    setTimeLeft(initial);

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [currentWeekend.saturday]);

  // Send Itinerary Email when clicking "Đi chơi 🥳"
  const handleCelebrateClick = async () => {
    confetti({
      particleCount: 180,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#f59e0b', '#10b981']
    });

    // Find planned places for Sat & Sun
    const satPlaces = places.filter(p => p.status === 'PLANNED' && p.plannedDate === currentWeekend.saturday);
    const sunPlaces = places.filter(p => p.status === 'PLANNED' && p.plannedDate === currentWeekend.sunday);

    let itinerarySummary = '';
    if (satPlaces.length > 0) {
      itinerarySummary += ` Thượng 7 (${currentWeekend.saturdayDisplay}): ` + satPlaces.map(p => p.title).join(', ') + '.';
    }
    if (sunPlaces.length > 0) {
      itinerarySummary += ` Chủ Nhật (${currentWeekend.sundayDisplay}): ` + sunPlaces.map(p => p.title).join(', ') + '.';
    }
    if (!itinerarySummary) {
      itinerarySummary = ' Lịch trình đang mở, bạn trai sẵn sàng dắt bạn gái đi ăn bất kỳ đâu!';
    }

    setEmailSending(true);
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: partnerEmail,
          subject: `🥳 ĐÃ ĐẾN CUỐI TUẦN RỒI! Lịch đi chơi nè: ${itinerarySummary}`,
          senderName: 'Anh iu',
          partnerName: 'Bé Yêu',
        })
      });
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    } catch (err) {
      console.log('Chế độ giả lập email.');
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-pink-950/80 border border-purple-500/30 rounded-3xl p-4 shadow-xl relative overflow-hidden">
      {/* Background Subtle Sparkle Glow */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {timeLeft.isWeekendNow ? (
        <div className="space-y-3">
          <div 
            onClick={handleCelebrateClick}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/40 animate-bounce">
                <PartyPopper className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1 text-xs font-bold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ĐÃ ĐẾN CUỐI TUẦN RỒI! 🎉</span>
                </div>
                <p className="text-[11px] text-slate-200 mt-0.5 font-medium">
                  Lên đồ đi chơi cùng Anh iu thôi nha! 💕
                </p>
              </div>
            </div>

            <button
              disabled={emailSending}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-2xl shadow-md shrink-0 active:scale-95 transition-all"
            >
              {emailSending ? 'Đang gửi mail...' : 'Đi chơi 🥳'}
            </button>
          </div>

          {emailSent && (
            <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-2 rounded-xl flex items-center space-x-2 animate-in fade-in">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Đã gửi Email lịch trình đi chơi T7/CN đến bạn gái rồi nha! 📧</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-purple-500/20 text-purple-300 rounded-xl flex items-center justify-center border border-purple-500/30">
                <Clock className="w-4 h-4 animate-spin-slow" />
              </div>
              <h3 className="text-xs font-bold text-white flex items-center space-x-1">
                <span>Đếm Nguợc Đến Hẹn Hò Cuối Tuần</span>
                <Heart className="w-3 h-3 text-rose-400 fill-rose-400 inline" />
              </h3>
            </div>
            <span className="text-[10px] text-purple-300/80 font-mono">
              T7: {currentWeekend.saturdayDisplay.replace('Thứ 7, ', '')}
            </span>
          </div>

          {/* Countdown Digital Display */}
          <div className="grid grid-cols-4 gap-2 text-center pt-1">
            <div className="bg-slate-950/80 border border-purple-500/20 rounded-2xl p-2">
              <span className="text-lg font-extrabold text-purple-300 font-mono leading-none block">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-slate-400 uppercase font-semibold mt-1 block">Ngày</span>
            </div>

            <div className="bg-slate-950/80 border border-purple-500/20 rounded-2xl p-2">
              <span className="text-lg font-extrabold text-pink-300 font-mono leading-none block">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-slate-400 uppercase font-semibold mt-1 block">Giờ</span>
            </div>

            <div className="bg-slate-950/80 border border-purple-500/20 rounded-2xl p-2">
              <span className="text-lg font-extrabold text-rose-300 font-mono leading-none block">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-slate-400 uppercase font-semibold mt-1 block">Phút</span>
            </div>

            <div className="bg-slate-950/80 border border-purple-500/20 rounded-2xl p-2">
              <span className="text-lg font-extrabold text-amber-300 font-mono leading-none block animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-slate-400 uppercase font-semibold mt-1 block">Giây</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
