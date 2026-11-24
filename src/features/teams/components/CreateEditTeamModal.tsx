import React, { useEffect, useState } from 'react';
import { Users, Shield, Plus, X } from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { addTeam, updateTeam } from '@/app/store/slices/teamSlice';
import { addToast } from '@/app/store/slices/toastSlice';
import { TeamRecord } from '../types/team';

interface CreateEditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team?: TeamRecord | null;
}

const AVAILABLE_CHANNELS: ('Web Chat' | 'Email' | 'Slack' | 'WhatsApp')[] = [
  'Web Chat',
  'Email',
  'Slack',
  'WhatsApp',
];

export const CreateEditTeamModal: React.FC<CreateEditTeamModalProps> = ({
  isOpen,
  onClose,
  team,
}) => {
  const dispatch = useAppDispatch();
  const agents = useAppSelector((state) => state.agent.agents);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leadAgentId, setLeadAgentId] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<
    ('Web Chat' | 'Email' | 'Slack' | 'WhatsApp')[]
  >(['Web Chat', 'Email']);
  const [slaTarget, setSlaTarget] = useState('< 5m First Response');

  useEffect(() => {
    if (team) {
      setName(team.name);
      setDescription(team.description);
      setLeadAgentId(team.leadAgentId);
      setSelectedMemberIds(team.memberIds);
      setSelectedChannels(team.channels);
      setSlaTarget(team.slaTarget);
    } else {
      setName('');
      setDescription('');
      setLeadAgentId(agents[0]?.id || '');
      setSelectedMemberIds(agents.slice(0, 2).map((a) => a.id));
      setSelectedChannels(['Web Chat', 'Email']);
      setSlaTarget('< 5m First Response');
    }
  }, [team, agents, isOpen]);

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleChannel = (ch: 'Web Chat' | 'Email' | 'Slack' | 'WhatsApp') => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((item) => item !== ch) : [...prev, ch]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    const lead = agents.find((a) => a.id === leadAgentId);

    if (team) {
      const updated: TeamRecord = {
        ...team,
        name: name.trim(),
        description: description.trim(),
        leadAgentId,
        leadAgentName: lead?.name || team.leadAgentName,
        leadAgentAvatar: lead?.avatar || team.leadAgentAvatar,
        memberIds: selectedMemberIds,
        channels: selectedChannels,
        slaTarget: slaTarget.trim(),
      };

      dispatch(updateTeam(updated));
      dispatch(
        addToast({
          type: 'success',
          title: 'Team Updated',
          message: `Team "${updated.name}" settings have been saved.`,
        })
      );
    } else {
      const newTeam: TeamRecord = {
        id: `team-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        leadAgentId,
        leadAgentName: lead?.name || 'Alex Rivera',
        leadAgentAvatar: lead?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80',
        memberIds: selectedMemberIds,
        channels: selectedChannels,
        slaTarget: slaTarget.trim(),
        activeTickets: 0,
        csat: 5.0,
        createdAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };

      dispatch(addTeam(newTeam));
      dispatch(
        addToast({
          type: 'success',
          title: 'Team Created',
          message: `New support team "${newTeam.name}" was successfully configured.`,
        })
      );
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={team ? `Edit Team: ${team.name}` : 'Create Support Team'}
      description="Configure team responsibilities, assign a team lead, and allocate support agents."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        <Input
          label="Team Name *"
          placeholder="e.g. VIP Enterprise Escalations"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Team Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the queues and customer issues this team handles..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Team Lead */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Designated Team Lead *
            </label>
            <select
              value={leadAgentId}
              onChange={(e) => setLeadAgentId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role})
                </option>
              ))}
            </select>
          </div>

          {/* SLA Target */}
          <div>
            <Input
              label="SLA Response Target *"
              placeholder="e.g. < 5m First Response"
              value={slaTarget}
              onChange={(e) => setSlaTarget(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Channels */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Handled Channels
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_CHANNELS.map((ch) => {
              const isSelected = selectedChannels.includes(ch);
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-600 font-semibold'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        </div>

        {/* Member allocation */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Assign Team Members ({selectedMemberIds.length} allocated)
          </label>
          <div className="max-h-40 overflow-y-auto p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850 divide-y divide-slate-100 dark:divide-slate-800">
            {agents.map((agent) => {
              const isMember = selectedMemberIds.includes(agent.id);
              return (
                <label
                  key={agent.id}
                  className="flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isMember}
                      onChange={() => toggleMember(agent.id)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {agent.name}
                    </span>
                    <span className="text-[11px] text-slate-400">({agent.role})</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {agent.currentTicketsCount} active chats
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {team ? 'Update Team' : 'Create Team'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
