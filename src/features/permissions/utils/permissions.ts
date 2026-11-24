import { AppRole, PermissionAction, RoleDefinition } from '../types/permissions';

export const ROLE_DEFINITIONS: Record<AppRole, RoleDefinition> = {
  admin: {
    role: 'admin',
    label: 'Workspace Admin',
    description: 'Full administrative access to manage customers, agents, teams, routing, and system settings.',
    badgeVariant: 'primary',
    permissions: [
      'customers:view',
      'customers:create',
      'customers:edit',
      'customers:delete',
      'customers:export',
      'customers:bulk_tag',
      'agents:view',
      'agents:create',
      'agents:edit',
      'agents:delete',
      'agents:toggle_status',
      'teams:view',
      'teams:create',
      'teams:edit',
      'teams:delete',
      'inbox:view',
      'inbox:reply',
      'inbox:assign',
      'inbox:resolve',
      'settings:manage',
      'analytics:view',
    ],
  },
  manager: {
    role: 'manager',
    label: 'Support Manager',
    description: 'Manages support team operations, agent assignments, customer CRM records, and performance analytics.',
    badgeVariant: 'success',
    permissions: [
      'customers:view',
      'customers:create',
      'customers:edit',
      'customers:export',
      'customers:bulk_tag',
      'agents:view',
      'agents:create',
      'agents:edit',
      'agents:toggle_status',
      'teams:view',
      'teams:create',
      'teams:edit',
      'inbox:view',
      'inbox:reply',
      'inbox:assign',
      'inbox:resolve',
      'analytics:view',
    ],
  },
  agent: {
    role: 'agent',
    label: 'Support Agent',
    description: 'Handles day-to-day customer conversations, updates notes, tags, and views assigned accounts.',
    badgeVariant: 'neutral',
    permissions: [
      'customers:view',
      'customers:edit',
      'customers:bulk_tag',
      'agents:view',
      'teams:view',
      'inbox:view',
      'inbox:reply',
      'inbox:assign',
      'inbox:resolve',
    ],
  },
};

/**
 * Checks if a given role has permission for an action.
 */
export function hasPermission(role: AppRole | undefined | null, action: PermissionAction): boolean {
  if (!role) return false;
  const def = ROLE_DEFINITIONS[role];
  if (!def) return false;
  return def.permissions.includes(action);
}

/**
 * Gets a human-friendly denial message when an action is blocked by RBAC.
 */
export function getPermissionDenialReason(action: PermissionAction): string {
  switch (action) {
    case 'customers:delete':
      return 'Only Workspace Admins can permanently delete customer records.';
    case 'agents:delete':
      return 'Only Workspace Admins can delete registered agent profiles.';
    case 'agents:create':
      return 'Admin or Manager privileges are required to provision new agents.';
    case 'teams:delete':
    case 'teams:create':
    case 'teams:edit':
      return 'Admin or Manager role required to alter team topologies.';
    case 'settings:manage':
      return 'Restricted to Workspace Admins.';
    default:
      return 'You do not have sufficient permissions to perform this action.';
  }
}
