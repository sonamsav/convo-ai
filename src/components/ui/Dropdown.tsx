import React, { useState, useRef, ReactNode } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn } from '@/utils/cn';

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
  width?: string;
}

export interface DropdownItemProps {
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  className?: string;
  badge?: ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'right',
  className,
  width = 'w-56',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 rounded-xl bg-white dark:bg-slate-900 shadow-dropdown border border-slate-200 dark:border-slate-800 py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-100',
            align === 'right' ? 'right-0' : 'left-0',
            width,
            className
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem: React.FC<DropdownItemProps> = ({
  onClick,
  children,
  icon,
  danger = false,
  disabled = false,
  className,
  badge,
}) => {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors text-left select-none',
        danger
          ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      <div className="flex items-center gap-2.5 truncate">
        {icon && <span className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0">{icon}</span>}
        <span className="truncate">{children}</span>
      </div>
      {badge && <span className="ml-2 shrink-0">{badge}</span>}
    </button>
  );
};

export const DropdownHeader: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      'px-3.5 py-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none',
      className
    )}
  >
    {children}
  </div>
);

export const DropdownDivider: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('h-px my-1 bg-slate-100 dark:bg-slate-800', className)} />
);
