import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Zap,
  Plus,
  Play,
  RotateCw,
  Sparkles,
  Layers,
  Activity,
  Workflow,
  ShieldAlert,
} from 'lucide-react';
import { RootState, AppDispatch } from '@/app/store/store';
import {
  setAutomations,
  setStats,
  setExecutions,
  setTemplates,
  setActiveTab,
  setSelectedAutomationId,
  setBuilderDraft,
  addRule,
  updateRule,
  toggleRuleStatus,
  deleteRule,
  loadTemplateIntoDraft,
  loadRuleIntoDraft,
  setLoading,
  setError,
} from '@/app/store/slices/automationSlice';
import {
  updateConversationPriority,
  updateConversationStatus,
  addTag,
} from '@/app/store/slices/inboxSlice';
import { PageHeader, Button, Badge, LoadingState } from '@/components/ui';
import { AutomationStatsOverview } from '../components/AutomationStatsOverview';
import { AutomationTable } from '../components/AutomationTable';
import { VisualWorkflowEditor } from '../components/VisualWorkflowEditor';
import { AutomationTemplatesModal } from '../components/AutomationTemplatesModal';
import { AutomationDetailModal } from '../components/AutomationDetailModal';
import { ExecutionHistoryTab } from '../components/ExecutionHistoryTab';
import { TestRuleModal } from '../components/TestRuleModal';
import { automationService } from '../services/automationService';
import {
  AutomationRule,
  AutomationTemplate,
  AutomationStats,
  AutomationExecution,
  ActionItem,
} from '../types/automation';
import { cn } from '@/utils/cn';

export const AutomationPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    automations,
    stats,
    executions,
    templates,
    activeTab,
    selectedAutomationId,
    builderDraft,
    isLoading,
  } = useSelector((state: RootState) => state.automation);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const userRole = currentUser?.role || 'admin';

  // Modal visibility states
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [inspectedRule, setInspectedRule] = useState<AutomationRule | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      dispatch(setLoading(true));

      const [autoRes, tplRes, execRes] = await Promise.all([
        automationService.getAutomations(),
        automationService.getTemplates(),
        automationService.getExecutions({ limit: 50 }),
      ]);

      dispatch(setAutomations(autoRes.automations));
      dispatch(setStats(autoRes.stats));
      dispatch(setTemplates(tplRes));
      dispatch(setExecutions(execRes.executions));
    } catch (err: any) {
      console.error('Failed to load automation data:', err);
      dispatch(setError(err.message || 'Failed to load automations'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  // Handle Save in Visual Workflow Editor
  const handleSaveWorkflow = async (ruleData: any) => {
    try {
      dispatch(setLoading(true));
      if (ruleData.id) {
        // Update existing rule
        const updated = await automationService.updateAutomation(
          ruleData.id,
          ruleData,
          { role: userRole }
        );
        dispatch(updateRule(updated));
      } else {
        // Create new rule
        const created = await automationService.createAutomation(ruleData, {
          role: userRole,
          name: currentUser?.name || 'Alex Rivera',
        });
        dispatch(addRule(created));
      }
      dispatch(setActiveTab('rules'));
      fetchData();
    } catch (err: any) {
      console.error('Error saving automation:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Toggle Rule Status
  const handleToggleStatus = async (rule: AutomationRule) => {
    try {
      dispatch(toggleRuleStatus(rule.id));
      await automationService.toggleStatus(rule.id, { role: userRole });
    } catch (err) {
      console.error('Error toggling rule status:', err);
      fetchData(); // Rollback on error
    }
  };

  // Duplicate Rule
  const handleDuplicate = async (rule: AutomationRule) => {
    try {
      const cloned = await automationService.duplicateAutomation(rule.id);
      dispatch(addRule(cloned));
    } catch (err) {
      console.error('Error duplicating rule:', err);
    }
  };

  // Delete Rule
  const handleDelete = async (rule: AutomationRule) => {
    try {
      dispatch(deleteRule(rule.id));
      await automationService.deleteAutomation(rule.id, { role: userRole });
    } catch (err) {
      console.error('Error deleting rule:', err);
      fetchData();
    }
  };

  // View Details Modal
  const handleViewDetails = (rule: AutomationRule) => {
    setInspectedRule(rule);
    setIsDetailModalOpen(true);
  };

  // Edit in Visual Builder
  const handleEditInBuilder = (rule: AutomationRule) => {
    dispatch(loadRuleIntoDraft(rule));
    dispatch(setActiveTab('builder'));
  };

  // Select Template to Load
  const handleSelectTemplate = (template: AutomationTemplate) => {
    dispatch(loadTemplateIntoDraft(template));
    dispatch(setActiveTab('builder'));
  };

  // Retry Failed Execution
  const handleRetryExecution = async (id: string) => {
    const updated = await automationService.retryExecution(id);
    fetchData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        title="Automation Rules"
        description="Automate repetitive customer support tasks and streamline team workflows."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Automation Rules', isCurrent: true },
        ]}
        badge={
          <Badge variant="success" size="sm" hasDot>
            {stats.activeAutomations} Active Workflows
          </Badge>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTestModalOpen(true)}
              leftIcon={<Play className="w-3.5 h-3.5 text-brand-600" />}
            >
              Test Simulation
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTemplatesModalOpen(true)}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            >
              Templates ({templates.length})
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              leftIcon={<RotateCw className="w-3.5 h-3.5 text-slate-500" />}
            >
              Refresh
            </Button>

            {userRole !== 'agent' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  dispatch(setActiveTab('builder'));
                }}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Create Automation
              </Button>
            )}
          </div>
        }
      />

      {/* 6 KPI Cards Overview */}
      <AutomationStatsOverview
        stats={stats}
        onFilterClick={() => dispatch(setActiveTab('rules'))}
      />

      {/* Main Feature Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-px text-xs font-semibold">
        <button
          onClick={() => dispatch(setActiveTab('rules'))}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors',
            activeTab === 'rules'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          )}
        >
          <Zap className="w-4 h-4" />
          <span>Automation Rules</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
            {automations.length}
          </span>
        </button>

        <button
          onClick={() => dispatch(setActiveTab('builder'))}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors',
            activeTab === 'builder'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          )}
        >
          <Workflow className="w-4 h-4" />
          <span>Visual Workflow Editor</span>
        </button>

        <button
          onClick={() => dispatch(setActiveTab('executions'))}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors',
            activeTab === 'executions'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          )}
        >
          <Activity className="w-4 h-4" />
          <span>Execution History</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
            {executions.length}
          </span>
        </button>

        <button
          onClick={() => dispatch(setActiveTab('templates'))}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors',
            activeTab === 'templates'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          )}
        >
          <Sparkles className="w-4 h-4" />
          <span>Templates Gallery</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
            {templates.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENTS */}
      {isLoading && automations.length === 0 ? (
        <div className="p-16 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <LoadingState message="Connecting to ConvoAI Workflow Engine..." />
        </div>
      ) : (
        <div>
          {/* TAB 1: RULES TABLE */}
          {activeTab === 'rules' && (
            <AutomationTable
              automations={automations}
              onViewDetails={handleViewDetails}
              onEdit={handleEditInBuilder}
              onDuplicate={handleDuplicate}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              userRole={userRole}
            />
          )}

          {/* TAB 2: VISUAL WORKFLOW EDITOR */}
          {activeTab === 'builder' && (
            <VisualWorkflowEditor
              initialRule={builderDraft}
              onSave={handleSaveWorkflow}
              onCancel={() => dispatch(setActiveTab('rules'))}
              isSaving={isLoading}
            />
          )}

          {/* TAB 3: EXECUTION HISTORY */}
          {activeTab === 'executions' && (
            <ExecutionHistoryTab
              executions={executions}
              onRetryExecution={handleRetryExecution}
              isLoading={isLoading}
            />
          )}

          {/* TAB 4: TEMPLATES GALLERY INLINE */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tpl: AutomationTemplate) => (
                <div
                  key={tpl.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card flex flex-col justify-between space-y-4 hover:border-brand-300 dark:hover:border-brand-700/60 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        {tpl.category}
                      </span>
                      <Badge variant="neutral" size="sm">
                        Ready to use
                      </Badge>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {tpl.name}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {tpl.description}
                    </p>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-[11px] font-mono space-y-1 text-slate-700 dark:text-slate-300">
                      <p>
                        <strong className="text-amber-500">WHEN:</strong> {tpl.trigger.label}
                      </p>
                      <p>
                        <strong className="text-emerald-500">THEN:</strong>{' '}
                        {tpl.actions.map((a: ActionItem) => a.label).join(' → ')}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSelectTemplate(tpl)}
                    >
                      Load into Builder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL */}
      <AutomationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        rule={inspectedRule}
        recentExecutions={
          inspectedRule
            ? executions.filter((e: AutomationExecution) => e.automationId === inspectedRule.id).slice(0, 5)
            : []
        }
        onEdit={handleEditInBuilder}
        onToggleStatus={handleToggleStatus}
        onDuplicate={handleDuplicate}
      />

      {/* TEMPLATES GALLERY MODAL */}
      <AutomationTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        templates={templates}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* TEST & SIMULATION MODAL */}
      <TestRuleModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        onExecutionCompleted={fetchData}
      />
    </div>
  );
};
