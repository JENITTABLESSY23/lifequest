import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const parts = req.headers.authorization.split(' ');
      if (parts.length < 2 || !parts[1] || !parts[1].trim()) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token missing',
        });
      }

      token = parts[1].trim();

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('[Auth Error] JWT_SECRET is not defined in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error',
        });
      }

      const decoded = jwt.verify(token, jwtSecret);

      if (!decoded || !decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, invalid token payload',
        });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('[Auth Middleware] Token verification failed:', error.message);
      let message = 'Not authorized, invalid token';
      if (error.name === 'TokenExpiredError') {
        message = 'Not authorized, token expired';
      } else if (error.name === 'JsonWebTokenError') {
        message = 'Not authorized, malformed token';
      }

      return res.status(401).json({
        success: false,
        message,
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, missing or invalid Authorization header format',
    });
  }
};

