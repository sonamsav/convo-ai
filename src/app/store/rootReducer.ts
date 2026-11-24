import { combineReducers } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';
import authReducer from './slices/authSlice';
import toastReducer from './slices/toastSlice';
import inboxReducer from './slices/inboxSlice';
import customerReducer from './slices/customerSlice';
import agentReducer from './slices/agentSlice';
import teamReducer from './slices/teamSlice';
import automationReducer from './slices/automationSlice';

export const rootReducer = combineReducers({
  ui: uiReducer,
  notifications: notificationReducer,
  auth: authReducer,
  toast: toastReducer,
  inbox: inboxReducer,
  customer: customerReducer,
  agent: agentReducer,
  team: teamReducer,
  automation: automationReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
