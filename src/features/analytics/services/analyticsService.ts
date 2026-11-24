/**
 * Analytics API Client Service
 */

import axios from 'axios';
import {
  AnalyticsFilter,
  OverviewKPIs,
  ConversationAnalyticsData,
  ResponseTimeAnalyticsData,
  CsatAnalyticsData,
  AgentPerformanceRecord,
  AiAnalyticsData,
  AutomationAnalyticsData,
} from '../types/analytics';

const BASE_URL = '/api/analytics';

export const analyticsService = {
  async getOverview(filter: AnalyticsFilter): Promise<OverviewKPIs> {
    const res = await axios.get(`${BASE_URL}/overview`, { params: filter });
    return res.data.data;
  },

  async getConversations(filter: AnalyticsFilter): Promise<ConversationAnalyticsData> {
    const res = await axios.get(`${BASE_URL}/conversations`, { params: filter });
    return res.data.data;
  },

  async getResponseTimes(filter: AnalyticsFilter): Promise<ResponseTimeAnalyticsData> {
    const res = await axios.get(`${BASE_URL}/response-times`, { params: filter });
    return res.data.data;
  },

  async getCustomerSatisfaction(filter: AnalyticsFilter): Promise<CsatAnalyticsData> {
    const res = await axios.get(`${BASE_URL}/customer-satisfaction`, { params: filter });
    return res.data.data;
  },

  async getAgents(
    filter: AnalyticsFilter,
    userRole = 'admin',
    userId = 'usr_enterprise_01'
  ): Promise<{ agents: AgentPerformanceRecord[] }> {
    const res = await axios.get(`${BASE_URL}/agents`, {
      params: filter,
      headers: {
        'x-user-role': userRole,
        'x-user-id': userId,
      },
    });
    return res.data.data;
  },

  async getAiUsage(filter: AnalyticsFilter): Promise<AiAnalyticsData> {
    const res = await axios.get(`${BASE_URL}/ai-usage`, { params: filter });
    return res.data.data;
  },

  async getAutomations(): Promise<AutomationAnalyticsData> {
    const res = await axios.get(`${BASE_URL}/automations`);
    return res.data.data;
  },
};
