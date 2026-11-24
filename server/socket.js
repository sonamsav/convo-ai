import { Server } from 'socket.io';

let ioInstance = null;

export function initSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.IO] Client connected: ${socket.id}`);

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      const room = `conversation_${conversationId}`;
      socket.join(room);
      console.log(`💬 [Socket.IO] ${socket.id} joined room: ${room}`);
      socket.emit('joined_room', { room, conversationId });
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      const room = `conversation_${conversationId}`;
      socket.leave(room);
      console.log(`🚪 [Socket.IO] ${socket.id} left room: ${room}`);
    });

    // Handle incoming chat message
    socket.on('send_message', (payload, callback) => {
      const { conversationId, content, senderId, senderName, senderType, isInternalNote } = payload;
      const room = `conversation_${conversationId}`;

      const messageObj = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        conversationId,
        content,
        senderId: senderId || 'agent-1',
        senderName: senderName || 'Support Agent',
        senderType: senderType || 'agent',
        isInternalNote: !!isInternalNote,
        status: 'delivered',
        timestamp: new Date().toISOString(),
      };

      // Broadcast to room members
      io.to(room).emit('new_message', messageObj);

      // Return delivery confirmation to sender
      if (typeof callback === 'function') {
        callback({ success: true, message: messageObj });
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId, senderName }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        conversationId,
        senderName: senderName || 'User',
        isTyping: true,
      });
    });

    socket.on('typing_stop', ({ conversationId, senderName }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        conversationId,
        senderName: senderName || 'User',
        isTyping: false,
      });
    });

    // Agent availability status update
    socket.on('update_agent_status', ({ agentId, status }) => {
      io.emit('agent_status_changed', { agentId, status, timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ [Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  ioInstance = io;
  return io;
}

export function getSocketIO() {
  return ioInstance;
}
