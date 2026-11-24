import React from 'react';
import {
  Sparkles,
  Brain,
  Cpu,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  Server,
  Sliders,
} from 'lucide-react';
import { StatCard, Badge, Button } from '@/components/ui';
import { AiStatus } from '../types/ai';

interface AiOverviewSectionProps {
  status: AiStatus | null;
  onNavigateTab: (tab: string) => void;
  onOpenSettings: () => void;
}

export const AiOverviewSection: React.FC<AiOverviewSectionProps> = ({
  status,
  onNavigateTab,
  onOpenSettings,
}) => {
  return (
    <div className="space-y-6">
      {/* Engine Status Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-white/20 text-white backdrop-blur-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
              Enterprise AI Intelligence Engine Active
            </span>
            <Badge variant="success" size="sm" hasDot className="bg-white/20 text-white border-white/30">
              Online ({status?.model || 'gpt-4o'})
            </Badge>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            OpenAI Model Integration & Conversation Co-Pilot
          </h2>
          <p className="text-xs text-indigo-100 max-w-xl leading-relaxed">
            Real-time inference pipeline powering thread summarization, empathetic reply drafting, sentiment triage, and multilingual translations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30"
            leftIcon={<Sliders className="w-3.5 h-3.5" />}
          >
            Model Parameters
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigateTab('smartReply')}
            leftIcon={<Zap className="w-3.5 h-3.5 text-brand-600" />}
          >
            Smart Reply Studio
          </Button>
        </div>
      </div>

      {/* 3 Core Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Triage Classification Accuracy"
          value="98.4%"
          change={{ value: '+1.6%', isPositive: true, label: 'vs last month' }}
          icon={<Brain className="w-5 h-5" />}
          iconBgColor="bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400"
        />
        <StatCard
          title="Smart Reply Acceptance Rate"
          value="78.6%"
          change={{ value: '+6.2%', isPositive: true, label: 'agent approval' }}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
        />
        <StatCard
          title="P95 Inference Latency"
          value="380ms"
          change={{ value: '-75ms', isPositive: true, label: 'streaming time' }}
          icon={<Cpu className="w-5 h-5" />}
          iconBgColor="bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400"
        />
      </div>

      {/* Security & Capability Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active AI Modules */}
        <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-600" />
              <span>Active Inference Capabilities</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              6 Modules Live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { name: 'Conversation Summarizer', tab: 'summarize' },
              { name: 'Smart Reply Generator', tab: 'smartReply' },
              { name: 'Sentiment Analysis 360', tab: 'sentiment' },
              { name: 'Customer Intent Detection', tab: 'intent' },
              { name: 'Multilingual Translation (HI/EN)', tab: 'language' },
              { name: 'Macro Topic Clustering', tab: 'insights' },
            ].map((cap) => (
              <button
                key={cap.name}
                type="button"
                onClick={() => onNavigateTab(cap.tab)}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-brand-500/40 text-left transition-colors group"
              >
                <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                  {cap.name}
                </span>
                <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform text-[11px]">
                  →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Security & Guardrails */}
        <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Enterprise Security & Data Privacy</span>
          </h3>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Client Secret Exposure:</strong> OpenAI API keys remain stored strictly on the backend Node.js layer and are never shipped to client bundles.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Automated PII Sanitization:</strong> Credit card patterns, API tokens, and credentials are automatically stripped prior to LLM submission.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Rate Limiting & Cost Safeguards:</strong> Strict per-client token throttling prevents quota exhaustion and unexpected billing spikes.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
