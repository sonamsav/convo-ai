import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Lock,
  Smile,
  Paperclip,
  Bookmark,
  X,
  FileText,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  sendMessage,
  setComposerMode,
} from '@/app/store/slices/inboxSlice';
import { socketService } from '@/services/socket/socketService';
import { Message, MessageAttachment } from '../types/inbox';
import { Dropdown } from '@/components/ui/Dropdown';
import { cn } from '@/utils/cn';

interface MessageComposerProps {
  conversationId: string;
  customerName: string;
  suggestedText?: string;
  onClearSuggestedText?: () => void;
  className?: string;
}

const COMMON_EMOJIS = ['👍', '👋', '🙏', '😊', '✅', '🚀', '💡', '⚠️', '🎉', '❤️'];

const CANNED_RESPONSES = [
  {
    title: 'Greeting & Acknowledgment',
    text: 'Hello! Thank you for reaching out to ConvoAI Enterprise Support. I am reviewing your account logs right now.',
  },
  {
    title: 'Engineering Triage Update',
    text: 'We have escalated this trace to our Core Infrastructure Engineering team and verified the ingress fix.',
  },
  {
    title: 'Resolution Confirmation',
    text: 'Can you please confirm if this resolves the issue on your production environment? We are standing by to verify.',
  },
  {
    title: 'Follow-up Scheduled',
    text: 'I will follow up on this ticket within 2 hours once the scheduled rollout completes.',
  },
];

export const MessageComposer: React.FC<MessageComposerProps> = ({
  conversationId,
  customerName,
  suggestedText,
  onClearSuggestedText,
  className,
}) => {
  const dispatch = useAppDispatch();
  const composerMode = useAppSelector((state) => state.inbox.composerMode);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync suggestedText from AI Assistant
  useEffect(() => {
    if (suggestedText) {
      setText(suggestedText);
      if (onClearSuggestedText) onClearSuggestedText();
      textareaRef.current?.focus();
    }
  }, [suggestedText, onClearSuggestedText]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim() && attachments.length === 0) return;

    const isNote = composerMode === 'note';

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      sender: {
        type: 'agent',
        id: currentUser?.id || 'usr_enterprise_01',
        name: currentUser?.name || 'Alex Rivera',
        avatar: currentUser?.avatarUrl,
        role: currentUser?.role === 'admin' ? 'Support Lead' : 'Support Specialist',
      },
      content: text.trim(),
      timestamp: 'Just now',
      status: 'sending',
      isInternalNote: isNote,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    // 1. Dispatch into Redux store
    dispatch(sendMessage(newMessage));

    // 2. Transmit via Socket.IO service adapter
    socketService.sendMessage(newMessage);

    // 3. Clear composer state
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newAtt: MessageAttachment = {
        id: `att_${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || 'application/octet-stream',
      };
      setAttachments((prev) => [...prev, newAtt]);
    }
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setIsEmojiOpen(false);
    textareaRef.current?.focus();
  };

  const insertCannedResponse = (response: string) => {
    setText(response);
    textareaRef.current?.focus();
  };

  const isNote = composerMode === 'note';

  return (
    <div
      className={cn(
        'p-3 sm:p-4 border-t transition-colors duration-150',
        isNote
          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80',
        className
      )}
    >
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
          <button
            type="button"
            onClick={() => dispatch(setComposerMode('reply'))}
            className={cn(
              'px-3 py-1 rounded-md font-semibold transition-all duration-150 flex items-center gap-1.5',
              !isNote
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            Reply
          </button>
          <button
            type="button"
            onClick={() => dispatch(setComposerMode('note'))}
            className={cn(
              'px-3 py-1 rounded-md font-semibold transition-all duration-150 flex items-center gap-1.5',
              isNote
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            <Lock className="w-3 h-3" />
            Internal Note
          </button>
        </div>

        {isNote && (
          <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Team-only note
          </span>
        )}
      </div>

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
            >
              <FileText className="w-3.5 h-3.5 text-brand-500" />
              <span className="truncate max-w-[150px]">{att.name}</span>
              <button
                type="button"
                onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Textarea Container */}
      <div
        className={cn(
          'relative rounded-xl border p-2.5 transition-all duration-150 flex flex-col',
          isNote
            ? 'bg-amber-50/50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 focus-within:ring-2 focus-within:ring-amber-500/20'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500'
        )}
      >
        <textarea
          ref={textareaRef}
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isNote
              ? 'Add internal note for team members (never visible to customer)...'
              : `Reply to ${customerName}... (Enter to send, Shift+Enter for new line)`
          }
          className="w-full resize-none bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none leading-relaxed min-h-[50px]"
        />

        {/* Action Toolbar Bottom Row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1">
            {/* Attachment Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAddAttachment}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Emoji Picker Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsEmojiOpen((prev) => !prev)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Insert Emoji"
              >
                <Smile className="w-4 h-4" />
              </button>

              {isEmojiOpen && (
                <div className="absolute bottom-full left-0 mb-2 p-2 rounded-xl bg-white dark:bg-slate-800 shadow-modal border border-slate-200 dark:border-slate-700 z-50 flex items-center gap-1.5">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Canned Templates Dropdown */}
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px]"
                  title="Canned Responses"
                >
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Templates</span>
                </button>
              }
              align="left"
              width="w-64"
            >
              <div className="p-2 space-y-1">
                <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Canned Responses
                </p>
                {CANNED_RESPONSES.map((tmpl) => (
                  <button
                    key={tmpl.title}
                    type="button"
                    onClick={() => insertCannedResponse(tmpl.text)}
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {tmpl.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {tmpl.text}
                    </p>
                  </button>
                ))}
              </div>
            </Dropdown>
          </div>

          {/* Send / Note Submit Button */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block text-[10px] text-slate-400 font-mono">
              ↵ Send • ⇧↵ Newline
            </span>

            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() && attachments.length === 0}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-150 select-none shadow-sm active:scale-95',
                isNote
                  ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                  : 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800',
                !text.trim() && attachments.length === 0 && 'opacity-50 cursor-not-allowed active:scale-100'
              )}
            >
              <span>{isNote ? 'Save Internal Note' : 'Send'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
