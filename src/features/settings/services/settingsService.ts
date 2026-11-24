/**
 * Settings API Client Service
 */

import axios from 'axios';
import {
  FullAppSettings,
  GeneralSettings,
  ProfileSettings,
  NotificationSettings,
  AiSettings,
  AppearanceSettings,
  ActiveSession,
} from '../types/settings';

const BASE_URL = '/api/settings';

export const settingsService = {
  async getSettings(): Promise<FullAppSettings> {
    const res = await axios.get(BASE_URL);
    return res.data.data;
  },

  async updateGeneral(
    data: Partial<GeneralSettings>,
    userRole = 'admin'
  ): Promise<GeneralSettings> {
    const res = await axios.put(`${BASE_URL}/general`, data, {
      headers: { 'x-user-role': userRole },
    });
    return res.data.data.general;
  },

  async updateProfile(data: Partial<ProfileSettings>): Promise<ProfileSettings> {
    const res = await axios.put(`${BASE_URL}/profile`, data);
    return res.data.data.profile;
  },

  async updateNotifications(data: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const res = await axios.put(`${BASE_URL}/notifications`, data);
    return res.data.data.notifications;
  },

  async updateAi(data: Partial<AiSettings>, userRole = 'admin'): Promise<AiSettings> {
    const res = await axios.put(`${BASE_URL}/ai`, data, {
      headers: { 'x-user-role': userRole },
    });
    return res.data.data.ai;
  },

  async updateAppearance(data: Partial<AppearanceSettings>): Promise<AppearanceSettings> {
    const res = await axios.put(`${BASE_URL}/appearance`, data);
    return res.data.data.appearance;
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const res = await axios.put(`${BASE_URL}/security/password`, {
      currentPassword,
      newPassword,
    });
    return res.data.data;
  },

  async revokeSession(id: string): Promise<ActiveSession[]> {
    const res = await axios.delete(`${BASE_URL}/security/sessions/${id}`);
    return res.data.data.activeSessions;
  },
};
