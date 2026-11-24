import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AgentAvailability, AgentFilterState, AgentRecord } from '@/features/agents/types/agent';
import { MOCK_AGENTS } from '@/features/agents/data/mockAgentData';

interface AgentState {
  agents: AgentRecord[];
  selectedAgentId: string | null;
  filters: AgentFilterState;
}

const initialFilters: AgentFilterState = {
  search: '',
  teamId: 'all',
  availability: 'all',
  status: 'all',
  sortBy: 'name',
  sortDirection: 'asc',
  page: 1,
  pageSize: 10,
};

const initialState: AgentState = {
  agents: MOCK_AGENTS,
  selectedAgentId: null,
  filters: initialFilters,
};

export const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    addAgent: (state, action: PayloadAction<AgentRecord>) => {
      state.agents.unshift(action.payload);
    },
    updateAgent: (state, action: PayloadAction<AgentRecord>) => {
      const idx = state.agents.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1) {
        state.agents[idx] = action.payload;
      }
    },
    deleteAgent: (state, action: PayloadAction<string>) => {
      state.agents = state.agents.filter((a) => a.id !== action.payload);
      if (state.selectedAgentId === action.payload) {
        state.selectedAgentId = null;
      }
    },
    toggleAgentStatus: (state, action: PayloadAction<string>) => {
      const agent = state.agents.find((a) => a.id === action.payload);
      if (agent) {
        agent.isActive = !agent.isActive;
        if (!agent.isActive) {
          agent.availability = 'offline';
        }
      }
    },
    updateAgentAvailability: (
      state,
      action: PayloadAction<{ id: string; availability: AgentAvailability }>
    ) => {
      const agent = state.agents.find((a) => a.id === action.payload.id);
      if (agent) {
        agent.availability = action.payload.availability;
        agent.activityHistory.unshift({
          id: `act-${Date.now()}`,
          type: 'status_change',
          description: `Availability set to ${action.payload.availability}`,
          timestamp: 'Just now',
        });
      }
    },
    setSelectedAgentId: (state, action: PayloadAction<string | null>) => {
      state.selectedAgentId = action.payload;
    },
    setAgentFilter: (state, action: PayloadAction<Partial<AgentFilterState>>) => {
      state.filters = { ...state.filters, ...action.payload, page: action.payload.page ?? 1 };
    },
    resetAgentFilters: (state) => {
      state.filters = initialFilters;
    },
  },
});

export const {
  addAgent,
  updateAgent,
  deleteAgent,
  toggleAgentStatus,
  updateAgentAvailability,
  setSelectedAgentId,
  setAgentFilter,
  resetAgentFilters,
} = agentSlice.actions;

export default agentSlice.reducer;
