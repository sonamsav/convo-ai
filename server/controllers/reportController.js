/**
 * Report Controller for ConvoAI
 * Handles report generation, saved reports, and CSV export streaming
 */

import {
  filterConversations,
  getConversationAnalytics,
  getAgentPerformanceAnalytics,
  getCsatAnalytics,
  getAiAnalytics,
  getAutomationAnalytics
} from '../services/analyticsService.js';
import { HISTORICAL_CONVERSATIONS } from '../data/analyticsDataset.js';

let savedReportsStore = [
  {
    id: 'rep-1',
    name: 'Weekly Executive Resolution Summary',
    reportType: 'conversation_performance',
    dateRange: '7d',
    teamId: 'all',
    agentId: 'all',
    createdBy: 'Alex Rivera',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'rep-2',
    name: 'Monthly Tier 2 SLA Compliance Audit',
    reportType: 'agent_performance',
    dateRange: '30d',
    teamId: 'team-tech',
    agentId: 'all',
    createdBy: 'Alex Rivera',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  },
  {
    id: 'rep-3',
    name: 'VIP Customer Satisfaction Matrix',
    reportType: 'customer_satisfaction',
    dateRange: '30d',
    teamId: 'team-success',
    agentId: 'all',
    createdBy: 'Liam Sterling',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString()
  }
];

export const REPORT_CATALOG = [
  {
    type: 'conversation_performance',
    title: 'Conversation Performance Report',
    description: 'Detailed analysis of conversation volumes, resolution rates, channel distribution, and response times.'
  },
  {
    type: 'agent_performance',
    title: 'Agent Performance Report',
    description: 'Individual and team productivity, resolution speeds, volume handled, and CSAT benchmarks.'
  },
  {
    type: 'customer_satisfaction',
    title: 'Customer Satisfaction (CSAT) Report',
    description: 'Customer sentiment dynamics, CSAT survey ratings, positive/negative feedback, and breakdown by agent.'
  },
  {
    type: 'ai_usage',
    title: 'AI Usage & Cost Intelligence Report',
    description: 'OpenAI request volume, token consumption, feature distribution, and cost estimates.'
  },
  {
    type: 'automation_performance',
    title: 'Automation Workflow Performance Report',
    description: 'Rule execution volumes, pass/fail rates, time saved, and top active automated workflows.'
  },
  {
    type: 'customer_activity',
    title: 'Customer Activity & Engagement Report',
    description: 'High-volume account interactions, ticket frequencies, and plan-level ticket distribution.'
  }
];

/**
 * GET /api/reports
 * Returns available report definitions and saved report templates
 */
export async function getReports(req, res, next) {
  try {
    res.json({
      success: true,
      data: {
        catalog: REPORT_CATALOG,
        savedReports: savedReportsStore
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/reports
 * Saves a new report configuration
 */
export async function createSavedReport(req, res, next) {
  try {
    const { name, reportType, dateRange = '30d', teamId = 'all', agentId = 'all' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Report name is required.' }
      });
    }

    const newReport = {
      id: `rep-${Date.now()}`,
      name: name.trim(),
      reportType,
      dateRange,
      teamId,
      agentId,
      createdBy: req.headers['x-user-name'] || 'Alex Rivera',
      createdAt: new Date().toISOString()
    };

    savedReportsStore.unshift(newReport);

    res.status(201).json({
      success: true,
      data: { report: newReport }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reports/:id
 * Runs and returns data for a specific saved report
 */
export async function getReportById(req, res, next) {
  try {
    const { id } = req.params;
    const report = savedReportsStore.find((r) => r.id === id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: { message: `Saved report "${id}" was not found.` }
      });
    }

    // Run report data
    let reportData = null;
    const filterOptions = {
      dateRange: report.dateRange,
      teamId: report.teamId,
      agentId: report.agentId
    };

    switch (report.reportType) {
      case 'conversation_performance':
        reportData = getConversationAnalytics(filterOptions);
        break;
      case 'agent_performance':
        reportData = getAgentPerformanceAnalytics(filterOptions);
        break;
      case 'customer_satisfaction':
        reportData = getCsatAnalytics(filterOptions);
        break;
      case 'ai_usage':
        reportData = getAiAnalytics(filterOptions);
        break;
      case 'automation_performance':
        reportData = getAutomationAnalytics();
        break;
      default:
        reportData = getConversationAnalytics(filterOptions);
    }

    res.json({
      success: true,
      data: {
        report,
        preview: reportData
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/reports/:id
 */
export async function deleteSavedReport(req, res, next) {
  try {
    const { id } = req.params;
    const index = savedReportsStore.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: { message: `Saved report "${id}" was not found.` }
      });
    }

    const [deleted] = savedReportsStore.splice(index, 1);
    res.json({ success: true, data: { id: deleted.id, name: deleted.name } });
  } catch (err) {
    next(err);
  }
}

/**
 * Escape string for CSV cell
 */
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * GET /api/reports/export/:type
 * Generates and downloads real CSV data
 */
export async function exportReportCsv(req, res, next) {
  try {
    const { type } = req.params;
    const { dateRange = '30d', teamId = 'all', agentId = 'all' } = req.query;

    const convos = filterConversations({ dateRange, teamId, agentId });
    let csvContent = '';
    const dateStr = new Date().toISOString().split('T')[0];
    let filename = `convoai_${type}_${dateStr}.csv`;

    switch (type) {
      case 'conversations':
      case 'conversation_performance': {
        filename = `convoai_conversations_${dateStr}.csv`;
        const headers = [
          'Ticket Number',
          'Customer Name',
          'Customer Email',
          'Channel',
          'Priority',
          'Status',
          'First Response (Mins)',
          'Resolution (Mins)',
          'CSAT Rating',
          'Sentiment',
          'Created At'
        ];
        csvContent += headers.map(escapeCsv).join(',') + '\r\n';

        convos.forEach((c) => {
          const row = [
            c.ticketNumber,
            c.customerName,
            c.customerEmail,
            c.channel,
            c.priority,
            c.status,
            c.firstResponseMinutes ?? 'N/A',
            c.resolutionMinutes ?? 'N/A',
            c.csatScore ?? 'N/A',
            c.sentiment,
            new Date(c.createdAt).toLocaleString()
          ];
          csvContent += row.map(escapeCsv).join(',') + '\r\n';
        });
        break;
      }

      case 'agents':
      case 'agent_performance': {
        filename = `convoai_agent_performance_${dateStr}.csv`;
        const { agents } = getAgentPerformanceAnalytics({ dateRange, teamId, agentId });
        const headers = [
          'Agent Name',
          'Team',
          'Role',
          'Assigned Conversations',
          'Resolved Conversations',
          'Resolution Rate (%)',
          'Avg Response Time (Mins)',
          'Avg Resolution Time (Mins)',
          'CSAT Rating'
        ];
        csvContent += headers.map(escapeCsv).join(',') + '\r\n';

        agents.forEach((a) => {
          const row = [
            a.name,
            a.teamName,
            a.role,
            a.assignedConversations,
            a.resolvedConversations,
            `${a.resolutionRate}%`,
            a.avgResponseMinutes,
            a.avgResolutionMinutes,
            a.csatRating
          ];
          csvContent += row.map(escapeCsv).join(',') + '\r\n';
        });
        break;
      }

      case 'customer_satisfaction': {
        filename = `convoai_csat_feedback_${dateStr}.csv`;
        const headers = [
          'Ticket Number',
          'Customer Name',
          'CSAT Rating',
          'Feedback Comment',
          'Sentiment',
          'Date'
        ];
        csvContent += headers.map(escapeCsv).join(',') + '\r\n';

        convos
          .filter((c) => typeof c.csatScore === 'number')
          .forEach((c) => {
            const row = [
              c.ticketNumber,
              c.customerName,
              `${c.csatScore} / 5`,
              c.csatFeedback || 'No written feedback provided',
              c.sentiment,
              new Date(c.createdAt).toLocaleDateString()
            ];
            csvContent += row.map(escapeCsv).join(',') + '\r\n';
          });
        break;
      }

      case 'ai_usage': {
        filename = `convoai_ai_usage_${dateStr}.csv`;
        const { kpis } = getAiAnalytics();
        const headers = ['Metric', 'Value'];
        csvContent += headers.map(escapeCsv).join(',') + '\r\n';
        csvContent += [escapeCsv('Total AI Invocations'), escapeCsv(kpis.totalAiRequests)].join(',') + '\r\n';
        csvContent += [escapeCsv('Successful Requests'), escapeCsv(kpis.successfulAiRequests)].join(',') + '\r\n';
        csvContent += [escapeCsv('Failed Requests'), escapeCsv(kpis.failedAiRequests)].join(',') + '\r\n';
        csvContent += [escapeCsv('Success Rate'), escapeCsv(`${kpis.successRate}%`)].join(',') + '\r\n';
        csvContent += [escapeCsv('Summarization Invocations'), escapeCsv(kpis.aiSummarizationUsage)].join(',') + '\r\n';
        csvContent += [escapeCsv('Smart Reply Invocations'), escapeCsv(kpis.smartReplyUsage)].join(',') + '\r\n';
        csvContent += [escapeCsv('Total Tokens Consumed'), escapeCsv(kpis.totalTokenConsumption)].join(',') + '\r\n';
        csvContent += [escapeCsv('Estimated Cost (USD)'), escapeCsv(`$${kpis.estimatedCostUsd}`)].join(',') + '\r\n';
        break;
      }

      default: {
        filename = `convoai_report_${dateStr}.csv`;
        const headers = ['Report Type', 'Date Range', 'Total Records'];
        csvContent += headers.map(escapeCsv).join(',') + '\r\n';
        csvContent += [escapeCsv(type), escapeCsv(dateRange), escapeCsv(convos.length)].join(',') + '\r\n';
      }
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (err) {
    next(err);
  }
}
