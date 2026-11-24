import React from 'react';
import { Shield, Check, Users, UserCog, UserCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setUserRole } from '@/app/store/slices/authSlice';
import { addToast } from '@/app/store/slices/toastSlice';
import { Dropdown } from '@/components/ui/Dropdown';
import { AppRole } from '../types/permissions';
import { ROLE_DEFINITIONS } from '../utils/permissions';
import { cn } from '@/utils/cn';

export const RoleSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  let currentRole: AppRole = 'admin';
  if (user?.role === 'owner' || user?.role === 'admin') {
    currentRole = 'admin';
  } else if ((user?.role as string) === 'manager') {
    currentRole = 'manager';
  } else {
    currentRole = 'agent';
  }

  const handleRoleChange = (newRole: AppRole) => {
    dispatch(setUserRole(newRole));
    dispatch(
      addToast({
        type: 'info',
        title: `Switched to ${ROLE_DEFINITIONS[newRole].label}`,
        message: `RBAC simulation active: ${ROLE_DEFINITIONS[newRole].description}`,
        duration: 4000,
      })
    );
  };

  const getRoleIcon = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />;
      case 'manager':
        return <UserCog className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'agent':
        return <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    }
  };

  const getBadgeStyle = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800/60';
      case 'manager':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60';
      case 'agent':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60';
    }
  };

  const trigger = (
    <button
      type="button"
      className={cn(
        'hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all hover:opacity-90 select-none shadow-2xs',
        getBadgeStyle(currentRole)
      )}
      title="Click to simulate Admin, Manager, or Agent role"
    >
      {getRoleIcon(currentRole)}
      <span>Role: {ROLE_DEFINITIONS[currentRole].label.replace('Workspace ', '')}</span>
      <span className="text-[10px] opacity-60">▾</span>
    </button>
  );

  return (
    <Dropdown trigger={trigger} align="right" width="w-72">
      <div className="p-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-600" />
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Role Simulation (RBAC)
          </p>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Switch roles to live-test permissions, button gating, and access levels across CRM and Team Roster.
        </p>
      </div>

      <div className="p-1 space-y-1">
        {(Object.keys(ROLE_DEFINITIONS) as AppRole[]).map((r) => {
          const def = ROLE_DEFINITIONS[r];
          const isActive = currentRole === r;

          return (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r)}
              className={cn(
                'w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition-colors text-xs',
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 font-semibold'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
              )}
            >
              <div className="mt-0.5">{getRoleIcon(r)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span>{def.label}</span>
                  {isActive && (
                    <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] font-normal text-slate-400 dark:text-slate-500 line-clamp-2 mt-0.5">
                  {def.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Dropdown>
  );
};
