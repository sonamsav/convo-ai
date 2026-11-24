import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  MessageSquare,
  Smile,
  Target,
  Globe,
  Brain,
  BarChart3,
  Sliders,
  RotateCw,
  Cpu,
  Layers,
  Lock,
} from 'lucide-react';
import { PageHeader, Button, Badge, Modal } from '@/components/ui';
import { aiService } from '../services/aiService';
import { AiStatus } from '../types/ai';
import { AiOverviewSection } from '../components/AiOverviewSection';
import { AiSummarizerSection } from '../components/AiSummarizerSection';
import { AiSmartReplySection } from '../components/AiSmartReplySection';
import { AiSentimentSection } from '../components/AiSentimentSection';
import { AiIntentSection } from '../components/AiIntentSection';
import { AiLanguageSection } from '../components/AiLanguageSection';
import { AiInsightsSection } from '../components/AiInsightsSection';
import { AiUsageConfigSection } from '../components/AiUsageConfigSection';
import { cn } from '@/utils/cn';

type ActiveTab =
  | 'overview'
  | 'summarize'
  | 'smartReply'
  | 'sentiment'
  | 'intent'
  | 'language'
  | 'insights'
  | 'usage';

export const AiIntelligencePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [isParamsModalOpen, setIsParamsModalOpen] = useState(false);

  useEffect(() => {
    aiService.getStatus().then((res) => setStatus(res));
  }, []);

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'AI Overview', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'summarize', label: 'Summarization', icon: <FileText className="w-4 h-4" /> },
    { key: 'smartReply', label: 'Smart Reply', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'sentiment', label: 'Sentiment 360', icon: <Smile className="w-4 h-4" /> },
    { key: 'intent', label: 'Intent Detection', icon: <Target className="w-4 h-4" /> },
    { key: 'language', label: 'Multilingual & Hindi', icon: <Globe className="w-4 h-4" /> },
    { key: 'insights', label: 'Conversation Insights', icon: <Brain className="w-4 h-4" /> },
    { key: 'usage', label: 'Usage & Configuration', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="AI Intelligence"
        description="Transform customer conversations into actionable insights using AI."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'AI Intelligence', isCurrent: true },
        ]}
        badge={
          <Badge variant="primary" size="sm" hasDot>
            Model: {status?.model || 'gpt-4o'}
          </Badge>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => aiService.getStatus().then((res) => setStatus(res))}
              leftIcon={<RotateCw className="w-3.5 h-3.5" />}
            >
              Refresh Engine
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsParamsModalOpen(true)}
              leftIcon={<Sliders className="w-3.5 h-3.5" />}
            >
              Model Parameters
            </Button>
          </>
        }
      />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto scrollbar-none pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all border-b-2 -mb-px select-none',
                isActive
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'
              )}
            >
              <span className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <AiOverviewSection
          status={status}
          onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
          onOpenSettings={() => setActiveTab('usage')}
        />
      )}

      {activeTab === 'summarize' && <AiSummarizerSection />}
      {activeTab === 'smartReply' && <AiSmartReplySection />}
      {activeTab === 'sentiment' && <AiSentimentSection />}
      {activeTab === 'intent' && <AiIntentSection />}
      {activeTab === 'language' && <AiLanguageSection />}
      {activeTab === 'insights' && <AiInsightsSection />}
      {activeTab === 'usage' && <AiUsageConfigSection />}

      {/* Model Parameters Modal */}
      <Modal
        isOpen={isParamsModalOpen}
        onClose={() => setIsParamsModalOpen(false)}
        size="md"
        title="OpenAI Model Parameters & Architecture"
        description="Backend model orchestration, temperature bounds, and security guardrails."
        footer={
          <Button variant="primary" size="sm" onClick={() => setIsParamsModalOpen(false)}>
            Done
          </Button>
        }
      >
        <div className="space-y-4 text-xs py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                Primary Model
              </span>
              <p className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                {status?.model || 'gpt-4o'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                Default Temperature
              </span>
              <p className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                0.2 (Deterministic)
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                Response Format
              </span>
              <p className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                JSON Object (Structured)
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                Max Output Tokens
              </span>
              <p className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                1,024 Tokens
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-600" />
              Centralized Secret Policy
            </span>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              The OpenAI secret key is read from backend environment variable <code>OPENAI_API_KEY</code> on Node.js. The frontend never makes direct client-to-OpenAI HTTP calls, safeguarding organization quotas and confidential API credentials.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
