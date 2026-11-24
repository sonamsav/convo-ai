import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
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
  Smile,
  Meh,
  Frown,
  Star,
  TrendingUp,
  MessageSquareHeart,
  Info,
} from 'lucide-react';
import { CsatAnalyticsData } from '../types/analytics';
import { Badge } from '@/components/ui';

interface CsatAnalyticsTabProps {
  data: CsatAnalyticsData | null;
  isLoading?: boolean;
}

export const CsatAnalyticsTab: React.FC<CsatAnalyticsTabProps> = ({
  data,
  isLoading = false,
}) => {
  if (!data) return null;

  const kpis = [
    {
      label: 'Overall CSAT Score',
      value: `${data.kpis.overallCsat}%`,
      subtext: 'Percentage positive ratings (4-5 ★)',
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      label: 'Average Customer Rating',
      value: `${data.kpis.averageRating} / 5.0`,
      subtext: 'Mean rating across all surveys',
      icon: Star,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/60',
    },
    {
      label: 'Positive Feedback',
      value: data.kpis.positiveFeedback,
      subtext: '4 & 5-star ratings',
      icon: Smile,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      label: 'Neutral Feedback',
      value: data.kpis.neutralFeedback,
      subtext: '3-star ratings',
      icon: Meh,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/60',
    },
    {
      label: 'Negative Feedback',
      value: data.kpis.negativeFeedback,
      subtext: '1 & 2-star ratings',
      icon: Frown,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-950/60',
    },
    {
      label: 'Total Survey Responses',
      value: data.kpis.totalFeedbackResponses,
      subtext: 'Recorded feedback tickets',
      icon: MessageSquareHeart,
      color: 'text-brand-600 dark:text-brand-400',
      bgColor: 'bg-brand-50 dark:bg-brand-950/60',
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
        {/* CSAT Trend Line Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Customer Satisfaction Trend (1.0 to 5.0 ★)
              </h3>
              <p className="text-xs text-slate-500">
                Chronological average CSAT scores over the filtered period.
              </p>
            </div>
            <Badge variant="success" size="sm">
              Target: &gt; 4.5 ★
            </Badge>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.csatTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
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
                  dataKey="score"
                  name="CSAT Score (★)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Satisfaction Distribution Donut Chart */}
        <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Feedback Sentiment Distribution
            </h3>
            <p className="text-xs text-slate-500">Positive, neutral, and negative ratio.</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.satisfactionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {data.satisfactionDistribution.map((entry, index) => (
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

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            {data.satisfactionDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">{item.name}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {item.value} responses
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: By Team & By Agent Satisfaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Team */}
        <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Customer Rating by Team (★ 1-5)
          </h3>
          <p className="text-xs text-slate-500">Aggregated feedback scores across specialized teams.</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.satisfactionByTeam} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
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
                <Bar dataKey="rating" name="Rating (★)" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Agent */}
        <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Customer Rating by Agent (★ 1-5)
          </h3>
          <p className="text-xs text-slate-500">Individual customer satisfaction scores.</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.satisfactionByAgent} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
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
                <Bar dataKey="rating" name="Rating (★)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Info Callout */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100">Feedback Collection Integrity:</span>{' '}
          CSAT metrics are strictly calculated from customer post-resolution surveys (1 to 5 scale). Responses scoring 4 or 5 are counted as positive, 3 as neutral, and 1 or 2 as negative.
        </div>
      </div>
    </div>
  );
};
