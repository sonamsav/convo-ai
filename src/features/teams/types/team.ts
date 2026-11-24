export interface TeamRecord {
  id: string;
  name: string;
  description: string;
  leadAgentId: string;
  leadAgentName: string;
  leadAgentAvatar: string;
  memberIds: string[];
  channels: ('Web Chat' | 'Email' | 'Slack' | 'WhatsApp')[];
  slaTarget: string; // e.g. "< 5m response"
  activeTickets: number;
  csat: number; // e.g. 4.92
  createdAt: string;
}
