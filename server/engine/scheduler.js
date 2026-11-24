/**
 * Automation Engine Background Scheduler
 * Handles inactive-conversation polling and cron/time-based automation evaluation
 */

import { dispatchEventToAutomations } from './triggerHandler.js';

let schedulerInterval = null;

export function startScheduler(automationsRef, getConversationsFn, intervalMs = 60000) {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  schedulerInterval = setInterval(async () => {
    try {
      await evaluateInactiveAndScheduledRules(automationsRef, getConversationsFn);
    } catch (err) {
      console.error('[Automation Scheduler] Error during background check:', err);
    }
  }, intervalMs);

  return schedulerInterval;
}

export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

/**
 * Runs single evaluation pass for inactive conversations and schedule triggers
 */
export async function evaluateInactiveAndScheduledRules(automations, getConversationsFn) {
  const conversations = typeof getConversationsFn === 'function' ? getConversationsFn() : [];
  const now = Date.now();
  const results = [];

  // 1. Inactive conversation check
  const inactiveRules = automations.filter(
    (r) => r.status === 'active' && r.trigger?.type === 'conversation_inactive'
  );

  for (const rule of inactiveRules) {
    const thresholdMinutes = rule.trigger?.config?.inactiveMinutes || 240;
    const thresholdMs = thresholdMinutes * 60 * 1000;

    for (const convo of conversations) {
      if (convo.status === 'resolved') continue;

      const lastUpdatedMs = convo.updatedAt ? new Date(convo.updatedAt).getTime() : now;
      const idleMs = now - lastUpdatedMs;

      if (idleMs >= thresholdMs) {
        const res = await dispatchEventToAutomations(
          {
            eventType: 'conversation_inactive',
            eventId: `idle_${convo.id}_${Math.floor(now / thresholdMs)}`,
            context: {
              ...convo,
              ageMinutes: Math.floor(idleMs / (60 * 1000))
            }
          },
          automations
        );
        results.push(res);
      }
    }
  }

  // 2. Scheduled time rules
  const scheduledRules = automations.filter(
    (r) => r.status === 'active' && r.trigger?.type === 'scheduled_time'
  );

  for (const rule of scheduledRules) {
    const res = await dispatchEventToAutomations(
      {
        eventType: 'scheduled_time',
        eventId: `sched_${rule.id}_${Math.floor(now / 3600000)}`,
        context: {
          timestamp: new Date().toISOString(),
          systemScheduled: true
        }
      },
      automations
    );
    results.push(res);
  }

  return results;
}
