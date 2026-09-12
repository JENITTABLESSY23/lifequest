import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Sparkles, X } from 'lucide-react';

export default function StreakMilestoneModal({ isOpen, onClose, milestone }) {
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

  if (!isOpen || !milestone || !milestone.unlocked) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="streak-modal-title"
          aria-describedby="streak-modal-desc"
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-gradient-to-b from-slate-900 via-orange-950/50 to-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-orange-500/20 text-center relative max-h-[90vh] overflow-y-auto space-y-6"
        >
          {/* Flame ambient glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-amber-500/25 blur-[80px] rounded-full pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close streak milestone modal"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Flame Trophy Icon */}
          <div className="relative inline-flex p-5 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl shadow-xl shadow-orange-500/30 text-slate-950 mb-2">
            <Flame className="w-12 h-12 animate-bounce fill-amber-300" />
            <Sparkles className="w-6 h-6 text-yellow-200 absolute -top-2 -right-2 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" /> STREAK MILESTONE UNLOCKED!
            </div>
            <h2 id="streak-modal-title" className="text-3xl font-black text-white tracking-tight">
              {milestone.name || `${milestone.days} DAY STREAK`}
            </h2>
            <p id="streak-modal-desc" className="text-sm text-slate-300 max-w-xs mx-auto">
              {milestone.description || 'Incredible discipline! Keep the flame burning strong!'}
            </p>
          </div>

          {/* Days Badge */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-center gap-3 text-2xl font-black text-amber-400">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>{milestone.days} Consecutive Days</span>
          </div>

          {/* Continue CTA */}
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-orange-500/25 transition transform hover:-translate-y-0.5"
          >
            KEEP GOING!
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
