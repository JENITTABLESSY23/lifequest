import RewardItem from '../models/RewardItem.js';

export const INITIAL_REWARD_ITEMS = [
  {
    name: 'Shadow Mage Avatar',
    description: 'A mysterious shadow-powered avatar for your LifeQuest character.',
    type: 'AVATAR',
    price: 500,
    icon: 'Sparkles',
    rarity: 'EPIC',
  },
  {
    name: 'Midnight Realm Theme',
    description: 'Unlock a darker atmospheric theme for your LifeQuest experience.',
    type: 'THEME',
    price: 750,
    icon: 'Palette',
    rarity: 'RARE',
  },
  {
    name: 'Quest Master Badge',
    description: 'A prestigious badge for dedicated quest completion.',
    type: 'BADGE',
    price: 1000,
    icon: 'Trophy',
    rarity: 'LEGENDARY',
  },
];

/**
 * Idempotently seeds initial reward items into MongoDB.
 * Running this multiple times will update or preserve items without creating duplicates.
 */
export const seedRewardItems = async () => {
  const results = [];
  for (const itemData of INITIAL_REWARD_ITEMS) {
    const item = await RewardItem.findOneAndUpdate(
      { name: itemData.name },
      { $setOnInsert: itemData },
      { upsert: true, new: true }
    );
    results.push(item);
  }
  return results;
};
