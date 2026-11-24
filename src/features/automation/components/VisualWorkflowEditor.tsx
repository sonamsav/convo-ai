import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Play,
  Save,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Edit3,
  Layers,
  Sparkles,
  ArrowDown,
  ChevronRight,
  ShieldAlert,
  Clock,
  UserCheck,
  Tag,
  AlertTriangle,
  FileText,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import {
  TriggerDefinition,
  ConditionGroup,
  ActionItem,
  TriggerType,
  ActionType,
} from '../types/automation';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/utils/cn';
import { AutomationBuilderDrawer } from './AutomationBuilderDrawer';

interface VisualWorkflowEditorProps {
  initialRule?: {
    id?: string;
    name: string;
    description: string;
    status: 'active' | 'paused';
    trigger: TriggerDefinition;
    conditionGroups: ConditionGroup[];
    actions: ActionItem[];
  };
  onSave: (rule: {
    id?: string;
    name: string;
    description: string;
    status: 'active' | 'paused';
    trigger: TriggerDefinition;
    conditionGroups: ConditionGroup[];
    actions: ActionItem[];
  }) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const VisualWorkflowEditor: React.FC<VisualWorkflowEditorProps> = ({
  initialRule,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const [ruleName, setRuleName] = useState(initialRule?.name || 'New Custom Automation');
  const [ruleDescription, setRuleDescription] = useState(
    initialRule?.description || 'Automated routing and update sequence.'
  );
  const [status, setStatus] = useState<'active' | 'paused'>(initialRule?.status || 'active');

  const [trigger, setTrigger] = useState<TriggerDefinition>(
    initialRule?.trigger || {
      type: 'new_conversation_created',
      label: 'New Conversation Created',
      config: { channels: ['Web Chat', 'Email'] },
    }
  );

  const [conditionGroups, setConditionGroups] = useState<ConditionGroup[]>(
    initialRule?.conditionGroups || [
      {
        id: 'cg-1',
        logic: 'AND',
        conditions: [
          {
            id: 'c-1',
            field: 'conversation_status',
            operator: 'equals',
            value: 'open',
          },
        ],
      },
    ]
  );

  const [actions, setActions] = useState<ActionItem[]>(
    initialRule?.actions || [
      {
        id: 'a-1',
        type: 'assign_agent',
        label: 'Assign to Available Agent',
        config: { strategy: 'round_robin', agentId: 'ag-1', agentName: 'Marcus Vance' },
      },
    ]
  );

  // Zoom & View state
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'canvas' | 'list'>('canvas');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(130, Math.max(70, prev + delta)));
  };

  const handleSaveDraft = () => {
    onSave({
      id: initialRule?.id,
      name: ruleName,
      description: ruleDescription,
      status: 'paused',
      trigger,
      conditionGroups,
      actions,
    });
  };

  const handleActivate = () => {
    onSave({
      id: initialRule?.id,
      name: ruleName,
      description: ruleDescription,
      status: 'active',
      trigger,
      conditionGroups,
      actions,
    });
  };

  return (
    <div className="space-y-4">
      {/* Canvas Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="text-base font-bold text-slate-900 dark:text-slate-100 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:outline-none focus:border-brand-500 py-0.5"
              placeholder="Rule Name..."
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any node in the canvas to edit trigger, conditions, or actions.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setViewMode('canvas')}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-colors',
                viewMode === 'canvas'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              )}
            >
              Canvas View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              )}
            >
              Step List
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Configure Rules
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveDraft}
            isLoading={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Draft
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleActivate}
            isLoading={isSaving}
            leftIcon={<Play className="w-3.5 h-3.5" />}
          >
            Activate Workflow
          </Button>

          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 min-h-[580px] p-6 sm:p-10 overflow-hidden flex flex-col items-center justify-start shadow-inner">
        {/* Canvas Background Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Zoom Controls */}
        <div className="absolute right-4 bottom-4 z-20 flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-xs">
          <button
            onClick={() => handleZoom(-10)}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 font-mono text-[11px] text-slate-500">{zoomLevel}%</span>
          <button
            onClick={() => handleZoom(10)}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(100)}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 border-l border-slate-100 dark:border-slate-800"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* WORKFLOW NODES CONTAINER (Scalable with Zoom) */}
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="relative z-10 w-full max-w-xl flex flex-col items-center transition-transform duration-150"
        >
          {/* ================= STAGE 1: TRIGGER NODE ================= */}
          <div
            onClick={() => setIsDrawerOpen(true)}
            className="w-full p-4 rounded-xl border-2 border-amber-400 dark:border-amber-500/80 bg-white dark:bg-slate-900 shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    STAGE 1: TRIGGER
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {trigger.label}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm">
                  Trigger Event
                </Badge>
                <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500" />
              </div>
            </div>

            {/* Config Details */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>
                Channels:{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {trigger.config?.channels?.join(', ') || 'All Channels'}
                </strong>
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-medium text-[10px]">
                Click to Configure
              </span>
            </div>
          </div>

          {/* SVG Connection Arrow 1 */}
          <div className="flex flex-col items-center my-2">
            <div className="w-0.5 h-8 bg-amber-400 dark:bg-amber-600 border-dashed" />
            <div className="w-2.5 h-2.5 -mt-1 rotate-45 border-b-2 border-r-2 border-amber-400 dark:border-amber-600" />
          </div>

          {/* ================= STAGE 2: CONDITION GROUPS NODE ================= */}
          <div
            onClick={() => setIsDrawerOpen(true)}
            className="w-full p-4 rounded-xl border-2 border-indigo-400 dark:border-indigo-500/80 bg-white dark:bg-slate-900 shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    STAGE 2: CONDITIONS EVALUATION
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Filter Logic ({conditionGroups.length} Group{conditionGroups.length === 1 ? '' : 's'})
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm">
                  {conditionGroups[0]?.logic || 'AND'} MATCH
                </Badge>
                <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
              </div>
            </div>

            {/* Condition Chips */}
            <div className="space-y-2">
              {conditionGroups.map((g, gIdx) => (
                <div
                  key={g.id}
                  className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider">
                    <span>Condition Group {gIdx + 1}</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-200 dark:bg-indigo-900">
                      {g.logic}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {g.conditions.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-indigo-200/80 dark:border-indigo-800 text-[11px] text-slate-700 dark:text-slate-300 font-mono"
                      >
                        <strong>{c.field.replace('_', ' ')}</strong>
                        <span className="text-indigo-500">{c.operator}</span>
                        <span>"{c.value}"</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SVG Connection Arrow 2 */}
          <div className="flex flex-col items-center my-2">
            <div className="w-0.5 h-8 bg-indigo-400 dark:bg-indigo-600 border-dashed" />
            <div className="w-2.5 h-2.5 -mt-1 rotate-45 border-b-2 border-r-2 border-indigo-400 dark:border-indigo-600" />
          </div>

          {/* ================= STAGE 3: ACTION PIPELINE NODE ================= */}
          <div
            onClick={() => setIsDrawerOpen(true)}
            className="w-full p-4 rounded-xl border-2 border-emerald-400 dark:border-emerald-500/80 bg-white dark:bg-slate-900 shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    STAGE 3: ACTION PIPELINE
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Execution Sequence ({actions.length} Action{actions.length === 1 ? '' : 's'})
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm">
                  Sequential Order
                </Badge>
                <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500" />
              </div>
            </div>

            {/* Action Steps */}
            <div className="space-y-2">
              {actions.map((act, idx) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {act.label}
                    </span>
                  </div>

                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                    {act.config.priority
                      ? `Priority: ${act.config.priority}`
                      : act.config.status
                      ? `Status: ${act.config.status}`
                      : act.config.tag
                      ? `Tag: #${act.config.tag}`
                      : act.config.targetDepartment
                      ? `Dept: ${act.config.targetDepartment}`
                      : 'Configured'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Add Action Button Below */}
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="bg-white dark:bg-slate-900 shadow-sm"
            >
              Add Workflow Step
            </Button>
          </div>
        </div>
      </div>

      {/* Slide-in Configuration Drawer */}
      <AutomationBuilderDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        ruleName={ruleName}
        ruleDescription={ruleDescription}
        trigger={trigger}
        conditionGroups={conditionGroups}
        actions={actions}
        onChangeRuleName={setRuleName}
        onChangeRuleDescription={setRuleDescription}
        onChangeTrigger={setTrigger}
        onChangeConditionGroups={setConditionGroups}
        onChangeActions={setActions}
        onSave={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
