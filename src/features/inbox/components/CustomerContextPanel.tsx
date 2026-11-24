import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Plus,
  X,
  Edit2,
  ChevronDown,
  ChevronRight,
  Shield,
  Activity,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { Avatar, Badge, Button } from '@/components/ui';
import { Customer, Conversation } from '../types/inbox';
import { useAppDispatch } from '@/app/store/hooks';
import {
  addCustomerTag,
  removeCustomerTag,
  selectConversation,
} from '@/app/store/slices/inboxSlice';
import { EditCustomerModal } from './EditCustomerModal';
import { cn } from '@/utils/cn';

interface CustomerContextPanelProps {
  conversation: Conversation;
  onClose?: () => void;
  className?: string;
}

export const CustomerContextPanel: React.FC<CustomerContextPanelProps> = ({
  conversation,
  onClose,
  className,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const customer = conversation.customer;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Accordion state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    details: true,
    tags: true,
    history: true,
    activity: false,
    notes: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim()) {
      dispatch(addCustomerTag({ customerId: customer.id, tag: newTagInput.trim() }));
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const statusVariant = {
    vip: 'primary',
    active: 'success',
    churn_risk: 'danger',
    lead: 'info',
  } as const;

  return (
    <>
      <aside
        className={cn(
          'flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800/80 overflow-y-auto select-none text-xs',
          className
        )}
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Customer Context 360
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => navigate(`/customers/${customer.id}`)}
              className="p-1 rounded-md text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Open full 360 profile in Customer CRM"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit2 className="w-3 h-3" />}
            >
              Edit
            </Button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close context panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center text-center space-y-2 bg-slate-50/50 dark:bg-slate-850/30">
          <Avatar
            src={customer.avatar}
            name={customer.name}
            status={customer.status === 'vip' ? 'online' : undefined}
            size="lg"
          />

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {customer.name}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {customer.company}
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <Badge variant={statusVariant[customer.status]} size="sm" className="uppercase font-semibold">
              {customer.status.replace('_', ' ')}
            </Badge>
            <Badge variant="neutral" size="sm">
              {customer.plan}
            </Badge>
          </div>
        </div>

        {/* Accordion 1: Contact & Details */}
        <div className="border-b border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => toggleSection('details')}
            className="w-full px-4 py-3 flex items-center justify-between text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
          >
            <span>Customer Details</span>
            {expandedSections.details ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {expandedSections.details && (
            <div className="px-4 pb-4 space-y-2.5 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a
                  href={`mailto:${customer.email}`}
                  className="text-brand-600 dark:text-brand-400 hover:underline truncate"
                >
                  {customer.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{customer.location}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{customer.timezone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Customer since {customer.customerSince}</span>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 2: Tags Manager */}
        <div className="border-b border-slate-100 dark:border-slate-800/80">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => toggleSection('tags')}
              className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200"
            >
              <span>Account Tags ({customer.tags.length})</span>
              {expandedSections.tags ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsAddingTag((prev) => !prev)}
              className="p-1 rounded text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
              title="Add Tag"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {expandedSections.tags && (
            <div className="px-4 pb-4 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200/60 dark:border-slate-700"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(removeCustomerTag({ customerId: customer.id, tag }))
                      }
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {isAddingTag && (
                <form onSubmit={handleAddTag} className="flex items-center gap-1 pt-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="New tag..."
                    className="flex-1 px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    autoFocus
                  />
                  <Button variant="primary" size="xs" type="submit">
                    Add
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Accordion 3: Previous Conversation History */}
        <div className="border-b border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => toggleSection('history')}
            className="w-full px-4 py-3 flex items-center justify-between text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
          >
            <span>Previous Conversations ({customer.previousTickets.length})</span>
            {expandedSections.history ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {expandedSections.history && (
            <div className="px-4 pb-4 space-y-2">
              {customer.previousTickets.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No prior tickets on file.</p>
              ) : (
                customer.previousTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-1 hover:border-brand-300 dark:hover:border-brand-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-brand-600 dark:text-brand-400 text-[10px]">
                        {t.ticketNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">{t.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate">
                      {t.subject}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Accordion 4: Customer Notes & Metadata */}
        <div className="border-b border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => toggleSection('notes')}
            className="w-full px-4 py-3 flex items-center justify-between text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
          >
            <span>Internal Customer Notes</span>
            {expandedSections.notes ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {expandedSections.notes && (
            <div className="px-4 pb-4">
              <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed">
                {customer.notes || 'No account notes added yet.'}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Edit Customer Modal */}
      <EditCustomerModal
        customer={customer}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};
