import express from 'express';
import {
  getOverview,
  getConversations,
  getResponseTimes,
  getCustomerSatisfaction,
  getAgents,
  getAiUsage,
  getAutomations
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/overview', getOverview);
router.get('/conversations', getConversations);
router.get('/response-times', getResponseTimes);
router.get('/customer-satisfaction', getCustomerSatisfaction);
router.get('/agents', getAgents);
router.get('/ai-usage', getAiUsage);
router.get('/automations', getAutomations);

export default router;
