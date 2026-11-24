import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  ArrowRight,
  Layers,
  RotateCcw,
  CheckCircle2,
  FolderTree,
} from 'lucide-react';
import { Button, Badge, LoadingState } from '@/components/ui';
import { useAppDispatch } from '@/app/store/hooks';
import { addToast } from '@/app/store/slices/toastSlice';
import { aiService } from '../services/aiService';
import { AiIntentResult } from '../types/ai';
import { cn } from '@/utils/cn';

const ALL_INTENTS = [
  'Billing Issue',
  'Technical Support',
  'Refund Request',
  'Account Access',
  'Product Inquiry',
  'Complaint',
  'Order Status',
  'General Inquiry',
];

const SAMPLE_INTENTS = [
  {
    label: 'Stripe Double Charge',
    text: 'We were billed $4,500 twice on invoice #INV-9904. Can you please check why our card was charged two times and reverse the second charge?',
  },
  {
    label: 'SSO Login Failure',
    text: 'Our team cannot sign into ConvoAI via Okta SAML SSO. It is throwing a Certificate Expired error on the assertion consumer service.',
  },
  {
    label: 'API Rate Limit',
    text: 'Our background sync script started receiving HTTP 429 Too Many Requests errors when pushing 200 events/sec. How do we request a quota upgrade?',
  },
];

export const AiIntentSection: React.FC = () => {
  const dispatch = useAppDispatch();

  const [inputText, setInputText] = useState(SAMPLE_INTENTS[0].text);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiIntentResult | null>(null);
  const [selectedIntentOverride, setSelectedIntentOverride] = useState<string>('');

  const handleDetect = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const res = await aiService.detectIntent(inputText.trim());
      setResult(res);
      setSelectedIntentOverride(res.intent);

      dispatch(
        addToast({
          type: 'success',
          title: 'Intent Detected',
          message: `Identified as "${res.intent}" (${Math.round(res.confidence * 100)}% confidence).`,
          duration: 2500,
        })
      );
    } catch (err: any) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Detection Failed',
          message: err?.message || 'Could not classify customer intent.',
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverrideIntent = (newIntent: string) => {
    setSelectedIntentOverride(newIntent);
    dispatch(
      addToast({
        type: 'info',
        title: 'Category Reassigned',
        message: `Manually updated intent classification to "${newIntent}".`,
      })
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Target className="w-5 h-5 text-brand-600" />
          <span>Customer Intent & Automated Triage Studio</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Identifies the core operational purpose of inbound inquiries and routes to appropriate queues with confidence scoring.
        </p>
      </div>

      {/* Input Card */}
      <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1.5">
            Sample Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_INTENTS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => setInputText(sample.text)}
                className="px-2.5 py-1 rounded-md text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-500 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Inbound Customer Ticket Message:
          </label>
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={handleDetect}
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Detect Intent & Queue
          </Button>
        </div>
      </div>

      {/* Results Display */}
      {isLoading ? (
        <div className="p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
          <LoadingState message="Classifying intent and calculating queue confidence..." />
        </div>
      ) : result ? (
        <div className="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-5 animate-in fade-in duration-200">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Primary Customer Intent
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedIntentOverride}
                  </h3>
                  {selectedIntentOverride !== result.intent && (
                    <Badge variant="warning" size="sm">
                      Agent Modified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Confidence Gauge */}
            <div className="flex items-center gap-3 text-right sm:text-right">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                  Model Confidence
                </span>
                <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
              <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.round(result.confidence * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Details & Reassignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Classification Explanation
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {result.explanation}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5" />
                Suggested Routing Department
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-bold">
                {result.suggestedCategory}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                Next Step: {result.recommendedNextAction}
              </p>
            </div>
          </div>

          {/* Manual Reassignment Dropdown */}
          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Need to adjust triage? Reassign category:
            </span>
            <select
              value={selectedIntentOverride}
              onChange={(e) => handleOverrideIntent(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
            >
              {ALL_INTENTS.map((intent) => (
                <option key={intent} value={intent}>
                  {intent}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-slate-400 text-xs">
          Select or paste a customer message and click &quot;Detect Intent &amp; Queue&quot; to test classification.
        </div>
      )}
    </div>
  );
};
