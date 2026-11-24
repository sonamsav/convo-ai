/**
 * In-memory execution store and seeded execution telemetry for Workflow Engine
 */

export const INITIAL_EXECUTIONS = [
  {
    id: 'exec-101',
    automationId: 'auto-1',
    automationName: 'Auto-Assign Enterprise Chats to Senior Engineers',
    triggerEvent: 'new_conversation_created',
    relatedConversationId: 'conv-101',
    relatedTicketNumber: '#CONV-1024',
    customerName: 'Marcus Vance',
    executionStatus: 'successful',
    durationMs: 42,
    idempotencyKey: 'event_conv101_auto1',
    executionSteps: [
      {
        stepNumber: 1,
        type: 'trigger_received',
        title: 'Trigger Evaluated',
        status: 'passed',
        details: 'Event "new_conversation_created" matched channel Web Chat for #CONV-1024.'
      },
      {
        stepNumber: 2,
        type: 'condition_evaluated',
        title: 'Conditions Checked (AND group)',
        status: 'passed',
        details: 'Conversation tags contains "enterprise" (MATCH) AND status equals "open" (MATCH).'
      },
      {
        stepNumber: 3,
        type: 'action_executed',
        title: 'Assign to Tier 2 Engineering',
        status: 'passed',
        details: 'Assigned to team "Tier 2 Engineering" (ID: team-tier2).'
      },
      {
        stepNumber: 4,
        type: 'action_executed',
        title: 'Set Priority to High',
        status: 'passed',
        details: 'Updated ticket priority from "medium" to "high".'
      },
      {
        stepNumber: 5,
        type: 'action_executed',
        title: 'Log Enterprise Routing',
        status: 'passed',
        details: 'Injected internal triage note into conversation history.'
      }
    ],
    startedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 12 + 42).toISOString(),
    errorDetails: null
  },
  {
    id: 'exec-102',
    automationId: 'auto-2',
    automationName: 'Negative Sentiment Escalation & VIP Alert',
    triggerEvent: 'customer_sentiment_changed',
    relatedConversationId: 'conv-104',
    relatedTicketNumber: '#CONV-1029',
    customerName: 'David Kross',
    executionStatus: 'successful',
    durationMs: 88,
    idempotencyKey: 'event_conv104_auto2',
    executionSteps: [
      {
        stepNumber: 1,
        type: 'trigger_received',
        title: 'Trigger Evaluated',
        status: 'passed',
        details: 'Event "customer_sentiment_changed" received with sentiment "Negative".'
      },
      {
        stepNumber: 2,
        type: 'condition_evaluated',
        title: 'Conditions Checked (AND group)',
        status: 'passed',
        details: 'Customer sentiment equals "Negative" (MATCH).'
      },
      {
        stepNumber: 3,
        type: 'action_executed',
        title: 'Escalate to Manager On-Call',
        status: 'passed',
        details: 'Escalation routing dispatched to department "vip_retention" with 10m SLA.'
      },
      {
        stepNumber: 4,
        type: 'action_executed',
        title: 'Send Slack/In-App Alert',
        status: 'passed',
        details: 'Dispatched alert notification to role "Manager".'
      },
      {
        stepNumber: 5,
        type: 'action_executed',
        title: 'Evaluate Detailed Sentiment Indicators',
        status: 'passed',
        details: 'Dispatched background AI sentiment telemetry evaluation.'
      }
    ],
    startedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 35 + 88).toISOString(),
    errorDetails: null
  },
  {
    id: 'exec-103',
    automationId: 'auto-4',
    automationName: 'Auto-Trigger AI Summary on Ticket Resolution',
    triggerEvent: 'conversation_status_changed',
    relatedConversationId: 'conv-103',
    relatedTicketNumber: '#CONV-1027',
    customerName: 'Elena Rostova',
    executionStatus: 'successful',
    durationMs: 310,
    idempotencyKey: 'event_conv103_auto4',
    executionSteps: [
      {
        stepNumber: 1,
        type: 'trigger_received',
        title: 'Trigger Evaluated',
        status: 'passed',
        details: 'Status transition to "resolved" detected.'
      },
      {
        stepNumber: 2,
        type: 'condition_evaluated',
        title: 'Conditions Checked',
        status: 'passed',
        details: 'Conversation status equals "resolved" (MATCH).'
      },
      {
        stepNumber: 3,
        type: 'action_executed',
        title: 'Generate Resolution Summary',
        status: 'passed',
        details: 'Dispatched OpenAI summary synthesis; synthesized 6-point breakdown.'
      },
      {
        stepNumber: 4,
        type: 'action_executed',
        title: 'Tag as AI-Summarized',
        status: 'passed',
        details: 'Added tag "ai-summarized" to conversation.'
      }
    ],
    startedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 5 + 310).toISOString(),
    errorDetails: null
  },
  {
    id: 'exec-104',
    automationId: 'auto-1',
    automationName: 'Auto-Assign Enterprise Chats to Senior Engineers',
    triggerEvent: 'new_conversation_created',
    relatedConversationId: 'conv-108',
    relatedTicketNumber: '#CONV-1035',
    customerName: 'Liam O\'Connor',
    executionStatus: 'skipped',
    durationMs: 14,
    idempotencyKey: 'event_conv108_auto1',
    executionSteps: [
      {
        stepNumber: 1,
        type: 'trigger_received',
        title: 'Trigger Evaluated',
        status: 'passed',
        details: 'New conversation initiated.'
      },
      {
        stepNumber: 2,
        type: 'condition_evaluated',
        title: 'Conditions Checked',
        status: 'failed',
        details: 'Conversation tags contains "enterprise" (MISMATCH: tags=["starter", "trial"]). Execution skipped.'
      }
    ],
    startedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 55 + 14).toISOString(),
    errorDetails: null
  },
  {
    id: 'exec-105',
    automationId: 'auto-5',
    automationName: 'SLA Breach Warning for Stagnant Tickets',
    triggerEvent: 'conversation_inactive',
    relatedConversationId: 'conv-109',
    relatedTicketNumber: '#CONV-1036',
    customerName: 'Amina Al-Mansoor',
    executionStatus: 'failed',
    durationMs: 120,
    idempotencyKey: 'event_conv109_auto5',
    executionSteps: [
      {
        stepNumber: 1,
        type: 'trigger_received',
        title: 'Trigger Evaluated',
        status: 'passed',
        details: 'Inactive timer (240m) reached.'
      },
      {
        stepNumber: 2,
        type: 'condition_evaluated',
        title: 'Conditions Checked',
        status: 'passed',
        details: 'Conversation status equals "open" (MATCH) AND priority equals "high" (MATCH).'
      },
      {
        stepNumber: 3,
        type: 'action_executed',
        title: 'Escalate to Urgent',
        status: 'passed',
        details: 'Priority updated to "urgent".'
      },
      {
        stepNumber: 4,
        type: 'action_executed',
        title: 'Send SLA Breach Warning',
        status: 'failed',
        details: 'Notification delivery webhook returned HTTP 503 Service Unavailable.'
      }
    ],
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 120).toISOString(),
    errorDetails: {
      step: 4,
      actionType: 'send_notification',
      message: 'Notification delivery webhook returned HTTP 503 Service Unavailable.',
      retryable: true
    }
  }
];

export let automationExecutions = [...INITIAL_EXECUTIONS];

export function addExecution(execution) {
  automationExecutions.unshift(execution);
  // Keep last 500 executions
  if (automationExecutions.length > 500) {
    automationExecutions.pop();
  }
  return execution;
}

export function findExecutionById(id) {
  return automationExecutions.find((e) => e.id === id);
}

export function updateExecution(id, updates) {
  const index = automationExecutions.findIndex((e) => e.id === id);
  if (index !== -1) {
    automationExecutions[index] = { ...automationExecutions[index], ...updates };
    return automationExecutions[index];
  }
  return null;
}
