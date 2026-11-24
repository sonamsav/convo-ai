import { UserProfile } from '@/types/user';
import { AppNotification } from '@/types/notification';

const getSocketUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (apiUrl && apiUrl.startsWith('http')) {
    try {
      const url = new URL(apiUrl);
      return url.origin;
    } catch {
      // fallback
    }
  }
  return typeof window !== 'undefined' && window.location.origin.startsWith('http')
    ? window.location.origin
    : 'http://localhost:5000';
};

export const APP_CONFIG = {
  name: 'ConvoAI',
  tagline: 'AI-Powered Customer Support & Conversation Intelligence',
  version: '1.0.0-rc',
  apiUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  socketUrl: getSocketUrl(),
};

export const DEFAULT_USER: UserProfile = {
  id: 'usr_enterprise_01',
  name: 'Sonam Sav',
  email: 'sonam.sav@convoai.io',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  role: 'admin',
  status: 'online',
  currentWorkspace: {
    id: 'ws_convo_hq',
    name: 'Convo Global HQ',
    plan: 'Enterprise',
  },
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    type: 'ai_insight',
    title: 'Sentiment Dip Detected',
    message: 'High churn risk identified in Enterprise conversation #CNV-8941 with Acme Corp.',
    createdAt: '5m ago',
    read: false,
    actionUrl: '/inbox',
    metadata: {
      ticketId: 'CNV-8941',
      customerName: 'Acme Corp',
      confidenceScore: 0.94,
    },
  },
  {
    id: 'notif_2',
    type: 'sla_breach',
    title: 'SLA Risk: First Response Due',
    message: 'Ticket #CNV-8940 is 8 minutes away from SLA threshold violation.',
    createdAt: '18m ago',
    read: false,
    actionUrl: '/inbox',
    metadata: {
      ticketId: 'CNV-8940',
    },
  },
  {
    id: 'notif_3',
    type: 'mention',
    title: 'Sarah Jenkins mentioned you',
    message: '@Alex can you review the custom pricing escalation on Zendesk integration?',
    createdAt: '1h ago',
    read: true,
    actionUrl: '/inbox',
  },
  {
    id: 'notif_4',
    type: 'system',
    title: 'LLM Model Auto-Tuned',
    message: 'Customer Copilot accuracy increased by 4.2% across Tier 1 triage queries.',
    createdAt: '3h ago',
    read: true,
  },
];
