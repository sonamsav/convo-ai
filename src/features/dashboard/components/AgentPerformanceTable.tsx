import React, { useState } from 'react';
import { Search, Star, ExternalLink, ArrowUpDown } from 'lucide-react';
import {
  DataTable,
  Column,
  Avatar,
  Badge,
  Button,
  SearchInput,
} from '@/components/ui';
import { AgentPerformanceItem } from '../types/dashboard';
import { AgentProfileModal } from './AgentProfileModal';
import { useAppDispatch } from '@/app/store/hooks';
import { addToast } from '@/app/store/slices/toastSlice';

interface AgentPerformanceTableProps {
  agents: AgentPerformanceItem[];
  allAgentsCount: number;
  page: number;
  totalPages: number;
  pageSize: number;
  searchQuery: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSearchChange: (q: string) => void;
  onSortChange: (field: string) => void;
  onPageChange: (p: number) => void;
  isLoading?: boolean;
}

export const AgentPerformanceTable: React.FC<AgentPerformanceTableProps> = ({
  agents,
  allAgentsCount,
  page,
  totalPages,
  pageSize,
  searchQuery,
  sortField,
  sortDirection,
  onSearchChange,
  onSortChange,
  onPageChange,
  isLoading,
}) => {
  const dispatch = useAppDispatch();
  const [selectedAgent, setSelectedAgent] = useState<AgentPerformanceItem | null>(null);

  const columns: Column<AgentPerformanceItem>[] = [
    {
      key: 'name',
      header: 'Agent',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatarUrl} name={row.name} status={row.status} size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {row.name}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_, row) => {
        const variants = {
          online: 'success',
          busy: 'danger',
          offline: 'neutral',
        } as const;
        return (
          <Badge variant={variants[row.status]} size="sm" hasDot className="capitalize">
            {row.status}
          </Badge>
        );
      },
    },
    {
      key: 'assignedCount',
      header: 'Assigned',
      sortable: true,
      align: 'center',
      render: (_, row) => (
        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
          {row.assignedCount}
        </span>
      ),
    },
    {
      key: 'resolvedCount',
      header: 'Resolved',
      sortable: true,
      align: 'center',
      render: (_, row) => (
        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
          {row.resolvedCount}
        </span>
      ),
    },
    {
      key: 'avgResponseTime',
      header: 'Avg. Response',
      sortable: true,
      render: (_, row) => (
        <span className="font-mono text-slate-600 dark:text-slate-400">
          {row.avgResponseTime}
        </span>
      ),
    },
    {
      key: 'rating',
      header: 'CSAT Rating',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
          <span>{row.rating.toFixed(2)}</span>
          <span className="text-[10px] text-slate-400">/ 5.0</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setSelectedAgent(row)}
          rightIcon={<ExternalLink className="w-3 h-3" />}
        >
          View Profile
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
      {/* Header and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Agent Performance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time workload, throughput resolution counts, and customer ratings.
          </p>
        </div>

        <SearchInput
          placeholder="Search agent by name, email, role..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          className="max-w-xs"
        />
      </div>

      {/* Generic Typed DataTable */}
      <DataTable
        columns={columns}
        data={agents}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        sortColumn={sortField}
        sortDirection={sortDirection}
        onSort={onSortChange}
        emptyTitle="No Agents Found"
        emptyDescription={`No support agents match your query "${searchQuery}".`}
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          pageSize: pageSize,
          totalItems: allAgentsCount,
          onPageChange: onPageChange,
        }}
      />

      {/* Agent Profile Modal */}
      <AgentProfileModal
        agent={selectedAgent}
        isOpen={Boolean(selectedAgent)}
        onClose={() => setSelectedAgent(null)}
        onAssignTicket={(ag) => {
          setSelectedAgent(null);
          dispatch(
            addToast({
              type: 'success',
              title: 'Ticket Queued to Agent',
              message: `High-priority conversation routed to ${ag.name}.`,
              duration: 3500,
            })
          );
        }}
      />
    </div>
  );
};
