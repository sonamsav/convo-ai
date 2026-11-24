import React, { useState } from 'react';
import {
  Zap,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  Eye,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { AutomationRule, TriggerType } from '../types/automation';
import { Badge, Button, ConfirmationDialog } from '@/components/ui';
import { cn } from '@/utils/cn';

interface AutomationTableProps {
  automations: AutomationRule[];
  onViewDetails: (rule: AutomationRule) => void;
  onEdit: (rule: AutomationRule) => void;
  onDuplicate: (rule: AutomationRule) => void;
  onToggleStatus: (rule: AutomationRule) => void;
  onDelete: (rule: AutomationRule) => void;
  userRole?: string;
}

const TRIGGER_LABELS: Record<TriggerType, { label: string; iconColor: string }> = {
  new_conversation_created: { label: 'New Conversation', iconColor: 'text-amber-500' },
  new_message_received: { label: 'New Message', iconColor: 'text-blue-500' },
  conversation_assigned: { label: 'Conversation Assigned', iconColor: 'text-indigo-500' },
  conversation_status_changed: { label: 'Status Changed', iconColor: 'text-purple-500' },
  priority_changed: { label: 'Priority Changed', iconColor: 'text-rose-500' },
  customer_created: { label: 'Customer Created', iconColor: 'text-emerald-500' },
  customer_sentiment_changed: { label: 'Sentiment Changed', iconColor: 'text-pink-500' },
  conversation_inactive: { label: 'Conversation Inactive', iconColor: 'text-orange-500' },
  scheduled_time: { label: 'Scheduled Time', iconColor: 'text-cyan-500' },
};

export const AutomationTable: React.FC<AutomationTableProps> = ({
  automations,
  onViewDetails,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onDelete,
  userRole = 'admin',
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [triggerFilter, setTriggerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'executions' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Active action menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Deletion modal
  const [deleteRuleTarget, setDeleteRuleTarget] = useState<AutomationRule | null>(null);

  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canDelete = userRole === 'admin' || userRole === 'owner';

  // Filtering
  const filtered = automations.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(search.toLowerCase()) ||
      rule.description.toLowerCase().includes(search.toLowerCase()) ||
      rule.trigger.label.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || rule.status === statusFilter;
    const matchesTrigger = triggerFilter === 'all' || rule.trigger.type === triggerFilter;

    return matchesSearch && matchesStatus && matchesTrigger;
  });

  // Sorting
  filtered.sort((a, b) => {
    let valA: any = a.updatedAt;
    let valB: any = b.updatedAt;

    if (sortBy === 'name') {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    } else if (sortBy === 'executions') {
      valA = a.executionCount;
      valB = b.executionCount;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (col: 'name' | 'executions' | 'updatedAt') => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  const formatLastRun = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search automation rules..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="relative">
            <select
              value={triggerFilter}
              onChange={(e) => {
                setTriggerFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter automations by trigger type"
              className="text-xs py-1.5 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Triggers</option>
              {Object.entries(TRIGGER_LABELS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
          {(['all', 'active', 'paused'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors',
                statusFilter === s
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Automation</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Trigger</th>
                <th className="py-3 px-4">Status</th>
                <th
                  onClick={() => toggleSort('executions')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Executions</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('updatedAt')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Last Run</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Created By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Zap className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        No automation rules found
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                        Try adjusting your search criteria or create a new automation rule.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((rule) => {
                  const triggerInfo = TRIGGER_LABELS[rule.trigger.type] || {
                    label: rule.trigger.label,
                    iconColor: 'text-brand-500',
                  };

                  return (
                    <tr
                      key={rule.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Description */}
                      <td className="py-3.5 px-4 min-w-[240px]">
                        <div className="space-y-1">
                          <button
                            onClick={() => onViewDetails(rule)}
                            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 text-left transition-colors"
                          >
                            {rule.name}
                          </button>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {rule.description}
                          </p>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-[10px] text-slate-400">
                              {rule.actions.length} action{rule.actions.length === 1 ? '' : 's'}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-[10px] text-slate-400">
                              {rule.conditionGroups.length} condition group{rule.conditionGroups.length === 1 ? '' : 's'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Trigger */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Zap className={cn('w-3.5 h-3.5 shrink-0', triggerInfo.iconColor)} />
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {triggerInfo.label}
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-3.5 px-4">
                        <button
                          disabled={!canEdit}
                          onClick={() => onToggleStatus(rule)}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors',
                            rule.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                            canEdit ? 'hover:opacity-85 cursor-pointer' : 'cursor-default'
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              rule.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            )}
                          />
                          <span className="capitalize">{rule.status}</span>
                        </button>
                      </td>

                      {/* Executions */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {rule.executionCount.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span className="text-emerald-600 dark:text-emerald-400">
                              ✓ {rule.successfulExecutions}
                            </span>
                            {rule.failedExecutions > 0 && (
                              <span className="text-rose-500 font-semibold">
                                ✗ {rule.failedExecutions}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Last Run */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatLastRun(rule.lastExecutedAt)}
                      </td>

                      {/* Created By */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {rule.createdBy.name.charAt(0)}
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                            {rule.createdBy.name}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right relative">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(rule)}
                            className="h-7 w-7 p-0"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                          </Button>

                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(rule)}
                              className="h-7 w-7 p-0"
                              title="Edit in Visual Builder"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            </Button>
                          )}

                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setActiveMenuId(activeMenuId === rule.id ? null : rule.id)
                              }
                              className="h-7 w-7 p-0"
                            >
                              <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
                            </Button>

                            {activeMenuId === rule.id && (
                              <div
                                onMouseLeave={() => setActiveMenuId(null)}
                                className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1 text-left animate-in fade-in zoom-in-95 duration-100"
                              >
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onViewDetails(rule);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                                  View Details
                                </button>

                                {canEdit && (
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onEdit(rule);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                    Edit Workflow
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onDuplicate(rule);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  Duplicate Rule
                                </button>

                                {canEdit && (
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onToggleStatus(rule);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                  >
                                    {rule.status === 'active' ? (
                                      <>
                                        <Pause className="w-3.5 h-3.5 text-amber-500" />
                                        Pause Rule
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-3.5 h-3.5 text-emerald-500" />
                                        Activate Rule
                                      </>
                                    )}
                                  </button>
                                )}

                                {canDelete && (
                                  <>
                                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                                    <button
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setDeleteRuleTarget(rule);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Delete Rule
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, filtered.length)} of {filtered.length} rules
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="px-2 font-mono font-medium text-slate-700 dark:text-slate-300">
                {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(deleteRuleTarget)}
        onClose={() => setDeleteRuleTarget(null)}
        onConfirm={() => {
          if (deleteRuleTarget) {
            onDelete(deleteRuleTarget);
            setDeleteRuleTarget(null);
          }
        }}
        title="Delete Automation Rule?"
        message={`Are you sure you want to permanently delete "${deleteRuleTarget?.name}"? All future events matching this trigger will no longer be automated.`}
        confirmLabel="Delete Rule"
        cancelLabel="Keep Rule"
        variant="danger"
      />
    </div>
  );
};
