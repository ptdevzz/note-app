'use client';

import React from 'react';

export function PlaceCardSkeleton() {
  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden p-3 shadow-md relative animate-pulse space-y-3">
      <div className="flex space-x-3">
        <div className="w-20 h-20 bg-slate-800/80 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2.5 py-0.5">
          <div className="flex items-center justify-between">
            <div className="w-16 h-4 bg-rose-500/20 rounded-full" />
            <div className="w-12 h-3 bg-slate-800/60 rounded-md" />
          </div>
          <div className="w-full h-3.5 bg-slate-800/90 rounded-md" />
          <div className="w-2/3 h-3.5 bg-slate-800/90 rounded-md" />
          <div className="flex space-x-2 pt-0.5">
            <div className="w-12 h-3 bg-slate-800/60 rounded-md" />
            <div className="w-14 h-3 bg-slate-800/60 rounded-md" />
          </div>
        </div>
      </div>
      <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center">
        <div className="w-16 h-3 bg-slate-800/60 rounded-md" />
        <div className="w-20 h-6 bg-slate-800/80 rounded-xl" />
      </div>
    </div>
  );
}

export function HomeHeaderSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Widget Skeleton */}
      <div className="h-20 bg-slate-900/90 border border-slate-800/80 rounded-3xl p-4 flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="w-36 h-3.5 bg-slate-800 rounded-md" />
          <div className="w-48 h-3 bg-slate-800/60 rounded-md" />
        </div>
        <div className="w-12 h-12 bg-rose-500/20 rounded-2xl" />
      </div>

      {/* Countdown Skeleton */}
      <div className="h-28 bg-slate-900/90 border border-slate-800/80 rounded-3xl p-4 space-y-3">
        <div className="w-32 h-3.5 bg-slate-800 rounded-md" />
        <div className="w-full h-14 bg-slate-950/80 rounded-2xl border border-slate-800/60" />
      </div>

      {/* Note Skeleton */}
      <div className="h-24 bg-slate-900/90 border border-slate-800/80 rounded-3xl p-4 space-y-2">
        <div className="w-40 h-3.5 bg-slate-800 rounded-md" />
        <div className="w-full h-10 bg-slate-950/80 rounded-2xl" />
      </div>
    </div>
  );
}

export function PhotoboothGridSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-44 bg-slate-900/90 border border-slate-800/80 rounded-3xl p-3 flex space-x-3">
        <div className="w-24 h-full bg-slate-800 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2 py-2">
          <div className="w-3/4 h-4 bg-slate-800 rounded-md" />
          <div className="w-1/2 h-3 bg-slate-800/60 rounded-md" />
          <div className="grid grid-cols-3 gap-1 pt-2">
            <div className="h-10 bg-slate-800/60 rounded-lg" />
            <div className="h-10 bg-slate-800/60 rounded-lg" />
            <div className="h-10 bg-slate-800/60 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
