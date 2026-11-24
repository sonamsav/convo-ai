import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartDataPoint } from '../types/dashboard';
import { cn } from '@/utils/cn';

interface ConversationAnalyticsChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-modal p-3.5 text-xs space-y-2">
        <p className="font-bold text-slate-800 dark:text-slate-200 font-mono border-b border-slate-100 dark:border-slate-800 pb-1.5">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {entry.name}:
                </span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const ConversationAnalyticsChart: React.FC<ConversationAnalyticsChartProps> = ({
  data,
  isLoading,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'total' | 'resolved' | 'pending'>('all');

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card animate-pulse space-y-4">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-72 w-full bg-slate-100 dark:bg-slate-850 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Conversation Overview
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Volume progression, completed tickets, and active backlog velocity.
          </p>
        </div>

        {/* Series Filter Chips */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-lg text-xs self-start sm:self-auto">
          {(['all', 'total', 'resolved', 'pending'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilterMode(m)}
              className={cn(
                'px-2.5 py-1 rounded-md capitalize font-medium transition-all duration-150',
                filterMode === m
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[300px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-slate-100 dark:stroke-slate-800/80"
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              className="text-[11px] font-mono fill-slate-400 dark:fill-slate-500"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-[11px] font-mono fill-slate-400 dark:fill-slate-500"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
            />

            {(filterMode === 'all' || filterMode === 'total') && (
              <Area
                type="monotone"
                dataKey="total"
                name="Total Conversations"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
            )}
            {(filterMode === 'all' || filterMode === 'resolved') && (
              <Area
                type="monotone"
                dataKey="resolved"
                name="Resolved Conversations"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorResolved)"
              />
            )}
            {(filterMode === 'all' || filterMode === 'pending') && (
              <Area
                type="monotone"
                dataKey="pending"
                name="Pending Backlog"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPending)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
