import React from 'react';
import {
  Check,
  CheckCheck,
  Clock,
  Lock,
  FileText,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Avatar } from '@/components/ui';
import { Message, MessageDeliveryStatus } from '../types/inbox';
import { cn } from '@/utils/cn';

interface MessageItemProps {
  message: Message;
}

const DeliveryStatusIcon: React.FC<{ status?: MessageDeliveryStatus }> = ({ status }) => {
  if (!status || status === 'sending') {
    return <Clock className="w-3 h-3 text-slate-400 shrink-0" />;
  }
  if (status === 'sent') {
    return <Check className="w-3 h-3 text-slate-400 shrink-0" />;
  }
  if (status === 'delivered') {
    return <CheckCheck className="w-3 h-3 text-slate-400 shrink-0" />;
  }
  if (status === 'read') {
    return <CheckCheck className="w-3 h-3 text-sky-400 dark:text-sky-300 shrink-0" />;
  }
  return null;
};

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  // Case 1: System Event Message (Centered pill)
  if (message.sender.type === 'system') {
    return (
      <div className="flex items-center justify-center my-3">
        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shadow-2xs font-medium">
          <AlertCircle className="w-3 h-3 text-slate-400" />
          {message.content}
        </span>
      </div>
    );
  }

  // Case 2: Internal Note Message (Prominently styled with amber border, lock icon, and team-only banner)
  if (message.isInternalNote) {
    return (
      <div className="my-3 px-4 sm:px-6">
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-4 shadow-subtle space-y-2">
          {/* Note Banner Header */}
          <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-900/40 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                <Lock className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                Private Internal Note
              </span>
              <span className="hidden sm:inline-block text-[10px] text-amber-700/80 dark:text-amber-400/80">
                • Visible only to team members
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-amber-700/80 dark:text-amber-400">
              <span className="font-semibold">{message.sender.name}</span>
              <span>•</span>
              <span className="font-mono">{message.timestamp}</span>
            </div>
          </div>

          {/* Note Body */}
          <p className="text-xs text-amber-900 dark:text-amber-200 whitespace-pre-wrap leading-relaxed font-sans">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // Case 3: Standard Customer or Agent Message
  const isAgent = message.sender.type === 'agent';

  return (
    <div
      className={cn(
        'flex items-end gap-2.5 px-4 sm:px-6 my-2 group',
        isAgent ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <Avatar
        src={message.sender.avatar}
        name={message.sender.name}
        size="sm"
        className="shrink-0 mb-1"
      />

      <div
        className={cn(
          'flex flex-col max-w-[85%] sm:max-w-[70%]',
          isAgent ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender Name & Role Header */}
        <div className="flex items-center gap-2 px-1 mb-1 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {message.sender.name}
          </span>
          {message.sender.role && (
            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
              {message.sender.role}
            </span>
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            'p-3.5 rounded-2xl text-xs leading-relaxed shadow-subtle break-words space-y-2',
            isAgent
              ? 'bg-brand-600 text-white rounded-br-xs dark:bg-brand-600 selection:bg-brand-800'
              : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-bl-xs'
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>

          {/* Attachments preview */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className={cn(
                    'flex items-center justify-between gap-3 p-2 rounded-lg border text-xs',
                    isAgent
                      ? 'bg-brand-700/60 border-brand-500/50 text-brand-100'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold truncate">{att.name}</p>
                      <p className="text-[10px] opacity-75">{att.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Simulated download for: ${att.name}`)}
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
                    title="Download attachment"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp and Delivery Status Tick */}
        <div className="flex items-center gap-1.5 px-1 mt-1 text-[10px] text-slate-400 font-mono">
          <span>{message.timestamp}</span>
          {isAgent && <DeliveryStatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
};
