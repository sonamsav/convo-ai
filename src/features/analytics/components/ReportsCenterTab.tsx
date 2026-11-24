import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Bookmark,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { ReportCatalogItem, SavedReport, ReportType } from '../types/reports';
import { AnalyticsFilter } from '../types/analytics';
import { Button, Badge, Modal } from '@/components/ui';
import { reportService } from '../services/reportService';

interface ReportsCenterTabProps {
  catalog: ReportCatalogItem[];
  savedReports: SavedReport[];
  currentFilter: AnalyticsFilter;
  onRefreshReports: () => void;
  onOpenSavedModal: () => void;
}

const REPORT_ICONS: Record<ReportType, React.ElementType> = {
  conversation_performance: FileText,
  agent_performance: Users,
  customer_satisfaction: Sparkles,
  ai_usage: Sparkles,
  automation_performance: Zap,
  customer_activity: Layers,
};

export const ReportsCenterTab: React.FC<ReportsCenterTabProps> = ({
  catalog,
  savedReports,
  currentFilter,
  onRefreshReports,
  onOpenSavedModal,
}) => {
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveReportName, setSaveReportName] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handlePreview = (item: ReportCatalogItem) => {
    setSelectedReportType(item.type);
    setPreviewTitle(item.title);
    setIsPreviewOpen(true);
  };

  const handleDownload = (type: ReportType) => {
    reportService.downloadCsv(type, currentFilter);
  };

  const handleSaveReport = async () => {
    if (!saveReportName.trim() || !selectedReportType) return;
    try {
      setIsSaving(true);
      await reportService.createSavedReport({
        name: saveReportName.trim(),
        reportType: selectedReportType,
        dateRange: currentFilter.dateRange,
        teamId: currentFilter.teamId,
        agentId: currentFilter.agentId,
      });
      setIsSaveModalOpen(false);
      setSaveReportName('');
      onRefreshReports();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Banner */}
      <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Enterprise Reports Center
          </h3>
          <p className="text-xs text-slate-500">
            Export structured business intelligence datasets formatted with UTF-8 character encoding and sanitized data.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSavedModal}
          leftIcon={<Bookmark className="w-3.5 h-3.5 text-brand-600" />}
        >
          Saved Templates ({savedReports.length})
        </Button>
      </div>

      {/* 6 Report Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {catalog.map((item) => {
          const Icon = REPORT_ICONS[item.type] || FileText;

          return (
            <div
              key={item.type}
              className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card flex flex-col justify-between space-y-4 hover:border-brand-300 dark:hover:border-brand-700/60 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <Badge variant="neutral" size="sm">
                    CSV Ready
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-850 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>Scope: <strong>{currentFilter.dateRange}</strong></span>
                  <span>Team: <strong>{currentFilter.teamId || 'All'}</strong></span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedReportType(item.type);
                    setSaveReportName(`${item.title} (${currentFilter.dateRange})`);
                    setIsSaveModalOpen(true);
                  }}
                  leftIcon={<Bookmark className="w-3.5 h-3.5" />}
                  title="Save Configuration"
                >
                  Save
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(item)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Preview
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownload(item.type)}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Export CSV
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={`Report Preview: ${previewTitle}`}
          size="lg"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Date Filter: <strong>{currentFilter.dateRange}</strong></span>
              <span>Target: <strong>Live Platform Telemetry</strong></span>
              <Badge variant="success" size="sm">
                Generated
              </Badge>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs text-slate-700 dark:text-slate-300 overflow-x-auto space-y-2">
              <p className="font-bold text-slate-900 dark:text-slate-100 border-b pb-1">
                CSV Column Header Preview:
              </p>
              {selectedReportType === 'conversation_performance' && (
                <p>"Ticket Number","Customer Name","Customer Email","Channel","Priority","Status","First Response (Mins)","Resolution (Mins)","CSAT Rating","Sentiment","Created At"</p>
              )}
              {selectedReportType === 'agent_performance' && (
                <p>"Agent Name","Team","Role","Assigned Conversations","Resolved Conversations","Resolution Rate (%)","Avg Response Time (Mins)","Avg Resolution Time (Mins)","CSAT Rating"</p>
              )}
              {selectedReportType === 'customer_satisfaction' && (
                <p>"Ticket Number","Customer Name","CSAT Rating","Feedback Comment","Sentiment","Date"</p>
              )}
              {selectedReportType === 'ai_usage' && (
                <p>"Metric","Value"</p>
              )}
              {selectedReportType === 'automation_performance' && (
                <p>"Rule Name","Trigger Type","Status","Execution Count","Success Rate (%)"</p>
              )}
              {selectedReportType === 'customer_activity' && (
                <p>"Customer Name","Company","Plan Tier","Total Tickets","Status","Customer Since"</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setIsPreviewOpen(false)}>
                Close Preview
              </Button>

              {selectedReportType && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleDownload(selectedReportType);
                    setIsPreviewOpen(false);
                  }}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download Full CSV Dataset
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Save Template Modal */}
      {isSaveModalOpen && (
        <Modal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          title="Save Custom Report Configuration"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Save this report configuration to quickly re-run and export with your custom filters.
            </p>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                Report Name
              </label>
              <input
                type="text"
                value={saveReportName}
                onChange={(e) => setSaveReportName(e.target.value)}
                placeholder="e.g. Q4 Executive SLA Summary"
                className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsSaveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveReport}
                isLoading={isSaving}
                leftIcon={<Bookmark className="w-3.5 h-3.5" />}
              >
                Save Template
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
