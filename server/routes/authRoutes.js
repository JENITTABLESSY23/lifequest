import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Internal test-only route to set simulated lastActiveDate / streak on authenticated user
if (process.env.NODE_ENV !== 'production') {
  router.patch('/test-set-streak', protect, async (req, res, next) => {
    try {
      const { streak, longestStreak, lastActiveDate } = req.body;
      const update = {};
      if (streak !== undefined) update.streak = streak;
      if (longestStreak !== undefined) update.longestStreak = longestStreak;
      if (lastActiveDate !== undefined) update.lastActiveDate = lastActiveDate ? new Date(lastActiveDate) : null;

      const user = await User.findByIdAndUpdate(req.user.id || req.user._id, update, { new: true });
      return res.status(200).json({ success: true, user: user.toSafeObject() });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/test-set-gold', protect, async (req, res, next) => {
    try {
      const { gold } = req.body;
      const user = await User.findByIdAndUpdate(req.user.id || req.user._id, { gold }, { new: true });
      return res.status(200).json({ success: true, user: user.toSafeObject() });
    } catch (err) {
      next(err);
    }
  });

  // Phase 7 non-production profile test helper (sets xp, level, totalGoldEarned, etc.)
  const handleTestSetProfile = async (req, res, next) => {
    try {
      const { xp, level, totalGoldEarned, streak, longestStreak } = req.body;
      const update = {};
      if (xp !== undefined) update.xp = xp;
      if (level !== undefined) update.level = level;
      if (totalGoldEarned !== undefined) update.totalGoldEarned = totalGoldEarned;
      if (streak !== undefined) update.streak = streak;
      if (longestStreak !== undefined) update.longestStreak = longestStreak;

      const user = await User.findByIdAndUpdate(req.user.id || req.user._id, update, { new: true });
      return res.status(200).json({ success: true, user: user.toSafeObject() });
    } catch (err) {
      next(err);
    }
  };

  router.patch('/test-set-profile', protect, handleTestSetProfile);
  router.patch('/test-set-stats', protect, handleTestSetProfile);
}

export default router;
