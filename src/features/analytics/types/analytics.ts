/**
 * Analytics Types for ConvoAI
 */

export type AnalyticsDateRange =
  | 'today'
  | '7d'
  | '30d'
  | '90d'
  | 'this_month'
  | 'last_month'
  | 'custom';

export interface AnalyticsFilter {
  dateRange: AnalyticsDateRange;
  startDate?: string;
  endDate?: string;
  teamId?: string; // 'all' | teamId
  agentId?: string; // 'all' | agentId
}

export interface OverviewKPIs {
  totalConversations: number;
  resolvedConversations: number;
  openConversations: number;
  pendingConversations: number;
  resolutionRate: number;
  avgFirstResponseMinutes: number;
  csatPercentage: number;
  activeAgentsCount: number;
  activeTeamsCount: number;
}

export interface ConversationAnalyticsData {
  kpis: {
    totalConversations: number;
    newConversations: number;
    resolvedConversations: number;
    openConversations: number;
    pendingConversations: number;
    resolutionRate: number;
  };
  volumeOverTime: Array<{
    date: string;
    total: number;
    resolved: number;
    open: number;
    pending: number;
  }>;
  byPriority: Array<{ priority: string; count: number }>;
  byChannel: Array<{ channel: string; count: number }>;
  statusDistribution: Array<{ status: string; count: number; color: string }>;
}

export interface ResponseTimeAnalyticsData {
  kpis: {
    avgFirstResponseMinutes: number;
    medianFirstResponseMinutes: number;
    avgResolutionMinutes: number;
    medianResolutionMinutes: number;
    slaComplianceRate: number;
  };
  trends: Array<{
    date: string;
    avgResponseMinutes: number;
    avgResolutionMinutes: number;
  }>;
  byTeam: Array<{ teamName: string; avgResponseMinutes: number }>;
  byAgent: Array<{ agentName: string; avgResponseMinutes: number }>;
}

export interface CsatAnalyticsData {
  kpis: {
    overallCsat: number;
    averageRating: number;
    positiveFeedback: number;
    neutralFeedback: number;
    negativeFeedback: number;
    totalFeedbackResponses: number;
  };
  csatTrends: Array<{ date: string; score: number }>;
  satisfactionDistribution: Array<{ name: string; value: number; color: string }>;
  satisfactionByTeam: Array<{ teamName: string; rating: number; responsesCount: number }>;
  satisfactionByAgent: Array<{ agentName: string; rating: number; responsesCount: number }>;
}

export interface AgentPerformanceRecord {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  role: string;
  assignedConversations: number;
  resolvedConversations: number;
  pendingConversations: number;
  resolutionRate: number;
  avgResponseMinutes: number;
  avgResolutionMinutes: number;
  csatRating: number;
}

export interface AiAnalyticsData {
  kpis: {
    totalAiRequests: number;
    successfulAiRequests: number;
    failedAiRequests: number;
    successRate: number;
    aiSummarizationUsage: number;
    smartReplyUsage: number;
    sentimentAnalysisUsage: number;
    intentDetectionUsage: number;
    totalTokenConsumption: number;
    estimatedCostUsd: number;
  };
  requestsOverTime: Array<{ date: string; requests: number; tokens: number }>;
  featureDistribution: Array<{ name: string; value: number; color: string }>;
}

export interface AutomationAnalyticsData {
  kpis: {
    totalAutomations: number;
    activeAutomations: number;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;
  };
  executionTrends: Array<{ date: string; total: number; successful: number; failed: number }>;
  topRules: Array<{ name: string; executions: number; successRate: number }>;
  recentExecutions: any[];
}
