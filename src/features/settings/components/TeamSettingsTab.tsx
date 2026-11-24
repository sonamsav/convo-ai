import React from 'react';
import { useSelector } from 'react-redux';
import { Users, Shield, Clock, Plus, ExternalLink } from 'lucide-react';
import { RootState } from '@/app/store/store';
import { Button, Badge } from '@/components/ui';
import { useNavigate } from 'react-router-dom';

export const TeamSettingsTab: React.FC = () => {
  const navigate = useNavigate();
  const teams = useSelector((state: RootState) => state.team.teams);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Departmental Team Settings & Routing
              </h3>
              <p className="text-xs text-slate-500">
                Configure specialized functional teams, SLA targets, and channel assignments.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/agents')}
            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Manage Agents & Roster
          </Button>
        </div>

        {/* Team Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {team.name}
                </h4>
                <Badge variant="info" size="sm">
                  {team.memberIds.length} Members
                </Badge>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {team.description}
              </p>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] space-y-1 text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Lead Agent:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{team.leadAgentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>SLA Policy:</span>
                  <span className="font-mono text-brand-600">{team.slaTarget}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Assigned Channels:</span>
                  <span className="text-slate-700 dark:text-slate-300">{team.channels.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
