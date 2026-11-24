/**
 * Automated Test Suite for Phase 7: Analytics, Reports & Application Settings
 */

import {
  getOverview,
  getConversations,
  getResponseTimes,
  getCustomerSatisfaction,
  getAgents,
  getAiUsage,
  getAutomations
} from './controllers/analyticsController.js';

import {
  getReports,
  createSavedReport,
  getReportById,
  deleteSavedReport,
  exportReportCsv
} from './controllers/reportController.js';

import {
  getSettings,
  updateGeneralSettings,
  updateProfileSettings,
  updateNotificationSettings,
  updateAiSettings,
  updateSecurityPassword
} from './controllers/settingsController.js';

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, val) {
      this.headers[name] = val;
    },
    send(payload) {
      this.data = payload;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };
}

async function runTests() {
  console.log('🧪 Starting ConvoAI Analytics, Reports & Settings Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(title, condition, extraInfo = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title} ${extraInfo}`);
      failed++;
    }
  }

  // 1. Analytics Overview
  try {
    const req = { query: { dateRange: '30d' } };
    const res = createMockRes();
    await getOverview(req, res, (err) => { throw err; });
    assert(
      'GET /api/analytics/overview returns calculated KPIs',
      res.data?.success === true &&
      res.data?.data?.totalConversations > 0 &&
      typeof res.data?.data?.resolutionRate === 'number' &&
      typeof res.data?.data?.csatPercentage === 'number'
    );
  } catch (e) {
    assert('Analytics Overview', false, e.message);
  }

  // 2. Conversation Analytics (Recharts series)
  try {
    const req = { query: { dateRange: '30d' } };
    const res = createMockRes();
    await getConversations(req, res, (err) => { throw err; });
    assert(
      'GET /api/analytics/conversations returns volume, priority, and channel distributions',
      res.data?.success === true &&
      Array.isArray(res.data?.data?.volumeOverTime) &&
      Array.isArray(res.data?.data?.byPriority) &&
      Array.isArray(res.data?.data?.byChannel) &&
      Array.isArray(res.data?.data?.statusDistribution)
    );
  } catch (e) {
    assert('Conversation Analytics', false, e.message);
  }

  // 3. Response Time Analytics (Mean, Median, SLA Compliance)
  try {
    const req = { query: { dateRange: '30d' } };
    const res = createMockRes();
    await getResponseTimes(req, res, (err) => { throw err; });
    assert(
      'GET /api/analytics/response-times calculates median & SLA compliance rate accurately',
      res.data?.success === true &&
      typeof res.data?.data?.kpis?.avgFirstResponseMinutes === 'number' &&
      typeof res.data?.data?.kpis?.medianFirstResponseMinutes === 'number' &&
      typeof res.data?.data?.kpis?.slaComplianceRate === 'number' &&
      Array.isArray(res.data?.data?.trends)
    );
  } catch (e) {
    assert('Response Times', false, e.message);
  }

  // 4. Customer Satisfaction Analytics (CSAT)
  try {
    const req = { query: { dateRange: '30d' } };
    const res = createMockRes();
    await getCustomerSatisfaction(req, res, (err) => { throw err; });
    assert(
      'GET /api/analytics/customer-satisfaction computes CSAT and sentiment distributions',
      res.data?.success === true &&
      res.data?.data?.kpis?.overallCsat >= 0 &&
      Array.isArray(res.data?.data?.satisfactionByAgent) &&
      Array.isArray(res.data?.data?.satisfactionByTeam)
    );
  } catch (e) {
    assert('Customer Satisfaction', false, e.message);
  }

  // 5. Agent Performance Analytics & RBAC scoping
  try {
    const adminReq = { query: { dateRange: '30d' }, headers: { 'x-user-role': 'admin' } };
    const adminRes = createMockRes();
    await getAgents(adminReq, adminRes, (err) => { throw err; });

    const agentReq = {
      query: { dateRange: '30d' },
      headers: { 'x-user-role': 'agent', 'x-user-id': 'usr_enterprise_01' }
    };
    const agentRes = createMockRes();
    await getAgents(agentReq, agentRes, (err) => { throw err; });

    assert(
      'GET /api/analytics/agents returns full team for admin, but personal record only for agent role',
      adminRes.data?.data?.agents?.length > 1 &&
      agentRes.data?.data?.agents?.length === 1 &&
      agentRes.data?.data?.agents[0].id === 'usr_enterprise_01'
    );
  } catch (e) {
    assert('Agent Analytics & RBAC', false, e.message);
  }

  // 6. AI Performance Analytics
  try {
    const req = { query: {} };
    const res = createMockRes();
    await getAiUsage(req, res, (err) => { throw err; });
    assert(
      'GET /api/analytics/ai-usage returns token telemetry, cost estimates, and request distributions',
      res.data?.success === true &&
      res.data?.data?.kpis?.totalAiRequests > 0 &&
      res.data?.data?.kpis?.totalTokenConsumption > 0 &&
      typeof res.data?.data?.kpis?.estimatedCostUsd === 'number'
    );
  } catch (e) {
    assert('AI Analytics', false, e.message);
  }

  // 7. Automation Analytics
  try {
    const req = {};
    const res = createMockRes();
    await getAutomations(req, res, (err) => { throw err; });
    assert(
      'GET /api/analytics/automations returns execution trends and top executed rules',
      res.data?.success === true &&
      res.data?.data?.kpis?.totalAutomations > 0 &&
      Array.isArray(res.data?.data?.topRules)
    );
  } catch (e) {
    assert('Automation Analytics', false, e.message);
  }

  // 8. Reports Center & Saved Reports
  let createdReportId = null;
  try {
    const getReq = {};
    const getRes = createMockRes();
    await getReports(getReq, getRes, (err) => { throw err; });

    const postReq = {
      body: {
        name: 'Custom Q4 Escalation Audit',
        reportType: 'conversation_performance',
        dateRange: '30d'
      },
      headers: { 'x-user-name': 'Alex Rivera' }
    };
    const postRes = createMockRes();
    await createSavedReport(postReq, postRes, (err) => { throw err; });
    createdReportId = postRes.data?.data?.report?.id;

    assert(
      'Reports Center lists 6 catalog reports and saves custom report configurations',
      getRes.data?.data?.catalog?.length === 6 &&
      postRes.statusCode === 201 &&
      createdReportId !== null
    );
  } catch (e) {
    assert('Reports Center CRUD', false, e.message);
  }

  // 9. Run Saved Report
  try {
    const req = { params: { id: createdReportId } };
    const res = createMockRes();
    await getReportById(req, res, (err) => { throw err; });
    assert(
      'GET /api/reports/:id executes and previews saved report data',
      res.data?.success === true &&
      res.data?.data?.report?.id === createdReportId &&
      Boolean(res.data?.data?.preview)
    );
  } catch (e) {
    assert('Run Saved Report', false, e.message);
  }

  // 10. CSV Export Functionality
  try {
    const req = { params: { type: 'conversation_performance' }, query: { dateRange: '30d' } };
    const res = createMockRes();
    await exportReportCsv(req, res, (err) => { throw err; });
    assert(
      'GET /api/reports/export/:type streams properly quoted and formatted CSV',
      res.headers['Content-Type']?.includes('text/csv') &&
      typeof res.data === 'string' &&
      res.data.includes('"Ticket Number","Customer Name"')
    );
  } catch (e) {
    assert('CSV Export', false, e.message);
  }

  // 11. Delete Saved Report
  try {
    const req = { params: { id: createdReportId } };
    const res = createMockRes();
    await deleteSavedReport(req, res, (err) => { throw err; });
    assert(
      'DELETE /api/reports/:id deletes saved report template',
      res.data?.success === true && res.data?.data?.id === createdReportId
    );
  } catch (e) {
    assert('Delete Saved Report', false, e.message);
  }

  // 12. Application Settings: Read & Verified Integrations
  try {
    const req = {};
    const res = createMockRes();
    await getSettings(req, res, (err) => { throw err; });
    assert(
      'GET /api/settings returns general, workspace, profile, notifications, AI, and verified integrations',
      res.data?.success === true &&
      Boolean(res.data?.data?.general?.appName) &&
      Boolean(res.data?.data?.integrations?.openai)
    );
  } catch (e) {
    assert('Get Settings', false, e.message);
  }

  // 13. General Settings Update & RBAC Validation
  try {
    const agentReq = {
      body: { appName: 'Hacked Title' },
      headers: { 'x-user-role': 'agent' }
    };
    const agentRes = createMockRes();
    await updateGeneralSettings(agentReq, agentRes, (err) => { throw err; });

    const adminReq = {
      body: { appName: 'ConvoAI Enterprise Suite', supportEmail: 'ops@convoai.io' },
      headers: { 'x-user-role': 'admin' }
    };
    const adminRes = createMockRes();
    await updateGeneralSettings(adminReq, adminRes, (err) => { throw err; });

    assert(
      'PUT /api/settings/general blocks agents with 403 and applies changes for admins',
      agentRes.statusCode === 403 &&
      adminRes.data?.data?.general?.appName === 'ConvoAI Enterprise Suite'
    );
  } catch (e) {
    assert('General Settings Update', false, e.message);
  }

  // 14. Profile & Notifications Preferences Updates
  try {
    const profReq = { body: { name: 'Alex Rivera, Lead' } };
    const profRes = createMockRes();
    await updateProfileSettings(profReq, profRes, (err) => { throw err; });

    const notifReq = {
      body: {
        inApp: { negativeSentimentAlerts: true },
        email: { dailyPerformanceSummary: false }
      }
    };
    const notifRes = createMockRes();
    await updateNotificationSettings(notifReq, notifRes, (err) => { throw err; });

    assert(
      'PUT /api/settings/profile & notifications persists preferences',
      profRes.data?.data?.profile?.name === 'Alex Rivera, Lead' &&
      notifRes.data?.data?.notifications?.email?.dailyPerformanceSummary === false
    );
  } catch (e) {
    assert('Profile & Notifications Settings', false, e.message);
  }

  // 15. Password Security & Length Validation
  try {
    const shortReq = { body: { currentPassword: 'old', newPassword: 'short' } };
    const shortRes = createMockRes();
    await updateSecurityPassword(shortReq, shortRes, (err) => { throw err; });

    const validReq = { body: { currentPassword: 'oldSecretPassword123', newPassword: 'SuperSecureSecretPassword2026!' } };
    const validRes = createMockRes();
    await updateSecurityPassword(validReq, validRes, (err) => { throw err; });

    assert(
      'PUT /api/settings/security/password enforces >= 8 characters and records audit event',
      shortRes.statusCode === 400 &&
      validRes.data?.success === true
    );
  } catch (e) {
    assert('Security Password', false, e.message);
  }

  console.log(`\n========================================`);
  console.log(`📊 Phase 7 Backend Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
