import React, { useRef, useEffect, useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  UserCheck,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreVertical,
  Inbox,
  User,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  selectCurrentMessages,
  updateConversationStatus,
  updateConversationPriority,
  toggleCustomerContext,
  toggleAiPanel,
} from '@/app/store/slices/inboxSlice';
import { addToast } from '@/app/store/slices/toastSlice';
import { Conversation } from '../types/inbox';
import { MessageItem } from './MessageItem';
import { MessageComposer } from './MessageComposer';
import { AgentAssignModal } from './AgentAssignModal';
import { TransferConversationModal } from './TransferConversationModal';
import { AiAssistanceDrawer } from './AiAssistanceDrawer';
import { Avatar, Badge, Button, Dropdown } from '@/components/ui';
import { cn } from '@/utils/cn';

interface ChatWindowPanelProps {
  conversation: Conversation | null;
  onBackToMobileList?: () => void;
  className?: string;
}

export const ChatWindowPanel: React.FC<ChatWindowPanelProps> = ({
  conversation,
  onBackToMobileList,
  className,
}) => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectCurrentMessages);
  const isTyping = useAppSelector(
    (state) => Boolean(conversation && state.inbox.isTypingMap[conversation.id])
  );
  const isCustomerContextOpen = useAppSelector((state) => state.inbox.customerContextOpen);
  const isAiPanelOpen = useAppSelector((state) => state.inbox.aiPanelOpen);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [suggestedTextToInsert, setSuggestedTextToInsert] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!conversation) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center h-full bg-slate-50/50 dark:bg-slate-950/40 p-8 text-center',
          className
        )}
      >
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card flex items-center justify-center text-slate-400 mb-4">
          <Inbox className="w-7 h-7 text-brand-600 dark:text-brand-400" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
          No Conversation Selected
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
          Select an active thread from the inbox list or choose a priority queue to start responding.
        </p>
      </div>
    );
  }

  const handleStatusChange = (status: 'open' | 'pending' | 'resolved') => {
    dispatch(updateConversationStatus({ conversationId: conversation.id, status }));
    dispatch(
      addToast({
        type: status === 'resolved' ? 'success' : 'info',
        title: `Conversation ${status.toUpperCase()}`,
        message: `Ticket ${conversation.ticketNumber} marked as ${status}.`,
        duration: 3000,
      })
    );
  };

  const handlePriorityChange = (priority: 'urgent' | 'high' | 'medium' | 'low') => {
    dispatch(updateConversationPriority({ conversationId: conversation.id, priority }));
    dispatch(
      addToast({
        type: 'info',
        title: 'Priority Updated',
        message: `${conversation.ticketNumber} priority changed to ${priority.toUpperCase()}.`,
        duration: 2500,
      })
    );
  };

  const priorityStyles = {
    urgent: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    high: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    medium: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  return (
    <section
      className={cn(
        'flex flex-col h-full bg-slate-50/30 dark:bg-slate-950/20 overflow-hidden relative',
        className
      )}
    >
      {/* 1. Chat Window Header */}
      <header className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0 select-none">
        {/* Left: Mobile Back button & Customer summary */}
        <div className="flex items-center gap-3 min-w-0">
          {onBackToMobileList && (
            <button
              type="button"
              onClick={onBackToMobileList}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Back to conversation list"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <Avatar
            src={conversation.customer.avatar}
            name={conversation.customer.name}
            status={conversation.customer.status === 'vip' ? 'online' : undefined}
            size="sm"
          />

          <div className="truncate min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {conversation.customer.name}
              </h3>
              <span className="font-mono text-[10px] text-slate-400 font-semibold">
                {conversation.ticketNumber}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {conversation.subject}
            </p>
          </div>
        </div>

        {/* Right: Operational Controls & Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Status Dropdown */}
          <select
            aria-label="Change Status"
            value={conversation.status}
            onChange={(e) =>
              handleStatusChange(e.target.value as 'open' | 'pending' | 'resolved')
            }
            className={cn(
              'text-xs font-semibold px-2 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors',
              conversation.status === 'open'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : conversation.status === 'pending'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            )}
          >
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Priority Dropdown */}
          <select
            aria-label="Change Priority"
            value={conversation.priority}
            onChange={(e) =>
              handlePriorityChange(e.target.value as 'urgent' | 'high' | 'medium' | 'low')
            }
            className={cn(
              'hidden sm:block text-xs font-semibold px-2 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors capitalize',
              priorityStyles[conversation.priority]
            )}
          >
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assign Agent Button */}
          <Button
            variant="outline"
            size="xs"
            onClick={() => setIsAssignModalOpen(true)}
            className="hidden md:inline-flex"
            leftIcon={<UserCheck className="w-3.5 h-3.5" />}
          >
            {conversation.assignedAgent
              ? conversation.assignedAgent.name.split(' ')[0]
              : 'Assign'}
          </Button>

          {/* Transfer Button */}
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsTransferModalOpen(true)}
            className="hidden xl:inline-flex"
            leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
          >
            Transfer
          </Button>

          {/* AI Copilot Toggle Button */}
          <button
            type="button"
            onClick={() => dispatch(toggleAiPanel())}
            className={cn(
              'p-2 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5',
              isAiPanelOpen
                ? 'bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-950/60 dark:border-brand-800 dark:text-brand-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-300'
            )}
            title="Toggle AI Copilot"
            aria-label="Toggle AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Customer Context Panel Toggle Button */}
          <button
            type="button"
            onClick={() => dispatch(toggleCustomerContext())}
            className={cn(
              'p-2 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5',
              isCustomerContextOpen
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            )}
            title="Toggle Customer Context Panel"
            aria-label="Toggle Customer Context Panel"
          >
            <User className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Message History Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        {/* Date Divider */}
        <div className="flex items-center justify-center my-2">
          <span className="px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-400 font-mono select-none">
            Today
          </span>
        </div>

        {/* Message Items */}
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}

        {/* Simulated Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 px-6 my-2 text-xs text-slate-400 animate-in fade-in">
            <Avatar
              src={conversation.customer.avatar}
              name={conversation.customer.name}
              size="xs"
            />
            <span className="flex items-center gap-1 font-medium text-[11px] text-slate-500">
              {conversation.customer.name} is typing
              <span className="inline-flex gap-0.5 ml-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </span>
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Composer Panel */}
      <MessageComposer
        conversationId={conversation.id}
        customerName={conversation.customer.name}
        suggestedText={suggestedTextToInsert}
        onClearSuggestedText={() => setSuggestedTextToInsert('')}
      />

      {/* Agent Assign Modal */}
      <AgentAssignModal
        conversationId={conversation.id}
        ticketNumber={conversation.ticketNumber}
        currentAgent={conversation.assignedAgent}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />

      {/* Transfer Conversation Modal */}
      <TransferConversationModal
        conversationId={conversation.id}
        ticketNumber={conversation.ticketNumber}
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      {/* AI Assistance Drawer */}
      <AiAssistanceDrawer
        conversation={conversation}
        isOpen={isAiPanelOpen}
        onClose={() => dispatch(toggleAiPanel())}
        onInsertReply={(text) => setSuggestedTextToInsert(text)}
      />
    </section>
  );
};
