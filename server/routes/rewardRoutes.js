import express from 'express';
import { getRewards, purchaseReward, getInventory } from '../controllers/rewardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { seedRewardItems } from '../utils/seedRewards.js';

const router = express.Router();

// GET /api/rewards (Browse shop)
router.get('/', getRewards);

// GET /api/rewards/inventory (User inventory)
router.get('/inventory', protect, getInventory);

// POST /api/rewards/:id/purchase (Purchase reward)
router.post('/:id/purchase', protect, purchaseReward);

// POST /api/rewards/seed (TEST-ONLY — seeds initial reward items into running server DB)
// Strictly disabled and unmounted in production environments
if (process.env.NODE_ENV !== 'production') {
  router.post('/seed', async (req, res) => {
    // Defense-in-depth runtime check
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Seed endpoint is disabled in production',
      });
    }
    try {
      const items = await seedRewardItems();
      res.json({ success: true, count: items.length, items: items.map((i) => i.name) });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
}

export default router;

