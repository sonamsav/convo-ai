import React, { useState } from 'react';
import {
  Calendar,
  Download,
  RotateCw,
  Bell,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { PageHeader, Button, Badge } from '@/components/ui';
import { useDashboardData } from '../hooks/useDashboardData';
import { DateRangeOption } from '../types/dashboard';
import { KpiCardsSection } from '../components/KpiCardsSection';
import { ConversationAnalyticsChart } from '../components/ConversationAnalyticsChart';
import { SentimentDistributionChart } from '../components/SentimentDistributionChart';
import { AgentPerformanceTable } from '../components/AgentPerformanceTable';
import { RecentConversationsSection } from '../components/RecentConversationsSection';
import { AiInsightsPanel } from '../components/AiInsightsPanel';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { QuickActionsPanel } from '../components/QuickActionsPanel';
import { CustomDateRangeModal } from '../components/CustomDateRangeModal';
import { useAppDispatch } from '@/app/store/hooks';
import { setNotificationsDrawerOpen } from '@/app/store/slices/uiSlice';
import { addToast } from '@/app/store/slices/toastSlice';
import { cn } from '@/utils/cn';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    dateRange,
    isRefreshing,
    metrics,
    chartData,
    sentimentData,
    // Agents
    agents,
    allAgentsCount,
    agentPage,
    totalAgentPages,
    agentPageSize,
    agentSortField,
    agentSortDirection,
    setAgentPage,
    agentSearch,
    setAgentSearch,
    handleAgentSort,
    // Conversations
    conversations,
    convoSearch,
    setConvoSearch,
    convoStatus,
    setConvoStatus,
    convoPriority,
    setConvoPriority,
    // AI Insights & Activities
    aiInsights,
    recentActivities,
    // Handlers
    handleDateRangeChange,
    handleRefresh,
    handleExportReport,
  } = useDashboardData();

  const [isCustomRangeModalOpen, setIsCustomRangeModalOpen] = useState(false);

  const onSelectDateRange = (value: string) => {
    if (value === 'custom') {
      setIsCustomRangeModalOpen(true);
    } else {
      handleDateRangeChange(value as DateRangeOption);
    }
  };

  const handleApplyCustomRange = (start: string, end: string) => {
    handleDateRangeChange('custom');
    dispatch(
      addToast({
        type: 'info',
        title: 'Custom Window Applied',
        message: `Metrics filtered from ${start} to ${end}.`,
        duration: 3000,
      })
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dashboard Page Header & Controls */}
      <PageHeader
        title="Dashboard"
        description="Monitor customer conversations, team performance and AI-powered support insights."
        breadcrumbs={[{ label: 'Dashboard', isCurrent: true }]}
        badge={
          <Badge variant="primary" hasDot size="sm">
            Live Intelligence
          </Badge>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Range Selector Dropdown */}
            <div className="relative inline-flex items-center">
              <Calendar className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                aria-label="Select Date Range"
                value={dateRange}
                onChange={(e) => onSelectDateRange(e.target.value)}
                className="appearance-none pl-8.5 pr-8 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors shadow-2xs"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="custom">Custom Range...</option>
              </select>
              <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              leftIcon={
                <RotateCw
                  className={cn(
                    'w-3.5 h-3.5 text-slate-500 transition-transform duration-500',
                    isRefreshing && 'animate-spin text-brand-600'
                  )}
                />
              }
            >
              Refresh
            </Button>

            {/* Export Report Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              leftIcon={<Download className="w-3.5 h-3.5 text-slate-500" />}
            >
              Export Report
            </Button>

            {/* Quick Notifications Trigger */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                dispatch(setNotificationsDrawerOpen(true));
                dispatch(
                  addToast({
                    type: 'info',
                    title: 'System Notifications',
                    message: 'Access your latest notifications from the top navigation bar.',
                    duration: 2500,
                  })
                );
              }}
              leftIcon={<Bell className="w-3.5 h-3.5 text-slate-500" />}
            >
              Notifications
            </Button>
          </div>
        }
      />

      {/* 2. Interactive KPI Statistics Cards Grid (3 col desktop, 2 col tablet, 1 col mobile) */}
      <KpiCardsSection metrics={metrics} isLoading={isRefreshing} />

      {/* 3. Conversation Analytics & Customer Sentiment Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ConversationAnalyticsChart data={chartData} isLoading={isRefreshing} />
        </div>
        <div className="lg:col-span-1">
          <SentimentDistributionChart data={sentimentData} isLoading={isRefreshing} />
        </div>
      </div>

      {/* 4. AI Insights & Operational Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AiInsightsPanel insights={aiInsights} isLoading={isRefreshing} />
        </div>
        <div className="lg:col-span-1">
          <QuickActionsPanel />
        </div>
      </div>

      {/* 5. Agent Performance Roster Table */}
      <AgentPerformanceTable
        agents={agents}
        allAgentsCount={allAgentsCount}
        page={agentPage}
        totalPages={totalAgentPages}
        pageSize={agentPageSize}
        searchQuery={agentSearch}
        sortField={agentSortField}
        sortDirection={agentSortDirection}
        onSearchChange={setAgentSearch}
        onSortChange={handleAgentSort}
        onPageChange={setAgentPage}
        isLoading={isRefreshing}
      />

      {/* 6. Recent Priority Conversations & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentConversationsSection
            conversations={conversations}
            searchQuery={convoSearch}
            statusFilter={convoStatus}
            priorityFilter={convoPriority}
            onSearchChange={setConvoSearch}
            onStatusChange={setConvoStatus}
            onPriorityChange={setConvoPriority}
            onResetFilters={() => {
              setConvoSearch('');
              setConvoStatus('all');
              setConvoPriority('all');
            }}
            isLoading={isRefreshing}
          />
        </div>

        <div className="lg:col-span-1">
          <RecentActivityFeed activities={recentActivities} isLoading={isRefreshing} />
        </div>
      </div>

      {/* Custom Date Range Picker Modal */}
      <CustomDateRangeModal
        isOpen={isCustomRangeModalOpen}
        onClose={() => setIsCustomRangeModalOpen(false)}
        onApply={handleApplyCustomRange}
      />
    </div>
  );
};
