'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Mail, UserCheck } from 'lucide-react';

interface PokeLoveEffectProps {
  currentRole: 'GF' | 'BF';
  partnerName?: string;
  partnerEmail?: string;
}

export default function PokeLoveEffect({
  currentRole,
  partnerName = 'Đối Phương',
  partnerEmail,
}: PokeLoveEffectProps) {
  const [pokeCount, setPokeCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handlePoke = async () => {
    setPokeCount((prev) => prev + 1);
    
    // Trigger floating heart confetti explosion
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#f43f5e', '#fb7185', '#fda4af']
    });
    fire(0.2, {
      spread: 60,
      colors: ['#f43f5e', '#ffffff', '#ffe4e6']
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    const messages = [
      `Vừa bóp má ${partnerName} một cái nhẹ nha 🤏`,
      `Cuối tuần này dắt đi ăn lẩu nha 🍲`,
      `Gửi một cái ôm ấm áp cho ${partnerName} 🫂`,
      `Nhớ giữ gìn sức khỏe và luôn vui vẻ nha ✨`,
    ];

    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMsg);

    // Call API to send email notification to partner
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: partnerEmail,
          subject: `💕 ${randomMsg}`,
          senderName: 'UsWeekends',
          partnerName: partnerName,
        })
      });
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
    } catch (err) {
      console.log('Chế độ giả lập email.');
    }

    setTimeout(() => setMessage(null), 3500);
  };

  return (
    <div className="bg-gradient-to-r from-rose-950/60 to-pink-950/60 border border-rose-800/40 rounded-3xl p-4 relative overflow-hidden shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-heartbeat" />
            <h3 className="text-sm font-bold text-rose-200">
              Gửi Tương Tác Yêu Thương
            </h3>
          </div>
          <p className="text-xs text-rose-300/80 mt-1">
            Bấm nút để tương tác và nhắn nhủ cùng {partnerName}
          </p>
        </div>

        <div className="flex flex-col items-end space-y-1">
          <button
            onClick={handlePoke}
            className="active:scale-90 transition-transform bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3.5 py-2 rounded-2xl text-xs font-bold shadow-md shadow-rose-500/30 flex items-center space-x-1 hover:from-rose-600 hover:to-pink-600"
          >
            <span>Bóp má {partnerName} 🤏</span>
            {pokeCount > 0 && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
                +{pokeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {message && (
        <div className="mt-3 bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs px-3 py-2 rounded-xl flex justify-between items-center animate-bounce-short">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{message}</span>
          </div>
          {emailSent && (
            <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
              <Mail className="w-3 h-3" />
              <span>Đã gửi Email 📧</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
