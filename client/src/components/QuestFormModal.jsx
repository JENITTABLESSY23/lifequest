import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X, Zap, Coins, AlertCircle, Loader2 } from 'lucide-react';

const REWARD_PREVIEW = {
  EASY: { xp: 50, gold: 20 },
  MEDIUM: { xp: 100, gold: 40 },
  HARD: { xp: 150, gold: 60 },
  EPIC: { xp: 250, gold: 100 },
};

export default function QuestFormModal({ isOpen, onClose, onSubmit, initialQuest = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('INTELLECT');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (initialQuest) {
      setTitle(initialQuest.title || '');
      setDescription(initialQuest.description || '');
      setCategory(initialQuest.category || 'INTELLECT');
      setDifficulty(initialQuest.difficulty || 'MEDIUM');
      setDueDate(initialQuest.dueDate ? new Date(initialQuest.dueDate).toISOString().split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('INTELLECT');
      setDifficulty('MEDIUM');
      setDueDate('');
    }
    setError('');
  }, [initialQuest, isOpen]);

  if (!isOpen) return null;

  const preview = REWARD_PREVIEW[difficulty] || REWARD_PREVIEW.MEDIUM;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a quest title.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        dueDate: dueDate || null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save quest');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quest-modal-title"
          aria-describedby="quest-modal-desc"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 sm:space-y-6 relative max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close quest modal"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 pr-10">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-amber-400 shrink-0">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h2 id="quest-modal-title" className="text-xl font-black text-white">
                {initialQuest ? 'Edit Quest' : 'Forge New Quest'}
              </h2>
              <p id="quest-modal-desc" className="text-xs text-slate-400">
                Define your real-life objective and difficulty
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="quest-title-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Quest Title *
              </label>
              <input
                id="quest-title-input"
                type="text"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Study Java Data Structures"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="quest-desc-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Description (Optional)
              </label>
              <textarea
                id="quest-desc-input"
                rows={2}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your action steps or milestones..."
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition resize-none"
              />
            </div>

            {/* Category & Difficulty Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="quest-category-select" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Attribute Category *
                </label>
                <select
                  id="quest-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-400 transition"
                >
                  <option value="INTELLECT">Intellect (Brain & Study)</option>
                  <option value="STRENGTH">Strength (Fitness & Body)</option>
                  <option value="VITALITY">Vitality (Health & Wellness)</option>
                  <option value="CREATIVITY">Creativity (Arts & Skills)</option>
                  <option value="DISCIPLINE">Discipline (Habits & Tasks)</option>
                </select>
              </div>

              <div>
                <label htmlFor="quest-difficulty-select" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Difficulty Rating *
                </label>
                <select
                  id="quest-difficulty-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-400 transition"
                >
                  <option value="EASY">EASY (★☆☆☆)</option>
                  <option value="MEDIUM">MEDIUM (★★☆☆)</option>
                  <option value="HARD">HARD (★★★☆)</option>
                  <option value="EPIC">EPIC (★★★★)</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="quest-due-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Target Completion Date (Optional)
              </label>
              <input
                id="quest-due-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-400 transition"
              />
            </div>


            {/* Server Reward Calculation Live Preview Box */}
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Estimated Quest Rewards</span>
                <span className="text-[10px] text-slate-500 font-mono">Calculated by server</span>
              </div>
              <div className="flex items-center gap-4 text-sm font-mono font-bold">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <Zap className="w-4 h-4" /> +{preview.xp} XP
                </span>
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <Coins className="w-4 h-4" /> +{preview.gold} GOLD
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Quest...
                </>
              ) : (
                <>
                  <Swords className="w-4 h-4" /> {initialQuest ? 'Save Quest Updates' : 'Publish Quest to Log'}
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
