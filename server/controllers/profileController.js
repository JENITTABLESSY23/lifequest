import User from '../models/User.js';
import Quest from '../models/Quest.js';
import { getProgressionStats } from '../utils/progression.js';
import { ACHIEVEMENTS } from '../utils/achievementDefinitions.js';

/**
 * @desc    Get complete RPG character profile
 * @route   GET /api/profile
 * @access  Private (JWT protected)
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    // Fetch user and populate inventory RewardItems
    const user = await User.findById(userId).populate({
      path: 'inventory.itemId',
      model: 'RewardItem',
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Authoritative completed quests count from MongoDB
    const completedQuestCount = await Quest.countDocuments({
      userId,
      completed: true,
    });

    // Format safe inventory items
    const inventory = (user.inventory || [])
      .filter((inv) => inv.itemId != null)
      .map((inv) => {
        const item = inv.itemId;
        return {
          itemId: item._id.toString(),
          name: item.name,
          description: item.description,
          type: item.type,
          rarity: item.rarity,
          icon: item.icon,
          price: item.price,
          purchasedAt: inv.purchasedAt,
        };
      });

    // Determine active avatar:
    // If user owns an AVATAR reward from Phase 6, use the latest purchased avatar; otherwise default RPG avatar
    const ownedAvatar = inventory
      .slice()
      .reverse()
      .find((item) => item.type === 'AVATAR');

    const avatar = ownedAvatar
      ? {
          id: ownedAvatar.itemId,
          name: ownedAvatar.name,
          icon: ownedAvatar.icon || 'Sparkles',
          rarity: ownedAvatar.rarity,
          isCustom: true,
        }
      : {
          id: 'DEFAULT',
          name: 'Novice Adventurer',
          icon: 'User',
          rarity: 'COMMON',
          isCustom: false,
        };

    // Progression stats
    const stats = getProgressionStats(user.xp || 0);

    // Map achievements with canonical definitions
    const userAchievementMap = new Map();
    (user.achievements || []).forEach((a) => {
      userAchievementMap.set(a.achievementId, a.unlockedAt);
    });

    const achievements = ACHIEVEMENTS.map((def) => {
      const unlocked = userAchievementMap.has(def.id);
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        rarity: def.rarity,
        requirement: def.requirement,
        unlocked,
        unlockedAt: unlocked ? userAchievementMap.get(def.id) : null,
      };
    });

    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    return res.status(200).json({
      success: true,
      profile: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        level: user.level || 1,
        xp: user.xp || 0,
        gold: user.gold || 0,
        totalGoldEarned: user.totalGoldEarned || 0,
        streak: user.streak || 0,
        longestStreak: user.longestStreak || 0,
        lastActiveDate: user.lastActiveDate,
        attributes: user.attributes || {
          intellect: 1,
          strength: 1,
          vitality: 1,
          creativity: 1,
          discipline: 1,
        },
        avatar,
        progression: {
          currentLevelXP: stats.currentLevelXP,
          xpRequiredForNextLevel: stats.xpRequiredForNextLevel,
          nextLevelXP: stats.nextLevelXP,
          progressPercentage: stats.progressPercentage,
        },
        completedQuestCount,
        inventory,
        achievements,
        achievementStats: {
          unlockedCount,
          totalCount: ACHIEVEMENTS.length,
          completionPercentage: Math.round((unlockedCount / ACHIEVEMENTS.length) * 100),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
