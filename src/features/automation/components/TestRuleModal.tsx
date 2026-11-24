import React, { useState } from 'react';
import {
  Play,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { TriggerType } from '../types/automation';
import { Modal, Button, Badge } from '@/components/ui';
import { automationService } from '../services/automationService';
import { cn } from '@/utils/cn';

interface TestRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecutionCompleted?: () => void;
}

export const TestRuleModal: React.FC<TestRuleModalProps> = ({
  isOpen,
  onClose,
  onExecutionCompleted,
}) => {
  const [eventType, setEventType] = useState<TriggerType>('new_conversation_created');
  const [customerName, setCustomerName] = useState('Sophia Sterling');
  const [customerPlan, setCustomerPlan] = useState('enterprise');
  const [channel, setChannel] = useState('Web Chat');
  const [priority, setPriority] = useState('high');
  const [sentiment, setSentiment] = useState('Negative');
  const [detectedIntent, setDetectedIntent] = useState('Billing Inquiry');
  const [messageContent, setMessageContent] = useState('Urgent: Invoice was charged twice on renewal.');

  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const handleRunTest = async () => {
    try {
      setIsLoading(true);
      setTestResult(null);

      const contextPayload = {
        id: `conv-test-${Date.now()}`,
        ticketNumber: `#CONV-${Math.floor(1000 + Math.random() * 9000)}`,
        channel,
        status: 'open',
        priority,
        sentiment,
        intent: detectedIntent,
        tags: [customerPlan, 'web-inquiry'],
        customer: {
          name: customerName,
          email: `${customerName.toLowerCase().replace(' ', '.')}@example.com`,
          plan: customerPlan,
        },
        lastMessage: {
          content: messageContent,
        },
      };

      const result = await automationService.testTrigger(eventType, contextPayload);
      setTestResult(result);
      onExecutionCompleted?.();
    } catch (err: any) {
      console.error('Test execution failed:', err);
      setTestResult({
        matchedCount: 0,
        results: [],
        error: err.message || 'Execution failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rule Simulation & Event Dispatcher"
      size="lg"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Simulate real-time application events (new conversation, sentiment change, priority elevation)
          and verify condition matching and multi-step action side-effects in real time.
        </p>

        {/* Event Payload Setup Grid */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Event Type */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                Simulated Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as TriggerType)}
                aria-label="Select simulated event type"
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="new_conversation_created">New Conversation Created</option>
                <option value="customer_sentiment_changed">Customer Sentiment Changed</option>
                <option value="priority_changed">Priority Changed</option>
                <option value="conversation_status_changed">Conversation Status Changed</option>
                <option value="conversation_inactive">Conversation Inactive</option>
              </select>
            </div>

            {/* Customer Name */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                Customer Name & Plan
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  placeholder="Customer name..."
                />
                <select
                  value={customerPlan}
                  onChange={(e) => setCustomerPlan(e.target.value)}
                  aria-label="Select customer plan tier"
                  className="w-28 py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="enterprise">Enterprise</option>
                  <option value="growth">Growth</option>
                  <option value="starter">Starter</option>
                </select>
              </div>
            </div>

            {/* Channel & Priority */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                Channel & Initial Priority
              </label>
              <div className="flex gap-2">
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  aria-label="Select customer channel"
                  className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="Web Chat">Web Chat</option>
                  <option value="Email">Email</option>
                  <option value="Slack">Slack</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  aria-label="Select initial priority"
                  className="w-28 py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Sentiment & Intent */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                Sentiment & Detected Intent
              </label>
              <div className="flex gap-2">
                <select
                  value={sentiment}
                  onChange={(e) => setSentiment(e.target.value)}
                  aria-label="Select customer sentiment"
                  className="w-28 py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="Negative">Negative</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Positive">Positive</option>
                </select>
                <select
                  value={detectedIntent}
                  onChange={(e) => setDetectedIntent(e.target.value)}
                  aria-label="Select detected intent category"
                  className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="Billing Inquiry">Billing Inquiry</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Account Access">Account Access</option>
                  <option value="Cancellation Request">Cancellation Request</option>
                </select>
              </div>
            </div>
          </div>

          {/* Message Content Input */}
          <div className="text-xs pt-1">
            <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
              Sample Message Content
            </label>
            <input
              type="text"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Trigger Action Button */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handleRunTest}
            isLoading={isLoading}
            leftIcon={<Play className="w-4 h-4" />}
          >
            Dispatch Simulated Event
          </Button>
        </div>

        {/* Live Simulation Results */}
        {testResult && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Simulation Results
                </h4>
              </div>
              <Badge variant="info" size="sm">
                Matched Rules: {testResult.matchedCount}
              </Badge>
            </div>

            {testResult.results.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No active automation rules matched the event criteria or condition filters.
              </p>
            ) : (
              <div className="space-y-2">
                {testResult.results.map((r: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <div>
                        <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                          Rule: {r.ruleId}
                        </span>
                        {r.reason && (
                          <span className="text-[10px] text-slate-400 block">
                            Reason: {r.reason}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          r.status === 'successful'
                            ? 'success'
                            : r.status === 'failed'
                            ? 'danger'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {r.status}
                      </Badge>
                      {r.durationMs && (
                        <span className="font-mono text-[10px] text-slate-400">
                          {r.durationMs}ms
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Side-Effect Output State */}
            {testResult.updatedContext && (
              <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 text-xs space-y-1">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block text-[11px] uppercase tracking-wider">
                  Updated Context State:
                </span>
                <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 space-y-0.5">
                  <p>Priority: <strong>{testResult.updatedContext.priority}</strong></p>
                  <p>Tags: <strong>{testResult.updatedContext.tags?.join(', ')}</strong></p>
                  {testResult.updatedContext.assignedTeam && (
                    <p>Assigned Team: <strong>{testResult.updatedContext.assignedTeam.name}</strong></p>
                  )}
                  {testResult.updatedContext.assignedAgent && (
                    <p>Assigned Agent: <strong>{testResult.updatedContext.assignedAgent.name}</strong></p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
