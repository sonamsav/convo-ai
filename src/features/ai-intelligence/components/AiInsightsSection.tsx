import React, { useState, useEffect } from 'react';
import {
  Brain,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Tag,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Button, Badge, LoadingState } from '@/components/ui';
import { aiService } from '../services/aiService';
import { AiInsightsResult } from '../types/ai';

export const AiInsightsSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<AiInsightsResult | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await aiService.getInsights();
      setInsights(res);
    } catch {
      // Handled in service fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-brand-600" />
            <span>AI Macro Conversation Insights &amp; Topic Clustering</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Synthesizes trends, recurring friction points, and escalation triggers across active support queues.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchInsights}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Insights
        </Button>
      </div>

      {isLoading || !insights ? (
        <div className="p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
          <LoadingState message="Synthesizing multi-conversation topic clusters and risk patterns..." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top 3 Risk & Trends Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Repeated Complaints */}
            <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Repeated Customer Complaints
              </span>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc pl-4 leading-relaxed">
                {insights.repeatedComplaints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Unresolved Concerns */}
            <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                Unresolved Operational Concerns
              </span>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc pl-4 leading-relaxed">
                {insights.unresolvedConcerns.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>

            {/* Escalation Risks */}
            <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Active Escalation Risks
              </span>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc pl-4 leading-relaxed">
                {insights.escalationRisks.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Topics and Recommended Follow-ups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Frequently Mentioned Topics */}
            <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-600" />
                <span>Frequently Mentioned Technical Topics</span>
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {insights.frequentlyMentionedTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Suggested Follow-up Actions */}
            <div className="p-5 rounded-xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-card space-y-3">
              <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Recommended Team Follow-Up Actions</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4 leading-relaxed font-medium">
                {insights.suggestedFollowUps.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
