import User from '../models/User.js';
import { ACHIEVEMENTS } from '../utils/achievementDefinitions.js';

/**
 * @desc    Get canonical achievement list with authenticated user unlock status
 * @route   GET /api/achievements
 * @access  Private (JWT protected)
 */
export const getAchievements = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('achievements');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

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
      count: achievements.length,
      unlockedCount,
      achievements,
    });
  } catch (error) {
    next(error);
  }
};
