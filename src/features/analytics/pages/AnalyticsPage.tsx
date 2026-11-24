import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart3,
  MessageSquare,
  Clock,
  Sparkles,
  Users,
  Smile,
  Zap,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { RootState } from '@/app/store/store';
import { PageHeader, Badge, LoadingState } from '@/components/ui';
import { AnalyticsHeader } from '../components/AnalyticsHeader';
import { ConversationAnalyticsTab } from '../components/ConversationAnalyticsTab';
import { ResponseTimeAnalyticsTab } from '../components/ResponseTimeAnalyticsTab';
import { CsatAnalyticsTab } from '../components/CsatAnalyticsTab';
import { AgentPerformanceTab } from '../components/AgentPerformanceTab';
import { AiAnalyticsTab } from '../components/AiAnalyticsTab';
import { AutomationAnalyticsTab } from '../components/AutomationAnalyticsTab';
import { ReportsCenterTab } from '../components/ReportsCenterTab';
import { SavedReportsModal } from '../components/SavedReportsModal';

import {
  AnalyticsFilter,
  ConversationAnalyticsData,
  ResponseTimeAnalyticsData,
  CsatAnalyticsData,
  AgentPerformanceRecord,
  AiAnalyticsData,
  AutomationAnalyticsData,
} from '../types/analytics';
import { ReportCatalogItem, SavedReport } from '../types/reports';
import { analyticsService } from '../services/analyticsService';
import { reportService } from '../services/reportService';
import { cn } from '@/utils/cn';

type AnalyticsTabType =
  | 'conversations'
  | 'response_times'
  | 'csat'
  | 'agents'
  | 'ai'
  | 'automations'
  | 'reports';

export const AnalyticsPage: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const userRole = currentUser?.role || 'admin';
  const userId = currentUser?.id || 'usr_enterprise_01';

  // Filters state
  const [filters, setFilters] = useState<AnalyticsFilter>({
    dateRange: '30d',
    teamId: 'all',
    agentId: 'all',
  });

  const [activeTab, setActiveTab] = useState<AnalyticsTabType>('conversations');
  const [isLoading, setIsLoading] = useState(false);

  // Data states
  const [conversationData, setConversationData] = useState<ConversationAnalyticsData | null>(null);
  const [responseTimeData, setResponseTimeData] = useState<ResponseTimeAnalyticsData | null>(null);
  const [csatData, setCsatData] = useState<CsatAnalyticsData | null>(null);
  const [agentsData, setAgentsData] = useState<AgentPerformanceRecord[]>([]);
  const [aiData, setAiData] = useState<AiAnalyticsData | null>(null);
  const [automationData, setAutomationData] = useState<AutomationAnalyticsData | null>(null);
  const [reportsCatalog, setReportsCatalog] = useState<ReportCatalogItem[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);

  // Saved Reports Modal state
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [convoRes, respRes, csatRes, agentRes, aiRes, autoRes, repRes] = await Promise.all([
        analyticsService.getConversations(filters),
        analyticsService.getResponseTimes(filters),
        analyticsService.getCustomerSatisfaction(filters),
        analyticsService.getAgents(filters, userRole, userId),
        analyticsService.getAiUsage(filters),
        analyticsService.getAutomations(),
        reportService.getReports(),
      ]);

      setConversationData(convoRes);
      setResponseTimeData(respRes);
      setCsatData(csatRes);
      setAgentsData(agentRes.agents);
      setAiData(aiRes);
      setAutomationData(autoRes);
      setReportsCatalog(repRes.catalog);
      setSavedReports(repRes.savedReports);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleExportCsv = () => {
    // Export matching active tab
    const exportMap: Record<AnalyticsTabType, string> = {
      conversations: 'conversation_performance',
      response_times: 'conversation_performance',
      csat: 'customer_satisfaction',
      agents: 'agent_performance',
      ai: 'ai_usage',
      automations: 'automation_performance',
      reports: 'conversation_performance',
    };
    reportService.downloadCsv(exportMap[activeTab] || 'conversations', filters);
  };

  const handleDeleteSavedReport = async (id: string) => {
    try {
      await reportService.deleteSavedReport(id);
      setSavedReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Error deleting saved report:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        title="Analytics & Reports"
        description="Understand customer support performance, team productivity and business trends."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Analytics & Reports', isCurrent: true },
        ]}
        badge={
          <Badge variant="success" size="sm" hasDot>
            Live Business Intelligence
          </Badge>
        }
      />

      {/* Global Filter Toolbar */}
      <AnalyticsHeader
        filters={filters}
        onChangeFilters={setFilters}
        onRefresh={fetchData}
        onExportCsv={handleExportCsv}
        onOpenSavedReports={() => setIsSavedModalOpen(true)}
        isLoading={isLoading}
      />

      {/* Section Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-px text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('conversations')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors',
            activeTab === 'conversations'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Conversations</span>
        </button>

        <button
          onClick={() => setActiveTab('response_times')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors',
            activeTab === 'response_times'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          )}
        >
          <Clock className="w-4 h-4" />
          <span>Response Times & SLA</span>
        </button>

        <button
          onClick={() => setActiveTab('csat')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors',
            activeTab === 'csat'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          )}
        >
          <Smile className="w-4 h-4" />
          <span>Customer CSAT</span>
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors',
            activeTab === 'agents'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          )}
        >
          <Users className="w-4 h-4" />
          <span>Agent Performance</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors',
            activeTab === 'ai'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          )}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Intelligence</span>
        </button>

        <button
          onClick={() => setActiveTab('automations')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors',
            activeTab === 'automations'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          )}
        >
          <Zap className="w-4 h-4" />
          <span>Automation Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors',
            activeTab === 'reports'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          )}
        >
          <FileText className="w-4 h-4" />
          <span>Reports Center</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {isLoading && !conversationData ? (
        <div className="p-16 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <LoadingState message="Aggregating analytics telemetry from live platform data..." />
        </div>
      ) : (
        <div>
          {activeTab === 'conversations' && (
            <ConversationAnalyticsTab data={conversationData} isLoading={isLoading} />
          )}

          {activeTab === 'response_times' && (
            <ResponseTimeAnalyticsTab data={responseTimeData} isLoading={isLoading} />
          )}

          {activeTab === 'csat' && (
            <CsatAnalyticsTab data={csatData} isLoading={isLoading} />
          )}

          {activeTab === 'agents' && (
            <AgentPerformanceTab agents={agentsData} onExportCsv={handleExportCsv} isLoading={isLoading} />
          )}

          {activeTab === 'ai' && (
            <AiAnalyticsTab data={aiData} isLoading={isLoading} />
          )}

          {activeTab === 'automations' && (
            <AutomationAnalyticsTab data={automationData} isLoading={isLoading} />
          )}

          {activeTab === 'reports' && (
            <ReportsCenterTab
              catalog={reportsCatalog}
              savedReports={savedReports}
              currentFilter={filters}
              onRefreshReports={fetchData}
              onOpenSavedModal={() => setIsSavedModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* Saved Reports Modal */}
      <SavedReportsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedReports={savedReports}
        onDeleteReport={handleDeleteSavedReport}
        currentFilter={filters}
      />
    </div>
  );
};
