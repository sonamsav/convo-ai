import express from 'express';
import { getAgents, getAgentById, updateAgentStatus } from '../controllers/agentController.js';

const router = express.Router();

router.get('/', getAgents);
router.get('/:id', getAgentById);
router.put('/:id/status', updateAgentStatus);

export default router;
