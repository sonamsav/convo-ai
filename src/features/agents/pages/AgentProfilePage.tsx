import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Building,
  Clock,
  Calendar,
  Shield,
  Star,
  CheckCircle2,
  XCircle,
  Edit2,
  Power,
  MessageSquare,
  BarChart3,
  Activity,
  Layers,
  ExternalLink,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  Avatar,
  Badge,
  Button,
  ConfirmationDialog,
  EmptyState,
} from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  toggleAgentStatus,
  updateAgentAvailability,
} from '@/app/store/slices/agentSlice';
import { selectConversation } from '@/app/store/slices/inboxSlice';
import { addToast } from '@/app/store/slices/toastSlice';
import { usePermissions } from '@/features/permissions/hooks/usePermissions';
import { getPermissionDenialReason } from '@/features/permissions/utils/permissions';
import { AddEditAgentModal } from '../components/AddEditAgentModal';
import { AgentRecord, AgentAvailability } from '../types/agent';
import { cn } from '@/utils/cn';

type AgentTab = 'overview' | 'conversations' | 'performance' | 'activity';

export const AgentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { can } = usePermissions();

  const agents = useAppSelector((state) => state.agent.agents);
  const conversations = useAppSelector((state) => state.inbox.conversations);

  const agent = agents.find((a) => a.id === id);

  const [activeTab, setActiveTab] = useState<AgentTab>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isToggleConfirmOpen, setIsToggleConfirmOpen] = useState(false);

  if (!agent) {
    return (
      <div className="py-16">
        <EmptyState
          title="Agent Not Found"
          description="The agent profile you requested does not exist in the team roster."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/agents')}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to Team Roster
            </Button>
          }
        />
      </div>
    );
  }

  // Linked live conversations for this agent
  const assignedConversations = conversations.filter(
    (c) =>
      c.assignedAgent?.id === agent.id ||
      c.assignedAgent?.name.toLowerCase() === agent.name.toLowerCase()
  );

  const handleOpenConversationInInbox = (conversationId: string) => {
    dispatch(selectConversation(conversationId));
    navigate('/inbox');
  };

  const handleAvailabilityChange = (newAvailability: AgentAvailability) => {
    dispatch(updateAgentAvailability({ id: agent.id, availability: newAvailability }));
    dispatch(
      addToast({
        type: 'info',
        title: 'Availability Updated',
        message: `${agent.name} is now ${newAvailability}.`,
      })
    );
  };

  const handleToggleStatus = () => {
    if (!can('agents:toggle_status')) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Permission Denied',
          message: 'Admin or Manager privileges required.',
        })
      );
      setIsToggleConfirmOpen(false);
      return;
    }

    dispatch(toggleAgentStatus(agent.id));
    dispatch(
      addToast({
        type: 'info',
        title: agent.isActive ? 'Agent Deactivated' : 'Agent Activated',
        message: `${agent.name} status updated.`,
      })
    );
    setIsToggleConfirmOpen(false);
  };

  const loadPercent = Math.min(
    100,
    Math.round((agent.currentTicketsCount / agent.maxConcurrentChats) * 100)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Back button and Header actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/agents')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Roster & Teams</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant={agent.isActive ? 'outline' : 'success'}
            size="sm"
            onClick={() => setIsToggleConfirmOpen(true)}
            leftIcon={<Power className="w-3.5 h-3.5" />}
          >
            {agent.isActive ? 'Deactivate' : 'Activate Account'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit Agent Profile
          </Button>
        </div>
      </div>

      {/* Agent Header Card */}
      <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar and Info */}
          <div className="flex items-start gap-4">
            <Avatar
              src={agent.avatar}
              name={agent.name}
              status={agent.availability}
              size="xl"
              className="ring-4 ring-slate-100 dark:ring-slate-800"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {agent.name}
                </h1>
                <Badge
                  variant={
                    agent.role === 'Admin'
                      ? 'primary'
                      : agent.role === 'Manager'
                      ? 'success'
                      : 'neutral'
                  }
                  size="md"
                >
                  {agent.role}
                </Badge>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {agent.teamName}
                </span>
                {agent.isActive ? (
                  <Badge variant="success" size="sm">
                    Active Roster
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    Deactivated
                  </Badge>
                )}
              </div>

              <p className="text-xs text-slate-400 font-mono">
                {agent.email} • Joined {agent.joinedDate}
              </p>

              {/* Shift and Timezone */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Shift: {agent.shift}</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{agent.timezone}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Availability Selector */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Presence Status:</span>
            <select
              value={agent.availability}
              disabled={!agent.isActive}
              onChange={(e) => handleAvailabilityChange(e.target.value as AgentAvailability)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="online">Online (Accepting Chats)</option>
              <option value="busy">Busy (In Calls/Meetings)</option>
              <option value="away">Away (Break / Lunch)</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        {/* 4 Performance KPI Cards */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Resolved Conversations</span>
            <p className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {agent.resolvedConversations}
            </p>
            <span className="text-[11px] text-slate-400">Total tickets closed</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Avg First Response</span>
            <p className="mt-1 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {agent.avgResponseTime}
            </p>
            <span className="text-[11px] text-emerald-600">Top 5% speed in team</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Customer CSAT</span>
            <p className="mt-1 text-xl font-bold font-mono text-amber-500">
              ★ {agent.csat.toFixed(2)} / 5.0
            </p>
            <span className="text-[11px] text-slate-400">98.4% positive ratings</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Resolution Rate</span>
            <p className="mt-1 text-xl font-bold font-mono text-brand-600 dark:text-brand-400">
              {agent.resolutionRate}%
            </p>
            <span className="text-[11px] text-slate-400">First Contact Resolution</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {[
          { key: 'overview', label: 'Overview & Routing Skills', icon: Layers },
          { key: 'conversations', label: `Assigned Queue (${assignedConversations.length})`, icon: MessageSquare },
          { key: 'performance', label: 'Performance Analytics', icon: BarChart3 },
          { key: 'activity', label: 'Activity History', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as AgentTab)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors select-none',
                isActive
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB A: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workload and Channels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workload & Concurrency Card */}
            <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Live Concurrency & Queue Capacity
                </h3>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {agent.currentTicketsCount} / {agent.maxConcurrentChats} Active Chats ({loadPercent}%)
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    loadPercent >= 80 ? 'bg-rose-500' : loadPercent >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                  style={{ width: `${loadPercent}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400">
                When an agent reaches 100% concurrency, the round-robin routing algorithm automatically queues incoming conversations or routes them to available teammates.
              </p>
            </div>

            {/* Channels & Skills Card */}
            <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                  Assigned Support Channels
                </h4>
                <div className="flex flex-wrap gap-2">
                  {agent.assignedChannels.map((ch) => (
                    <span
                      key={ch}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/60"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                  Routing Skills & Specializations
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {agent.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Shift & Team Info */}
          <div className="space-y-6">
            <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Shift Schedule & Team Info
              </h4>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400">Team</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {agent.teamName}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Shift Hours</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                    {agent.shift}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Timezone</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {agent.timezone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: ASSIGNED CONVERSATIONS */}
      {activeTab === 'conversations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Live Conversations in {agent.name}&apos;s Queue ({assignedConversations.length})
            </h3>
            <p className="text-xs text-slate-400">
              Connected live to Smart Inbox state
            </p>
          </div>

          {assignedConversations.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <EmptyState
                icon={<MessageSquare className="w-8 h-8 text-brand-600" />}
                title="Queue Currently Clear"
                description={`${agent.name} does not have any pending or open conversations assigned at this moment.`}
                action={
                  <Button variant="outline" size="sm" onClick={() => navigate('/inbox')}>
                    View All Inbox Conversations
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="px-4 py-3">Ticket ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Subject & Last Message</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {assignedConversations.map((conv) => (
                    <tr
                      key={conv.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-brand-600 dark:text-brand-400">
                        {conv.ticketNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={conv.customer.name} size="xs" />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {conv.customer.name}
                            </p>
                            <p className="text-[10px] text-slate-400">{conv.customer.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {conv.subject}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {conv.lastMessage.content}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {conv.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            conv.priority === 'urgent'
                              ? 'danger'
                              : conv.priority === 'high'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {conv.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            conv.status === 'open'
                              ? 'primary'
                              : conv.status === 'pending'
                              ? 'warning'
                              : 'success'
                          }
                          size="sm"
                        >
                          {conv.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {conv.updatedAt}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleOpenConversationInInbox(conv.id)}
                          rightIcon={<ExternalLink className="w-3 h-3" />}
                        >
                          Open in Inbox
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB C: PERFORMANCE ANALYTICS */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  CSAT & Resolution Rate Trend
                </h3>
                <p className="text-xs text-slate-400">
                  Monthly customer satisfaction ratings and SLA compliance
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  Resolution Rate (%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  CSAT Score (/5.0)
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={agent.performanceHistory}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="agentResRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="resolutionRate"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#agentResRate)"
                    name="Resolution Rate (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB D: ACTIVITY HISTORY */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Agent Event Log & Activity Audit
          </h3>

          <div className="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {agent.activityHistory.map((item) => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-brand-600" />
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {item.description}
                    </p>
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      <AddEditAgentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        agent={agent}
      />

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isToggleConfirmOpen}
        onClose={() => setIsToggleConfirmOpen(false)}
        onConfirm={handleToggleStatus}
        title={agent.isActive ? 'Deactivate Agent' : 'Activate Agent'}
        message={`Are you sure you want to ${
          agent.isActive
            ? 'deactivate this agent? Their assigned chats will be released to the team pool and their status will switch to offline.'
            : 'activate this agent to accept conversations?'
        }`}
        confirmLabel={agent.isActive ? 'Deactivate' : 'Activate'}
        variant={agent.isActive ? 'warning' : 'info'}
      />
    </div>
  );
};
