export type NotificationType = 'mention' | 'ticket' | 'system' | 'sla_breach' | 'ai_insight';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    ticketId?: string;
    customerName?: string;
    avatarUrl?: string;
    confidenceScore?: number;
  };
}
