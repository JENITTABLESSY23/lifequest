import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Swords, Check, Trash2, Edit2, Zap, Coins, Calendar,
  Brain, Dumbbell, Heart, Palette, Target, Loader2,
} from 'lucide-react';

export const CATEGORY_CONFIG = {
  INTELLECT: {
    color: 'text-sky-300 bg-sky-950/70 border-sky-500/40 shadow-sky-950/40',
    icon: Brain,
    label: 'Intellect',
    attributeTag: '+5 INT',
  },
  STRENGTH: {
    color: 'text-rose-300 bg-rose-950/70 border-rose-500/40 shadow-rose-950/40',
    icon: Dumbbell,
    label: 'Strength',
    attributeTag: '+5 STR',
  },
  VITALITY: {
    color: 'text-emerald-300 bg-emerald-950/70 border-emerald-500/40 shadow-emerald-950/40',
    icon: Heart,
    label: 'Vitality',
    attributeTag: '+5 VIT',
  },
  CREATIVITY: {
    color: 'text-purple-300 bg-purple-950/70 border-purple-500/40 shadow-purple-950/40',
    icon: Palette,
    label: 'Creativity',
    attributeTag: '+5 CRE',
  },
  DISCIPLINE: {
    color: 'text-amber-300 bg-amber-950/70 border-amber-500/40 shadow-amber-950/40',
    icon: Target,
    label: 'Discipline',
    attributeTag: '+5 DIS',
  },
};

export const DIFFICULTY_CONFIG = {
  EASY: {
    label: 'EASY',
    stars: '★',
    starCount: 1,
    badge: 'text-slate-300 border-slate-700/80 bg-slate-900/80',
    topAccent: 'bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600',
    cardBorderHover: 'hover:border-slate-600 hover:shadow-slate-900/40',
  },
  MEDIUM: {
    label: 'MEDIUM',
    stars: '★★',
    starCount: 2,
    badge: 'text-sky-300 border-sky-500/40 bg-sky-950/60 shadow-sm shadow-sky-950/50',
    topAccent: 'bg-gradient-to-r from-sky-600 via-cyan-400 to-sky-600',
    cardBorderHover: 'hover:border-sky-500/40 hover:shadow-sky-950/50',
  },
  HARD: {
    label: 'HARD',
    stars: '★★★',
    starCount: 3,
    badge: 'text-amber-300 border-amber-500/50 bg-amber-950/70 shadow-sm shadow-amber-950/60',
    topAccent: 'bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500',
    cardBorderHover: 'hover:border-amber-500/50 hover:shadow-amber-950/60',
  },
  EPIC: {
    label: 'EPIC',
    stars: '★★★★',
    starCount: 4,
    badge: 'text-purple-300 border-purple-400/60 bg-purple-950/80 shadow-md shadow-purple-950/70 ring-1 ring-purple-500/30',
    topAccent: 'bg-gradient-to-r from-purple-500 via-fuchsia-400 to-indigo-500',
    cardBorderHover: 'hover:border-purple-500/60 hover:shadow-purple-950/60',
  },
};

export default function QuestCard({ quest, onComplete, onEdit, onDelete }) {
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const categoryInfo = CATEGORY_CONFIG[quest.category] || CATEGORY_CONFIG.INTELLECT;
  const CategoryIcon = categoryInfo.icon;
  const diffInfo = DIFFICULTY_CONFIG[quest.difficulty] || DIFFICULTY_CONFIG.MEDIUM;

  const handleComplete = async () => {
    if (quest.completed || completing || deleting) return;
    try {
      setCompleting(true);
      await onComplete(quest.id);
    } finally {
      setCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (deleting || completing) return;
    try {
      setDeleting(true);
      await onDelete(quest.id);
    } finally {
      setDeleting(false);
    }
  };

  const hoverMotion = shouldReduceMotion || quest.completed
    ? {}
    : { y: -4, scale: 1.015 };

  const tapMotion = shouldReduceMotion || quest.completed
    ? {}
    : { scale: 0.99 };

  return (
    <motion.article
      layout={!shouldReduceMotion}
      initial="rest"
      animate="rest"
      whileHover={hoverMotion ? 'hover' : undefined}
      whileTap={tapMotion ? 'tap' : undefined}
      variants={{
        rest: { scale: 1, y: 0 },
        hover: hoverMotion,
        tap: tapMotion,
      }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 min-w-0 overflow-hidden ${
        quest.completed
          ? 'bg-slate-900/40 border-slate-800/80 text-slate-400 opacity-80 backdrop-blur-sm'
          : `bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border-slate-800/90 ${diffInfo.cardBorderHover} hover:shadow-xl text-slate-100 backdrop-blur-md`
      }`}
    >
      {/* Top RPG Edge Accent Line */}
      <div
        className={`h-1.5 w-full transition-all duration-300 ${
          quest.completed
            ? 'bg-emerald-600/40'
            : diffInfo.topAccent
        }`}
      />

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        {/* Header bar: Eyebrow + Badges + Edit/Delete Actions */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Category Badge with Micro-Animated Icon */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold tracking-wide shadow-sm ${categoryInfo.color}`}
                title={`Category: ${categoryInfo.label} (${categoryInfo.attributeTag})`}
              >
                <motion.div
                  variants={shouldReduceMotion ? {} : {
                    rest: { scale: 1, rotate: 0 },
                    hover: { scale: 1.15, rotate: [-4, 4, 0], transition: { duration: 0.35, ease: 'easeInOut' } },
                  }}
                  className="shrink-0"
                >
                  <CategoryIcon className="w-3.5 h-3.5" aria-hidden="true" />
                </motion.div>
                <span>{categoryInfo.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({categoryInfo.attributeTag})</span>
              </span>

              {/* Difficulty Badge with Stars */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold tracking-wider uppercase ${diffInfo.badge}`}
                title={`Difficulty: ${diffInfo.label}`}
              >
                <span className="text-amber-400 tracking-tighter" aria-hidden="true">{diffInfo.stars}</span>
                <span>{diffInfo.label}</span>
              </span>
            </div>

            {/* Quick Action Buttons (Edit / Delete) */}
            <div className="flex items-center gap-1 shrink-0">
              {!quest.completed && (
                <button
                  type="button"
                  onClick={() => onEdit(quest)}
                  disabled={completing || deleting}
                  aria-label={`Edit quest ${quest.title}`}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-amber-300 rounded-xl hover:bg-slate-800/80 transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || completing}
                aria-label={`Delete quest ${quest.title}`}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800/80 transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Quest Marker / Tag */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-widest uppercase mb-1.5 text-slate-500">
            <Swords className="w-3 h-3 text-amber-500/70" />
            <span>{quest.completed ? 'CONQUERED ADVENTURE' : 'ACTIVE ADVENTURE'}</span>
          </div>

          {/* Quest Title */}
          <h2
            className={`text-lg sm:text-xl font-bold tracking-tight mb-2 break-words transition-colors duration-200 ${
              quest.completed ? 'line-through text-slate-400' : 'text-white group-hover:text-amber-100/95'
            }`}
          >
            {quest.title}
          </h2>

          {/* Quest Description */}
          {quest.description ? (
            <p className="text-sm text-slate-300 mb-4 line-clamp-3 leading-relaxed break-words">
              {quest.description}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic mb-4">No additional notes.</p>
          )}
        </div>

        {/* Bottom Section: Authoritative Rewards & Action CTA */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-3.5">
          {/* Rewards Panel with subtle hover highlight */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 font-mono font-bold">
              {/* XP Reward (Server-Authoritative) */}
              <span
                className="inline-flex items-center gap-1 text-purple-300 bg-purple-950/60 border border-purple-500/40 group-hover:border-purple-400/60 px-2.5 py-1 rounded-lg shadow-sm transition-colors duration-200"
                title="Authoritative XP rewarded upon completion"
              >
                <Zap className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-300 transition-colors" aria-hidden="true" />
                <span>+{quest.xpReward} XP</span>
              </span>

              {/* Gold Reward (Server-Authoritative) */}
              <span
                className="inline-flex items-center gap-1 text-yellow-300 bg-yellow-950/60 border border-yellow-500/40 group-hover:border-yellow-400/60 px-2.5 py-1 rounded-lg shadow-sm transition-colors duration-200"
                title="Authoritative Gold rewarded upon completion"
              >
                <Coins className="w-3.5 h-3.5 text-yellow-400 group-hover:text-yellow-300 transition-colors" aria-hidden="true" />
                <span>+{quest.goldReward} GOLD</span>
              </span>
            </div>

            {/* Optional Due Date */}
            {quest.dueDate && (
              <span className="inline-flex items-center gap-1 text-slate-400 font-sans text-xs">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
                <span>{new Date(quest.dueDate).toLocaleDateString()}</span>
              </span>
            )}
          </div>

          {/* Complete Button / Completed Badge */}
          {quest.completed ? (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-950/50 border border-emerald-600/50 text-emerald-300 font-black rounded-xl text-center text-xs sm:text-sm flex items-center justify-center gap-2 shadow-inner tracking-wider"
              role="status"
              aria-label="Quest completed"
            >
              <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" aria-hidden="true" />
              <span>✓ ADVENTURE CONQUERED</span>
            </motion.div>
          ) : (
            <motion.button
              type="button"
              whileHover={shouldReduceMotion || completing ? {} : { scale: 1.02, boxShadow: '0 8px 20px -4px rgba(245, 158, 11, 0.3)' }}
              whileTap={shouldReduceMotion || completing ? {} : { scale: 0.97 }}
              onClick={handleComplete}
              disabled={completing || deleting}
              aria-label={`Complete quest: ${quest.title}`}
              className="w-full min-h-[44px] py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-amber-300 select-none"
            >
              {completing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" aria-hidden="true" />
                  <span>CONQUERING...</span>
                </>
              ) : (
                <>
                  <Swords className="w-4 h-4 text-slate-950 stroke-[2.5]" aria-hidden="true" />
                  <span>⚔ CONQUER ADVENTURE</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
}


