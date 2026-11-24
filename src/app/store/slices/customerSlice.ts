import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomerFilterState, CustomerNote, CustomerRecord, CustomerSegment } from '@/features/customers/types/customer';
import { MOCK_CUSTOMERS } from '@/features/customers/data/mockCustomerData';

interface CustomerState {
  customers: CustomerRecord[];
  selectedCustomerId: string | null;
  selectedCustomerIds: string[];
  filters: CustomerFilterState;
}

const initialFilters: CustomerFilterState = {
  search: '',
  segment: 'all',
  status: 'all',
  type: 'all',
  sentiment: 'all',
  sortBy: 'lastInteraction',
  sortDirection: 'desc',
  page: 1,
  pageSize: 10,
};

const initialState: CustomerState = {
  customers: MOCK_CUSTOMERS,
  selectedCustomerId: null,
  selectedCustomerIds: [],
  filters: initialFilters,
};

export const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    addCustomer: (state, action: PayloadAction<CustomerRecord>) => {
      state.customers.unshift(action.payload);
    },
    updateCustomer: (state, action: PayloadAction<CustomerRecord>) => {
      const idx = state.customers.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) {
        state.customers[idx] = action.payload;
      }
    },
    deleteCustomer: (state, action: PayloadAction<string>) => {
      state.customers = state.customers.filter((c) => c.id !== action.payload);
      state.selectedCustomerIds = state.selectedCustomerIds.filter((id) => id !== action.payload);
      if (state.selectedCustomerId === action.payload) {
        state.selectedCustomerId = null;
      }
    },
    bulkDeleteCustomers: (state, action: PayloadAction<string[]>) => {
      const idsToDelete = new Set(action.payload);
      state.customers = state.customers.filter((c) => !idsToDelete.has(c.id));
      state.selectedCustomerIds = [];
      if (state.selectedCustomerId && idsToDelete.has(state.selectedCustomerId)) {
        state.selectedCustomerId = null;
      }
    },
    bulkTagCustomers: (
      state,
      action: PayloadAction<{ ids: string[]; tags: string[]; mode: 'add' | 'remove' }>
    ) => {
      const { ids, tags, mode } = action.payload;
      const targetIds = new Set(ids);
      state.customers.forEach((c) => {
        if (targetIds.has(c.id)) {
          if (mode === 'add') {
            const currentTags = new Set(c.tags);
            tags.forEach((t) => currentTags.add(t));
            c.tags = Array.from(currentTags);
          } else {
            const tagsToRemove = new Set(tags);
            c.tags = c.tags.filter((t) => !tagsToRemove.has(t));
          }
        }
      });
    },
    addCustomerNote: (
      state,
      action: PayloadAction<{ customerId: string; note: Omit<CustomerNote, 'id' | 'createdAt'> }>
    ) => {
      const customer = state.customers.find((c) => c.id === action.payload.customerId);
      if (customer) {
        const newNote: CustomerNote = {
          id: `note-${Date.now()}`,
          createdAt: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          ...action.payload.note,
        };
        customer.notes.unshift(newNote);
      }
    },
    deleteCustomerNote: (
      state,
      action: PayloadAction<{ customerId: string; noteId: string }>
    ) => {
      const customer = state.customers.find((c) => c.id === action.payload.customerId);
      if (customer) {
        customer.notes = customer.notes.filter((n) => n.id !== action.payload.noteId);
      }
    },
    setSelectedCustomerId: (state, action: PayloadAction<string | null>) => {
      state.selectedCustomerId = action.payload;
    },
    toggleSelectCustomer: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.selectedCustomerIds.includes(id)) {
        state.selectedCustomerIds = state.selectedCustomerIds.filter((item) => item !== id);
      } else {
        state.selectedCustomerIds.push(id);
      }
    },
    selectAllCustomers: (state, action: PayloadAction<string[]>) => {
      state.selectedCustomerIds = action.payload;
    },
    clearSelectedCustomers: (state) => {
      state.selectedCustomerIds = [];
    },
    setCustomerFilter: (state, action: PayloadAction<Partial<CustomerFilterState>>) => {
      state.filters = { ...state.filters, ...action.payload, page: action.payload.page ?? 1 };
    },
    setCustomerSegment: (state, action: PayloadAction<CustomerSegment>) => {
      state.filters.segment = action.payload;
      state.filters.page = 1;
    },
    resetCustomerFilters: (state) => {
      state.filters = initialFilters;
      state.selectedCustomerIds = [];
    },
  },
});

export const {
  addCustomer,
  updateCustomer,
  deleteCustomer,
  bulkDeleteCustomers,
  bulkTagCustomers,
  addCustomerNote,
  deleteCustomerNote,
  setSelectedCustomerId,
  toggleSelectCustomer,
  selectAllCustomers,
  clearSelectedCustomers,
  setCustomerFilter,
  setCustomerSegment,
  resetCustomerFilters,
} = customerSlice.actions;

export default customerSlice.reducer;
