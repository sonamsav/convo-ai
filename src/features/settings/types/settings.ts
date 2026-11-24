/**
 * Settings Types for ConvoAI
 */

export interface GeneralSettings {
  appName: string;
  workspaceName: string;
  companyName: string;
  companyWebsite: string;
  supportEmail: string;
  defaultTimezone: string;
  defaultLanguage: string;
  dateFormat: string;
}

export interface WorkspaceSettings {
  planTier: string;
  customDomain: string;
  slaUrgentMinutes: number;
  slaResolutionMinutes: number;
}

export interface ProfileSettings {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  bio: string;
}

export interface NotificationPreferences {
  newConversations: boolean;
  conversationAssignment: boolean;
  highPriorityConversations: boolean;
  negativeSentimentAlerts: boolean;
  agentMentions: boolean;
  automationFailures: boolean;
  dailyPerformanceSummary: boolean;
}

export interface NotificationSettings {
  inApp: NotificationPreferences;
  email: NotificationPreferences;
}

export interface AiSettings {
  enabled: boolean;
  defaultTone: 'professional' | 'empathetic' | 'concise' | 'technical' | 'friendly';
  defaultLanguage: 'en' | 'hi' | 'es' | 'fr' | 'de';
  enableAutoSummarize: boolean;
  enableSentimentTelemetry: boolean;
  enableSmartReply: boolean;
  visibility: 'all_agents' | 'managers_only';
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface LoginAuditRecord {
  id: string;
  timestamp: string;
  ip: string;
  status: string;
  location: string;
}

export interface SecuritySettings {
  mfaEnforced: boolean;
  ssoEnabled: boolean;
  activeSessions: ActiveSession[];
  loginHistory: LoginAuditRecord[];
}

export interface IntegrationItem {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  model?: string;
  description: string;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  accentColor: 'indigo' | 'emerald' | 'rose' | 'blue';
}

export interface FullAppSettings {
  general: GeneralSettings;
  workspace: WorkspaceSettings;
  profile: ProfileSettings;
  notifications: NotificationSettings;
  ai: AiSettings;
  security: SecuritySettings;
  appearance: AppearanceSettings;
  integrations: Record<string, IntegrationItem>;
}
