/**
 * Action Executor for ConvoAI Automation Engine
 * Executes configured actions in sequence, logs each step, and produces updated context.
 */

// In-memory idempotency cache: key -> timestamp
const idempotencyStore = new Map();
const IDEMPOTENCY_TTL_MS = 1000 * 60 * 60; // 1 hour

export function checkAndSetIdempotency(key) {
  if (!key) return true;
  const now = Date.now();
  if (idempotencyStore.has(key)) {
    const ts = idempotencyStore.get(key);
    if (now - ts < IDEMPOTENCY_TTL_MS) {
      return false; // Duplicate detected
    }
  }
  idempotencyStore.set(key, now);
  // Cleanup old keys periodically
  if (idempotencyStore.size > 2000) {
    for (const [k, v] of idempotencyStore.entries()) {
      if (now - v >= IDEMPOTENCY_TTL_MS) idempotencyStore.delete(k);
    }
  }
  return true;
}

export async function executeActions(actions, context, options = {}) {
  const steps = [];
  const updatedContext = { ...context };
  let hasFailed = false;
  let failureDetails = null;

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const stepNumber = 3 + i;
    const startTime = Date.now();

    try {
      const result = await executeSingleAction(action, updatedContext);
      const duration = Date.now() - startTime;

      steps.push({
        stepNumber,
        type: 'action_executed',
        title: action.label || `Action: ${action.type}`,
        status: 'passed',
        durationMs: duration,
        details: result.message
      });

      // Merge modifications into context for subsequent steps
      if (result.updates) {
        Object.assign(updatedContext, result.updates);
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      hasFailed = true;
      failureDetails = {
        step: stepNumber,
        actionType: action.type,
        message: err.message || 'Execution error',
        retryable: true
      };

      steps.push({
        stepNumber,
        type: 'action_executed',
        title: action.label || `Action: ${action.type}`,
        status: 'failed',
        durationMs: duration,
        details: `Action failed: ${err.message}`
      });

      // Stop subsequent actions on critical failure
      break;
    }
  }

  return {
    success: !hasFailed,
    steps,
    updatedContext,
    failureDetails
  };
}

/**
 * Handles individual action types
 */
async function executeSingleAction(action, context) {
  const { type, config = {} } = action;

  switch (type) {
    case 'assign_agent': {
      const agentId = config.agentId || config.fallbackAgentId || 'ag-1';
      const agentName = config.agentName || 'Marcus Vance';
      return {
        message: `Conversation assigned to agent ${agentName} (${agentId}).`,
        updates: {
          assignedAgent: { id: agentId, name: agentName },
          assignedAgentId: agentId
        }
      };
    }

    case 'assign_team': {
      const teamId = config.teamId || 'team-tier2';
      const teamName = config.teamName || 'Tier 2 Engineering';
      return {
        message: `Conversation routed to team ${teamName} (${teamId}).`,
        updates: {
          assignedTeam: { id: teamId, name: teamName },
          assignedTeamId: teamId
        }
      };
    }

    case 'change_priority': {
      const priority = config.priority || 'high';
      return {
        message: `Conversation priority updated to "${priority}".`,
        updates: { priority }
      };
    }

    case 'change_status': {
      const status = config.status || 'pending';
      return {
        message: `Conversation status updated to "${status}".`,
        updates: { status }
      };
    }

    case 'add_tag': {
      const tag = config.tag || 'automated';
      const existing = context.tags ? [...context.tags] : [];
      if (!existing.includes(tag)) existing.push(tag);
      return {
        message: `Tag "${tag}" added to conversation.`,
        updates: { tags: existing }
      };
    }

    case 'remove_tag': {
      const tag = config.tag || '';
      const existing = context.tags ? context.tags.filter((t) => t !== tag) : [];
      return {
        message: `Tag "${tag}" removed from conversation.`,
        updates: { tags: existing }
      };
    }

    case 'send_notification': {
      const role = config.recipientRole || 'Manager';
      const msg = config.message || 'Notification triggered by workflow.';
      return {
        message: `Internal notification dispatched to ${role}: "${msg}"`,
        updates: {
          lastNotification: { role, message: msg, timestamp: new Date().toISOString() }
        }
      };
    }

    case 'escalate': {
      const dept = config.targetDepartment || 'Senior Operations';
      const sla = config.slaMinutes || 15;
      return {
        message: `Escalated to ${dept} with ${sla} minute SLA policy.`,
        updates: {
          isEscalated: true,
          escalatedTo: dept,
          slaTargetMinutes: sla
        }
      };
    }

    case 'add_internal_note': {
      const note = config.note || 'Automated workflow note.';
      const notes = context.internalNotes ? [...context.internalNotes] : [];
      notes.push({
        id: `note_${Date.now()}`,
        content: note,
        timestamp: new Date().toISOString(),
        author: 'Automation Engine'
      });
      return {
        message: `Internal note logged: "${note}"`,
        updates: { internalNotes: notes }
      };
    }

    case 'trigger_ai_summary': {
      return {
        message: 'OpenAI conversation summarization triggered and attached to thread.',
        updates: {
          aiSummaryGenerated: true,
          aiSummaryTimestamp: new Date().toISOString()
        }
      };
    }

    case 'trigger_ai_sentiment': {
      return {
        message: 'OpenAI sentiment analysis triggered and telemetry refreshed.',
        updates: {
          aiSentimentEvaluated: true,
          aiSentimentTimestamp: new Date().toISOString()
        }
      };
    }

    default:
      return {
        message: `Executed custom action ${type}.`,
        updates: {}
      };
  }
}
