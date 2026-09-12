import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Shield, ArrowRight, Zap, Coins, X } from 'lucide-react';

export default function LevelUpModal({ isOpen, onClose, progression }) {
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

  if (!isOpen || !progression) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="levelup-title"
          aria-describedby="levelup-desc"
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-900 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/20 text-center relative max-h-[90vh] overflow-y-auto space-y-6"
        >
          {/* Ambient particle glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-amber-400/20 blur-[80px] rounded-full pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close level up modal"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Trophy Icon */}
          <div className="relative inline-flex p-4 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl shadow-xl shadow-amber-500/30 text-slate-950 mb-2">
            <Trophy className="w-12 h-12 animate-bounce" />
            <Sparkles className="w-6 h-6 text-white absolute -top-2 -right-2 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" /> REAL-WORLD MILESTONE
            </div>
            <h2 id="levelup-title" className="text-4xl font-extrabold text-white tracking-tight">
              LEVEL UP!
            </h2>
            <p id="levelup-desc" className="text-sm text-slate-300">
              Your dedication has paid off in real life!
            </p>
          </div>

          {/* Level Transition Pill */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-center gap-4 text-xl font-black">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-5 h-5" /> Level {progression.previousLevel}
            </div>
            <ArrowRight className="w-6 h-6 text-amber-400 animate-pulse" />
            <div className="flex items-center gap-1.5 text-amber-400 text-2xl scale-110 font-black">
              <Shield className="w-6 h-6" /> Level {progression.newLevel}
            </div>
          </div>

          {/* Gains Summary */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono font-bold">
            <div className="p-3 bg-purple-950/50 border border-purple-500/30 rounded-xl flex items-center justify-center gap-2 text-purple-300">
              <Zap className="w-4 h-4 text-purple-400" /> +{progression.xpGained} XP
            </div>
            <div className="p-3 bg-yellow-950/50 border border-yellow-500/30 rounded-xl flex items-center justify-center gap-2 text-yellow-300">
              <Coins className="w-4 h-4 text-yellow-400" /> +{progression.goldGained} GOLD
            </div>
          </div>

          {/* Continue CTA */}
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-amber-500/25 transition transform hover:-translate-y-0.5"
          >
            CLAIM VICTORY
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
