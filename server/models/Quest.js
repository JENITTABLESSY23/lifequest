import mongoose from 'mongoose';
import { VALID_CATEGORIES, VALID_DIFFICULTIES } from '../utils/questRewards.js';

const questSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Quest title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: VALID_CATEGORIES,
        message: '{VALUE} is not a valid quest category',
      },
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: VALID_DIFFICULTIES,
        message: '{VALUE} is not a valid quest difficulty',
      },
    },
    xpReward: {
      type: Number,
      required: true,
    },
    goldReward: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Method to return clean object with string IDs
questSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.__v;
  obj.id = obj._id.toString();
  if (obj.userId) {
    obj.userId = obj.userId._id ? obj.userId._id.toString() : obj.userId.toString();
  }
  return obj;
};

const Quest = mongoose.model('Quest', questSchema);

export default Quest;
