/**
 * LifeQuest Streak Utility
 *
 * All streak calculations use UTC calendar days to ensure deterministic,
 * server-authoritative results independent of client timezones.
 *
 * Rules:
 *  - Same calendar day (diff === 0): streak remains unchanged, streakUpdated = false
 *  - Consecutive calendar day (diff === 1): streak = currentStreak + 1, streakUpdated = true
 *  - Missed day (diff > 1): streak resets to 1, streakUpdated = true
 *  - First activity (lastActiveDate is null): streak = 1, streakUpdated = true
 *  - longestStreak = Math.max(longestStreak, newStreak)
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Normalizes a Date or date string to midnight UTC (00:00:00.000Z).
 * @param {Date|string|number} date
 * @returns {Date}
 */
export const normalizeDateToDay = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/**
 * Formats a Date to a UTC 'YYYY-MM-DD' string.
 * @param {Date|string|number} date
 * @returns {string|null}
 */
export const formatDateToUTCString = (date) => {
  const norm = normalizeDateToDay(date);
  if (!norm) return null;
  return norm.toISOString().split('T')[0];
};

/**
 * Calculates whole calendar days between dateA and dateB (dateB - dateA) in UTC.
 * @param {Date|string|number} dateA Earlier date
 * @param {Date|string|number} dateB Later date
 * @returns {number} Difference in days
 */
export const getDayDifference = (dateA, dateB) => {
  const normA = normalizeDateToDay(dateA);
  const normB = normalizeDateToDay(dateB);
  if (!normA || !normB) return null;
  return Math.round((normB.getTime() - normA.getTime()) / MS_PER_DAY);
};

/**
 * Core streak calculation function.
 * Evaluates previous lastActiveDate against currentDate and computes new streak stats.
 *
 * @param {Date|null} previousLastActiveDate
 * @param {Date} currentDate (defaults to new Date())
 * @param {number} currentStreak
 * @param {number} currentLongestStreak
 * @returns {{
 *   streak: number,
 *   longestStreak: number,
 *   lastActiveDate: Date,
 *   streakUpdated: boolean
 * }}
 */
export const calculateStreak = (
  previousLastActiveDate,
  currentDate = new Date(),
  currentStreak = 0,
  currentLongestStreak = 0
) => {
  const safeCurrentStreak = Math.max(0, Number(currentStreak) || 0);
  const safeLongestStreak = Math.max(0, Number(currentLongestStreak) || 0);

  if (!previousLastActiveDate) {
    const newStreak = 1;
    return {
      streak: newStreak,
      longestStreak: Math.max(safeLongestStreak, newStreak),
      lastActiveDate: currentDate,
      streakUpdated: true,
    };
  }

  const diff = getDayDifference(previousLastActiveDate, currentDate);

  if (diff === null) {
    const newStreak = 1;
    return {
      streak: newStreak,
      longestStreak: Math.max(safeLongestStreak, newStreak),
      lastActiveDate: currentDate,
      streakUpdated: true,
    };
  }

  if (diff === 0) {
    // Same calendar day: streak does not change, streakUpdated = false
    // Maintain current streak and longestStreak
    const streak = safeCurrentStreak === 0 ? 1 : safeCurrentStreak;
    return {
      streak,
      longestStreak: Math.max(safeLongestStreak, streak),
      lastActiveDate: currentDate,
      streakUpdated: false,
    };
  }

  if (diff === 1) {
    // Consecutive calendar day: increment streak
    const newStreak = safeCurrentStreak + 1;
    return {
      streak: newStreak,
      longestStreak: Math.max(safeLongestStreak, newStreak),
      lastActiveDate: currentDate,
      streakUpdated: true,
    };
  }

  // Missed day (diff > 1): streak resets to 1
  const newStreak = 1;
  return {
    streak: newStreak,
    longestStreak: Math.max(safeLongestStreak, newStreak),
    lastActiveDate: currentDate,
    streakUpdated: true,
  };
};
