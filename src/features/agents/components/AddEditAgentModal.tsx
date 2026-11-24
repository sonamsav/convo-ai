import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, UserCheck, Shield } from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { addAgent, updateAgent } from '@/app/store/slices/agentSlice';
import { addToast } from '@/app/store/slices/toastSlice';
import { AgentRecord, AgentRole, AgentChannel } from '../types/agent';

const agentSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid work email address'),
  role: z.enum(['Admin', 'Manager', 'Team Lead', 'Senior Agent', 'Support Specialist', 'AI Specialist']),
  teamId: z.string().min(1, 'Please select a support team'),
  maxConcurrentChats: z.number().min(1).max(15),
  skills: z.string().optional(),
  timezone: z.string().min(1, 'Timezone is required'),
  shift: z.string().min(1, 'Shift schedule is required'),
});

type AgentFormData = z.infer<typeof agentSchema>;

interface AddEditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent?: AgentRecord | null;
}

const ALL_CHANNELS: AgentChannel[] = ['Web Chat', 'Email', 'Slack', 'WhatsApp'];

export const AddEditAgentModal: React.FC<AddEditAgentModalProps> = ({
  isOpen,
  onClose,
  agent,
}) => {
  const dispatch = useAppDispatch();
  const existingAgents = useAppSelector((state) => state.agent.agents);
  const teams = useAppSelector((state) => state.team.teams);

  const [selectedChannels, setSelectedChannels] = React.useState<AgentChannel[]>([
    'Web Chat',
    'Email',
  ]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Support Specialist',
      teamId: teams[0]?.id || 'team-general',
      maxConcurrentChats: 4,
      skills: 'Customer Support, Onboarding',
      timezone: 'America/New_York (EST)',
      shift: '09:00 - 17:00 EST',
    },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (agent) {
      reset({
        name: agent.name,
        email: agent.email,
        role: agent.role,
        teamId: agent.teamId,
        maxConcurrentChats: agent.maxConcurrentChats,
        skills: agent.skills.join(', '),
        timezone: agent.timezone,
        shift: agent.shift,
      });
      setSelectedChannels(agent.assignedChannels);
    } else {
      reset({
        name: '',
        email: '',
        role: 'Support Specialist',
        teamId: teams[0]?.id || 'team-general',
        maxConcurrentChats: 4,
        skills: 'Customer Support, Onboarding',
        timezone: 'America/New_York (EST)',
        shift: '09:00 - 17:00 EST',
      });
      setSelectedChannels(['Web Chat', 'Email']);
    }
  }, [agent, reset, teams]);

  const toggleChannel = (channel: AgentChannel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const onSubmit = (data: AgentFormData) => {
    // Unique email validation when creating new agent or editing to a new email
    const isDuplicate = existingAgents.some(
      (a) =>
        a.email.toLowerCase().trim() === data.email.toLowerCase().trim() &&
        (!agent || a.id !== agent.id)
    );

    if (isDuplicate) {
      setError('email', {
        type: 'manual',
        message: 'An agent with this email address already exists in the roster.',
      });
      return;
    }

    if (selectedChannels.length === 0) {
      dispatch(
        addToast({
          type: 'warning',
          title: 'No channels selected',
          message: 'Please assign at least one active support channel to this agent.',
        })
      );
      return;
    }

    const assignedTeam = teams.find((t) => t.id === data.teamId);
    const skillList = data.skills
      ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : ['General Support'];

    if (agent) {
      // Update existing agent
      const updatedAgent: AgentRecord = {
        ...agent,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        role: data.role as AgentRole,
        teamId: data.teamId,
        teamName: assignedTeam?.name || agent.teamName,
        maxConcurrentChats: data.maxConcurrentChats,
        skills: skillList,
        timezone: data.timezone,
        shift: data.shift,
        assignedChannels: selectedChannels,
      };

      dispatch(updateAgent(updatedAgent));
      dispatch(
        addToast({
          type: 'success',
          title: 'Agent Updated',
          message: `Roster information for ${updatedAgent.name} saved successfully.`,
        })
      );
    } else {
      // Create new agent
      const newAgent: AgentRecord = {
        id: `ag-${Date.now()}`,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80`,
        role: data.role as AgentRole,
        teamId: data.teamId,
        teamName: assignedTeam?.name || 'General Support',
        isActive: true,
        availability: 'online',
        assignedChannels: selectedChannels,
        maxConcurrentChats: data.maxConcurrentChats,
        currentTicketsCount: 0,
        resolvedConversations: 0,
        avgResponseTime: '—',
        csat: 5.0,
        resolutionRate: 100,
        skills: skillList,
        timezone: data.timezone,
        shift: data.shift,
        joinedDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        activityHistory: [
          {
            id: `act-${Date.now()}`,
            type: 'login',
            description: 'Agent profile provisioned by Administrator',
            timestamp: 'Just now',
          },
        ],
        performanceHistory: [
          { month: 'Nov', csat: 5.0, resolutionRate: 100, resolvedCount: 0 },
        ],
      };

      dispatch(addAgent(newAgent));
      dispatch(
        addToast({
          type: 'success',
          title: 'Agent Added',
          message: `${newAgent.name} has been provisioned and assigned to ${newAgent.teamName}.`,
        })
      );
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={agent ? `Edit Agent: ${agent.name}` : 'Add Support Agent'}
      description="Configure support agent permissions, routing queue skills, channel assignments, and maximum chat concurrency."
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Full Name */}
          <div>
            <Input
              label="Full Name *"
              placeholder="e.g. Sarah Jenkins"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          {/* Email */}
          <div>
            <Input
              label="Work Email *"
              type="email"
              placeholder="agent@convoai.io"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Roster Role *
            </label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Team Lead">Team Lead</option>
              <option value="Senior Agent">Senior Agent</option>
              <option value="Support Specialist">Support Specialist</option>
              <option value="AI Specialist">AI Specialist</option>
            </select>
          </div>

          {/* Team Assignment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Team Assignment *
            </label>
            <select
              {...register('teamId')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Max Concurrent Chats */}
          <div>
            <Input
              label="Max Concurrent Chats *"
              type="number"
              min={1}
              max={15}
              error={errors.maxConcurrentChats?.message}
              {...register('maxConcurrentChats', { valueAsNumber: true })}
            />
          </div>

          {/* Timezone */}
          <div>
            <Input
              label="Timezone *"
              placeholder="e.g. America/New_York (EST)"
              error={errors.timezone?.message}
              {...register('timezone')}
            />
          </div>
        </div>

        {/* Shift */}
        <div>
          <Input
            label="Daily Shift Schedule *"
            placeholder="e.g. 09:00 - 17:00 EST"
            error={errors.shift?.message}
            {...register('shift')}
          />
        </div>

        {/* Assigned Channels */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Assigned Routing Channels *
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_CHANNELS.map((channel) => {
              const isSelected = selectedChannels.includes(channel);
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-600 font-semibold'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {channel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skills */}
        <div>
          <Input
            label="Routing Skills & Specializations"
            placeholder="e.g. Billing, Webhooks, OAuth SSO, Enterprise"
            helperText="Used for automated conversation routing tag matching"
            error={errors.skills?.message}
            {...register('skills')}
          />
        </div>

        {/* Role permission summary pill */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs">
          <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
          <div className="text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Role Authority: {selectedRole}
            </span>
            <p className="mt-0.5 text-[11px]">
              {selectedRole === 'Admin'
                ? 'Full system privileges including user deletion, team topology edits, and security policy management.'
                : selectedRole === 'Manager'
                ? 'Supervisor privileges to manage queue workload, agent assignments, and team reporting.'
                : 'Standard support agent permissions with ticket assignment, customer responses, and note logging.'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={agent ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
          >
            {agent ? 'Update Agent' : 'Create Agent Profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
