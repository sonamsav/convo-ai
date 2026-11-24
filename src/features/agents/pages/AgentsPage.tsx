import React, { useState } from 'react';
import { UserPlus, Users, Layers, ShieldCheck } from 'lucide-react';
import { PageHeader, Button, Badge } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { addToast } from '@/app/store/slices/toastSlice';
import { usePermissions } from '@/features/permissions/hooks/usePermissions';
import { getPermissionDenialReason } from '@/features/permissions/utils/permissions';
import { AgentKpiCards } from '../components/AgentKpiCards';
import { AgentTable } from '../components/AgentTable';
import { AddEditAgentModal } from '../components/AddEditAgentModal';
import { TeamManagementSection } from '@/features/teams/components/TeamManagementSection';
import { CreateEditTeamModal } from '@/features/teams/components/CreateEditTeamModal';
import { cn } from '@/utils/cn';

export const AgentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { can } = usePermissions();

  const agents = useAppSelector((state) => state.agent.agents);
  const teams = useAppSelector((state) => state.team.teams);

  const [activeTab, setActiveTab] = useState<'roster' | 'teams'>('roster');
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  const handleOpenAddAgent = () => {
    if (!can('agents:create')) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Permission Denied',
          message: getPermissionDenialReason('agents:create'),
        })
      );
      return;
    }
    setIsAddAgentOpen(true);
  };

  const handleOpenCreateTeam = () => {
    if (!can('teams:create')) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Permission Denied',
          message: getPermissionDenialReason('teams:create'),
        })
      );
      return;
    }
    setIsCreateTeamOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Team & Agents"
        description="Monitor support agent capacity, skills routing tags, round-robin assignments, and functional team departments."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Team & Agents', isCurrent: true },
        ]}
        badge={
          <Badge variant="primary" size="sm">
            {agents.filter((a) => a.isActive).length} / {agents.length} Seats Active
          </Badge>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenCreateTeam}
              leftIcon={<Layers className="w-3.5 h-3.5" />}
            >
              Create Team
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddAgent}
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            >
              Add Agent
            </Button>
          </>
        }
      />

      {/* 5 KPI Cards */}
      <AgentKpiCards />

      {/* Tab Switcher: Agents Roster vs Teams & Routing */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors select-none',
            activeTab === 'roster'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-brand-50/40 dark:bg-brand-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <Users className="w-4 h-4" />
          <span>Agents Roster</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
            {agents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('teams')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors select-none',
            activeTab === 'teams'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-brand-50/40 dark:bg-brand-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <Layers className="w-4 h-4" />
          <span>Teams & Department Routing</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
            {teams.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'roster' ? (
        <AgentTable />
      ) : (
        <TeamManagementSection onCreateTeamClick={handleOpenCreateTeam} />
      )}

      {/* Add Agent Modal */}
      <AddEditAgentModal
        isOpen={isAddAgentOpen}
        onClose={() => setIsAddAgentOpen(false)}
      />

      {/* Create Team Modal */}
      <CreateEditTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
      />
    </div>
  );
};
