'use client';

import React, { useState } from 'react';
import { HeartHandshake, Edit3, Check, Sparkles } from 'lucide-react';

interface LoveNoteSectionProps {
  note: string;
  onSaveNote: (newNote: string) => Promise<void>;
  partnerName?: string;
}

export default function LoveNoteSection({ note, onSaveNote, partnerName = 'Bé Yêu' }: LoveNoteSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState(note);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSaveNote(currentNote);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-200">Lời Nhắn {partnerName}</h3>
        </div>

        <button
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          disabled={loading}
          className="text-slate-400 hover:text-rose-400 text-xs font-semibold p-1.5 rounded-lg bg-slate-800/80 flex items-center space-x-1"
        >
          {isEditing ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Lưu</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Sửa</span>
            </>
          )}
        </button>
      </div>

      {isEditing ? (
        <div className="mt-2">
          <textarea
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-100 placeholder-slate-500 focus:outline-none"
            placeholder="Nhập lời nhắn ngọt ngào hoặc dí dỏm cho bạn gái..."
          />
        </div>
      ) : (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 text-xs text-rose-100 italic leading-relaxed relative overflow-hidden">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 absolute top-2 right-2 opacity-60" />
          "{note || 'Chào em yêu! Chúc em một ngày làm việc tràn đầy niềm vui 💕'}"
        </div>
      )}
    </div>
  );
}
