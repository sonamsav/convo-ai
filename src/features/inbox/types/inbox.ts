export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface MessageSender {
  type: 'customer' | 'agent' | 'system';
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  content: string;
  timestamp: string;
  status?: MessageDeliveryStatus;
  isInternalNote?: boolean;
  attachments?: MessageAttachment[];
}

export interface CustomerPreviousTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  date: string;
  status: 'resolved' | 'closed';
}

export interface CustomerActivityEvent {
  id: string;
  type: 'login' | 'payment' | 'plan_upgrade' | 'ticket_created' | 'nps_submitted';
  title: string;
  description: string;
  timestamp: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  company: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  status: 'active' | 'churn_risk' | 'vip' | 'lead';
  customerSince: string;
  timezone: string;
  location: string;
  tags: string[];
  totalConversations: number;
  previousTickets: CustomerPreviousTicket[];
  activityTimeline: CustomerActivityEvent[];
  notes: string;
}

export interface InboxAgent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  assignedTicketCount: number;
}

export interface Conversation {
  id: string;
  ticketNumber: string;
  customerId: string;
  customer: Customer;
  subject: string;
  channel: 'Web Chat' | 'Email' | 'Slack' | 'WhatsApp';
  status: 'open' | 'pending' | 'resolved';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignedAgent: InboxAgent | null;
  tags: string[];
  unreadCount: number;
  lastMessage: {
    content: string;
    timestamp: string;
    senderName: string;
    isInternal?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export type InboxCategory =
  | 'all'
  | 'my'
  | 'unassigned'
  | 'unread'
  | 'open'
  | 'pending'
  | 'resolved'
  | 'high_priority';

export interface InboxFilterState {
  category: InboxCategory;
  searchQuery: string;
  status: string;
  priority: string;
  channel: string;
  assignedAgentId: string;
  sortBy: 'latest' | 'oldest' | 'priority';
}

export type AiAssistanceType =
  | 'summary'
  | 'suggest_reply'
  | 'sentiment'
  | 'intent'
  | 'next_action';

export interface AiSummaryResult {
  overview: string;
  keyIssues: string[];
  customerSentiment: 'Positive' | 'Neutral' | 'Frustrated' | 'Critical';
  recommendedResolution: string;
}

export interface AiSuggestedReply {
  id: string;
  title: string;
  tone: 'Empathetic & Professional' | 'Direct & Technical' | 'Executive Concierge';
  content: string;
}

export interface AiSentimentAnalysis {
  overallScore: number; // 0 - 100
  sentimentLabel: 'Positive' | 'Neutral' | 'Negative' | 'Urgent At-Risk';
  emotionalKeywords: string[];
  churnRisk: 'Low' | 'Medium' | 'High';
}

export interface AiIntentAnalysis {
  primaryIntent: string;
  confidence: number;
  detectedEntities: { label: string; value: string }[];
  suggestedDepartment: string;
}
