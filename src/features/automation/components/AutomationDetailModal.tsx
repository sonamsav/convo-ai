import React from 'react';
import {
  Zap,
  Layers,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Copy,
  Edit2,
  User,
  Calendar,
  Activity,
} from 'lucide-react';
import { AutomationRule, AutomationExecution } from '../types/automation';
import { Modal, Button, Badge } from '@/components/ui';
import { cn } from '@/utils/cn';

interface AutomationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: AutomationRule | null;
  recentExecutions?: AutomationExecution[];
  onEdit?: (rule: AutomationRule) => void;
  onToggleStatus?: (rule: AutomationRule) => void;
  onDuplicate?: (rule: AutomationRule) => void;
}

export const AutomationDetailModal: React.FC<AutomationDetailModalProps> = ({
  isOpen,
  onClose,
  rule,
  recentExecutions = [],
  onEdit,
  onToggleStatus,
  onDuplicate,
}) => {
  if (!rule) return null;

  const successRate =
    rule.executionCount > 0
      ? Math.round((rule.successfulExecutions / rule.executionCount) * 100)
      : 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={rule.name}
      size="lg"
    >
      <div className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">
        {/* Top Header Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={rule.status === 'active' ? 'success' : 'neutral'} hasDot>
                {rule.status === 'active' ? 'Active & Monitoring' : 'Paused'}
              </Badge>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500">ID: {rule.id}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {onToggleStatus && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleStatus(rule)}
                  leftIcon={rule.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                >
                  {rule.status === 'active' ? 'Pause' : 'Activate'}
                </Button>
              )}
              {onDuplicate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDuplicate(rule)}
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                >
                  Duplicate
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onEdit(rule);
                    onClose();
                  }}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit Workflow
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            {rule.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Created by {rule.createdBy.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(rule.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Last run: {rule.lastExecutedAt ? new Date(rule.lastExecutedAt).toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Total Invocations
            </span>
            <p className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {rule.executionCount.toLocaleString()}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Success Reliability
            </span>
            <p className="mt-1 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {successRate}%
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Failed Runs
            </span>
            <p className="mt-1 text-xl font-bold font-mono text-rose-500">
              {rule.failedExecutions}
            </p>
          </div>
        </div>

        {/* Workflow Logic Flowchart Summary */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Configured Workflow Pipeline
          </h4>

          {/* Trigger Card */}
          <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-300 block">
                  TRIGGER: {rule.trigger.label}
                </span>
                <span className="text-[11px] text-slate-500">
                  Channels: {rule.trigger.config?.channels?.join(', ') || 'All channels'}
                </span>
              </div>
            </div>
            <Badge variant="warning" size="sm">
              Stage 1
            </Badge>
          </div>

          {/* Conditions Card */}
          <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-indigo-900 dark:text-indigo-300">
                  CONDITIONS ({rule.conditionGroups.length} Group)
                </span>
              </div>
              <Badge variant="info" size="sm">
                Stage 2
              </Badge>
            </div>

            <div className="space-y-1.5 pl-6">
              {rule.conditionGroups.map((g, idx) => (
                <div key={g.id} className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                  Group {idx + 1} ({g.logic}):{' '}
                  {g.conditions.map((c) => `${c.field} ${c.operator} "${c.value}"`).join(' AND ')}
                </div>
              ))}
            </div>
          </div>

          {/* Actions Card */}
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-emerald-900 dark:text-emerald-300">
                  ACTION PIPELINE ({rule.actions.length} Sequential Steps)
                </span>
              </div>
              <Badge variant="success" size="sm">
                Stage 3
              </Badge>
            </div>

            <div className="space-y-1.5 pl-6">
              {rule.actions.map((act, idx) => (
                <div
                  key={act.id}
                  className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-mono"
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{act.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Execution Telemetry Table */}
        {recentExecutions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Recent Execution Logs
            </h4>

            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-2 px-3">Ticket</th>
                    <th className="py-2 px-3">Customer</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Duration</th>
                    <th className="py-2 px-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentExecutions.map((exec) => (
                    <tr key={exec.id}>
                      <td className="py-2 px-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                        {exec.relatedTicketNumber}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                        {exec.customerName}
                      </td>
                      <td className="py-2 px-3">
                        <Badge
                          variant={
                            exec.executionStatus === 'successful'
                              ? 'success'
                              : exec.executionStatus === 'failed'
                              ? 'danger'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {exec.executionStatus}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500">
                        {exec.durationMs}ms
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400">
                        {new Date(exec.startedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
