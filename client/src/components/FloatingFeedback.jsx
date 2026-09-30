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
    }, 1400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!data || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 15, scale: 0.9 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: -45, scale: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -65, scale: 0.85 }}
        transition={{ duration: shouldReduceMotion ? 0.2 : 1.1, ease: 'easeOut' }}
        className="pointer-events-none fixed bottom-14 right-4 sm:right-8 z-50 flex flex-col gap-2 font-mono font-black select-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {data.xp != null && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-950/95 border border-purple-500/60 text-purple-200 shadow-2xl shadow-purple-500/30 text-xs sm:text-sm backdrop-blur-md">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>+{data.xp} XP</span>
          </div>
        )}

        {data.gold != null && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-yellow-950/95 border border-yellow-500/60 text-yellow-200 shadow-2xl shadow-yellow-500/30 text-xs sm:text-sm backdrop-blur-md">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span>+{data.gold} GOLD</span>
          </div>
        )}

        {data.attribute && (
          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-sky-950/95 border border-sky-500/60 text-sky-200 shadow-2xl shadow-sky-500/30 text-[11px] sm:text-xs uppercase backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>+{data.attributeIncrease || 5} {data.attribute}</span>
          </div>
        )}

        {data.streakIncreased && (
          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-orange-950/95 border border-orange-500/60 text-orange-200 shadow-2xl shadow-orange-500/30 text-[11px] sm:text-xs backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>+1 STREAK</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}


