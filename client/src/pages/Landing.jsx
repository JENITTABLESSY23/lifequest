import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Swords, Shield, Zap, Flame, Award, ArrowRight, Sparkles, Scroll, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GameWorldBackground from '../components/GameWorldBackground';

export default function Landing() {
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col relative overflow-hidden select-none">
      {/* 1. Global Atmospheric World Background */}
      <GameWorldBackground />

      {/* 2. Top Title Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-indigo-600/30 border border-amber-500/40 rounded-xl text-amber-400 shadow-md shadow-amber-500/10">
            <Swords className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-widest font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 leading-none">
              LIFEQUEST
            </span>
            <span className="text-[10px] font-mono tracking-widest text-indigo-300/80 font-bold uppercase mt-0.5">
              The Realm of You
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center gap-2 text-xs sm:text-sm tracking-wider uppercase min-h-[44px]"
            >
              <span>Enter Realm</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2.5 text-slate-300 hover:text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition min-h-[44px] flex items-center"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center gap-2 text-xs sm:text-sm tracking-wider uppercase min-h-[44px]"
              >
                <span>Enter The Realm</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 3. Hero Title Screen */}
      <main className="flex-1 max-w-5xl mx-auto px-6 flex flex-col justify-center items-center text-center py-12 sm:py-16 md:py-20 z-10">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="space-y-6 max-w-3xl"
        >
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/40 text-xs font-mono font-bold tracking-widest text-indigo-300 uppercase shadow-lg shadow-indigo-950/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span>Single-Player Life RPG</span>
          </div>

          {/* Epic Main Titles */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-wider text-white font-cinzel leading-tight">
              LIFEQUEST
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest uppercase bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent font-cinzel">
              THE REALM OF YOU
            </h2>
          </div>

          {/* Lore Quotation */}
          <p className="text-lg sm:text-xl md:text-2xl text-slate-200 italic font-medium">
            &ldquo;Turn your everyday goals into a game.&rdquo;
          </p>

          {/* RPG Manifesto */}
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Forge quests from the challenges of real life. Complete them. Grow stronger. Build your character across Strength, Intellect, Vitality, Creativity, and Discipline.
          </p>

          {/* Game CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base tracking-widest uppercase rounded-xl shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 min-h-[48px]"
            >
              <Swords className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
              <span>[ ENTER THE REALM ]</span>
            </Link>

            {!user && (
              <Link
                to="/login"
                className="w-full sm:w-auto px-7 py-4 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 text-slate-200 font-bold text-sm sm:text-base tracking-wider uppercase rounded-xl transition flex items-center justify-center gap-2 min-h-[48px]"
              >
                <span>Login to Hero</span>
              </Link>
            )}
          </div>
        </motion.div>

        {/* 4. Three Pillar Realms (Cards) */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16 sm:mt-20 text-left w-full"
        >
          {/* Card 1 */}
          <div className="game-panel p-6 hover:border-amber-500/40 transition-colors">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 w-fit mb-4">
              <Scroll className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2 font-cinzel">
              ⚔ The Quest Board
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Transform real tasks into ranked challenges. Earn server-authoritative XP and Gold with every heroic completion.
            </p>
          </div>

          {/* Card 2 */}
          <div className="game-panel p-6 hover:border-indigo-500/40 transition-colors">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 w-fit mb-4">
              <Shield className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2 font-cinzel">
              🧙 Character Codex
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Ascend levels and build real-life attributes: Intellect, Strength, Vitality, Creativity, and Discipline.
            </p>
          </div>

          {/* Card 3 */}
          <div className="game-panel p-6 hover:border-yellow-500/40 transition-colors">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 w-fit mb-4">
              <ShoppingBag className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2 font-cinzel">
              🪙 Treasure Vault
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Spend hard-earned Gold to acquire legendary avatars, mystical themes, and profile badges.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900/80 py-6 text-center text-xs text-slate-500 z-10">
        <p className="font-mono">© {new Date().getFullYear()} LIFEQUEST — THE REALM OF YOU. Turn your everyday goals into a game.</p>
      </footer>
    </div>
  );
}
