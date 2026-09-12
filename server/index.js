import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { seedRewardItems } from './utils/seedRewards.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB, then idempotently seed canonical reward items
connectDB().then(async (connected) => {
  if (connected) {
    try {
      const seeded = await seedRewardItems();
      console.log(`[LifeQuest Server] Reward shop seeded: ${seeded.length} items ready`);
    } catch (seedErr) {
      console.warn(`[LifeQuest Server] Reward seed warning: ${seedErr.message}`);
    }
  }
});

// API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to LifeQuest API',
    healthCheck: '/api/health',
  });
});

// Centralized 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[LifeQuest Server] Running on http://localhost:${PORT}`);
  console.log(`[LifeQuest Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
