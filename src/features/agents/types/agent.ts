export type AgentRole =
  | 'Admin'
  | 'Manager'
  | 'Team Lead'
  | 'Senior Agent'
  | 'Support Specialist'
  | 'AI Specialist';

export type AgentAvailability = 'online' | 'busy' | 'away' | 'offline';

export type AgentChannel = 'Web Chat' | 'Email' | 'Slack' | 'WhatsApp';

export interface AgentActivity {
  id: string;
  type: 'login' | 'status_change' | 'ticket_resolved' | 'ticket_transferred' | 'rating_received';
  description: string;
  timestamp: string;
}

export interface AgentPerformanceMonth {
  month: string;
  csat: number;
  resolutionRate: number;
  resolvedCount: number;
}

export interface AgentRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: AgentRole;
  teamId: string;
  teamName: string;
  isActive: boolean;
  availability: AgentAvailability;
  assignedChannels: AgentChannel[];
  maxConcurrentChats: number;
  currentTicketsCount: number;
  resolvedConversations: number;
  avgResponseTime: string;
  csat: number; // 0.0 - 5.0
  resolutionRate: number; // 0 - 100%
  skills: string[];
  timezone: string;
  shift: string;
  joinedDate: string;
  activityHistory: AgentActivity[];
  performanceHistory: AgentPerformanceMonth[];
}

export interface AgentFilterState {
  search: string;
  teamId: string; // 'all' | teamId
  availability: string; // 'all' | AgentAvailability
  status: string; // 'all' | 'active' | 'deactivated'
  sortBy: 'name' | 'tickets' | 'csat' | 'resolutionRate';
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}
