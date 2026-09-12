import React, { useState } from 'react';
import AchievementCard from './AchievementCard';
import { Trophy, CheckCircle, Lock } from 'lucide-react';

export default function AchievementGrid({ achievements = [] }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNLOCKED' | 'LOCKED'

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'UNLOCKED') return a.unlocked;
    if (filter === 'LOCKED') return !a.unlocked;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Achievement Summary Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white">
                {unlockedCount} / {totalCount}
              </span>
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                Achievements Unlocked
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete quests, maintain streaks, and level up to earn trophies.
            </p>
          </div>
        </div>

        {/* Progress Bar & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          {/* Progress bar */}
          <div className="w-full sm:w-44 space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-400">COMPLETION</span>
              <span className="text-amber-400 font-mono">{percentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition ${
                filter === 'ALL'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilter('UNLOCKED')}
              className={`px-3 py-1 rounded-lg transition ${
                filter === 'UNLOCKED'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter('LOCKED')}
              className={`px-3 py-1 rounded-lg transition ${
                filter === 'LOCKED'
                  ? 'bg-slate-800 text-slate-200 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Locked ({totalCount - unlockedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
