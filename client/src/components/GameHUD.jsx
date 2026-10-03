import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Swords, Sparkles, Coins, Flame, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Client-side progression stats helper mirroring server logic for XP progress bar
function getProgressionStats(totalXP) {
  const getLevelThreshold = (n) => Math.round(100 * Math.pow(n, 1.5));
  const safeXP = Math.max(0, Math.floor(Number(totalXP) || 0));

  let level = 1;
  while (safeXP >= getLevelThreshold(level)) level++;

  const prevLevelXP = level === 1 ? 0 : getLevelThreshold(level - 1);
  const nextLevelXP = getLevelThreshold(level);
  const currentLevelXP = safeXP - prevLevelXP;
  const xpRequired = nextLevelXP - prevLevelXP;
  const progressPct = Math.min(100, Math.max(0, Math.round((currentLevelXP / (xpRequired || 1)) * 100)));

  return { level, totalXP: safeXP, currentLevelXP, xpRequired, progressPct };
}

/**
 * GameHUD
 * Persistent RPG Game Heads-Up Display showing player status across the realm:
 * ⚔ LEVEL, ✨ XP, 🪙 GOLD, 🔥 STREAK.
 * Uses authoritative AuthContext data without extra API calls.
 */
export default function GameHUD({ className = '' }) {
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  if (!user) return null;

  const totalXP = user.xp ?? 0;
  const gold = user.gold ?? 0;
  const streak = user.streak ?? 0;
  const progression = getProgressionStats(totalXP);
  // Authoritative level from user doc (fallback to calculated level)
  const level = user.level || progression.level;

  return (
    <aside
      aria-label="Player Status HUD"
      className={`w-full bg-[#0A0D15]/90 border-b border-indigo-900/30 backdrop-blur-md px-3 sm:px-6 py-2.5 z-20 relative select-none ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Player Identity & Level Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-500/40 text-amber-300 font-mono text-xs sm:text-sm font-black tracking-wider shadow-sm shadow-indigo-950/40">
            <Swords className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span className="sr-only">Player Level:</span>
            <span>LVL {level}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Shield className="w-3 h-3 text-indigo-400" aria-hidden="true" />
            <span className="font-semibold tracking-wide text-white">{user.name}</span>
          </div>
        </div>

        {/* Center: XP Bar & Status */}
        <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-2 hidden sm:block">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-purple-300 font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-purple-400" aria-hidden="true" />
              <span>XP Progress</span>
            </span>
            <span className="text-slate-300 font-bold">
              {progression.currentLevelXP} / {progression.xpRequired} XP
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={progression.progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Level ${level} experience progress: ${progression.progressPct}%`}
            className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-purple-900/40 shadow-inner"
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-amber-400 shadow-sm"
              initial={shouldReduceMotion ? false : { width: 0 }}
              animate={{ width: `${progression.progressPct}%` }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Right: Gold, Streak & Quick Mobile Counters */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto sm:ml-0 font-mono text-xs sm:text-sm">
          {/* Mobile XP counter (when full bar is hidden) */}
          <div className="sm:hidden flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/80 border border-slate-800 text-purple-300 font-bold">
            <Sparkles className="w-3 h-3 text-purple-400 shrink-0" aria-hidden="true" />
            <span>{totalXP}</span>
            <span className="text-[10px] text-purple-400/80">XP</span>
          </div>

          {/* Gold HUD Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-slate-950/80 border border-amber-500/30 text-yellow-300 font-bold shadow-sm"
            aria-label={`${gold} Gold Coins`}
          >
            <Coins className="w-3.5 h-3.5 text-yellow-400 shrink-0" aria-hidden="true" />
            <span className="text-yellow-300 font-black">{gold}</span>
            <span className="hidden xs:inline text-[10px] text-amber-400/80 uppercase font-semibold">
              GOLD
            </span>
          </div>

          {/* Streak HUD Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-slate-950/80 border border-amber-600/30 text-amber-400 font-bold shadow-sm"
            aria-label={`${streak} Day Streak`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" aria-hidden="true" />
            <span className="text-amber-300 font-black">{streak}</span>
            <span className="hidden xs:inline text-[10px] text-amber-500/80 uppercase font-semibold">
              DAY{streak === 1 ? '' : 'S'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
