import React, { useState } from 'react';
import { Save, User, Building, Mail, Phone, MapPin } from 'lucide-react';
import { Modal, Button, Input, Select } from '@/components/ui';
import { Customer } from '../types/inbox';
import { useAppDispatch } from '@/app/store/hooks';
import { updateCustomerDetails } from '@/app/store/slices/inboxSlice';
import { addToast } from '@/app/store/slices/toastSlice';

interface EditCustomerModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  customer,
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();

  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email);
  const [phone, setPhone] = useState(customer.phone);
  const [company, setCompany] = useState(customer.company);
  const [plan, setPlan] = useState(customer.plan);
  const [location, setLocation] = useState(customer.location);
  const [notes, setNotes] = useState(customer.notes);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full name is required.';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Valid email is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    dispatch(
      updateCustomerDetails({
        customerId: customer.id,
        updates: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: company.trim(),
          plan: plan as Customer['plan'],
          location: location.trim(),
          notes: notes.trim(),
        },
      })
    );

    dispatch(
      addToast({
        type: 'success',
        title: 'Customer Updated',
        message: `Profile details for ${name} have been updated.`,
        duration: 3000,
      })
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Edit Customer Details"
      description="Update contact information, account tier, and CRM context."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSave} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            leftIcon={<User className="w-3.5 h-3.5" />}
          />
          <Input
            label="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            leftIcon={<Building className="w-3.5 h-3.5" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Work Email *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            leftIcon={<Mail className="w-3.5 h-3.5" />}
          />
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-3.5 h-3.5" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Account Tier"
            value={plan}
            onChange={(e) => setPlan(e.target.value as Customer['plan'])}
            options={[
              { value: 'Enterprise', label: 'Enterprise Tier' },
              { value: 'Growth', label: 'Growth Plan' },
              { value: 'Starter', label: 'Starter Tier' },
            ]}
          />
          <Input
            label="Location / Region"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            leftIcon={<MapPin className="w-3.5 h-3.5" />}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Account Notes & Metadata
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand-500 resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};
