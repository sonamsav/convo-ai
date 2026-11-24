/**
 * Types for ConvoAI Automation Rules & Workflow Engine
 */

export type TriggerType =
  | 'new_conversation_created'
  | 'new_message_received'
  | 'conversation_assigned'
  | 'conversation_status_changed'
  | 'priority_changed'
  | 'customer_created'
  | 'customer_sentiment_changed'
  | 'conversation_inactive'
  | 'scheduled_time';

export type ConditionField =
  | 'customer_name'
  | 'customer_email'
  | 'conversation_status'
  | 'conversation_priority'
  | 'assigned_agent'
  | 'conversation_tags'
  | 'customer_sentiment'
  | 'detected_intent'
  | 'message_content'
  | 'conversation_age';

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty';

export type ActionType =
  | 'assign_agent'
  | 'assign_team'
  | 'change_priority'
  | 'change_status'
  | 'add_tag'
  | 'remove_tag'
  | 'send_notification'
  | 'escalate'
  | 'add_internal_note'
  | 'trigger_ai_summary'
  | 'trigger_ai_sentiment';

export interface TriggerConfig {
  channels?: string[];
  targetStatus?: string;
  targetPriority?: string;
  inactiveMinutes?: number;
  cronSchedule?: string;
  [key: string]: any;
}

export interface TriggerDefinition {
  type: TriggerType;
  label: string;
  description?: string;
  config: TriggerConfig;
}

export interface ConditionItem {
  id: string;
  field: ConditionField;
  operator: ConditionOperator;
  value: string;
}

export interface ConditionGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: ConditionItem[];
}

export interface ActionItem {
  id: string;
  type: ActionType;
  label: string;
  config: {
    agentId?: string;
    agentName?: string;
    teamId?: string;
    teamName?: string;
    priority?: 'urgent' | 'high' | 'medium' | 'low';
    status?: 'open' | 'pending' | 'resolved';
    tag?: string;
    recipientRole?: 'Admin' | 'Manager' | 'Team Lead' | 'Agent';
    message?: string;
    targetDepartment?: string;
    slaMinutes?: number;
    note?: string;
    autoAttachNote?: boolean;
    [key: string]: any;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused';
  category?: 'routing' | 'escalation' | 'ai_intelligence' | 'lifecycle' | 'custom';
  trigger: TriggerDefinition;
  conditionGroups: ConditionGroup[];
  actions: ActionItem[];
  executionCount: number;
  successfulExecutions: number;
  failedExecutions: number;
  lastExecutedAt: string | null;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionStep {
  stepNumber: number;
  type: 'trigger_received' | 'condition_evaluated' | 'action_executed' | 'retry_executed' | 'idempotency_check';
  title: string;
  status: 'passed' | 'failed' | 'skipped';
  durationMs?: number;
  details: string;
}

export interface AutomationExecution {
  id: string;
  automationId: string;
  automationName: string;
  triggerEvent: string;
  relatedConversationId: string;
  relatedTicketNumber: string;
  customerName: string;
  executionStatus: 'successful' | 'failed' | 'skipped' | 'processing';
  durationMs: number;
  idempotencyKey?: string;
  executionSteps: ExecutionStep[];
  startedAt: string;
  completedAt: string;
  errorDetails?: {
    step?: number;
    actionType?: string;
    message?: string;
    retryable?: boolean;
  } | null;
}

export interface AutomationStats {
  totalAutomations: number;
  activeAutomations: number;
  pausedAutomations: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: TriggerDefinition;
  conditionGroups: ConditionGroup[];
  actions: ActionItem[];
}

export interface AutomationFilterState {
  search: string;
  status: 'all' | 'active' | 'paused';
  trigger: 'all' | TriggerType;
  sortBy: 'updatedAt' | 'name' | 'executions';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}
