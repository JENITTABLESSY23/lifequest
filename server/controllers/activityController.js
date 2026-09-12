import Quest from '../models/Quest.js';
import { formatDateToUTCString } from '../utils/streak.js';

/**
 * @desc    Get recent 7-day quest completion activity for authenticated user
 * @route   GET /api/quests/activity
 * @access  Private (JWT protected)
 */
export const getRecentActivity = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    // Generate last 7 UTC days (ending today)
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
      days.push(d.toISOString().split('T')[0]);
    }

    const startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 6));

    // Query completed quests for authenticated user completed on or after startDate
    const completedQuests = await Quest.find({
      userId,
      completed: true,
      completedAt: { $gte: startDate },
    }).select('completedAt');

    // Create a Set of active UTC dates
    const activeDatesSet = new Set(
      completedQuests
        .map((q) => formatDateToUTCString(q.completedAt))
        .filter(Boolean)
    );

    // Map the 7-day window to boolean status with day-of-week abbreviations
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activity = days.map((dateStr) => {
      const d = new Date(`${dateStr}T00:00:00.000Z`);
      return {
        date: dateStr,
        dayName: dayNames[d.getUTCDay()],
        completed: activeDatesSet.has(dateStr),
      };
    });

    return res.status(200).json({
      success: true,
      activity,
    });
  } catch (error) {
    next(error);
  }
};
