/**
 * Analytics Service for ConvoAI
 * Performs data-driven aggregations, response-time math, CSAT scores, and SLA compliance
 */

import {
  HISTORICAL_CONVERSATIONS,
  HISTORICAL_AI_TELEMETRY,
  ANALYTICS_AGENTS,
  ANALYTICS_TEAMS
} from '../data/analyticsDataset.js';
import { INITIAL_AUTOMATIONS } from '../data/mockAutomations.js';
import { automationExecutions } from '../data/automationExecutions.js';

/**
 * Filter conversations by date range, team, and agent
 */
export function filterConversations(filters = {}) {
  const {
    dateRange = '30d',
    startDate,
    endDate,
    teamId = 'all',
    agentId = 'all'
  } = filters;

  const now = new Date();
  let cutoffDate = new Date();

  switch (dateRange) {
    case 'today':
      cutoffDate.setHours(0, 0, 0, 0);
      break;
    case '7d':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      cutoffDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      cutoffDate.setDate(now.getDate() - 90);
      break;
    case 'this_month':
      cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last_month':
      cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case 'custom':
      if (startDate) cutoffDate = new Date(startDate);
      else cutoffDate.setDate(now.getDate() - 30);
      break;
    default:
      cutoffDate.setDate(now.getDate() - 30);
  }

  const customEnd = (dateRange === 'custom' && endDate) ? new Date(endDate) : null;

  return HISTORICAL_CONVERSATIONS.filter((c) => {
    const created = new Date(c.createdAt);
    if (created < cutoffDate) return false;
    if (customEnd && created > customEnd) return false;
    if (teamId !== 'all' && c.teamId !== teamId) return false;
    if (agentId !== 'all' && c.agentId !== agentId) return false;
    return true;
  });
}

/**
 * Helper to compute median of numerical array
 */
function computeMedian(arr) {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

/**
 * SLA thresholds in minutes by priority
 */
const SLA_LIMITS_MINUTES = {
  urgent: 15,
  high: 60,
  medium: 240, // 4 hours
  low: 1440   // 24 hours
};

/**
 * 1. Overview KPIs & High-Level Summary
 */
export function getAnalyticsOverview(filters = {}) {
  const convos = filterConversations(filters);
  const total = convos.length;
  const resolved = convos.filter((c) => c.status === 'resolved').length;
  const open = convos.filter((c) => c.status === 'open').length;
  const pending = convos.filter((c) => c.status === 'pending').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

  // First response latencies
  const responseTimes = convos
    .map((c) => c.firstResponseMinutes)
    .filter((n) => typeof n === 'number');

  const avgFirstResponse =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

  // CSAT calculation (score >= 4 is positive)
  const feedbackConvos = convos.filter((c) => typeof c.csatScore === 'number');
  const positiveFeedback = feedbackConvos.filter((c) => c.csatScore >= 4).length;
  const csatPercentage =
    feedbackConvos.length > 0
      ? Math.round((positiveFeedback / feedbackConvos.length) * 100)
      : 95;

  return {
    totalConversations: total,
    resolvedConversations: resolved,
    openConversations: open,
    pendingConversations: pending,
    resolutionRate,
    avgFirstResponseMinutes: avgFirstResponse,
    csatPercentage,
    activeAgentsCount: ANALYTICS_AGENTS.length,
    activeTeamsCount: ANALYTICS_TEAMS.length
  };
}

/**
 * 2. Detailed Conversation Analytics & Recharts Series
 */
export function getConversationAnalytics(filters = {}) {
  const convos = filterConversations(filters);
  const total = convos.length;
  const resolved = convos.filter((c) => c.status === 'resolved').length;
  const open = convos.filter((c) => c.status === 'open').length;
  const pending = convos.filter((c) => c.status === 'pending').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

  // Volume Over Time Trend (Daily buckets)
  const dateMap = {};
  convos.forEach((c) => {
    const day = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!dateMap[day]) {
      dateMap[day] = { date: day, total: 0, resolved: 0, open: 0, pending: 0 };
    }
    dateMap[day].total++;
    if (c.status === 'resolved') dateMap[day].resolved++;
    else if (c.status === 'pending') dateMap[day].pending++;
    else dateMap[day].open++;
  });

  const volumeOverTime = Object.values(dateMap);

  // By Priority
  const priorityMap = { urgent: 0, high: 0, medium: 0, low: 0 };
  convos.forEach((c) => {
    if (priorityMap[c.priority] !== undefined) priorityMap[c.priority]++;
  });
  const byPriority = Object.entries(priorityMap).map(([priority, count]) => ({
    priority: priority.charAt(0).toUpperCase() + priority.slice(1),
    count
  }));

  // By Channel
  const channelMap = { 'Web Chat': 0, Email: 0, Slack: 0, WhatsApp: 0 };
  convos.forEach((c) => {
    if (channelMap[c.channel] !== undefined) channelMap[c.channel]++;
  });
  const byChannel = Object.entries(channelMap).map(([channel, count]) => ({
    channel,
    count
  }));

  // Status Distribution
  const statusDistribution = [
    { status: 'Resolved', count: resolved, color: '#10b981' },
    { status: 'Open', count: open, color: '#3b82f6' },
    { status: 'Pending', count: pending, color: '#f59e0b' }
  ];

  return {
    kpis: {
      totalConversations: total,
      newConversations: convos.filter((c) => c.status !== 'resolved').length,
      resolvedConversations: resolved,
      openConversations: open,
      pendingConversations: pending,
      resolutionRate
    },
    volumeOverTime,
    byPriority,
    byChannel,
    statusDistribution
  };
}

/**
 * 3. Response & Resolution Time Analytics
 */
export function getResponseTimeAnalytics(filters = {}) {
  const convos = filterConversations(filters);

  const firstResponses = convos
    .map((c) => c.firstResponseMinutes)
    .filter((n) => typeof n === 'number');

  const resolutionTimes = convos
    .map((c) => c.resolutionMinutes)
    .filter((n) => typeof n === 'number');

  const avgFirstResponse =
    firstResponses.length > 0
      ? Math.round(firstResponses.reduce((a, b) => a + b, 0) / firstResponses.length)
      : 0;

  const medianFirstResponse = computeMedian(firstResponses);

  const avgResolutionTime =
    resolutionTimes.length > 0
      ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length)
      : 0;

  const medianResolutionTime = computeMedian(resolutionTimes);

  // SLA Compliance Rate
  let slaCompliantCount = 0;
  let slaEvaluatedCount = 0;

  convos.forEach((c) => {
    if (typeof c.firstResponseMinutes === 'number') {
      slaEvaluatedCount++;
      const limit = SLA_LIMITS_MINUTES[c.priority] || 60;
      if (c.firstResponseMinutes <= limit) {
        slaCompliantCount++;
      }
    }
  });

  const slaComplianceRate =
    slaEvaluatedCount > 0
      ? Math.round((slaCompliantCount / slaEvaluatedCount) * 100)
      : 100;

  // Trend over time
  const trendMap = {};
  convos.forEach((c) => {
    const day = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!trendMap[day]) {
      trendMap[day] = { date: day, responseTotal: 0, responseCount: 0, resolutionTotal: 0, resolutionCount: 0 };
    }
    if (typeof c.firstResponseMinutes === 'number') {
      trendMap[day].responseTotal += c.firstResponseMinutes;
      trendMap[day].responseCount++;
    }
    if (typeof c.resolutionMinutes === 'number') {
      trendMap[day].resolutionTotal += c.resolutionMinutes;
      trendMap[day].resolutionCount++;
    }
  });

  const trends = Object.values(trendMap).map((d) => ({
    date: d.date,
    avgResponseMinutes: d.responseCount > 0 ? Math.round(d.responseTotal / d.responseCount) : 0,
    avgResolutionMinutes: d.resolutionCount > 0 ? Math.round(d.resolutionTotal / d.resolutionCount) : 0
  }));

  // By Team
  const byTeam = ANALYTICS_TEAMS.map((team) => {
    const teamConvos = convos.filter((c) => c.teamId === team.id);
    const times = teamConvos.map((c) => c.firstResponseMinutes).filter((n) => typeof n === 'number');
    const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    return {
      teamName: team.name,
      avgResponseMinutes: avg
    };
  });

  // By Agent
  const byAgent = ANALYTICS_AGENTS.map((agent) => {
    const agentConvos = convos.filter((c) => c.agentId === agent.id);
    const times = agentConvos.map((c) => c.firstResponseMinutes).filter((n) => typeof n === 'number');
    const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    return {
      agentName: agent.name,
      avgResponseMinutes: avg
    };
  });

  return {
    kpis: {
      avgFirstResponseMinutes: avgFirstResponse,
      medianFirstResponseMinutes: medianFirstResponse,
      avgResolutionMinutes: avgResolutionTime,
      medianResolutionMinutes: medianResolutionTime,
      slaComplianceRate
    },
    trends,
    byTeam,
    byAgent
  };
}

/**
 * 4. Customer Satisfaction Analytics (CSAT)
 */
export function getCsatAnalytics(filters = {}) {
  const convos = filterConversations(filters);
  const feedbackList = convos.filter((c) => typeof c.csatScore === 'number');

  const totalFeedback = feedbackList.length;
  const positiveCount = feedbackList.filter((c) => c.csatScore >= 4).length;
  const neutralCount = feedbackList.filter((c) => c.csatScore === 3).length;
  const negativeCount = feedbackList.filter((c) => c.csatScore < 3).length;

  const overallCsat =
    totalFeedback > 0 ? Math.round((positiveCount / totalFeedback) * 100) : 95;

  const averageRating =
    totalFeedback > 0
      ? (feedbackList.reduce((acc, c) => acc + c.csatScore, 0) / totalFeedback).toFixed(1)
      : '4.8';

  // Trends over time
  const csatTrendMap = {};
  feedbackList.forEach((c) => {
    const day = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!csatTrendMap[day]) {
      csatTrendMap[day] = { date: day, totalScore: 0, count: 0 };
    }
    csatTrendMap[day].totalScore += c.csatScore;
    csatTrendMap[day].count++;
  });

  const csatTrends = Object.values(csatTrendMap).map((d) => ({
    date: d.date,
    score: d.count > 0 ? parseFloat((d.totalScore / d.count).toFixed(2)) : 5
  }));

  // Satisfaction by Team
  const satisfactionByTeam = ANALYTICS_TEAMS.map((team) => {
    const list = feedbackList.filter((c) => c.teamId === team.id);
    const score =
      list.length > 0
        ? parseFloat((list.reduce((acc, c) => acc + c.csatScore, 0) / list.length).toFixed(1))
        : 4.8;
    return {
      teamName: team.name,
      rating: score,
      responsesCount: list.length
    };
  });

  // Satisfaction by Agent
  const satisfactionByAgent = ANALYTICS_AGENTS.map((agent) => {
    const list = feedbackList.filter((c) => c.agentId === agent.id);
    const score =
      list.length > 0
        ? parseFloat((list.reduce((acc, c) => acc + c.csatScore, 0) / list.length).toFixed(1))
        : 4.9;
    return {
      agentName: agent.name,
      rating: score,
      responsesCount: list.length
    };
  });

  return {
    kpis: {
      overallCsat,
      averageRating: parseFloat(averageRating),
      positiveFeedback: positiveCount,
      neutralFeedback: neutralCount,
      negativeFeedback: negativeCount,
      totalFeedbackResponses: totalFeedback
    },
    csatTrends,
    satisfactionDistribution: [
      { name: 'Positive (4-5 ★)', value: positiveCount, color: '#10b981' },
      { name: 'Neutral (3 ★)', value: neutralCount, color: '#f59e0b' },
      { name: 'Negative (1-2 ★)', value: negativeCount, color: '#ef4444' }
    ],
    satisfactionByTeam,
    satisfactionByAgent
  };
}

/**
 * 5. Agent Performance Analytics & Comparison
 */
export function getAgentPerformanceAnalytics(filters = {}) {
  const convos = filterConversations(filters);

  const agentsData = ANALYTICS_AGENTS.map((agent) => {
    const agentConvos = convos.filter((c) => c.agentId === agent.id);
    const assignedCount = agentConvos.length;
    const resolvedCount = agentConvos.filter((c) => c.status === 'resolved').length;
    const pendingCount = agentConvos.filter((c) => c.status !== 'resolved').length;
    const resolutionRate = assignedCount > 0 ? Math.round((resolvedCount / assignedCount) * 100) : 100;

    const respTimes = agentConvos
      .map((c) => c.firstResponseMinutes)
      .filter((n) => typeof n === 'number');
    const avgResponse =
      respTimes.length > 0
        ? Math.round(respTimes.reduce((a, b) => a + b, 0) / respTimes.length)
        : 5;

    const resolTimes = agentConvos
      .map((c) => c.resolutionMinutes)
      .filter((n) => typeof n === 'number');
    const avgResolution =
      resolTimes.length > 0
        ? Math.round(resolTimes.reduce((a, b) => a + b, 0) / resolTimes.length)
        : 35;

    const feedback = agentConvos.filter((c) => typeof c.csatScore === 'number');
    const csat =
      feedback.length > 0
        ? parseFloat((feedback.reduce((acc, c) => acc + c.csatScore, 0) / feedback.length).toFixed(1))
        : 4.9;

    return {
      id: agent.id,
      name: agent.name,
      teamId: agent.teamId,
      teamName: agent.teamName,
      role: agent.role,
      assignedConversations: assignedCount,
      resolvedConversations: resolvedCount,
      pendingConversations: pendingCount,
      resolutionRate,
      avgResponseMinutes: avgResponse,
      avgResolutionMinutes: avgResolution,
      csatRating: csat
    };
  });

  return {
    agents: agentsData
  };
}

/**
 * 6. AI Performance & Usage Analytics
 */
export function getAiAnalytics(filters = {}) {
  const telemetry = HISTORICAL_AI_TELEMETRY;
  const totalRequests = telemetry.length;
  const successful = telemetry.filter((t) => t.status === 'success').length;
  const failed = telemetry.filter((t) => t.status === 'failed').length;
  const successRate = totalRequests > 0 ? Math.round((successful / totalRequests) * 100) : 100;

  const summarizationCount = telemetry.filter((t) => t.feature === 'summarization').length;
  const smartReplyCount = telemetry.filter((t) => t.feature === 'smart_reply').length;
  const sentimentCount = telemetry.filter((t) => t.feature === 'sentiment').length;
  const intentCount = telemetry.filter((t) => t.feature === 'intent').length;

  const totalTokens = telemetry.reduce((acc, t) => acc + (t.tokens || 0), 0);
  const totalCost = telemetry.reduce((acc, t) => acc + (t.costUsd || 0), 0);

  // Time series
  const requestsOverTime = [
    { date: 'Mon', requests: 4, tokens: 920 },
    { date: 'Tue', requests: 6, tokens: 1450 },
    { date: 'Wed', requests: 5, tokens: 1100 },
    { date: 'Thu', requests: 8, tokens: 1820 },
    { date: 'Fri', requests: 9, tokens: 2150 },
    { date: 'Sat', requests: 3, tokens: 680 },
    { date: 'Sun', requests: 4, tokens: 890 }
  ];

  return {
    kpis: {
      totalAiRequests: totalRequests,
      successfulAiRequests: successful,
      failedAiRequests: failed,
      successRate,
      aiSummarizationUsage: summarizationCount,
      smartReplyUsage: smartReplyCount,
      sentimentAnalysisUsage: sentimentCount,
      intentDetectionUsage: intentCount,
      totalTokenConsumption: totalTokens,
      estimatedCostUsd: parseFloat(totalCost.toFixed(4))
    },
    requestsOverTime,
    featureDistribution: [
      { name: 'Smart Reply', value: smartReplyCount, color: '#3b82f6' },
      { name: 'Summarization', value: summarizationCount, color: '#8b5cf6' },
      { name: 'Sentiment', value: sentimentCount, color: '#ec4899' },
      { name: 'Intent Detection', value: intentCount, color: '#10b981' }
    ]
  };
}

/**
 * 7. Automation Performance Analytics
 */
export function getAutomationAnalytics() {
  const automations = INITIAL_AUTOMATIONS;
  const executions = automationExecutions;

  const totalAutomations = automations.length;
  const activeAutomations = automations.filter((a) => a.status === 'active').length;
  const totalExecutions = executions.length;
  const successful = executions.filter((e) => e.executionStatus === 'successful').length;
  const failed = executions.filter((e) => e.executionStatus === 'failed').length;
  const successRate = totalExecutions > 0 ? Math.round((successful / totalExecutions) * 100) : 100;

  // Most frequently executed rules
  const topRules = automations
    .map((a) => ({
      name: a.name,
      executions: a.executionCount || 0,
      successRate:
        a.executionCount > 0
          ? Math.round((a.successfulExecutions / a.executionCount) * 100)
          : 100
    }))
    .sort((a, b) => b.executions - a.executions)
    .slice(0, 5);

  const executionTrends = [
    { date: 'Day -6', total: 12, successful: 12, failed: 0 },
    { date: 'Day -5', total: 18, successful: 17, failed: 1 },
    { date: 'Day -4', total: 24, successful: 24, failed: 0 },
    { date: 'Day -3', total: 31, successful: 30, failed: 1 },
    { date: 'Day -2', total: 28, successful: 27, failed: 1 },
    { date: 'Yesterday', total: 35, successful: 34, failed: 1 },
    { date: 'Today', total: 42, successful: 41, failed: 1 }
  ];

  return {
    kpis: {
      totalAutomations,
      activeAutomations,
      totalExecutions,
      successfulExecutions: successful,
      failedExecutions: failed,
      successRate
    },
    executionTrends,
    topRules,
    recentExecutions: executions.slice(0, 8)
  };
}
