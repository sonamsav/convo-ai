import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  MapPin,
  Clock,
  Calendar,
  Tag,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Shield,
  Activity,
  FileText,
  DollarSign,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  Pin,
  Send,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  ConfirmationDialog,
  EmptyState,
} from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addCustomerNote,
  deleteCustomerNote,
  updateCustomer,
} from '@/app/store/slices/customerSlice';
import { selectConversation } from '@/app/store/slices/inboxSlice';
import { addToast } from '@/app/store/slices/toastSlice';
import { usePermissions } from '@/features/permissions/hooks/usePermissions';
import { EditCustomerModal } from '../components/EditCustomerModal';
import { CustomerRecord, CustomerStatus } from '../types/customer';
import { cn } from '@/utils/cn';

type ProfileTab = 'overview' | 'conversations' | 'timeline' | 'notes' | 'insights';

export const CustomerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { can } = usePermissions();

  const customers = useAppSelector((state) => state.customer.customers);
  const conversations = useAppSelector((state) => state.inbox.conversations);
  const currentUser = useAppSelector((state) => state.auth.user);

  const customer = customers.find((c) => c.id === id);

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Notes state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // Timeline category filter
  const [timelineCategory, setTimelineCategory] = useState<'all' | 'support' | 'billing' | 'account' | 'security'>('all');

  if (!customer) {
    return (
      <div className="py-16">
        <EmptyState
          title="Customer Not Found"
          description="The customer account you requested could not be located in the CRM database."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/customers')}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to Customers Directory
            </Button>
          }
        />
      </div>
    );
  }

  // Linked conversations for this customer
  const customerConversations = conversations.filter(
    (conv) =>
      conv.customerId === customer.id ||
      conv.customer.email.toLowerCase() === customer.email.toLowerCase() ||
      conv.customer.name.toLowerCase() === customer.name.toLowerCase()
  );

  const handleOpenConversationInInbox = (conversationId: string) => {
    dispatch(selectConversation(conversationId));
    navigate('/inbox');
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim();
    if (tag && !customer.tags.includes(tag)) {
      const updated: CustomerRecord = {
        ...customer,
        tags: [...customer.tags, tag],
      };
      dispatch(updateCustomer(updated));
      dispatch(
        addToast({
          type: 'success',
          title: 'Tag Added',
          message: `Added tag "${tag}" to ${customer.name}.`,
        })
      );
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated: CustomerRecord = {
      ...customer,
      tags: customer.tags.filter((t) => t !== tagToRemove),
    };
    dispatch(updateCustomer(updated));
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    dispatch(
      addCustomerNote({
        customerId: customer.id,
        note: {
          content: newNoteContent.trim(),
          authorName: currentUser?.name || 'Alex Rivera',
          authorRole: currentUser?.role === 'admin' ? 'Admin' : 'Manager',
          isPinned: false,
        },
      })
    );

    dispatch(
      addToast({
        type: 'success',
        title: 'Note Logged',
        message: 'Internal customer note recorded to timeline.',
      })
    );

    setNewNoteContent('');
  };

  const handleDeleteNote = () => {
    if (!noteToDelete) return;
    dispatch(
      deleteCustomerNote({
        customerId: customer.id,
        noteId: noteToDelete,
      })
    );
    dispatch(
      addToast({
        type: 'info',
        title: 'Note Removed',
        message: 'The internal note was deleted.',
      })
    );
    setNoteToDelete(null);
  };

  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case 'vip':
        return <Badge variant="primary" size="md">VIP Account</Badge>;
      case 'active':
        return <Badge variant="success" size="md">Active</Badge>;
      case 'churn_risk':
        return <Badge variant="danger" size="md">Churn Risk</Badge>;
      case 'lead':
        return <Badge variant="info" size="md">Lead / Trial</Badge>;
      case 'inactive':
        return <Badge variant="neutral" size="md">Inactive</Badge>;
    }
  };

  const filteredTimeline = customer.timeline.filter((event) => {
    if (timelineCategory === 'all') return true;
    return event.category === timelineCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/customers')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </button>

        <div className="flex items-center gap-2">
          {customerConversations.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenConversationInInbox(customerConversations[0].id)}
              leftIcon={<MessageSquare className="w-3.5 h-3.5 text-brand-600" />}
            >
              Open in Inbox ({customerConversations.length})
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Customer Header Card */}
      <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar and Basic Details */}
          <div className="flex items-start gap-4">
            <Avatar
              src={customer.avatar}
              name={customer.name}
              size="xl"
              className="ring-4 ring-slate-100 dark:ring-slate-800"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {customer.name}
                </h1>
                {getStatusBadge(customer.status)}
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  {customer.customerType}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {customer.company}
              </p>

              {/* Contact Pills */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
                <a
                  href={`mailto:${customer.email}`}
                  className="inline-flex items-center gap-1.5 hover:text-brand-600 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customer.email}</span>
                </a>
                <span>•</span>
                <a
                  href={`tel:${customer.phone}`}
                  className="inline-flex items-center gap-1.5 hover:text-brand-600 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customer.phone}</span>
                </a>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customer.location}</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Customer since {customer.joinedDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Account Health Badge */}
          <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
            <div className="text-right">
              <span className="text-xs text-slate-400">Account Value</span>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                {customer.mrr}
              </p>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <UserCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Owner: <strong>{customer.accountManager}</strong></span>
            </div>
          </div>
        </div>

        {/* Profile Metrics Bar (4 Stats) */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Total Conversations</span>
            <p className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {customer.totalConversations}
            </p>
            <span className="text-[11px] text-slate-400">Lifetime inquiries</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Resolved Conversations</span>
            <p className="mt-1 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {customer.resolvedConversations}
            </p>
            <span className="text-[11px] text-slate-400">
              {customer.totalConversations > 0
                ? `${Math.round((customer.resolvedConversations / customer.totalConversations) * 100)}% resolution rate`
                : '100%'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Average Response Time</span>
            <p className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {customer.avgResponseTime}
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Within Enterprise SLA</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Customer CSAT</span>
            <p className="mt-1 text-xl font-bold font-mono text-amber-500">
              ★ {customer.csat.toFixed(1)} / 5.0
            </p>
            <span className="text-[11px] text-slate-400">Based on recent ratings</span>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {[
          { key: 'overview', label: 'Overview', icon: Building },
          { key: 'conversations', label: `Conversations (${customerConversations.length})`, icon: MessageSquare },
          { key: 'timeline', label: 'Activity Timeline', icon: Activity },
          { key: 'notes', label: `Internal Notes (${customer.notes.length})`, icon: FileText },
          { key: 'insights', label: 'AI Intelligence & Health', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as ProfileTab)}
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
          {/* Left Column: Account Details & Tags */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information Card */}
            <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
                Organization & Account Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Legal Company Name</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {customer.company}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Subscription Tier</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {customer.customerType} Support Plan
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Primary Timezone</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {customer.timezone}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Dedicated Account Manager</span>
                  <p className="font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                    {customer.accountManager}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Billing Cadence</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    Monthly ({customer.mrr})
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Sentiment Score</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {customer.sentiment === 'Positive' ? (
                      <Smile className="w-4 h-4 text-emerald-500" />
                    ) : customer.sentiment === 'Negative' ? (
                      <Frown className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Meh className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {customer.sentiment} ({customer.insights.sentimentScore}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Tags Card */}
            <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
                  Customer Routing & Segment Tags
                </h3>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setIsAddingTag(true)}
                  leftIcon={<Plus className="w-3 h-3" />}
                >
                  Add Tag
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-600 transition-colors"
                      title="Remove tag"
                    >
                      ×
                    </button>
                  </span>
                ))}

                {isAddingTag && (
                  <form onSubmit={handleAddTag} className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Tag name..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="px-2 py-0.5 text-xs rounded border border-brand-500 bg-white dark:bg-slate-900 focus:outline-none"
                    />
                    <Button type="submit" variant="primary" size="xs">
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => setIsAddingTag(false)}
                    >
                      Cancel
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Pinned Notes & AI Quick Take */}
          <div className="space-y-6">
            {/* AI Relationship Take */}
            <div className="p-5 rounded-xl border border-indigo-200/70 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-card">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Relationship Health (AI Copilot)</span>
              </div>
              <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {customer.insights.summary}
              </p>
              <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Churn Risk:</span>
                <span className={cn(
                  'font-bold uppercase tracking-wider',
                  customer.insights.churnRisk === 'Low'
                    ? 'text-emerald-600'
                    : customer.insights.churnRisk === 'High'
                    ? 'text-rose-600'
                    : 'text-amber-600'
                )}>
                  {customer.insights.churnRisk} Risk
                </span>
              </div>
            </div>

            {/* Pinned Note Preview */}
            <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Important Notes
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className="text-xs text-brand-600 hover:underline"
                >
                  View All ({customer.notes.length})
                </button>
              </div>

              {customer.notes.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No notes created yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {customer.notes.slice(0, 2).map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {note.authorName} ({note.authorRole})
                        </span>
                        <span>{note.createdAt}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB B: CONVERSATIONS */}
      {activeTab === 'conversations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Conversation History ({customerConversations.length} records)
            </h3>
            <p className="text-xs text-slate-400">
              Directly linked to Smart Inbox and real-time support queues
            </p>
          </div>

          {customerConversations.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <EmptyState
                icon={<MessageSquare className="w-8 h-8 text-brand-600" />}
                title="No Conversations Yet"
                description={`There are currently no active or historical support threads associated with ${customer.name}.`}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/inbox')}
                  >
                    Go to Smart Inbox
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
                    <th className="px-4 py-3">Subject & Last Message</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Assigned Agent</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {customerConversations.map((conv) => (
                    <tr
                      key={conv.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-brand-600 dark:text-brand-400">
                        {conv.ticketNumber}
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
                      <td className="px-4 py-3">
                        {conv.assignedAgent ? (
                          <div className="flex items-center gap-1.5">
                            <Avatar name={conv.assignedAgent.name} size="xs" />
                            <span className="truncate">{conv.assignedAgent.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
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

      {/* TAB C: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Customer Audit & Activity Timeline
            </h3>

            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 text-xs">
              {(['all', 'support', 'billing', 'account', 'security'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTimelineCategory(cat)}
                  className={cn(
                    'px-2.5 py-1 rounded-md capitalize font-medium transition-colors',
                    timelineCategory === cat
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
            {filteredTimeline.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">
                No activity events found in this category.
              </p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {filteredTimeline.map((item) => (
                  <div key={item.id} className="relative group">
                    {/* Circle icon marker */}
                    <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-brand-600" />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {item.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 capitalize">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-auto font-mono">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB D: INTERNAL NOTES (FULL CRUD) */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Internal Team Notes & Context
            </h3>
            <span className="text-xs text-slate-400">
              Visible only to authenticated team members; customers never see internal notes.
            </span>
          </div>

          {/* New Note Composer */}
          <form
            onSubmit={handleCreateNote}
            className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <FileText className="w-3.5 h-3.5 text-brand-600" />
              <span>Add a Note for {customer.name}</span>
            </div>

            <textarea
              rows={3}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Record call summary, pricing discussion, custom feature request, or special SLA context..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Author: <strong>{currentUser?.name || 'Alex Rivera'}</strong>
              </span>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!newNoteContent.trim()}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Log Note
              </Button>
            </div>
          </form>

          {/* Notes List */}
          <div className="space-y-3">
            {customer.notes.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">
                No internal notes recorded yet. Use the composer above to log the first one.
              </p>
            ) : (
              customer.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={note.authorName} size="xs" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {note.authorName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {note.authorRole}
                      </span>
                      {note.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-brand-600 bg-brand-50 dark:bg-brand-950/60 px-1.5 py-0.5 rounded">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        {note.createdAt}
                      </span>
                      <button
                        type="button"
                        onClick={() => setNoteToDelete(note.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB E: AI INSIGHTS & HEALTH */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* AI Banner / Disclaimer */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-slate-900 dark:to-slate-850 border border-brand-200/60 dark:border-brand-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  AI Customer Intelligence Engine
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Synthesized across historical tickets, NPS responses, and tone sentiment analysis.
                </p>
              </div>
            </div>
            <Badge variant="primary" size="sm">
              AI Generated Demo
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Relationship Health Card */}
            <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Relationship & Sentiment Overview
              </h4>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {customer.insights.summary}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Sentiment Score</span>
                  <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {customer.insights.sentimentScore} / 100
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Churn Risk Level</span>
                  <p className={cn(
                    'text-base font-bold uppercase mt-0.5',
                    customer.insights.churnRisk === 'Low'
                      ? 'text-emerald-600'
                      : customer.insights.churnRisk === 'High'
                      ? 'text-rose-600'
                      : 'text-amber-600'
                  )}>
                    {customer.insights.churnRisk}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Query Topics Card */}
            <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Frequently Discussed Topics
              </h4>

              <div className="flex flex-wrap gap-2">
                {customer.insights.topTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    #{topic}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Recommended Proactive Actions:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-disc pl-4">
                  {customer.insights.recommendedActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={customer}
      />

      {/* Delete Note Confirmation */}
      <ConfirmationDialog
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleDeleteNote}
        title="Delete Internal Note"
        message="Are you sure you want to delete this internal customer note? This cannot be undone."
        confirmLabel="Delete Note"
        variant="danger"
      />
    </div>
  );
};
