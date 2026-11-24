import express from 'express';
import {
  getConversations,
  getConversationDetail,
  sendMessage,
  updateConversationStatus,
} from '../controllers/conversationController.js';

const router = express.Router();

router.get('/', getConversations);
router.get('/:id', getConversationDetail);
router.post('/:id/messages', sendMessage);
router.put('/:id', updateConversationStatus);

export default router;
