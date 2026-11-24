import React, { useState } from 'react';
import { Sparkles, Save, Check, ShieldCheck, Lock } from 'lucide-react';
import { AiSettings } from '../types/settings';
import { Button, Badge } from '@/components/ui';

interface AiConfigTabProps {
  settings: AiSettings;
  onSave: (data: Partial<AiSettings>) => Promise<void>;
  userRole?: string;
}

export const AiConfigTab: React.FC<AiConfigTabProps> = ({
  settings,
  onSave,
  userRole = 'admin',
}) => {
  const [formData, setFormData] = useState<AiSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const canEdit = userRole === 'admin' || userRole === 'manager';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSave(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                AI Intelligence & Model Defaults
              </h3>
              <p className="text-xs text-slate-500">
                Configure OpenAI feature availability, default response tones, and multi-language presets.
              </p>
            </div>
          </div>

          <Badge variant={formData.enabled ? 'success' : 'neutral'} size="sm">
            {formData.enabled ? 'AI Engine Active' : 'Disabled'}
          </Badge>
        </div>

        {/* Global Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              Enable ConvoAI Intelligence Engine
            </span>
            <p className="text-[11px] text-slate-500">
              When toggled off, AI assistants and smart reply suggestions will be disabled globally.
            </p>
          </div>
          <input
            type="checkbox"
            disabled={!canEdit}
            checked={formData.enabled}
            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
            className="w-4 h-4 rounded text-brand-600 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Default Response Tone
            </label>
            <select
              disabled={!canEdit || !formData.enabled}
              value={formData.defaultTone}
              onChange={(e) => setFormData({ ...formData, defaultTone: e.target.value as any })}
              aria-label="Select default AI response tone"
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
            >
              <option value="professional">Professional (Courteous & formal)</option>
              <option value="empathetic">Empathetic (Understanding & patient)</option>
              <option value="concise">Concise (Direct & bulleted)</option>
              <option value="technical">Technical (Engineering-focused)</option>
              <option value="friendly">Friendly (Warm & conversational)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Default Response Language
            </label>
            <select
              disabled={!canEdit || !formData.enabled}
              value={formData.defaultLanguage}
              onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value as any })}
              aria-label="Select default AI response language"
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
            >
              <option value="en">English (US)</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
              <option value="de">German (Deutsch)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Feature Visibility
            </label>
            <select
              disabled={!canEdit || !formData.enabled}
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
              aria-label="Select AI feature visibility"
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
            >
              <option value="all_agents">All Support Agents</option>
              <option value="managers_only">Managers & Administrators Only</option>
            </select>
          </div>
        </div>

        {/* Feature Switches */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Sub-Feature Permissions:
          </span>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <span className="text-slate-800 dark:text-slate-200">
                Automated 6-Point Conversation Summarization
              </span>
              <input
                type="checkbox"
                disabled={!canEdit || !formData.enabled}
                checked={formData.enableAutoSummarize}
                onChange={(e) => setFormData({ ...formData, enableAutoSummarize: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <span className="text-slate-800 dark:text-slate-200">
                Real-Time Customer Sentiment Telemetry
              </span>
              <input
                type="checkbox"
                disabled={!canEdit || !formData.enabled}
                checked={formData.enableSentimentTelemetry}
                onChange={(e) => setFormData({ ...formData, enableSentimentTelemetry: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <span className="text-slate-800 dark:text-slate-200">
                Contextual Smart Reply Generation in Composer
              </span>
              <input
                type="checkbox"
                disabled={!canEdit || !formData.enabled}
                checked={formData.enableSmartReply}
                onChange={(e) => setFormData({ ...formData, enableSmartReply: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600"
              />
            </label>
          </div>
        </div>

        {/* Backend Key Shielding Note */}
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Credential Security Architecture:</span>{' '}
            OpenAI API keys are strictly configured on the server in <code className="font-mono">server/.env</code>. Keys are never transmitted over API endpoints or rendered in client HTML.
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                AI configuration saved.
              </span>
            ) : (
              <span />
            )}

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save AI Settings
            </Button>
          </div>
        )}
      </div>
    </form>
  );
};
