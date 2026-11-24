import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Globe,
  Building,
  User,
  Users,
  Bell,
  Sparkles,
  Shield,
  Layers,
  Palette,
  RefreshCw,
} from 'lucide-react';
import { PageHeader, LoadingState, ErrorState, Button } from '@/components/ui';
import { FullAppSettings } from '../types/settings';
import { settingsService } from '../services/settingsService';
import { GeneralSettingsTab } from '../components/GeneralSettingsTab';
import { WorkspaceSettingsTab } from '../components/WorkspaceSettingsTab';
import { ProfileSettingsTab } from '../components/ProfileSettingsTab';
import { TeamSettingsTab } from '../components/TeamSettingsTab';
import { NotificationSettingsTab } from '../components/NotificationSettingsTab';
import { AiConfigTab } from '../components/AiConfigTab';
import { SecuritySettingsTab } from '../components/SecuritySettingsTab';
import { IntegrationsTab } from '../components/IntegrationsTab';
import { AppearanceSettingsTab } from '../components/AppearanceSettingsTab';

const TABS = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'workspace', label: 'Workspace', icon: Building },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'ai', label: 'AI Intelligence', icon: Sparkles },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Layers },
  { id: 'appearance', label: 'Appearance', icon: Palette },
] as const;

type TabId = (typeof TABS)[number]['id'];

const FALLBACK_SETTINGS: FullAppSettings = {
  general: {
    appName: 'ConvoAI',
    workspaceName: 'Acme Global Support HQ',
    companyName: 'Acme Technologies Inc.',
    companyWebsite: 'https://acme.example.com',
    supportEmail: 'support@convoai.io',
    defaultTimezone: 'UTC',
    defaultLanguage: 'en',
    dateFormat: 'YYYY-MM-DD',
  },
  workspace: {
    planTier: 'Enterprise Growth',
    customDomain: 'support.acme.example.com',
    slaUrgentMinutes: 5,
    slaResolutionMinutes: 240,
  },
  profile: {
    name: 'Sonam Sav',
    email: 'sonam.sav@convoai.io',
    phone: '+1 (555) 019-2834',
    role: 'Lead Support Architect & Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'Oversees frontline enterprise escalation triage, SLA metrics, and customer happiness.',
  },
  notifications: {
    inApp: {
      newConversations: true,
      conversationAssignment: true,
      highPriorityConversations: true,
      negativeSentimentAlerts: true,
      agentMentions: true,
      automationFailures: true,
      dailyPerformanceSummary: false,
    },
    email: {
      newConversations: false,
      conversationAssignment: true,
      highPriorityConversations: true,
      negativeSentimentAlerts: true,
      agentMentions: true,
      automationFailures: true,
      dailyPerformanceSummary: true,
    },
  },
  ai: {
    enabled: true,
    defaultTone: 'empathetic',
    defaultLanguage: 'en',
    enableAutoSummarize: true,
    enableSentimentTelemetry: true,
    enableSmartReply: true,
    visibility: 'all_agents',
  },
  security: {
    mfaEnforced: true,
    ssoEnabled: true,
    activeSessions: [
      {
        id: 'sess-1',
        device: 'MacBook Pro 16"',
        browser: 'Google Chrome 122',
        ipAddress: '198.51.100.42',
        location: 'San Francisco, CA, USA',
        lastActive: 'Just now',
        current: true,
      },
      {
        id: 'sess-2',
        device: 'iPhone 15 Pro',
        browser: 'Mobile Safari',
        ipAddress: '198.51.100.43',
        location: 'San Francisco, CA, USA',
        lastActive: '2 hours ago',
        current: false,
      },
    ],
    loginHistory: [
      {
        id: 'log-1',
        timestamp: '2026-03-31T09:12:00Z',
        ip: '198.51.100.42',
        status: 'Success',
        location: 'San Francisco, USA',
      },
    ],
  },
  appearance: {
    theme: 'system',
    compactMode: false,
    accentColor: 'indigo',
  },
  integrations: {},
};

export const SettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as TabId) || 'general';

  const [settings, setSettings] = useState<FullAppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (err: any) {
      console.warn('Backend settings endpoint unreachable; applying fallback schema:', err);
      setSettings(FALLBACK_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleTabChange = (tabId: TabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleSaveGeneral = async (data: Partial<FullAppSettings['general']>) => {
    const updated = await settingsService.updateGeneral(data);
    setSettings((prev) => (prev ? { ...prev, general: updated } : null));
  };

  const handleSaveWorkspace = async (data: Partial<FullAppSettings['workspace']>) => {
    setSettings((prev) => (prev ? { ...prev, workspace: { ...prev.workspace, ...data } } : null));
  };

  const handleSaveProfile = async (data: Partial<FullAppSettings['profile']>) => {
    const updated = await settingsService.updateProfile(data);
    setSettings((prev) => (prev ? { ...prev, profile: updated } : null));
  };

  const handleSaveNotifications = async (data: Partial<FullAppSettings['notifications']>) => {
    const updated = await settingsService.updateNotifications(data);
    setSettings((prev) => (prev ? { ...prev, notifications: updated } : null));
  };

  const handleSaveAi = async (data: Partial<FullAppSettings['ai']>) => {
    const updated = await settingsService.updateAi(data);
    setSettings((prev) => (prev ? { ...prev, ai: updated } : null));
  };

  const handleSaveAppearance = async (data: Partial<FullAppSettings['appearance']>) => {
    const updated = await settingsService.updateAppearance(data);
    setSettings((prev) => (prev ? { ...prev, appearance: updated } : null));
  };

  if (isLoading && !settings) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingState message="Loading organization settings..." />
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="py-12">
        <ErrorState
          title="Failed to Load Settings"
          message={error}
          onRetry={fetchSettings}
        />
      </div>
    );
  }

  const activeSettings = settings || FALLBACK_SETTINGS;

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      <PageHeader
        title="Settings & Workspace Preferences"
        description="Configure organization identity, support teams, SLA metrics, AI parameters, and security policies."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Settings', isCurrent: true },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-60 shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2 shadow-card">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0" aria-label="Settings tabs">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors w-full text-left ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-1 min-w-0 w-full">
          {currentTab === 'general' && (
            <GeneralSettingsTab
              settings={activeSettings.general}
              onSave={handleSaveGeneral}
            />
          )}

          {currentTab === 'workspace' && (
            <WorkspaceSettingsTab
              settings={activeSettings.workspace}
              onSave={handleSaveWorkspace}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileSettingsTab
              profile={activeSettings.profile}
              onSave={handleSaveProfile}
            />
          )}

          {currentTab === 'team' && <TeamSettingsTab />}

          {currentTab === 'notifications' && (
            <NotificationSettingsTab
              notifications={activeSettings.notifications}
              onSave={handleSaveNotifications}
            />
          )}

          {currentTab === 'ai' && (
            <AiConfigTab
              settings={activeSettings.ai}
              onSave={handleSaveAi}
            />
          )}

          {currentTab === 'security' && (
            <SecuritySettingsTab
              security={activeSettings.security}
              onRefresh={fetchSettings}
            />
          )}

          {currentTab === 'integrations' && (
            <IntegrationsTab
              integrations={activeSettings.integrations}
              onRefresh={fetchSettings}
            />
          )}

          {currentTab === 'appearance' && (
            <AppearanceSettingsTab
              appearance={activeSettings.appearance}
              onSave={handleSaveAppearance}
            />
          )}
        </main>
      </div>
    </div>
  );
};
