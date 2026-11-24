import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface StatCardSubMetric {
  label: string;
  value: string | number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number | string;
    isPositive?: boolean;
    trend?: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: React.ReactNode;
  iconBgColor?: string;
  subtitle?: string;
  subMetrics?: StatCardSubMetric[];
  badge?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  iconBgColor = 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400',
  subtitle,
  subMetrics,
  badge,
  className,
  onClick,
}) => {
  const trend = change?.trend || (change ? (change.isPositive ? 'up' : 'down') : undefined);

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'group p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card transition-all duration-200 flex flex-col justify-between',
        onClick &&
          'cursor-pointer hover:border-brand-300 dark:hover:border-brand-700/70 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        className
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 select-none">
                {title}
              </p>
              {badge}
            </div>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {value}
            </h4>
          </div>

          {icon && (
            <div
              className={cn(
                'p-2.5 rounded-lg flex items-center justify-center shrink-0 border border-transparent transition-transform duration-200 group-hover:scale-105',
                iconBgColor
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {subMetrics && subMetrics.length > 0 ? (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            {subMetrics.map((sm, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span className="truncate">{sm.label}:</span>
                <strong className="text-slate-800 dark:text-slate-200 font-semibold font-mono">
                  {sm.value}
                </strong>
              </div>
            ))}
          </div>
        ) : (change || subtitle) ? (
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {change && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded',
                  trend === 'up'
                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50'
                    : trend === 'down'
                    ? 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/50'
                    : 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800'
                )}
              >
                {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />}
                {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />}
                {trend === 'neutral' && <Minus className="w-3.5 h-3.5 shrink-0" />}
                {change.value}
              </span>
            )}

            <span className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
              {change?.label || subtitle}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
