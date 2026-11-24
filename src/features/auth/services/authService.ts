import axios from 'axios';
import { storage } from '@/utils/storage';

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'agent' | 'viewer';
    avatar: string;
    workspaceId: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await axios.post('/api/auth/login', { email, password });
    const data = res.data.data;
    storage.set('convoai_auth_token', data.accessToken);
    storage.set('convoai_refresh_token', data.refreshToken);
    storage.set('convoai_user', data.user);
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = storage.get<string | null>('convoai_refresh_token', null);
    try {
      if (refreshToken) {
        await axios.post('/api/auth/logout', { refreshToken });
      }
    } finally {
      storage.remove('convoai_auth_token');
      storage.remove('convoai_refresh_token');
      storage.remove('convoai_user');
    }
  },

  async getMe(): Promise<any> {
    const token = storage.get<string | null>('convoai_auth_token', null);
    if (!token) return null;
    const res = await axios.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data.user;
  },
};
