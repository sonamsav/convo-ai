/**
 * Reports Center Types for ConvoAI
 */

import { AnalyticsDateRange } from './analytics';

export type ReportType =
  | 'conversation_performance'
  | 'agent_performance'
  | 'customer_satisfaction'
  | 'ai_usage'
  | 'automation_performance'
  | 'customer_activity';

export interface ReportCatalogItem {
  type: ReportType;
  title: string;
  description: string;
}

export interface SavedReport {
  id: string;
  name: string;
  reportType: ReportType;
  dateRange: AnalyticsDateRange;
  teamId?: string;
  agentId?: string;
  createdBy: string;
  createdAt: string;
}
