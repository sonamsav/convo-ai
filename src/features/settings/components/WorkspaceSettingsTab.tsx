import React, { useState } from 'react';
import { Building, ShieldCheck, Clock, Check, Save } from 'lucide-react';
import { WorkspaceSettings } from '../types/settings';
import { Button, Badge } from '@/components/ui';

interface WorkspaceSettingsTabProps {
  settings: WorkspaceSettings;
  onSave?: (data: Partial<WorkspaceSettings>) => Promise<void>;
  userRole?: string;
}

export const WorkspaceSettingsTab: React.FC<WorkspaceSettingsTabProps> = ({
  settings,
  onSave,
  userRole = 'admin',
}) => {
  const [formData, setFormData] = useState<WorkspaceSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const canEdit = userRole === 'admin' || userRole === 'owner';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;
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
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Workspace & SLA Policy Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Manage organization licensing, custom support domains, and priority SLA targets.
              </p>
            </div>
          </div>

          <Badge variant="success" size="md">
            {formData.planTier}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Custom Support Portal Subdomain
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={formData.customDomain}
              onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono disabled:opacity-60"
            />
            <p className="text-[11px] text-slate-400 mt-1">CNAME points to proxy.convoai.net</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Workspace Subscription Tier
            </label>
            <input
              type="text"
              disabled
              value={formData.planTier}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">Managed via billing portal</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Urgent First Response Target (Minutes)
            </label>
            <input
              type="number"
              disabled={!canEdit}
              value={formData.slaUrgentMinutes}
              onChange={(e) =>
                setFormData({ ...formData, slaUrgentMinutes: parseInt(e.target.value, 10) || 15 })
              }
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono disabled:opacity-60"
            />
            <p className="text-[11px] text-slate-400 mt-1">Threshold before automated manager alert</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              General Resolution Target (Minutes)
            </label>
            <input
              type="number"
              disabled={!canEdit}
              value={formData.slaResolutionMinutes}
              onChange={(e) =>
                setFormData({ ...formData, slaResolutionMinutes: parseInt(e.target.value, 10) || 240 })
              }
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono disabled:opacity-60"
            />
            <p className="text-[11px] text-slate-400 mt-1">Default 4-hour target (240 mins)</p>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                Workspace policies updated.
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
              Save Workspace Policies
            </Button>
          </div>
        )}
      </div>
    </form>
  );
};
