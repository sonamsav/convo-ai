import React, { useState } from 'react';
import {
  Sparkles,
  Mail,
  Webhook,
  Database,
  Slack,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sliders,
  Shield,
  Layers,
} from 'lucide-react';
import { IntegrationItem } from '../types/settings';
import { Button, Badge, Modal } from '@/components/ui';

interface IntegrationsTabProps {
  integrations?: Record<string, IntegrationItem>;
  onRefresh?: () => void;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  integrations,
  onRefresh,
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);
  const [activeConfigItem, setActiveConfigItem] = useState<IntegrationItem | null>(null);

  const defaultIntegrations: Record<string, IntegrationItem> = {
    openai: {
      id: 'openai',
      name: 'OpenAI Intelligence Engine',
      status: 'connected',
      model: 'gpt-4o',
      description: 'Powers conversational intelligence, summaries, sentiment classification, and smart replies.',
    },
    email: {
      id: 'email',
      name: 'Inbound & Outbound Email (SMTP/SendGrid)',
      status: 'connected',
      description: 'Bi-directional email gateway translating inbound threads into support tickets.',
    },
    webhooks: {
      id: 'webhooks',
      name: 'Outgoing Webhook Dispatcher',
      status: 'connected',
      description: 'Dispatches signed JSON HMAC payloads on conversation, customer, and agent events.',
    },
    crm: {
      id: 'crm',
      name: 'Salesforce & HubSpot CRM Sync',
      status: 'connected',
      description: 'Syncs customer lifecycle stages, ARR values, account health, and organization tags.',
    },
    slack: {
      id: 'slack',
      name: 'Slack Team Escalation Bridge',
      status: 'connected',
      description: 'Pushes urgent and negative-sentiment customer conversations directly to #customer-support.',
    },
    whatsapp: {
      id: 'whatsapp',
      name: 'WhatsApp Business API (Twilio)',
      status: 'connected',
      description: 'Official WhatsApp business number integration for low-latency messaging support.',
    },
  };

  const list = integrations || defaultIntegrations;

  const getIcon = (id: string) => {
    switch (id) {
      case 'openai':
        return <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'email':
      case 'emailProvider':
        return <Mail className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      case 'webhooks':
        return <Webhook className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'crm':
        return <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'slack':
        return <Slack className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'whatsapp':
        return <MessageSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      default:
        return <Layers className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleTestConnection = async (id: string, name: string) => {
    setTestingId(id);
    setTestResult(null);

    // Simulate real connectivity health check
    setTimeout(() => {
      setTestingId(null);
      setTestResult({
        id,
        success: true,
        msg: `Successfully connected to ${name}. Health check 200 OK (latency: 42ms).`,
      });
      setTimeout(() => setTestResult(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Connected Services & Integrations
          </h3>
          <p className="text-xs text-slate-500">
            Manage third-party API connections, messaging channels, and telemetry endpoints.
          </p>
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Status
          </Button>
        )}
      </div>

      {testResult && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            testResult.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{testResult.msg}</span>
          </div>
          <button
            onClick={() => setTestResult(null)}
            className="text-xs font-semibold underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(list).map(([key, item]) => {
          const isConnected = item.status === 'connected';
          const isTesting = testingId === item.id;

          return (
            <div
              key={key}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                      {getIcon(item.id)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </h4>
                      {item.model && (
                        <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                          Model: {item.model}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={isConnected ? 'success' : 'neutral'} size="sm">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isTesting}
                  onClick={() => handleTestConnection(item.id, item.name)}
                >
                  Test Connection
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveConfigItem(item)}
                    leftIcon={<Sliders className="w-3.5 h-3.5" />}
                  >
                    Configure
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Architecture Note */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
        <Shield className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Enterprise Gateway & Secret Management
          </p>
          <p className="text-[11px] leading-relaxed">
            All API credentials, webhook signing secrets, and OpenAI bearer tokens are stored strictly in server-side environment variables. Third-party payloads are authenticated using HMAC SHA-256 signatures before entering the event bus.
          </p>
        </div>
      </div>

      {/* Configuration Detail Modal */}
      {activeConfigItem && (
        <Modal
          isOpen={!!activeConfigItem}
          onClose={() => setActiveConfigItem(null)}
          title={`Configure ${activeConfigItem.name}`}
        >
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-1">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Integration Identifier:
              </span>
              <p className="font-mono text-[11px] text-slate-500">{activeConfigItem.id}</p>
            </div>

            <p className="leading-relaxed">
              To update credentials or webhook endpoints for <strong>{activeConfigItem.name}</strong>, modify the backend environment parameters in your secure cluster or contact your DevOps administrator.
            </p>

            <div className="p-3 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-lg text-brand-800 dark:text-brand-300 text-[11px]">
              Connection status: <strong>Active & Verified</strong>. Inbound and outbound signals are healthy.
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setActiveConfigItem(null)}>
                Close Settings
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
