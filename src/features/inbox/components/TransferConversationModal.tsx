import React, { useState } from 'react';
import { ArrowRightLeft, UserCheck } from 'lucide-react';
import { Modal, Button, Avatar, Select } from '@/components/ui';
import { InboxAgent } from '../types/inbox';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { assignAgent, sendMessage } from '@/app/store/slices/inboxSlice';
import { addToast } from '@/app/store/slices/toastSlice';

interface TransferConversationModalProps {
  conversationId: string;
  ticketNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TransferConversationModal: React.FC<TransferConversationModalProps> = ({
  conversationId,
  ticketNumber,
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const agents = useAppSelector((state) => state.inbox.agents);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [selectedAgentId, setSelectedAgentId] = useState(agents[1]?.id || '');
  const [reason, setReason] = useState('');

  const handleTransfer = () => {
    const targetAgent = agents.find((a) => a.id === selectedAgentId);
    if (!targetAgent) return;

    // 1. Reassign in Redux
    dispatch(assignAgent({ conversationId, agent: targetAgent }));

    // 2. Add transfer reason as internal note if provided
    if (reason.trim()) {
      dispatch(
        sendMessage({
          id: `note_transfer_${Date.now()}`,
          conversationId,
          sender: {
            type: 'agent',
            id: currentUser?.id || 'usr_enterprise_01',
            name: currentUser?.name || 'Alex Rivera',
            avatar: currentUser?.avatarUrl,
            role: 'Support Lead',
          },
          content: `TRANSFER NOTE: Reassigned ticket to ${targetAgent.name}. Reason: ${reason.trim()}`,
          timestamp: 'Just now',
          isInternalNote: true,
        })
      );
    }

    dispatch(
      addToast({
        type: 'success',
        title: 'Conversation Transferred',
        message: `${ticketNumber} successfully transferred to ${targetAgent.name}.`,
        duration: 3500,
      })
    );
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Transfer Conversation"
      description={`Hand off ${ticketNumber} to another specialized support engineer.`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleTransfer}
            leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
          >
            Confirm Transfer
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select Recipient Agent
          </label>
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand-500"
          >
            {agents.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.name} ({ag.role} • {ag.status})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Hand-off Context & Reason (Appended as Internal Note)
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Customer requires deep AWS DNS access or billing refund permission..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-brand-500 resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};
