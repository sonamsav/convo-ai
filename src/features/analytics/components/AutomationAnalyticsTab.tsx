import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Zap,
  PlayCircle,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { AutomationAnalyticsData } from '../types/analytics';
import { Button, Badge } from '@/components/ui';

interface AutomationAnalyticsTabProps {
  data: AutomationAnalyticsData | null;
  isLoading?: boolean;
}

export const AutomationAnalyticsTab: React.FC<AutomationAnalyticsTabProps> = ({
  data,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  if (!data) return null;

  const kpis = [
    {
      label: 'Total Automation Rules',
      value: data.kpis.totalAutomations,
      subtext: 'Configured workflow pipelines',
      icon: Zap,
      color: 'text-brand-600 dark:text-brand-400',
      bgColor: 'bg-brand-50 dark:bg-brand-950/60',
    },
    {
      label: 'Active Workflows',
      value: data.kpis.activeAutomations,
      subtext: 'Live event listening',
      icon: PlayCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      label: 'Lifetime Executions',
      value: data.kpis.totalExecutions.toLocaleString(),
      subtext: 'Total action triggers',
      icon: Activity,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/60',
    },
    {
      label: 'Successful Executions',
      value: data.kpis.successfulExecutions.toLocaleString(),
      subtext: 'Passed without errors',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      label: 'Failed Executions',
      value: data.kpis.failedExecutions,
      subtext: 'Safe retry candidates',
      icon: AlertTriangle,
      color: data.kpis.failedExecutions > 0 ? 'text-rose-500' : 'text-slate-400',
      bgColor: data.kpis.failedExecutions > 0 ? 'bg-rose-50 dark:bg-rose-950/60' : 'bg-slate-50 dark:bg-slate-800',
    },
    {
      label: 'Success Reliability',
      value: `${data.kpis.successRate}%`,
      subtext: 'Workflow execution health',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                  {kpi.label}
                </span>
                <div className={`p-1.5 rounded-lg shrink-0 ${kpi.bgColor}`}>
                  <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                </div>
              </div>

              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">
                  {kpi.value}
                </span>
                <p className="mt-1 text-[11px] text-slate-500 truncate">{kpi.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Volume Trends */}
        <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Workflow Execution Trends
              </h3>
              <p className="text-xs text-slate-500">Successful vs failed workflow triggers.</p>
            </div>
            <Badge variant="neutral" size="sm">
              Past 7 Days
            </Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.executionTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="successful" name="Successful" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Frequently Executed Rules */}
        <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Top Active Automation Pipelines
              </h3>
              <p className="text-xs text-slate-500">Rules with highest execution volume.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/automation')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Manage Rules
            </Button>
          </div>

          <div className="space-y-3">
            {data.topRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 truncate max-w-[280px]">
                  <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {rule.name}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {rule.executions} runs
                  </span>
                  <Badge variant="success" size="sm">
                    {rule.successRate}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
