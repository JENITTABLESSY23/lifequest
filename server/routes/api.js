import express from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import questRoutes from './questRoutes.js';
import rewardRoutes from './rewardRoutes.js';
import profileRoutes from './profileRoutes.js';
import achievementRoutes from './achievementRoutes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/quests', questRoutes);
router.use('/rewards', rewardRoutes);
router.use('/profile', profileRoutes);
router.use('/achievements', achievementRoutes);

export default router;
