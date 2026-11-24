import React from 'react';
import { Users, UserPlus, UserCheck, UserX, Repeat, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setCustomerFilter, setCustomerSegment } from '@/app/store/slices/customerSlice';
import { CustomerSegment } from '../types/customer';
import { cn } from '@/utils/cn';

export const CustomerKpiCards: React.FC = () => {
  const dispatch = useAppDispatch();
  const customers = useAppSelector((state) => state.customer.customers);
  const currentSegment = useAppSelector((state) => state.customer.filters.segment);

  const total = customers.length;
  const newCount = customers.filter(
    (c) => c.status === 'lead' || new Date(c.joinedDate).getFullYear() === 2024
  ).length;
  const activeCount = customers.filter(
    (c) => c.status === 'active' || c.status === 'vip'
  ).length;
  const inactiveCount = customers.filter(
    (c) => c.status === 'inactive' || c.status === 'churn_risk'
  ).length;
  const returningCount = customers.filter((c) => c.totalConversations > 3).length;

  const kpis: {
    id: string;
    segment: CustomerSegment;
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down';
    icon: React.ReactNode;
    subtitle: string;
    accentColor: string;
  }[] = [
    {
      id: 'total',
      segment: 'all',
      title: 'Total Customers',
      value: (2480 + total - 12).toLocaleString(),
      change: '+12.4%',
      trend: 'up',
      icon: <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />,
      subtitle: `${total} curated accounts in CRM`,
      accentColor: 'border-l-brand-600',
    },
    {
      id: 'new',
      segment: 'new',
      title: 'New Customers',
      value: (342 + newCount).toLocaleString(),
      change: '+18.2%',
      trend: 'up',
      icon: <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      subtitle: 'Joined within last 60 days',
      accentColor: 'border-l-emerald-600',
    },
    {
      id: 'active',
      segment: 'all',
      title: 'Active Customers',
      value: (1895 + activeCount).toLocaleString(),
      change: '+8.7%',
      trend: 'up',
      icon: <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      subtitle: `${Math.round((activeCount / total) * 100)}% of total customer base`,
      accentColor: 'border-l-blue-600',
    },
    {
      id: 'inactive',
      segment: 'inactive',
      title: 'Inactive / Churn Risk',
      value: (243 + inactiveCount).toLocaleString(),
      change: '-3.1%',
      trend: 'down',
      icon: <UserX className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      subtitle: 'No contact >90d or high churn risk',
      accentColor: 'border-l-rose-500',
    },
    {
      id: 'returning',
      segment: 'returning',
      title: 'Returning Customers',
      value: (1120 + returningCount).toLocaleString(),
      change: '+14.6%',
      trend: 'up',
      icon: <Repeat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      subtitle: `${Math.round((returningCount / total) * 100)}% repeat engagement rate`,
      accentColor: 'border-l-indigo-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
      {kpis.map((kpi) => {
        const isSelected = currentSegment === kpi.segment && kpi.id !== 'total';

        return (
          <button
            key={kpi.id}
            type="button"
            onClick={() => dispatch(setCustomerSegment(kpi.segment))}
            className={cn(
              'flex flex-col text-left p-4 rounded-xl border bg-white dark:bg-slate-900 transition-all select-none group',
              'hover:shadow-card hover:-translate-y-0.5 cursor-pointer',
              isSelected
                ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
                : 'border-slate-200/80 dark:border-slate-800'
            )}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                {kpi.title}
              </span>
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                {kpi.icon}
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
                {kpi.value}
              </span>
              <span
                className={cn(
                  'inline-flex items-center text-[11px] font-semibold font-mono',
                  kpi.trend === 'up'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                )}
              >
                {kpi.trend === 'up' ? (
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-0.5" />
                )}
                {kpi.change}
              </span>
            </div>

            <p className="mt-1 text-[11px] text-slate-400 truncate w-full">
              {kpi.subtitle}
            </p>
          </button>
        );
      })}
    </div>
  );
};
