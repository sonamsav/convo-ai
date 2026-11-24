export type CustomerType = 'Enterprise' | 'Mid-Market' | 'SMB' | 'Startup';

export type CustomerStatus = 'active' | 'inactive' | 'churn_risk' | 'vip' | 'lead';

export type CustomerSentiment = 'Positive' | 'Neutral' | 'Negative';

export type CustomerSegment =
  | 'all'
  | 'new'
  | 'returning'
  | 'high_priority'
  | 'inactive'
  | 'high_engagement';

export interface CustomerNote {
  id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface CustomerTimelineEvent {
  id: string;
  type: 'login' | 'payment' | 'plan_upgrade' | 'ticket_created' | 'ticket_resolved' | 'nps_submitted' | 'note_added';
  title: string;
  description: string;
  timestamp: string;
  category: 'support' | 'billing' | 'account' | 'security';
}

export interface CustomerAiInsights {
  summary: string;
  topTopics: string[];
  sentimentScore: number; // 0-100
  sentimentLabel: 'Positive' | 'Neutral' | 'Negative';
  churnRisk: 'Low' | 'Medium' | 'High';
  recommendedActions: string[];
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  avatar: string;
  customerType: CustomerType;
  status: CustomerStatus;
  sentiment: CustomerSentiment;
  location: string;
  timezone: string;
  joinedDate: string;
  lastInteraction: string;
  lastInteractionTimestamp: number;
  totalConversations: number;
  resolvedConversations: number;
  avgResponseTime: string;
  csat: number; // 0.0 - 5.0
  mrr: string;
  tags: string[];
  notes: CustomerNote[];
  timeline: CustomerTimelineEvent[];
  accountManager: string;
  insights: CustomerAiInsights;
}

export interface CustomerFilterState {
  search: string;
  segment: CustomerSegment;
  status: string; // 'all' | CustomerStatus
  type: string; // 'all' | CustomerType
  sentiment: string; // 'all' | CustomerSentiment
  sortBy: 'name' | 'lastInteraction' | 'totalConversations' | 'csat';
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}
