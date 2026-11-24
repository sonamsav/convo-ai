/**
 * Automated Verification Test Suite for ConvoAI Automation & Workflow Engine
 */

import {
  getAutomations,
  getTemplates,
  getAutomationById,
  createAutomation,
  updateAutomation,
  toggleAutomationStatus,
  duplicateAutomation,
  deleteAutomation,
  testTrigger,
  getExecutions,
  retryExecution
} from './controllers/automationController.js';
import { evaluateConditionGroups } from './engine/conditionEvaluator.js';
import { executeActions } from './engine/actionExecutor.js';

function createMockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };
}

async function runTests() {
  console.log('🧪 Starting ConvoAI Automation Rules & Workflow Engine Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(title, condition, extraInfo = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title} ${extraInfo}`);
      failed++;
    }
  }

  // TEST 1: Get Automations & KPI Stats
  try {
    const req = { query: {} };
    const res = createMockRes();
    await getAutomations(req, res, (err) => { throw err; });
    assert(
      'GET /api/automations returns rules and KPI statistics',
      res.data?.success === true &&
      Array.isArray(res.data?.data?.automations) &&
      res.data?.data?.stats?.totalAutomations >= 5 &&
      res.data?.data?.stats?.activeAutomations > 0
    );
  } catch (e) {
    assert('GET /api/automations', false, e.message);
  }

  // TEST 2: Get Pre-Built Templates
  try {
    const req = {};
    const res = createMockRes();
    await getTemplates(req, res, (err) => { throw err; });
    assert(
      'GET /api/automations/templates returns 5 ready-made templates',
      res.data?.success === true &&
      res.data?.data?.templates?.length === 5 &&
      res.data?.data?.templates.some((t) => t.id === 'tpl-1') &&
      res.data?.data?.templates.some((t) => t.id === 'tpl-3')
    );
  } catch (e) {
    assert('GET /api/automations/templates', false, e.message);
  }

  // TEST 3: Create New Automation
  let createdRuleId = null;
  try {
    const req = {
      headers: { 'x-user-role': 'admin', 'x-user-name': 'Alex Rivera' },
      body: {
        name: 'Auto-VIP Triage on WhatsApp',
        description: 'Immediately routes WhatsApp inquiries from VIP tier to priority queue.',
        status: 'active',
        trigger: {
          type: 'new_conversation_created',
          label: 'New Conversation Created',
          config: { channels: ['WhatsApp'] }
        },
        conditionGroups: [
          {
            logic: 'AND',
            conditions: [
              { field: 'conversation_tags', operator: 'contains', value: 'vip' }
            ]
          }
        ],
        actions: [
          { type: 'change_priority', label: 'Raise to High', config: { priority: 'high' } },
          { type: 'add_tag', label: 'Tag VIP WhatsApp', config: { tag: 'vip-whatsapp' } }
        ]
      }
    };
    const res = createMockRes();
    await createAutomation(req, res, (err) => { throw err; });
    createdRuleId = res.data?.data?.automation?.id;
    assert(
      'POST /api/automations creates new rule with validated trigger & actions',
      res.statusCode === 201 &&
      res.data?.success === true &&
      res.data?.data?.automation?.name === 'Auto-VIP Triage on WhatsApp'
    );
  } catch (e) {
    assert('POST /api/automations', false, e.message);
  }

  // TEST 4: Toggle Status (Active / Paused)
  try {
    const req = {
      params: { id: createdRuleId },
      headers: { 'x-user-role': 'admin' }
    };
    const res = createMockRes();
    await toggleAutomationStatus(req, res, (err) => { throw err; });
    assert(
      'PATCH /api/automations/:id/status toggles status to paused',
      res.data?.success === true && res.data?.data?.status === 'paused'
    );

    // Toggle back to active
    await toggleAutomationStatus(req, res, (err) => { throw err; });
    assert(
      'PATCH /api/automations/:id/status toggles status back to active',
      res.data?.success === true && res.data?.data?.status === 'active'
    );
  } catch (e) {
    assert('PATCH /api/automations/:id/status', false, e.message);
  }

  // TEST 5: Duplicate Automation
  try {
    const req = { params: { id: createdRuleId } };
    const res = createMockRes();
    await duplicateAutomation(req, res, (err) => { throw err; });
    assert(
      'POST /api/automations/:id/duplicate creates a cloned rule',
      res.statusCode === 201 &&
      res.data?.data?.automation?.name.includes('(Copy)') &&
      res.data?.data?.automation?.status === 'paused'
    );
  } catch (e) {
    assert('POST /api/automations/:id/duplicate', false, e.message);
  }

  // TEST 6: Complex AND/OR Condition Evaluator
  try {
    const conditionGroups = [
      {
        logic: 'AND',
        conditions: [
          { field: 'conversation_priority', operator: 'equals', value: 'urgent' },
          { field: 'customer_sentiment', operator: 'equals', value: 'Negative' }
        ]
      }
    ];

    // Matching context
    const matchContext = {
      priority: 'urgent',
      sentiment: 'Negative'
    };
    const evalMatch = evaluateConditionGroups(conditionGroups, matchContext);

    // Failing context
    const failContext = {
      priority: 'low',
      sentiment: 'Negative'
    };
    const evalFail = evaluateConditionGroups(conditionGroups, failContext);

    assert(
      'Condition Evaluator correctly matches AND condition requirements',
      evalMatch.passed === true && evalFail.passed === false
    );
  } catch (e) {
    assert('Condition Evaluator', false, e.message);
  }

  // TEST 7: Action Executor Sequence & State Updates
  try {
    const actions = [
      { type: 'assign_team', label: 'Route to Billing', config: { teamId: 'team-billing', teamName: 'Billing Desk' } },
      { type: 'change_priority', label: 'Set Urgent', config: { priority: 'urgent' } },
      { type: 'add_tag', label: 'Tag Escalate', config: { tag: 'finance-escalation' } },
      { type: 'add_internal_note', label: 'Triage Note', config: { note: 'Auto-routed to billing' } }
    ];

    const initialContext = {
      id: 'conv-test-99',
      tags: ['initial-tag'],
      priority: 'low'
    };

    const actionResult = await executeActions(actions, initialContext);
    assert(
      'Action Executor runs 4 actions in sequence with accurate updatedContext',
      actionResult.success === true &&
      actionResult.steps.length === 4 &&
      actionResult.updatedContext.priority === 'urgent' &&
      actionResult.updatedContext.tags.includes('finance-escalation') &&
      actionResult.updatedContext.assignedTeam?.id === 'team-billing' &&
      actionResult.updatedContext.internalNotes?.length === 1
    );
  } catch (e) {
    assert('Action Executor', false, e.message);
  }

  // TEST 8: Full Event Trigger Dispatching (New Conversation)
  try {
    const req = {
      body: {
        eventType: 'new_conversation_created',
        eventId: `evt_${Date.now()}`,
        context: {
          id: 'conv-live-01',
          ticketNumber: '#CONV-9001',
          channel: 'Web Chat',
          status: 'open',
          tags: ['enterprise'],
          customer: { name: 'Sophia Sterling', email: 'sophia@acmecorp.com' },
          lastMessage: { content: 'Need assistance with enterprise SSO migration.' }
        }
      }
    };
    const res = createMockRes();
    await testTrigger(req, res, (err) => { throw err; });
    assert(
      'POST /api/automations/test-trigger dispatches event and evaluates active rules',
      res.data?.success === true &&
      res.data?.data?.matchedCount > 0 &&
      res.data?.data?.results.some((r) => r.status === 'successful')
    );
  } catch (e) {
    assert('POST /api/automations/test-trigger', false, e.message);
  }

  // TEST 9: Idempotency Protection (Duplicate Event Prevention)
  try {
    const fixedEventId = `idemp_fixed_${Date.now()}`;
    const req1 = {
      body: {
        eventType: 'new_conversation_created',
        eventId: fixedEventId,
        context: {
          id: 'conv-dup-01',
          ticketNumber: '#CONV-DUP1',
          channel: 'Web Chat',
          status: 'open',
          tags: ['enterprise']
        }
      }
    };
    const res1 = createMockRes();
    await testTrigger(req1, res1, (err) => { throw err; });

    // Send identical event again
    const res2 = createMockRes();
    await testTrigger(req1, res2, (err) => { throw err; });

    assert(
      'Idempotency prevents duplicate rule execution on identical event ID',
      res2.data?.data?.results.some((r) => r.status === 'skipped' && r.reason === 'duplicate_event')
    );
  } catch (e) {
    assert('Idempotency check', false, e.message);
  }

  // TEST 10: Execution History & Logs
  try {
    const req = { query: { page: 1, limit: 10 } };
    const res = createMockRes();
    await getExecutions(req, res, (err) => { throw err; });
    assert(
      'GET /api/automation-executions returns execution history with step logs',
      res.data?.success === true &&
      Array.isArray(res.data?.data?.executions) &&
      res.data?.data?.executions.length > 0 &&
      res.data?.data?.executions[0].executionSteps?.length > 0
    );
  } catch (e) {
    assert('GET /api/automation-executions', false, e.message);
  }

  // TEST 11: Retry Failed Execution
  try {
    const req = { params: { id: 'exec-105' } }; // Seeded failed execution
    const res = createMockRes();
    await retryExecution(req, res, (err) => { throw err; });
    assert(
      'POST /api/automation-executions/:id/retry re-evaluates and logs retry attempt',
      res.data?.success === true &&
      res.data?.data?.execution?.id === 'exec-105' &&
      res.data?.data?.execution?.executionSteps.some((s) => s.type === 'retry_executed')
    );
  } catch (e) {
    assert('POST /api/automation-executions/:id/retry', false, e.message);
  }

  // TEST 12: Role-Based Access Control (RBAC)
  try {
    const agentReq = {
      params: { id: createdRuleId },
      headers: { 'x-user-role': 'agent' } // Agent role
    };
    const agentRes = createMockRes();
    await deleteAutomation(agentReq, agentRes, (err) => { throw err; });
    assert(
      'RBAC: Support Agent is blocked with 403 Forbidden on DELETE rule',
      agentRes.statusCode === 403
    );

    const adminReq = {
      params: { id: createdRuleId },
      headers: { 'x-user-role': 'admin' }
    };
    const adminRes = createMockRes();
    await deleteAutomation(adminReq, adminRes, (err) => { throw err; });
    assert(
      'RBAC: Admin successfully deletes automation rule',
      adminRes.statusCode === 200 && adminRes.data?.data?.id === createdRuleId
    );
  } catch (e) {
    assert('RBAC deletion check', false, e.message);
  }

  console.log(`\n========================================`);
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
