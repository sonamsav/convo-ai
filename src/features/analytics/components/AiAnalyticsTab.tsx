import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Cpu,
  TrendingUp,
  Info,
} from 'lucide-react';
import { AiAnalyticsData } from '../types/analytics';
import { Badge } from '@/components/ui';

interface AiAnalyticsTabProps {
  data: AiAnalyticsData | null;
  isLoading?: boolean;
}

export const AiAnalyticsTab: React.FC<AiAnalyticsTabProps> = ({
  data,
  isLoading = false,
}) => {
  if (!data) return null;

  const kpis = [
    {
      label: 'Total AI Invocations',
      value: data.kpis.totalAiRequests.toLocaleString(),
      subtext: 'Across all models',
      icon: Sparkles,
      color: 'text-brand-600 dark:text-brand-400',
      bgColor: 'bg-brand-50 dark:bg-brand-950/60',
    },
    {
      label: 'Successful Requests',
      value: data.kpis.successfulAiRequests.toLocaleString(),
      subtext: `${data.kpis.successRate}% success rate`,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      label: 'Failed Invocations',
      value: data.kpis.failedAiRequests,
      subtext: 'API rate limits / errors',
      icon: AlertTriangle,
      color: data.kpis.failedAiRequests > 0 ? 'text-rose-500' : 'text-slate-400',
      bgColor: data.kpis.failedAiRequests > 0 ? 'bg-rose-50 dark:bg-rose-950/60' : 'bg-slate-50 dark:bg-slate-800',
    },
    {
      label: 'Total Tokens Consumed',
      value: data.kpis.totalTokenConsumption.toLocaleString(),
      subtext: 'Prompt + Completion tokens',
      icon: Cpu,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      label: 'Estimated Cost (USD)',
      value: `$${data.kpis.estimatedCostUsd.toFixed(4)}`,
      subtext: 'GPT-4o blended rate ($2.50/M)',
      icon: Coins,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/60',
    },
    {
      label: 'AI Summarizations',
      value: data.kpis.aiSummarizationUsage,
      subtext: 'Ticket executive summaries',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/60',
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests & Tokens Over Time Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                AI Model Requests & Token Usage
              </h3>
              <p className="text-xs text-slate-500">
                Daily telemetry of prompt execution volumes and token consumption.
              </p>
            </div>
            <Badge variant="neutral" size="sm">
              OpenAI Engine
            </Badge>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.requestsOverTime}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="tokens" name="Tokens Consumed" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTokens)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Distribution Pie Chart */}
        <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              AI Usage by Capability
            </h3>
            <p className="text-xs text-slate-500">Feature utilization breakdown.</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.featureDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {data.featureDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            {data.featureDistribution.map((f) => (
              <div key={f.name} className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">{f.name}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {f.value} calls
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost & Token Methodology Note */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100">Cost Transparency Notice:</span>{' '}
          Estimated costs are calculated using standard OpenAI GPT-4o input/output token pricing ($2.50 per 1M input tokens, $10.00 per 1M output tokens). PII sanitization in the backend masks sensitive credentials prior to dispatch, maintaining enterprise security compliance.
        </div>
      </div>
    </div>
  );
};
