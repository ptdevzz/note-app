'use client';

import React from 'react';
import { LoveCoupon } from '@/lib/types';
import { Gift, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoveCouponsModalProps {
  coupons: LoveCoupon[];
  onUseCoupon: (id: string) => Promise<void>;
}

export default function LoveCouponsModal({ coupons, onUseCoupon }: LoveCouponsModalProps) {
  const handleRedeem = async (coupon: LoveCoupon) => {
    if (coupon.isUsed) return;
    await onUseCoupon(coupon.id);

    // Fire celebratory confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Gift className="w-5 h-5 text-rose-400" />
            <span>Thẻ Đặc Quyền Bạn Gái</span>
          </h2>
          <p className="text-xs text-slate-400">
            Sử dụng để nhận đặc quyền bất cứ lúc nào!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
              coupon.isUsed
                ? 'bg-slate-900/40 border-slate-800 opacity-60'
                : 'bg-gradient-to-r from-rose-950/40 to-slate-900 border-rose-800/40 hover:border-rose-500/60 shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="text-2xl p-2 bg-slate-800/80 rounded-xl border border-slate-700/50">
                  {coupon.icon}
                </span>
                <div>
                  <h3 className={`text-xs font-bold ${coupon.isUsed ? 'text-slate-400 line-through' : 'text-rose-100'}`}>
                    {coupon.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {coupon.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-between items-center border-t border-slate-800/60 pt-2.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                CODE: {coupon.code}
              </span>

              {coupon.isUsed ? (
                <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã đổi thẻ</span>
                </span>
              ) : (
                <button
                  onClick={() => handleRedeem(coupon)}
                  className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md shadow-rose-500/20 flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sử Dụng Thẻ 🎟️</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
