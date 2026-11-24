/**
 * Condition Evaluator for ConvoAI Automation Rules
 * Evaluates complex AND/OR condition groups against event contexts
 */

export function evaluateConditionItem(condition, context) {
  const { field, operator, value } = condition;
  const contextValue = extractContextValue(field, context);

  switch (operator) {
    case 'equals': {
      if (contextValue === undefined || contextValue === null) return false;
      return String(contextValue).trim().toLowerCase() === String(value).trim().toLowerCase();
    }

    case 'not_equals': {
      if (contextValue === undefined || contextValue === null) return true;
      return String(contextValue).trim().toLowerCase() !== String(value).trim().toLowerCase();
    }

    case 'contains': {
      if (Array.isArray(contextValue)) {
        return contextValue.some((item) =>
          String(item).toLowerCase().includes(String(value).trim().toLowerCase())
        );
      }
      if (typeof contextValue === 'string') {
        return contextValue.toLowerCase().includes(String(value).trim().toLowerCase());
      }
      return false;
    }

    case 'not_contains': {
      if (Array.isArray(contextValue)) {
        return !contextValue.some((item) =>
          String(item).toLowerCase().includes(String(value).trim().toLowerCase())
        );
      }
      if (typeof contextValue === 'string') {
        return !contextValue.toLowerCase().includes(String(value).trim().toLowerCase());
      }
      return true;
    }

    case 'greater_than': {
      const numContext = parseFloat(contextValue);
      const numTarget = parseFloat(value);
      if (isNaN(numContext) || isNaN(numTarget)) return false;
      return numContext > numTarget;
    }

    case 'less_than': {
      const numContext = parseFloat(contextValue);
      const numTarget = parseFloat(value);
      if (isNaN(numContext) || isNaN(numTarget)) return false;
      return numContext < numTarget;
    }

    case 'is_empty': {
      if (contextValue === undefined || contextValue === null) return true;
      if (Array.isArray(contextValue)) return contextValue.length === 0;
      if (typeof contextValue === 'string') return contextValue.trim() === '';
      return false;
    }

    case 'is_not_empty': {
      if (contextValue === undefined || contextValue === null) return false;
      if (Array.isArray(contextValue)) return contextValue.length > 0;
      if (typeof contextValue === 'string') return contextValue.trim() !== '';
      return true;
    }

    default:
      return false;
  }
}

/**
 * Extracts normalized field value from the execution context
 */
function extractContextValue(field, context) {
  if (!context) return null;

  switch (field) {
    case 'customer_name':
      return context.customer?.name || context.customerName || null;

    case 'customer_email':
      return context.customer?.email || context.customerEmail || null;

    case 'conversation_status':
      return context.status || context.conversationStatus || null;

    case 'conversation_priority':
      return context.priority || context.conversationPriority || null;

    case 'assigned_agent':
      return context.assignedAgent?.name || context.assignedAgent?.id || context.assignedAgentId || null;

    case 'conversation_tags':
      return context.tags || context.conversationTags || [];

    case 'customer_sentiment':
      return context.sentiment || context.customerSentiment || null;

    case 'detected_intent':
      return context.intent || context.detectedIntent || null;

    case 'message_content':
      return context.lastMessage?.content || context.messageContent || context.text || '';

    case 'conversation_age':
    case 'conversation_age_minutes':
      if (context.ageMinutes !== undefined) return context.ageMinutes;
      if (context.createdAt) {
        const diffMs = Date.now() - new Date(context.createdAt).getTime();
        return Math.floor(diffMs / (1000 * 60));
      }
      return 0;

    default:
      return context[field] !== undefined ? context[field] : null;
  }
}

/**
 * Evaluates all condition groups for a rule against context
 * Returns { passed: boolean, evaluationSteps: Array }
 */
export function evaluateConditionGroups(conditionGroups, context) {
  if (!conditionGroups || conditionGroups.length === 0) {
    return {
      passed: true,
      evaluationSteps: [
        {
          stepNumber: 2,
          type: 'condition_evaluated',
          title: 'Condition Evaluation',
          status: 'passed',
          details: 'No conditions configured. Rule passes unconditionally.'
        }
      ]
    };
  }

  const steps = [];
  let overallPassed = true;

  for (let gIdx = 0; gIdx < conditionGroups.length; gIdx++) {
    const group = conditionGroups[gIdx];
    const logic = group.logic || 'AND';
    const conditions = group.conditions || [];

    if (conditions.length === 0) continue;

    let groupPassed = logic === 'AND';
    const conditionResults = [];

    for (const cond of conditions) {
      const match = evaluateConditionItem(cond, context);
      conditionResults.push({
        field: cond.field,
        operator: cond.operator,
        expected: cond.value,
        match
      });

      if (logic === 'AND') {
        if (!match) {
          groupPassed = false;
        }
      } else if (logic === 'OR') {
        if (match) {
          groupPassed = true;
        }
      }
    }

    const detailsStr = conditionResults
      .map((r) => `${r.field} ${r.operator} "${r.expected}" -> ${r.match ? 'MATCH' : 'MISMATCH'}`)
      .join(logic === 'AND' ? ' AND ' : ' OR ');

    steps.push({
      stepNumber: 2,
      type: 'condition_evaluated',
      title: `Condition Group ${gIdx + 1} (${logic})`,
      status: groupPassed ? 'passed' : 'failed',
      details: detailsStr
    });

    // Between groups we treat as AND
    if (!groupPassed) {
      overallPassed = false;
    }
  }

  return {
    passed: overallPassed,
    evaluationSteps: steps
  };
}
