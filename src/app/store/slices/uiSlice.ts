import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeMode } from '@/types/theme';
import { storage } from '@/utils/storage';

interface UiState {
  sidebarExpanded: boolean;
  sidebarMobileOpen: boolean;
  globalSearchOpen: boolean;
  theme: ThemeMode;
  notificationsDrawerOpen: boolean;
  userMenuOpen: boolean;
}

const initialTheme = storage.get<ThemeMode>('convoai_theme', 'light');
const initialSidebarState = storage.get<boolean>('convoai_sidebar_expanded', true);

const initialState: UiState = {
  sidebarExpanded: initialSidebarState,
  sidebarMobileOpen: false,
  globalSearchOpen: false,
  theme: initialTheme,
  notificationsDrawerOpen: false,
  userMenuOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarExpanded = !state.sidebarExpanded;
      storage.set('convoai_sidebar_expanded', state.sidebarExpanded);
    },
    setSidebarExpanded: (state, action: PayloadAction<boolean>) => {
      state.sidebarExpanded = action.payload;
      storage.set('convoai_sidebar_expanded', action.payload);
    },
    toggleMobileSidebar: (state) => {
      state.sidebarMobileOpen = !state.sidebarMobileOpen;
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarMobileOpen = action.payload;
    },
    setGlobalSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.globalSearchOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      storage.set('convoai_theme', action.payload);
    },
    toggleTheme: (state) => {
      const nextTheme: ThemeMode = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = nextTheme;
      storage.set('convoai_theme', nextTheme);
    },
    setNotificationsDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.notificationsDrawerOpen = action.payload;
    },
    setUserMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.userMenuOpen = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarExpanded,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  setGlobalSearchOpen,
  setTheme,
  toggleTheme,
  setNotificationsDrawerOpen,
  setUserMenuOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
