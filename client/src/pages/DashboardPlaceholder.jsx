import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Swords, Shield, Coins, Zap,
  Brain, Dumbbell, Heart, Palette, Target, ArrowRight, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { questService } from '../services/questService';
import StreakCard from '../components/StreakCard';
import PageTransition from '../components/PageTransition';
import Navbar from '../components/Navbar';

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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

        {/* Top Navbar */}
        <Navbar activePage="dashboard" />

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 z-10">

          {/* Welcome Header with CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
                <Shield className="w-4 h-4" /> Adventurer Authenticated
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                Greetings, {user?.name}!
              </h1>
              <p className="text-slate-400 text-sm">
                Complete quests to earn XP, Gold, build your streak, and grow your character.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/quests"
                className="px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
              >
                <Swords className="w-5 h-5" /> Open Quest Log <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Top Grid: XP Progression & Daily Streak */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* XP Progress Card */}
            {progressStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" /> XP Progression
                  </h2>

                  <div className="flex items-center justify-between text-sm font-semibold my-4">
                    <span className="flex items-center gap-1.5 text-amber-400 font-black text-xl">
                      <Shield className="w-5 h-5" /> Level {progressStats.level}
                    </span>
                    <span className="text-purple-400 flex items-center gap-1 font-mono">
                      <Zap className="w-4 h-4" />
                      {progressStats.currentLevelXP} / {progressStats.xpRequired} XP
                    </span>
                  </div>

                  {/* XP Progress Bar */}
                  <div
                    role="progressbar"
                    aria-valuenow={progressStats.progressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Level ${progressStats.level} XP progress`}
                    className="h-3 bg-slate-800 rounded-full overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressStats.progressPct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>

                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-2">
                  <span>{progressStats.progressPct}% to Level {progressStats.level + 1}</span>
                  <span>{progressStats.totalXP} total XP earned</span>
                </div>
              </motion.div>
            )}

            {/* Daily Streak Card with 7-Day MongoDB Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
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

          {/* Attributes & Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Attributes */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" /> Character Attributes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-300">
                    <Brain className="w-4 h-4 text-sky-400" /> Intellect
                  </span>
                  <span className="font-bold text-sky-400">{user?.attributes?.intellect ?? 1}</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-300">
                    <Dumbbell className="w-4 h-4 text-emerald-400" /> Strength
                  </span>
                  <span className="font-bold text-emerald-400">{user?.attributes?.strength ?? 1}</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-300">
                    <Heart className="w-4 h-4 text-rose-400" /> Vitality
                  </span>
                  <span className="font-bold text-rose-400">{user?.attributes?.vitality ?? 1}</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-300">
                    <Palette className="w-4 h-4 text-purple-400" /> Creativity
                  </span>
                  <span className="font-bold text-purple-400">{user?.attributes?.creativity ?? 1}</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between sm:col-span-2">
                  <span className="flex items-center gap-2 text-slate-300">
                    <Target className="w-4 h-4 text-amber-400" /> Discipline
                  </span>
                  <span className="font-bold text-amber-400">{user?.attributes?.discipline ?? 1}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> Current Progression
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
                  <div className="text-xs text-slate-400 uppercase font-bold">Level</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">{user?.level ?? 1}</div>
                </div>
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
                  <div className="text-xs text-slate-400 uppercase font-bold">Total XP</div>
                  <div className="text-2xl font-black text-purple-400 mt-1">{user?.xp ?? 0}</div>
                </div>
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-400 uppercase font-bold mb-1">
                    <Coins className="w-3.5 h-3.5 text-yellow-400" /> Gold
                  </div>
                  <div className="text-2xl font-black text-yellow-400">{user?.gold ?? 100}</div>
                </div>
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
                  <div className="text-xs text-slate-400 uppercase font-bold">Next Level</div>
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
