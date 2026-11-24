import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Sliders,
  CheckCircle2,
  XCircle,
  Cpu,
  Lock,
  Layers,
  Save,
  RotateCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { Button, Badge, LoadingState } from '@/components/ui';
import { useAppDispatch } from '@/app/store/hooks';
import { addToast } from '@/app/store/slices/toastSlice';
import { aiService } from '../services/aiService';
import { AiUsageTelemetry, AiConfig, ResponseTone, SupportedLanguage } from '../types/ai';

export const AiUsageConfigSection: React.FC = () => {
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [telemetry, setTelemetry] = useState<AiUsageTelemetry | null>(null);
  const [config, setConfig] = useState<AiConfig | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [u, c] = await Promise.all([aiService.getUsage(), aiService.getConfig()]);
      setTelemetry(u);
      setConfig(c);
    } catch {
      // Handled in fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setIsSaving(true);
    try {
      const updated = await aiService.updateConfig(config);
      setConfig(updated);
      dispatch(
        addToast({
          type: 'success',
          title: 'AI Preferences Saved',
          message: 'Default tone, language, and summarizer configurations updated.',
        })
      );
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: 'Could not update AI preferences.',
        })
      );
    } finally {
      setIsSaving(false);
    }
  };

  const chartData = telemetry
    ? [
        { feature: 'Summarize', calls: telemetry.usageByFeature.summarize },
        { feature: 'Smart Reply', calls: telemetry.usageByFeature.smartReply },
        { feature: 'Sentiment', calls: telemetry.usageByFeature.sentiment },
        { feature: 'Intent', calls: telemetry.usageByFeature.intent },
        { feature: 'Translate', calls: telemetry.usageByFeature.translate },
        { feature: 'Insights', calls: telemetry.usageByFeature.insights },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-600" />
          <span>AI Usage Monitoring &amp; Engine Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Track real-time token consumption, request success rates, and configure organizational response defaults.
        </p>
      </div>

      {isLoading || !telemetry || !config ? (
        <div className="p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
          <LoadingState message="Loading usage telemetry and configuration..." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Telemetry KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
              <span className="text-xs text-slate-400 font-medium">Total AI Invocations</span>
              <p className="mt-1 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {telemetry.totalRequests}
              </p>
              <span className="text-[11px] text-slate-400">Across all support channels</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
              <span className="text-xs text-slate-400 font-medium">Success Rate</span>
              <p className="mt-1 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {telemetry.totalRequests > 0
                  ? `${Math.round((telemetry.successfulRequests / telemetry.totalRequests) * 100)}%`
                  : '100%'}
              </p>
              <span className="text-[11px] text-emerald-600">
                {telemetry.successfulRequests} successful / {telemetry.failedRequests} failed
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
              <span className="text-xs text-slate-400 font-medium">Token Consumption (Est.)</span>
              <p className="mt-1 text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                ~{telemetry.tokenConsumptionEstimate.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-400">Estimated prompt &amp; completion</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
              <span className="text-xs text-slate-400 font-medium">Active Model</span>
              <p className="mt-1 text-2xl font-bold font-mono text-brand-600 dark:text-brand-400">
                {config.model}
              </p>
              <span className="text-[11px] text-slate-400">Centralized on backend</span>
            </div>
          </div>

          {/* Usage by Feature Chart & Configuration Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage by Feature Bar Chart */}
            <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Invocations by AI Capability
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Distribution of agent requests across features
                  </p>
                </div>
                <Badge variant="primary" size="sm">
                  Live Telemetry
                </Badge>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="feature" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip />
                    <Bar dataKey="calls" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Invocations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Configuration Settings Form */}
            <form
              onSubmit={handleSaveConfig}
              className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    AI Behavioral Preferences
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configures default tones, translation settings, and automatic sentiment checks
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <span>Engine Enabled</span>
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                </label>
              </div>

              <div className="space-y-3 text-xs">
                {/* Default Tone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default Smart Reply Tone:
                  </label>
                  <select
                    value={config.defaultTone}
                    onChange={(e) => setConfig({ ...config, defaultTone: e.target.value as ResponseTone })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="Empathetic">Empathetic (Recommended for support)</option>
                    <option value="Professional">Professional (Corporate standard)</option>
                    <option value="Friendly">Friendly (Casual SaaS)</option>
                    <option value="Concise">Concise (Direct answers)</option>
                    <option value="Formal">Formal (Executive protocol)</option>
                  </select>
                </div>

                {/* Default Language */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default Response Language:
                  </label>
                  <select
                    value={config.defaultLanguage}
                    onChange={(e) => setConfig({ ...config, defaultLanguage: e.target.value as SupportedLanguage })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="en">English (en)</option>
                    <option value="hi">Hindi (हिन्दी - hi)</option>
                    <option value="es">Spanish (es)</option>
                    <option value="fr">French (fr)</option>
                    <option value="de">German (de)</option>
                  </select>
                </div>

                {/* Auto Sentiment Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      Automatic Inbound Sentiment Triage
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Evaluates sentiment on every newly received customer message.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.autoSentiment}
                    onChange={(e) => setConfig({ ...config, autoSentiment: e.target.checked })}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                </div>

                {/* Security Note */}
                <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2 text-indigo-700 dark:text-indigo-400">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">
                    <strong>Backend Security Guardrail:</strong> OpenAI API keys and billing credentials are never handled by the client application. They are managed through backend environment variables (`OPENAI_API_KEY`).
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save AI Preferences
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
