import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  size = 'md',
  className,
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-slate-500 dark:text-slate-400 space-y-3',
        className
      )}
    >
      <Loader2 className={cn('animate-spin text-brand-600 dark:text-brand-400', sizeMap[size])} />
      {message && <p className="text-xs font-medium animate-pulse">{message}</p>}
    </div>
  );
};
