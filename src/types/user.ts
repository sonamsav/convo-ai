export type UserRole = 'owner' | 'admin' | 'manager' | 'agent' | 'viewer';
export type UserStatus = 'online' | 'busy' | 'away' | 'offline';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  currentWorkspace: {
    id: string;
    name: string;
    plan: 'Starter' | 'Growth' | 'Enterprise';
    logoUrl?: string;
  };
}
