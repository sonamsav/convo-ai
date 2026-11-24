import React, { useState } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Laptop,
  Check,
  Save,
  CheckCircle2,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { AppearanceSettings } from '../types/settings';
import { useTheme } from '@/hooks/useTheme';
import { Button, Badge } from '@/components/ui';

interface AppearanceSettingsTabProps {
  appearance: AppearanceSettings;
  onSave: (data: Partial<AppearanceSettings>) => Promise<void>;
}

export const AppearanceSettingsTab: React.FC<AppearanceSettingsTabProps> = ({
  appearance,
  onSave,
}) => {
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState<AppearanceSettings>({
    ...appearance,
    theme: (theme as 'light' | 'dark' | 'system') || appearance.theme || 'system',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setFormData((prev) => ({ ...prev, theme: newTheme }));
    setTheme(newTheme);
  };

  const handleAccentChange = (accent: 'indigo' | 'emerald' | 'rose' | 'blue') => {
    setFormData((prev) => ({ ...prev, accentColor: accent }));
  };

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
      {/* Theme Mode Selection */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Interface Theme
              </h3>
              <p className="text-xs text-slate-500">
                Choose how ConvoAI looks on your screen. Select a light or dark theme, or sync with your system.
              </p>
            </div>
          </div>
          {savedSuccess && (
            <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between h-32 ${
              formData.theme === 'light'
                ? 'border-brand-600 ring-2 ring-brand-600/20 bg-brand-50/20 dark:bg-brand-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Sun className="w-4 h-4" />
              </div>
              {formData.theme === 'light' && (
                <div className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Light Mode</p>
              <p className="text-[11px] text-slate-500">Clean slate styling with bright daylight contrast</p>
            </div>
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between h-32 ${
              formData.theme === 'dark'
                ? 'border-brand-600 ring-2 ring-brand-600/20 bg-brand-50/20 dark:bg-brand-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Moon className="w-4 h-4" />
              </div>
              {formData.theme === 'dark' && (
                <div className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Dark Mode</p>
              <p className="text-[11px] text-slate-500">Deep neutral palette optimized for low light</p>
            </div>
          </button>

          {/* System Theme Card */}
          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between h-32 ${
              formData.theme === 'system'
                ? 'border-brand-600 ring-2 ring-brand-600/20 bg-brand-50/20 dark:bg-brand-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                <Laptop className="w-4 h-4" />
              </div>
              {formData.theme === 'system' && (
                <div className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">System Sync</p>
              <p className="text-[11px] text-slate-500">Automatically match your operating system theme</p>
            </div>
          </button>
        </div>
      </div>

      {/* Interface Density & Compact Mode */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Display Density
            </h3>
            <p className="text-xs text-slate-500">
              Control the compactness of data tables, inbox conversation lists, and side panels.
            </p>
          </div>
          <Badge variant={formData.compactMode ? 'info' : 'neutral'}>
            {formData.compactMode ? 'Compact' : 'Comfortable'}
          </Badge>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            {formData.compactMode ? (
              <Minimize2 className="w-5 h-5 text-indigo-600" />
            ) : (
              <Maximize2 className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Compact View Mode
              </p>
              <p className="text-[11px] text-slate-500">
                Reduce padding and row heights to fit more conversations and metrics on a single screen.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.compactMode}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, compactMode: e.target.checked }))
              }
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-brand-600"></div>
          </label>
        </div>
      </div>

      {/* Brand Accent Color */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Brand Accent Color
          </h3>
          <p className="text-xs text-slate-500">
            Select the primary brand hue used across buttons, active badges, and chart highlights.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'indigo', name: 'Indigo (Default)', class: 'bg-indigo-600 text-indigo-600', ring: 'ring-indigo-600' },
            { id: 'emerald', name: 'Emerald', class: 'bg-emerald-600 text-emerald-600', ring: 'ring-emerald-600' },
            { id: 'rose', name: 'Rose', class: 'bg-rose-600 text-rose-600', ring: 'ring-rose-600' },
            { id: 'blue', name: 'Classic Blue', class: 'bg-blue-600 text-blue-600', ring: 'ring-blue-600' },
          ].map((acc) => {
            const isSelected = formData.accentColor === acc.id;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleAccentChange(acc.id as any)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? `border-slate-900 dark:border-slate-100 ring-2 ${acc.ring}/20 bg-slate-50 dark:bg-slate-800`
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full ${acc.class.split(' ')[0]}`} />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {acc.name}
                  </span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-slate-100" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSaving}
          leftIcon={<Save className="w-3.5 h-3.5" />}
        >
          Save Appearance Preferences
        </Button>
      </div>
    </form>
  );
};
