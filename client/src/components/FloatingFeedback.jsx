import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Zap, Coins, Flame, Sparkles } from 'lucide-react';

export default function FloatingFeedback(props) {
  const { onComplete } = props;
  // Support both <FloatingFeedback {...data} /> and <FloatingFeedback data={data} />
  const data = props.data || props;
  const [visible, setVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 1200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!data || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 0, scale: 0.85 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: -35, scale: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -50, scale: 0.85 }}
        transition={{ duration: shouldReduceMotion ? 0.2 : 1.0, ease: 'easeOut' }}
        className="pointer-events-none fixed bottom-12 right-4 sm:right-8 z-50 flex flex-col gap-2 font-mono font-black select-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {data.xp != null && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/90 border border-purple-500/50 text-purple-300 shadow-xl shadow-purple-500/20 text-xs sm:text-sm">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>+{data.xp} XP</span>
          </div>
        )}

        {data.gold != null && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-950/90 border border-yellow-500/50 text-yellow-300 shadow-xl shadow-yellow-500/20 text-xs sm:text-sm">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span>+{data.gold} GOLD</span>
          </div>
        )}

        {data.attribute && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-950/90 border border-sky-500/50 text-sky-300 shadow-xl shadow-sky-500/20 text-[11px] sm:text-xs uppercase">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>+{data.attributeIncrease || 5} {data.attribute}</span>
          </div>
        )}

        {data.streakIncreased && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-950/90 border border-orange-500/50 text-orange-300 shadow-xl shadow-orange-500/20 text-[11px] sm:text-xs">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>+1 STREAK</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

