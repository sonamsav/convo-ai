import React from 'react';
import { Bookmark, Download, Trash2, Calendar, Users } from 'lucide-react';
import { SavedReport } from '../types/reports';
import { AnalyticsFilter } from '../types/analytics';
import { Modal, Button, Badge } from '@/components/ui';
import { reportService } from '../services/reportService';

interface SavedReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedReports: SavedReport[];
  onDeleteReport: (id: string) => Promise<void>;
  currentFilter: AnalyticsFilter;
}

export const SavedReportsModal: React.FC<SavedReportsModalProps> = ({
  isOpen,
  onClose,
  savedReports,
  onDeleteReport,
  currentFilter,
}) => {
  const handleDownload = (report: SavedReport) => {
    reportService.downloadCsv(report.reportType, {
      ...currentFilter,
      dateRange: report.dateRange,
      teamId: report.teamId || 'all',
      agentId: report.agentId || 'all',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Saved Report Configurations"
      size="md"
    >
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        {savedReports.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bookmark className="w-6 h-6 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold">No saved reports yet</p>
            <p className="text-[11px] text-slate-500">
              Save any report configuration from the Reports Center to quickly export it anytime.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {savedReports.map((report) => (
              <div
                key={report.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">
                    {report.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="font-mono uppercase">{report.reportType.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>Scope: {report.dateRange}</span>
                    <span>•</span>
                    <span>By {report.createdBy}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(report)}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    CSV
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteReport(report.id)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-500"
                    title="Delete Saved Configuration"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
