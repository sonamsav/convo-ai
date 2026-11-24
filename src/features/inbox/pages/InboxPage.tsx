import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  selectConversation,
  selectSelectedConversation,
  setStatusFilter,
  setCategory,
  sendMessage,
  updateMessageStatus,
  setTypingState,
  toggleCustomerContext,
} from '@/app/store/slices/inboxSlice';
import { socketService } from '@/services/socket/socketService';
import { ConversationFilterBar } from '../components/ConversationFilterBar';
import { ConversationListPanel } from '../components/ConversationListPanel';
import { ChatWindowPanel } from '../components/ChatWindowPanel';
import { CustomerContextPanel } from '../components/CustomerContextPanel';
import { Drawer } from '@/components/ui';
import { Message, Conversation } from '../types/inbox';

export const InboxPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedConversation = useAppSelector(selectSelectedConversation);
  const isCustomerContextOpen = useAppSelector((state) => state.inbox.customerContextOpen);
  const conversations = useAppSelector((state) => state.inbox.conversations);

  // Sync with URL parameters (e.g., from Dashboard links: ?ticket=CNV-8942 or ?status=open)
  useEffect(() => {
    const ticketParam = searchParams.get('ticket');
    const statusParam = searchParams.get('status');

    if (ticketParam) {
      const match = conversations.find((c) => c.ticketNumber === ticketParam);
      if (match) {
        dispatch(selectConversation(match.id));
      }
    }

    if (statusParam && ['open', 'pending', 'resolved'].includes(statusParam)) {
      dispatch(setStatusFilter(statusParam));
      dispatch(setCategory(statusParam as any));
    }
  }, [searchParams, conversations, dispatch]);

  // Connect socket service & listen for simulated real-time events
  useEffect(() => {
    socketService.connect();

    const unsubMsg = socketService.onMessage((msg: Message) => {
      // If message is an update (e.g. status changed from sending -> delivered)
      dispatch(
        updateMessageStatus({
          conversationId: msg.conversationId,
          messageId: msg.id,
          status: msg.status,
        })
      );
      // If it's a customer incoming reply
      if (msg.sender.type === 'customer') {
        dispatch(sendMessage(msg));
      }
    });

    const unsubTyping = socketService.onTyping((payload) => {
      dispatch(
        setTypingState({
          conversationId: payload.conversationId,
          isTyping: payload.isTyping,
        })
      );
    });

    return () => {
      unsubMsg();
      unsubTyping();
      socketService.disconnect();
    };
  }, [dispatch]);

  // Handle switching rooms when selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      socketService.joinConversation(selectedConversation.id);
    }
  }, [selectedConversation]);

  const handleSelectConversation = (convo: Conversation) => {
    dispatch(selectConversation(convo.id));
    setSearchParams({ ticket: convo.ticketNumber });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] min-h-[640px] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-card overflow-hidden">
      {/* 1. Category Tabs Navigation Bar */}
      <ConversationFilterBar />

      {/* 2. Responsive 3-Panel Main Work Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Panel: Conversation List (Visible on desktop/tablet, hidden on mobile when conversation is active) */}
        <div
          className={`w-full lg:w-80 xl:w-96 shrink-0 h-full ${
            selectedConversation ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <ConversationListPanel
            onSelectConversation={handleSelectConversation}
            className="w-full"
          />
        </div>

        {/* Center Panel: Chat Window (Full on mobile when active, flex-1 on tablet/desktop) */}
        <div
          className={`flex-1 min-w-0 h-full ${
            selectedConversation ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <ChatWindowPanel
            conversation={selectedConversation}
            onBackToMobileList={() => dispatch(selectConversation(''))}
            className="w-full"
          />
        </div>

        {/* Right Panel: Customer Context 360 (Inline on large desktop screens >= 1280px) */}
        {selectedConversation && isCustomerContextOpen && (
          <div className="hidden xl:flex w-80 shrink-0 h-full animate-in slide-in-from-right-4 duration-200">
            <CustomerContextPanel
              conversation={selectedConversation}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Tablet & Mobile Slide-over Drawer for Customer Context */}
      {selectedConversation && (
        <div className="xl:hidden">
          <Drawer
            isOpen={isCustomerContextOpen}
            onClose={() => dispatch(toggleCustomerContext())}
            placement="right"
            size="md"
            className="p-0 bg-white dark:bg-slate-900"
          >
            <CustomerContextPanel
              conversation={selectedConversation}
              onClose={() => dispatch(toggleCustomerContext())}
              className="w-full border-none"
            />
          </Drawer>
        </div>
      )}
    </div>
  );
};

export default InboxPage;
