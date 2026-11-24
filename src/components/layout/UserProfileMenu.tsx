import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  Command,
  LogOut,
  Building2,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { updateUserStatus, logout } from '@/app/store/slices/authSlice';
import { setGlobalSearchOpen } from '@/app/store/slices/uiSlice';
import { UserStatus } from '@/types/user';
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/ui/Dropdown';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

const statusOptions: { value: UserStatus; label: string; color: string }[] = [
  { value: 'online', label: 'Online', color: 'bg-emerald-500' },
  { value: 'busy', label: 'Busy (In calls)', color: 'bg-rose-500' },
  { value: 'away', label: 'Away', color: 'bg-amber-500' },
  { value: 'offline', label: 'Appear Offline', color: 'bg-slate-400' },
];

export const UserProfileMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  const trigger = (
    <button
      type="button"
      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none"
      aria-label="User profile menu"
    >
      <Avatar
        src={user.avatarUrl}
        name={user.name}
        status={user.status}
        size="sm"
      />
      <div className="hidden lg:flex flex-col text-left">
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
          {user.name}
        </span>
        <span className="text-[10px] text-slate-400 leading-tight capitalize">
          {user.role}
        </span>
      </div>
      <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-slate-400 shrink-0" />
    </button>
  );

  return (
    <Dropdown trigger={trigger} align="right" width="w-64">
      {/* User Info Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
            {user.name}
          </p>
          <Badge variant="primary" size="sm">
            {user.currentWorkspace.plan}
          </Badge>
        </div>
        <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
        
        {/* Workspace pill */}
        <div className="mt-2.5 flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{user.currentWorkspace.name}</span>
        </div>
      </div>

      {/* Presence Status Section */}
      <div className="py-1 px-1">
        <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Set Presence Status
        </div>
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => dispatch(updateUserStatus(opt.value))}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className={cn('w-2 h-2 rounded-full', opt.color)} />
              <span>{opt.label}</span>
            </div>
            {user.status === opt.value && (
              <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            )}
          </button>
        ))}
      </div>

      <DropdownDivider />

      {/* Menu Options */}
      <div className="py-1">
        <DropdownItem
          icon={<User className="w-4 h-4" />}
          onClick={() => navigate('/settings')}
        >
          My Profile & Account
        </DropdownItem>
        <DropdownItem
          icon={<Settings className="w-4 h-4" />}
          onClick={() => navigate('/settings')}
        >
          Preferences
        </DropdownItem>
        <DropdownItem
          icon={<Command className="w-4 h-4" />}
          onClick={() => dispatch(setGlobalSearchOpen(true))}
          badge={<kbd className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-400">Ctrl+K</kbd>}
        >
          Keyboard Shortcuts
        </DropdownItem>
      </div>

      <DropdownDivider />

      {/* Logout */}
      <div className="py-1">
        <DropdownItem
          icon={<LogOut className="w-4 h-4" />}
          danger
          onClick={() => {
            dispatch(logout());
          }}
        >
          Sign Out
        </DropdownItem>
      </div>
    </Dropdown>
  );
};
