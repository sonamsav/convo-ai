import { useAppSelector } from '@/app/store/hooks';
import { AppRole, PermissionAction } from '../types/permissions';
import { hasPermission, ROLE_DEFINITIONS } from '../utils/permissions';

export function usePermissions() {
  const user = useAppSelector((state) => state.auth.user);
  // Normalize user.role to AppRole ('owner' -> 'admin', 'viewer' -> 'agent')
  let role: AppRole = 'admin';
  if (user?.role === 'owner' || user?.role === 'admin') {
    role = 'admin';
  } else if ((user?.role as string) === 'manager') {
    role = 'manager';
  } else {
    role = 'agent';
  }

  const can = (action: PermissionAction) => hasPermission(role, action);

  return {
    role,
    roleDefinition: ROLE_DEFINITIONS[role],
    can,
    isAdmin: role === 'admin',
    isManager: role === 'manager',
    isAgent: role === 'agent',
  };
}
