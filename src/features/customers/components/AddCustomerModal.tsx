import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, AlertCircle } from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { addCustomer } from '@/app/store/slices/customerSlice';
import { addToast } from '@/app/store/slices/toastSlice';
import { CustomerRecord, CustomerType, CustomerStatus } from '../types/customer';

const addCustomerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please enter a valid phone number (at least 7 digits)'),
  company: z.string().min(2, 'Company name is required'),
  customerType: z.enum(['Enterprise', 'Mid-Market', 'SMB', 'Startup']),
  status: z.enum(['active', 'vip', 'churn_risk', 'lead', 'inactive']),
  location: z.string().min(2, 'City and country/state is required'),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

type AddCustomerFormData = z.infer<typeof addCustomerSchema>;

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const existingCustomers = useAppSelector((state) => state.customer.customers);
  const currentUser = useAppSelector((state) => state.auth.user);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddCustomerFormData>({
    resolver: zodResolver(addCustomerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      customerType: 'Enterprise',
      status: 'active',
      location: '',
      tags: 'Enterprise SLA, New Account',
      notes: '',
    },
  });

  const onSubmit = (data: AddCustomerFormData) => {
    // Duplicate email detection
    const isDuplicate = existingCustomers.some(
      (c) => c.email.toLowerCase().trim() === data.email.toLowerCase().trim()
    );

    if (isDuplicate) {
      setError('email', {
        type: 'manual',
        message: 'A customer account with this email address already exists in CRM.',
      });
      return;
    }

    const tagList = data.tags
      ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : ['New Customer'];

    const newCustomer: CustomerRecord = {
      id: `cust-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      company: data.company.trim(),
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&h=128&q=80`,
      customerType: data.customerType as CustomerType,
      status: data.status as CustomerStatus,
      sentiment: 'Positive',
      location: data.location.trim(),
      timezone: 'America/New_York (EST)',
      joinedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      lastInteraction: 'Just now',
      lastInteractionTimestamp: Date.now(),
      totalConversations: 0,
      resolvedConversations: 0,
      avgResponseTime: '—',
      csat: 5.0,
      mrr: data.customerType === 'Enterprise' ? '$8,500/mo' : '$1,200/mo',
      tags: tagList,
      accountManager: currentUser?.name || 'Alex Rivera',
      notes: data.notes
        ? [
            {
              id: `note-${Date.now()}`,
              content: data.notes.trim(),
              authorName: currentUser?.name || 'Alex Rivera',
              authorRole: currentUser?.role === 'admin' ? 'Admin' : 'Manager',
              createdAt: 'Just now',
              isPinned: true,
            },
          ]
        : [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          type: 'plan_upgrade',
          title: 'Account Provisioned in CRM',
          description: `Customer account created on ${data.customerType} tier by ${currentUser?.name || 'Administrator'}.`,
          timestamp: 'Just now',
          category: 'account',
        },
      ],
      insights: {
        summary: 'Newly created customer account. Onboarding process initialized.',
        topTopics: ['Onboarding', 'Welcome Setup'],
        sentimentScore: 90,
        sentimentLabel: 'Positive',
        churnRisk: 'Low',
        recommendedActions: ['Assign Dedicated CSM', 'Send Welcome Onboarding Guide'],
      },
    };

    dispatch(addCustomer(newCustomer));
    dispatch(
      addToast({
        type: 'success',
        title: 'Customer Created',
        message: `${newCustomer.name} (${newCustomer.company}) has been added to the CRM database.`,
      })
    );

    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer"
      description="Create a verified customer profile with organization details, subscription tier, and contact information."
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Full Name */}
          <div>
            <Input
              label="Full Name *"
              placeholder="e.g. Jane Doe"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          {/* Email */}
          <div>
            <Input
              label="Work Email *"
              type="email"
              placeholder="jane@company.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          {/* Phone */}
          <div>
            <Input
              label="Phone Number *"
              placeholder="+1 (555) 000-0000"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          {/* Company */}
          <div>
            <Input
              label="Company Name *"
              placeholder="e.g. Acme Corp"
              error={errors.company?.message}
              {...register('company')}
            />
          </div>

          {/* Customer Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer Tier *
            </label>
            <select
              {...register('customerType')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="Enterprise">Enterprise</option>
              <option value="Mid-Market">Mid-Market</option>
              <option value="SMB">SMB</option>
              <option value="Startup">Startup</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Initial Status *
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="active">Active</option>
              <option value="vip">VIP</option>
              <option value="lead">Lead / Trial</option>
              <option value="churn_risk">Churn Risk</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <Input
            label="Location (City, Country) *"
            placeholder="e.g. San Francisco, CA, USA"
            error={errors.location?.message}
            {...register('location')}
          />
        </div>

        {/* Tags */}
        <div>
          <Input
            label="Customer Tags (Comma-separated)"
            placeholder="e.g. Enterprise SLA, SOC2, Dedicated IP"
            helperText="Separate multiple tags with a comma"
            {...register('tags')}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Internal Note / Context
          </label>
          <textarea
            rows={3}
            placeholder="Add initial account context, SLA details, or special handling instructions..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
            {...register('notes')}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Create Customer Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};
