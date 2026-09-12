import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/profileService';
import AchievementGrid from '../components/AchievementGrid';
import PageTransition from '../components/PageTransition';
import Navbar from '../components/Navbar';
import { SkeletonStatCard } from '../components/skeletons/SkeletonCard';
import {
  Shield,
  Coins,
  Flame,
  Zap,
  Brain,
  Dumbbell,
  Heart,
  Palette,
  Target,
  Sparkles,
  Package,
  User as UserIcon,
  Crown,
} from 'lucide-react';


const ATTRIBUTE_CONFIG = {
  intellect: {
    label: 'Intellect',
    icon: Brain,
    color: 'from-blue-500 to-indigo-500',
    border: 'border-blue-500/30',
    bg: 'bg-blue-950/20',
    text: 'text-blue-400',
  },
  strength: {
    label: 'Strength',
    icon: Dumbbell,
    color: 'from-rose-500 to-red-500',
    border: 'border-rose-500/30',
    bg: 'bg-rose-950/20',
    text: 'text-rose-400',
  },
  vitality: {
    label: 'Vitality',
    icon: Heart,
    color: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-950/20',
    text: 'text-emerald-400',
  },
  creativity: {
    label: 'Creativity',
    icon: Palette,
    color: 'from-purple-500 to-fuchsia-500',
    border: 'border-purple-500/30',
    bg: 'bg-purple-950/20',
    text: 'text-purple-400',
  },
  discipline: {
    label: 'Discipline',
    icon: Target,
    color: 'from-amber-500 to-yellow-500',
    border: 'border-amber-500/30',
    bg: 'bg-amber-950/20',
    text: 'text-amber-400',
  },
};

const RARITY_COLORS = {
  COMMON: 'border-slate-700 bg-slate-800/80 text-slate-300',
  RARE: 'border-sky-500/50 bg-sky-950/40 text-sky-300',
  EPIC: 'border-purple-500/60 bg-purple-950/40 text-purple-300',
  LEGENDARY: 'border-amber-500/60 bg-amber-950/40 text-amber-300',
};

export default function Profile() {
  const { user: authUser, token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('STATS'); // 'STATS' | 'ACHIEVEMENTS' | 'INVENTORY'

  const fetchProfileData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const data = await getProfile(token);
      setProfile(data.profile);
    } catch (err) {
      setError(err.message || 'Failed to load character profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [token]);


  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6 md:p-10 max-w-6xl mx-auto space-y-8">
          <div className="h-44 bg-slate-900/60 border border-slate-800 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error || !profile) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
            <p className="text-rose-400 font-semibold">{error || 'Could not load profile'}</p>
            <button
              onClick={fetchProfileData}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold"
            >
              Retry
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const {
    name,
    email,
    level = 1,
    xp = 0,
    gold = 0,
    totalGoldEarned = 0,
    streak = 0,
    longestStreak = 0,
    attributes = {},
    avatar,
    progression = {},
    completedQuestCount = 0,
    inventory = [],
    achievements = [],
  } = profile;

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[300px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

        {/* Top Navbar */}
        <Navbar activePage="profile" />

        {/* Main Container */}
        <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 z-10">
          {/* ── Character Header (RPG Screen) ──────────────────────── */}
          <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 relative z-10">
              {/* Avatar Frame */}
              <div className="relative shrink-0">
                <div
                  className={`w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl p-1 shadow-2xl flex items-center justify-center ${
                    avatar?.isCustom
                      ? 'bg-gradient-to-br from-purple-500 via-indigo-500 to-amber-500 shadow-purple-500/30'
                      : 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-black'
                  }`}
                >
                  <div className="w-full h-full bg-slate-950 rounded-[18px] sm:rounded-[22px] flex items-center justify-center text-amber-400 relative overflow-hidden">
                    {avatar?.isCustom ? (
                      <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400 animate-pulse" />
                    ) : (
                      <UserIcon className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400" />
                    )}
                    {avatar?.isCustom && (
                      <div className="absolute bottom-1 px-1.5 py-0.5 rounded bg-purple-950/90 border border-purple-500/50 text-[8px] sm:text-[9px] font-extrabold text-purple-300 uppercase tracking-wider">
                        {avatar.rarity}
                      </div>
                    )}
                  </div>
                </div>

                {/* Level Pill floating badge */}
                <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider border-2 border-slate-900 shadow-md">
                  LVL {level}
                </div>
              </div>

              {/* Character Info & Core Stats */}
              <div className="flex-1 text-center md:text-left space-y-3 min-w-0 w-full">
                <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide break-words">{name}</h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                      {avatar?.name || 'Novice Adventurer'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono break-all">{email}</p>
                </div>

                {/* XP Progress toward Next Level */}
                <div className="space-y-1.5 max-w-md mx-auto md:mx-0">
                  <div className="flex justify-between text-xs font-bold gap-2">
                    <span className="text-indigo-300 flex items-center gap-1.5 truncate">
                      <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> LEVEL {level} PROGRESS
                    </span>
                    <span className="text-slate-300 font-mono shrink-0">
                      {progression.currentLevelXP ?? 0}/{progression.xpRequiredForNextLevel ?? 100} XP ({progression.progressPercentage ?? 0}%)
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={progression.progressPercentage ?? 0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Level ${level} XP progress`}
                    className="w-full h-2.5 bg-slate-950 rounded-full p-0.5 border border-indigo-500/30 overflow-hidden"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${progression.progressPercentage ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* Stat Badges Row */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 pt-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-slate-400">Total XP:</span>
                    <span className="text-white font-mono font-bold">{xp}</span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-semibold">
                    <Coins className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span className="text-slate-400">Gold:</span>
                    <span className="text-yellow-300 font-mono font-bold">{gold}</span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-semibold">
                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-slate-400">Lifetime:</span>
                    <span className="text-amber-300 font-mono font-bold">{totalGoldEarned}</span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-semibold">
                    <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="text-slate-400">Streak:</span>
                    <span className="text-orange-400 font-mono font-bold">{streak}d</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">Best:</span>
                    <span className="text-orange-300 font-mono font-bold">{longestStreak}d</span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-semibold">
                    <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="text-slate-400">Quests:</span>
                    <span className="text-sky-300 font-mono font-bold">{completedQuestCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sub-Navigation Tabs ──────────────────────────────── */}
          <div role="tablist" aria-label="Character sections" className="flex items-center border-b border-slate-800 gap-2 sm:gap-6 text-sm font-bold overflow-x-auto no-scrollbar pb-1">
            <button
              role="tab"
              aria-selected={activeTab === 'STATS'}
              aria-controls="stats-tabpanel"
              id="stats-tab"
              onClick={() => setActiveTab('STATS')}
              className={`min-h-[44px] px-2 sm:px-3 pb-3 border-b-2 transition flex items-center gap-2 shrink-0 ${
                activeTab === 'STATS'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" /> Attributes
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'ACHIEVEMENTS'}
              aria-controls="achievements-tabpanel"
              id="achievements-tab"
              onClick={() => setActiveTab('ACHIEVEMENTS')}
              className={`min-h-[44px] px-2 sm:px-3 pb-3 border-b-2 transition flex items-center gap-2 shrink-0 ${
                activeTab === 'ACHIEVEMENTS'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4 shrink-0" /> Achievements ({achievements.filter((a) => a.unlocked).length}/{achievements.length})
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'INVENTORY'}
              aria-controls="inventory-tabpanel"
              id="inventory-tab"
              onClick={() => setActiveTab('INVENTORY')}
              className={`min-h-[44px] px-2 sm:px-3 pb-3 border-b-2 transition flex items-center gap-2 shrink-0 ${
                activeTab === 'INVENTORY'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 shrink-0" /> Inventory ({inventory.length})
            </button>
          </div>

          {/* ── Tab Content ───────────────────────────────────────── */}
          {activeTab === 'STATS' && (
            <motion.div
              role="tabpanel"
              id="stats-tabpanel"
              aria-labelledby="stats-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Character Attributes</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Complete quests across different categories to permanently strengthen your attributes (+5 per quest).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(ATTRIBUTE_CONFIG).map(([key, cfg]) => {
                  const val = attributes[key] || 1;
                  const IconComponent = cfg.icon;

                  return (
                    <div
                      key={key}
                      className={`rounded-2xl border p-5 ${cfg.border} ${cfg.bg} backdrop-blur-sm relative overflow-hidden transition hover:scale-[1.01]`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 ${cfg.text}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{cfg.label}</div>
                            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                              Rank {Math.floor(val / 10) + 1}
                            </div>
                          </div>
                        </div>

                        <div className="text-2xl font-black font-mono text-white">{val}</div>
                      </div>

                      <div className="mt-4 space-y-1">
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                          <div
                            className={`h-full bg-gradient-to-r ${cfg.color} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(100, (val / 100) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'ACHIEVEMENTS' && (
            <motion.div
              role="tabpanel"
              id="achievements-tabpanel"
              aria-labelledby="achievements-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AchievementGrid achievements={achievements} />
            </motion.div>
          )}

          {activeTab === 'INVENTORY' && (
            <motion.div
              role="tabpanel"
              id="inventory-tabpanel"
              aria-labelledby="inventory-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Owned Equipment & Rewards</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cosmetics, avatars, themes, and badges unlocked in the Reward Shop.
                  </p>
                </div>

                <Link
                  to="/rewards"
                  className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" /> Open Reward Shop
                </Link>
              </div>

              {inventory.length === 0 ? (
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-12 text-center space-y-3">
                  <Package className="w-12 h-12 text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-slate-300">Your Inventory is Empty</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Earn Gold by completing daily quests, then visit the Reward Shop to unlock avatars, themes, and badges.
                  </p>
                  <Link
                    to="/rewards"
                    className="inline-block mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
                  >
                    Visit Reward Shop
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventory.map((item) => {
                    const rarityBadge = RARITY_COLORS[item.rarity] || RARITY_COLORS.COMMON;

                    return (
                      <div
                        key={item.itemId}
                        className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3 relative overflow-hidden backdrop-blur-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-amber-400">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${rarityBadge}`}>
                            {item.rarity}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-white">{item.name}</h4>
                          <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <span className="uppercase">{item.type}</span>
                          <span>{new Date(item.purchasedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </PageTransition>
  );
}
