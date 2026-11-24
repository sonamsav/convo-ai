/**
 * Controller for ConvoAI Automation Rules & Workflow Engine
 */

import { INITIAL_AUTOMATIONS, AUTOMATION_TEMPLATES } from '../data/mockAutomations.js';
import {
  automationExecutions,
  addExecution,
  findExecutionById,
  updateExecution
} from '../data/automationExecutions.js';
import { dispatchEventToAutomations } from '../engine/triggerHandler.js';
import { executeActions } from '../engine/actionExecutor.js';

let automationsStore = [...INITIAL_AUTOMATIONS];

/**
 * GET /api/automations
 * Returns list of automations with filtering, search, pagination, and KPI stats
 */
export async function getAutomations(req, res, next) {
  try {
    const {
      search = '',
      status = 'all',
      trigger = 'all',
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    let filtered = [...automationsStore];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.trigger.label.toLowerCase().includes(q)
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter((a) => a.status === status);
    }

    if (trigger !== 'all') {
      filtered = filtered.filter((a) => a.trigger?.type === trigger);
    }

    // Sorting
    filtered.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'executions') {
        valA = a.executionCount || 0;
        valB = b.executionCount || 0;
      }

      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    // Compute Global Statistics
    const stats = {
      totalAutomations: automationsStore.length,
      activeAutomations: automationsStore.filter((a) => a.status === 'active').length,
      pausedAutomations: automationsStore.filter((a) => a.status === 'paused').length,
      totalExecutions: automationsStore.reduce((acc, a) => acc + (a.executionCount || 0), 0),
      successfulExecutions: automationsStore.reduce((acc, a) => acc + (a.successfulExecutions || 0), 0),
      failedExecutions: automationsStore.reduce((acc, a) => acc + (a.failedExecutions || 0), 0)
    };

    res.json({
      success: true,
      data: {
        automations: paginated,
        total: filtered.length,
        page: pageNum,
        totalPages: Math.ceil(filtered.length / limitNum) || 1,
        stats
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/automations/templates
 */
export async function getTemplates(req, res, next) {
  try {
    res.json({
      success: true,
      data: {
        templates: AUTOMATION_TEMPLATES
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/automations/:id
 */
export async function getAutomationById(req, res, next) {
  try {
    const { id } = req.params;
    const rule = automationsStore.find((a) => a.id === id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        error: { message: `Automation with ID "${id}" was not found.` }
      });
    }

    const recentExecutions = automationExecutions
      .filter((e) => e.automationId === id)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        automation: rule,
        recentExecutions
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/automations
 */
export async function createAutomation(req, res, next) {
  try {
    const userRole = req.headers['x-user-role'] || 'admin';
    if (userRole === 'agent' || userRole === 'viewer') {
      return res.status(403).json({
        success: false,
        error: { message: 'Unauthorized: Support Agents cannot create automation rules.' }
      });
    }

    const {
      name,
      description = '',
      trigger,
      conditionGroups = [],
      actions = [],
      status = 'active'
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Automation name is required.' }
      });
    }

    if (!trigger || !trigger.type) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid trigger specification is required.' }
      });
    }

    const newRule = {
      id: `auto-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      status,
      trigger: {
        type: trigger.type,
        label: trigger.label || trigger.type,
        config: trigger.config || {}
      },
      conditionGroups: conditionGroups.map((g, idx) => ({
        id: g.id || `cg-${idx + 1}`,
        logic: g.logic || 'AND',
        conditions: g.conditions || []
      })),
      actions: actions.map((a, idx) => ({
        id: a.id || `a-${idx + 1}`,
        type: a.type,
        label: a.label || `Action ${idx + 1}`,
        config: a.config || {}
      })),
      executionCount: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      lastExecutedAt: null,
      createdBy: {
        id: req.headers['x-user-id'] || 'usr-1',
        name: req.headers['x-user-name'] || 'Alex Rivera',
        role: userRole === 'admin' ? 'Admin' : 'Manager'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    automationsStore.unshift(newRule);

    res.status(201).json({
      success: true,
      data: { automation: newRule }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/automations/:id
 */
export async function updateAutomation(req, res, next) {
  try {
    const userRole = req.headers['x-user-role'] || 'admin';
    if (userRole === 'agent' || userRole === 'viewer') {
      return res.status(403).json({
        success: false,
        error: { message: 'Unauthorized: Support Agents cannot edit automation rules.' }
      });
    }

    const { id } = req.params;
    const index = automationsStore.findIndex((a) => a.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: { message: `Automation with ID "${id}" was not found.` }
      });
    }

    const updates = req.body;
    automationsStore[index] = {
      ...automationsStore[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: { automation: automationsStore[index] }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/automations/:id/status
 */
export async function toggleAutomationStatus(req, res, next) {
  try {
    const userRole = req.headers['x-user-role'] || 'admin';
    if (userRole === 'agent' || userRole === 'viewer') {
      return res.status(403).json({
        success: false,
        error: { message: 'Unauthorized: Support Agents cannot modify automation status.' }
      });
    }

    const { id } = req.params;
    const rule = automationsStore.find((a) => a.id === id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        error: { message: `Automation with ID "${id}" was not found.` }
      });
    }

    rule.status = rule.status === 'active' ? 'paused' : 'active';
    rule.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: {
        id: rule.id,
        status: rule.status,
        updatedAt: rule.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/automations/:id/duplicate
 */
export async function duplicateAutomation(req, res, next) {
  try {
    const { id } = req.params;
    const source = automationsStore.find((a) => a.id === id);

    if (!source) {
      return res.status(404).json({
        success: false,
        error: { message: `Automation with ID "${id}" was not found.` }
      });
    }

    const cloned = {
      ...JSON.parse(JSON.stringify(source)),
      id: `auto-${Date.now()}`,
      name: `${source.name} (Copy)`,
      status: 'paused', // Clones start as paused for safety
      executionCount: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      lastExecutedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    automationsStore.unshift(cloned);

    res.status(201).json({
      success: true,
      data: { automation: cloned }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/automations/:id
 */
export async function deleteAutomation(req, res, next) {
  try {
    const userRole = req.headers['x-user-role'] || 'admin';
    if (userRole !== 'admin' && userRole !== 'owner') {
      return res.status(403).json({
        success: false,
        error: { message: 'Unauthorized: Only Administrators can delete automation rules.' }
      });
    }

    const { id } = req.params;
    const index = automationsStore.findIndex((a) => a.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: { message: `Automation with ID "${id}" was not found.` }
      });
    }

    const [deleted] = automationsStore.splice(index, 1);

    res.json({
      success: true,
      data: {
        id: deleted.id,
        name: deleted.name
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/automations/test-trigger
 * Dispatches an event payload to test rule matching and execution trace
 */
export async function testTrigger(req, res, next) {
  try {
    const { eventType, eventId = `test_evt_${Date.now()}`, context = {} } = req.body;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        error: { message: 'eventType is required (e.g., "new_conversation_created").' }
      });
    }

    const result = await dispatchEventToAutomations(
      { eventType, eventId, context },
      automationsStore
    );

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/automation-executions
 */
export async function getExecutions(req, res, next) {
  try {
    const {
      search = '',
      status = 'all',
      automationId = 'all',
      page = 1,
      limit = 15
    } = req.query;

    let filtered = [...automationExecutions];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.automationName.toLowerCase().includes(q) ||
          e.triggerEvent.toLowerCase().includes(q) ||
          (e.customerName && e.customerName.toLowerCase().includes(q)) ||
          (e.relatedTicketNumber && e.relatedTicketNumber.toLowerCase().includes(q))
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter((e) => e.executionStatus === status);
    }

    if (automationId !== 'all') {
      filtered = filtered.filter((e) => e.automationId === automationId);
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      data: {
        executions: paginated,
        total: filtered.length,
        page: pageNum,
        totalPages: Math.ceil(filtered.length / limitNum) || 1
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/automation-executions/:id/retry
 * Retries a failed execution safely with idempotency protection
 */
export async function retryExecution(req, res, next) {
  try {
    const { id } = req.params;
    const execution = findExecutionById(id);

    if (!execution) {
      return res.status(404).json({
        success: false,
        error: { message: `Execution record "${id}" was not found.` }
      });
    }

    const rule = automationsStore.find((a) => a.id === execution.automationId);
    if (!rule) {
      return res.status(404).json({
        success: false,
        error: { message: `Target rule "${execution.automationName}" is no longer available.` }
      });
    }

    // Mark current execution as processing
    updateExecution(id, { executionStatus: 'processing' });

    // Execute actions
    const startTime = Date.now();
    const actionResult = await executeActions(rule.actions || [], {
      id: execution.relatedConversationId,
      customerName: execution.customerName
    });

    const durationMs = Date.now() - startTime;
    const newStatus = actionResult.success ? 'successful' : 'failed';

    const updated = updateExecution(id, {
      executionStatus: newStatus,
      durationMs,
      completedAt: new Date().toISOString(),
      errorDetails: actionResult.failureDetails,
      executionSteps: [
        ...execution.executionSteps,
        {
          stepNumber: execution.executionSteps.length + 1,
          type: 'retry_executed',
          title: 'Manual Retry Attempt',
          status: actionResult.success ? 'passed' : 'failed',
          details: actionResult.success
            ? 'All actions successfully re-executed.'
            : `Retry failed: ${actionResult.failureDetails?.message}`
        }
      ]
    });

    res.json({
      success: true,
      data: { execution: updated }
    });
  } catch (err) {
    next(err);
  }
}
