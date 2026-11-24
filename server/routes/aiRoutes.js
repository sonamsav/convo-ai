import express from 'express';
import {
  summarizeConversation,
  generateSmartReply,
  analyzeSentiment,
  detectIntent,
  translateContent,
  getConversationInsights,
  getStatus,
  getUsage,
  getConfig,
  updateConfig,
} from '../controllers/aiController.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public telemetry & health status
router.get('/status', getStatus);
router.get('/usage', getUsage);
router.get('/config', getConfig);
router.post('/config', updateConfig);

// Rate-limited AI inference endpoints
router.post('/summarize', aiRateLimiter, summarizeConversation);
router.post('/smart-reply', aiRateLimiter, generateSmartReply);
router.post('/sentiment', aiRateLimiter, analyzeSentiment);
router.post('/detect-intent', aiRateLimiter, detectIntent);
router.post('/translate', aiRateLimiter, translateContent);
router.post('/conversation-insights', aiRateLimiter, getConversationInsights);

export default router;
