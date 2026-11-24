import React, { useState } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Globe,
  Mail,
  MessageSquare,
  MessageCircle,
  Clock,
  ArrowUpDown,
  CheckCircle2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  selectConversation,
  setSearchQuery,
  setStatusFilter,
  setPriorityFilter,
  setChannelFilter,
  setAssignedAgentFilter,
  setSortBy,
  resetFilters,
  selectFilteredConversations,
} from '@/app/store/slices/inboxSlice';
import { Conversation, InboxAgent } from '../types/inbox';
import { Avatar, Badge, SearchInput, Button } from '@/components/ui';
import { cn } from '@/utils/cn';

interface ConversationListPanelProps {
  onSelectConversation?: (conversation: Conversation) => void;
  className?: string;
}

const channelIcons: Record<string, React.ReactNode> = {
  'Web Chat': <MessageSquare className="w-3 h-3 text-indigo-500" />,
  Email: <Mail className="w-3 h-3 text-sky-500" />,
  Slack: <MessageCircle className="w-3 h-3 text-emerald-500" />,
  WhatsApp: <Globe className="w-3 h-3 text-teal-500" />,
};

export const ConversationListPanel: React.FC<ConversationListPanelProps> = ({
  onSelectConversation,
  className,
}) => {
  const dispatch = useAppDispatch();
  const filteredConversations = useAppSelector(selectFilteredConversations);
  const selectedConversationId = useAppSelector((state) => state.inbox.selectedConversationId);
  const filters = useAppSelector((state) => state.inbox.filters);
  const agents = useAppSelector((state) => state.inbox.agents);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSelect = (convo: Conversation) => {
    dispatch(selectConversation(convo.id));
    if (onSelectConversation) {
      onSelectConversation(convo);
    }
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.channel !== 'all' ||
    filters.assignedAgentId !== 'all';

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 overflow-hidden select-none',
        className
      )}
    >
      {/* Search & Filter Header */}
      <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search conversations, emails..."
            value={filters.searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            onClear={() => dispatch(setSearchQuery(''))}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
            className={cn(
              'p-2 rounded-lg border text-xs transition-colors shrink-0',
              showAdvancedFilters || hasActiveFilters
                ? 'bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-950/60 dark:border-brand-800 dark:text-brand-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            )}
            title="Toggle advanced filters"
            aria-label="Toggle advanced filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Advanced Filter Controls Row */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in duration-150 text-[11px]">
            {/* Status Filter */}
            <select
              aria-label="Filter by Status"
              value={filters.status}
              onChange={(e) => dispatch(setStatusFilter(e.target.value))}
              className="px-2 py-1.5 rounded-md bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">Status: All</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Priority Filter */}
            <select
              aria-label="Filter by Priority"
              value={filters.priority}
              onChange={(e) => dispatch(setPriorityFilter(e.target.value))}
              className="px-2 py-1.5 rounded-md bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">Priority: All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Channel Filter */}
            <select
              aria-label="Filter by Channel"
              value={filters.channel}
              onChange={(e) => dispatch(setChannelFilter(e.target.value))}
              className="px-2 py-1.5 rounded-md bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">Channel: All</option>
              <option value="Web Chat">Web Chat</option>
              <option value="Email">Email</option>
              <option value="Slack">Slack</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>

            {/* Assigned Agent Filter */}
            <select
              aria-label="Filter by Agent"
              value={filters.assignedAgentId}
              onChange={(e) => dispatch(setAssignedAgentFilter(e.target.value))}
              className="px-2 py-1.5 rounded-md bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none truncate"
            >
              <option value="all">Agent: All</option>
              <option value="unassigned">Unassigned</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filter bar summary & Reset button */}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-medium">
            Showing <strong className="text-slate-700 dark:text-slate-200">{filteredConversations.length}</strong> threads
          </span>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => dispatch(resetFilters())}
                className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                dispatch(
                  setSortBy(
                    filters.sortBy === 'latest'
                      ? 'priority'
                      : filters.sortBy === 'priority'
                      ? 'oldest'
                      : 'latest'
                  )
                )
              }
              className="hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 font-mono"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span className="capitalize">{filters.sortBy}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conversation Previews List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              No conversations found
            </p>
            <p className="text-[11px] max-w-xs mx-auto leading-relaxed">
              No threads match the selected filter category or search keywords.
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => dispatch(resetFilters())}
                className="mt-2"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          filteredConversations.map((convo) => {
            const isSelected = convo.id === selectedConversationId;
            const isUnread = convo.unreadCount > 0;

            const priorityBadge = {
              urgent: 'danger',
              high: 'warning',
              medium: 'info',
              low: 'default',
            } as const;

            return (
              <div
                key={convo.id}
                onClick={() => handleSelect(convo)}
                className={cn(
                  'group relative p-3.5 transition-all duration-150 cursor-pointer flex flex-col gap-2',
                  isSelected
                    ? 'bg-brand-50/70 dark:bg-brand-950/40 border-l-3 border-brand-600 dark:border-brand-400'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-850/60 border-l-3 border-transparent',
                  isUnread && 'bg-slate-50/50 dark:bg-slate-850/30'
                )}
              >
                {/* Header Row: Customer Avatar, Name, Channel, and Timestamp */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      src={convo.customer.avatar}
                      name={convo.customer.name}
                      status={convo.customer.status === 'vip' ? 'online' : undefined}
                      size="sm"
                    />

                    <div className="truncate min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'text-xs truncate font-medium',
                            isUnread
                              ? 'font-bold text-slate-900 dark:text-slate-100'
                              : 'text-slate-800 dark:text-slate-200'
                          )}
                        >
                          {convo.customer.name}
                        </span>
                        <span
                          className="shrink-0 p-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500"
                          title={convo.channel}
                        >
                          {channelIcons[convo.channel]}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {convo.customer.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {convo.lastMessage.timestamp}
                    </span>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400" />
                    )}
                  </div>
                </div>

                {/* Subject Line */}
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-brand-600 dark:text-brand-400 font-bold shrink-0">
                    {convo.ticketNumber}
                  </span>
                  <span className="truncate">{convo.subject}</span>
                </div>

                {/* Last Message Preview */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {convo.lastMessage.isInternal && (
                    <strong className="text-amber-600 dark:text-amber-400 mr-1 font-semibold">
                      [Internal Note]
                    </strong>
                  )}
                  {convo.lastMessage.content}
                </p>

                {/* Footer Row: Priority, Status, and Assigned Agent Avatar */}
                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={priorityBadge[convo.priority]} size="sm">
                      {convo.priority}
                    </Badge>
                    <Badge
                      variant={convo.status === 'open' ? 'primary' : convo.status === 'pending' ? 'warning' : 'success'}
                      size="sm"
                    >
                      {convo.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {convo.assignedAgent ? (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Avatar
                          src={convo.assignedAgent.avatar}
                          name={convo.assignedAgent.name}
                          size="xs"
                        />
                        <span className="hidden sm:inline text-[10px] truncate max-w-[80px]">
                          {convo.assignedAgent.name.split(' ')[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px]">
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
