import React from 'react';
import {
  Calendar,
  Users,
  User,
  Download,
  RotateCw,
  Bookmark,
} from 'lucide-react';
import { AnalyticsFilter, AnalyticsDateRange } from '../types/analytics';
import { Button } from '@/components/ui';

interface AnalyticsHeaderProps {
  filters: AnalyticsFilter;
  onChangeFilters: (filters: AnalyticsFilter) => void;
  onRefresh: () => void;
  onExportCsv: () => void;
  onOpenSavedReports?: () => void;
  isLoading?: boolean;
}

const DATE_RANGE_OPTIONS: { value: AnalyticsDateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' },
];

const TEAMS = [
  { id: 'all', name: 'All Teams' },
  { id: 'team-tech', name: 'Technical Support' },
  { id: 'team-general', name: 'General Support' },
  { id: 'team-billing', name: 'Billing & Subscriptions' },
  { id: 'team-success', name: 'Customer Success & VIP' },
];

const AGENTS = [
  { id: 'all', name: 'All Agents' },
  { id: 'usr_enterprise_01', name: 'Alex Rivera' },
  { id: 'ag-1', name: 'Sarah Jenkins' },
  { id: 'ag-2', name: 'Devon Miles' },
  { id: 'ag-3', name: 'Maya Lin' },
  { id: 'ag-4', name: 'Liam Sterling' },
  { id: 'ag-5', name: 'Chloe Zhao' },
];

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  filters,
  onChangeFilters,
  onRefresh,
  onExportCsv,
  onOpenSavedReports,
  isLoading = false,
}) => {
  return (
    <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Filter Controls Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={filters.dateRange}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  dateRange: e.target.value as AnalyticsDateRange,
                })
              }
              aria-label="Filter analytics by date range"
              className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs">
            <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={filters.teamId || 'all'}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  teamId: e.target.value,
                })
              }
              aria-label="Filter analytics by support team"
              className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {TEAMS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Agent Filter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs">
            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={filters.agentId || 'all'}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  agentId: e.target.value,
                })
              }
              aria-label="Filter analytics by assigned agent"
              className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {AGENTS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onOpenSavedReports && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSavedReports}
              leftIcon={<Bookmark className="w-3.5 h-3.5 text-brand-600" />}
            >
              Saved Reports
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            isLoading={isLoading}
            leftIcon={<RotateCw className="w-3.5 h-3.5 text-slate-500" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Custom Date Range Sub-Bar if selected */}
      {filters.dateRange === 'custom' && (
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-400">Custom Date Range:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => onChangeFilters({ ...filters, startDate: e.target.value })}
              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => onChangeFilters({ ...filters, endDate: e.target.value })}
              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
};
