import express from 'express';
import {
  createQuest,
  getQuests,
  getQuestById,
  updateQuest,
  deleteQuest,
  completeQuest,
} from '../controllers/questController.js';
import { getRecentActivity } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all quest routes
router.use(protect);

// 7-day activity endpoint for authenticated user
router.get('/activity', getRecentActivity);

router.route('/')
  .post(createQuest)
  .get(getQuests);

router.route('/:id')
  .get(getQuestById)
  .put(updateQuest)
  .delete(deleteQuest);

router.post('/:id/complete', completeQuest);

export default router;
