import React from 'react';
import {
  Inbox,
  User,
  UserX,
  MailCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setCategory, selectCategoryCounts } from '@/app/store/slices/inboxSlice';
import { InboxCategory } from '../types/inbox';
import { cn } from '@/utils/cn';

interface CategoryItem {
  id: InboxCategory;
  label: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'all', label: 'All', icon: <Inbox className="w-3.5 h-3.5" /> },
  { id: 'my', label: 'My Conversations', icon: <User className="w-3.5 h-3.5" /> },
  { id: 'unassigned', label: 'Unassigned', icon: <UserX className="w-3.5 h-3.5" /> },
  { id: 'unread', label: 'Unread', icon: <MailCheck className="w-3.5 h-3.5" /> },
  { id: 'open', label: 'Open', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  { id: 'pending', label: 'Pending', icon: <Clock className="w-3.5 h-3.5" /> },
  { id: 'resolved', label: 'Resolved', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { id: 'high_priority', label: 'High Priority', icon: <Flame className="w-3.5 h-3.5" /> },
];

export const ConversationFilterBar: React.FC<{ className?: string }> = ({ className }) => {
  const dispatch = useAppDispatch();
  const currentCategory = useAppSelector((state) => state.inbox.filters.category);
  const counts = useAppSelector(selectCategoryCounts);

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 px-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 shrink-0 text-xs select-none',
        className
      )}
    >
      {CATEGORIES.map((cat) => {
        const count = counts[cat.id];
        const isActive = currentCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => dispatch(setCategory(cat.id))}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all duration-150',
              isActive
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold shadow-2xs border border-brand-200/60 dark:border-brand-800/80'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-transparent'
            )}
          >
            <span
              className={cn(
                'shrink-0',
                isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
              )}
            >
              {cat.icon}
            </span>
            <span>{cat.label}</span>
            <span
              className={cn(
                'text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold',
                isActive
                  ? 'bg-brand-200/60 text-brand-800 dark:bg-brand-900 dark:text-brand-200'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
