import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * GameWorldBackground
 * Reusable atmospheric background layer for "LIFEQUEST — THE REALM OF YOU".
 * Provides a midnight mystical atmosphere with subtle ambient lights and stars,
 * without competing with text or layout, and respects reduced motion.
 */
export default function GameWorldBackground({ variant = 'default' }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* 1. Base World Canvas: Deep Midnight Slate / Charcoal */}
      <div className="absolute inset-0 bg-[#07090E]" />

      {/* 2. Top Realm Sky Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19] via-[#080B12]/90 to-[#05070A]" />

      {/* 3. Subtle Hexagonal/Runic Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* 4. Ambient Celestial Glow (Purple / Indigo Magic) */}
      <motion.div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[380px] bg-indigo-600/10 blur-[140px] rounded-full"
        animate={
          shouldReduceMotion
            ? false
            : {
                scale: [1, 1.08, 1],
                opacity: [0.12, 0.18, 0.12],
              }
        }
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 5. Deep Amber Forge Glow (Bottom Right) */}
      <motion.div
        className="absolute -bottom-40 right-10 w-[550px] h-[350px] bg-amber-500/08 blur-[150px] rounded-full hidden sm:block"
        animate={
          shouldReduceMotion
            ? false
            : {
                scale: [1, 1.06, 1],
                opacity: [0.06, 0.1, 0.06],
              }
        }
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* 6. Distant Mysterious Violet Mist (Bottom Left) */}
      <div className="absolute -bottom-20 -left-20 w-[450px] h-[300px] bg-purple-900/15 blur-[120px] rounded-full" />

      {/* 7. Subtle Distant Realm Stars (Pure CSS / Lightweight) */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 opacity-25 hidden md:block">
          <div className="absolute top-[12%] left-[18%] w-1 h-1 bg-amber-200/80 rounded-full shadow-[0_0_4px_#fbbf24] animate-pulse" />
          <div className="absolute top-[28%] right-[22%] w-1.5 h-1.5 bg-indigo-200/90 rounded-full shadow-[0_0_6px_#818cf8] animate-pulse [animation-delay:2s]" />
          <div className="absolute top-[65%] left-[10%] w-1 h-1 bg-sky-200/70 rounded-full shadow-[0_0_4px_#38bdf8] animate-pulse [animation-delay:4s]" />
          <div className="absolute top-[45%] right-[12%] w-1 h-1 bg-purple-200/70 rounded-full shadow-[0_0_4px_#c084fc] animate-pulse [animation-delay:1.5s]" />
          <div className="absolute top-[80%] right-[35%] w-1.5 h-1.5 bg-amber-300/60 rounded-full shadow-[0_0_5px_#f59e0b] animate-pulse [animation-delay:3s]" />
        </div>
      )}

      {/* 8. Vignette Edge Falloff */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(4,6,10,0.6)_100%)] pointer-events-none" />
    </div>
  );
}
