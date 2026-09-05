'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface NudgeToastProps {
  message: string | null;
  onDismiss: () => void;
}

export default function NudgeToast({ message, onDismiss }: NudgeToastProps) {
  if (!message) return null;

  return (
    <div className="fixed top-5 inset-x-4 z-50 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white p-3.5 rounded-2xl shadow-2xl border border-white/20 animate-in slide-in-from-top-5 duration-300 flex items-center space-x-3">
      <Sparkles className="w-5 h-5 text-amber-300 animate-spin shrink-0" />
      <p className="text-xs font-bold flex-1 leading-snug">{message}</p>
      <button
        onClick={onDismiss}
        className="text-white/80 hover:text-white text-xs font-extrabold px-1.5 py-0.5 rounded-lg bg-black/20"
      >
        ✕
      </button>
    </div>
  );
}
