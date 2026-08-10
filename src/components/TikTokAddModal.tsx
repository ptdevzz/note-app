'use client';

import React, { useState } from 'react';
import { PlaceCategory } from '@/lib/types';
import { X, Link as LinkIcon, Loader2, Sparkles, PenTool, Film, Coffee, Utensils, Dices, Image as ImageIcon } from 'lucide-react';

interface TikTokAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    tiktokUrl: string;
    title: string;
    thumbnail: string;
    authorName: string;
    category: PlaceCategory;
    tags: string[];
    createdBy: string;
  }) => Promise<void>;
}

const PRESET_IMAGES = [
  { name: 'Rạp chiếu phim', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80', cat: 'Vui chơi' as PlaceCategory },
  { name: 'Vui chơi Bowling', url: 'https://images.unsplash.com/photo-1538388149542-5e24932d7b98?auto=format&fit=crop&w=600&q=80', cat: 'Vui chơi' as PlaceCategory },
  { name: 'Quán Cafe', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80', cat: 'Cà phê & Chill' as PlaceCategory },
  { name: 'Lẩu nướng', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', cat: 'Ăn tối' as PlaceCategory },
  { name: 'Ăn sáng / Phở', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80', cat: 'Ăn sáng' as PlaceCategory },
  { name: 'Triển lãm / Nghệ thuật', url: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=600&q=80', cat: 'Vui chơi' as PlaceCategory },
];

export default function TikTokAddModal({ isOpen, onClose, onAdd }: TikTokAddModalProps) {
  const [activeTab, setActiveTab] = useState<'link' | 'manual'>('link');
  
  // Link tab state
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    title: string;
    thumbnail: string;
    authorName: string;
    guessedCategory: PlaceCategory;
    tags: string[];
  } | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Manual tab state
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState<PlaceCategory>('Vui chơi');
  const [manualTag, setManualTag] = useState('Quận 1');
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0].url);

  if (!isOpen) return null;

  const extractCleanUrl = (text: string) => {
    const match = text.match(/(https?:\/\/[^\s]+)/gi);
    return match ? match[0] : text.trim();
  };

  const handleParseUrl = async (rawUrl: string) => {
    const cleanUrl = extractCleanUrl(rawUrl);
    if (!cleanUrl) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tiktok-parse?url=${encodeURIComponent(cleanUrl)}`);
      const data = await res.json();
      
      setPreview({
        title: data.title || 'Địa điểm TikTok hot',
        thumbnail: data.thumbnail_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
        authorName: data.author_name || 'TikTok User',
        guessedCategory: (data.guessedCategory as PlaceCategory) || 'Ăn tối',
        tags: data.tags || ['Sài Gòn'],
      });
    } catch (err) {
      console.warn('Không thể bóc tách TikTok API, dùng thông tin mặc định:', err);
      // Default fallback if fetch fails
      setPreview({
        title: 'Địa điểm TikTok hot',
        thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
        authorName: 'TikTok Creator',
        guessedCategory: 'Ăn tối',
        tags: ['Sài Gòn'],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (val: string) => {
    const clean = extractCleanUrl(val);
    setTiktokUrl(clean);
    setPreview(null);

    if (clean.includes('tiktok') || clean.includes('http')) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleParseUrl(clean);
      }, 400);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = extractCleanUrl(tiktokUrl);
    if (!cleanUrl) return;

    setLoading(true);
    setError(null);

    try {
      let finalPreview = preview;

      // Auto-fetch if user hasn't waited for preview
      if (!finalPreview) {
        try {
          const res = await fetch(`/api/tiktok-parse?url=${encodeURIComponent(cleanUrl)}`);
          const data = await res.json();
          if (data && data.title) {
            finalPreview = {
              title: data.title,
              thumbnail: data.thumbnail_url,
              authorName: data.author_name,
              guessedCategory: (data.guessedCategory as PlaceCategory) || 'Ăn tối',
              tags: data.tags || ['Sài Gòn'],
            };
          }
        } catch (e) {
          console.warn('Lỗi tự động bóc tách:', e);
        }
      }

      await onAdd({
        tiktokUrl: cleanUrl,
        title: finalPreview?.title || 'Địa điểm TikTok hot',
        thumbnail: finalPreview?.thumbnail || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
        authorName: finalPreview?.authorName || 'TikTok User',
        category: finalPreview?.guessedCategory || 'Ăn tối',
        tags: finalPreview?.tags || ['Sài Gòn'],
        createdBy: 'Bé Yêu',
      });

      setTiktokUrl('');
      setPreview(null);
      onClose();
    } catch (err) {
      setError('Có lỗi xảy ra khi lưu.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    setLoading(true);
    try {
      await onAdd({
        tiktokUrl: '',
        title: manualTitle.trim(),
        thumbnail: selectedImage,
        authorName: 'Tự thêm',
        category: manualCategory,
        tags: [manualTag.trim() || 'Sài Gòn'],
        createdBy: 'Anh iu',
      });

      setManualTitle('');
      onClose();
    } catch (err) {
      setError('Có lỗi xảy ra khi lưu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl relative animate-in fade-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-3 shrink-0">
          <div className="w-9 h-9 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Thêm Địa Điểm / Hoạt Động</h2>
            <p className="text-[11px] text-slate-400">Xem phim, ăn uống, vui chơi, cafe...</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'link'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Dán Link Clip</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'manual'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Thêm Thủ Công</span>
          </button>
        </div>

        {/* --- TAB 1: LINK INPUT --- */}
        {activeTab === 'link' && (
          <form onSubmit={handleLinkSubmit} className="space-y-4 overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Link Clip TikTok / Video
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  required
                  placeholder="https://vt.tiktok.com/..."
                  value={tiktokUrl}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => handleParseUrl(tiktokUrl)}
                  disabled={loading || !tiktokUrl}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700/60 shrink-0 flex items-center space-x-1"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Lấy thông tin</span>}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-rose-400">{error}</p>}

            {preview && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2">
                <div className="flex space-x-3">
                  <img
                    src={preview.thumbnail}
                    alt={preview.title}
                    className="w-16 h-16 object-cover rounded-xl border border-slate-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="inline-block bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                      {preview.guessedCategory}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-100 line-clamp-2">{preview.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{preview.authorName}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !tiktokUrl}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 text-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Lưu Vào Bộ Sưu Tập</span>
            </button>
          </form>
        )}

        {/* --- TAB 2: MANUAL INPUT (Xem Phim, Bowling, Triển Lãm...) --- */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-3.5 overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tên hoạt động / địa điểm
              </label>
              <input
                type="text"
                required
                placeholder="VD: Xem phim Đào, Phở & Piano - CGV Vincom..."
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Thể loại
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as PlaceCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="Vui chơi">🎬 🎳 Vui chơi / Xem phim</option>
                  <option value="Cà phê & Chill">☕ Cà phê & Chill</option>
                  <option value="Ăn tối">🍲 Ăn tối / Lẩu nướng</option>
                  <option value="Ăn sáng">🥣 Ăn sáng</option>
                  <option value="Khác">🛍️ Khác / Mua sắm</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Khu vực / Quận
                </label>
                <input
                  type="text"
                  placeholder="VD: Quận 1, Landmark 81..."
                  value={manualTag}
                  onChange={(e) => setManualTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Choose Preset Image */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Chọn ảnh đại diện minh họa</span>
                <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_IMAGES.map((img) => (
                  <button
                    key={img.name}
                    type="button"
                    onClick={() => {
                      setSelectedImage(img.url);
                      setManualCategory(img.cat);
                    }}
                    className={`relative rounded-xl overflow-hidden border transition-all h-14 ${
                      selectedImage === img.url
                        ? 'border-rose-500 ring-2 ring-rose-500/50 scale-95'
                        : 'border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] font-bold text-slate-200 text-center py-0.5 truncate px-1">
                      {img.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !manualTitle.trim()}
              className="w-full mt-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 text-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Thêm Hoạt Động Này</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
