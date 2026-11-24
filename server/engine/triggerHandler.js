/**
 * Trigger Handler and Workflow Execution Orchestrator
 */

import { evaluateConditionGroups } from './conditionEvaluator.js';
import { executeActions, checkAndSetIdempotency } from './actionExecutor.js';
import { addExecution } from '../data/automationExecutions.js';

/**
 * Dispatches an event to the automation engine, finding matching active rules,
 * evaluating conditions, executing actions, and recording telemetry.
 */
export async function dispatchEventToAutomations(event, automations) {
  const { eventType, eventId, context = {} } = event;
  const results = [];

  const activeRules = automations.filter(
    (rule) => rule.status === 'active' && rule.trigger?.type === eventType
  );

  let updatedContext = { ...context };

  for (const rule of activeRules) {
    const startTime = Date.now();
    const execId = `exec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const idempotencyKey = `idemp_${eventId || context.id || 'evt'}_${rule.id}`;

    // 1. Idempotency Check
    const isFirstRun = checkAndSetIdempotency(idempotencyKey);
    if (!isFirstRun) {
      const skippedRecord = {
        id: execId,
        automationId: rule.id,
        automationName: rule.name,
        triggerEvent: eventType,
        relatedConversationId: context.id || context.conversationId || 'unknown',
        relatedTicketNumber: context.ticketNumber || '#CONV-TEMP',
        customerName: context.customer?.name || context.customerName || 'Anonymous',
        executionStatus: 'skipped',
        durationMs: 2,
        idempotencyKey,
        executionSteps: [
          {
            stepNumber: 1,
            type: 'trigger_received',
            title: 'Trigger Evaluated',
            status: 'passed',
            details: `Received event ${eventType}.`
          },
          {
            stepNumber: 2,
            type: 'idempotency_check',
            title: 'Duplicate Execution Prevention',
            status: 'skipped',
            details: `Duplicate event detected for rule "${rule.name}" within safe window. Execution skipped.`
          }
        ],
        startedAt: new Date(startTime).toISOString(),
        completedAt: new Date().toISOString(),
        errorDetails: null
      };
      addExecution(skippedRecord);
      results.push({ ruleId: rule.id, status: 'skipped', reason: 'duplicate_event' });
      continue;
    }

    // 2. Trigger Configuration Validation
    if (rule.trigger?.config?.channels && context.channel) {
      const channels = rule.trigger.config.channels;
      if (!channels.includes(context.channel)) {
        continue; // Doesn't match channel filter
      }
    }

    if (rule.trigger?.config?.targetStatus && context.status) {
      if (rule.trigger.config.targetStatus !== context.status) {
        continue; // Doesn't match target status filter
      }
    }

    const steps = [
      {
        stepNumber: 1,
        type: 'trigger_received',
        title: `Trigger: ${rule.trigger?.label || eventType}`,
        status: 'passed',
        details: `Event "${eventType}" matched active automation rule.`
      }
    ];

    // 3. Condition Evaluation
    const conditionEval = evaluateConditionGroups(rule.conditionGroups, updatedContext);
    steps.push(...conditionEval.evaluationSteps);

    if (!conditionEval.passed) {
      const durationMs = Date.now() - startTime;
      const skippedRecord = {
        id: execId,
        automationId: rule.id,
        automationName: rule.name,
        triggerEvent: eventType,
        relatedConversationId: context.id || context.conversationId || 'unknown',
        relatedTicketNumber: context.ticketNumber || '#CONV-TEMP',
        customerName: context.customer?.name || context.customerName || 'Anonymous',
        executionStatus: 'skipped',
        durationMs,
        idempotencyKey,
        executionSteps: steps,
        startedAt: new Date(startTime).toISOString(),
        completedAt: new Date().toISOString(),
        errorDetails: null
      };

      addExecution(skippedRecord);
      results.push({ ruleId: rule.id, status: 'skipped', reason: 'condition_mismatch' });
      continue;
    }

    // 4. Action Execution
    const actionResult = await executeActions(rule.actions || [], updatedContext);
    steps.push(...actionResult.steps);
    updatedContext = actionResult.updatedContext;

    const durationMs = Date.now() - startTime;
    const finalStatus = actionResult.success ? 'successful' : 'failed';

    // Update rule telemetry
    rule.executionCount = (rule.executionCount || 0) + 1;
    if (finalStatus === 'successful') {
      rule.successfulExecutions = (rule.successfulExecutions || 0) + 1;
    } else {
      rule.failedExecutions = (rule.failedExecutions || 0) + 1;
    }
    rule.lastExecutedAt = new Date().toISOString();

    const executionRecord = {
      id: execId,
      automationId: rule.id,
      automationName: rule.name,
      triggerEvent: eventType,
      relatedConversationId: context.id || context.conversationId || 'unknown',
      relatedTicketNumber: context.ticketNumber || '#CONV-TEMP',
      customerName: context.customer?.name || context.customerName || 'Anonymous',
      executionStatus: finalStatus,
      durationMs,
      idempotencyKey,
      executionSteps: steps,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      errorDetails: actionResult.failureDetails
    };

    addExecution(executionRecord);
    results.push({
      ruleId: rule.id,
      executionId: execId,
      status: finalStatus,
      stepsCount: steps.length,
      durationMs
    });
  }

  return {
    matchedCount: activeRules.length,
    results,
    updatedContext
  };
}
