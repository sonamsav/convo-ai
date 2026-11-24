import { io, Socket } from 'socket.io-client';
import { APP_CONFIG } from '@/constants/config';
import { Message, Conversation } from '@/features/inbox/types/inbox';
import { storage } from '@/utils/storage';

export type MessageCallback = (message: Message) => void;
export type TypingCallback = (payload: { conversationId: string; senderName: string; isTyping: boolean }) => void;
export type ConversationUpdateCallback = (conversation: Partial<Conversation> & { id: string }) => void;

export interface ISocketService {
  isConnected: boolean;
  connect(authToken?: string): void;
  disconnect(): void;
  joinConversation(conversationId: string): void;
  leaveConversation(conversationId: string): void;
  sendMessage(message: Message, callback?: (res: any) => void): void;
  sendTyping(conversationId: string, isTyping: boolean, senderName?: string): void;
  onMessage(callback: MessageCallback): () => void;
  onTyping(callback: TypingCallback): () => void;
  onConversationUpdate(callback: ConversationUpdateCallback): () => void;
}

class RealSocketService implements ISocketService {
  public isConnected: boolean = false;
  private socket: Socket | null = null;
  private messageListeners: Set<MessageCallback> = new Set();
  private typingListeners: Set<TypingCallback> = new Set();
  private conversationListeners: Set<ConversationUpdateCallback> = new Set();
  private activeConversationId: string | null = null;

  connect(authToken?: string): void {
    if (this.socket && this.socket.connected) return;

    const token = authToken || storage.get<string | null>('convoai_auth_token', null);
    const socketUrl = APP_CONFIG.socketUrl || 'http://localhost:5000';

    try {
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.info(`[ConvoAI Real-Time] Connected to Socket.IO server: ${this.socket?.id}`);

        // Rejoin active conversation room if reconnecting
        if (this.activeConversationId) {
          this.joinConversation(this.activeConversationId);
        }
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        console.warn(`[ConvoAI Real-Time] Socket disconnected: ${reason}`);
      });

      this.socket.on('connect_error', (err) => {
        console.warn(`[ConvoAI Real-Time] Connection error: ${err.message}. Retrying...`);
      });

      // Handle inbound message
      this.socket.on('new_message', (message: Message) => {
        this.messageListeners.forEach((listener) => {
          try {
            listener(message);
          } catch (e) {
            console.error('[Socket] Error in message listener:', e);
          }
        });
      });

      // Handle user typing indicators
      this.socket.on(
        'user_typing',
        (payload: { conversationId: string; senderName: string; isTyping: boolean }) => {
          this.typingListeners.forEach((listener) => {
            try {
              listener(payload);
            } catch (e) {
              console.error('[Socket] Error in typing listener:', e);
            }
          });
        }
      );

      // Handle conversation updates
      this.socket.on('conversation_updated', (conv: Partial<Conversation> & { id: string }) => {
        this.conversationListeners.forEach((listener) => {
          try {
            listener(conv);
          } catch (e) {
            console.error('[Socket] Error in conversation listener:', e);
          }
        });
      });
    } catch (err) {
      console.warn('[ConvoAI Real-Time] Failed to initialize socket connection:', err);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.activeConversationId = null;
  }

  joinConversation(conversationId: string): void {
    this.activeConversationId = conversationId;
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  leaveConversation(conversationId: string): void {
    if (this.activeConversationId === conversationId) {
      this.activeConversationId = null;
    }
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  sendMessage(message: Message, callback?: (res: any) => void): void {
    // 1. Immediately invoke local listeners for zero perceived latency
    this.messageListeners.forEach((listener) => listener(message));

    // 2. Emit to real Socket.IO server
    if (this.socket && this.socket.connected) {
      this.socket.emit('send_message', message, (response: any) => {
        if (callback) callback(response);
      });
    }
  }

  sendTyping(conversationId: string, isTyping: boolean, senderName = 'Support Agent'): void {
    if (this.socket && this.socket.connected) {
      const event = isTyping ? 'typing_start' : 'typing_stop';
      this.socket.emit(event, { conversationId, senderName });
    }
  }

  onMessage(callback: MessageCallback): () => void {
    this.messageListeners.add(callback);
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  onTyping(callback: TypingCallback): () => void {
    this.typingListeners.add(callback);
    return () => {
      this.typingListeners.delete(callback);
    };
  }

  onConversationUpdate(callback: ConversationUpdateCallback): () => void {
    this.conversationListeners.add(callback);
    return () => {
      this.conversationListeners.delete(callback);
    };
  }
}

export const socketService = new RealSocketService();
export default socketService;
