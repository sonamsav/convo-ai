import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input, InputProps } from './Input';
import { cn } from '@/utils/cn';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon'> {
  shortcutHint?: string;
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, shortcutHint, value, onClear, onChange, ...props }, ref) => {
    const hasValue = Boolean(value && String(value).length > 0);

    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={<Search className="w-4 h-4" />}
        value={value}
        onChange={onChange}
        rightIcon={
          hasValue && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : shortcutHint ? (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded select-none">
              {shortcutHint}
            </kbd>
          ) : null
        }
        className={cn('bg-slate-50/70 dark:bg-slate-900/70', className)}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
