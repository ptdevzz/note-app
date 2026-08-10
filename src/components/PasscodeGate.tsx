'use client';

import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PasscodeGateProps {
  children: (role: 'GF' | 'BF') => React.ReactNode;
}

export default function PasscodeGate({ children }: PasscodeGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeRole, setActiveRole] = useState<'GF' | 'BF'>('GF');
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  // Dual Passcodes
  const [gfPasscode, setGfPasscode] = useState('1804'); // Birthday of Girlfriend
  const [bfPasscode, setBfPasscode] = useState('1008'); // Birthday of Boyfriend

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedGfPass = localStorage.getItem('admin_passcode_gf') || localStorage.getItem('admin_passcode') || '1804';
      const savedBfPass = localStorage.getItem('admin_passcode_bf') || '1008';
      setGfPasscode(savedGfPass);
      setBfPasscode(savedBfPass);

      // Lưu trạng thái đã mở khóa vào localStorage để F5 refresh không bao giờ bị bắt nhập lại!
      const savedUnlockedRole = localStorage.getItem('us_weekends_unlocked_role') as 'GF' | 'BF' | null;
      if (savedUnlockedRole) {
        setActiveRole(savedUnlockedRole);
        setIsUnlocked(true);
      }
    }
  }, []);

  const handleKeyClick = (val: string) => {
    if (pinInput.length < 6) {
      const next = pinInput + val;
      setPinInput(next);
      setError(false);
      
      // Auto verify when pin matches either passcode
      if (next === gfPasscode) {
        unlockApp('GF');
      } else if (next === bfPasscode) {
        unlockApp('BF');
      }
    }
  };

  const handleDeleteKey = () => {
    setPinInput(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === gfPasscode) {
      unlockApp('GF');
    } else if (pinInput === bfPasscode) {
      unlockApp('BF');
    } else {
      setError(true);
      setPinInput('');
    }
  };

  const unlockApp = (role: 'GF' | 'BF') => {
    setActiveRole(role);
    setIsUnlocked(true);
    if (typeof window !== 'undefined') {
      // Ghi nhớ vĩnh viễn trạng thái đã mở khóa vào LocalStorage
      localStorage.setItem('us_weekends_unlocked_role', role);
    }

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#f59e0b']
    });
  };

  if (isUnlocked) {
    return <>{children(activeRole)}</>;
  }

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 z-50 flex items-center justify-center p-4 selection:bg-rose-500">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Couple Photo Glow Header */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-purple-500 rounded-full blur-md opacity-70 animate-pulse" />
          <img
            src="/couple.png"
            alt="Couple Photo"
            className="relative w-20 h-20 object-cover rounded-full border-2 border-rose-500 shadow-xl shadow-rose-500/40"
          />
        </div>

        <div>
          <h1 className="text-lg font-bold text-white flex items-center justify-center space-x-1.5">
            <span>UsWeekends 💕</span>
          </h1>
          <p className="text-xs text-rose-300 mt-1 font-medium">
            Nhập ngày sinh của bạn để mở khóa
          </p>
        </div>

        {/* PIN Dots */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex justify-center space-x-3 my-2">
            {[...Array(Math.max(gfPasscode.length, bfPasscode.length))].map((_, idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border transition-all ${
                  idx < pinInput.length
                    ? 'bg-rose-500 border-rose-400 scale-110 shadow-md shadow-rose-500/50'
                    : 'bg-slate-950 border-slate-800'
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-semibold animate-shake">
              ❌ Sai mật khẩu ngày sinh rồi! Thử lại nha.
            </p>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyClick(num)}
                className="w-16 h-14 bg-slate-950 hover:bg-slate-800 border border-slate-800/80 rounded-2xl text-base font-bold text-slate-100 active:scale-90 transition-all flex items-center justify-center mx-auto shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleDeleteKey}
              className="w-16 h-14 bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 rounded-2xl text-xs font-semibold text-slate-400 active:scale-90 transition-all flex items-center justify-center mx-auto"
            >
              Xóa
            </button>
            <button
              type="button"
              onClick={() => handleKeyClick('0')}
              className="w-16 h-14 bg-slate-950 hover:bg-slate-800 border border-slate-800/80 rounded-2xl text-base font-bold text-slate-100 active:scale-90 transition-all flex items-center justify-center mx-auto shadow-sm"
            >
              0
            </button>
            <button
              type="submit"
              className="w-16 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold active:scale-90 transition-all flex items-center justify-center mx-auto shadow-md shadow-rose-500/25"
            >
              Mở 🔓
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
