import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Shield,
  Clock,
  MessageSquare,
  Edit2,
  Trash2,
  Plus,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Avatar, Badge, Button, ConfirmationDialog } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { deleteTeam } from '@/app/store/slices/teamSlice';
import { addToast } from '@/app/store/slices/toastSlice';
import { usePermissions } from '@/features/permissions/hooks/usePermissions';
import { getPermissionDenialReason } from '@/features/permissions/utils/permissions';
import { TeamRecord } from '../types/team';
import { CreateEditTeamModal } from './CreateEditTeamModal';

interface TeamManagementSectionProps {
  onCreateTeamClick?: () => void;
}

export const TeamManagementSection: React.FC<TeamManagementSectionProps> = ({
  onCreateTeamClick,
}) => {
  const dispatch = useAppDispatch();
  const { can } = usePermissions();

  const teams = useAppSelector((state) => state.team.teams);
  const agents = useAppSelector((state) => state.agent.agents);

  const [editingTeam, setEditingTeam] = useState<TeamRecord | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<TeamRecord | null>(null);

  const handleDeleteTeam = () => {
    if (!deletingTeam) return;
    if (!can('teams:delete')) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Permission Denied',
          message: getPermissionDenialReason('teams:delete'),
        })
      );
      setDeletingTeam(null);
      return;
    }

    dispatch(deleteTeam(deletingTeam.id));
    dispatch(
      addToast({
        type: 'success',
        title: 'Team Removed',
        message: `Support team "${deletingTeam.name}" has been deleted.`,
      })
    );
    setDeletingTeam(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => {
          // Resolve team members from agent store
          const teamAgents = agents.filter((a) => team.memberIds.includes(a.id));
          const onlineCount = teamAgents.filter((a) => a.isActive && a.availability === 'online').length;
          const totalAssignedChats = teamAgents.reduce((sum, a) => sum + a.currentTicketsCount, 0);

          return (
            <div
              key={team.id}
              className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card flex flex-col justify-between space-y-4 group"
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {team.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingTeam(team)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Team Settings"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!can('teams:delete')) {
                          dispatch(
                            addToast({
                              type: 'error',
                              title: 'Permission Denied',
                              message: getPermissionDenialReason('teams:delete'),
                            })
                          );
                          return;
                        }
                        setDeletingTeam(team);
                      }}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Team"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Channels & SLA Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/60">
                    SLA: {team.slaTarget}
                  </span>
                  {team.channels.map((ch) => (
                    <span
                      key={ch}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    Members
                  </span>
                  <p className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                    {teamAgents.length}{' '}
                    <span className="text-[10px] text-emerald-600 font-normal">
                      ({onlineCount} live)
                    </span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    Active Load
                  </span>
                  <p className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {totalAssignedChats} chats
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    CSAT
                  </span>
                  <p className="text-sm font-bold font-mono text-amber-500 mt-0.5">
                    ★ {team.csat.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Team Lead & Member Avatars */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Avatar src={team.leadAgentAvatar} name={team.leadAgentName} size="xs" />
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px]">Team Lead</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {team.leadAgentName}
                    </span>
                  </div>
                </div>

                {/* Member Avatars Stack */}
                <div className="flex items-center -space-x-1.5 overflow-hidden">
                  {teamAgents.slice(0, 4).map((member) => (
                    <Avatar
                      key={member.id}
                      src={member.avatar}
                      name={member.name}
                      size="xs"
                      className="ring-2 ring-white dark:ring-slate-900"
                    />
                  ))}
                  {teamAgents.length > 4 && (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 ring-2 ring-white dark:ring-slate-900">
                      +{teamAgents.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Team Modal */}
      <CreateEditTeamModal
        isOpen={!!editingTeam}
        onClose={() => setEditingTeam(null)}
        team={editingTeam}
      />

      {/* Delete Team Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingTeam}
        onClose={() => setDeletingTeam(null)}
        onConfirm={handleDeleteTeam}
        title="Delete Support Team"
        message={`Are you sure you want to delete "${deletingTeam?.name}"? Assigned agents will remain in the global roster.`}
        confirmLabel="Delete Team"
        variant="danger"
      />
    </div>
  );
};
