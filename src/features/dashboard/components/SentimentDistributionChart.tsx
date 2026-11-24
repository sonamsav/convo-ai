import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Smile, Meh, Frown } from 'lucide-react';
import { SentimentDataPoint } from '../types/dashboard';

interface SentimentDistributionChartProps {
  data: SentimentDataPoint[];
  isLoading?: boolean;
}

const CustomSentimentTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as SentimentDataPoint;
    return (
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-modal p-3 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="font-bold text-slate-800 dark:text-slate-200">{item.name} Sentiment</span>
        </div>
        <p className="text-slate-500 font-mono text-[11px]">
          {item.count.toLocaleString()} conversations ({item.value}%)
        </p>
      </div>
    );
  }
  return null;
};

export const SentimentDistributionChart: React.FC<SentimentDistributionChartProps> = ({
  data,
  isLoading,
}) => {
  const totalAnalyzed = data.reduce((acc, curr) => acc + curr.count, 0);

  const icons = {
    Positive: <Smile className="w-4 h-4 text-emerald-500" />,
    Neutral: <Meh className="w-4 h-4 text-slate-400" />,
    Negative: <Frown className="w-4 h-4 text-rose-500" />,
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card animate-pulse space-y-4">
        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-56 w-56 rounded-full bg-slate-100 dark:bg-slate-850 mx-auto" />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Sentiment Distribution
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800">
            AI Triage
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Real-time emotional classification of incoming conversations.
        </p>
      </div>

      {/* Donut Chart with Centered Metric */}
      <div className="relative h-[200px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={58}
              outerRadius={82}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomSentimentTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text inside Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 leading-tight">
            {totalAnalyzed.toLocaleString()}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            Analyzed
          </span>
        </div>
      </div>

      {/* Visual Legend with Percentages */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex flex-col items-center text-center p-2 rounded-lg bg-slate-50/70 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-1.5 mb-1">
              {icons[item.name]}
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {item.value}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 truncate max-w-full">
              {item.name} ({item.count.toLocaleString()})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
