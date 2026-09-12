import React from 'react';
import {
  Sword,
  ShieldCheck,
  Flame,
  Crown,
  Zap,
  Coins,
  Lock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const ICON_MAP = {
  Sword,
  ShieldCheck,
  Flame,
  Crown,
  Zap,
  Coins,
};

const RARITY_STYLES = {
  COMMON: {
    border: 'border-slate-700/80 hover:border-slate-500',
    badge: 'bg-slate-800 text-slate-300 border-slate-600',
    glow: 'shadow-slate-900/40',
    iconBg: 'bg-slate-800/80 text-slate-200 border-slate-700',
  },
  RARE: {
    border: 'border-sky-500/40 hover:border-sky-400',
    badge: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
    glow: 'shadow-sky-500/10',
    iconBg: 'bg-sky-950/60 text-sky-400 border-sky-500/30',
  },
  EPIC: {
    border: 'border-purple-500/50 hover:border-purple-400',
    badge: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
    glow: 'shadow-purple-500/15',
    iconBg: 'bg-purple-950/60 text-purple-400 border-purple-500/30',
  },
  LEGENDARY: {
    border: 'border-amber-500/60 hover:border-amber-400 shadow-lg shadow-amber-500/10',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    glow: 'shadow-amber-500/20',
    iconBg: 'bg-amber-950/60 text-amber-400 border-amber-500/40',
  },
};

export default function AchievementCard({ achievement }) {
  const { name, description, icon, rarity = 'COMMON', unlocked, unlockedAt, requirement } = achievement;
  const style = RARITY_STYLES[rarity] || RARITY_STYLES.COMMON;
  const IconComponent = ICON_MAP[icon] || Sparkles;

  const formattedDate = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div
      className={`relative rounded-2xl border p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between min-w-0 ${
        unlocked
          ? `bg-slate-900/80 ${style.border} ${style.glow} shadow-lg backdrop-blur-sm`
          : 'bg-slate-950/60 border-slate-800/80 opacity-60'
      }`}
    >
      {/* Top row: Icon & Status Badge */}
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div
          className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-center shrink-0 ${
            unlocked ? style.iconBg : 'bg-slate-900 border-slate-800 text-slate-600'
          }`}
        >
          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border tracking-wider ${
              unlocked ? style.badge : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            {rarity}
          </span>

          {unlocked ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
              <Lock className="w-3 h-3" /> Locked
            </span>
          )}
        </div>
      </div>

      {/* Middle: Name & Description */}
      <div className="mt-3 sm:mt-4 space-y-1 min-w-0">
        <h4 className={`text-sm sm:text-base font-bold break-words ${unlocked ? 'text-white' : 'text-slate-400'}`}>
          {name}
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed break-words">{description}</p>
      </div>

      {/* Bottom: Requirement or Unlock Date */}
      <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-800/60 text-[11px] flex items-center justify-between text-slate-500 min-w-0">
        <span className="truncate">{requirement?.label || 'Requirement'}</span>
        {unlocked && formattedDate && (
          <span className="text-slate-400 font-mono text-[10px] shrink-0 ml-2">
            {formattedDate}
          </span>
        )}
      </div>
    </div>
  );
}
