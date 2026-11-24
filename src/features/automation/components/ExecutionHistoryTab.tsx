import React, { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { AutomationExecution, ExecutionStep } from '../types/automation';
import { Badge, Button, Modal } from '@/components/ui';
import { cn } from '@/utils/cn';

interface ExecutionHistoryTabProps {
  executions: AutomationExecution[];
  onRetryExecution: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const ExecutionHistoryTab: React.FC<ExecutionHistoryTabProps> = ({
  executions,
  onRetryExecution,
  isLoading = false,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Selected execution for step-by-step trace inspection modal
  const [selectedExec, setSelectedExec] = useState<AutomationExecution | null>(null);
  const [isRetryingId, setIsRetryingId] = useState<string | null>(null);

  const filtered = executions.filter((exec) => {
    const matchesSearch =
      exec.automationName.toLowerCase().includes(search.toLowerCase()) ||
      exec.triggerEvent.toLowerCase().includes(search.toLowerCase()) ||
      exec.relatedTicketNumber.toLowerCase().includes(search.toLowerCase()) ||
      exec.customerName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || exec.executionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleRetry = async (exec: AutomationExecution) => {
    try {
      setIsRetryingId(exec.id);
      await onRetryExecution(exec.id);
    } finally {
      setIsRetryingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by rule, ticket, or customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
          {(['all', 'successful', 'failed', 'skipped'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors',
                statusFilter === s
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Executions Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Automation Name</th>
                <th className="py-3 px-4">Trigger Event</th>
                <th className="py-3 px-4">Conversation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Executed At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Activity className="w-7 h-7 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      No execution logs found
                    </p>
                    <p className="text-xs text-slate-500">
                      Execution telemetry records will appear here as events trigger matching rules.
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((exec) => {
                  return (
                    <tr
                      key={exec.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 min-w-[220px]">
                        <button
                          onClick={() => setSelectedExec(exec)}
                          className="hover:text-brand-600 dark:hover:text-brand-400 text-left transition-colors"
                        >
                          {exec.automationName}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {exec.triggerEvent}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                            {exec.relatedTicketNumber}
                          </span>
                          <p className="text-[11px] text-slate-500 truncate max-w-[120px]">
                            {exec.customerName}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            exec.executionStatus === 'successful'
                              ? 'success'
                              : exec.executionStatus === 'failed'
                              ? 'danger'
                              : exec.executionStatus === 'skipped'
                              ? 'neutral'
                              : 'info'
                          }
                          size="sm"
                          hasDot
                        >
                          {exec.executionStatus}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {exec.durationMs}ms
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(exec.startedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedExec(exec)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Trace
                          </Button>

                          {exec.executionStatus === 'failed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRetry(exec)}
                              isLoading={isRetryingId === exec.id}
                              leftIcon={<RotateCw className="w-3 h-3 text-amber-600" />}
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 text-xs">
            <span className="text-slate-500">
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, filtered.length)} of {filtered.length} executions
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="px-2 font-mono font-medium">{page} / {totalPages}</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Step-by-Step Execution Trace Modal */}
      {selectedExec && (
        <Modal
          isOpen={Boolean(selectedExec)}
          onClose={() => setSelectedExec(null)}
          title={`Execution Trace: ${selectedExec.relatedTicketNumber}`}
          size="lg"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Trace Summary Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {selectedExec.automationName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Triggered by <code className="font-mono text-brand-600">{selectedExec.triggerEvent}</code> on ticket {selectedExec.relatedTicketNumber} ({selectedExec.customerName})
                  </p>
                </div>

                <Badge
                  variant={
                    selectedExec.executionStatus === 'successful'
                      ? 'success'
                      : selectedExec.executionStatus === 'failed'
                      ? 'danger'
                      : 'neutral'
                  }
                  size="md"
                  hasDot
                >
                  {selectedExec.executionStatus}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <span>Duration: <strong>{selectedExec.durationMs}ms</strong></span>
                <span>•</span>
                <span>Started: {new Date(selectedExec.startedAt).toLocaleTimeString()}</span>
                <span>•</span>
                <span>Idempotency Key: <code className="font-mono text-[10px]">{selectedExec.idempotencyKey || 'N/A'}</code></span>
              </div>
            </div>

            {/* Error Banner if Failed */}
            {selectedExec.errorDetails && (
              <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Execution Error Encountered:</span>
                  <p>{selectedExec.errorDetails.message}</p>
                </div>
              </div>
            )}

            {/* Sequential Steps Timeline */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Execution Steps Timeline ({selectedExec.executionSteps.length})
              </span>

              <div className="space-y-2">
                {selectedExec.executionSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-start gap-3"
                  >
                    <div className="mt-0.5">
                      {step.status === 'passed' ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : step.status === 'failed' ? (
                        <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 flex items-center justify-center font-mono text-[10px]">
                          {step.stepNumber}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Step {step.stepNumber}: {step.title}
                        </span>
                        {step.durationMs !== undefined && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {step.durationMs}ms
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono leading-relaxed bg-slate-50 dark:bg-slate-850 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        {step.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setSelectedExec(null)}>
                Close Trace
              </Button>

              {selectedExec.executionStatus === 'failed' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleRetry(selectedExec)}
                  isLoading={isRetryingId === selectedExec.id}
                  leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                >
                  Safe Retry Execution
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
