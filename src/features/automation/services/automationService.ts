/**
 * Client API Service for ConvoAI Automation Rules & Workflow Engine
 */

import axios from 'axios';
import {
  AutomationRule,
  AutomationExecution,
  AutomationTemplate,
  AutomationStats,
  AutomationFilterState
} from '../types/automation';

const API_BASE = '/api';

export const automationService = {
  /**
   * Fetches automations with optional filtering and pagination
   */
  async getAutomations(filters: Partial<AutomationFilterState> = {}): Promise<{
    automations: AutomationRule[];
    total: number;
    page: number;
    totalPages: number;
    stats: AutomationStats;
  }> {
    try {
      const response = await axios.get(`${API_BASE}/automations`, {
        params: filters
      });
      return response.data.data;
    } catch (err) {
      console.warn('[automationService] API request failed, falling back to local store.', err);
      return {
        automations: [],
        total: 0,
        page: 1,
        totalPages: 1,
        stats: {
          totalAutomations: 0,
          activeAutomations: 0,
          pausedAutomations: 0,
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0
        }
      };
    }
  },

  /**
   * Fetches pre-built automation templates
   */
  async getTemplates(): Promise<AutomationTemplate[]> {
    try {
      const response = await axios.get(`${API_BASE}/automations/templates`);
      return response.data.data.templates;
    } catch (err) {
      console.warn('[automationService] Error fetching templates:', err);
      return [];
    }
  },

  /**
   * Fetches single automation by ID with recent execution telemetry
   */
  async getAutomationById(id: string): Promise<{
    automation: AutomationRule;
    recentExecutions: AutomationExecution[];
  }> {
    const response = await axios.get(`${API_BASE}/automations/${id}`);
    return response.data.data;
  },

  /**
   * Creates new automation rule
   */
  async createAutomation(
    data: Partial<AutomationRule>,
    userHeaders?: { role?: string; name?: string }
  ): Promise<AutomationRule> {
    const response = await axios.post(`${API_BASE}/automations`, data, {
      headers: {
        'x-user-role': userHeaders?.role || 'admin',
        'x-user-name': userHeaders?.name || 'Alex Rivera'
      }
    });
    return response.data.data.automation;
  },

  /**
   * Updates existing automation
   */
  async updateAutomation(
    id: string,
    updates: Partial<AutomationRule>,
    userHeaders?: { role?: string }
  ): Promise<AutomationRule> {
    const response = await axios.put(`${API_BASE}/automations/${id}`, updates, {
      headers: {
        'x-user-role': userHeaders?.role || 'admin'
      }
    });
    return response.data.data.automation;
  },

  /**
   * Toggles status between active and paused
   */
  async toggleStatus(id: string, userHeaders?: { role?: string }): Promise<{ id: string; status: 'active' | 'paused' }> {
    const response = await axios.patch(
      `${API_BASE}/automations/${id}/status`,
      {},
      {
        headers: {
          'x-user-role': userHeaders?.role || 'admin'
        }
      }
    );
    return response.data.data;
  },

  /**
   * Duplicates an automation
   */
  async duplicateAutomation(id: string): Promise<AutomationRule> {
    const response = await axios.post(`${API_BASE}/automations/${id}/duplicate`);
    return response.data.data.automation;
  },

  /**
   * Deletes an automation (Admin only)
   */
  async deleteAutomation(id: string, userHeaders?: { role?: string }): Promise<{ id: string; name: string }> {
    const response = await axios.delete(`${API_BASE}/automations/${id}`, {
      headers: {
        'x-user-role': userHeaders?.role || 'admin'
      }
    });
    return response.data.data;
  },

  /**
   * Simulates/dispatches an event trigger to test live workflow execution
   */
  async testTrigger(
    eventType: string,
    context: Record<string, any>
  ): Promise<{
    matchedCount: number;
    results: any[];
    updatedContext: Record<string, any>;
  }> {
    const response = await axios.post(`${API_BASE}/automations/test-trigger`, {
      eventType,
      eventId: `test_${Date.now()}`,
      context
    });
    return response.data.data;
  },

  /**
   * Fetches execution history with search and pagination
   */
  async getExecutions(params: {
    search?: string;
    status?: string;
    automationId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    executions: AutomationExecution[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await axios.get(`${API_BASE}/automation-executions`, {
        params
      });
      return response.data.data;
    } catch (err) {
      console.warn('[automationService] Error fetching executions:', err);
      return { executions: [], total: 0, page: 1, totalPages: 1 };
    }
  },

  /**
   * Retries a failed execution record
   */
  async retryExecution(id: string): Promise<AutomationExecution> {
    const response = await axios.post(`${API_BASE}/automation-executions/${id}/retry`);
    return response.data.data.execution;
  }
};
