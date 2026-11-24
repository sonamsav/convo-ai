import React from 'react';
import { Menu, Search, Sun, Moon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { toggleMobileSidebar, setGlobalSearchOpen, toggleTheme } from '@/app/store/slices/uiSlice';
import { Breadcrumb } from './Breadcrumb';
import { NotificationsMenu } from './NotificationsMenu';
import { UserProfileMenu } from './UserProfileMenu';
import { Tooltip } from '@/components/ui/Tooltip';
import { RoleSwitcher } from '@/features/permissions/components/RoleSwitcher';
import { cn } from '@/utils/cn';

export const TopNavbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 transition-colors duration-150">
      {/* Left section: Mobile hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => dispatch(toggleMobileSidebar())}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Breadcrumb />
      </div>

      {/* Center/Right section: Search + Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Trigger */}
        <button
          type="button"
          onClick={() => dispatch(setGlobalSearchOpen(true))}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-750 border border-slate-200/70 dark:border-slate-700/60 rounded-lg transition-all duration-150',
            'w-36 sm:w-64 justify-between'
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Search or jump to...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle Button */}
        <Tooltip content={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </Tooltip>

        {/* Notifications Dropdown */}
        <NotificationsMenu />

        {/* RBAC Role Switcher */}
        <RoleSwitcher />

        {/* Vertical divider */}
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* User Profile Menu */}
        <UserProfileMenu />
      </div>
    </header>
  );
};
