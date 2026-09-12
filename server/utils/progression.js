/**
 * LifeQuest Progression Utility
 * Formula: XP threshold for Level N = Math.round(100 * (N ^ 1.5))
 * Stored XP represents TOTAL accumulated lifetime XP.
 *
 * Thresholds:
 * Level 1: 0 - 99 total XP
 * Level 2: 100 - 281 total XP
 * Level 3: 282 - 519 total XP
 * Level 4: 520 - 799 total XP
 * Level 5: 800+ total XP
 */

export const getLevelThreshold = (level) => {
  if (level < 1) return 0;
  // Threshold required to reach level + 1
  return Math.round(100 * Math.pow(level, 1.5));
};

export const calculateLevelFromXP = (totalXP) => {
  if (!totalXP || totalXP < 100) return 1;
  let level = 1;
  while (totalXP >= getLevelThreshold(level)) {
    level++;
  }
  return level;
};

export const getProgressionStats = (totalXP) => {
  const safeXP = Math.max(0, Math.floor(Number(totalXP) || 0));
  const currentLevel = calculateLevelFromXP(safeXP);

  const prevLevelXP = currentLevel === 1 ? 0 : getLevelThreshold(currentLevel - 1);
  const nextLevelXP = getLevelThreshold(currentLevel);

  const currentLevelXP = safeXP - prevLevelXP;
  const xpRequiredForNextLevel = nextLevelXP - prevLevelXP;
  const xpRemainingToNextLevel = Math.max(0, nextLevelXP - safeXP);

  const progressPercentage = Math.min(
    100,
    Math.max(0, Math.round((currentLevelXP / (xpRequiredForNextLevel || 1)) * 100))
  );

  return {
    level: currentLevel,
    totalXP: safeXP,
    prevLevelXP,
    nextLevelXP,
    currentLevelXP,
    xpRequiredForNextLevel,
    xpRemainingToNextLevel,
    progressPercentage,
  };
};

export const CATEGORY_TO_ATTRIBUTE = {
  INTELLECT: 'intellect',
  STRENGTH: 'strength',
  VITALITY: 'vitality',
  CREATIVITY: 'creativity',
  DISCIPLINE: 'discipline',
};
