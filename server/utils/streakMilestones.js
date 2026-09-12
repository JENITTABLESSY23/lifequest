/**
 * LifeQuest Streak Milestones Utility
 *
 * Defines and evaluates server-authoritative streak milestones.
 * Milestones only trigger on the exact transition where the streak crosses the threshold.
 */

export const STREAK_MILESTONES = [
  { days: 3, name: '3 Day Streak', description: 'Consistency taking root! You reached 3 consecutive days.' },
  { days: 7, name: '7 Day Streak', description: 'A whole week of dedication! You reached 7 consecutive days.' },
  { days: 30, name: '30 Day Streak', description: 'Legendary discipline! A full month of real-life quests completed.' },
];

/**
 * Checks whether the transition from previousStreak to newStreak crosses a milestone threshold.
 *
 * @param {number} previousStreak
 * @param {number} newStreak
 * @returns {{ unlocked: boolean, days?: number, name?: string, description?: string }}
 */
export const checkStreakMilestone = (previousStreak, newStreak) => {
  const prev = Math.max(0, Number(previousStreak) || 0);
  const current = Math.max(0, Number(newStreak) || 0);

  // Check if current matches any milestone threshold and was strictly below it before
  const reached = STREAK_MILESTONES.find((m) => prev < m.days && current >= m.days);

  if (reached) {
    return {
      unlocked: true,
      days: reached.days,
      name: reached.name,
      description: reached.description,
    };
  }

  return {
    unlocked: false,
  };
};
