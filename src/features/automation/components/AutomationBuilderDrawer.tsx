import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Settings,
  Sparkles,
  UserCheck,
  Tag,
  AlertTriangle,
  FileText,
  Clock,
  Check,
  X,
} from 'lucide-react';
import {
  TriggerType,
  ConditionField,
  ConditionOperator,
  ActionType,
  ConditionGroup,
  ActionItem,
  TriggerDefinition,
} from '../types/automation';
import { Button, Input, Modal } from '@/components/ui';
import { cn } from '@/utils/cn';

interface AutomationBuilderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ruleName: string;
  ruleDescription: string;
  trigger: TriggerDefinition;
  conditionGroups: ConditionGroup[];
  actions: ActionItem[];
  onChangeRuleName: (name: string) => void;
  onChangeRuleDescription: (desc: string) => void;
  onChangeTrigger: (trigger: TriggerDefinition) => void;
  onChangeConditionGroups: (groups: ConditionGroup[]) => void;
  onChangeActions: (actions: ActionItem[]) => void;
  onSave: () => void;
  isSaving?: boolean;
}

const TRIGGER_OPTIONS: { type: TriggerType; label: string; desc: string }[] = [
  { type: 'new_conversation_created', label: 'New Conversation Created', desc: 'Fires when a customer initiates a new thread.' },
  { type: 'new_message_received', label: 'New Message Received', desc: 'Fires on each incoming message in an active conversation.' },
  { type: 'conversation_assigned', label: 'Conversation Assigned', desc: 'Fires when an agent or team is assigned.' },
  { type: 'conversation_status_changed', label: 'Conversation Status Changed', desc: 'Fires on status change (open, pending, resolved).' },
  { type: 'priority_changed', label: 'Priority Changed', desc: 'Fires when priority changes (low, medium, high, urgent).' },
  { type: 'customer_created', label: 'Customer Created', desc: 'Fires when a new customer profile is registered.' },
  { type: 'customer_sentiment_changed', label: 'Customer Sentiment Changed', desc: 'Fires when AI sentiment classification updates.' },
  { type: 'conversation_inactive', label: 'Conversation Inactive', desc: 'Fires when no customer reply arrives within X minutes.' },
  { type: 'scheduled_time', label: 'Specific Time or Schedule', desc: 'Fires on a periodic recurring schedule.' },
];

const FIELD_OPTIONS: { field: ConditionField; label: string }[] = [
  { field: 'customer_name', label: 'Customer Name' },
  { field: 'customer_email', label: 'Customer Email' },
  { field: 'conversation_status', label: 'Conversation Status' },
  { field: 'conversation_priority', label: 'Conversation Priority' },
  { field: 'assigned_agent', label: 'Assigned Agent' },
  { field: 'conversation_tags', label: 'Conversation Tags' },
  { field: 'customer_sentiment', label: 'Customer Sentiment' },
  { field: 'detected_intent', label: 'Detected Intent' },
  { field: 'message_content', label: 'Message Content' },
  { field: 'conversation_age', label: 'Conversation Age (Minutes)' },
];

const OPERATOR_OPTIONS: { operator: ConditionOperator; label: string }[] = [
  { operator: 'equals', label: 'Equals' },
  { operator: 'not_equals', label: 'Does Not Equal' },
  { operator: 'contains', label: 'Contains' },
  { operator: 'not_contains', label: 'Does Not Contain' },
  { operator: 'greater_than', label: 'Greater Than' },
  { operator: 'less_than', label: 'Less Than' },
  { operator: 'is_empty', label: 'Is Empty' },
  { operator: 'is_not_empty', label: 'Is Not Empty' },
];

const ACTION_OPTIONS: { type: ActionType; label: string; desc: string }[] = [
  { type: 'assign_agent', label: 'Assign Conversation to Agent', desc: 'Route directly to a designated team member.' },
  { type: 'assign_team', label: 'Assign Conversation to Team', desc: 'Route to a department or functional team queue.' },
  { type: 'change_priority', label: 'Change Conversation Priority', desc: 'Update priority to urgent, high, medium, or low.' },
  { type: 'change_status', label: 'Change Conversation Status', desc: 'Transition status to open, pending, or resolved.' },
  { type: 'add_tag', label: 'Add Conversation Tag', desc: 'Attach a tag for filtering and reporting.' },
  { type: 'remove_tag', label: 'Remove Conversation Tag', desc: 'Detach a tag from the conversation.' },
  { type: 'send_notification', label: 'Send Internal Notification', desc: 'Alert a team lead or manager.' },
  { type: 'escalate', label: 'Escalate Conversation', desc: 'Initiate formal tier escalation with SLA timer.' },
  { type: 'add_internal_note', label: 'Add Internal Note', desc: 'Inject a visible system note into the conversation.' },
  { type: 'trigger_ai_summary', label: 'Trigger AI Conversation Summary', desc: 'Dispatch OpenAI summarization synthesis.' },
  { type: 'trigger_ai_sentiment', label: 'Trigger AI Sentiment Analysis', desc: 'Dispatch OpenAI emotional telemetry scoring.' },
];

export const AutomationBuilderDrawer: React.FC<AutomationBuilderDrawerProps> = ({
  isOpen,
  onClose,
  ruleName,
  ruleDescription,
  trigger,
  conditionGroups,
  actions,
  onChangeRuleName,
  onChangeRuleDescription,
  onChangeTrigger,
  onChangeConditionGroups,
  onChangeActions,
  onSave,
  isSaving = false,
}) => {
  const [activeTab, setActiveTab] = useState<'trigger' | 'conditions' | 'actions'>('trigger');

  // Trigger handlers
  const handleSelectTriggerType = (type: TriggerType) => {
    const selected = TRIGGER_OPTIONS.find((t) => t.type === type);
    onChangeTrigger({
      type,
      label: selected?.label || type,
      config: trigger.config || {},
    });
  };

  // Condition Handlers
  const handleAddCondition = (groupIndex: number) => {
    const nextGroups = [...conditionGroups];
    nextGroups[groupIndex].conditions.push({
      id: `c_${Date.now()}`,
      field: 'conversation_priority',
      operator: 'equals',
      value: 'high',
    });
    onChangeConditionGroups(nextGroups);
  };

  const handleRemoveCondition = (groupIndex: number, condIndex: number) => {
    const nextGroups = [...conditionGroups];
    nextGroups[groupIndex].conditions.splice(condIndex, 1);
    if (nextGroups[groupIndex].conditions.length === 0 && nextGroups.length > 1) {
      nextGroups.splice(groupIndex, 1);
    }
    onChangeConditionGroups(nextGroups);
  };

  const handleAddConditionGroup = () => {
    const nextGroups = [...conditionGroups];
    nextGroups.push({
      id: `cg_${Date.now()}`,
      logic: 'AND',
      conditions: [
        {
          id: `c_${Date.now()}`,
          field: 'conversation_status',
          operator: 'equals',
          value: 'open',
        },
      ],
    });
    onChangeConditionGroups(nextGroups);
  };

  const handleToggleGroupLogic = (groupIndex: number) => {
    const nextGroups = [...conditionGroups];
    nextGroups[groupIndex].logic = nextGroups[groupIndex].logic === 'AND' ? 'OR' : 'AND';
    onChangeConditionGroups(nextGroups);
  };

  // Action Handlers
  const handleAddAction = (type: ActionType) => {
    const option = ACTION_OPTIONS.find((a) => a.type === type);
    const newAction: ActionItem = {
      id: `act_${Date.now()}`,
      type,
      label: option?.label || type,
      config: {},
    };
    onChangeActions([...actions, newAction]);
  };

  const handleRemoveAction = (index: number) => {
    const next = [...actions];
    next.splice(index, 1);
    onChangeActions(next);
  };

  const handleMoveAction = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= actions.length) return;
    const next = [...actions];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChangeActions(next);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Automation Rule Configuration"
      size="lg"
    >
      <div className="space-y-5">
        {/* Basic Info Header Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Automation Rule Name
            </label>
            <input
              type="text"
              value={ruleName}
              onChange={(e) => onChangeRuleName(e.target.value)}
              placeholder="e.g. Auto-Assign Enterprise VIPs"
              className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Description
            </label>
            <input
              type="text"
              value={ruleDescription}
              onChange={(e) => onChangeRuleDescription(e.target.value)}
              placeholder="Brief summary of workflow objective..."
              className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('trigger')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors',
              activeTab === 'trigger'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Zap className="w-3.5 h-3.5" />
            1. Trigger ({trigger.label})
          </button>

          <button
            onClick={() => setActiveTab('conditions')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors',
              activeTab === 'conditions'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            2. Conditions ({conditionGroups.reduce((acc, g) => acc + g.conditions.length, 0)})
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors',
              activeTab === 'actions'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            3. Actions ({actions.length})
          </button>
        </div>

        {/* TAB 1: TRIGGER SELECTION & CONFIGURATION */}
        {activeTab === 'trigger' && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Select What Initiates This Automation:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TRIGGER_OPTIONS.map((opt) => (
                <div
                  key={opt.type}
                  onClick={() => handleSelectTriggerType(opt.type)}
                  className={cn(
                    'p-3 rounded-xl border text-left cursor-pointer transition-all',
                    trigger.type === opt.type
                      ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 ring-1 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {opt.label}
                    </span>
                    {trigger.type === opt.type && (
                      <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {opt.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Inactive Trigger Config */}
            {trigger.type === 'conversation_inactive' && (
              <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Inactive Threshold:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={trigger.config?.inactiveMinutes || 240}
                    onChange={(e) =>
                      onChangeTrigger({
                        ...trigger,
                        config: { ...trigger.config, inactiveMinutes: parseInt(e.target.value, 10) || 60 },
                      })
                    }
                    className="w-28 text-xs py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    minutes without customer reply
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONDITION GROUPS BUILDER */}
        {activeTab === 'conditions' && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Rule Evaluation Criteria:
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddConditionGroup}
                leftIcon={<Plus className="w-3 h-3" />}
              >
                Add Condition Group
              </Button>
            </div>

            {conditionGroups.map((group, gIdx) => (
              <div
                key={group.id}
                className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                      Group {gIdx + 1}
                    </span>
                    <button
                      onClick={() => handleToggleGroupLogic(gIdx)}
                      className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                    >
                      {group.logic}
                    </button>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      (All conditions must match)
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddCondition(gIdx)}
                    className="h-6 text-[11px] px-2"
                  >
                    + Add Condition
                  </Button>
                </div>

                {/* Condition Items */}
                <div className="space-y-2">
                  {group.conditions.map((cond, cIdx) => (
                    <div
                      key={cond.id}
                      className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      {/* Field */}
                      <select
                        value={cond.field}
                        onChange={(e) => {
                          const next = [...conditionGroups];
                          next[gIdx].conditions[cIdx].field = e.target.value as ConditionField;
                          onChangeConditionGroups(next);
                        }}
                        aria-label="Select condition field"
                        className="w-full sm:w-44 py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        {FIELD_OPTIONS.map((f) => (
                          <option key={f.field} value={f.field}>
                            {f.label}
                          </option>
                        ))}
                      </select>

                      {/* Operator */}
                      <select
                        value={cond.operator}
                        onChange={(e) => {
                          const next = [...conditionGroups];
                          next[gIdx].conditions[cIdx].operator = e.target.value as ConditionOperator;
                          onChangeConditionGroups(next);
                        }}
                        aria-label="Select condition operator"
                        className="w-full sm:w-36 py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        {OPERATOR_OPTIONS.map((op) => (
                          <option key={op.operator} value={op.operator}>
                            {op.label}
                          </option>
                        ))}
                      </select>

                      {/* Value */}
                      <input
                        type="text"
                        value={cond.value}
                        onChange={(e) => {
                          const next = [...conditionGroups];
                          next[gIdx].conditions[cIdx].value = e.target.value;
                          onChangeConditionGroups(next);
                        }}
                        placeholder="Condition target value..."
                        className="flex-1 w-full py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />

                      {/* Delete */}
                      <button
                        onClick={() => handleRemoveCondition(gIdx, cIdx)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded"
                        title="Delete Condition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: ACTIONS PIPELINE BUILDER */}
        {activeTab === 'actions' && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Action Sequence (Executed in Order):
              </span>

              {/* Add Action Dropdown */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddAction(e.target.value as ActionType);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                aria-label="Add action to workflow"
                className="text-xs py-1.5 px-3 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium"
              >
                <option value="" disabled>
                  + Add New Action
                </option>
                {ACTION_OPTIONS.map((act) => (
                  <option key={act.type} value={act.type}>
                    {act.label}
                  </option>
                ))}
              </select>
            </div>

            {actions.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium">No actions configured yet</p>
                <p className="text-[11px] text-slate-500">
                  Select an action from the dropdown above to add steps.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {actions.map((act, idx) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {act.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveAction(idx, 'up')}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === actions.length - 1}
                          onClick={() => handleMoveAction(idx, 'down')}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveAction(idx)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                          title="Remove Action"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Dedicated Inputs based on action type */}
                    {act.type === 'change_priority' && (
                      <div className="flex items-center gap-2 text-xs pt-1">
                        <span className="text-slate-500">Set Priority To:</span>
                        <select
                          value={act.config.priority || 'high'}
                          onChange={(e) => {
                            const next = [...actions];
                            next[idx].config.priority = e.target.value as any;
                            onChangeActions(next);
                          }}
                          aria-label="Select priority level"
                          className="py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                        >
                          <option value="urgent">Urgent</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    )}

                    {act.type === 'change_status' && (
                      <div className="flex items-center gap-2 text-xs pt-1">
                        <span className="text-slate-500">Set Status To:</span>
                        <select
                          value={act.config.status || 'pending'}
                          onChange={(e) => {
                            const next = [...actions];
                            next[idx].config.status = e.target.value as any;
                            onChangeActions(next);
                          }}
                          aria-label="Select status level"
                          className="py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                        >
                          <option value="open">Open</option>
                          <option value="pending">Pending</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    )}

                    {act.type === 'add_tag' && (
                      <div className="flex items-center gap-2 text-xs pt-1">
                        <span className="text-slate-500">Tag Value:</span>
                        <input
                          type="text"
                          value={act.config.tag || ''}
                          onChange={(e) => {
                            const next = [...actions];
                            next[idx].config.tag = e.target.value;
                            onChangeActions(next);
                          }}
                          placeholder="e.g. enterprise, vip, billing"
                          className="py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs flex-1 max-w-xs"
                        />
                      </div>
                    )}

                    {act.type === 'add_internal_note' && (
                      <div className="text-xs pt-1 space-y-1">
                        <span className="text-slate-500 block">Note Content:</span>
                        <textarea
                          rows={2}
                          value={act.config.note || ''}
                          onChange={(e) => {
                            const next = [...actions];
                            next[idx].config.note = e.target.value;
                            onChangeActions(next);
                          }}
                          placeholder="Internal triage instruction for support agents..."
                          className="w-full py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                        />
                      </div>
                    )}

                    {act.type === 'send_notification' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-slate-500 block mb-0.5">Recipient Role:</span>
                          <select
                            value={act.config.recipientRole || 'Manager'}
                            onChange={(e) => {
                              const next = [...actions];
                              next[idx].config.recipientRole = e.target.value as any;
                              onChangeActions(next);
                            }}
                            aria-label="Select notification recipient role"
                            className="w-full py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Team Lead">Team Lead</option>
                            <option value="Agent">Assigned Agent</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-0.5">Alert Message:</span>
                          <input
                            type="text"
                            value={act.config.message || ''}
                            onChange={(e) => {
                              const next = [...actions];
                              next[idx].config.message = e.target.value;
                              onChangeActions(next);
                            }}
                            placeholder="Priority escalation triggered..."
                            className="w-full py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              isLoading={isSaving}
              leftIcon={<Check className="w-3.5 h-3.5" />}
            >
              Apply to Workflow Canvas
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
