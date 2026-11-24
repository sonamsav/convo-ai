import React, { useState } from 'react';
import { UserPlus, Building, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { Modal, Button, Input, Select } from '@/components/ui';
import { useAppDispatch } from '@/app/store/hooks';
import { addToast } from '@/app/store/slices/toastSlice';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [plan, setPlan] = useState('Enterprise');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required fields.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      dispatch(
        addToast({
          type: 'success',
          title: 'Customer Added Successfully',
          message: `${name} (${company || 'Direct'}) has been created and indexed in CRM.`,
          duration: 3500,
        })
      );
      setName('');
      setEmail('');
      setCompany('');
      setNotes('');
      onClose();
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Create Customer Profile"
      description="Add a new customer account to the ConvoAI CRM index."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Create Customer
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Customer Full Name *"
            placeholder="e.g. Alex Morgan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Company / Account"
            placeholder="e.g. Vercel Inc"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            leftIcon={<Building className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Work Email Address *"
            type="email"
            placeholder="alex.m@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          <Select
            label="Account Tier"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            options={[
              { value: 'Enterprise', label: 'Enterprise (Dedicated SLA)' },
              { value: 'Growth', label: 'Growth Plan' },
              { value: 'Starter', label: 'Starter Tier' },
            ]}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Initial Context & CRM Notes
          </label>
          <textarea
            rows={3}
            placeholder="Key integration context, VIP priority notes, or account contacts..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </form>
    </Modal>
  );
};
