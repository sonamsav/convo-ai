import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';

const routeNameMap: Record<string, string> = {
  dashboard: 'Dashboard',
  inbox: 'Smart Inbox',
  customers: 'Customers',
  'ai-intelligence': 'AI Intelligence',
  agents: 'Team & Agents',
  analytics: 'Analytics & Reports',
  automation: 'Automation Rules',
  settings: 'Settings',
  security: 'Security & Permissions',
};

export const Breadcrumb: React.FC<{ className?: string }> = ({ className }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0 || (pathSegments.length === 1 && pathSegments[0] === 'dashboard')) {
    return (
      <div className={cn('hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400', className)}>
        <Home className="w-3.5 h-3.5" />
        <span>/</span>
        <span className="font-medium text-slate-800 dark:text-slate-200">Dashboard</span>
      </div>
    );
  }

  let accumulatedPath = '';

  return (
    <nav aria-label="Breadcrumb" className={cn('hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400', className)}>
      <Link
        to="/dashboard"
        className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-0.5 rounded"
        title="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {pathSegments.map((segment, index) => {
        accumulatedPath += `/${segment}`;
        const isLast = index === pathSegments.length - 1;
        const displayName = routeNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <React.Fragment key={accumulatedPath}>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                {displayName}
              </span>
            ) : (
              <Link
                to={accumulatedPath}
                className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors truncate max-w-[120px]"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
