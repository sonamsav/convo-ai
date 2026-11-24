import React, { useState } from 'react';
import { Download, UserPlus, Users } from 'lucide-react';
import { PageHeader, Button, Badge } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { addToast } from '@/app/store/slices/toastSlice';
import { usePermissions } from '@/features/permissions/hooks/usePermissions';
import { getPermissionDenialReason } from '@/features/permissions/utils/permissions';
import { CustomerKpiCards } from '../components/CustomerKpiCards';
import { CustomerSegmentFilter } from '../components/CustomerSegmentFilter';
import { CustomerTable } from '../components/CustomerTable';
import { AddCustomerModal } from '../components/AddCustomerModal';
import { exportCustomerCsv } from '../utils/exportCustomerCsv';

export const CustomersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { can } = usePermissions();
  const customers = useAppSelector((state) => state.customer.customers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleExportAll = () => {
    if (!can('customers:export')) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Permission Denied',
          message: getPermissionDenialReason('customers:export'),
        })
      );
      return;
    }

    exportCustomerCsv(customers, `convoai-customers-all-${customers.length}.csv`);
    dispatch(
      addToast({
        type: 'info',
        title: 'CSV Export Generated',
        message: `Exported full database of ${customers.length} customer records to CSV.`,
      })
    );
  };

  const handleOpenAddCustomer = () => {
    if (!can('customers:create')) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Permission Denied',
          message: 'Support Agent role has read-only CRM access. Admin or Manager role required.',
        })
      );
      return;
    }
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Customers"
        description="Manage customer relationships, profiles, SLA tiers, and conversation interaction history."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Customers', isCurrent: true },
        ]}
        badge={
          <Badge variant="primary" size="sm">
            {customers.length} Accounts
          </Badge>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAll}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export Customers
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddCustomer}
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            >
              Add Customer
            </Button>
          </>
        }
      />

      {/* 5 KPI Cards */}
      <CustomerKpiCards />

      {/* Customer Segmentation Tabs */}
      <CustomerSegmentFilter />

      {/* Customer Data Table */}
      <CustomerTable />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
