import React, { useState } from 'react';
import {
  Smile,
  Meh,
  Frown,
  Sparkles,
  RotateCw,
  HeartHandshake,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Button, Badge, LoadingState } from '@/components/ui';
import { useAppDispatch } from '@/app/store/hooks';
import { addToast } from '@/app/store/slices/toastSlice';
import { aiService } from '../services/aiService';
import { AiSentimentResult } from '../types/ai';
import { cn } from '@/utils/cn';

const SAMPLE_SENTIMENTS = [
  {
    label: 'Critical / Frustrated',
    text: 'This is the third time this week our API keys stopped working! We are losing thousands of dollars every hour and nobody is answering the phone! Fix this immediately or we are cancelling our Enterprise subscription!',
  },
  {
    label: 'Collaborative / Grateful',
    text: 'Thank you so much Sarah! That custom edge proxy snippet completely solved our latency problem. We really appreciate your team jumping on this so fast.',
  },
  {
    label: 'Analytical / Neutral',
    text: 'Can you please confirm what the payload size limit is for the POST /v1/events webhook endpoint? We noticed a 413 error on payloads exceeding 5MB.',
  },
];

export const AiSentimentSection: React.FC = () => {
  const dispatch = useAppDispatch();

  const [inputText, setInputText] = useState(SAMPLE_SENTIMENTS[0].text);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiSentimentResult | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const res = await aiService.analyzeSentiment(inputText.trim());
      setResult(res);
      dispatch(
        addToast({
          type: 'info',
          title: 'Sentiment Evaluated',
          message: `Classified as ${res.sentiment} with score ${res.score}/100.`,
          duration: 2500,
        })
      );
    } catch (err: any) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Sentiment Analysis Failed',
          message: err?.message || 'Could not evaluate text sentiment.',
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return <Smile className="w-8 h-8 text-emerald-500" />;
      case 'Negative':
        return <Frown className="w-8 h-8 text-rose-500" />;
      default:
        return <Meh className="w-8 h-8 text-amber-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800';
      case 'Negative':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800';
      default:
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Smile className="w-5 h-5 text-brand-600" />
          <span>Real-Time Sentiment Analysis Studio</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Evaluates emotional tone, churn indicators, urgency markers, and provides empathetic agent coaching.
        </p>
      </div>

      {/* Input Card */}
      <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
        {/* Sample presets */}
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1.5">
            Test Preset Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SENTIMENTS.map((sample) => (
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

        {/* Text Area */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Customer Message or Conversation Transcript to Evaluate:
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
            onClick={handleAnalyze}
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Analyze Sentiment
          </Button>
        </div>
      </div>

      {/* Results Display */}
      {isLoading ? (
        <div className="p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
          <LoadingState message="Evaluating emotional indicators and satisfaction telemetry..." />
        </div>
      ) : result ? (
        <div className="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-5 animate-in fade-in duration-200">
          {/* Main Score Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-850/40">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                {getSentimentIcon(result.sentiment)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {result.sentiment} Sentiment
                  </h3>
                  <span className={cn('px-2 py-0.5 rounded text-xs font-semibold border', getSentimentColor(result.sentiment))}>
                    Score: {result.score} / 100
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Evaluated across linguistic emotional indicators and conversational posture
                </p>
              </div>
            </div>

            {/* Emotional Indicators Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {result.emotionalIndicators.map((ind) => (
                <span
                  key={ind}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                >
                  #{ind}
                </span>
              ))}
            </div>
          </div>

          {/* Reasoning & Recommended Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-600" />
                AI Reasoning Summary
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {result.reasoning}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5" />
                Recommended Agent Response Action
              </span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                {result.recommendedAction}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-slate-400 text-xs">
          Select or paste a message above and click &quot;Analyze Sentiment&quot; to test the sentiment model.
        </div>
      )}
    </div>
  );
};
