import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Activity,
  CheckCircle2,
  Clock,
  Heart,
  Users,
} from 'lucide-react';
import { StatCard } from '@/components/ui';
import { DashboardMetrics } from '../types/dashboard';

interface KpiCardsSectionProps {
  metrics: DashboardMetrics;
  isLoading?: boolean;
}

export const KpiCardsSection: React.FC<KpiCardsSectionProps> = ({ metrics, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 animate-pulse flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-3 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Total Conversations */}
      <StatCard
        title="Total Conversations"
        value={metrics.totalConversations.count.toLocaleString()}
        change={{
          value: metrics.totalConversations.change,
          isPositive: metrics.totalConversations.trend === 'up',
          trend: metrics.totalConversations.trend,
          label: metrics.totalConversations.timeframe,
        }}
        icon={<MessageSquare className="w-5 h-5" />}
        iconBgColor="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
        onClick={() => navigate('/inbox')}
      />

      {/* 2. Active Conversations */}
      <StatCard
        title="Active Conversations"
        value={metrics.activeConversations.total}
        subMetrics={[
          { label: 'Open', value: metrics.activeConversations.open },
          { label: 'Pending SLA', value: metrics.activeConversations.pending },
        ]}
        icon={<Activity className="w-5 h-5" />}
        iconBgColor="bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400"
        onClick={() => navigate('/inbox?status=open')}
      />

      {/* 3. Resolved Conversations */}
      <StatCard
        title="Resolved Conversations"
        value={metrics.resolvedConversations.count.toLocaleString()}
        subMetrics={[
          { label: 'Resolution Rate', value: metrics.resolvedConversations.rate },
          { label: 'Change', value: metrics.resolvedConversations.change },
        ]}
        icon={<CheckCircle2 className="w-5 h-5" />}
        iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
        onClick={() => navigate('/inbox?status=resolved')}
      />

      {/* 4. Average Response Time */}
      <StatCard
        title="Average Response Time"
        value={metrics.avgResponseTime.time}
        change={{
          value: metrics.avgResponseTime.change,
          isPositive: metrics.avgResponseTime.isImproved,
          trend: 'up',
          label: 'first response SLA',
        }}
        icon={<Clock className="w-5 h-5" />}
        iconBgColor="bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400"
        onClick={() => navigate('/analytics?metric=response-time')}
      />

      {/* 5. Customer Satisfaction */}
      <StatCard
        title="Customer Satisfaction"
        value={metrics.customerSatisfaction.score}
        change={{
          value: metrics.customerSatisfaction.satisfactionTrend,
          isPositive: true,
          trend: 'up',
          label: `from ${metrics.customerSatisfaction.totalRatings} ratings`,
        }}
        icon={<Heart className="w-5 h-5" />}
        iconBgColor="bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
        onClick={() => navigate('/analytics?metric=csat')}
      />

      {/* 6. Active Agents */}
      <StatCard
        title="Active Agents"
        value={`${metrics.activeAgents.online} Online`}
        subMetrics={[
          { label: 'Total Roster', value: `${metrics.activeAgents.total} Reps` },
          { label: 'In Calls / Busy', value: metrics.activeAgents.busy },
        ]}
        icon={<Users className="w-5 h-5" />}
        iconBgColor="bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
        onClick={() => navigate('/agents')}
      />
    </div>
  );
};
