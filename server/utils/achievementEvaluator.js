import { ACHIEVEMENTS } from './achievementDefinitions.js';

/**
 * Evaluates achievements for a user based on server-authoritative state.
 *
 * @param {Object} user - The Mongoose User document
 * @param {number} completedQuestCount - Number of completed quests found in MongoDB
 * @returns {Array} Array of newly unlocked achievement objects (safe representation)
 */
export const evaluateAchievements = (user, completedQuestCount = 0) => {
  if (!user) return [];

  // Ensure user.achievements array exists
  if (!Array.isArray(user.achievements)) {
    user.achievements = [];
  }

  // Set of already unlocked achievement IDs for O(1) lookup
  const unlockedIds = new Set(user.achievements.map((a) => a.achievementId));
  const newlyUnlocked = [];

  for (const def of ACHIEVEMENTS) {
    // If not already unlocked, evaluate condition
    if (!unlockedIds.has(def.id)) {
      const satisfied = def.check(user, completedQuestCount);
      if (satisfied) {
        const unlockRecord = {
          achievementId: def.id,
          unlockedAt: new Date(),
        };

        // Add to user's persistent achievement array
        user.achievements.push(unlockRecord);
        unlockedIds.add(def.id);

        // Include full presentation metadata for frontend celebrations
        newlyUnlocked.push({
          id: def.id,
          name: def.name,
          description: def.description,
          icon: def.icon,
          rarity: def.rarity,
          unlockedAt: unlockRecord.unlockedAt,
        });
      }
    }
  }

  return newlyUnlocked;
};
