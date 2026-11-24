import { useState, useMemo, useCallback } from 'react';
import { useAppDispatch } from '@/app/store/hooks';
import { addToast } from '@/app/store/slices/toastSlice';
import {
  DateRangeOption,
  DashboardMetrics,
  ChartDataPoint,
  SentimentDataPoint,
  AgentPerformanceItem,
  RecentConversationItem,
} from '../types/dashboard';
import {
  METRICS_BY_DATE_RANGE,
  CHART_DATA_BY_DATE_RANGE,
  SENTIMENT_BY_DATE_RANGE,
  MOCK_AGENTS,
  MOCK_RECENT_CONVERSATIONS,
  MOCK_AI_INSIGHTS,
  MOCK_RECENT_ACTIVITIES,
} from '../data/mockDashboardData';
import { exportDashboardCsv } from '../utils/exportDashboardCsv';

export function useDashboardData() {
  const dispatch = useAppDispatch();
  const [dateRange, setDateRange] = useState<DateRangeOption>('7days');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Agent filtering, sorting, pagination
  const [agentSearch, setAgentSearch] = useState<string>('');
  const [agentSortField, setAgentSortField] = useState<keyof AgentPerformanceItem>('rating');
  const [agentSortDirection, setAgentSortDirection] = useState<'asc' | 'desc'>('desc');
  const [agentPage, setAgentPage] = useState<number>(1);
  const agentPageSize = 4;

  // Conversation filtering
  const [convoSearch, setConvoSearch] = useState<string>('');
  const [convoStatus, setConvoStatus] = useState<string>('all');
  const [convoPriority, setConvoPriority] = useState<string>('all');

  // Change date range handler
  const handleDateRangeChange = useCallback(
    (newRange: DateRangeOption) => {
      setDateRange(newRange);
      const labels: Record<DateRangeOption, string> = {
        today: 'Today',
        '7days': 'Last 7 Days',
        '30days': 'Last 30 Days',
        '90days': 'Last 90 Days',
        custom: 'Custom Range',
      };
      dispatch(
        addToast({
          type: 'info',
          title: 'Dashboard Updated',
          message: `Showing metrics for ${labels[newRange]}.`,
          duration: 2500,
        })
      );
    },
    [dispatch]
  );

  // Simulated Refresh with loading state
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      dispatch(
        addToast({
          type: 'success',
          title: 'Data Refreshed',
          message: 'All real-time conversation queues and agent metrics updated.',
          duration: 3000,
        })
      );
    }, 600);
  }, [dispatch]);

  // Export report as CSV
  const handleExportReport = useCallback(() => {
    exportDashboardCsv(
      dateRange,
      METRICS_BY_DATE_RANGE[dateRange],
      MOCK_AGENTS,
      MOCK_RECENT_CONVERSATIONS
    );
    dispatch(
      addToast({
        type: 'success',
        title: 'Report Downloaded',
        message: `ConvoAI-Dashboard-Report-${dateRange}.csv has been generated.`,
        duration: 3500,
      })
    );
  }, [dateRange, dispatch]);

  // Filtered & Sorted Agents
  const filteredAgents = useMemo(() => {
    let result = [...MOCK_AGENTS];
    if (agentSearch.trim()) {
      const q = agentSearch.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const valA = a[agentSortField];
      const valB = b[agentSortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return agentSortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return agentSortDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
    return result;
  }, [agentSearch, agentSortField, agentSortDirection]);

  // Paginated Agents
  const paginatedAgents = useMemo(() => {
    const start = (agentPage - 1) * agentPageSize;
    return filteredAgents.slice(start, start + agentPageSize);
  }, [filteredAgents, agentPage, agentPageSize]);

  const totalAgentPages = Math.ceil(filteredAgents.length / agentPageSize);

  const handleAgentSort = useCallback(
    (field: string) => {
      const key = field as keyof AgentPerformanceItem;
      if (agentSortField === key) {
        setAgentSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setAgentSortField(key);
        setAgentSortDirection('desc');
      }
    },
    [agentSortField]
  );

  // Filtered Recent Conversations
  const filteredConversations = useMemo(() => {
    return MOCK_RECENT_CONVERSATIONS.filter((c) => {
      const matchesSearch =
        !convoSearch.trim() ||
        c.customerName.toLowerCase().includes(convoSearch.toLowerCase()) ||
        c.subject.toLowerCase().includes(convoSearch.toLowerCase()) ||
        c.ticketNumber.toLowerCase().includes(convoSearch.toLowerCase());

      const matchesStatus = convoStatus === 'all' || c.status === convoStatus;
      const matchesPriority = convoPriority === 'all' || c.priority === convoPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [convoSearch, convoStatus, convoPriority]);

  return {
    dateRange,
    isRefreshing,
    metrics: METRICS_BY_DATE_RANGE[dateRange],
    chartData: CHART_DATA_BY_DATE_RANGE[dateRange],
    sentimentData: SENTIMENT_BY_DATE_RANGE[dateRange],
    // Agent table
    agents: paginatedAgents,
    allAgentsCount: filteredAgents.length,
    agentPage,
    totalAgentPages,
    agentPageSize,
    agentSortField,
    agentSortDirection,
    setAgentPage,
    agentSearch,
    setAgentSearch,
    handleAgentSort,
    // Conversation table
    conversations: filteredConversations,
    convoSearch,
    setConvoSearch,
    convoStatus,
    setConvoStatus,
    convoPriority,
    setConvoPriority,
    // AI insights & Activity
    aiInsights: MOCK_AI_INSIGHTS,
    recentActivities: MOCK_RECENT_ACTIVITIES,
    // Actions
    handleDateRangeChange,
    handleRefresh,
    handleExportReport,
  };
}
