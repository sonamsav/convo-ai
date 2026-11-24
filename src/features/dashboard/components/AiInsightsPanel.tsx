import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  FileText,
  Truck,
  Trophy,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { AiInsightItem } from '../types/dashboard';
import { useAppDispatch } from '@/app/store/hooks';
import { addToast } from '@/app/store/slices/toastSlice';
import { cn } from '@/utils/cn';

interface AiInsightsPanelProps {
  insights: AiInsightItem[];
  isLoading?: boolean;
}

export const AiInsightsPanel: React.FC<AiInsightsPanelProps> = ({ insights, isLoading }) => {
  const dispatch = useAppDispatch();

  const handleAction = (item: AiInsightItem) => {
    dispatch(
      addToast({
        type: item.severity === 'positive' ? 'success' : 'info',
        title: `AI Action: ${item.recommendedAction}`,
        message: `Triggered triage task for [${item.category}]: ${item.title}`,
        duration: 3500,
      })
    );
  };

  const categoryIcons = {
    Complaints: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    Billing: <FileText className="w-4 h-4 text-brand-500" />,
    Sentiment: <Truck className="w-4 h-4 text-rose-500" />,
    Performance: <Trophy className="w-4 h-4 text-emerald-500" />,
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card animate-pulse space-y-4">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-slate-100 dark:bg-slate-850" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950 border border-brand-200/60 dark:border-brand-900/40 shadow-card space-y-4">
      {/* Header with Demo Disclosure */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                AI Conversation Intelligence
              </h3>
              <Badge variant="primary" size="sm">
                Copilot Insights
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated anomaly detection, sentiment shifts, and actionable operational recommendations.
            </p>
          </div>
        </div>

        {/* Phase 5 Notice Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
          <Info className="w-3 h-3 text-brand-500" />
          <span>Demo Data (LLM Pipeline in Phase 5)</span>
        </div>
      </div>

      {/* 2x2 Grid of Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {insights.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-brand-300 dark:hover:border-brand-800 transition-all duration-150 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {categoryIcons[item.category]}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {item.category}
                  </span>
                </div>

                <Badge
                  variant={
                    item.severity === 'high'
                      ? 'danger'
                      : item.severity === 'medium'
                      ? 'warning'
                      : 'success'
                  }
                  size="sm"
                  hasDot
                >
                  {item.severity === 'high'
                    ? 'High Priority'
                    : item.severity === 'medium'
                    ? 'Medium'
                    : 'Positive Trend'}
                </Badge>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                Recommended Action:
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleAction(item)}
                rightIcon={<ArrowRight className="w-3 h-3" />}
              >
                {item.recommendedAction}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
