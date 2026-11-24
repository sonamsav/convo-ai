import React from 'react';
import { UserCheck, UserX, Check } from 'lucide-react';
import { Modal, Button, Avatar, Badge } from '@/components/ui';
import { InboxAgent } from '../types/inbox';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { assignAgent } from '@/app/store/slices/inboxSlice';
import { addToast } from '@/app/store/slices/toastSlice';

interface AgentAssignModalProps {
  conversationId: string;
  ticketNumber: string;
  currentAgent: InboxAgent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AgentAssignModal: React.FC<AgentAssignModalProps> = ({
  conversationId,
  ticketNumber,
  currentAgent,
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const agents = useAppSelector((state) => state.inbox.agents);

  const handleAssign = (agent: InboxAgent | null) => {
    dispatch(assignAgent({ conversationId, agent }));
    dispatch(
      addToast({
        type: 'success',
        title: agent ? 'Agent Assigned' : 'Conversation Unassigned',
        message: agent
          ? `Ticket ${ticketNumber} assigned to ${agent.name}.`
          : `Ticket ${ticketNumber} is now in the unassigned queue.`,
        duration: 3000,
      })
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Assign Conversation"
      description={`Assign ${ticketNumber} to an available team agent.`}
    >
      <div className="space-y-2 py-1">
        {/* Unassign option */}
        <button
          type="button"
          onClick={() => handleAssign(null)}
          className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <UserX className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Unassigned
              </p>
              <p className="text-[11px] text-slate-400">
                Return to general shared triage queue
              </p>
            </div>
          </div>
          {currentAgent === null && (
            <Check className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          )}
        </button>

        {/* Agents List */}
        {agents.map((ag) => {
          const isSelected = currentAgent?.id === ag.id;
          return (
            <button
              key={ag.id}
              type="button"
              onClick={() => handleAssign(ag)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar src={ag.avatar} name={ag.name} status={ag.status} size="sm" />
                <div className="truncate min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {ag.name}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({ag.assignedTicketCount} active)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{ag.role}</p>
                </div>
              </div>

              {isSelected && (
                <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
};
