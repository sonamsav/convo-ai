export type DateRangeOption = 'today' | '7days' | '30days' | '90days' | 'custom';

export interface DashboardMetrics {
  totalConversations: {
    count: number;
    change: string;
    trend: 'up' | 'down';
    timeframe: string;
  };
  activeConversations: {
    total: number;
    open: number;
    pending: number;
  };
  resolvedConversations: {
    count: number;
    rate: string;
    change: string;
  };
  avgResponseTime: {
    time: string;
    change: string;
    isImproved: boolean;
  };
  customerSatisfaction: {
    score: string;
    satisfactionTrend: string;
    totalRatings: number;
  };
  activeAgents: {
    online: number;
    total: number;
    busy: number;
  };
}

export interface ChartDataPoint {
  name: string;
  total: number;
  resolved: number;
  pending: number;
}

export interface SentimentDataPoint {
  name: 'Positive' | 'Neutral' | 'Negative';
  value: number; // percentage
  count: number;
  color: string;
}

export interface AgentPerformanceItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  status: 'online' | 'offline' | 'busy';
  assignedCount: number;
  resolvedCount: number;
  avgResponseTime: string;
  rating: number;
  role: string;
}

export interface RecentConversationItem {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
  subject: string;
  assignedAgent: {
    name: string;
    avatar: string;
  };
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'open' | 'pending' | 'resolved';
  lastUpdated: string;
  channel: 'Web Chat' | 'Email' | 'Slack' | 'WhatsApp';
}

export interface AiInsightItem {
  id: string;
  title: string;
  category: 'Complaints' | 'Billing' | 'Sentiment' | 'Performance';
  description: string;
  severity: 'high' | 'medium' | 'positive';
  recommendedAction: string;
  actionId: string;
}

export interface RecentActivityItem {
  id: string;
  type: 'resolved' | 'customer_registered' | 'high_priority_assigned' | 'member_added' | 'escalated';
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar: string;
  };
  badgeText?: string;
}
