import express from 'express';
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
} from '../controllers/automationController.js';

const router = express.Router();

// Automations CRUD & Templates
router.get('/automations', getAutomations);
router.get('/automations/templates', getTemplates);
router.get('/automations/:id', getAutomationById);
router.post('/automations', createAutomation);
router.put('/automations/:id', updateAutomation);
router.patch('/automations/:id/status', toggleAutomationStatus);
router.post('/automations/:id/duplicate', duplicateAutomation);
router.delete('/automations/:id', deleteAutomation);
router.post('/automations/test-trigger', testTrigger);

// Execution History & Retries
router.get('/automation-executions', getExecutions);
router.post('/automation-executions/:id/retry', retryExecution);

export default router;
