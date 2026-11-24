import React, { useState } from 'react';
import { Bell, CheckCheck, Sparkles, AlertTriangle, AtSign, Info, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { markAsRead, markAllAsRead, clearAllNotifications } from '@/app/store/slices/notificationSlice';
import { AppNotification, NotificationType } from '@/types/notification';
import { Dropdown } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  ai_insight: <Sparkles className="w-3.5 h-3.5 text-violet-500" />,
  sla_breach: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
  mention: <AtSign className="w-3.5 h-3.5 text-sky-500" />,
  ticket: <Info className="w-3.5 h-3.5 text-brand-500" />,
  system: <Info className="w-3.5 h-3.5 text-slate-400" />,
};

export const NotificationsMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, unreadCount } = useAppSelector((state) => state.notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const displayedItems: AppNotification[] =
    filter === 'all'
      ? (items as AppNotification[])
      : (items as AppNotification[]).filter((n: AppNotification) => !n.read);

  const trigger = (
    <button
      type="button"
      className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="View notifications"
    >
      <Bell className="w-4 h-4" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <Dropdown trigger={trigger} align="right" width="w-80 sm:w-96">
      {/* Dropdown Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-300 text-[10px] font-semibold border border-brand-200/50 dark:border-brand-800">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(markAllAsRead());
              }}
              title="Mark all as read"
              className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 p-1 rounded"
            >
              <CheckCheck className="w-3 h-3" /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-3 py-1.5 gap-2 text-xs">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFilter('all');
          }}
          className={cn(
            'px-2 py-1 rounded font-medium transition-colors',
            filter === 'all'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          )}
        >
          All ({items.length})
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFilter('unread');
          }}
          className={cn(
            'px-2 py-1 rounded font-medium transition-colors',
            filter === 'unread'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          )}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {displayedItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            No notifications to display.
          </div>
        ) : (
          displayedItems.map((item: AppNotification) => (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                dispatch(markAsRead(item.id));
              }}
              className={cn(
                'p-3 flex items-start gap-3 transition-colors cursor-pointer text-left',
                !item.read
                  ? 'bg-brand-50/30 dark:bg-brand-950/20 hover:bg-brand-50/50'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-850'
              )}
            >
              <div className="p-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0 mt-0.5">
                {notificationIcons[item.type]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.title}
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0">{item.createdAt}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                  {item.message}
                </p>
              </div>

              {!item.read && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400 shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dispatch(clearAllNotifications());
            }}
            className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Clear list
          </button>
        </div>
      )}
    </Dropdown>
  );
};
