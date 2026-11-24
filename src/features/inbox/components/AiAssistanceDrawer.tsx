import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Copy,
  Check,
  RotateCw,
  ArrowRight,
  Smile,
  Target,
  FileText,
  Zap,
  Globe,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { Drawer, Button, Badge } from '@/components/ui';
import { Conversation } from '../types/inbox';
import { useAppDispatch } from '@/app/store/hooks';
import { addToast } from '@/app/store/slices/toastSlice';
import { aiService } from '@/features/ai-intelligence/services/aiService';
import {
  AiSummaryResult,
  AiSmartReply,
  AiSentimentResult,
  AiIntentResult,
  AiTranslationResult,
  ResponseTone,
  SupportedLanguage,
} from '@/features/ai-intelligence/types/ai';
import { cn } from '@/utils/cn';

interface AiAssistanceDrawerProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
  onInsertReply: (text: string) => void;
}

type TabType = 'summary' | 'smart_reply' | 'sentiment' | 'intent' | 'translate';

export const AiAssistanceDrawer: React.FC<AiAssistanceDrawerProps> = ({
  conversation,
  isOpen,
  onClose,
  onInsertReply,
}) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Settings in drawer
  const [selectedTone, setSelectedTone] = useState<ResponseTone>('Empathetic');
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en');

  // Live state per conversation
  const [summary, setSummary] = useState<AiSummaryResult | null>(null);
  const [smartReplies, setSmartReplies] = useState<AiSmartReply[]>([]);
  const [sentiment, setSentiment] = useState<AiSentimentResult | null>(null);
  const [intent, setIntent] = useState<AiIntentResult | null>(null);
  const [translation, setTranslation] = useState<AiTranslationResult | null>(null);

  // Reset and fetch when conversation changes or drawer opens
  useEffect(() => {
    if (!isOpen) return;

    // Reset stale state
    setSummary(null);
    setSmartReplies([]);
    setSentiment(null);
    setIntent(null);
    setTranslation(null);

    loadActiveTabData(activeTab);
  }, [conversation.id, isOpen]);

  // Load data for active tab on demand
  useEffect(() => {
    if (isOpen) {
      loadActiveTabData(activeTab);
    }
  }, [activeTab]);

  const loadActiveTabData = async (tab: TabType) => {
    setIsLoading(true);
    const messages = [
      {
        role: 'user',
        content: conversation.lastMessage.content,
        senderName: conversation.customer.name,
      },
    ];
    const customerContext = {
      name: conversation.customer.name,
      company: conversation.customer.company,
      plan: conversation.customer.plan,
      subject: conversation.subject,
    };

    try {
      if (tab === 'summary' && !summary) {
        const res = await aiService.summarize(messages, customerContext, conversation.id);
        setSummary(res);
      } else if (tab === 'smart_reply') {
        const res = await aiService.generateSmartReplies(messages, {
          latestMessage: conversation.lastMessage.content,
          customerName: conversation.customer.name,
          tone: selectedTone,
          language: selectedLang,
          customerContext: { company: conversation.customer.company },
        });
        setSmartReplies(res);
      } else if (tab === 'sentiment' && !sentiment) {
        const res = await aiService.analyzeSentiment(conversation.lastMessage.content, conversation.id);
        setSentiment(res);
      } else if (tab === 'intent' && !intent) {
        const res = await aiService.detectIntent(conversation.lastMessage.content, messages);
        setIntent(res);
      } else if (tab === 'translate') {
        const res = await aiService.translate(conversation.lastMessage.content, selectedLang);
        setTranslation(res);
      }
    } catch (err: any) {
      console.error('AI Drawer error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    dispatch(
      addToast({
        type: 'success',
        title: 'Copied to Clipboard',
        message: 'Text copied. You can paste it into any tool or composer.',
        duration: 2000,
      })
    );
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'summary') {
        const res = await aiService.summarize(
          [{ role: 'user', content: conversation.lastMessage.content, senderName: conversation.customer.name }],
          { name: conversation.customer.name, company: conversation.customer.company, subject: conversation.subject },
          conversation.id
        );
        setSummary(res);
      } else if (activeTab === 'smart_reply') {
        const res = await aiService.generateSmartReplies([], {
          latestMessage: conversation.lastMessage.content,
          customerName: conversation.customer.name,
          tone: selectedTone,
          language: selectedLang,
        });
        setSmartReplies(res);
      } else if (activeTab === 'sentiment') {
        const res = await aiService.analyzeSentiment(conversation.lastMessage.content, conversation.id);
        setSentiment(res);
      } else if (activeTab === 'intent') {
        const res = await aiService.detectIntent(conversation.lastMessage.content);
        setIntent(res);
      } else if (activeTab === 'translate') {
        const res = await aiService.translate(conversation.lastMessage.content, selectedLang);
        setTranslation(res);
      }

      dispatch(
        addToast({
          type: 'info',
          title: 'AI Analysis Refreshed',
          message: 'Output re-calculated with latest conversation context.',
          duration: 2500,
        })
      );
    } catch {
      // Handled in fallback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      size="md"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>AI Copilot Intelligence</span>
        </div>
      }
      description="Live OpenAI model triage, context-aware smart replies, and sentiment telemetry."
    >
      <div className="space-y-4">
        {/* Ticket Header Pill */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
              {conversation.ticketNumber}
            </span>
            <span className="text-slate-500 ml-2">
              {conversation.customer.name} ({conversation.customer.company})
            </span>
          </div>
          <Badge variant="primary" size="sm">
            Model: gpt-4o
          </Badge>
        </div>

        {/* Feature Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-xs border-b border-slate-100 dark:border-slate-800">
          {[
            { id: 'summary', label: 'Summary', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'smart_reply', label: 'Smart Reply', icon: <Bot className="w-3.5 h-3.5" /> },
            { id: 'sentiment', label: 'Sentiment', icon: <Smile className="w-3.5 h-3.5" /> },
            { id: 'intent', label: 'Intent', icon: <Target className="w-3.5 h-3.5" /> },
            { id: 'translate', label: 'Translate', icon: <Globe className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Refresh / Regenerate Row */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Active Context: {conversation.subject}</span>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isLoading}
            className="flex items-center gap-1 hover:text-brand-600 transition-colors"
          >
            <RotateCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin text-brand-600')} />
            <span>Regenerate</span>
          </button>
        </div>

        {/* Loading state skeleton */}
        {isLoading ? (
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse">
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-16 w-full bg-slate-100 dark:bg-slate-850 rounded" />
            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* TAB 1: Summary */}
            {activeTab === 'summary' && summary && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-card text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Thread Executive Summary
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {summary.overview}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
                  <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block mb-0.5">
                    Main Customer Pain Point
                  </span>
                  <p className="text-slate-800 dark:text-slate-200">{summary.customerProblem}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    Actions Taken So Far:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 leading-relaxed">
                    {summary.actionsTaken.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Recommended Next Step:</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400 text-right max-w-xs">
                    {summary.recommendedNextStep}
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: Smart Reply Suggestions */}
            {activeTab === 'smart_reply' && (
              <div className="space-y-3 text-xs">
                {/* Tone and Language selectors */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Tone:</span>
                    <select
                      value={selectedTone}
                      onChange={(e) => {
                        setSelectedTone(e.target.value as ResponseTone);
                        loadActiveTabData('smart_reply');
                      }}
                      className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    >
                      <option value="Empathetic">Empathetic</option>
                      <option value="Professional">Professional</option>
                      <option value="Friendly">Friendly</option>
                      <option value="Concise">Concise</option>
                      <option value="Formal">Formal</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Lang:</span>
                    <select
                      value={selectedLang}
                      onChange={(e) => {
                        setSelectedLang(e.target.value as SupportedLanguage);
                        loadActiveTabData('smart_reply');
                      }}
                      className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    >
                      <option value="en">English (en)</option>
                      <option value="hi">Hindi (हिन्दी)</option>
                      <option value="es">Spanish (es)</option>
                    </select>
                  </div>
                </div>

                {smartReplies.map((sr) => (
                  <div
                    key={sr.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {sr.title}
                      </span>
                      <Badge variant="primary" size="sm">
                        {sr.tone}
                      </Badge>
                    </div>

                    <p className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 leading-relaxed font-sans border border-slate-100 dark:border-slate-800">
                      {sr.text}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleCopy(sr.text, sr.id)}
                        leftIcon={
                          copiedId === sr.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )
                        }
                      >
                        {copiedId === sr.id ? 'Copied' : 'Copy'}
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => {
                          onInsertReply(sr.text);
                          onClose();
                          dispatch(
                            addToast({
                              type: 'success',
                              title: 'Inserted into Composer',
                              message: 'AI suggestion loaded into chat composer. Review and send when ready.',
                              duration: 2500,
                            })
                          );
                        }}
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Insert in Composer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: Customer Sentiment */}
            {activeTab === 'sentiment' && sentiment && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 text-xs shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">
                      Real-Time Sentiment Score
                    </h4>
                    <p className="text-slate-400 text-[11px]">Evaluated with gpt-4o NLP</p>
                  </div>
                  <Badge
                    variant={
                      sentiment.sentiment === 'Positive'
                        ? 'success'
                        : sentiment.sentiment === 'Negative'
                        ? 'danger'
                        : 'warning'
                    }
                    size="md"
                  >
                    {sentiment.sentiment} ({sentiment.score}/100)
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        sentiment.sentiment === 'Positive'
                          ? 'bg-emerald-500'
                          : sentiment.sentiment === 'Negative'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      )}
                      style={{ width: `${sentiment.score}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Detected Emotional Indicators:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sentiment.emotionalIndicators.map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                    Recommended Agent Response:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    {sentiment.recommendedAction}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: Intent Extraction */}
            {activeTab === 'intent' && intent && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 text-xs shadow-card">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">
                    Extracted Customer Intent
                  </h4>
                  <p className="text-brand-600 dark:text-brand-400 font-semibold mt-1">
                    {intent.intent}
                  </p>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {intent.explanation}
                </p>

                <div className="p-3 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400 block mb-0.5">
                    Suggested Routing Department:
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {intent.suggestedCategory}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Next Action: {intent.recommendedNextAction}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px]">
                  <span className="text-slate-400">Classification Confidence:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(intent.confidence * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* TAB 5: Translation */}
            {activeTab === 'translate' && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 text-xs shadow-card">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">
                    Neural Translation
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Target:</span>
                    <select
                      value={selectedLang}
                      onChange={(e) => {
                        setSelectedLang(e.target.value as SupportedLanguage);
                        loadActiveTabData('translate');
                      }}
                      className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    >
                      <option value="en">English (en)</option>
                      <option value="hi">Hindi (हिन्दी)</option>
                      <option value="es">Spanish (es)</option>
                    </select>
                  </div>
                </div>

                {translation ? (
                  <div className="space-y-3 pt-1">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase text-slate-400 font-bold">
                        Translated ({translation.targetLanguage.toUpperCase()}):
                      </span>
                      <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                        {translation.translatedText}
                      </p>
                    </div>

                    <div className="flex items-center justify-end">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleCopy(translation.translatedText, 'trans')}
                        leftIcon={
                          copiedId === 'trans' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )
                        }
                      >
                        {copiedId === 'trans' ? 'Copied' : 'Copy Translation'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic py-2">Translating message...</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
};
