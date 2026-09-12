import mongoose from 'mongoose';
import Quest from '../models/Quest.js';
import User from '../models/User.js';
import { calculateQuestRewards, VALID_CATEGORIES, VALID_DIFFICULTIES } from '../utils/questRewards.js';
import { calculateLevelFromXP, getProgressionStats, CATEGORY_TO_ATTRIBUTE } from '../utils/progression.js';
import { calculateStreak } from '../utils/streak.js';
import { checkStreakMilestone } from '../utils/streakMilestones.js';
import { evaluateAchievements } from '../utils/achievementEvaluator.js';

// ObjectId validator
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new quest
// @route   POST /api/quests
// @access  Private (JWT protected)
export const createQuest = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing request body',
      });
    }

    const { title, description, category, difficulty, dueDate } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid quest title',
      });
    }

    if (title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Quest title cannot exceed 100 characters',
      });
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
      });
    }

    if (!difficulty || !VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
      });
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Description must be a string',
      });
    }

    if (description && typeof description === 'string' && description.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 500 characters',
      });
    }


    let parsedDueDate = null;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid due date',
        });
      }
    }

    // Server-enforced rewards and authenticated userId
    const rewards = calculateQuestRewards(difficulty);

    const quest = await Quest.create({
      userId: req.user.id || req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      category,
      difficulty,
      xpReward: rewards.xpReward,
      goldReward: rewards.goldReward,
      dueDate: parsedDueDate,
    });

    return res.status(201).json({
      success: true,
      message: 'Quest created successfully',
      quest: quest.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quests for authenticated user
// @route   GET /api/quests
// @access  Private (JWT protected)
export const getQuests = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const quests = await Quest.find({ userId }).sort({ createdAt: -1 });
    const safeQuests = quests.map((q) => (typeof q.toSafeObject === 'function' ? q.toSafeObject() : q));

    return res.status(200).json({
      success: true,
      count: safeQuests.length,
      quests: safeQuests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quest by ID (ownership enforced)
// @route   GET /api/quests/:id
// @access  Private (JWT protected)
export const getQuestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found',
      });
    }

    const userId = req.user.id || req.user._id;
    const quest = await Quest.findOne({ _id: id, userId });

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found',
      });
    }

    return res.status(200).json({
      success: true,
      quest: quest.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quest (ownership enforced, server recalculates rewards if difficulty changes)
// @route   PUT /api/quests/:id
// @access  Private (JWT protected)
export const updateQuest = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing request body',
      });
    }

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found',
      });
    }

    const userId = req.user.id || req.user._id;
    const quest = await Quest.findOne({ _id: id, userId });

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found',
      });
    }

    if (quest.completed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit an already completed quest',
      });
    }

    const { title, description, category, difficulty, dueDate } = req.body;


    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Quest title cannot be empty',
        });
      }
      if (title.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Quest title cannot exceed 100 characters',
        });
      }
      quest.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description === 'string' && description.trim().length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Description cannot exceed 500 characters',
        });
      }
      quest.description = description ? description.trim() : '';
    }

    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
        });
      }
      quest.category = category;
    }

    if (difficulty !== undefined) {
      if (!VALID_DIFFICULTIES.includes(difficulty)) {
        return res.status(400).json({
          success: false,
          message: `Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
        });
      }
      quest.difficulty = difficulty;
      // Server recalculates rewards on difficulty change
      const rewards = calculateQuestRewards(difficulty);
      quest.xpReward = rewards.xpReward;
      quest.goldReward = rewards.goldReward;
    }

    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === '') {
        quest.dueDate = null;
      } else {
        const parsed = new Date(dueDate);
        if (isNaN(parsed.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Please provide a valid due date',
          });
        }
        quest.dueDate = parsed;
      }
    }

    const updatedQuest = await quest.save();

    return res.status(200).json({
      success: true,
      message: 'Quest updated successfully',
      quest: updatedQuest.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quest (ownership enforced)
// @route   DELETE /api/quests/:id
// @access  Private (JWT protected)
export const deleteQuest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found',
      });
    }

    const userId = req.user.id || req.user._id;
    const quest = await Quest.findOneAndDelete({ _id: id, userId });

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Quest deleted successfully',
      id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete quest & process RPG progression and Streak updates
// @route   POST /api/quests/:id/complete
// @access  Private (JWT protected)
export const completeQuest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found',
      });
    }

    const userId = req.user.id || req.user._id;
    const quest = await Quest.findOne({ _id: id, userId });

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found',
      });
    }

    if (quest.completed) {
      return res.status(400).json({
        success: false,
        message: 'Quest is already completed',
      });
    }

    const completionDate = new Date();

    // Atomic conditional claim of quest completion to prevent duplicate/concurrent race conditions
    const updatedQuest = await Quest.findOneAndUpdate(
      { _id: id, userId, completed: false },
      { $set: { completed: true, completedAt: completionDate } },
      { new: true }
    );

    if (!updatedQuest) {
      return res.status(400).json({
        success: false,
        message: 'Quest is already completed',
      });
    }

    // Read stored user document to apply RPG progression & streak
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 1. Capture previous RPG state
    const previousLevel = user.level || 1;
    const previousXP = user.xp || 0;
    const previousGold = user.gold || 0;
    const previousStreak = user.streak || 0;
    const previousLongestStreak = user.longestStreak || 0;
    const previousLastActiveDate = user.lastActiveDate || null;

    // 2. Map category to user attribute (+5 increase)
    const attrKey = CATEGORY_TO_ATTRIBUTE[quest.category] || 'intellect';
    if (!user.attributes) {
      user.attributes = { intellect: 1, strength: 1, vitality: 1, creativity: 1, discipline: 1 };
    }
    const previousAttributeValue = user.attributes[attrKey] || 1;
    user.attributes[attrKey] = previousAttributeValue + 5;

    // 3. Award XP & Gold (server-authoritative from quest)
    user.xp = previousXP + quest.xpReward;
    user.gold = previousGold + quest.goldReward;
    user.totalGoldEarned = (user.totalGoldEarned || 0) + quest.goldReward;

    // 4. Calculate level & detect level-up
    const newLevel = calculateLevelFromXP(user.xp);
    const levelUp = newLevel > previousLevel;
    user.level = newLevel;

    // 5. Calculate Daily Streak & Milestones
    const streakResult = calculateStreak(
      previousLastActiveDate,
      completionDate,
      previousStreak,
      previousLongestStreak
    );

    user.streak = streakResult.streak;
    user.longestStreak = streakResult.longestStreak;
    user.lastActiveDate = streakResult.lastActiveDate;

    // Check if new milestone reached
    const milestoneResult = checkStreakMilestone(previousStreak, streakResult.streak);

    // 6. Authoritative completed quest count for achievements
    const completedQuestCount = await Quest.countDocuments({ userId, completed: true });

    // 7. Evaluate server-authoritative achievements
    const unlockedAchievements = evaluateAchievements(user, completedQuestCount);

    // 8. Save updated User to MongoDB
    await user.save();


    // 10. Calculate progression statistics for client response
    const stats = getProgressionStats(user.xp);

    return res.status(200).json({
      success: true,
      message: 'Quest completed successfully',
      progression: {
        previousLevel,
        newLevel,
        levelUp,
        xpGained: quest.xpReward,
        goldGained: quest.goldReward,
        totalXP: user.xp,
        currentGold: user.gold,
        currentLevelXP: stats.currentLevelXP,
        xpRequiredForNextLevel: stats.xpRequiredForNextLevel,
        nextLevelThreshold: stats.nextLevelXP,
        progressPercentage: stats.progressPercentage,
        attribute: attrKey,
        attributeIncrease: 5,
        newAttributeValue: user.attributes[attrKey],
      },
      streak: {
        current: user.streak,
        longest: user.longestStreak,
        lastActiveDate: user.lastActiveDate,
        increased: streakResult.streakUpdated && streakResult.streak > previousStreak,
        streakUpdated: streakResult.streakUpdated,
      },
      milestone: milestoneResult,
      unlockedAchievements,
      quest: updatedQuest.toSafeObject(),
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};
