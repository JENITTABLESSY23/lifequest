import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Check, Trash2, Edit2, Zap, Coins, Calendar, Brain, Dumbbell, Heart, Palette, Target, Loader2 } from 'lucide-react';

const CATEGORY_CONFIG = {
  INTELLECT: { color: 'text-sky-400 bg-sky-950/60 border-sky-500/30', icon: Brain, label: 'Intellect' },
  STRENGTH: { color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30', icon: Dumbbell, label: 'Strength' },
  VITALITY: { color: 'text-rose-400 bg-rose-950/60 border-rose-500/30', icon: Heart, label: 'Vitality' },
  CREATIVITY: { color: 'text-purple-400 bg-purple-950/60 border-purple-500/30', icon: Palette, label: 'Creativity' },
  DISCIPLINE: { color: 'text-amber-400 bg-amber-950/60 border-amber-500/30', icon: Target, label: 'Discipline' },
};

const DIFFICULTY_CONFIG = {
  EASY: { label: 'EASY', stars: '★', color: 'text-slate-400 border-slate-700 bg-slate-900/60' },
  MEDIUM: { label: 'MEDIUM', stars: '★★', color: 'text-sky-300 border-sky-600/40 bg-sky-950/40' },
  HARD: { label: 'HARD', stars: '★★★', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
  EPIC: { label: 'EPIC', stars: '★★★★', color: 'text-purple-300 border-purple-500/50 bg-purple-950/50 shadow-purple-500/20' },
};

export default function QuestCard({ quest, onComplete, onEdit, onDelete }) {
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);

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


  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      whileHover={quest.completed ? {} : { scale: 1.01, y: -2 }}
      whileTap={quest.completed ? {} : { scale: 0.99 }}
      transition={{ duration: 0.25 }}
      className={`relative flex flex-col justify-between rounded-2xl border p-4 sm:p-6 backdrop-blur-md transition-all shadow-lg min-w-0 ${
        quest.completed
          ? 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-75'
          : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700 text-slate-100 shadow-slate-950/50'
      }`}
    >
      {/* Top Banner & Tags */}
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold tracking-wide ${categoryInfo.color}`}>
              <CategoryIcon className="w-3.5 h-3.5" />
              {categoryInfo.label}
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-mono font-bold tracking-wider uppercase ${diffInfo.color}`}>
              <span>{diffInfo.stars}</span> {diffInfo.label}
            </span>
          </div>

          {/* Edit & Delete Action Buttons */}
          <div className="flex items-center gap-1">
            {!quest.completed && (
              <button
                onClick={() => onEdit(quest)}
                disabled={completing || deleting}
                aria-label={`Edit quest ${quest.title}`}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-amber-400 rounded-xl hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting || completing}
              aria-label={`Delete quest ${quest.title}`}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin text-rose-400" /> : <Trash2 className="w-4 h-4" />}
            </button>

          </div>
        </div>

        {/* Title */}
        <h3 className={`text-lg sm:text-xl font-extrabold tracking-tight mb-2 break-words ${quest.completed ? 'line-through text-slate-400' : 'text-white'}`}>
          {quest.title}
        </h3>

        {/* Description */}
        {quest.description && (
          <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed break-words">
            {quest.description}
          </p>
        )}
      </div>

      {/* Bottom Section: Rewards, Due Date & Complete CTA */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          {/* XP & Gold Reward Badges */}
          <div className="flex items-center gap-3 font-mono font-bold">
            <span className="flex items-center gap-1 text-purple-400 bg-purple-950/50 border border-purple-500/30 px-2.5 py-1 rounded-lg">
              <Zap className="w-3.5 h-3.5" /> +{quest.xpReward} XP
            </span>
            <span className="flex items-center gap-1 text-yellow-400 bg-yellow-950/50 border border-yellow-500/30 px-2.5 py-1 rounded-lg">
              <Coins className="w-3.5 h-3.5" /> +{quest.goldReward} GOLD
            </span>
          </div>

          {/* Due Date */}
          {quest.dueDate && (
            <span className="flex items-center gap-1 text-slate-400 font-sans">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {new Date(quest.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Complete Action Button */}
        {quest.completed ? (
          <div className="w-full py-2.5 bg-emerald-950/40 border border-emerald-700/60 text-emerald-400 font-extrabold rounded-xl text-center text-sm flex items-center justify-center gap-2 shadow-inner tracking-wide">
            <Check className="w-4 h-4 text-emerald-400" /> QUEST COMPLETED
          </div>
        ) : (
          <motion.button
            whileHover={completing ? {} : { scale: 1.01 }}
            whileTap={completing ? {} : { scale: 0.98 }}
            onClick={handleComplete}
            disabled={completing}
            aria-label={`Complete quest ${quest.title}`}
            className="w-full min-h-[44px] py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider text-sm focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            {completing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>COMPLETING...</span>
              </>
            ) : (
              <>
                <Swords className="w-4 h-4" />
                <span>COMPLETE QUEST</span>
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
