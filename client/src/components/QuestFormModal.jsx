import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Swords, X, Zap, Coins, AlertCircle, Loader2, Sparkles,
  Brain, Dumbbell, Heart, Palette, Flame, Calendar, Check,
  Shield, Info,
} from 'lucide-react';

// Authoritative reward reference values for preview only (server strictly calculates rewards)
const REWARD_PREVIEW = {
  EASY: { xp: 50, gold: 20 },
  MEDIUM: { xp: 100, gold: 40 },
  HARD: { xp: 150, gold: 60 },
  EPIC: { xp: 250, gold: 100 },
};

// RPG Attribute configuration for selectable rune cards
const ATTRIBUTE_RUNES = [
  {
    id: 'INTELLECT',
    name: 'Intellect',
    glyph: '🧠',
    icon: Brain,
    short: 'INT',
    tagline: 'Mental power & knowledge',
    accentColor: 'text-sky-400',
    badgeBorder: 'border-sky-500/30 bg-sky-950/40 text-sky-300',
    activeStyles: 'border-sky-400 bg-sky-950/80 shadow-lg shadow-sky-950/70 ring-2 ring-sky-500/40',
    idleStyles: 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90 text-slate-300',
  },
  {
    id: 'STRENGTH',
    name: 'Strength',
    glyph: '💪',
    icon: Dumbbell,
    short: 'STR',
    tagline: 'Physical power & stamina',
    accentColor: 'text-rose-400',
    badgeBorder: 'border-rose-500/30 bg-rose-950/40 text-rose-300',
    activeStyles: 'border-rose-400 bg-rose-950/80 shadow-lg shadow-rose-950/70 ring-2 ring-rose-500/40',
    idleStyles: 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90 text-slate-300',
  },
  {
    id: 'VITALITY',
    name: 'Vitality',
    glyph: '❤️',
    icon: Heart,
    short: 'VIT',
    tagline: 'Health, wellness & energy',
    accentColor: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300',
    activeStyles: 'border-emerald-400 bg-emerald-950/80 shadow-lg shadow-emerald-950/70 ring-2 ring-emerald-500/40',
    idleStyles: 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90 text-slate-300',
  },
  {
    id: 'CREATIVITY',
    name: 'Creativity',
    glyph: '🎨',
    icon: Palette,
    short: 'CRE',
    tagline: 'Arts, design & innovation',
    accentColor: 'text-purple-400',
    badgeBorder: 'border-purple-500/30 bg-purple-950/40 text-purple-300',
    activeStyles: 'border-purple-400 bg-purple-950/80 shadow-lg shadow-purple-950/70 ring-2 ring-purple-500/40',
    idleStyles: 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90 text-slate-300',
  },
  {
    id: 'DISCIPLINE',
    name: 'Discipline',
    glyph: '🔥',
    icon: Flame,
    short: 'DIS',
    tagline: 'Habits, willpower & routine',
    accentColor: 'text-amber-400',
    badgeBorder: 'border-amber-500/30 bg-amber-950/40 text-amber-300',
    activeStyles: 'border-amber-400 bg-amber-950/80 shadow-lg shadow-amber-950/70 ring-2 ring-amber-500/40',
    idleStyles: 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90 text-slate-300',
  },
];

// Difficulty configuration
const DIFFICULTY_TIERS = [
  {
    id: 'EASY',
    label: 'EASY',
    stars: '★',
    starCount: 1,
    tierDesc: 'Casual challenge',
    activeStyles: 'border-slate-400 bg-slate-800/90 text-white shadow-md shadow-slate-950 ring-2 ring-slate-400/30',
    idleStyles: 'border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-400',
    accentGradient: 'from-slate-600 via-slate-500 to-slate-600',
    badgeBg: 'text-slate-300 border-slate-700/80 bg-slate-900/80',
  },
  {
    id: 'MEDIUM',
    label: 'MEDIUM',
    stars: '★★',
    starCount: 2,
    tierDesc: 'Standard endeavor',
    activeStyles: 'border-sky-400 bg-sky-950/80 text-sky-200 shadow-md shadow-sky-950 ring-2 ring-sky-500/40',
    idleStyles: 'border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-400',
    accentGradient: 'from-sky-600 via-cyan-400 to-sky-600',
    badgeBg: 'text-sky-300 border-sky-500/40 bg-sky-950/60',
  },
  {
    id: 'HARD',
    label: 'HARD',
    stars: '★★★',
    starCount: 3,
    tierDesc: 'Demanding feat',
    activeStyles: 'border-amber-400 bg-amber-950/80 text-amber-200 shadow-md shadow-amber-950 ring-2 ring-amber-500/40',
    idleStyles: 'border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-400',
    accentGradient: 'from-amber-600 via-yellow-400 to-amber-500',
    badgeBg: 'text-amber-300 border-amber-500/50 bg-amber-950/70',
  },
  {
    id: 'EPIC',
    label: 'EPIC',
    stars: '★★★★',
    starCount: 4,
    tierDesc: 'Legendary trial',
    activeStyles: 'border-purple-400 bg-purple-950/80 text-purple-200 shadow-md shadow-purple-950 ring-2 ring-purple-500/40',
    idleStyles: 'border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-400',
    accentGradient: 'from-purple-500 via-fuchsia-400 to-indigo-500',
    badgeBg: 'text-purple-300 border-purple-400/60 bg-purple-950/80 ring-1 ring-purple-500/30',
  },
];

export default function QuestFormModal({ isOpen, onClose, onSubmit, initialQuest = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('INTELLECT');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const shouldReduceMotion = useReducedMotion();
  const titleInputRef = useRef(null);

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, submitting]);

  // Reset or initialize state whenever modal opens or initialQuest changes
  useEffect(() => {
    if (initialQuest) {
      setTitle(initialQuest.title || '');
      setDescription(initialQuest.description || '');
      setCategory(initialQuest.category || 'INTELLECT');
      setDifficulty(initialQuest.difficulty || 'MEDIUM');
      setDueDate(
        initialQuest.dueDate
          ? new Date(initialQuest.dueDate).toISOString().split('T')[0]
          : ''
      );
    } else {
      setTitle('');
      setDescription('');
      setCategory('INTELLECT');
      setDifficulty('MEDIUM');
      setDueDate('');
    }
    setError('');
    setSubmitting(false);

    // Autofocus title input after modal renders
    if (isOpen) {
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [initialQuest, isOpen]);

  if (!isOpen) return null;

  // Selected rune and tier metadata
  const selectedRune = ATTRIBUTE_RUNES.find((r) => r.id === category) || ATTRIBUTE_RUNES[0];
  const selectedTier = DIFFICULTY_TIERS.find((d) => d.id === difficulty) || DIFFICULTY_TIERS[1];
  const rewardPreview = REWARD_PREVIEW[difficulty] || REWARD_PREVIEW.MEDIUM;
  const RuneIcon = selectedRune.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Quest title is required. Give your challenge a name!');
      titleInputRef.current?.focus();
      return;
    }

    if (trimmedTitle.length > 100) {
      setError('Quest title cannot exceed 100 characters.');
      return;
    }

    if (description.trim().length > 500) {
      setError('Description cannot exceed 500 characters.');
      return;
    }

    try {
      setSubmitting(true);
      // Client strictly sends form fields — rewards are calculated authoritatively by the server
      await onSubmit({
        title: trimmedTitle,
        description: description.trim(),
        category,
        difficulty,
        dueDate: dueDate || null,
      });
      onClose();
    } catch (err) {
      // Keep entered data intact on failure so user does not lose input
      setError(err.message || 'Failed to save quest. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget && !submitting) onClose();
        }}
        role="presentation"
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quest-modal-title"
          aria-describedby="quest-modal-desc"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-4xl bg-slate-900/95 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl shadow-indigo-950/50 relative max-h-[92vh] overflow-y-auto focus:outline-none"
        >
          {/* Top RPG Edge Glow Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/40 via-purple-500/60 to-amber-500/40 rounded-t-2xl sm:rounded-t-3xl" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close quest modal"
            className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-3.5 pr-12 mb-6">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 via-purple-600/20 to-slate-900 border border-amber-500/40 rounded-2xl text-amber-400 shadow-md shadow-amber-500/10 shrink-0">
              <Swords className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  {initialQuest ? 'QUEST EDITOR' : 'REALM INSCRIPTION'}
                </span>
              </div>
              <h2 id="quest-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {initialQuest ? '⚔ EDIT QUEST' : '⚔ CREATE NEW QUEST'}
              </h2>
              <p id="quest-modal-desc" className="text-xs sm:text-sm text-slate-400">
                {initialQuest
                  ? 'Refine the objectives of your ongoing challenge.'
                  : 'Forge a new challenge for your journey.'}
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3.5 mb-5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 shadow-md shadow-rose-950/50"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" aria-hidden="true" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Two-Column Layout (Form Controls Left, Live Preview Right) */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Quest Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="quest-title-input"
                      className="block text-xs font-bold text-slate-200 uppercase tracking-wider"
                    >
                      QUEST NAME <span className="text-amber-400">*</span>
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        title.length > 90 ? 'text-amber-400 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {title.length}/100
                    </span>
                  </div>
                  <input
                    ref={titleInputRef}
                    id="quest-title-input"
                    type="text"
                    required
                    maxLength={100}
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. Master Java Arrays"
                    className="w-full px-4 py-3 bg-slate-950/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition shadow-inner"
                    disabled={submitting}
                  />
                </div>

                {/* 2. Quest Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="quest-desc-input"
                      className="block text-xs font-bold text-slate-200 uppercase tracking-wider"
                    >
                      QUEST DESCRIPTION
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        description.length > 450 ? 'text-amber-400 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {description.length}/500
                    </span>
                  </div>
                  <textarea
                    id="quest-desc-input"
                    rows={3}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the challenge..."
                    className="w-full px-4 py-3 bg-slate-950/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition resize-none shadow-inner"
                    disabled={submitting}
                  />
                </div>

                {/* 3. Attribute Selection (Rune Cards) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                      CHOOSE YOUR ATTRIBUTE <span className="text-amber-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Boost: <strong className={selectedRune.accentColor}>+5 {selectedRune.short}</strong>
                    </span>
                  </div>

                  <div
                    role="radiogroup"
                    aria-label="Choose Quest Attribute"
                    className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                  >
                    {ATTRIBUTE_RUNES.map((rune) => {
                      const isSelected = category === rune.id;
                      const IconComponent = rune.icon;
                      return (
                        <button
                          key={rune.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={`${rune.name}: ${rune.tagline}`}
                          onClick={() => setCategory(rune.id)}
                          disabled={submitting}
                          className={`min-h-[58px] p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 relative group focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                            isSelected ? rune.activeStyles : rune.idleStyles
                          }`}
                        >
                          <span className="text-lg leading-none shrink-0 mt-0.5">{rune.glyph}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white tracking-wide truncate">
                                {rune.name}
                              </span>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 ml-1" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {rune.short} • {rune.tagline.split('&')[0].trim()}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Difficulty Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                      DIFFICULTY RATING <span className="text-amber-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Tier: <strong className="text-amber-300">{selectedTier.label} ({selectedTier.stars})</strong>
                    </span>
                  </div>

                  <div
                    role="radiogroup"
                    aria-label="Choose Quest Difficulty"
                    className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                  >
                    {DIFFICULTY_TIERS.map((tier) => {
                      const isSelected = difficulty === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={`${tier.label} difficulty, ${tier.starCount} star${tier.starCount > 1 ? 's' : ''}`}
                          onClick={() => setDifficulty(tier.id)}
                          disabled={submitting}
                          className={`min-h-[54px] p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 relative focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                            isSelected ? tier.activeStyles : tier.idleStyles
                          }`}
                        >
                          <span className="text-xs font-black tracking-wider uppercase">
                            {tier.label}
                          </span>
                          <span className="text-xs tracking-widest text-amber-400">
                            {tier.stars}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Due Date (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="quest-due-input"
                      className="block text-xs font-bold text-slate-200 uppercase tracking-wider"
                    >
                      TARGET COMPLETION DATE <span className="text-slate-500 text-[10px] normal-case">(Optional)</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="quest-due-input"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition shadow-inner"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Live Quest Preview & Reward Box */}
              <div className="lg:col-span-5 space-y-4">
                {/* Live Preview Panel Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    LIVE QUEST PREVIEW
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Updates in real-time</span>
                </div>

                {/* Simulated Quest Card matching QuestBoard */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl shadow-slate-950/60">
                  {/* Top difficulty accent glow line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${selectedTier.accentGradient}`} />

                  {/* Header Row: Attribute + Difficulty */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${selectedRune.badgeBorder}`}>
                      <span className="text-sm leading-none">{selectedRune.glyph}</span>
                      <span>{selectedRune.name}</span>
                      <span className="text-[10px] font-mono opacity-80 ml-0.5">+{selectedRune.short}</span>
                    </div>

                    <div className={`px-2 py-0.5 rounded-md border text-[11px] font-black tracking-wider uppercase ${selectedTier.badgeBg}`}>
                      <span>{selectedTier.label}</span>
                      <span className="ml-1 text-amber-400">{selectedTier.stars}</span>
                    </div>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight break-words min-h-[1.75rem]">
                    {title.trim() || (
                      <span className="text-slate-500 italic font-normal">
                        Your Quest Name...
                      </span>
                    )}
                  </h3>

                  {/* Card Description */}
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 line-clamp-3 leading-relaxed min-h-[2.5rem]">
                    {description.trim() || (
                      <span className="text-slate-600 italic">
                        Describe the challenge to preview it here...
                      </span>
                    )}
                  </p>

                  {/* Optional Target Due Date */}
                  {dueDate && (
                    <div className="flex items-center gap-1.5 mt-3 text-[11px] font-mono text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-amber-400/80" aria-hidden="true" />
                      <span>Target: {new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="my-3.5 border-t border-slate-800/80" />

                  {/* Rewards Row */}
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-purple-400">
                        <Zap className="w-3.5 h-3.5" aria-hidden="true" /> +{rewardPreview.xp} XP
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Coins className="w-3.5 h-3.5" aria-hidden="true" /> +{rewardPreview.gold} GOLD
                      </span>
                    </div>
                    <span className={`text-[11px] ${selectedRune.accentColor}`}>
                      +5 {selectedRune.short}
                    </span>
                  </div>
                </div>

                {/* Reward Preview Summary Box */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                      SERVER-ENFORCED REWARDS
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Anti-Cheat Protected</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Rewards are calculated authoritatively upon completion based on the chosen difficulty rating.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    <div className="p-2 bg-slate-950/80 rounded-lg border border-purple-500/20 text-purple-300 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">XP GAIN:</span>
                      <strong className="text-purple-400">+{rewardPreview.xp} XP</strong>
                    </div>
                    <div className="p-2 bg-slate-950/80 rounded-lg border border-amber-500/20 text-amber-300 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">GOLD GAIN:</span>
                      <strong className="text-amber-400">+{rewardPreview.gold} GOLD</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="mt-7 pt-5 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition min-h-[44px] focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>FORGING QUEST...</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                    <span>{initialQuest ? 'SAVE QUEST' : '⚔ FORGE QUEST'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
