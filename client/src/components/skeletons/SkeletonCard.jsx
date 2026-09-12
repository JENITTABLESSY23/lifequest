import React from 'react';

export function SkeletonQuestCard() {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-4 relative overflow-hidden backdrop-blur-sm">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/20 to-transparent animate-shimmer" />

      {/* Top badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-24 h-6 bg-slate-800/80 rounded-xl" />
          <div className="w-16 h-6 bg-slate-800/80 rounded-lg" />
        </div>
        <div className="w-6 h-6 bg-slate-800/80 rounded-lg" />
      </div>

      {/* Title & description */}
      <div className="space-y-2 py-1">
        <div className="w-3/4 h-6 bg-slate-800/90 rounded-lg" />
        <div className="w-full h-4 bg-slate-800/60 rounded-md" />
        <div className="w-2/3 h-4 bg-slate-800/60 rounded-md" />
      </div>

      {/* Bottom rewards & CTA */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-20 h-6 bg-slate-800/70 rounded-lg" />
          <div className="w-20 h-6 bg-slate-800/70 rounded-lg" />
        </div>
        <div className="w-full h-11 bg-slate-800/80 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonRewardCard() {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-4 relative overflow-hidden backdrop-blur-sm flex flex-col justify-between">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/20 to-transparent animate-shimmer" />

      <div className="flex items-start justify-between">
        <div className="w-14 h-14 bg-slate-800/80 rounded-2xl" />
        <div className="w-16 h-5 bg-slate-800/80 rounded-md" />
      </div>

      <div className="space-y-2">
        <div className="w-3/4 h-5 bg-slate-800/90 rounded-lg" />
        <div className="w-full h-3.5 bg-slate-800/60 rounded" />
      </div>

      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="w-24 h-6 bg-slate-800/70 rounded-lg" />
        <div className="w-full h-10 bg-slate-800/80 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-3 relative overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/20 to-transparent animate-shimmer" />
      <div className="flex items-center justify-between">
        <div className="w-28 h-5 bg-slate-800/80 rounded-lg" />
        <div className="w-8 h-8 bg-slate-800/80 rounded-xl" />
      </div>
      <div className="w-16 h-8 bg-slate-800/90 rounded-lg" />
      <div className="w-full h-2 bg-slate-800/70 rounded-full" />
    </div>
  );
}
