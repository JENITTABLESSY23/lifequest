import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Plus, Shield, Filter, Zap, Coins,
  TrendingUp, Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { questService } from '../services/questService';
import QuestCard from '../components/QuestCard';
import QuestFormModal from '../components/QuestFormModal';
import LevelUpModal from '../components/LevelUpModal';
import StreakMilestoneModal from '../components/StreakMilestoneModal';
import AchievementUnlockModal from '../components/AchievementUnlockModal';
import PageTransition from '../components/PageTransition';
import FloatingFeedback from '../components/FloatingFeedback';
import { SkeletonQuestCard } from '../components/skeletons/SkeletonCard';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';

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
  const [filter, setFilter] = useState('ALL');

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
        toast.success('Quest Created', `"${data.quest.title}" added to your log.`);
      }
    } catch (err) {
      toast.error('Failed to create quest', err.message);
    }
  };

  const handleUpdateQuest = async (questData) => {
    if (!editingQuest) return;
    try {
      const data = await questService.updateQuest(editingQuest.id, questData, token);
      if (data.quest) {
        setQuests((prev) => prev.map((q) => (q.id === data.quest.id ? data.quest : q)));
        toast.info('Quest Updated', `Changes saved to "${data.quest.title}".`);
      }
    } catch (err) {
      toast.error('Failed to update quest', err.message);
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

        const queue = [];
        if (progression.levelUp) queue.push({ type: 'LEVEL_UP', data: progression });
        if (milestone.unlocked) queue.push({ type: 'MILESTONE', data: milestone });
        if (unlockedAchievements.length > 0) queue.push({ type: 'ACHIEVEMENTS', data: unlockedAchievements });
        if (queue.length > 0) processNextCelebration(queue);
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

  const filteredQuests = quests.filter((q) => {
    if (filter === 'ACTIVE') return !q.completed;
    if (filter === 'COMPLETED') return q.completed;
    if (['INTELLECT', 'STRENGTH', 'VITALITY', 'CREATIVITY', 'DISCIPLINE'].includes(filter)) {
      return q.category === filter;
    }
    return true;
  });

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
        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
                <Swords className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400" /> Quest Log
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage your real-life daily objectives and earn XP, Gold, and Attributes</p>
            </div>
            <button
              onClick={openCreateModal}
              className="w-full sm:w-auto px-5 sm:px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 min-h-[44px] text-sm"
            >
              <Plus className="w-5 h-5" /> CREATE QUEST
            </button>
          </div>
          <div
            className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 text-sm font-semibold text-slate-400 no-scrollbar"
            role="tablist"
            aria-label="Filter quests by status or category"
          >
            <span className="text-xs text-slate-500 uppercase tracking-widest flex items-center gap-1 mr-2 shrink-0"><Filter className="w-3.5 h-3.5" /> Filter:</span>
            {[
              { id: 'ALL', label: 'All Quests' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'INTELLECT', label: 'Intellect' },
              { id: 'STRENGTH', label: 'Strength' },
              { id: 'VITALITY', label: 'Vitality' },
              { id: 'CREATIVITY', label: 'Creativity' },
              { id: 'DISCIPLINE', label: 'Discipline' },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={filter === tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition min-h-[44px] flex items-center ${
                  filter === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                    : 'hover:bg-slate-900 hover:text-slate-200'
                }`}

              >
                {tab.label}
              </button>
            ))}
          </div>
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30 text-center px-6 space-y-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500"><Swords className="w-10 h-10 text-amber-400/60" /></div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-lg font-bold text-white">No Quests Found</h3>
                <p className="text-sm text-slate-400">{filter === 'ALL' ? 'Your adventure starts with your first quest.' : `No quests match the "${filter}" filter.`}</p>
              </div>
              <button onClick={openCreateModal} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition flex items-center gap-2"><Plus className="w-4 h-4" /> CREATE QUEST</button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><AnimatePresence>{filteredQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} onComplete={handleCompleteQuest} onEdit={openEditModal} onDelete={handleDeleteQuest} />
            ))}</AnimatePresence></div>
          )}
        </main>
        <QuestFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={editingQuest ? handleUpdateQuest : handleCreateQuest} initialQuest={editingQuest} />
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
