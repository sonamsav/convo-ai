/**
 * Redux Slice for Automation Rules & Workflow Engine
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AutomationRule,
  AutomationExecution,
  AutomationTemplate,
  AutomationStats,
  AutomationFilterState,
  ConditionGroup,
  ActionItem,
  TriggerDefinition
} from '@/features/automation/types/automation';

interface AutomationState {
  automations: AutomationRule[];
  executions: AutomationExecution[];
  templates: AutomationTemplate[];
  stats: AutomationStats;
  filters: AutomationFilterState;
  selectedAutomationId: string | null;
  builderDraft: {
    id?: string;
    name: string;
    description: string;
    status: 'active' | 'paused';
    trigger: TriggerDefinition;
    conditionGroups: ConditionGroup[];
    actions: ActionItem[];
  };
  activeTab: 'rules' | 'builder' | 'executions' | 'templates';
  isLoading: boolean;
  error: string | null;
}

const defaultBuilderDraft = {
  name: 'New Custom Automation',
  description: 'Automatically routes and updates conversations when trigger occurs.',
  status: 'active' as const,
  trigger: {
    type: 'new_conversation_created' as const,
    label: 'New Conversation Created',
    config: { channels: ['Web Chat', 'Email'] }
  },
  conditionGroups: [
    {
      id: 'cg-1',
      logic: 'AND' as const,
      conditions: [
        {
          id: 'c-1',
          field: 'conversation_status' as const,
          operator: 'equals' as const,
          value: 'open'
        }
      ]
    }
  ],
  actions: [
    {
      id: 'a-1',
      type: 'assign_agent' as const,
      label: 'Assign to Available Agent',
      config: { strategy: 'round_robin', agentId: 'ag-1', agentName: 'Marcus Vance' }
    }
  ]
};

const initialState: AutomationState = {
  automations: [],
  executions: [],
  templates: [],
  stats: {
    totalAutomations: 0,
    activeAutomations: 0,
    pausedAutomations: 0,
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0
  },
  filters: {
    search: '',
    status: 'all',
    trigger: 'all',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  },
  selectedAutomationId: null,
  builderDraft: defaultBuilderDraft,
  activeTab: 'rules',
  isLoading: false,
  error: null
};

export const automationSlice = createSlice({
  name: 'automation',
  initialState,
  reducers: {
    setAutomations: (state, action: PayloadAction<AutomationRule[]>) => {
      state.automations = action.payload;
    },
    setStats: (state, action: PayloadAction<AutomationStats>) => {
      state.stats = action.payload;
    },
    setExecutions: (state, action: PayloadAction<AutomationExecution[]>) => {
      state.executions = action.payload;
    },
    setTemplates: (state, action: PayloadAction<AutomationTemplate[]>) => {
      state.templates = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<AutomationState['activeTab']>) => {
      state.activeTab = action.payload;
    },
    setSelectedAutomationId: (state, action: PayloadAction<string | null>) => {
      state.selectedAutomationId = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<AutomationFilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Builder Draft Reducers
    setBuilderDraft: (state, action: PayloadAction<AutomationState['builderDraft']>) => {
      state.builderDraft = action.payload;
    },
    resetBuilderDraft: (state) => {
      state.builderDraft = {
        ...defaultBuilderDraft,
        id: undefined
      };
    },
    loadTemplateIntoDraft: (state, action: PayloadAction<AutomationTemplate>) => {
      const t = action.payload;
      state.builderDraft = {
        name: t.name,
        description: t.description,
        status: 'active',
        trigger: t.trigger,
        conditionGroups: t.conditionGroups,
        actions: t.actions
      };
      state.activeTab = 'builder';
    },
    loadRuleIntoDraft: (state, action: PayloadAction<AutomationRule>) => {
      const r = action.payload;
      state.builderDraft = {
        id: r.id,
        name: r.name,
        description: r.description,
        status: r.status,
        trigger: r.trigger,
        conditionGroups: r.conditionGroups,
        actions: r.actions
      };
      state.activeTab = 'builder';
    },

    // In-memory CRUD updates
    addRule: (state, action: PayloadAction<AutomationRule>) => {
      state.automations.unshift(action.payload);
      state.stats.totalAutomations++;
      if (action.payload.status === 'active') state.stats.activeAutomations++;
      else state.stats.pausedAutomations++;
    },
    updateRule: (state, action: PayloadAction<AutomationRule>) => {
      const idx = state.automations.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1) {
        state.automations[idx] = action.payload;
      }
    },
    toggleRuleStatus: (state, action: PayloadAction<string>) => {
      const rule = state.automations.find((a) => a.id === action.payload);
      if (rule) {
        if (rule.status === 'active') {
          rule.status = 'paused';
          state.stats.activeAutomations = Math.max(0, state.stats.activeAutomations - 1);
          state.stats.pausedAutomations++;
        } else {
          rule.status = 'active';
          state.stats.pausedAutomations = Math.max(0, state.stats.pausedAutomations - 1);
          state.stats.activeAutomations++;
        }
      }
    },
    deleteRule: (state, action: PayloadAction<string>) => {
      const rule = state.automations.find((a) => a.id === action.payload);
      if (rule) {
        if (rule.status === 'active') state.stats.activeAutomations--;
        else state.stats.pausedAutomations--;
        state.stats.totalAutomations--;
        state.automations = state.automations.filter((a) => a.id !== action.payload);
      }
    },
    addExecutionRecord: (state, action: PayloadAction<AutomationExecution>) => {
      state.executions.unshift(action.payload);
      state.stats.totalExecutions++;
      if (action.payload.executionStatus === 'successful') state.stats.successfulExecutions++;
      else if (action.payload.executionStatus === 'failed') state.stats.failedExecutions++;
    }
  }
});

export const {
  setAutomations,
  setStats,
  setExecutions,
  setTemplates,
  setActiveTab,
  setSelectedAutomationId,
  setFilters,
  resetFilters,
  setLoading,
  setError,
  setBuilderDraft,
  resetBuilderDraft,
  loadTemplateIntoDraft,
  loadRuleIntoDraft,
  addRule,
  updateRule,
  toggleRuleStatus,
  deleteRule,
  addExecutionRecord
} = automationSlice.actions;

export default automationSlice.reducer;
