import React from 'react';
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
import { Clock, ShieldCheck, Timer, Zap, Info } from 'lucide-react';
import { ResponseTimeAnalyticsData } from '../types/analytics';
import { Badge } from '@/components/ui';

interface ResponseTimeAnalyticsTabProps {
  data: ResponseTimeAnalyticsData | null;
  isLoading?: boolean;
}

export const ResponseTimeAnalyticsTab: React.FC<ResponseTimeAnalyticsTabProps> = ({
  data,
  isLoading = false,
}) => {
  if (!data) return null;

  const kpis = [
    {
      label: 'Avg. First Response',
      value: `${data.kpis.avgFirstResponseMinutes}m`,
      subtext: 'Mean time to first agent reply',
      icon: Clock,
      color: 'text-brand-600 dark:text-brand-400',
      bgColor: 'bg-brand-50 dark:bg-brand-950/60',
    },
    {
      label: 'Median First Response',
      value: `${data.kpis.medianFirstResponseMinutes}m`,
      subtext: '50th percentile latency',
      icon: Timer,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      label: 'Avg. Resolution Time',
      value: `${data.kpis.avgResolutionMinutes}m`,
      subtext: 'Mean ticket close duration',
      icon: Zap,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/60',
    },
    {
      label: 'Median Resolution',
      value: `${data.kpis.medianResolutionMinutes}m`,
      subtext: '50th percentile resolution',
      icon: Timer,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/60',
    },
    {
      label: 'SLA Compliance Rate',
      value: `${data.kpis.slaComplianceRate}%`,
      subtext: 'Met priority SLA target',
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 5 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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

      {/* Response & Resolution Trend Line Chart */}
      <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Response & Resolution Latency Trends (Minutes)
            </h3>
            <p className="text-xs text-slate-500">
              Chronological tracking of average first reply speeds and ticket resolution duration.
            </p>
          </div>
          <Badge variant="info" size="sm">
            Lower is Better
          </Badge>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trends}>
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
              <Line
                type="monotone"
                dataKey="avgResponseMinutes"
                name="Avg. First Response (min)"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="avgResolutionMinutes"
                name="Avg. Resolution (min)"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* By Team & By Agent Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Team Bar Chart */}
        <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Average First Response by Team (Minutes)
          </h3>
          <p className="text-xs text-slate-500">Benchmark speed across specialized support desks.</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byTeam} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="teamName" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={140} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="avgResponseMinutes" name="Avg. Response (min)" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Agent Bar Chart */}
        <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Average First Response by Agent (Minutes)
          </h3>
          <p className="text-xs text-slate-500">Individual responsiveness metrics.</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byAgent} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="agentName" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={110} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="avgResponseMinutes" name="Avg. Response (min)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SLA Calculation Methodology Note */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100">Calculation Methodology:</span>{' '}
          SLA Compliance Rate evaluates conversations against priority targets (Urgent: ≤15m, High: ≤60m, Medium: ≤240m, Low: ≤1440m). Tickets exceeding their target before first agent response are classified as breached.
        </div>
      </div>
    </div>
  );
};
