import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Swords, Shield, Coins, Zap,
  Brain, Dumbbell, Heart, Palette, Target, ArrowRight, TrendingUp, Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { questService } from '../services/questService';
import StreakCard from '../components/StreakCard';
import PageTransition from '../components/PageTransition';
import Navbar from '../components/Navbar';
import GameHUD from '../components/GameHUD';
import GameWorldBackground from '../components/GameWorldBackground';

// Mirror of the server-side progression formula (read-only display)
function getProgressionStats(totalXP) {
  const getLevelThreshold = (n) => Math.round(100 * Math.pow(n, 1.5));
  const safeXP = Math.max(0, Math.floor(Number(totalXP) || 0));

  let level = 1;
  while (safeXP >= getLevelThreshold(level)) level++;

  const prevLevelXP = level === 1 ? 0 : getLevelThreshold(level - 1);
  const nextLevelXP = getLevelThreshold(level);
  const currentLevelXP = safeXP - prevLevelXP;
  const xpRequired = nextLevelXP - prevLevelXP;
  const progressPct = Math.min(100, Math.max(0, Math.round((currentLevelXP / (xpRequired || 1)) * 100)));

  return { level, totalXP: safeXP, currentLevelXP, xpRequired, progressPct };
}

export default function DashboardPlaceholder() {
  const { user, token } = useAuth();
  const [activity, setActivity] = useState([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    let isMounted = true;
    async function loadActivity() {
      if (!token) return;
      try {
        const data = await questService.getActivity(token);
        if (isMounted && data.activity) {
          setActivity(data.activity);
        }
      } catch (err) {
        console.error('Failed to load activity:', err);
      }
    }
    loadActivity();
    return () => {
      isMounted = false;
    };
  }, [token, user?.streak]);

  const progressStats = user ? getProgressionStats(user.xp ?? 0) : null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col relative overflow-hidden select-none">
        {/* 1. Global Atmospheric World Background */}
        <GameWorldBackground />

        {/* 2. Top Realm Navigation */}
        <Navbar activePage="dashboard" />

        {/* 3. Persistent Global Game HUD */}
        <GameHUD />

        {/* 4. Main Realm Chamber */}
        <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 z-10">

          {/* Welcome Realm Banner with CTA */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="game-panel p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest">
                <Shield className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span>Realm Chamber</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white font-cinzel tracking-wider">
                THE REALM
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm font-medium">
                Your journey continues, <span className="text-amber-300 font-bold">{user?.name}</span>. Forge and complete quests to conquer your everyday goals.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/quests"
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center gap-2 text-xs sm:text-sm tracking-wider uppercase font-mono min-h-[44px]"
              >
                <Swords className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                <span>[ VENTURE TO QUESTS ]</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>

          {/* Top Grid: Ascension Progress & Daily Streak */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ascension Progress Card */}
            {progressStats && (
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="game-panel p-6 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-black text-white uppercase tracking-wider font-cinzel flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" aria-hidden="true" />
                      <span>Ascension Progress</span>
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 font-bold uppercase">
                      RANK
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-semibold my-4">
                    <span className="flex items-center gap-1.5 text-amber-300 font-black text-xl font-mono">
                      <Shield className="w-5 h-5 text-amber-400" aria-hidden="true" />
                      <span>LEVEL {progressStats.level}</span>
                    </span>
                    <span className="text-purple-300 flex items-center gap-1 font-mono text-xs sm:text-sm font-bold">
                      <Zap className="w-4 h-4" aria-hidden="true" />
                      <span>{progressStats.currentLevelXP} / {progressStats.xpRequired} XP</span>
                    </span>
                  </div>

                  {/* XP Progress Bar */}
                  <div
                    role="progressbar"
                    aria-valuenow={progressStats.progressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Level ${progressStats.level} XP progress`}
                    className="h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-purple-900/50"
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-amber-400 rounded-full shadow-sm"
                      initial={shouldReduceMotion ? false : { width: 0 }}
                      animate={{ width: `${progressStats.progressPct}%` }}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-800/80">
                  <span>{progressStats.progressPct}% towards Level {progressStats.level + 1}</span>
                  <span className="text-purple-300 font-bold">{progressStats.totalXP} Total Lifetime XP</span>
                </div>
              </motion.div>
            )}

            {/* Daily Streak Card with 7-Day MongoDB Activity */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <StreakCard
                streak={user?.streak ?? 0}
                longestStreak={user?.longestStreak ?? 0}
                activity={activity}
              />
            </motion.div>
          </div>

          {/* Attributes Matrix & Quick Realm Stats */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Attributes Matrix */}
            <div className="game-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-white uppercase tracking-wider font-cinzel flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                  <span>Character Attributes Matrix</span>
                </h2>
                <span className="text-[10px] font-mono text-slate-500">LIVE STATS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-mono">
                <div className="p-3 bg-slate-950/70 border border-sky-500/20 rounded-xl flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase">
                    <Brain className="w-4 h-4 text-sky-400" aria-hidden="true" />
                    <span>Intellect</span>
                  </span>
                  <span className="font-black text-sky-400 text-sm">{user?.attributes?.intellect ?? 1}</span>
                </div>

                <div className="p-3 bg-slate-950/70 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase">
                    <Dumbbell className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    <span>Strength</span>
                  </span>
                  <span className="font-black text-emerald-400 text-sm">{user?.attributes?.strength ?? 1}</span>
                </div>

                <div className="p-3 bg-slate-950/70 border border-rose-500/20 rounded-xl flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase">
                    <Heart className="w-4 h-4 text-rose-400" aria-hidden="true" />
                    <span>Vitality</span>
                  </span>
                  <span className="font-black text-rose-400 text-sm">{user?.attributes?.vitality ?? 1}</span>
                </div>

                <div className="p-3 bg-slate-950/70 border border-purple-500/20 rounded-xl flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase">
                    <Palette className="w-4 h-4 text-purple-400" aria-hidden="true" />
                    <span>Creativity</span>
                  </span>
                  <span className="font-black text-purple-400 text-sm">{user?.attributes?.creativity ?? 1}</span>
                </div>

                <div className="p-3 bg-slate-950/70 border border-amber-500/20 rounded-xl flex items-center justify-between sm:col-span-2">
                  <span className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase">
                    <Target className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    <span>Discipline</span>
                  </span>
                  <span className="font-black text-amber-400 text-sm">{user?.attributes?.discipline ?? 1}</span>
                </div>
              </div>
            </div>

            {/* Quick Realm Standing */}
            <div className="game-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-white uppercase tracking-wider font-cinzel flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span>Realm Standing</span>
                </h2>
                <span className="text-[10px] font-mono text-slate-500">AUTHORITATIVE</span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Level</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">{user?.level ?? 1}</div>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total XP</div>
                  <div className="text-2xl font-black text-purple-400 mt-1">{user?.xp ?? 0}</div>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                    <Coins className="w-3 h-3 text-yellow-400" /> Gold
                  </div>
                  <div className="text-2xl font-black text-yellow-400">{user?.gold ?? 100}</div>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">To Next Level</div>
                  <div className="text-lg font-black text-slate-300 mt-1">
                    {progressStats ? `${progressStats.xpRequired - progressStats.currentLevelXP} XP` : '—'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
}
