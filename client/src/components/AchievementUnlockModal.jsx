import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Check, X } from 'lucide-react';

export default function AchievementUnlockModal({ achievements = [], onClose }) {
  useEffect(() => {
    if (!achievements || achievements.length === 0) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [achievements, onClose]);

  if (!achievements || achievements.length === 0) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="achievement-modal-title"
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
          className="relative max-w-md w-full bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/50 border border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/20 text-center max-h-[90vh] overflow-y-auto"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close achievement modal"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Trophy Emblem */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center mb-6">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-amber-400">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>
          </div>

          {/* Header */}
          <div
            id="achievement-modal-title"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black tracking-widest uppercase mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" />
            ACHIEVEMENT UNLOCKED!
          </div>

          {/* Achievements list */}
          <div className="space-y-4 my-4 text-left">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-start gap-3 shadow-inner"
              >
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{ach.name}</h4>
                    <span className="text-[10px] uppercase font-mono font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {ach.rarity || 'COMMON'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full mt-4 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition active:scale-[0.98]"
          >
            Claim & Continue
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
