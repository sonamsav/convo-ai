import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import {
  Conversation,
  Message,
  InboxAgent,
  InboxCategory,
  InboxFilterState,
  Customer,
} from '@/features/inbox/types/inbox';
import {
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_INBOX_AGENTS,
} from '@/features/inbox/data/mockInboxData';
import { RootState } from '../store';

interface InboxState {
  conversations: Conversation[];
  selectedConversationId: string | null;
  messages: Record<string, Message[]>;
  agents: InboxAgent[];
  filters: InboxFilterState;
  customerContextOpen: boolean;
  aiPanelOpen: boolean;
  composerMode: 'reply' | 'note';
  isTypingMap: Record<string, boolean>;
}

const initialFilters: InboxFilterState = {
  category: 'all',
  searchQuery: '',
  status: 'all',
  priority: 'all',
  channel: 'all',
  assignedAgentId: 'all',
  sortBy: 'latest',
};

const initialState: InboxState = {
  conversations: MOCK_CONVERSATIONS,
  selectedConversationId: MOCK_CONVERSATIONS[0]?.id || null,
  messages: MOCK_MESSAGES,
  agents: MOCK_INBOX_AGENTS,
  filters: initialFilters,
  customerContextOpen: true,
  aiPanelOpen: false,
  composerMode: 'reply',
  isTypingMap: {},
};

export const inboxSlice = createSlice({
  name: 'inbox',
  initialState,
  reducers: {
    selectConversation: (state, action: PayloadAction<string>) => {
      state.selectedConversationId = action.payload;
      // Mark as read when selected
      const convo = state.conversations.find((c) => c.id === action.payload);
      if (convo && convo.unreadCount > 0) {
        convo.unreadCount = 0;
      }
    },
    setCategory: (state, action: PayloadAction<InboxCategory>) => {
      state.filters.category = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
    },
    setPriorityFilter: (state, action: PayloadAction<string>) => {
      state.filters.priority = action.payload;
    },
    setChannelFilter: (state, action: PayloadAction<string>) => {
      state.filters.channel = action.payload;
    },
    setAssignedAgentFilter: (state, action: PayloadAction<string>) => {
      state.filters.assignedAgentId = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'latest' | 'oldest' | 'priority'>) => {
      state.filters.sortBy = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },
    setComposerMode: (state, action: PayloadAction<'reply' | 'note'>) => {
      state.composerMode = action.payload;
    },
    setCustomerContextOpen: (state, action: PayloadAction<boolean>) => {
      state.customerContextOpen = action.payload;
    },
    toggleCustomerContext: (state) => {
      state.customerContextOpen = !state.customerContextOpen;
    },
    setAiPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.aiPanelOpen = action.payload;
    },
    toggleAiPanel: (state) => {
      state.aiPanelOpen = !state.aiPanelOpen;
    },
    setTypingState: (
      state,
      action: PayloadAction<{ conversationId: string; isTyping: boolean }>
    ) => {
      state.isTypingMap[action.payload.conversationId] = action.payload.isTyping;
    },
    sendMessage: (state, action: PayloadAction<Message>) => {
      const msg = action.payload;
      if (!state.messages[msg.conversationId]) {
        state.messages[msg.conversationId] = [];
      }
      state.messages[msg.conversationId].push(msg);

      // Update conversation last message preview
      const convo = state.conversations.find((c) => c.id === msg.conversationId);
      if (convo) {
        convo.lastMessage = {
          content: msg.content,
          timestamp: 'Just now',
          senderName: msg.sender.name,
          isInternal: Boolean(msg.isInternalNote),
        };
        convo.updatedAt = 'Just now';
      }
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{ conversationId: string; messageId: string; status: Message['status'] }>
    ) => {
      const list = state.messages[action.payload.conversationId];
      if (list) {
        const target = list.find((m) => m.id === action.payload.messageId);
        if (target) {
          target.status = action.payload.status;
        }
      }
    },
    assignAgent: (
      state,
      action: PayloadAction<{ conversationId: string; agent: InboxAgent | null }>
    ) => {
      const convo = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (convo) {
        convo.assignedAgent = action.payload.agent;
        // Inject system event message
        if (!state.messages[convo.id]) {
          state.messages[convo.id] = [];
        }
        state.messages[convo.id].push({
          id: `sys_${Date.now()}`,
          conversationId: convo.id,
          sender: { type: 'system', id: 'sys', name: 'System' },
          content: action.payload.agent
            ? `Conversation assigned to ${action.payload.agent.name}.`
            : `Conversation unassigned.`,
          timestamp: 'Just now',
        });
      }
    },
    updateConversationStatus: (
      state,
      action: PayloadAction<{ conversationId: string; status: 'open' | 'pending' | 'resolved' }>
    ) => {
      const convo = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (convo) {
        const oldStatus = convo.status;
        convo.status = action.payload.status;
        if (!state.messages[convo.id]) {
          state.messages[convo.id] = [];
        }
        state.messages[convo.id].push({
          id: `sys_${Date.now()}`,
          conversationId: convo.id,
          sender: { type: 'system', id: 'sys', name: 'System' },
          content: `Status changed from ${oldStatus.toUpperCase()} to ${action.payload.status.toUpperCase()}.`,
          timestamp: 'Just now',
        });
      }
    },
    updateConversationPriority: (
      state,
      action: PayloadAction<{ conversationId: string; priority: 'urgent' | 'high' | 'medium' | 'low' }>
    ) => {
      const convo = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (convo) {
        convo.priority = action.payload.priority;
      }
    },
    addTag: (state, action: PayloadAction<{ conversationId: string; tag: string }>) => {
      const convo = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (convo && !convo.tags.includes(action.payload.tag)) {
        convo.tags.push(action.payload.tag);
      }
    },
    removeTag: (state, action: PayloadAction<{ conversationId: string; tag: string }>) => {
      const convo = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (convo) {
        convo.tags = convo.tags.filter((t) => t !== action.payload.tag);
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const convo = state.conversations.find((c) => c.id === action.payload);
      if (convo) {
        convo.unreadCount = 0;
      }
    },
    markAsUnread: (state, action: PayloadAction<string>) => {
      const convo = state.conversations.find((c) => c.id === action.payload);
      if (convo) {
        convo.unreadCount = Math.max(1, convo.unreadCount + 1);
      }
    },
    updateCustomerDetails: (
      state,
      action: PayloadAction<{ customerId: string; updates: Partial<Customer> }>
    ) => {
      state.conversations.forEach((c) => {
        if (c.customer.id === action.payload.customerId) {
          c.customer = { ...c.customer, ...action.payload.updates };
        }
      });
    },
    addCustomerTag: (
      state,
      action: PayloadAction<{ customerId: string; tag: string }>
    ) => {
      state.conversations.forEach((c) => {
        if (c.customer.id === action.payload.customerId && !c.customer.tags.includes(action.payload.tag)) {
          c.customer.tags.push(action.payload.tag);
        }
      });
    },
    removeCustomerTag: (
      state,
      action: PayloadAction<{ customerId: string; tag: string }>
    ) => {
      state.conversations.forEach((c) => {
        if (c.customer.id === action.payload.customerId) {
          c.customer.tags = c.customer.tags.filter((t) => t !== action.payload.tag);
        }
      });
    },
  },
});

export const {
  selectConversation,
  setCategory,
  setSearchQuery,
  setStatusFilter,
  setPriorityFilter,
  setChannelFilter,
  setAssignedAgentFilter,
  setSortBy,
  resetFilters,
  setComposerMode,
  setCustomerContextOpen,
  toggleCustomerContext,
  setAiPanelOpen,
  toggleAiPanel,
  setTypingState,
  sendMessage,
  updateMessageStatus,
  assignAgent,
  updateConversationStatus,
  updateConversationPriority,
  addTag,
  removeTag,
  markAsRead,
  markAsUnread,
  updateCustomerDetails,
  addCustomerTag,
  removeCustomerTag,
} = inboxSlice.actions;

// Selectors
export const selectInboxState = (state: RootState) => state.inbox;

export const selectSelectedConversation = createSelector(
  [selectInboxState],
  (inbox) => inbox.conversations.find((c) => c.id === inbox.selectedConversationId) || null
);

export const selectCurrentMessages = createSelector(
  [selectInboxState],
  (inbox) => (inbox.selectedConversationId ? inbox.messages[inbox.selectedConversationId] || [] : [])
);

export const selectFilteredConversations = createSelector(
  [selectInboxState, (state: RootState) => state.auth.user],
  (inbox, currentUser) => {
    const { conversations, filters } = inbox;
    const currentUserId = currentUser?.id || 'usr_enterprise_01';

    return conversations
      .filter((c) => {
        // Category filter
        switch (filters.category) {
          case 'my':
            if (c.assignedAgent?.id !== currentUserId) return false;
            break;
          case 'unassigned':
            if (c.assignedAgent !== null) return false;
            break;
          case 'unread':
            if (c.unreadCount === 0) return false;
            break;
          case 'open':
            if (c.status !== 'open') return false;
            break;
          case 'pending':
            if (c.status !== 'pending') return false;
            break;
          case 'resolved':
            if (c.status !== 'resolved') return false;
            break;
          case 'high_priority':
            if (c.priority !== 'urgent' && c.priority !== 'high') return false;
            break;
          case 'all':
          default:
            break;
        }

        // Search filter (customer name, email, subject, ticket number)
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchName = c.customer.name.toLowerCase().includes(q);
          const matchEmail = c.customer.email.toLowerCase().includes(q);
          const matchSubject = c.subject.toLowerCase().includes(q);
          const matchTicket = c.ticketNumber.toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchSubject && !matchTicket) {
            return false;
          }
        }

        // Status dropdown filter
        if (filters.status !== 'all' && c.status !== filters.status) {
          return false;
        }

        // Priority dropdown filter
        if (filters.priority !== 'all' && c.priority !== filters.priority) {
          return false;
        }

        // Channel filter
        if (filters.channel !== 'all' && c.channel !== filters.channel) {
          return false;
        }

        // Assigned Agent filter
        if (filters.assignedAgentId !== 'all') {
          if (filters.assignedAgentId === 'unassigned') {
            if (c.assignedAgent !== null) return false;
          } else if (c.assignedAgent?.id !== filters.assignedAgentId) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'priority') {
          const weight = { urgent: 4, high: 3, medium: 2, low: 1 };
          return weight[b.priority] - weight[a.priority];
        }
        if (filters.sortBy === 'oldest') {
          return a.id.localeCompare(b.id);
        }
        // latest default
        return b.id.localeCompare(a.id);
      });
  }
);

export const selectCategoryCounts = createSelector(
  [selectInboxState, (state: RootState) => state.auth.user],
  (inbox, currentUser) => {
    const { conversations } = inbox;
    const currentUserId = currentUser?.id || 'usr_enterprise_01';

    return {
      all: conversations.length,
      my: conversations.filter((c) => c.assignedAgent?.id === currentUserId).length,
      unassigned: conversations.filter((c) => c.assignedAgent === null).length,
      unread: conversations.filter((c) => c.unreadCount > 0).length,
      open: conversations.filter((c) => c.status === 'open').length,
      pending: conversations.filter((c) => c.status === 'pending').length,
      resolved: conversations.filter((c) => c.status === 'resolved').length,
      high_priority: conversations.filter((c) => c.priority === 'urgent' || c.priority === 'high').length,
    };
  }
);

export default inboxSlice.reducer;
