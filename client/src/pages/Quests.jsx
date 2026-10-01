import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Plus, Shield, Filter, Zap, Coins,
  TrendingUp, Flame, Scroll, Target, CheckCircle2,
  Brain, Dumbbell, Heart, Palette, Sparkles,
  Search, X, ArrowUpDown, RotateCcw, SearchX,
  Trophy, Check, Loader2, Calendar, ArrowRight, Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { questService } from '../services/questService';
import QuestCard, { CATEGORY_CONFIG, DIFFICULTY_CONFIG } from '../components/QuestCard';
import QuestFormModal from '../components/QuestFormModal';
import QuestCompletionModal from '../components/QuestCompletionModal';
import LevelUpModal from '../components/LevelUpModal';
import StreakMilestoneModal from '../components/StreakMilestoneModal';
import AchievementUnlockModal from '../components/AchievementUnlockModal';
import PageTransition from '../components/PageTransition';
import FloatingFeedback from '../components/FloatingFeedback';
import { SkeletonQuestCard } from '../components/skeletons/SkeletonCard';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';

// Difficulty weight for deterministic sorting: EASY < MEDIUM < HARD < EPIC
const DIFFICULTY_WEIGHT = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  EPIC: 4,
};

// Quick attribute navigation shortcut items
const ATTRIBUTE_SHORTCUTS = [
  { id: 'INTELLECT', label: 'INTELLECT', glyph: '🧠', tag: 'INT', color: 'text-sky-300', activeStyle: 'border-sky-400 bg-sky-950/80 ring-2 ring-sky-500/40 shadow-sky-950/60 text-sky-200' },
  { id: 'STRENGTH', label: 'STRENGTH', glyph: '💪', tag: 'STR', color: 'text-rose-300', activeStyle: 'border-rose-400 bg-rose-950/80 ring-2 ring-rose-500/40 shadow-rose-950/60 text-rose-200' },
  { id: 'VITALITY', label: 'VITALITY', glyph: '❤️', tag: 'VIT', color: 'text-emerald-300', activeStyle: 'border-emerald-400 bg-emerald-950/80 ring-2 ring-emerald-500/40 shadow-emerald-950/60 text-emerald-200' },
  { id: 'CREATIVITY', label: 'CREATIVITY', glyph: '🎨', tag: 'CRE', color: 'text-purple-300', activeStyle: 'border-purple-400 bg-purple-950/80 ring-2 ring-purple-500/40 shadow-purple-950/60 text-purple-200' },
  { id: 'DISCIPLINE', label: 'DISCIPLINE', glyph: '🔥', tag: 'DIS', color: 'text-amber-300', activeStyle: 'border-amber-400 bg-amber-950/80 ring-2 ring-amber-500/40 shadow-amber-950/60 text-amber-200' },
];

// Client-side progression stats helper (mirrors server logic)
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

export default function Quests() {
  const { user, token, updateUser } = useAuth();
  const toast = useToast();

  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Discovery, Filter & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);

  // Floating Indicators State
  const [floatingFeedback, setFloatingFeedback] = useState(null);

  // In-flight action locks to prevent duplicate rapid requests
  const [processingQuestIds, setProcessingQuestIds] = useState(new Set());

  // Celebration queue to avoid overlapping modals
  const [celebrationQueue, setCelebrationQueue] = useState([]);
  const [activeCelebration, setActiveCelebration] = useState(null);

  const processNextCelebration = (queue) => {
    if (!queue || queue.length === 0) {
      setActiveCelebration(null);
      return;
    }
    const [next, ...rest] = queue;
    setCelebrationQueue(rest);
    setActiveCelebration(next);
  };

  const closeActiveCelebration = () => {
    processNextCelebration(celebrationQueue);
  };

  const fetchQuests = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await questService.getQuests(token);
      if (data.quests) setQuests(data.quests);
    } catch (err) {
      console.error('[Quests Page] Error fetching quests:', err.message);
      setError(err.message || 'Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, [token]);

  const handleCreateQuest = async (questData) => {
    try {
      const data = await questService.createQuest(questData, token);
      if (data.quest) {
        setQuests((prev) => [data.quest, ...prev]);
        toast.success('⚔ QUEST FORGED!', `"${data.quest.title}" added to your log.`);
        return data.quest;
      }
    } catch (err) {
      toast.error('Failed to create quest', err.message);
      throw err;
    }
  };

  const handleUpdateQuest = async (questData) => {
    if (!editingQuest) return;
    try {
      const data = await questService.updateQuest(editingQuest.id, questData, token);
      if (data.quest) {
        setQuests((prev) => prev.map((q) => (q.id === data.quest.id ? data.quest : q)));
        toast.info('Quest Updated', `Changes saved to "${data.quest.title}".`);
        return data.quest;
      }
    } catch (err) {
      toast.error('Failed to update quest', err.message);
      throw err;
    }
  };

  const handleDeleteQuest = async (id) => {
    if (processingQuestIds.has(id)) return;
    setProcessingQuestIds((prev) => new Set(prev).add(id));
    try {
      await questService.deleteQuest(id, token);
      setQuests((prev) => prev.filter((q) => q.id !== id));
      toast.info('Quest Removed', 'Quest was deleted from your log.');
    } catch (err) {
      toast.error('Failed to delete quest', err.message);
    } finally {
      setProcessingQuestIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleCompleteQuest = async (id) => {
    if (processingQuestIds.has(id)) return;
    setProcessingQuestIds((prev) => new Set(prev).add(id));
    try {
      const data = await questService.completeQuest(id, token);
      if (data.quest) {
        setQuests((prev) => prev.map((q) => (q.id === data.quest.id ? data.quest : q)));
        if (data.user) updateUser(data.user);
        const progression = data.progression || {};
        const streakInfo = data.streak || {};
        const milestone = data.milestone || {};
        const unlockedAchievements = data.unlockedAchievements || [];

        toast.reward({
          title: data.quest.title,
          xp: progression.xpGained ?? data.quest.xpReward,
          gold: progression.goldGained ?? data.quest.goldReward,
          attribute: progression.attributeKey || progression.attribute,
          attributeIncrease: 5,
          streakIncreased: streakInfo.increased,
        });

        setFloatingFeedback({
          xp: progression.xpGained ?? data.quest.xpReward,
          gold: progression.goldGained ?? data.quest.goldReward,
          attribute: progression.attributeKey || progression.attribute,
          attributeIncrease: 5,
          streakIncreased: streakInfo.increased,
        });

        // Enqueue sequential celebrations without overlapping modals
        const queue = [
          {
            type: 'QUEST_COMPLETE',
            data: {
              quest: data.quest,
              progression,
              streak: streakInfo,
              milestone,
              unlockedAchievements,
            },
          },
        ];
        if (milestone.unlocked) queue.push({ type: 'MILESTONE', data: milestone });
        if (progression.levelUp) queue.push({ type: 'LEVEL_UP', data: progression });
        if (unlockedAchievements.length > 0) queue.push({ type: 'ACHIEVEMENTS', data: unlockedAchievements });
        processNextCelebration(queue);
      }
    } catch (err) {
      toast.error('Unable to complete quest', err.message || 'Please try again.');
    } finally {
      setProcessingQuestIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const openCreateModal = () => {
    setEditingQuest(null);
    setIsModalOpen(true);
  };

  const openEditModal = (quest) => {
    setEditingQuest(quest);
    setIsModalOpen(true);
  };

  // Check if any filter or search is active
  const hasActiveFilters = Boolean(
    searchQuery.trim() !== '' ||
    selectedCategory !== 'ALL' ||
    selectedDifficulty !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    sortBy !== 'NEWEST'
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedDifficulty('ALL');
    setSelectedStatus('ALL');
    setSortBy('NEWEST');
  };

  // Pure derived filtering and sorting pipeline with useMemo
  const filteredQuests = useMemo(() => {
    let result = [...quests];

    // 1. Search filter (case-insensitive on title and description)
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (trimmedQuery) {
      result = result.filter((q) => {
        const title = (q.title || '').toLowerCase();
        const desc = (q.description || '').toLowerCase();
        return title.includes(trimmedQuery) || desc.includes(trimmedQuery);
      });
    }

    // 2. Status filter
    if (selectedStatus === 'ACTIVE') {
      result = result.filter((q) => !q.completed);
    } else if (selectedStatus === 'COMPLETED') {
      result = result.filter((q) => q.completed);
    }

    // 3. Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter((q) => q.category === selectedCategory);
    }

    // 4. Difficulty filter
    if (selectedDifficulty !== 'ALL') {
      result = result.filter((q) => q.difficulty === selectedDifficulty);
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || '').localeCompare(a.id || '');
      }
      if (sortBy === 'OLDEST') {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return (a.id || '').localeCompare(b.id || '');
      }
      if (sortBy === 'DIFFICULTY') {
        const diffA = DIFFICULTY_WEIGHT[a.difficulty] || 0;
        const diffB = DIFFICULTY_WEIGHT[b.difficulty] || 0;
        if (diffA !== diffB) return diffA - diffB; // EASY < MEDIUM < HARD < EPIC
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || '').localeCompare(a.id || '');
      }
      if (sortBy === 'XP_HIGH') {
        const xpA = Number(a.xpReward) || 0;
        const xpB = Number(b.xpReward) || 0;
        if (xpB !== xpA) return xpB - xpA;
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || '').localeCompare(a.id || '');
      }
      if (sortBy === 'GOLD_HIGH') {
        const goldA = Number(a.goldReward) || 0;
        const goldB = Number(b.goldReward) || 0;
        if (goldB !== goldA) return goldB - goldA;
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || '').localeCompare(a.id || '');
      }
      return 0;
    });

    return result;
  }, [quests, searchQuery, selectedStatus, selectedCategory, selectedDifficulty, sortBy]);

  // Live dataset counts
  const totalQuestsCount = quests.length;
  const availableQuestsCount = quests.filter((q) => !q.completed).length;
  const completedQuestsCount = quests.filter((q) => q.completed).length;
  const allQuestsCompleted = totalQuestsCount > 0 && availableQuestsCount === 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // FEATURED QUEST SELECTION (Deterministic RPG Prioritization Rule)
  //
  // Selection Algorithm:
  // 1. Source pool:
  //    - If user has active search/filters, pick from `filteredQuests` to ensure
  //      relevance to current view.
  //    - If no filters are active, pick from the full `quests` array.
  // 2. Filter candidate pool to incomplete quests (`!q.completed`).
  // 3. Prioritization Hierarchy:
  //    a) Highest Difficulty Weight (EPIC: 4 > HARD: 3 > MEDIUM: 2 > EASY: 1)
  //    b) If tied: Highest XP Reward (`xpReward` descending)
  //    c) If tied: Highest Gold Reward (`goldReward` descending)
  //    d) If tied: Newest Creation Date (`createdAt` descending)
  //    e) If tied: Deterministic string comparison on `id`
  // 4. If all candidates are completed or pool is empty, returns null.
  // ─────────────────────────────────────────────────────────────────────────────
  const featuredQuest = useMemo(() => {
    const candidatePool = hasActiveFilters ? filteredQuests : quests;
    const incompleteCandidates = candidatePool.filter((q) => !q.completed);

    if (incompleteCandidates.length === 0) return null;

    return [...incompleteCandidates].sort((a, b) => {
      // 1. Highest difficulty weight
      const diffWeightA = DIFFICULTY_WEIGHT[a.difficulty] || 2;
      const diffWeightB = DIFFICULTY_WEIGHT[b.difficulty] || 2;
      if (diffWeightB !== diffWeightA) return diffWeightB - diffWeightA;

      // 2. Highest XP reward
      const xpA = Number(a.xpReward) || 0;
      const xpB = Number(b.xpReward) || 0;
      if (xpB !== xpA) return xpB - xpA;

      // 3. Highest Gold reward
      const goldA = Number(a.goldReward) || 0;
      const goldB = Number(b.goldReward) || 0;
      if (goldB !== goldA) return goldB - goldA;

      // 4. Newest creation date
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;

      // 5. Deterministic tie-break on id
      return (b.id || '').localeCompare(a.id || '');
    })[0];
  }, [quests, filteredQuests, hasActiveFilters]);

  // Quick attribute shortcut click handler (smoothly activates Phase 3 category filter)
  const handleAttributeShortcut = (catId) => {
    setSelectedCategory((prev) => (prev === catId ? 'ALL' : catId));
    const discoveryEl = document.getElementById('quest-discovery-section');
    if (discoveryEl) {
      discoveryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const progressStats = user ? getProgressionStats(user.xp ?? 0) : null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[700px] h-[350px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />
        {floatingFeedback && (
          <FloatingFeedback data={floatingFeedback} onComplete={() => setFloatingFeedback(null)} />
        )}
        <Navbar activePage="quests" />
        {progressStats && (
          <div className="w-full bg-slate-900/70 border-b border-slate-800/80 px-4 sm:px-6 py-3 z-10">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 sm:gap-4 md:gap-6">
              {/* Level & XP bar */}
              <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-full">
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="p-1.5 bg-amber-500/20 border border-amber-500/40 rounded-lg">
                    <Shield className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-amber-400">LVL {progressStats.level}</span>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono font-bold mb-1">
                    <span className="text-purple-400 flex items-center gap-1 truncate">
                      <Zap className="w-3 h-3 shrink-0" /> {progressStats.currentLevelXP} / {progressStats.xpRequired} XP
                    </span>
                    <span className="text-slate-500 ml-1">{progressStats.progressPct}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressStats.progressPct} aria-valuemin="0" aria-valuemax="100">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressStats.progressPct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs sm:text-sm font-black text-yellow-300 font-mono">{user?.gold ?? 0}</span>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-semibold">GOLD</span>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                  <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">{user?.streak ?? 0}</span>
                  <span className="text-[10px] sm:text-xs text-amber-400/80 font-bold uppercase">STREAK</span>
                </div>
                <div className="hidden lg:flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-slate-400 font-mono">{user?.xp ?? 0} XP</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 z-10">
          {/* 1. RPG QUEST BOARD HERO HEADER */}
          <header className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-purple-950/20 p-5 sm:p-7 md:p-8 shadow-2xl backdrop-blur-xl">
            {/* Ambient background glows */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-purple-600/15 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Title & Lore Subtitle */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest">
                  <Swords className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  <span>Realm Mission Terminal</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200 tracking-tight font-sans">
                  ⚔ TODAY'S ADVENTURES
                </h1>
                <p className="text-sm sm:text-base text-amber-200/90 italic font-medium">
                  &ldquo;Choose your next challenge and grow your character.&rdquo;
                </p>
              </div>

              {/* Action Button */}
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 min-h-[44px] text-sm tracking-wider uppercase focus-visible:ring-2 focus-visible:ring-amber-300 active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                  <span>CREATE QUEST</span>
                </button>
              </div>
            </div>

            {/* Live Quest Statistics Panels */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
              <div className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between">
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                  <span>Available</span>
                </span>
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-amber-400 font-mono mt-1">
                  {availableQuestsCount}
                </span>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between">
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Completed</span>
                </span>
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-400 font-mono mt-1">
                  {completedQuestsCount}
                </span>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between">
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Scroll className="w-3.5 h-3.5 text-purple-400 shrink-0" aria-hidden="true" />
                  <span>Total Quests</span>
                </span>
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-white font-mono mt-1">
                  {totalQuestsCount}
                </span>
              </div>

              {hasActiveFilters && (
                <div className="p-3 sm:p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex flex-col justify-between col-span-2 sm:col-span-3 lg:col-span-1">
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" aria-hidden="true" />
                    <span>Filtered Matches</span>
                  </span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-black text-indigo-200 font-mono mt-1">
                    {filteredQuests.length}
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* 2. FEATURED CHALLENGE SECTION */}
          {totalQuestsCount === 0 ? (
            /* Zero Quests in Database */
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-dashed border-amber-500/40 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-purple-950/20 p-6 sm:p-8 text-center space-y-4 shadow-xl">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Swords className="w-8 h-8" aria-hidden="true" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  ⚔ THE QUEST BOARD AWAITS
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  No quests have been forged yet. Inscribe your first real-life challenge to begin your character journey and earn rewards.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateModal}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 transition inline-flex items-center gap-2 min-h-[44px]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                <span>FORGE YOUR FIRST QUEST</span>
              </button>
            </div>
          ) : allQuestsCompleted ? (
            /* All Quests Completed */
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-slate-900/95 via-emerald-950/20 to-slate-900/95 p-6 sm:p-8 text-center space-y-4 shadow-xl">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Trophy className="w-8 h-8" aria-hidden="true" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  🏆 ALL CHALLENGES COMPLETE
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Your current quest board has been conquered. Every challenge inscribed has been mastered.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('COMPLETED')}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider transition min-h-[44px]"
                >
                  VIEW COMPLETED QUESTS
                </button>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-amber-500/20 transition inline-flex items-center gap-2 min-h-[44px]"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>CREATE NEW QUEST</span>
                </button>
              </div>
            </div>
          ) : featuredQuest ? (
            /* Active Featured Challenge Card */
            <section
              aria-label="Featured challenge"
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-purple-950/30 p-5 sm:p-7 shadow-2xl backdrop-blur-xl group"
            >
              {/* Subtle top edge glow */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500" />
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-black uppercase tracking-widest shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" aria-hidden="true" />
                    <span>⚡ FEATURED CHALLENGE</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                    Priority Recommendation
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Category Badge */}
                  {(() => {
                    const catInfo = CATEGORY_CONFIG[featuredQuest.category] || CATEGORY_CONFIG.INTELLECT;
                    const CatIcon = catInfo.icon;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${catInfo.color}`}>
                        <CatIcon className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{catInfo.label}</span>
                        <span className="text-[10px] opacity-80">{catInfo.attributeTag}</span>
                      </span>
                    );
                  })()}

                  {/* Difficulty Badge */}
                  {(() => {
                    const diffInfo = DIFFICULTY_CONFIG[featuredQuest.difficulty] || DIFFICULTY_CONFIG.MEDIUM;
                    return (
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-black uppercase tracking-wider ${diffInfo.badge}`}>
                        <span>{diffInfo.label}</span>
                        <span className="ml-1 text-amber-400">{diffInfo.stars}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mb-6">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                  {featuredQuest.title}
                </h3>
                {featuredQuest.description ? (
                  <p className="text-sm sm:text-base text-slate-300 line-clamp-2 max-w-3xl leading-relaxed">
                    {featuredQuest.description}
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-500 italic">
                    No description provided for this quest.
                  </p>
                )}
              </div>

              {/* Footer Bar: Rewards Strip + CTA */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-200 text-xs sm:text-sm font-mono font-black">
                    <Zap className="w-4 h-4 text-purple-400" aria-hidden="true" />
                    <span>+{featuredQuest.xpReward} XP</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-mono font-black">
                    <Coins className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    <span>+{featuredQuest.goldReward} GOLD</span>
                  </div>
                  {featuredQuest.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
                      <span>Target: {new Date(featuredQuest.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={() => handleCompleteQuest(featuredQuest.id)}
                  disabled={processingQuestIds.has(featuredQuest.id)}
                  aria-label={`Begin and complete featured quest: ${featuredQuest.title}`}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {processingQuestIds.has(featuredQuest.id) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" aria-hidden="true" />
                      <span>COMPLETING...</span>
                    </>
                  ) : (
                    <>
                      <Swords className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                      <span>⚔ BEGIN QUEST</span>
                    </>
                  )}
                </button>
              </div>
            </section>
          ) : (
            /* Active filters hide incomplete quests */
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 text-slate-400">
                <Info className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                <span>No active challenges match your current discovery filters.</span>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs uppercase tracking-wider transition min-h-[44px]"
              >
                RESET FILTERS
              </button>
            </div>
          )}

          {/* 3. QUICK ATTRIBUTE SHORTCUTS */}
          <section aria-label="Quick attribute navigation" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                QUICK ATTRIBUTE FOCUS
              </span>
              {selectedCategory !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className="text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 transition"
                >
                  RESET FOCUS (ALL)
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ATTRIBUTE_SHORTCUTS.map((attr) => {
                const isSelected = selectedCategory === attr.id;
                return (
                  <button
                    key={attr.id}
                    type="button"
                    onClick={() => handleAttributeShortcut(attr.id)}
                    aria-pressed={isSelected}
                    aria-label={`Filter by ${attr.label} attribute`}
                    className={`min-h-[48px] p-2.5 rounded-xl border transition flex items-center justify-between gap-2 text-left focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                      isSelected
                        ? attr.activeStyle
                        : 'border-slate-800/90 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg leading-none shrink-0">{attr.glyph}</span>
                      <span className="text-xs font-bold tracking-wide truncate">{attr.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono shrink-0 ${isSelected ? 'text-amber-300 font-black' : 'text-slate-500'}`}>
                      +{attr.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. RPG QUEST DISCOVERY & COMMAND BAR */}
          <section
            id="quest-discovery-section"
            aria-label="Quest discovery and filtering controls"
            className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md shadow-xl space-y-4"
          >
            {/* Top Row: Search Input + Status Segments + Sort Dropdown */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Field */}
              <div className="relative flex-1 min-w-[220px]">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search quests..."
                  aria-label="Search quests by title or description"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all min-h-[44px]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search text"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Segmented Control (All / Available / Completed) */}
              <div
                role="group"
                aria-label="Filter by quest completion status"
                className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl shrink-0 overflow-x-auto no-scrollbar"
              >
                {[
                  { id: 'ALL', label: 'All', count: quests.length },
                  { id: 'ACTIVE', label: 'Available', count: quests.filter((q) => !q.completed).length },
                  { id: 'COMPLETED', label: 'Completed', count: quests.filter((q) => q.completed).length },
                ].map((tab) => {
                  const isSelected = selectedStatus === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedStatus(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 min-h-[38px] ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-indigo-700/80 text-white' : 'bg-slate-900 text-slate-500'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Sorting Control */}
              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor="quest-sort" className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1 shrink-0">
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  <span>Sort:</span>
                </label>
                <select
                  id="quest-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort quests by"
                  className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 text-xs font-bold focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 cursor-pointer min-h-[44px]"
                >
                  <option value="NEWEST">Newest</option>
                  <option value="OLDEST">Oldest</option>
                  <option value="DIFFICULTY">Difficulty</option>
                  <option value="XP_HIGH">Highest XP</option>
                  <option value="GOLD_HIGH">Highest Gold</option>
                </select>
              </div>
            </div>

            {/* Category Filter Group (Runes) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-purple-400" aria-hidden="true" /> Quest Types
                </span>
              </div>
              <div
                role="group"
                aria-label="Filter by quest category"
                className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold"
              >
                {[
                  { id: 'ALL', label: 'All Types', icon: Swords },
                  { id: 'INTELLECT', label: 'Intellect', icon: Brain, color: 'text-sky-300' },
                  { id: 'STRENGTH', label: 'Strength', icon: Dumbbell, color: 'text-rose-300' },
                  { id: 'VITALITY', label: 'Vitality', icon: Heart, color: 'text-emerald-300' },
                  { id: 'CREATIVITY', label: 'Creativity', icon: Palette, color: 'text-purple-300' },
                  { id: 'DISCIPLINE', label: 'Discipline', icon: Target, color: 'text-amber-300' },
                ].map((cat) => {
                  const CatIcon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 min-h-[44px] border ${
                        isSelected
                          ? 'bg-purple-950/80 border-purple-500/60 text-white shadow-md shadow-purple-950/50'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <CatIcon className={`w-3.5 h-3.5 ${cat.color || 'text-amber-400'}`} aria-hidden="true" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Filter Group */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-amber-400" aria-hidden="true" /> Challenge Difficulty
                </span>
              </div>
              <div
                role="group"
                aria-label="Filter by challenge difficulty"
                className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-mono font-bold"
              >
                {[
                  { id: 'ALL', label: 'All Tiers' },
                  { id: 'EASY', label: '★ EASY' },
                  { id: 'MEDIUM', label: '★★ MEDIUM' },
                  { id: 'HARD', label: '★★★ HARD' },
                  { id: 'EPIC', label: '★★★★ EPIC' },
                ].map((diff) => {
                  const isSelected = selectedDifficulty === diff.id;
                  return (
                    <button
                      key={diff.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedDifficulty(diff.id)}
                      className={`px-3 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1 min-h-[44px] border ${
                        isSelected
                          ? 'bg-amber-950/70 border-amber-500/60 text-amber-200 shadow-md shadow-amber-950/50'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <span>{diff.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Filter Chips & Live Result Count Bar */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Live Result Count */}
              <div className="flex items-center gap-2 font-mono font-bold text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 text-xs tracking-wider">
                  {filteredQuests.length} {filteredQuests.length === 1 ? 'QUEST FOUND' : 'QUESTS FOUND'}
                </span>
                {hasActiveFilters && (
                  <span className="text-[11px] text-slate-500">Filtered from {quests.length} total</span>
                )}
              </div>

              {/* Active Filter Tags & Clear All */}
              {hasActiveFilters && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Active:</span>

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition text-[11px]"
                      title="Remove search filter"
                    >
                      <span>"{searchQuery}"</span>
                      <X className="w-3 h-3 text-slate-400" />
                    </button>
                  )}

                  {selectedStatus !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => setSelectedStatus('ALL')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-700/60 text-indigo-300 hover:text-white transition text-[11px]"
                      title="Remove status filter"
                    >
                      <span>Status: {selectedStatus}</span>
                      <X className="w-3 h-3 text-indigo-400" />
                    </button>
                  )}

                  {selectedCategory !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('ALL')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-700/60 text-purple-300 hover:text-white transition text-[11px]"
                      title="Remove category filter"
                    >
                      <span>{selectedCategory}</span>
                      <X className="w-3 h-3 text-purple-400" />
                    </button>
                  )}

                  {selectedDifficulty !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => setSelectedDifficulty('ALL')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-700/60 text-amber-300 hover:text-white transition text-[11px]"
                      title="Remove difficulty filter"
                    >
                      <span>{selectedDifficulty}</span>
                      <X className="w-3 h-3 text-amber-400" />
                    </button>
                  )}

                  {sortBy !== 'NEWEST' && (
                    <button
                      type="button"
                      onClick={() => setSortBy('NEWEST')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 hover:text-white transition text-[11px]"
                      title="Reset to default sorting"
                    >
                      <span>Sort: {sortBy}</span>
                      <X className="w-3 h-3 text-slate-400" />
                    </button>
                  )}

                  {/* Clear All Filters Button */}
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800 text-rose-300 hover:text-rose-200 transition font-bold text-[11px] min-h-[32px]"
                  >
                    <RotateCcw className="w-3 h-3 text-rose-400" />
                    <span>CLEAR FILTERS</span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {error && (
            <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-sm flex items-center gap-2">
              <Flame className="w-5 h-5" />
              <span>{error}</span>
              <button onClick={fetchQuests} className="ml-auto px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded">Try Again</button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonQuestCard />
              <SkeletonQuestCard />
              <SkeletonQuestCard />
            </div>
          ) : filteredQuests.length === 0 ? (
            hasActiveFilters ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 sm:py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30 text-center px-6 space-y-4"
              >
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 shadow-inner">
                  <SearchX className="w-10 h-10 text-amber-400/70" aria-hidden="true" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-lg font-bold text-white tracking-tight uppercase">NO QUESTS FOUND</h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    No challenge matches your current filters or search query.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm tracking-wider uppercase transition shadow-md shadow-amber-500/20 flex items-center gap-2 min-h-[44px]"
                >
                  <RotateCcw className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>CLEAR FILTERS</span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 sm:py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30 text-center px-6 space-y-4"
              >
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 shadow-inner">
                  <Swords className="w-10 h-10 text-amber-400/70" aria-hidden="true" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-lg font-bold text-white tracking-tight">No Quests On The Board</h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    The realm awaits your initiative. Inscribe your first quest to start earning XP and Gold.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm tracking-wider uppercase transition shadow-md shadow-amber-500/20 flex items-center gap-2 min-h-[44px]"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>INSCRIBE FIRST QUEST</span>
                </button>
              </motion.div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={handleCompleteQuest}
                    onEdit={openEditModal}
                    onDelete={handleDeleteQuest}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
        <QuestFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={editingQuest ? handleUpdateQuest : handleCreateQuest} initialQuest={editingQuest} />
        {activeCelebration?.type === 'QUEST_COMPLETE' && (
          <QuestCompletionModal isOpen={true} onClose={closeActiveCelebration} data={activeCelebration.data} />
        )}
        {activeCelebration?.type === 'LEVEL_UP' && (
          <LevelUpModal isOpen={true} onClose={closeActiveCelebration} progression={activeCelebration.data} />
        )}
        {activeCelebration?.type === 'MILESTONE' && (
          <StreakMilestoneModal isOpen={true} onClose={closeActiveCelebration} milestone={activeCelebration.data} />
        )}
        {activeCelebration?.type === 'ACHIEVEMENTS' && (
          <AchievementUnlockModal achievements={activeCelebration.data} onClose={closeActiveCelebration} />
        )}
      </div>
    </PageTransition>
  );
}
