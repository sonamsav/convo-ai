import React from 'react';
import {
  CheckCircle2,
  UserPlus,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';
import { RecentActivityItem } from '../types/dashboard';

interface RecentActivityFeedProps {
  activities: RecentActivityItem[];
  isLoading?: boolean;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  isLoading,
}) => {
  const activityIcons = {
    resolved: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    customer_registered: <UserPlus className="w-3.5 h-3.5 text-brand-500" />,
    high_priority_assigned: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />,
    member_added: <UserCheck className="w-3.5 h-3.5 text-sky-500" />,
    escalated: <TrendingUp className="w-3.5 h-3.5 text-amber-500" />,
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card animate-pulse space-y-4">
        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-slate-100 dark:bg-slate-850" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Recent Activity Feed
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit trail of agent resolutions, customer events, and assignments.
          </p>
        </div>
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
          <Clock className="w-3 h-3" /> Live
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {activities.map((act) => (
          <div
            key={act.id}
            className="py-3 flex items-start gap-3 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-850/40 rounded-lg px-2 -mx-2"
          >
            <div className="relative mt-0.5 shrink-0">
              <Avatar src={act.user.avatar} name={act.user.name} size="sm" />
              <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
                {activityIcons[act.type]}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {act.title}
                </p>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {act.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {act.description}
              </p>
            </div>

            {act.badgeText && (
              <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 shrink-0 self-center">
                {act.badgeText}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
