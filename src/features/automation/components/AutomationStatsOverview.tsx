import React from 'react';
import {
  Zap,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { AutomationStats } from '../types/automation';
import { cn } from '@/utils/cn';

interface AutomationStatsOverviewProps {
  stats: AutomationStats;
  onFilterClick?: (status: 'all' | 'active' | 'paused') => void;
  className?: string;
}

export const AutomationStatsOverview: React.FC<AutomationStatsOverviewProps> = ({
  stats,
  onFilterClick,
  className,
}) => {
  const successRate =
    stats.totalExecutions > 0
      ? Math.round((stats.successfulExecutions / stats.totalExecutions) * 100)
      : 100;

  const cards = [
    {
      id: 'total',
      label: 'Total Automations',
      value: stats.totalAutomations,
      subtext: `${stats.activeAutomations} active, ${stats.pausedAutomations} paused`,
      icon: Zap,
      iconColor: 'text-brand-600 dark:text-brand-400',
      bgColor: 'bg-brand-50 dark:bg-brand-950/60',
      onClick: () => onFilterClick?.('all'),
    },
    {
      id: 'active',
      label: 'Active Rules',
      value: stats.activeAutomations,
      subtext: 'Monitoring live events',
      icon: PlayCircle,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
      onClick: () => onFilterClick?.('active'),
    },
    {
      id: 'paused',
      label: 'Paused Rules',
      value: stats.pausedAutomations,
      subtext: 'Disabled from execution',
      icon: PauseCircle,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/60',
      onClick: () => onFilterClick?.('paused'),
    },
    {
      id: 'executions',
      label: 'Total Executions',
      value: stats.totalExecutions.toLocaleString(),
      subtext: 'Lifetime workflow runs',
      icon: Activity,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/60',
    },
    {
      id: 'success',
      label: 'Successful Executions',
      value: stats.successfulExecutions.toLocaleString(),
      subtext: `${successRate}% reliability score`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      id: 'failed',
      label: 'Failed Executions',
      value: stats.failedExecutions.toLocaleString(),
      subtext: stats.failedExecutions === 0 ? 'Zero active errors' : 'Requires retry inspection',
      icon: AlertTriangle,
      iconColor:
        stats.failedExecutions > 0
          ? 'text-rose-600 dark:text-rose-400'
          : 'text-slate-400 dark:text-slate-500',
      bgColor:
        stats.failedExecutions > 0
          ? 'bg-rose-50 dark:bg-rose-950/60'
          : 'bg-slate-50 dark:bg-slate-800/40',
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4', className)}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.onClick}
            className={cn(
              'p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card transition-all duration-150',
              card.onClick ? 'cursor-pointer hover:border-brand-300 dark:hover:border-brand-700/60 hover:shadow-card-hover' : ''
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 truncate">
                {card.label}
              </span>
              <div className={cn('p-1.5 rounded-lg shrink-0', card.bgColor)}>
                <Icon className={cn('w-3.5 h-3.5', card.iconColor)} />
              </div>
            </div>

            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">
                {card.value}
              </span>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
