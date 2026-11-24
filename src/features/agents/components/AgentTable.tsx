import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Edit2,
  Trash2,
  Power,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Star,
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  SearchInput,
  ConfirmationDialog,
  EmptyState,
} from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  deleteAgent,
  toggleAgentStatus,
  updateAgentAvailability,
  setAgentFilter,
  resetAgentFilters,
} from '@/app/store/slices/agentSlice';
import { addToast } from '@/app/store/slices/toastSlice';
import { usePermissions } from '@/features/permissions/hooks/usePermissions';
import { getPermissionDenialReason } from '@/features/permissions/utils/permissions';
import { AgentRecord, AgentAvailability } from '../types/agent';
import { AddEditAgentModal } from './AddEditAgentModal';
import { cn } from '@/utils/cn';

export const AgentTable: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { can, role: userRole } = usePermissions();

  const agents = useAppSelector((state) => state.agent.agents);
  const teams = useAppSelector((state) => state.team.teams);
  const filters = useAppSelector((state) => state.agent.filters);

  const [editingAgent, setEditingAgent] = useState<AgentRecord | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<AgentRecord | null>(null);
  const [togglingAgent, setTogglingAgent] = useState<AgentRecord | null>(null);

  // Filter & Search logic
  const filteredData = useMemo(() => {
    return agents.filter((a) => {
      // Search query (name, email, role, team)
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const matchesName = a.name.toLowerCase().includes(q);
        const matchesEmail = a.email.toLowerCase().includes(q);
        const matchesRole = a.role.toLowerCase().includes(q);
        const matchesTeam = a.teamName.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesRole && !matchesTeam) {
          return false;
        }
      }

      // Team filter
      if (filters.teamId !== 'all' && a.teamId !== filters.teamId) {
        return false;
      }

      // Availability filter
      if (filters.availability !== 'all' && a.availability !== filters.availability) {
        return false;
      }

      // Status filter (active vs deactivated)
      if (filters.status === 'active' && !a.isActive) return false;
      if (filters.status === 'deactivated' && a.isActive) return false;

      return true;
    });
  }, [agents, filters]);

  // Sorting
  const sortedData = useMemo(() => {
    const list = [...filteredData];
    list.sort((a, b) => {
      let comparison = 0;
      if (filters.sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (filters.sortBy === 'tickets') {
        comparison = a.currentTicketsCount - b.currentTicketsCount;
      } else if (filters.sortBy === 'csat') {
        comparison = a.csat - b.csat;
      } else if (filters.sortBy === 'resolutionRate') {
        comparison = a.resolutionRate - b.resolutionRate;
      }
      return filters.sortDirection === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredData, filters.sortBy, filters.sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / filters.pageSize));
  const paginatedData = useMemo(() => {
    const start = (filters.page - 1) * filters.pageSize;
    return sortedData.slice(start, start + filters.pageSize);
  }, [sortedData, filters.page, filters.pageSize]);

  const handleSort = (column: 'name' | 'tickets' | 'csat' | 'resolutionRate') => {
    if (filters.sortBy === column) {
      dispatch(
        setAgentFilter({
          sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc',
        })
      );
    } else {
      dispatch(
        setAgentFilter({
          sortBy: column,
          sortDirection: 'desc',
        })
      );
    }
  };

  const handleDelete = () => {
    if (!deletingAgent) return;
    if (!can('agents:delete')) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Permission Denied',
          message: getPermissionDenialReason('agents:delete'),
        })
      );
      setDeletingAgent(null);
      return;
    }

    if (deletingAgent.currentTicketsCount > 0) {
      dispatch(
        addToast({
          type: 'warning',
          title: 'Active Tickets Assigned',
          message: `Cannot delete ${deletingAgent.name} while they have ${deletingAgent.currentTicketsCount} active ticket(s). Reassign them first.`,
        })
      );
      setDeletingAgent(null);
      return;
    }

    dispatch(deleteAgent(deletingAgent.id));
    dispatch(
      addToast({
        type: 'success',
        title: 'Agent Removed',
        message: `${deletingAgent.name} was removed from the roster.`,
      })
    );
    setDeletingAgent(null);
  };

  const handleToggleStatus = () => {
    if (!togglingAgent) return;
    if (!can('agents:toggle_status')) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Permission Denied',
          message: 'Admin or Manager role required to activate/deactivate agents.',
        })
      );
      setTogglingAgent(null);
      return;
    }

    dispatch(toggleAgentStatus(togglingAgent.id));
    dispatch(
      addToast({
        type: 'info',
        title: togglingAgent.isActive ? 'Agent Deactivated' : 'Agent Activated',
        message: `${togglingAgent.name} is now ${togglingAgent.isActive ? 'deactivated' : 'active'}.`,
      })
    );
    setTogglingAgent(null);
  };

  const handleAvailabilityChange = (agentId: string, availability: AgentAvailability) => {
    dispatch(updateAgentAvailability({ id: agentId, availability }));
  };

  const getAvailabilityBadge = (agent: AgentRecord) => {
    if (!agent.isActive) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Deactivated
        </span>
      );
    }

    const colors: Record<AgentAvailability, string> = {
      online: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60',
      busy: 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60',
      away: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60',
      offline: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60',
    };

    return (
      <select
        value={agent.availability}
        onChange={(e) => handleAvailabilityChange(agent.id, e.target.value as AgentAvailability)}
        className={cn(
          'text-[11px] font-semibold rounded px-2 py-0.5 focus:outline-none cursor-pointer',
          colors[agent.availability]
        )}
      >
        <option value="online">Online</option>
        <option value="busy">Busy</option>
        <option value="away">Away</option>
        <option value="offline">Offline</option>
      </select>
    );
  };

  return (
    <div className="space-y-3.5">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="w-full lg:w-96">
          <SearchInput
            placeholder="Search agents by name, email, role, or team..."
            value={filters.search}
            onChange={(e) => dispatch(setAgentFilter({ search: e.target.value }))}
            onClear={() => dispatch(setAgentFilter({ search: '' }))}
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Team filter */}
          <select
            value={filters.teamId}
            onChange={(e) => dispatch(setAgentFilter({ teamId: e.target.value }))}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Availability filter */}
          <select
            value={filters.availability}
            onChange={(e) => dispatch(setAgentFilter({ availability: e.target.value }))}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Availabilities</option>
            <option value="online">Online</option>
            <option value="busy">Busy</option>
            <option value="away">Away</option>
            <option value="offline">Offline</option>
          </select>

          {/* Status filter */}
          <select
            value={filters.status}
            onChange={(e) => dispatch(setAgentFilter({ status: e.target.value }))}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="deactivated">Deactivated Only</option>
          </select>

          {/* Reset button */}
          {(filters.search ||
            filters.teamId !== 'all' ||
            filters.availability !== 'all' ||
            filters.status !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(resetAgentFilters())}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-slate-500"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 text-slate-500 dark:text-slate-400 font-semibold select-none text-[11px] uppercase tracking-wider">
              {/* Agent */}
              <th
                scope="col"
                className="px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                onClick={() => handleSort('name')}
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Agent & Email</span>
                  {filters.sortBy === 'name' ? (
                    filters.sortDirection === 'asc' ? (
                      <ChevronUp className="w-3.5 h-3.5 text-brand-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-brand-600" />
                    )
                  ) : (
                    <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                  )}
                </div>
              </th>

              <th scope="col" className="px-4 py-3">Roster Role</th>
              <th scope="col" className="px-4 py-3">Team Assigned</th>

              {/* Workload */}
              <th
                scope="col"
                className="px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                onClick={() => handleSort('tickets')}
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Active Load / Max</span>
                  {filters.sortBy === 'tickets' ? (
                    filters.sortDirection === 'asc' ? (
                      <ChevronUp className="w-3.5 h-3.5 text-brand-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-brand-600" />
                    )
                  ) : (
                    <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                  )}
                </div>
              </th>

              {/* Performance CSAT */}
              <th
                scope="col"
                className="px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                onClick={() => handleSort('csat')}
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>CSAT Score</span>
                  {filters.sortBy === 'csat' ? (
                    filters.sortDirection === 'asc' ? (
                      <ChevronUp className="w-3.5 h-3.5 text-brand-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-brand-600" />
                    )
                  ) : (
                    <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                  )}
                </div>
              </th>

              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Availability</th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center">
                  <EmptyState
                    title="No agents found"
                    description="No support agents match the current filter and search criteria."
                    action={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dispatch(resetAgentFilters())}
                      >
                        Reset Filters
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((agent) => {
                const loadPercent = Math.min(
                  100,
                  Math.round((agent.currentTicketsCount / agent.maxConcurrentChats) * 100)
                );

                return (
                  <tr
                    key={agent.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Agent */}
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate(`/agents/${agent.id}`)}
                      >
                        <Avatar
                          src={agent.avatar}
                          name={agent.name}
                          status={agent.availability}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                            {agent.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">
                            {agent.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          agent.role === 'Admin'
                            ? 'primary'
                            : agent.role === 'Manager'
                            ? 'success'
                            : agent.role === 'Team Lead'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {agent.role}
                      </Badge>
                    </td>

                    {/* Team */}
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {agent.teamName}
                      </span>
                    </td>

                    {/* Workload / Capacity */}
                    <td className="px-4 py-3 min-w-[130px]">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {agent.currentTicketsCount} / {agent.maxConcurrentChats}
                        </span>
                        <span className="text-slate-400">{loadPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            loadPercent >= 80
                              ? 'bg-rose-500'
                              : loadPercent >= 50
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          )}
                          style={{ width: `${loadPercent}%` }}
                        />
                      </div>
                    </td>

                    {/* CSAT */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{agent.csat.toFixed(2)}</span>
                        <span className="text-slate-400 text-[10px] font-normal">
                          ({agent.resolvedConversations} resolved)
                        </span>
                      </div>
                    </td>

                    {/* Status (Active vs Deactivated) */}
                    <td className="px-4 py-3">
                      {agent.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                          <XCircle className="w-3.5 h-3.5" />
                          Deactivated
                        </span>
                      )}
                    </td>

                    {/* Availability */}
                    <td className="px-4 py-3">
                      {getAvailabilityBadge(agent)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/agents/${agent.id}`)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Agent Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingAgent(agent)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Agent Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setTogglingAgent(agent)}
                          className={cn(
                            'p-1.5 rounded-md transition-colors',
                            agent.isActive
                              ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          )}
                          title={agent.isActive ? 'Deactivate Agent' : 'Activate Agent'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!can('agents:delete')) {
                              dispatch(
                                addToast({
                                  type: 'error',
                                  title: 'Permission Denied',
                                  message: getPermissionDenialReason('agents:delete'),
                                })
                              );
                              return;
                            }
                            setDeletingAgent(agent);
                          }}
                          className={cn(
                            'p-1.5 rounded-md transition-colors',
                            can('agents:delete')
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50'
                          )}
                          title={
                            can('agents:delete') ? 'Delete Agent' : 'Delete Agent (Admin only)'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing{' '}
          <strong className="text-slate-700 dark:text-slate-200">
            {sortedData.length === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1}
          </strong>{' '}
          to{' '}
          <strong className="text-slate-700 dark:text-slate-200">
            {Math.min(filters.page * filters.pageSize, sortedData.length)}
          </strong>{' '}
          of{' '}
          <strong className="text-slate-700 dark:text-slate-200">
            {sortedData.length}
          </strong>{' '}
          agents
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              disabled={filters.page <= 1}
              onClick={() => dispatch(setAgentFilter({ page: filters.page - 1 }))}
            >
              Previous
            </Button>
            <span className="px-2 font-medium">
              Page {filters.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="xs"
              disabled={filters.page >= totalPages}
              onClick={() => dispatch(setAgentFilter({ page: filters.page + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Edit Agent Modal */}
      <AddEditAgentModal
        isOpen={!!editingAgent}
        onClose={() => setEditingAgent(null)}
        agent={editingAgent}
      />

      {/* Delete Agent Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingAgent}
        onClose={() => setDeletingAgent(null)}
        onConfirm={handleDelete}
        title="Delete Agent Profile"
        message={`Are you sure you want to delete ${deletingAgent?.name} from the support team? This will release their allocated seat license.`}
        confirmLabel="Delete Agent"
        variant="danger"
      />

      {/* Toggle Status Confirmation */}
      <ConfirmationDialog
        isOpen={!!togglingAgent}
        onClose={() => setTogglingAgent(null)}
        onConfirm={handleToggleStatus}
        title={togglingAgent?.isActive ? 'Deactivate Agent' : 'Activate Agent'}
        message={`Are you sure you want to ${
          togglingAgent?.isActive
            ? 'deactivate this agent? They will no longer receive new incoming conversations and their status will switch to offline.'
            : 'activate this agent? Their account will be restored to accept conversations.'
        }`}
        confirmLabel={togglingAgent?.isActive ? 'Deactivate' : 'Activate'}
        variant={togglingAgent?.isActive ? 'warning' : 'info'}
      />
    </div>
  );
};
