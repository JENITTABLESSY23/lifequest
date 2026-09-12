import express from 'express';
import { getProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/profile (Protected)
router.get('/', protect, getProfile);

export default router;
