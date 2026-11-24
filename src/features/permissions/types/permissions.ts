export type AppRole = 'admin' | 'manager' | 'agent';

export type PermissionAction =
  // Customers
  | 'customers:view'
  | 'customers:create'
  | 'customers:edit'
  | 'customers:delete'
  | 'customers:export'
  | 'customers:bulk_tag'
  // Agents
  | 'agents:view'
  | 'agents:create'
  | 'agents:edit'
  | 'agents:delete'
  | 'agents:toggle_status'
  // Teams
  | 'teams:view'
  | 'teams:create'
  | 'teams:edit'
  | 'teams:delete'
  // Inbox
  | 'inbox:view'
  | 'inbox:reply'
  | 'inbox:assign'
  | 'inbox:resolve'
  // Settings & System
  | 'settings:manage'
  | 'analytics:view';

export interface RoleDefinition {
  role: AppRole;
  label: string;
  description: string;
  badgeVariant: 'primary' | 'success' | 'warning' | 'neutral';
  permissions: PermissionAction[];
}
