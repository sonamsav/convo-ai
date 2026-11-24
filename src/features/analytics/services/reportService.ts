/**
 * Reports API Client Service
 */

import axios from 'axios';
import { ReportCatalogItem, SavedReport, ReportType } from '../types/reports';
import { AnalyticsFilter } from '../types/analytics';

const BASE_URL = '/api/reports';

export const reportService = {
  async getReports(): Promise<{ catalog: ReportCatalogItem[]; savedReports: SavedReport[] }> {
    const res = await axios.get(BASE_URL);
    return res.data.data;
  },

  async createSavedReport(data: {
    name: string;
    reportType: ReportType;
    dateRange: string;
    teamId?: string;
    agentId?: string;
  }): Promise<SavedReport> {
    const res = await axios.post(BASE_URL, data);
    return res.data.data.report;
  },

  async getReportPreview(id: string): Promise<{ report: SavedReport; preview: any }> {
    const res = await axios.get(`${BASE_URL}/${id}`);
    return res.data.data;
  },

  async deleteSavedReport(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`);
  },

  downloadCsv(type: string, filter: AnalyticsFilter) {
    const params = new URLSearchParams();
    params.set('dateRange', filter.dateRange);
    if (filter.startDate) params.set('startDate', filter.startDate);
    if (filter.endDate) params.set('endDate', filter.endDate);
    if (filter.teamId) params.set('teamId', filter.teamId);
    if (filter.agentId) params.set('agentId', filter.agentId);

    window.open(`${BASE_URL}/export/${type}?${params.toString()}`, '_blank');
  },
};
