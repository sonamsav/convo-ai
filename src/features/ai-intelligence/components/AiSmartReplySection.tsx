import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  RotateCw,
  Send,
  Edit3,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { Button, Badge, LoadingState } from '@/components/ui';
import { useAppDispatch } from '@/app/store/hooks';
import { addToast } from '@/app/store/slices/toastSlice';
import { aiService } from '../services/aiService';
import { AiSmartReply, ResponseTone, SupportedLanguage } from '../types/ai';
import { cn } from '@/utils/cn';

const AVAILABLE_TONES: ResponseTone[] = [
  'Empathetic',
  'Professional',
  'Friendly',
  'Concise',
  'Formal',
];

const SAMPLE_MESSAGES = [
  {
    label: 'Urgent Outage',
    text: 'Our API webhooks have been failing with 401 signature mismatches for 25 minutes! This is impacting our payment checkout. Please advise immediately!',
    customer: 'Marcus Vance',
  },
  {
    label: 'Billing Inquiry',
    text: 'Hello, our invoice was billed at $8,900 instead of our discounted rate of $7,200. Could you review this and issue a credit note?',
    customer: 'Elena Rostova',
  },
  {
    label: 'Hindi Query (हिंदी)',
    text: 'नमस्ते, क्या आप बता सकते हैं कि हमारा सर्वर इंटीग्रेशन कब तक लाइव होगा? हमें जल्द पुष्टि चाहिए।',
    customer: 'Aarav Sharma',
  },
];

export const AiSmartReplySection: React.FC = () => {
  const dispatch = useAppDispatch();

  const [customerMessage, setCustomerMessage] = useState(SAMPLE_MESSAGES[0].text);
  const [customerName, setCustomerName] = useState(SAMPLE_MESSAGES[0].customer);
  const [selectedTone, setSelectedTone] = useState<ResponseTone>('Empathetic');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');

  const [isLoading, setIsLoading] = useState(false);
  const [replies, setReplies] = useState<AiSmartReply[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editable preview
  const [editableReplyText, setEditableReplyText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!customerMessage.trim()) return;
    setIsLoading(true);

    try {
      const generated = await aiService.generateSmartReplies([], {
        latestMessage: customerMessage,
        customerName,
        tone: selectedTone,
        language: selectedLanguage,
      });

      setReplies(generated);
      if (generated.length > 0) {
        setEditableReplyText(generated[0].text);
        setEditingId(generated[0].id);
      }

      dispatch(
        addToast({
          type: 'success',
          title: 'Replies Generated',
          message: `Generated ${generated.length} suggestions tailored to tone: ${selectedTone}.`,
          duration: 2500,
        })
      );
    } catch (err: any) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Generation Failed',
          message: err?.message || 'Could not generate AI replies.',
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (reply: AiSmartReply) => {
    const textToCopy = editingId === reply.id ? editableReplyText : reply.text;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(reply.id);
    setTimeout(() => setCopiedId(null), 2000);

    dispatch(
      addToast({
        type: 'info',
        title: 'Reply Copied',
        message: 'Text copied to clipboard. Ready to paste or insert into composer.',
      })
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-600" />
          <span>AI Smart Reply Generator Studio</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Synthesizes customer sentiment and context into human-in-the-loop reply suggestions matching distinct organizational tones.
        </p>
      </div>

      {/* Control & Input Card */}
      <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
        {/* Preset Sample Selector */}
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1.5">
            Quick Test Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_MESSAGES.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setCustomerMessage(s.text);
                  setCustomerName(s.customer);
                  if (s.label.includes('Hindi')) {
                    setSelectedLanguage('hi');
                  } else {
                    setSelectedLanguage('en');
                  }
                }}
                className="px-2.5 py-1 rounded-md text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-500 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customer message textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Customer Message to Address:</span>
            <span className="text-[11px] font-normal text-slate-400">
              Customer: <strong>{customerName}</strong>
            </span>
          </div>
          <textarea
            rows={3}
            value={customerMessage}
            onChange={(e) => setCustomerMessage(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
          />
        </div>

        {/* Tone and Language Selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Tone Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Selected Tone:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TONES.map((tone) => {
                const isSelected = selectedTone === tone;
                return (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setSelectedTone(tone)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600 font-semibold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    )}
                  >
                    {tone}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="en">English (en)</option>
              <option value="hi">Hindi (हिन्दी - hi)</option>
              <option value="es">Spanish (Español - es)</option>
              <option value="fr">French (Français - fr)</option>
              <option value="de">German (Deutsch - de)</option>
            </select>

            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerate}
              isLoading={isLoading}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Draft Replies
            </Button>
          </div>
        </div>
      </div>

      {/* Suggested Replies Display */}
      {isLoading ? (
        <div className="p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
          <LoadingState message="Drafting context-aware smart replies..." />
        </div>
      ) : replies.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              AI Candidate Replies ({replies.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Review and click to edit or copy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {replies.map((reply) => {
              const isSelectedForEdit = editingId === reply.id;
              const isCopied = copiedId === reply.id;

              return (
                <div
                  key={reply.id}
                  className={cn(
                    'p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-card flex flex-col justify-between space-y-3 transition-all',
                    isSelectedForEdit
                      ? 'border-brand-500 ring-1 ring-brand-500'
                      : 'border-slate-200/80 dark:border-slate-800'
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="primary" size="sm">
                        {reply.title}
                      </Badge>
                      <span className="text-[11px] font-mono text-emerald-600 font-semibold">
                        {Math.round(reply.confidence * 100)}% Match
                      </span>
                    </div>

                    {isSelectedForEdit ? (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Editable Draft:
                        </span>
                        <textarea
                          rows={4}
                          value={editableReplyText}
                          onChange={(e) => setEditableReplyText(e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-brand-400 bg-slate-50/50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <p
                        onClick={() => {
                          setEditingId(reply.id);
                          setEditableReplyText(reply.text);
                        }}
                        className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                        title="Click to edit draft"
                      >
                        {reply.text}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        setEditingId(reply.id);
                        setEditableReplyText(reply.text);
                      }}
                      leftIcon={<Edit3 className="w-3 h-3" />}
                    >
                      {isSelectedForEdit ? 'Editing Draft' : 'Edit Text'}
                    </Button>

                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleCopy(reply)}
                      leftIcon={isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    >
                      {isCopied ? 'Copied' : 'Copy Response'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-slate-400 text-xs">
          Select a sample message and click &quot;Draft Replies&quot; to test AI reply generation.
        </div>
      )}
    </div>
  );
};
