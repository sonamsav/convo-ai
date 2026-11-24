import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  onRowClick?: (row: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching your query.',
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  pagination,
  className,
}: DataTableProps<T>): React.ReactElement {
  return (
    <div className={cn('w-full flex flex-col space-y-3', className)}>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 text-slate-500 dark:text-slate-400 font-medium">
              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                const canSort = col.sortable && onSort;

                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={{ width: col.width }}
                    onClick={() => canSort && onSort(col.key)}
                    className={cn(
                      'px-4 py-3 select-none font-semibold uppercase tracking-wider text-[11px]',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      canSort && 'cursor-pointer hover:text-slate-900 dark:hover:text-slate-100',
                      col.className
                    )}
                  >
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        col.align === 'right' && 'justify-end',
                        col.align === 'center' && 'justify-center'
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="shrink-0 text-slate-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {isLoading ? (
              // Loading Skeleton rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={`col-${cIdx}`} className="px-4 py-3.5">
                      <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, rIndex) => (
                <tr
                  key={keyExtractor(row, rIndex)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    'transition-colors duration-100 hover:bg-slate-50/80 dark:hover:bg-slate-800/50',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col) => {
                    let cellContent: React.ReactNode = null;

                    if (col.render) {
                      const rawValue =
                        typeof col.accessor === 'function'
                          ? col.accessor(row)
                          : col.accessor
                          ? (row as any)[col.accessor]
                          : undefined;
                      cellContent = col.render(rawValue, row, rIndex);
                    } else if (typeof col.accessor === 'function') {
                      cellContent = col.accessor(row);
                    } else if (col.accessor) {
                      cellContent = (row as any)[col.accessor] as React.ReactNode;
                    }

                    return (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-slate-700 dark:text-slate-300',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center',
                          col.className
                        )}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {(pagination.currentPage - 1) * pagination.pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
            </strong>{' '}
            of{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {pagination.totalItems}
            </strong>{' '}
            entries
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <span className="px-2 font-medium">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="xs"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
