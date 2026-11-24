import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bot,
  Zap,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  toggleSidebar,
  setMobileSidebarOpen,
} from '@/app/store/slices/uiSlice';
import { NAVIGATION_SECTIONS } from '@/constants/navigation';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { NavItem } from '@/types/navigation';
import { cn } from '@/utils/cn';

interface SidebarContentProps {
  isCollapsed?: boolean;
  onItemClick?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  isCollapsed = false,
  onItemClick,
}) => {
  const location = useLocation();

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive =
      location.pathname === item.path ||
      (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

    const content = (
      <NavLink
        to={item.path}
        onClick={onItemClick}
        className={cn(
          'group relative flex items-center rounded-lg transition-all duration-150 select-none text-xs font-medium',
          isCollapsed
            ? 'justify-center w-10 h-10 mx-auto'
            : 'px-3 py-2.5 gap-3 w-full',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
            : 'text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
        )}
      >
        {/* Active border bar indicator */}
        {isActive && (
          <span
            className={cn(
              'absolute bg-brand-600 dark:bg-brand-400 rounded-r-full',
              isCollapsed
                ? 'left-0 inset-y-2 w-1'
                : 'left-0 inset-y-1.5 w-1'
            )}
          />
        )}

        {/* Icon */}
        <Icon
          className={cn(
            'w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105',
            isActive
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
          )}
        />

        {/* Label & Badge (when expanded) */}
        {!isCollapsed && (
          <div className="flex flex-1 items-center justify-between truncate">
            <span className="truncate">{item.label}</span>
            {item.badge !== undefined && (
              <Badge
                variant={item.badgeVariant || 'default'}
                size="sm"
                className="ml-auto font-semibold px-1.5 py-0.2"
              >
                {item.badge}
              </Badge>
            )}
          </div>
        )}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.id} content={item.label} position="right">
          <div className="w-full flex justify-center py-0.5">{content}</div>
        </Tooltip>
      );
    }

    return (
      <div key={item.id} className="py-0.5">
        {content}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Brand Logo & Header */}
      <div
        className={cn(
          'flex items-center h-14 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0 px-4 transition-all',
          isCollapsed ? 'justify-center' : 'justify-start gap-2.5'
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shrink-0">
          <Bot className="w-4 h-4" />
        </div>

        {!isCollapsed && (
          <div className="flex flex-col truncate">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              ConvoAI
              <span className="px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider rounded bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
              Enterprise Support
            </span>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAVIGATION_SECTIONS.map((section) => (
          <div key={section.id} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
                {section.title}
              </div>
            ) : (
              <div className="h-px bg-slate-200/60 dark:bg-slate-800/60 my-2" />
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => renderNavItem(item))}
            </div>
          </div>
        ))}
      </div>

      {/* AI Copilot Status Banner (Expanded only) */}
      {!isCollapsed && (
        <div className="p-3 mx-3 mb-3 rounded-lg bg-gradient-to-r from-brand-50 to-indigo-50/40 dark:from-slate-850 dark:to-brand-950/30 border border-brand-200/50 dark:border-brand-900/40">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Copilot Ready
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            AI Auto-Triage is actively classifying incoming customer queues.
          </p>
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isExpanded = useAppSelector((state) => state.ui.sidebarExpanded);
  const isMobileOpen = useAppSelector((state) => state.ui.sidebarMobileOpen);

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 transition-all duration-200 ease-in-out shrink-0 relative z-20',
          isExpanded ? 'w-64' : 'w-[72px]'
        )}
      >
        <SidebarContent isCollapsed={!isExpanded} />

        {/* Sidebar Collapse Toggle Button */}
        <div className="p-2 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className={cn(
              'p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
              !isExpanded && 'mx-auto'
            )}
            title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      <Drawer
        isOpen={isMobileOpen}
        onClose={() => dispatch(setMobileSidebarOpen(false))}
        placement="left"
        size="sm"
        showCloseButton={true}
        className="p-0 bg-white dark:bg-slate-900"
      >
        <div className="h-full flex flex-col">
          <SidebarContent
            isCollapsed={false}
            onItemClick={() => dispatch(setMobileSidebarOpen(false))}
          />
        </div>
      </Drawer>
    </>
  );
};
