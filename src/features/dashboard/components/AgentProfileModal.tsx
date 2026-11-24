import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Clock, CheckCircle2, Star, Shield, ExternalLink, User } from 'lucide-react';
import { Modal, Button, Badge, Avatar } from '@/components/ui';
import { AgentPerformanceItem } from '../types/dashboard';

interface AgentProfileModalProps {
  agent: AgentPerformanceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignTicket?: (agent: AgentPerformanceItem) => void;
}

export const AgentProfileModal: React.FC<AgentProfileModalProps> = ({
  agent,
  isOpen,
  onClose,
  onAssignTicket,
}) => {
  const navigate = useNavigate();
  if (!agent) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Agent Performance Profile"
      description="Real-time capacity, triage stats, and customer CSAT metrics."
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              navigate(`/agents/${agent.id}`);
            }}
            leftIcon={<User className="w-3.5 h-3.5" />}
          >
            Full Profile
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          {onAssignTicket && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAssignTicket(agent)}
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Assign Next Ticket
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        {/* Agent Info Header Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
          <Avatar
            src={agent.avatarUrl}
            name={agent.name}
            status={agent.status}
            size="lg"
          />
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {agent.name}
              </h4>
              <Badge variant={agent.status === 'online' ? 'success' : agent.status === 'busy' ? 'danger' : 'neutral'} size="sm" hasDot>
                {agent.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              {agent.email}
            </p>
            <p className="text-[11px] font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              {agent.role}
            </p>
          </div>
        </div>

        {/* 4 Stat Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Assigned Tickets</span>
            <p className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {agent.assignedCount}
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Resolved Today</span>
            <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {agent.resolvedCount}
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Avg. First Response</span>
            <p className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <Clock className="w-4 h-4 text-violet-500 shrink-0" />
              {agent.avgResponseTime}
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">CSAT Score</span>
            <p className="text-lg font-bold font-mono text-amber-500 flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
              {agent.rating} <span className="text-xs text-slate-400">/ 5.0</span>
            </p>
          </div>
        </div>

        {/* Competencies & Skill Tags */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Routing Skill Tags & Coverage
          </p>
          <div className="flex flex-wrap gap-1.5">
            {['Enterprise SSO', 'Stripe Billing', 'REST Webhooks', 'High-Priority VIP', 'GDPR Compliance'].map(
              (tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
