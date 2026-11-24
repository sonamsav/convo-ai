import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Tag,
  Edit2,
  Eye,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Smile,
  Meh,
  Frown,
  CheckSquare,
  Square,
  MinusSquare,
  RotateCcw,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  SearchInput,
  ConfirmationDialog,
  Dropdown,
  DropdownItem,
  EmptyState,
} from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  deleteCustomer,
  bulkDeleteCustomers,
  toggleSelectCustomer,
  selectAllCustomers,
  clearSelectedCustomers,
  setCustomerFilter,
  resetCustomerFilters,
} from '@/app/store/slices/customerSlice';
import { addToast } from '@/app/store/slices/toastSlice';
import { usePermissions } from '@/features/permissions/hooks/usePermissions';
import { getPermissionDenialReason } from '@/features/permissions/utils/permissions';
import { CustomerRecord, CustomerStatus, CustomerType, CustomerSentiment } from '../types/customer';
import { exportCustomerCsv } from '../utils/exportCustomerCsv';
import { BulkTagModal } from './BulkTagModal';
import { EditCustomerModal } from './EditCustomerModal';
import { cn } from '@/utils/cn';

export const CustomerTable: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { can, role } = usePermissions();

  const customers = useAppSelector((state) => state.customer.customers);
  const selectedIds = useAppSelector((state) => state.customer.selectedCustomerIds);
  const filters = useAppSelector((state) => state.customer.filters);

  // Modals state
  const [isBulkTagOpen, setIsBulkTagOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerRecord | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  // Filter & Search logic
  const filteredData = useMemo(() => {
    return customers.filter((c) => {
      // Segment filter
      if (filters.segment === 'new') {
        const isNew = c.status === 'lead' || new Date(c.joinedDate).getFullYear() === 2024;
        if (!isNew) return false;
      } else if (filters.segment === 'returning') {
        if (c.totalConversations <= 2) return false;
      } else if (filters.segment === 'high_priority') {
        if (c.status !== 'vip' && c.customerType !== 'Enterprise') return false;
      } else if (filters.segment === 'inactive') {
        if (c.status !== 'inactive' && c.status !== 'churn_risk') return false;
      } else if (filters.segment === 'high_engagement') {
        if (c.totalConversations < 10) return false;
      }

      // Search query (name, email, phone, company)
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesEmail = c.email.toLowerCase().includes(q);
        const matchesPhone = c.phone.toLowerCase().includes(q);
        const matchesCompany = c.company.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesCompany) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== 'all' && c.status !== filters.status) {
        return false;
      }

      // Type filter
      if (filters.type !== 'all' && c.customerType !== filters.type) {
        return false;
      }

      // Sentiment filter
      if (filters.sentiment !== 'all' && c.sentiment !== filters.sentiment) {
        return false;
      }

      return true;
    });
  }, [customers, filters]);

  // Sorting
  const sortedData = useMemo(() => {
    const list = [...filteredData];
    list.sort((a, b) => {
      let comparison = 0;
      if (filters.sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (filters.sortBy === 'totalConversations') {
        comparison = a.totalConversations - b.totalConversations;
      } else if (filters.sortBy === 'csat') {
        comparison = a.csat - b.csat;
      } else {
        // lastInteraction
        comparison = a.lastInteractionTimestamp - b.lastInteractionTimestamp;
      }
      return filters.sortDirection === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredData, filters.sortBy, filters.sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / filters.pageSize));
  const paginatedData = useMemo(() => {
    const start = (filters.page - 1) * filters.pageSize;
    return sortedData.slice(start, start + filters.pageSize);
  }, [sortedData, filters.page, filters.pageSize]);

  // Select all visible on current page
  const allCurrentPageSelected =
    paginatedData.length > 0 && paginatedData.every((c) => selectedIds.includes(c.id));
  const someCurrentPageSelected =
    paginatedData.some((c) => selectedIds.includes(c.id)) && !allCurrentPageSelected;

  const handleToggleSelectAll = () => {
    if (allCurrentPageSelected) {
      dispatch(clearSelectedCustomers());
    } else {
      const pageIds = paginatedData.map((c) => c.id);
      dispatch(selectAllCustomers(Array.from(new Set([...selectedIds, ...pageIds]))));
    }
  };

  const handleSort = (column: 'name' | 'lastInteraction' | 'totalConversations' | 'csat') => {
    if (filters.sortBy === column) {
      dispatch(
        setCustomerFilter({
          sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc',
        })
      );
    } else {
      dispatch(
        setCustomerFilter({
          sortBy: column,
          sortDirection: 'desc',
        })
      );
    }
  };

  const handleDeleteSingle = () => {
    if (!deletingCustomer) return;
    if (!can('customers:delete')) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Permission Denied',
          message: getPermissionDenialReason('customers:delete'),
        })
      );
      setDeletingCustomer(null);
      return;
    }

    dispatch(deleteCustomer(deletingCustomer.id));
    dispatch(
      addToast({
        type: 'success',
        title: 'Customer Deleted',
        message: `${deletingCustomer.name} (${deletingCustomer.company}) has been removed.`,
      })
    );
    setDeletingCustomer(null);
  };

  const handleBulkDelete = () => {
    if (!can('customers:delete')) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Permission Denied',
          message: getPermissionDenialReason('customers:delete'),
        })
      );
      setIsBulkDeleteConfirmOpen(false);
      return;
    }

    const count = selectedIds.length;
    dispatch(bulkDeleteCustomers(selectedIds));
    dispatch(
      addToast({
        type: 'success',
        title: 'Customers Deleted',
        message: `${count} customer account(s) have been permanently removed.`,
      })
    );
    setIsBulkDeleteConfirmOpen(false);
  };

  const handleExportSelected = () => {
    const exportTargets = customers.filter((c) => selectedIds.includes(c.id));
    exportCustomerCsv(exportTargets, `convoai-selected-${exportTargets.length}-customers.csv`);
    dispatch(
      addToast({
        type: 'info',
        title: 'CSV Export Initiated',
        message: `Exported ${exportTargets.length} customer records to CSV.`,
      })
    );
  };

  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case 'vip':
        return <Badge variant="primary" size="sm">VIP</Badge>;
      case 'active':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'churn_risk':
        return <Badge variant="danger" size="sm">Churn Risk</Badge>;
      case 'lead':
        return <Badge variant="info" size="sm">Lead / Trial</Badge>;
      case 'inactive':
        return <Badge variant="neutral" size="sm">Inactive</Badge>;
    }
  };

  const getSentimentIcon = (sentiment: CustomerSentiment) => {
    switch (sentiment) {
      case 'Positive':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <Smile className="w-3.5 h-3.5" />
            Positive
          </span>
        );
      case 'Neutral':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <Meh className="w-3.5 h-3.5" />
            Neutral
          </span>
        );
      case 'Negative':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
            <Frown className="w-3.5 h-3.5" />
            Negative
          </span>
        );
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="w-full lg:w-96">
          <SearchInput
            placeholder="Search by name, email, phone, or company..."
            value={filters.search}
            onChange={(e) => dispatch(setCustomerFilter({ search: e.target.value }))}
            onClear={() => dispatch(setCustomerFilter({ search: '' }))}
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={filters.status}
            onChange={(e) => dispatch(setCustomerFilter({ status: e.target.value }))}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="vip">VIP</option>
            <option value="lead">Lead / Trial</option>
            <option value="churn_risk">Churn Risk</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Type filter */}
          <select
            value={filters.type}
            onChange={(e) => dispatch(setCustomerFilter({ type: e.target.value }))}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Tiers</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Mid-Market">Mid-Market</option>
            <option value="SMB">SMB</option>
            <option value="Startup">Startup</option>
          </select>

          {/* Sentiment filter */}
          <select
            value={filters.sentiment}
            onChange={(e) => dispatch(setCustomerFilter({ sentiment: e.target.value }))}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>

          {/* Reset button */}
          {(filters.search ||
            filters.status !== 'all' ||
            filters.type !== 'all' ||
            filters.sentiment !== 'all' ||
            filters.segment !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(resetCustomerFilters())}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-slate-500"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Floating Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-brand-50/90 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/80 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-600 text-white font-mono text-[11px] font-bold">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold text-brand-950 dark:text-brand-200">
              Customer{selectedIds.length > 1 ? 's' : ''} Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk Tag */}
            <Button
              variant="outline"
              size="xs"
              onClick={() => setIsBulkTagOpen(true)}
              leftIcon={<Tag className="w-3.5 h-3.5" />}
            >
              Bulk Tag
            </Button>

            {/* Export Selected */}
            <Button
              variant="outline"
              size="xs"
              onClick={handleExportSelected}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export ({selectedIds.length})
            </Button>

            {/* Delete Selected (Gated by RBAC Admin) */}
            <Button
              variant="danger"
              size="xs"
              onClick={() => {
                if (!can('customers:delete')) {
                  dispatch(
                    addToast({
                      type: 'error',
                      title: 'Permission Denied',
                      message: getPermissionDenialReason('customers:delete'),
                    })
                  );
                  return;
                }
                setIsBulkDeleteConfirmOpen(true);
              }}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>

            {/* Clear Selection */}
            <Button
              variant="ghost"
              size="xs"
              onClick={() => dispatch(clearSelectedCustomers())}
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 text-slate-500 dark:text-slate-400 font-semibold select-none text-[11px] uppercase tracking-wider">
              {/* Checkbox Header */}
              <th scope="col" className="w-10 px-4 py-3 text-center">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Select all customers on page"
                >
                  {allCurrentPageSelected ? (
                    <CheckSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  ) : someCurrentPageSelected ? (
                    <MinusSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>

              {/* Customer Name */}
              <th
                scope="col"
                className="px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                onClick={() => handleSort('name')}
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Customer</span>
                  {filters.sortBy === 'name' ? (
                    filters.sortDirection === 'asc' ? (
                      <ChevronUp className="w-3.5 h-3.5 text-brand-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-brand-600" />
                    )
                  ) : (
                    <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                  )}
                </div>
              </th>

              <th scope="col" className="px-4 py-3">Email & Contact</th>
              <th scope="col" className="px-4 py-3">Customer Tier</th>

              {/* Conversations */}
              <th
                scope="col"
                className="px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 text-center"
                onClick={() => handleSort('totalConversations')}
              >
                <div className="inline-flex items-center justify-center gap-1.5 w-full">
                  <span>Conversations</span>
                  {filters.sortBy === 'totalConversations' ? (
                    filters.sortDirection === 'asc' ? (
                      <ChevronUp className="w-3.5 h-3.5 text-brand-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-brand-600" />
                    )
                  ) : (
                    <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                  )}
                </div>
              </th>

              {/* Last Interaction */}
              <th
                scope="col"
                className="px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                onClick={() => handleSort('lastInteraction')}
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Last Interaction</span>
                  {filters.sortBy === 'lastInteraction' ? (
                    filters.sortDirection === 'asc' ? (
                      <ChevronUp className="w-3.5 h-3.5 text-brand-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-brand-600" />
                    )
                  ) : (
                    <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                  )}
                </div>
              </th>

              <th scope="col" className="px-4 py-3">Sentiment</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center">
                  <EmptyState
                    title="No customers found"
                    description="No customer records match your current filter and search parameters."
                    action={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dispatch(resetCustomerFilters())}
                      >
                        Clear Filters
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((customer) => {
                const isSelected = selectedIds.includes(customer.id);

                return (
                  <tr
                    key={customer.id}
                    className={cn(
                      'transition-colors duration-100 hover:bg-slate-50/80 dark:hover:bg-slate-800/40',
                      isSelected && 'bg-brand-50/40 dark:bg-brand-950/20'
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(toggleSelectCustomer(customer.id));
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                      >
                        <Avatar
                          src={customer.avatar}
                          name={customer.name}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                            {customer.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {customer.company} • {customer.location}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="px-4 py-3">
                      <p className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">
                        {customer.email}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {customer.phone}
                      </p>
                    </td>

                    {/* Customer Tier */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                        {customer.customerType}
                      </span>
                    </td>

                    {/* Conversations */}
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {customer.totalConversations}
                      </span>
                    </td>

                    {/* Last Interaction */}
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        {customer.lastInteraction}
                      </span>
                    </td>

                    {/* Sentiment */}
                    <td className="px-4 py-3">
                      {getSentimentIcon(customer.sentiment)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {getStatusBadge(customer.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/customers/${customer.id}`)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View 360 Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingCustomer(customer)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!can('customers:delete')) {
                              dispatch(
                                addToast({
                                  type: 'error',
                                  title: 'Action Prohibited',
                                  message: getPermissionDenialReason('customers:delete'),
                                })
                              );
                              return;
                            }
                            setDeletingCustomer(customer);
                          }}
                          className={cn(
                            'p-1.5 rounded-md transition-colors',
                            can('customers:delete')
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50'
                          )}
                          title={
                            can('customers:delete')
                              ? 'Delete Customer'
                              : 'Delete Customer (Admin only)'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Showing{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {sortedData.length === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {Math.min(filters.page * filters.pageSize, sortedData.length)}
            </strong>{' '}
            of{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {sortedData.length}
            </strong>{' '}
            customers
          </span>

          {/* Page size selector */}
          <div className="flex items-center gap-1.5">
            <span>Rows:</span>
            <select
              value={filters.pageSize}
              onChange={(e) =>
                dispatch(
                  setCustomerFilter({
                    pageSize: Number(e.target.value),
                    page: 1,
                  })
                )
              }
              className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              disabled={filters.page <= 1}
              onClick={() => dispatch(setCustomerFilter({ page: filters.page - 1 }))}
            >
              Previous
            </Button>
            <span className="px-2 font-medium">
              Page {filters.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="xs"
              disabled={filters.page >= totalPages}
              onClick={() => dispatch(setCustomerFilter({ page: filters.page + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Tag Modal */}
      <BulkTagModal
        isOpen={isBulkTagOpen}
        onClose={() => setIsBulkTagOpen(false)}
        selectedCustomerIds={selectedIds}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        customer={editingCustomer}
      />

      {/* Single Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleDeleteSingle}
        title="Delete Customer Account"
        message={`Are you sure you want to permanently delete the profile for ${deletingCustomer?.name} (${deletingCustomer?.company})? All associated conversation context and notes will be unlinked.`}
        confirmLabel="Delete Customer"
        variant="danger"
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isBulkDeleteConfirmOpen}
        onClose={() => setIsBulkDeleteConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedIds.length} Customers`}
        message={`You are about to permanently delete ${selectedIds.length} customer records. This action cannot be reversed.`}
        confirmLabel={`Delete ${selectedIds.length} Accounts`}
        variant="danger"
      />
    </div>
  );
};
