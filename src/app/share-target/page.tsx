'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import { dataService } from '@/lib/dataService';
import { Sparkles, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

function ShareTargetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [placeTitle, setPlaceTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const rawUrl = searchParams.get('url') || '';
    const rawText = searchParams.get('text') || '';
    const rawTitle = searchParams.get('title') || '';

    // Extract link from shared text or url
    const fullContent = `${rawUrl} ${rawText} ${rawTitle}`;
    const match = fullContent.match(/(https?:\/\/[^\s]+)/gi);
    const sharedLink = match ? match[0] : '';

    if (!sharedLink) {
      setStatus('error');
      setErrorMessage('Không tìm thấy đường link nào được chia sẻ.');
      return;
    }

    const processSharedLink = async () => {
      try {
        // Fetch metadata via TikTok oEmbed parser API
        const res = await fetch(`/api/tiktok-parse?url=${encodeURIComponent(sharedLink)}`);
        const data = await res.json();

        if (data.success && data.data) {
          const item = data.data;
          setPlaceTitle(item.title);

          // Auto-save to collection
          await dataService.addPlace({
            coupleId: 'couple-123',
            tiktokUrl: sharedLink,
            title: item.title,
            thumbnail: item.thumbnail,
            authorName: item.authorName || 'TikTok Share',
            category: item.category || 'Ăn tối',
            tags: item.tags || ['Sài Gòn'],
            status: 'SAVED',
            createdBy: 'Chia Sẻ TikTok',
          });

          setStatus('success');

          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 }
          });

          // Redirect back to main page after 2 seconds
          setTimeout(() => {
            router.push('/?tab=tiktok');
          }, 2200);
        } else {
          // Fallback if oEmbed parser failed
          const fallbackTitle = rawTitle || 'Địa Điểm Từ Chia Sẻ';
          setPlaceTitle(fallbackTitle);

          await dataService.addPlace({
            coupleId: 'couple-123',
            tiktokUrl: sharedLink,
            title: fallbackTitle,
            thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
            authorName: 'Chia Sẻ',
            category: 'Ăn tối',
            tags: ['Sài Gòn'],
            status: 'SAVED',
            createdBy: 'Chia Sẻ',
          });

          setStatus('success');

          setTimeout(() => {
            router.push('/?tab=tiktok');
          }, 2000);
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('Không thể xử lý link vừa chia sẻ. Vui lòng thử lại.');
      }
    };

    processSharedLink();
  }, [searchParams, router]);

  return (
    <MobileContainer>
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        
        {status === 'loading' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/30">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Đang Tự Động Phân Tích Link TikTok... ✨</h2>
              <p className="text-xs text-slate-400 mt-1">Đang lấy thumbnail, tên quán & tự động lưu vào Bộ sưu tập</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Đã Lưu Thành Công 🎉
              </span>
              <h2 className="text-base font-bold text-white mt-2 line-clamp-2">{placeTitle}</h2>
              <p className="text-xs text-slate-400 mt-1">Đang tự động chuyển về trang chủ Bộ sưu tập...</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/30">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Có Lỗi Xảy Ra 😅</h2>
              <p className="text-xs text-rose-300 mt-1">{errorMessage}</p>
            </div>

            <button
              onClick={() => router.push('/')}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 inline-flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về Trang Chủ UsWeekends</span>
            </button>
          </div>
        )}

      </div>
    </MobileContainer>
  );
}

export default function ShareTargetPage() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-white">Đang nạp...</div>}>
      <ShareTargetContent />
    </Suspense>
  );
}
