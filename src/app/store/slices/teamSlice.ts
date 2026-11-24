import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TeamRecord } from '@/features/teams/types/team';
import { MOCK_TEAMS } from '@/features/teams/data/mockTeamData';

interface TeamState {
  teams: TeamRecord[];
  selectedTeamId: string | null;
}

const initialState: TeamState = {
  teams: MOCK_TEAMS,
  selectedTeamId: null,
};

export const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    addTeam: (state, action: PayloadAction<TeamRecord>) => {
      state.teams.unshift(action.payload);
    },
    updateTeam: (state, action: PayloadAction<TeamRecord>) => {
      const idx = state.teams.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) {
        state.teams[idx] = action.payload;
      }
    },
    deleteTeam: (state, action: PayloadAction<string>) => {
      state.teams = state.teams.filter((t) => t.id !== action.payload);
      if (state.selectedTeamId === action.payload) {
        state.selectedTeamId = null;
      }
    },
    assignAgentToTeam: (
      state,
      action: PayloadAction<{ agentId: string; teamId: string }>
    ) => {
      const { agentId, teamId } = action.payload;
      state.teams.forEach((t) => {
        if (t.id === teamId) {
          if (!t.memberIds.includes(agentId)) {
            t.memberIds.push(agentId);
          }
        } else {
          t.memberIds = t.memberIds.filter((id) => id !== agentId);
        }
      });
    },
    removeAgentFromTeam: (
      state,
      action: PayloadAction<{ agentId: string; teamId: string }>
    ) => {
      const { agentId, teamId } = action.payload;
      const team = state.teams.find((t) => t.id === teamId);
      if (team) {
        team.memberIds = team.memberIds.filter((id) => id !== agentId);
      }
    },
    setSelectedTeamId: (state, action: PayloadAction<string | null>) => {
      state.selectedTeamId = action.payload;
    },
  },
});

export const {
  addTeam,
  updateTeam,
  deleteTeam,
  assignAgentToTeam,
  removeAgentFromTeam,
  setSelectedTeamId,
} = teamSlice.actions;

export default teamSlice.reducer;
