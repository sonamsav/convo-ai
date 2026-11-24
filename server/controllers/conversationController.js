import { getSocketIO } from '../socket.js';

export let inMemoryConversations = [
  {
    id: 'conv-101',
    ticketNumber: 'CNV-101',
    customerId: 'cust-1',
    customerName: 'Eleanor Vance',
    customerEmail: 'eleanor.vance@acme.org',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    assignedAgentId: 'agent-1',
    assignedTeamId: 'team-enterprise',
    status: 'open',
    priority: 'urgent',
    channel: 'web',
    subject: 'Critical: Webhook HMAC verification failure on production payloads',
    lastMessage: 'We are seeing sporadic 401 signature mismatches since the v2.4 upgrade.',
    lastMessageTimestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unreadCount: 1,
    sentiment: 'negative',
    slaBreached: false,
    tags: ['Security', 'Webhook', 'Enterprise'],
  },
  {
    id: 'conv-102',
    ticketNumber: 'CNV-102',
    customerId: 'cust-2',
    customerName: 'David Chen',
    customerEmail: 'd.chen@apextechnologies.io',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    assignedAgentId: 'agent-2',
    assignedTeamId: 'team-billing',
    status: 'pending',
    priority: 'medium',
    channel: 'email',
    subject: 'Inquiry regarding custom ARR discount on annual renewal',
    lastMessage: 'Could you review our quote before Monday morning board review?',
    lastMessageTimestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    unreadCount: 0,
    sentiment: 'neutral',
    slaBreached: false,
    tags: ['Billing', 'Contract'],
  },
  {
    id: 'conv-103',
    ticketNumber: 'CNV-103',
    customerId: 'cust-3',
    customerName: 'Sophia Patel',
    customerEmail: 'sophia@cloudscale.net',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    assignedAgentId: 'agent-4',
    assignedTeamId: 'team-technical',
    status: 'resolved',
    priority: 'high',
    channel: 'whatsapp',
    subject: 'Docker container memory limits during batch PDF exports',
    lastMessage: 'The memory swap settings resolved the OOM killed error. Thank you!',
    lastMessageTimestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    unreadCount: 0,
    sentiment: 'positive',
    slaBreached: false,
    tags: ['Technical', 'Resolved'],
  },
];

export let inMemoryMessages = {
  'conv-101': [
    {
      id: 'msg-1',
      conversationId: 'conv-101',
      senderId: 'cust-1',
      senderName: 'Eleanor Vance',
      senderType: 'customer',
      content: 'Hello, our engineering team is encountering HMAC SHA-256 verification failures on the new webhook endpoints.',
      status: 'read',
      isInternalNote: false,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-2',
      conversationId: 'conv-101',
      senderId: 'agent-1',
      senderName: 'Sarah Connor',
      senderType: 'agent',
      content: 'Hi Eleanor, looking into the raw payload digest now. Let me inspect the signing secret rotation log.',
      status: 'delivered',
      isInternalNote: false,
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    },
  ],
  'conv-102': [
    {
      id: 'msg-3',
      conversationId: 'conv-102',
      senderId: 'cust-2',
      senderName: 'David Chen',
      senderType: 'customer',
      content: 'Could you review our quote before Monday morning board review?',
      status: 'delivered',
      isInternalNote: false,
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
  ],
};

export async function getConversations(req, res, next) {
  try {
    const { status = 'all', priority = 'all', channel = 'all', agentId = 'all', search = '' } = req.query;

    let list = [...inMemoryConversations];

    if (status !== 'all') list = list.filter((c) => c.status === status);
    if (priority !== 'all') list = list.filter((c) => c.priority === priority);
    if (channel !== 'all') list = list.filter((c) => c.channel === channel);
    if (agentId !== 'all') list = list.filter((c) => c.assignedAgentId === agentId);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.customerName.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.ticketNumber.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      data: {
        conversations: list,
        total: list.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getConversationDetail(req, res, next) {
  try {
    const { id } = req.params;
    const conversation = inMemoryConversations.find((c) => c.id === id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { message: `Conversation ${id} not found.` },
      });
    }

    const messages = inMemoryMessages[id] || [];
    res.json({
      success: true,
      data: {
        conversation,
        messages,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { id } = req.params;
    const { content, senderId, senderName, senderType = 'agent', isInternalNote = false } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message content is required.' },
      });
    }

    const conversation = inMemoryConversations.find((c) => c.id === id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { message: `Conversation ${id} not found.` },
      });
    }

    const newMsg = {
      id: `msg-${Date.now()}`,
      conversationId: id,
      senderId: senderId || 'agent-1',
      senderName: senderName || 'Sarah Connor',
      senderType,
      content,
      status: 'delivered',
      isInternalNote: !!isInternalNote,
      timestamp: new Date().toISOString(),
    };

    if (!inMemoryMessages[id]) inMemoryMessages[id] = [];
    inMemoryMessages[id].push(newMsg);

    if (!isInternalNote) {
      conversation.lastMessage = content;
      conversation.lastMessageTimestamp = newMsg.timestamp;
    }

    // Broadcast over Socket.IO if connected
    const io = getSocketIO();
    if (io) {
      io.to(`conversation_${id}`).emit('new_message', newMsg);
      io.emit('conversation_updated', conversation);
    }

    res.status(201).json({
      success: true,
      data: { message: newMsg, conversation },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateConversationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, priority, assignedAgentId } = req.body;

    const conversation = inMemoryConversations.find((c) => c.id === id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { message: `Conversation ${id} not found.` },
      });
    }

    if (status) conversation.status = status;
    if (priority) conversation.priority = priority;
    if (assignedAgentId !== undefined) conversation.assignedAgentId = assignedAgentId;

    const io = getSocketIO();
    if (io) {
      io.to(`conversation_${id}`).emit('conversation_updated', conversation);
      io.emit('conversation_updated', conversation);
    }

    res.json({
      success: true,
      data: { conversation },
    });
  } catch (err) {
    next(err);
  }
}
