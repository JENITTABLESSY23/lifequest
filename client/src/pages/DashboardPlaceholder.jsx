import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Swords, Shield, Coins, Zap, Flame, Sparkles, Trophy,
  Brain, Dumbbell, Heart, Palette, Target, ArrowRight, TrendingUp,
  User as UserIcon, Scroll, ShoppingBag, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { questService } from '../services/questService';
import { getProfile } from '../services/profileService';
import StreakCard from '../components/StreakCard';
import PageTransition from '../components/PageTransition';
import Navbar from '../components/Navbar';
import GameHUD from '../components/GameHUD';
import GameWorldBackground from '../components/GameWorldBackground';
import { CATEGORY_CONFIG, DIFFICULTY_CONFIG } from '../components/QuestCard';

// Difficulty weight for deterministic Phase 6 featured challenge tie-break
const DIFFICULTY_WEIGHT = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  EPIC: 4,
};

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

// 5 Canonical RPG Character Attributes
const ATTRIBUTES = [
  { id: 'intellect', label: 'INTELLECT', glyph: '🧠', tag: 'INT', color: 'text-sky-300', border: 'border-sky-500/30 bg-sky-950/40', accent: 'text-sky-400' },
  { id: 'strength', label: 'STRENGTH', glyph: '💪', tag: 'STR', color: 'text-rose-300', border: 'border-rose-500/30 bg-rose-950/40', accent: 'text-rose-400' },
  { id: 'vitality', label: 'VITALITY', glyph: '❤️', tag: 'VIT', color: 'text-emerald-300', border: 'border-emerald-500/30 bg-emerald-950/40', accent: 'text-emerald-400' },
  { id: 'creativity', label: 'CREATIVITY', glyph: '🎨', tag: 'CRE', color: 'text-purple-300', border: 'border-purple-500/30 bg-purple-950/40', accent: 'text-purple-400' },
  { id: 'discipline', label: 'DISCIPLINE', glyph: '🔥', tag: 'DIS', color: 'text-amber-300', border: 'border-amber-500/30 bg-amber-950/40', accent: 'text-amber-400' },
];

export default function DashboardPlaceholder() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [activity, setActivity] = useState([]);
  const [quests, setQuests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load authoritative realm data concurrently
  useEffect(() => {
    let isMounted = true;
    async function loadRealmData() {
      if (!token) return;
      try {
        setLoading(true);
        const [activityRes, questsRes, profileRes] = await Promise.all([
          questService.getActivity(token).catch(() => ({ activity: [] })),
          questService.getQuests(token).catch(() => ({ quests: [] })),
          getProfile(token).catch(() => ({ profile: null })),
        ]);

        if (isMounted) {
          if (activityRes?.activity) setActivity(activityRes.activity);
          if (questsRes?.quests) setQuests(questsRes.quests);
          if (profileRes?.profile) setProfile(profileRes.profile);
        }
      } catch (err) {
        console.error('[The Realm] Error loading game data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRealmData();
    return () => {
      isMounted = false;
    };
  }, [token, user?.streak, user?.xp]);

  // Read-only server-authoritative progression stats
  const progressStats = user ? getProgressionStats(user.xp ?? 0) : null;
  const level = user?.level || progressStats?.level || 1;

  // Active incomplete quests (up to 3)
  const activeQuests = useMemo(() => {
    return quests.filter((q) => !q.completed).slice(0, 3);
  }, [quests]);

  // Phase 6 Deterministic Featured Challenge
  const featuredQuest = useMemo(() => {
    const incomplete = quests.filter((q) => !q.completed);
    if (incomplete.length === 0) return null;

    return [...incomplete].sort((a, b) => {
      const diffA = DIFFICULTY_WEIGHT[a.difficulty] || 2;
      const diffB = DIFFICULTY_WEIGHT[b.difficulty] || 2;
      if (diffB !== diffA) return diffB - diffA;

      const xpA = Number(a.xpReward) || 0;
      const xpB = Number(b.xpReward) || 0;
      if (xpB !== xpA) return xpB - xpA;

      const goldA = Number(a.goldReward) || 0;
      const goldB = Number(b.goldReward) || 0;
      if (goldB !== goldA) return goldB - goldA;

      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;

      return (b.id || '').localeCompare(a.id || '');
    })[0];
  }, [quests]);

  // Phase 7 Quest Journey Progression Statistics
  const journeyStats = useMemo(() => {
    const total = quests.length;
    const completed = quests.filter((q) => q.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [quests]);

  const avatar = profile?.avatar;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col relative overflow-hidden select-none">
        {/* 1. Atmospheric World Background */}
        <GameWorldBackground />

        {/* 2. Realm Navigation Bar */}
        <Navbar activePage="dashboard" />

        {/* 3. Global Persistent Game HUD */}
        <GameHUD />

        {/* 4. Main Character-First Realm Chamber */}
        <main
          id="main-content"
          className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-8 sm:space-y-10 z-10"
        >
          {/* ========================================================== */}
          {/* 1. CHARACTER CENTERPIECE — THE HERO SANCTUM               */}
          {/* ========================================================== */}
          <motion.section
            aria-label="Character Centerpiece"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="game-panel game-panel-highlight p-6 sm:p-8 md:p-10 relative overflow-hidden"
          >
            {/* Ambient Celestial Glows behind Character */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-64 bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 right-10 w-72 h-48 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              {/* Sanctum Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
                <Shield className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span>The Realm Sanctum</span>
              </div>

              {/* Character Avatar Frame */}
              <div className="relative">
                <div
                  className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl p-1.5 shadow-2xl flex items-center justify-center transition-all ${
                    avatar?.isCustom
                      ? 'bg-gradient-to-br from-purple-500 via-indigo-500 to-amber-500 shadow-purple-900/40'
                      : 'bg-gradient-to-br from-indigo-500/40 via-amber-500/30 to-purple-500/40 shadow-indigo-950/60'
                  }`}
                >
                  <div className="w-full h-full bg-[#090D16] rounded-[22px] sm:rounded-[26px] flex flex-col items-center justify-center text-amber-400 relative overflow-hidden border border-slate-800">
                    {avatar?.isCustom ? (
                      <Sparkles className="w-10 h-10 sm:w-14 sm:h-14 text-purple-400 animate-pulse" aria-hidden="true" />
                    ) : (
                      <UserIcon className="w-10 h-10 sm:w-14 sm:h-14 text-indigo-300" aria-hidden="true" />
                    )}

                    {avatar?.name && (
                      <span className="text-[9px] sm:text-[10px] font-mono font-black text-purple-300 uppercase tracking-wider mt-1 px-2 text-center truncate max-w-full">
                        {avatar.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Level Pill Badge */}
                <div
                  className="absolute -bottom-2 -right-2 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm font-mono tracking-wider border-2 border-slate-900 shadow-xl"
                  aria-label={`Character Level ${level}`}
                >
                  LVL {level}
                </div>
              </div>

              {/* Character Name & RPG Title */}
              <div className="space-y-1 max-w-xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-cinzel tracking-wider leading-tight">
                  {user?.name || 'Adventurer'}
                </h1>
                <p className="text-xs sm:text-sm font-mono text-amber-300/90 font-bold uppercase tracking-widest">
                  Questing Hero • Real-Life Adventurer
                </p>
                <p className="text-xs sm:text-sm text-slate-400 italic font-medium pt-1">
                  &ldquo;Your journey begins here. Transform your everyday goals into a game.&rdquo;
                </p>
              </div>

              {/* Ascension Progress & XP Bar */}
              {progressStats && (
                <div className="w-full max-w-lg space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-bold">
                    <span className="flex items-center gap-1.5 text-purple-300 uppercase tracking-wider">
                      <Zap className="w-4 h-4 text-purple-400" aria-hidden="true" />
                      <span>Level {progressStats.level} Ascension</span>
                    </span>
                    <span className="text-slate-300 font-bold">
                      {progressStats.currentLevelXP} / {progressStats.xpRequired} XP
                      <span className="text-amber-400 ml-1.5">({progressStats.progressPct}%)</span>
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-valuenow={progressStats.progressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Level ${level} XP progress`}
                    className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-purple-900/40 shadow-inner"
                  >
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-amber-400 shadow-sm"
                      initial={shouldReduceMotion ? false : { width: 0 }}
                      animate={{ width: `${progressStats.progressPct}%` }}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
                    <span>{progressStats.xpRequired - progressStats.currentLevelXP} XP to Level {progressStats.level + 1}</span>
                    <span className="text-purple-400/90 font-bold">{progressStats.totalXP} Total Lifetime XP</span>
                  </div>
                </div>
              )}

              {/* Quick Resources HUD */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 font-mono text-xs sm:text-sm">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/80 border border-amber-500/30 text-yellow-300 font-black shadow-md">
                  <Coins className="w-4 h-4 text-yellow-400 shrink-0" aria-hidden="true" />
                  <span>{user?.gold ?? 0}</span>
                  <span className="text-[10px] text-amber-400/80 font-bold uppercase">GOLD</span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/80 border border-amber-600/30 text-amber-400 font-black shadow-md">
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20 shrink-0" aria-hidden="true" />
                  <span>{user?.streak ?? 0}</span>
                  <span className="text-[10px] text-amber-500/80 font-bold uppercase">
                    DAY{user?.streak === 1 ? '' : 'S'} STREAK
                  </span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-indigo-300 font-black shadow-md">
                  <Trophy className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
                  <span>{journeyStats.completed}</span>
                  <span className="text-[10px] text-indigo-400/80 font-bold uppercase">CONQUERED</span>
                </div>
              </div>

              {/* Game Home Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <Link
                  to="/quests"
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-xs sm:text-sm tracking-wider uppercase font-mono min-h-[44px]"
                >
                  <Swords className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>[ ⚔ ENTER QUEST BOARD ]</span>
                </Link>

                <Link
                  to="/rewards"
                  className="px-5 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400/50 text-amber-300 font-bold rounded-xl transition flex items-center gap-2 text-xs sm:text-sm tracking-wider uppercase font-mono min-h-[44px]"
                >
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  <span>Visit Shop</span>
                </Link>

                <Link
                  to="/profile"
                  className="px-5 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-indigo-500/30 hover:border-indigo-400/50 text-indigo-300 font-bold rounded-xl transition flex items-center gap-2 text-xs sm:text-sm tracking-wider uppercase font-mono min-h-[44px]"
                >
                  <Shield className="w-4 h-4" aria-hidden="true" />
                  <span>Character Codex</span>
                </Link>
              </div>
            </div>
          </motion.section>

          {/* ========================================================== */}
          {/* 2. CHARACTER ATTRIBUTES CONSTELLATION / MATRIX              */}
          {/* ========================================================== */}
          <section aria-label="Character Attributes" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-cinzel tracking-wider flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-indigo-400" aria-hidden="true" />
                  <span>CHARACTER ATTRIBUTES</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Live progression across your real-life core domains. Completed quests boost these stats.
                </p>
              </div>
              <Link
                to="/quests"
                className="text-xs font-mono text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider hidden sm:inline-flex items-center gap-1"
              >
                <span>Level up in quests →</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {ATTRIBUTES.map((attr) => {
                const score = user?.attributes?.[attr.id] ?? 1;
                const rank = Math.floor(score / 10) + 1;

                return (
                  <Link
                    key={attr.id}
                    to="/quests"
                    aria-label={`${attr.label}: Score ${score}, Rank ${rank}`}
                    className={`game-panel p-4 flex flex-col justify-between gap-3 min-h-[110px] group transition-all hover:scale-[1.02] hover:border-amber-400/40`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl leading-none" aria-hidden="true">{attr.glyph}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-400 font-bold">
                        Rank {rank}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className={`text-xs font-mono font-black tracking-wider uppercase block ${attr.color}`}>
                        {attr.label}
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl sm:text-2xl font-mono font-black text-white">
                          {score}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          PTS
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ========================================================== */}
          {/* 3. FEATURED CHALLENGE & ACTIVE QUESTS PREVIEW               */}
          {/* ========================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Featured Next Challenge (1 column) */}
            <section aria-label="Featured Challenge Preview" className="space-y-3 lg:col-span-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white font-cinzel uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span>YOUR NEXT CHALLENGE</span>
                </h3>
              </div>

              {featuredQuest ? (
                <div className="game-panel game-panel-highlight p-5 space-y-4 flex flex-col justify-between min-h-[220px]">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-black uppercase tracking-wider">
                        PRIORITY QUEST
                      </span>
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        {DIFFICULTY_CONFIG[featuredQuest.difficulty]?.stars || '★'} {featuredQuest.difficulty}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white tracking-tight leading-snug break-words">
                      {featuredQuest.title}
                    </h4>

                    {featuredQuest.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {featuredQuest.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center gap-3 text-xs font-mono font-bold">
                      <span className="text-purple-300 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-purple-400" /> +{featuredQuest.xpReward} XP
                      </span>
                      <span className="text-yellow-300 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-yellow-400" /> +{featuredQuest.goldReward} GOLD
                      </span>
                    </div>

                    <Link
                      to="/quests"
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider font-mono transition flex items-center justify-center gap-1.5 min-h-[40px]"
                    >
                      <Swords className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                      <span>[ CONQUER CHALLENGE ]</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="game-panel p-5 text-center space-y-3 flex flex-col justify-center items-center min-h-[220px]">
                  <Trophy className="w-8 h-8 text-emerald-400" aria-hidden="true" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">
                      All Challenges Mastered!
                    </h4>
                    <p className="text-xs text-slate-400">
                      No pending quests. Inscribe a new challenge on the Quest Board to keep progressing.
                    </p>
                  </div>
                  <Link
                    to="/quests"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-lg transition min-h-[40px] flex items-center gap-1.5"
                  >
                    <span>Open Quest Board</span>
                  </Link>
                </div>
              )}
            </section>

            {/* Right: Active Quests Preview (2 columns) */}
            <section aria-label="Active Quests" className="space-y-3 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white font-cinzel uppercase tracking-wider flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                  <span>ACTIVE QUESTS ({activeQuests.length})</span>
                </h3>
                <Link
                  to="/quests"
                  className="text-xs font-mono text-indigo-300 hover:text-white font-bold uppercase tracking-wider"
                >
                  View All Quests →
                </Link>
              </div>

              {activeQuests.length > 0 ? (
                <div className="space-y-2.5">
                  {activeQuests.map((quest) => {
                    const catConfig = CATEGORY_CONFIG[quest.category];
                    const diffConfig = DIFFICULTY_CONFIG[quest.difficulty];
                    const CategoryIcon = catConfig?.icon || Swords;

                    return (
                      <div
                        key={quest.id || quest._id}
                        className="game-panel p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-950 border border-slate-800 text-slate-300">
                              <CategoryIcon className="w-3 h-3" aria-hidden="true" />
                              <span>{quest.category}</span>
                            </span>
                            <span className="text-[10px] font-mono font-bold text-amber-400">
                              {diffConfig?.stars || '★'} {quest.difficulty}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                            {quest.title}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold">
                            <span className="text-purple-300">+{quest.xpReward} XP</span>
                            <span className="text-yellow-300">+{quest.goldReward} G</span>
                          </div>

                          <Link
                            to="/quests"
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-indigo-500/40 text-indigo-200 hover:text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition min-h-[38px] flex items-center gap-1"
                          >
                            <span>Enter</span>
                            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="game-panel p-6 text-center space-y-2 flex flex-col justify-center items-center min-h-[220px]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" aria-hidden="true" />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider font-cinzel">
                    No Active Quests
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Inscribe your next challenge to build momentum and ascend character levels.
                  </p>
                  <Link
                    to="/quests"
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition min-h-[40px] flex items-center gap-1.5 mt-2"
                  >
                    <Swords className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                    <span>Forge New Quest</span>
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* ========================================================== */}
          {/* 4. JOURNEY PROGRESS PREVIEW & DAILY REALM STREAK           */}
          {/* ========================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Journey Progress Preview */}
            <section aria-label="Journey Progress Preview" className="game-panel p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-black text-white font-cinzel uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    <span>QUEST JOURNEY PROGRESS</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                    {journeyStats.percentage}% BOARD CONQUERED
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-bold my-3">
                  <span className="text-slate-300">
                    <span className="text-amber-400 font-black text-base">{journeyStats.completed}</span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span className="text-white font-black text-base">{journeyStats.total}</span>
                    <span className="ml-2 text-slate-400 text-xs">QUESTS MASTERED</span>
                  </span>
                  <span className="text-emerald-400 font-black text-base">
                    {journeyStats.percentage}%
                  </span>
                </div>

                {/* Horizontal Progress Bar */}
                <div
                  role="progressbar"
                  aria-valuenow={journeyStats.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Overall quest journey completion"
                  className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800"
                >
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400"
                    initial={shouldReduceMotion ? false : { width: 0 }}
                    animate={{ width: `${journeyStats.percentage}%` }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Full quest analytics & category stats
                </span>
                <Link
                  to="/quests"
                  className="text-xs font-mono text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <span>View Quest Board →</span>
                </Link>
              </div>
            </section>

            {/* Daily Streak Activity Card */}
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
        </main>
      </div>
    </PageTransition>
  );
}
