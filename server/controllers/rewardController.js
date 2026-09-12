import mongoose from 'mongoose';
import RewardItem from '../models/RewardItem.js';
import User from '../models/User.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc    Get all available reward shop items
 * @route   GET /api/rewards
 * @access  Public / Private (JWT protected or public browsing)
 */
export const getRewards = async (req, res, next) => {
  try {
    const items = await RewardItem.find().sort({ price: 1 });
    const safeRewards = items.map((item) => item.toSafeObject());

    return res.status(200).json({
      success: true,
      count: safeRewards.length,
      rewards: safeRewards,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Purchase a reward item using user's Gold
 * @route   POST /api/rewards/:id/purchase
 * @access  Private (JWT protected)
 */
export const purchaseReward = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate RewardItem ObjectId
    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Reward item not found',
      });
    }

    // 2. Fetch authoritative RewardItem from MongoDB
    const item = await RewardItem.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Reward item not found',
      });
    }

    // 3. Authenticated user from JWT
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 4. Check if user already owns this item (ObjectId-safe comparison)
    const alreadyOwned = Boolean(
      user.inventory &&
      user.inventory.some((inv) => {
        if (!inv || !inv.itemId) return false;
        const invId = inv.itemId._id ? inv.itemId._id : inv.itemId;
        if (typeof invId.equals === 'function') {
          return invId.equals(item._id);
        }
        return invId.toString() === item._id.toString();
      })
    );

    if (alreadyOwned) {
      return res.status(400).json({
        success: false,
        message: 'Item already owned',
      });
    }

    // 5. Check user's Gold against authoritative MongoDB item.price
    // Client-submitted price / gold / userId are completely ignored
    if ((user.gold || 0) < item.price) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient Gold',
      });
    }

    // 6. Deduct exact price and add to inventory via atomic conditional update
    const purchaseDate = new Date();
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        'inventory.itemId': { $ne: item._id },
        gold: { $gte: item.price },
      },
      {
        $inc: { gold: -item.price },
        $push: {
          inventory: {
            itemId: item._id,
            purchasedAt: purchaseDate,
          },
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      const checkUser = await User.findById(userId);
      const isNowOwned = checkUser?.inventory?.some((inv) => (inv?.itemId?._id || inv?.itemId)?.toString() === item._id.toString());
      if (isNowOwned) {
        return res.status(400).json({
          success: false,
          message: 'Item already owned',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Insufficient Gold',
      });
    }

    // 7. Construct safe populated inventory representation
    const populatedInventory = updatedUser.inventory.map((inv) => {
      const isThisItem = (inv.itemId?._id || inv.itemId).toString() === item._id.toString();
      return {
        itemId: isThisItem ? item._id.toString() : inv.itemId.toString(),
        name: isThisItem ? item.name : undefined,
        type: isThisItem ? item.type : undefined,
        rarity: isThisItem ? item.rarity : undefined,
        icon: isThisItem ? item.icon : undefined,
        purchasedAt: inv.purchasedAt,
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Reward purchased successfully',
      item: item.toSafeObject(),
      gold: updatedUser.gold,
      inventory: populatedInventory,
      user: updatedUser.toSafeObject(),
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get authenticated user's owned inventory with populated RewardItem details
 * @route   GET /api/rewards/inventory
 * @access  Private (JWT protected)
 */
export const getInventory = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    // Populate itemId reference
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

    // Format safe inventory items, handling possible null references gracefully
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

    return res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    next(error);
  }
};
