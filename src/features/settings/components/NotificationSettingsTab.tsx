import React, { useState } from 'react';
import { Bell, Mail, Save, Check } from 'lucide-react';
import { NotificationSettings } from '../types/settings';
import { Button } from '@/components/ui';

interface NotificationSettingsTabProps {
  notifications: NotificationSettings;
  onSave: (data: Partial<NotificationSettings>) => Promise<void>;
}

const NOTIFICATION_EVENTS = [
  { key: 'newConversations', label: 'New Inbound Conversations', desc: 'When a new ticket is submitted via web chat, email, or WhatsApp.' },
  { key: 'conversationAssignment', label: 'Conversation Assigned to Me', desc: 'When a conversation is manually routed or auto-assigned by workflow rules.' },
  { key: 'highPriorityConversations', label: 'High & Urgent Priority Alerts', desc: 'When a ticket is flagged as urgent or elevated to senior support.' },
  { key: 'negativeSentimentAlerts', label: 'Negative Customer Sentiment', desc: 'When AI model detects frustrated or churn-risk customer tone.' },
  { key: 'agentMentions', label: 'Internal Notes @Mentions', desc: 'When a colleague mentions you in conversation internal notes.' },
  { key: 'automationFailures', label: 'Automation Workflow Failures', desc: 'When a background rule encounters execution or webhook delivery error.' },
  { key: 'dailyPerformanceSummary', label: 'Daily Team Performance Summary', desc: 'End-of-day digest of resolved tickets, CSAT average, and SLA stats.' },
] as const;

export const NotificationSettingsTab: React.FC<NotificationSettingsTabProps> = ({
  notifications,
  onSave,
}) => {
  const [formData, setFormData] = useState<NotificationSettings>(notifications);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleInApp = (key: keyof typeof formData.inApp) => {
    setFormData({
      ...formData,
      inApp: { ...formData.inApp, [key]: !formData.inApp[key] },
    });
  };

  const toggleEmail = (key: keyof typeof formData.email) => {
    setFormData({
      ...formData,
      email: { ...formData.email, [key]: !formData.email[key] },
    });
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
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Notification Preferences
              </h3>
              <p className="text-xs text-slate-500">
                Control in-app sound/popup badges and registered email delivery triggers.
              </p>
            </div>
          </div>
        </div>

        {/* Table of Events and InApp / Email toggles */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="grid grid-cols-12 py-2 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
            <span className="col-span-8">Event Trigger</span>
            <span className="col-span-2 text-center flex items-center justify-center gap-1">
              <Bell className="w-3 h-3" /> In-App
            </span>
            <span className="col-span-2 text-center flex items-center justify-center gap-1">
              <Mail className="w-3 h-3" /> Email
            </span>
          </div>

          {NOTIFICATION_EVENTS.map((item) => (
            <div
              key={item.key}
              className="grid grid-cols-12 py-3.5 items-center gap-2"
            >
              <div className="col-span-8 space-y-0.5 pr-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  {item.label}
                </span>
                <p className="text-[11px] text-slate-500">{item.desc}</p>
              </div>

              {/* In App Toggle */}
              <div className="col-span-2 flex justify-center">
                <input
                  type="checkbox"
                  checked={formData.inApp[item.key]}
                  onChange={() => toggleInApp(item.key)}
                  aria-label={`Toggle in-app notification for ${item.label}`}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </div>

              {/* Email Toggle */}
              <div className="col-span-2 flex justify-center">
                <input
                  type="checkbox"
                  checked={formData.email[item.key]}
                  onChange={() => toggleEmail(item.key)}
                  aria-label={`Toggle email notification for ${item.label}`}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {savedSuccess ? (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              Notification preferences saved.
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
            Save Notification Preferences
          </Button>
        </div>
      </div>
    </form>
  );
};
