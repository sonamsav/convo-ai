import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  RotateCw,
  AlertCircle,
  Clock,
  ArrowRight,
  User,
  CheckCircle2,
} from 'lucide-react';
import { Button, Badge, LoadingState } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { addToast } from '@/app/store/slices/toastSlice';
import { aiService } from '../services/aiService';
import { AiSummaryResult } from '../types/ai';
import { cn } from '@/utils/cn';

export const AiSummarizerSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((state) => state.inbox.conversations);

  const [selectedConversationId, setSelectedConversationId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [customTranscript, setCustomTranscript] = useState('');
  const [useCustomTranscript, setUseCustomTranscript] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<AiSummaryResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const selectedConv = conversations.find((c) => c.id === selectedConversationId);

  const handleGenerate = async () => {
    setIsLoading(true);

    try {
      let messagesToSummarize: { role: string; content: string; senderName?: string }[] = [];
      let customerContext: { name: string; company: string; plan?: string; subject?: string } = {
        name: 'Marcus Vance',
        company: 'Stripe, Inc.',
        subject: 'Webhook 401 Error',
      };

      if (useCustomTranscript && customTranscript.trim()) {
        messagesToSummarize = [
          { role: 'user', content: customTranscript.trim(), senderName: 'Customer' },
        ];
      } else if (selectedConv) {
        customerContext = {
          name: selectedConv.customer.name,
          company: selectedConv.customer.company,
          plan: selectedConv.customer.plan,
          subject: selectedConv.subject,
        };
        messagesToSummarize = [
          {
            role: 'user',
            content: `Subject: ${selectedConv.subject}. Last message: ${selectedConv.lastMessage.content}`,
            senderName: selectedConv.customer.name,
          },
        ];
      }

      const result = await aiService.summarize(
        messagesToSummarize,
        customerContext,
        selectedConv?.id
      );

      setSummaryResult(result);
      dispatch(
        addToast({
          type: 'success',
          title: 'Summary Generated',
          message: 'Conversation analyzed and structured action items extracted.',
          duration: 3000,
        })
      );
    } catch (err: any) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Summarization Failed',
          message: err?.message || 'Unable to connect to AI summarization service.',
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summaryResult) return;
    const textToCopy = `CONVOAI CONVERSATION SUMMARY\n\nOverview:\n${summaryResult.overview}\n\nCore Problem:\n${summaryResult.customerProblem}\n\nActions Taken:\n${summaryResult.actionsTaken.map((a) => `- ${a}`).join('\n')}\n\nStatus: ${summaryResult.status}\n\nPending Items:\n${summaryResult.pendingActions.map((p) => `- ${p}`).join('\n')}\n\nRecommended Next Step:\n${summaryResult.recommendedNextStep}`;

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);

    dispatch(
      addToast({
        type: 'info',
        title: 'Copied to Clipboard',
        message: 'Full structured summary copied formatted as text.',
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <span>AI Conversation Summarization Studio</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automatically extracts pain points, actions taken, blockers, and recommended resolution paths.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUseCustomTranscript(!useCustomTranscript)}
          >
            {useCustomTranscript ? 'Select Live Conversation' : 'Paste Custom Transcript'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Generate Summary
          </Button>
        </div>
      </div>

      {/* Input Selection Card */}
      <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        {useCustomTranscript ? (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Custom Chat Transcript or Email Body:
            </label>
            <textarea
              rows={4}
              value={customTranscript}
              onChange={(e) => setCustomTranscript(e.target.value)}
              placeholder="Paste raw conversation messages between agent and customer here..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select an Active Conversation from CRM / Smart Inbox:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {conversations.slice(0, 6).map((conv) => {
                const isSelected = selectedConversationId === conv.id;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-all text-xs flex flex-col justify-between space-y-1.5',
                      isSelected
                        ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 ring-1 ring-brand-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-brand-600 dark:text-brand-400">
                        {conv.ticketNumber}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {conv.customer.plan}
                      </Badge>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {conv.customer.name} ({conv.customer.company})
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {conv.subject}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Output Results Area */}
      {isLoading ? (
        <div className="p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-3">
          <LoadingState message="Analyzing conversation transcript with OpenAI..." />
        </div>
      ) : summaryResult ? (
        <div className="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-5 animate-in fade-in duration-200">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <FileText className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Conversation Executive Brief
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Target: {selectedConv?.customer.name || 'Account'} • Model: gpt-4o
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={handleCopy}
                leftIcon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {isCopied ? 'Copied' : 'Copy Summary'}
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleGenerate}
                leftIcon={<RotateCw className="w-3.5 h-3.5" />}
              >
                Regenerate
              </Button>
            </div>
          </div>

          {/* Overview Callout */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              High-Level Overview
            </span>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {summaryResult.overview}
            </p>
          </div>

          {/* Structured Detail Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Core Problem */}
            <div className="p-4 rounded-xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/30 dark:bg-rose-950/20 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold">
                Customer Core Pain Point
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                {summaryResult.customerProblem}
              </p>
            </div>

            {/* Current Status */}
            <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                Current Ticket State
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                Status: <strong>{summaryResult.status}</strong>
              </p>
            </div>

            {/* Actions Taken */}
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Actions Taken So Far
              </span>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 list-disc pl-4">
                {summaryResult.actionsTaken.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>

            {/* Pending Actions */}
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Pending Actions & Blockers
              </span>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 list-disc pl-4">
                {summaryResult.pendingActions.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Next Step */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                Recommended Agent Action:
              </span>
              <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5 font-semibold">
                {summaryResult.recommendedNextStep}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-slate-400 text-xs">
          Select a conversation above and click &quot;Generate Summary&quot; to inspect real-time AI summarization.
        </div>
      )}
    </div>
  );
};
