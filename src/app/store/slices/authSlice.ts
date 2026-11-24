import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, UserRole, UserStatus } from '@/types/user';
import { DEFAULT_USER } from '@/constants/config';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: DEFAULT_USER,
  isAuthenticated: true,
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    updateUserStatus: (state, action: PayloadAction<UserStatus>) => {
      if (state.user) {
        state.user.status = action.payload;
      }
    },
    setUserRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
    switchWorkspace: (
      state,
      action: PayloadAction<{ id: string; name: string; plan: 'Starter' | 'Growth' | 'Enterprise' }>
    ) => {
      if (state.user) {
        state.user.currentWorkspace = action.payload;
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, updateUserStatus, setUserRole, switchWorkspace, logout } = authSlice.actions;

export default authSlice.reducer;
