import mongoose from 'mongoose';

export const VALID_REWARD_TYPES = ['AVATAR', 'THEME', 'BADGE'];
export const VALID_REWARD_RARITIES = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];

const rewardItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Reward item name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Reward item description is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Reward item type is required'],
      enum: {
        values: VALID_REWARD_TYPES,
        message: '{VALUE} is not a valid reward type',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    icon: {
      type: String,
      default: '',
      trim: true,
    },
    rarity: {
      type: String,
      required: [true, 'Reward item rarity is required'],
      enum: {
        values: VALID_REWARD_RARITIES,
        message: '{VALUE} is not a valid rarity',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Method to format safe JSON representation
rewardItemSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.__v;
  obj.id = obj._id.toString();
  return obj;
};

const RewardItem = mongoose.model('RewardItem', rewardItemSchema);

export default RewardItem;
