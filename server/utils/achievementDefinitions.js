/**
 * Canonical LifeQuest Achievement Definitions
 *
 * Each achievement has:
 *  - id: Stable unique identifier
 *  - name: Display name
 *  - description: Narrative text
 *  - icon: Lucide icon name or visual representation
 *  - rarity: COMMON | RARE | EPIC | LEGENDARY
 *  - check: Function to evaluate condition against (user, completedQuestCount)
 */

export const ACHIEVEMENTS = [
  {
    id: 'FIRST_QUEST',
    name: 'First Quest',
    description: 'Complete your first quest.',
    icon: 'Sword',
    rarity: 'COMMON',
    requirement: {
      type: 'COMPLETED_QUESTS',
      target: 1,
      label: 'Complete 1 quest',
    },
    check: (user, completedQuestCount) => completedQuestCount >= 1,
  },
  {
    id: 'COMPLETE_10_QUESTS',
    name: 'Quest Veteran',
    description: 'Complete 10 quests.',
    icon: 'ShieldCheck',
    rarity: 'RARE',
    requirement: {
      type: 'COMPLETED_QUESTS',
      target: 10,
      label: 'Complete 10 quests',
    },
    check: (user, completedQuestCount) => completedQuestCount >= 10,
  },
  {
    id: 'SEVEN_DAY_STREAK',
    name: 'Week Warrior',
    description: 'Reach a 7-day streak.',
    icon: 'Flame',
    rarity: 'RARE',
    requirement: {
      type: 'STREAK',
      target: 7,
      label: 'Reach a 7-day streak',
    },
    check: (user) => (user.streak || 0) >= 7,
  },
  {
    id: 'LEVEL_5',
    name: 'Rising Hero',
    description: 'Reach Level 5.',
    icon: 'Crown',
    rarity: 'EPIC',
    requirement: {
      type: 'LEVEL',
      target: 5,
      label: 'Reach Level 5',
    },
    check: (user) => (user.level || 1) >= 5,
  },
  {
    id: 'EARN_1000_XP',
    name: 'XP Hunter',
    description: 'Earn 1000 lifetime XP.',
    icon: 'Zap',
    rarity: 'EPIC',
    requirement: {
      type: 'XP',
      target: 1000,
      label: 'Earn 1,000 XP',
    },
    check: (user) => (user.xp || 0) >= 1000,
  },
  {
    id: 'EARN_1000_GOLD',
    name: 'Gold Collector',
    description: 'Earn 1000 lifetime Gold.',
    icon: 'Coins',
    rarity: 'LEGENDARY',
    requirement: {
      type: 'LIFETIME_GOLD',
      target: 1000,
      label: 'Earn 1,000 lifetime Gold',
    },
    check: (user) => (user.totalGoldEarned || 0) >= 1000,
  },
];

/**
 * Returns safe achievement definitions without the check function (for API clients)
 */
export const getSafeAchievementDefinitions = () => {
  return ACHIEVEMENTS.map(({ id, name, description, icon, rarity, requirement }) => ({
    id,
    name,
    description,
    icon,
    rarity,
    requirement,
  }));
};
