import React from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setCustomerSegment } from '@/app/store/slices/customerSlice';
import { CustomerSegment } from '../types/customer';
import { cn } from '@/utils/cn';

export const CustomerSegmentFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentSegment = useAppSelector((state) => state.customer.filters.segment);
  const customers = useAppSelector((state) => state.customer.customers);

  const counts: Record<CustomerSegment, number> = {
    all: customers.length,
    new: customers.filter((c) => c.status === 'lead' || new Date(c.joinedDate).getFullYear() === 2024).length,
    returning: customers.filter((c) => c.totalConversations > 2).length,
    high_priority: customers.filter((c) => c.status === 'vip' || c.customerType === 'Enterprise').length,
    inactive: customers.filter((c) => c.status === 'inactive' || c.status === 'churn_risk').length,
    high_engagement: customers.filter((c) => c.totalConversations >= 10).length,
  };

  const segments: { key: CustomerSegment; label: string }[] = [
    { key: 'all', label: 'All Customers' },
    { key: 'new', label: 'New Customers' },
    { key: 'returning', label: 'Returning Customers' },
    { key: 'high_priority', label: 'High Priority / VIP' },
    { key: 'inactive', label: 'Inactive / At Risk' },
    { key: 'high_engagement', label: 'High Engagement' },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/80 dark:border-slate-800">
      {segments.map((seg) => {
        const isActive = currentSegment === seg.key;
        return (
          <button
            key={seg.key}
            type="button"
            onClick={() => dispatch(setCustomerSegment(seg.key))}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all border-b-2 -mb-px',
              isActive
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'
            )}
          >
            <span>{seg.label}</span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold',
                isActive
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              )}
            >
              {counts[seg.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
};
