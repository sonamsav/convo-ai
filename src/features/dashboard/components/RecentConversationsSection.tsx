import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, ArrowUpRight, RotateCcw } from 'lucide-react';
import {
  DataTable,
  Column,
  Avatar,
  Badge,
  Button,
  SearchInput,
  Select,
} from '@/components/ui';
import { RecentConversationItem } from '../types/dashboard';
import { useAppDispatch } from '@/app/store/hooks';
import { addToast } from '@/app/store/slices/toastSlice';

interface RecentConversationsSectionProps {
  conversations: RecentConversationItem[];
  searchQuery: string;
  statusFilter: string;
  priorityFilter: string;
  onSearchChange: (q: string) => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
}

export const RecentConversationsSection: React.FC<RecentConversationsSectionProps> = ({
  conversations,
  searchQuery,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onResetFilters,
  isLoading,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleRowClick = (convo: RecentConversationItem) => {
    dispatch(
      addToast({
        type: 'info',
        title: 'Opening Conversation',
        message: `Redirecting to ${convo.ticketNumber} in Smart Inbox...`,
        duration: 2000,
      })
    );
    navigate(`/inbox?ticket=${convo.ticketNumber}`);
  };

  const columns: Column<RecentConversationItem>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.customerAvatar} name={row.customerName} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {row.customerName}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 font-mono">
                {row.channel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {row.customerEmail}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject & Ticket',
      render: (_, row) => (
        <div className="min-w-0 max-w-xs sm:max-w-md">
          <span className="font-mono text-[11px] font-bold text-brand-600 dark:text-brand-400 mr-2">
            {row.ticketNumber}
          </span>
          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
            {row.subject}
          </span>
        </div>
      ),
    },
    {
      key: 'assigned',
      header: 'Assigned Agent',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Avatar
            src={row.assignedAgent.avatar}
            name={row.assignedAgent.name}
            size="xs"
          />
          <span className="text-xs text-slate-700 dark:text-slate-300">
            {row.assignedAgent.name}
          </span>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (_, row) => {
        const priorityVariants = {
          urgent: 'danger',
          high: 'warning',
          medium: 'info',
          low: 'default',
        } as const;
        return (
          <Badge variant={priorityVariants[row.priority]} size="sm" hasDot className="capitalize">
            {row.priority}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => {
        const statusVariants = {
          open: 'primary',
          pending: 'warning',
          resolved: 'success',
        } as const;
        return (
          <Badge variant={statusVariants[row.status]} size="sm" className="capitalize">
            {row.status}
          </Badge>
        );
      },
    },
    {
      key: 'lastUpdated',
      header: 'Last Updated',
      align: 'right',
      render: (_, row) => (
        <span className="text-[11px] text-slate-400 font-mono">{row.lastUpdated}</span>
      ),
    },
  ];

  const hasActiveFilters =
    searchQuery.trim() !== '' || statusFilter !== 'all' || priorityFilter !== 'all';

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Recent Priority Conversations
            </h3>
            <Badge variant="primary" size="sm">
              {conversations.length} Active
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any row to open the conversation directly in Smart Inbox.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchInput
            placeholder="Search ticket, customer, subject..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
            className="w-full sm:w-56"
          />

          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by Status"
            className="text-xs px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">Status: All</option>
            <option value="open">Status: Open</option>
            <option value="pending">Status: Pending</option>
            <option value="resolved">Status: Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            aria-label="Filter by Priority"
            className="text-xs px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">Priority: All</option>
            <option value="urgent">Priority: Urgent</option>
            <option value="high">Priority: High</option>
            <option value="medium">Priority: Medium</option>
            <option value="low">Priority: Low</option>
          </select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/inbox')}
            rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
          >
            Inbox
          </Button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={conversations}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        emptyTitle="No Conversations Found"
        emptyDescription={
          hasActiveFilters
            ? 'No conversations match your search and filter criteria. Try resetting your filters.'
            : 'There are no active conversations in this queue.'
        }
      />
    </div>
  );
};
