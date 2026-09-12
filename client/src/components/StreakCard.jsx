import React from 'react';
import { Flame, Trophy, Calendar, CheckCircle2, Circle } from 'lucide-react';

export default function StreakCard({ streak = 0, longestStreak = 0, activity = [] }) {
  // Activity array is 7 days: [{ date: 'YYYY-MM-DD', dayName: 'Mon', completed: true/false }]
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md space-y-6">
      {/* Background ambient flame glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />

      {/* Header: Title + Best Streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Daily Streak</h3>
            <p className="text-xs text-slate-500">Keep the flame alive every calendar day</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Best: <strong className="text-amber-300">{longestStreak} {longestStreak === 1 ? 'Day' : 'Days'}</strong></span>
        </div>
      </div>

      {/* Main Streak Counter */}
      <div className="flex items-baseline gap-3">
        <span className="text-5xl font-black tracking-tight text-white flex items-center gap-2">
          <Flame className={`w-10 h-10 ${streak > 0 ? 'text-amber-400 fill-amber-400/20 animate-bounce' : 'text-slate-600'}`} />
          {streak}
        </span>
        <span className="text-sm font-bold uppercase tracking-widest text-amber-400/90">
          {streak === 1 ? 'DAY STREAK' : 'DAYS STREAK'}
        </span>
      </div>

      {/* 7-Day Activity History Window */}
      <div className="space-y-2 pt-2 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" /> Last 7 Days Activity
          </span>
          <span className="text-slate-500 text-[11px]">UTC Calendar</span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-1">
          {activity && activity.length > 0 ? (
            activity.map((item) => {
              const isToday = item.date === todayStr;
              return (
                <div
                  key={item.date}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    item.completed
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                      : isToday
                      ? 'bg-slate-900 border-indigo-500/40 text-slate-400'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
                  }`}
                  title={`${item.date}: ${item.completed ? 'Completed quest' : 'No activity'}`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider mb-1">{item.dayName}</span>
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Circle className={`w-3.5 h-3.5 ${isToday ? 'text-indigo-400/60' : 'text-slate-700'}`} />
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-7 text-center py-2 text-xs text-slate-500">
              Activity loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
