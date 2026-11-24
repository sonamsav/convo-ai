import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const maxRequests = Number(process.env.RATE_LIMIT_MAX) || 100;

export const aiRateLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many AI requests from this client. Please wait before retrying.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    },
  },
});
