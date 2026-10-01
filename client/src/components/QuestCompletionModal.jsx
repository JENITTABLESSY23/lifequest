import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Swords, X, Zap, Coins, Sparkles, Flame, Trophy,
  ArrowRight, Shield, Award, CheckCircle2,
} from 'lucide-react';

const ATTRIBUTE_LOOKUP = {
  intellect: { name: 'Intellect', glyph: '🧠', tag: 'INT', color: 'text-sky-300 bg-sky-950/70 border-sky-500/40' },
  strength: { name: 'Strength', glyph: '💪', tag: 'STR', color: 'text-rose-300 bg-rose-950/70 border-rose-500/40' },
  vitality: { name: 'Vitality', glyph: '❤️', tag: 'VIT', color: 'text-emerald-300 bg-emerald-950/70 border-emerald-500/40' },
  creativity: { name: 'Creativity', glyph: '🎨', tag: 'CRE', color: 'text-purple-300 bg-purple-950/70 border-purple-500/40' },
  discipline: { name: 'Discipline', glyph: '🔥', tag: 'DIS', color: 'text-amber-300 bg-amber-950/70 border-amber-500/40' },
};

export default function QuestCompletionModal({ isOpen, onClose, data }) {
  const shouldReduceMotion = useReducedMotion();
  const continueBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Autofocus the continue button when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        continueBtnRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const { quest, progression = {}, streak = {}, milestone = {}, unlockedAchievements = [] } = data;

  const xpGained = progression.xpGained ?? quest?.xpReward ?? 0;
  const goldGained = progression.goldGained ?? quest?.goldReward ?? 0;

  const rawAttr = (progression.attribute || progression.attributeKey || quest?.category || '').toLowerCase();
  const attrInfo = ATTRIBUTE_LOOKUP[rawAttr] || {
    name: rawAttr ? rawAttr.toUpperCase() : 'Attribute',
    glyph: '✨',
    tag: 'ATTR',
    color: 'text-amber-300 bg-amber-950/70 border-amber-500/40',
  };

  const hasLevelUp = Boolean(progression.levelUp);
  const hasMilestone = Boolean(milestone?.unlocked);
  const hasAchievements = Array.isArray(unlockedAchievements) && unlockedAchievements.length > 0;
  const hasQueuedCelebration = hasLevelUp || hasMilestone || hasAchievements;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        role="presentation"
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quest-complete-title"
          aria-describedby="quest-complete-desc"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 24 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 24 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/70 border-2 border-amber-500/70 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-amber-500/20 relative max-h-[92vh] overflow-y-auto text-center space-y-5"
        >
          {/* Ambient Top Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close completion ceremony"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Emblem & Sparks */}
          <div className="relative inline-flex items-center justify-center mt-2">
            <motion.div
              initial={shouldReduceMotion ? {} : { scale: 0.8, rotate: -8 }}
              animate={shouldReduceMotion ? {} : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="p-4 bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 rounded-3xl shadow-xl shadow-amber-500/30 text-slate-950"
            >
              <Swords className="w-10 h-10 stroke-[2.5]" aria-hidden="true" />
            </motion.div>
            <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-pulse" aria-hidden="true" />
          </div>

          {/* Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              QUEST ACCOMPLISHED
            </div>
            <h2 id="quest-complete-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
              ⚔ QUEST COMPLETE! ⚔
            </h2>
            <p id="quest-complete-desc" className="text-sm font-bold text-amber-200/90 max-w-sm mx-auto line-clamp-2 px-2">
              "{quest?.title || 'Challenge Accomplished'}"
            </p>
          </div>

          {/* Core Rewards Cards: XP & Gold */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* XP Gain */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-3 sm:p-4 rounded-2xl bg-purple-950/60 border border-purple-500/50 shadow-lg shadow-purple-950/50 flex flex-col items-center justify-center gap-1 text-purple-200"
            >
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                <Zap className="w-4 h-4 fill-purple-400" aria-hidden="true" />
                <span>XP GAINED</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black font-mono text-purple-200 tracking-tight">
                +{xpGained}
              </span>
            </motion.div>

            {/* Gold Gain */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-3 sm:p-4 rounded-2xl bg-amber-950/60 border border-amber-500/50 shadow-lg shadow-amber-950/50 flex flex-col items-center justify-center gap-1 text-amber-200"
            >
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <Coins className="w-4 h-4 fill-amber-400" aria-hidden="true" />
                <span>GOLD EARNED</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-200 tracking-tight">
                +{goldGained}
              </span>
            </motion.div>
          </div>

          {/* Progression Badges: Attribute Boost & Streak */}
          <div className="space-y-2 pt-1">
            {/* Attribute increase */}
            {rawAttr && (
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm font-bold ${attrInfo.color}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{attrInfo.glyph}</span>
                  <span className="uppercase tracking-wide">
                    {attrInfo.name} Power
                  </span>
                </div>
                <span className="font-mono font-black text-amber-300">
                  +{progression.attributeIncrease || 5} {attrInfo.tag}
                </span>
              </motion.div>
            )}

            {/* Daily Streak event */}
            {streak && streak.current > 0 && (
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-center justify-between p-3 rounded-xl bg-orange-950/50 border border-orange-500/40 text-orange-200 text-xs sm:text-sm font-bold"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400" aria-hidden="true" />
                  <span>
                    {streak.increased ? 'Daily Streak Extended!' : 'Daily Streak Maintained'}
                  </span>
                </div>
                <span className="font-mono font-black text-orange-300">
                  {streak.current} DAY{streak.current > 1 ? 'S' : ''}
                </span>
              </motion.div>
            )}

            {/* Level XP Progression Bar */}
            {progression.progressPercentage != null && (
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 text-left"
              >
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                    Level {progression.newLevel || progression.level || 1} Progress
                  </span>
                  <span className="text-amber-400">
                    {progression.progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(0, progression.progressPercentage))}%` }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-amber-400 rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Pending Sequenced Celebrations Hint */}
          {hasQueuedCelebration && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <span>
                {hasLevelUp
                  ? '✨ Level-Up Ceremony Awaits!'
                  : hasMilestone
                  ? '🔥 Streak Milestone Unlocked!'
                  : '🏆 New Achievements Unlocked!'}
              </span>
            </motion.div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              ref={continueBtnRef}
              type="button"
              onClick={onClose}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 transition flex items-center justify-center gap-2 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <span>{hasQueuedCelebration ? 'CLAIM REWARDS & CONTINUE' : 'CLAIM REWARDS'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
