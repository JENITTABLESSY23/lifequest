export const REWARD_MAPPING = {
  EASY: { xpReward: 50, goldReward: 20 },
  MEDIUM: { xpReward: 100, goldReward: 40 },
  HARD: { xpReward: 150, goldReward: 60 },
  EPIC: { xpReward: 250, goldReward: 100 },
};

export const calculateQuestRewards = (difficulty) => {
  const normalized = difficulty ? difficulty.toUpperCase() : 'MEDIUM';
  return REWARD_MAPPING[normalized] || REWARD_MAPPING.MEDIUM;
};

export const VALID_CATEGORIES = [
  'INTELLECT',
  'STRENGTH',
  'VITALITY',
  'CREATIVITY',
  'DISCIPLINE',
];

export const VALID_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'EPIC'];
