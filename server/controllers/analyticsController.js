/**
 * Analytics Controller for ConvoAI
 */

import {
  getAnalyticsOverview,
  getConversationAnalytics,
  getResponseTimeAnalytics,
  getCsatAnalytics,
  getAgentPerformanceAnalytics,
  getAiAnalytics,
  getAutomationAnalytics
} from '../services/analyticsService.js';

export async function getOverview(req, res, next) {
  try {
    const data = getAnalyticsOverview(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getConversations(req, res, next) {
  try {
    const data = getConversationAnalytics(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getResponseTimes(req, res, next) {
  try {
    const data = getResponseTimeAnalytics(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerSatisfaction(req, res, next) {
  try {
    const data = getCsatAnalytics(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getAgents(req, res, next) {
  try {
    const userRole = req.headers['x-user-role'] || 'admin';
    const currentUserId = req.headers['x-user-id'] || 'usr_enterprise_01';

    let data = getAgentPerformanceAnalytics(req.query);

    // If an agent role calls this endpoint, filter only to their own performance
    if (userRole === 'agent') {
      data = {
        agents: data.agents.filter((a) => a.id === currentUserId)
      };
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getAiUsage(req, res, next) {
  try {
    const data = getAiAnalytics(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getAutomations(req, res, next) {
  try {
    const data = getAutomationAnalytics();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
