import React, { useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { useAppDispatch } from '@/app/store/hooks';
import { updateCustomer } from '@/app/store/slices/customerSlice';
import { addToast } from '@/app/store/slices/toastSlice';
import { CustomerRecord, CustomerType, CustomerStatus, CustomerSentiment } from '../types/customer';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerRecord | null;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const dispatch = useAppDispatch();

  if (!customer) return null;

  const [name, setName] = useState(customer.name);
  const [email] = useState(customer.email); // Read-only ID
  const [phone, setPhone] = useState(customer.phone);
  const [company, setCompany] = useState(customer.company);
  const [customerType, setCustomerType] = useState<CustomerType>(customer.customerType);
  const [status, setStatus] = useState<CustomerStatus>(customer.status);
  const [sentiment, setSentiment] = useState<CustomerSentiment>(customer.sentiment);
  const [location, setLocation] = useState(customer.location);
  const [mrr, setMrr] = useState(customer.mrr);
  const [accountManager, setAccountManager] = useState(customer.accountManager);
  const [tagsInput, setTagsInput] = useState(customer.tags.join(', '));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: CustomerRecord = {
      ...customer,
      name: name.trim(),
      phone: phone.trim(),
      company: company.trim(),
      customerType,
      status,
      sentiment,
      location: location.trim(),
      mrr: mrr.trim(),
      accountManager: accountManager.trim(),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    };

    dispatch(updateCustomer(updated));
    dispatch(
      addToast({
        type: 'success',
        title: 'Customer Updated',
        message: `Profile changes for ${updated.name} have been saved successfully.`,
      })
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Customer: ${customer.name}`}
      description="Update customer relationship details, SLA status, sentiment, and account management."
      size="md"
    >
      <form onSubmit={handleSave} className="space-y-4 py-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Work Email (Identifier)"
            value={email}
            disabled
            helperText="Email cannot be changed after creation"
          />

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Company Name *"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer Tier
            </label>
            <select
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value as CustomerType)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="Enterprise">Enterprise</option>
              <option value="Mid-Market">Mid-Market</option>
              <option value="SMB">SMB</option>
              <option value="Startup">Startup</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CustomerStatus)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="active">Active</option>
              <option value="vip">VIP</option>
              <option value="churn_risk">Churn Risk</option>
              <option value="lead">Lead / Trial</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sentiment
            </label>
            <select
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value as CustomerSentiment)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </select>
          </div>

          <Input
            label="Monthly Recurring Revenue (MRR)"
            value={mrr}
            onChange={(e) => setMrr(e.target.value)}
          />
        </div>

        <Input
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Input
          label="Assigned Account Manager"
          value={accountManager}
          onChange={(e) => setAccountManager(e.target.value)}
        />

        <Input
          label="Tags (Comma-separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          helperText="Separate multiple tags with a comma"
        />

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
