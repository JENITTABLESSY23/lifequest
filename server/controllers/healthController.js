import mongoose from 'mongoose';

export const getHealth = (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    success: true,
    message: 'LifeQuest API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: {
      status: dbStates[dbStatus] || 'unknown',
      readyState: dbStatus,
    },
    environment: process.env.NODE_ENV || 'development',
  });
};
