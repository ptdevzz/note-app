'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ClipboardAutoDetectBannerProps {
  onAddPlace: (item: any) => Promise<void>;
}

export default function ClipboardAutoDetectBanner({ onAddPlace }: ClipboardAutoDetectBannerProps) {
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkClipboard = async () => {
      if (typeof window === 'undefined' || !navigator.clipboard) return;

      try {
        const text = await navigator.clipboard.readText();
        if (text && (text.includes('tiktok.com') || text.includes('maps') || text.includes('http'))) {
          // Check if link was already saved recently
          const lastSaved = localStorage.getItem('last_clipboard_saved');
          if (lastSaved !== text) {
            setDetectedUrl(text.trim());
          }
        }
      } catch (err) {
        // Clipboard permission denied or not supported silently ignored
      }
    };

    // Check when window gains focus
    window.addEventListener('focus', checkClipboard);
    checkClipboard();

    return () => window.removeEventListener('focus', checkClipboard);
  }, []);

  if (!detectedUrl || dismissed) return null;

  const handleAutoSave = async () => {
    setIsSaving(true);
    try {
      // Fetch oEmbed parser metadata
      const res = await fetch(`/api/tiktok-parse?url=${encodeURIComponent(detectedUrl)}`);
      const data = await res.json();

      if (data.success && data.data) {
        const item = data.data;
        await onAddPlace({
          coupleId: 'couple-123',
          tiktokUrl: detectedUrl,
          title: item.title,
          thumbnail: item.thumbnail,
          authorName: item.authorName || 'TikTok Clip',
          category: item.category || 'Ăn tối',
          tags: item.tags || ['Sài Gòn'],
          status: 'SAVED',
          createdBy: 'Tự Động Copy',
        });
      } else {
        await onAddPlace({
          coupleId: 'couple-123',
          tiktokUrl: detectedUrl,
          title: 'Địa Điểm Từ Clipboard',
          thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
          authorName: 'Clip',
          category: 'Ăn tối',
          tags: ['Sài Gòn'],
          status: 'SAVED',
          createdBy: 'Tự Động Copy',
        });
      }

      // Mark clipboard as saved
      localStorage.setItem('last_clipboard_saved', detectedUrl);
      setIsDone(true);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        setDismissed(true);
      }, 2500);
    } catch (err) {
      alert('Không thể lưu link từ clipboard.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 border border-rose-400/40 rounded-3xl p-3.5 shadow-2xl text-white animate-in slide-in-from-top duration-300 relative overflow-hidden">
      <div className="flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : isDone ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-200 block">
              {isDone ? '🎉 Đã Tự Động Lưu!' : '✨ Phát Hiện Link Vừa Copy'}
            </span>
            <p className="text-xs font-semibold truncate text-white">
              {isDone ? 'Đã thêm quán vào Bộ Sưu Tập' : detectedUrl}
            </p>
          </div>
        </div>

        {!isDone && (
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={handleAutoSave}
              disabled={isSaving}
              className="bg-white text-rose-600 hover:bg-rose-50 active:scale-95 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-md flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Lưu...' : 'Lưu Ngay ⚡'}</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/70 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
