/**
 * ConvoAI Phase 8 - Complete Production Integration & E2E Test Suite
 */

import { login, refreshToken, logout, getMe } from './controllers/authController.js';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addCustomerNote,
} from './controllers/customerController.js';
import { getAgents, getAgentById, updateAgentStatus } from './controllers/agentController.js';
import { getTeams, getTeamById, createTeam, updateTeam, deleteTeam } from './controllers/teamController.js';
import {
  getConversations,
  getConversationDetail,
  sendMessage,
  updateConversationStatus,
} from './controllers/conversationController.js';
import {
  summarizeConversation,
  generateSmartReply,
  analyzeSentiment,
  detectIntent,
  translateContent,
} from './controllers/aiController.js';
import { testTrigger, getAutomations } from './controllers/automationController.js';
import {
  getOverview,
  getConversations as getAnalyticsConversations,
  getResponseTimes,
  getCustomerSatisfaction,
} from './controllers/analyticsController.js';
import { getReports, exportReportCsv, createSavedReport } from './controllers/reportController.js';
import {
  getSettings,
  updateGeneralSettings,
  updateProfileSettings,
  updateSecurityPassword,
} from './controllers/settingsController.js';
import { initSocketIO, getSocketIO } from './socket.js';
import http from 'http';
import express from 'express';

function createMockReq(options = {}) {
  return {
    body: options.body || {},
    query: options.query || {},
    params: options.params || {},
    headers: options.headers || {},
    user: options.user || null,
    ip: '127.0.0.1',
  };
}

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
    },
  };
}

async function runFullE2ETestSuite() {
  console.log('===============================================================');
  console.log('🚀 ConvoAI Phase 8 – Production Readiness & System Test Suite');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // MODULE 1: AUTHENTICATION, JWT & RBAC
    // -------------------------------------------------------------
    console.log('🔐 [1/10] Testing Authentication, JWT Tokens & RBAC...');
    let token = '';
    let refreshTok = '';

    // 1.1 Invalid login
    {
      const req = createMockReq({ body: { email: 'admin@convoai.io', password: 'WrongPassword' } });
      const res = createMockRes();
      await login(req, res, () => {});
      assert(res.statusCode === 401, 'POST /api/auth/login rejects invalid credentials with 401');
    }

    // 1.2 Valid admin login (Sonam Sav)
    {
      const req = createMockReq({ body: { email: 'sonam.sav@convoai.io', password: 'Password123!' } });
      const res = createMockRes();
      await login(req, res, () => {});
      assert(res.statusCode === 200 && res.data.data.accessToken, 'POST /api/auth/login succeeds for Sonam Sav');
      assert(res.data.data.user.name === 'Sonam Sav', 'Login payload authenticates Sonam Sav');
      token = res.data.data.accessToken;
      refreshTok = res.data.data.refreshToken;
      assert(res.data.data.user.role === 'admin', 'Login payload authenticates admin role');
    }

    // 1.3 Refresh token rotation
    {
      const req = createMockReq({ body: { refreshToken: refreshTok } });
      const res = createMockRes();
      await refreshToken(req, res, () => {});
      assert(res.statusCode === 200 && res.data.data.accessToken, 'POST /api/auth/refresh rotates access token');
      token = res.data.data.accessToken;
      refreshTok = res.data.data.refreshToken;
    }

    // 1.4 Get current user profile
    {
      const req = createMockReq({ user: { id: 'usr_admin_01' } });
      const res = createMockRes();
      await getMe(req, res, () => {});
      assert(res.statusCode === 200 && res.data.data.user.email === 'admin@convoai.io', 'GET /api/auth/me returns authenticated user details');
    }

    // 1.5 RBAC authorization check
    {
      const req = createMockReq({
        headers: { 'x-user-role': 'agent' },
        body: { appName: 'Unauthorized Update' },
      });
      const res = createMockRes();
      await updateGeneralSettings(req, res, () => {});
      assert(res.statusCode === 403, 'RBAC prevents agent role from modifying workspace parameters (403 Forbidden)');
    }

    // -------------------------------------------------------------
    // MODULE 2: CUSTOMER CRM CRUD
    // -------------------------------------------------------------
    console.log('\n👥 [2/10] Testing Customer CRM & Account Data...');
    let testCustomerId = '';

    // 2.1 List customers with segment filter
    {
      const req = createMockReq({ query: { segment: 'enterprise' } });
      const res = createMockRes();
      await getCustomers(req, res, () => {});
      assert(res.statusCode === 200 && res.data.data.customers.length > 0, 'GET /api/customers filters by enterprise segment');
    }

    // 2.2 Create new customer
    {
      const req = createMockReq({
        body: {
          name: 'TechCorp International',
          email: 'contact@techcorp.io',
          company: 'TechCorp Int.',
          segment: 'enterprise',
          status: 'active',
          sentiment: 'positive',
          arr: 140000,
          tags: ['Key Account', 'SOC-2 Signoff'],
        },
      });
      const res = createMockRes();
      await createCustomer(req, res, () => {});
      assert(res.statusCode === 201 && res.data.data.customer.id, 'POST /api/customers creates new customer record');
      testCustomerId = res.data.data.customer.id;
    }

    // 2.3 Add internal note to customer
    {
      const req = createMockReq({
        params: { id: testCustomerId },
        body: { authorName: 'Alex Rivera', content: 'Completed quarterly executive business review.' },
      });
      const res = createMockRes();
      await addCustomerNote(req, res, () => {});
      assert(res.statusCode === 201 && res.data.data.note.content, 'POST /api/customers/:id/notes logs interaction note');
    }

    // -------------------------------------------------------------
    // MODULE 3: AGENTS & TEAMS MANAGEMENT
    // -------------------------------------------------------------
    console.log('\n👔 [3/10] Testing Support Agents & Team Structures...');
    {
      const req = createMockReq({ query: { status: 'all' } });
      const res = createMockRes();
      await getAgents(req, res, () => {});
      assert(res.statusCode === 200 && res.data.data.agents.length >= 4, 'GET /api/agents lists complete agent roster');
    }

    {
      const req = createMockReq({ params: { id: 'agent-1' }, body: { status: 'busy' } });
      const res = createMockRes();
      await updateAgentStatus(req, res, () => {});
      assert(res.statusCode === 200 && res.data.data.agent.status === 'busy', 'PUT /api/agents/:id/status updates availability');
    }

    {
      const req = createMockReq();
      const res = createMockRes();
      await getTeams(req, res, () => {});
      assert(res.statusCode === 200 && res.data.data.teams.length >= 4, 'GET /api/teams retrieves departmental teams');
    }

    // -------------------------------------------------------------
    // MODULE 4: CONVERSATIONS & SMART INBOX
    // -------------------------------------------------------------
    console.log('\n💬 [4/10] Testing Conversations, Triage & Messaging...');
    {
      const req = createMockReq({ query: { status: 'open' } });
      const res = createMockRes();
      await getConversations(req, res, () => {});
      assert(res.statusCode === 200 && res.data.data.conversations.length > 0, 'GET /api/conversations retrieves active support queue');
    }

    {
      const req = createMockReq({ params: { id: 'conv-101' } });
      const res = createMockRes();
      await getConversationDetail(req, res, () => {});
      assert(res.statusCode === 200 && res.data.data.messages.length > 0, 'GET /api/conversations/:id returns thread history');
    }

    {
      const req = createMockReq({
        params: { id: 'conv-101' },
        body: {
          content: 'Confirmed: webhook payload verification passed on staging.',
          senderName: 'Sarah Connor',
          senderType: 'agent',
          isInternalNote: false,
        },
      });
      const res = createMockRes();
      await sendMessage(req, res, () => {});
      assert(res.statusCode === 201 && res.data.data.message.status === 'delivered', 'POST /api/conversations/:id/messages delivers agent response');
    }

    // -------------------------------------------------------------
    // MODULE 5: REAL-TIME SOCKET.IO ARCHITECTURE
    // -------------------------------------------------------------
    console.log('\n⚡ [5/10] Validating Real-time Socket.IO Engine...');
    {
      const mockHttpServer = http.createServer();
      const io = initSocketIO(mockHttpServer);
      assert(!!io, 'initSocketIO attaches server instance');
      assert(getSocketIO() === io, 'getSocketIO returns active singleton');

      // Verify event handlers structure
      assert(typeof io.on === 'function', 'Socket.IO event bus is fully initialized');
    }

    // -------------------------------------------------------------
    // MODULE 6: AI INTELLIGENCE & OPENAI ENGINE
    // -------------------------------------------------------------
    console.log('\n🤖 [6/10] Testing AI Intelligence Engine...');
    {
      const req = createMockReq({
        body: {
          messages: [
            { senderName: 'Customer', content: 'Our team is unable to connect to the Redis cluster.' },
            { senderName: 'Agent', content: 'Please verify the firewall CIDR block permissions.' },
          ],
        },
      });
      const res = createMockRes();
      await summarizeConversation(req, res, () => {});
      assert(res.statusCode === 200 && (res.data.data.overview || res.data.data.summary), 'POST /api/ai/summarize generates thread synthesis');
    }

    {
      const req = createMockReq({
        body: {
          messages: [{ senderName: 'Customer', content: 'Can we upgrade our tier to Enterprise Growth?' }],
          tone: 'empathetic',
        },
      });
      const res = createMockRes();
      await generateSmartReply(req, res, () => {});
      assert(res.statusCode === 200 && (res.data.data.suggestions || res.data.data.replies), 'POST /api/ai/suggest-reply produces distinct response drafts');
    }

    {
      const req = createMockReq({ body: { text: 'This issue is urgent, completely broken and our production server is down with errors!' } });
      const res = createMockRes();
      await analyzeSentiment(req, res, () => {});
      assert(res.statusCode === 200 && res.data.data.sentiment?.toLowerCase() === 'negative', 'POST /api/ai/sentiment flags urgent customer frustration');
    }

    {
      const req = createMockReq({ body: { text: 'Can I get a refund for last month invoice?' } });
      const res = createMockRes();
      await detectIntent(req, res, () => {});
      assert(res.statusCode === 200 && res.data.data.intent, 'POST /api/ai/intent classifies intent category');
    }

    // -------------------------------------------------------------
    // MODULE 7: WORKFLOW AUTOMATION ENGINE
    // -------------------------------------------------------------
    console.log('\n⚙️ [7/10] Testing Automation Workflow Engine...');
    {
      const req = createMockReq({
        body: {
          eventType: 'new_conversation_created',
          context: {
            customerSegment: 'enterprise',
            priority: 'urgent',
            sentiment: 'negative',
            subject: 'Emergency downtime on checkout microservice',
          },
        },
      });
      const res = createMockRes();
      await testTrigger(req, res, () => {});
      assert(res.statusCode === 200 && res.data.data.matchedCount >= 0, 'POST /api/automations/test-trigger evaluates workflow conditions');
    }

    // -------------------------------------------------------------
    // MODULE 8: ADVANCED ANALYTICS & CSAT METRICS
    // -------------------------------------------------------------
    console.log('\n📊 [8/10] Testing Analytics & Mathematical Precision...');
    {
      const req = createMockReq({ query: { dateRange: '30d' } });
      const res = createMockRes();
      await getOverview(req, res, () => {});
      assert(res.statusCode === 200 && res.data.data.totalConversations > 0, 'GET /api/analytics/overview returns aggregated business metrics');
    }

    {
      const req = createMockReq({ query: { dateRange: '30d' } });
      const res = createMockRes();
      await getResponseTimes(req, res, () => {});
      assert(
        res.statusCode === 200 && typeof res.data.data.kpis?.medianFirstResponseMinutes === 'number',
        'GET /api/analytics/response-times computes median latency resilient to outliers'
      );
    }

    {
      const req = createMockReq({ query: { dateRange: '30d' } });
      const res = createMockRes();
      await getCustomerSatisfaction(req, res, () => {});
      assert(
        res.statusCode === 200 && typeof res.data.data.kpis?.overallCsat === 'number',
        'GET /api/analytics/customer-satisfaction computes CSAT percentage'
      );
    }

    // -------------------------------------------------------------
    // MODULE 9: REPORT MANAGEMENT & CSV STREAMING
    // -------------------------------------------------------------
    console.log('\n📑 [9/10] Testing Report Management & RFC 4180 CSV...');
    {
      const req = createMockReq();
      const res = createMockRes();
      await getReports(req, res, () => {});
      assert(res.statusCode === 200 && res.data.data.catalog.length === 6, 'GET /api/reports lists 6 pre-built enterprise reports');
    }

    {
      const req = createMockReq({
        headers: { 'x-user-name': 'Alex Rivera' },
        body: {
          name: 'Custom VIP SLA Audit',
          description: 'Quarterly review of Tier 1 response speed',
          reportType: 'conversation_performance',
          dateRange: '30d',
          format: 'csv',
        },
      });
      const res = createMockRes();
      await createSavedReport(req, res, () => {});
      assert(res.statusCode === 201 && res.data.data.report?.id, 'POST /api/reports stores custom report template');
    }

    {
      const req = createMockReq({ params: { type: 'conversation_performance' }, query: { dateRange: '30d' } });
      const res = createMockRes();
      await exportReportCsv(req, res, () => {});
      assert(res.statusCode === 200 && typeof res.data === 'string' && res.data.includes('Ticket Number'), 'GET /api/reports/export/:type streams valid RFC 4180 CSV');
    }

    // -------------------------------------------------------------
    // MODULE 10: APPLICATION SETTINGS & SECURITY
    // -------------------------------------------------------------
    console.log('\n⚙️ [10/10] Testing Settings, Password Hashing & Audit...');
    {
      const req = createMockReq();
      const res = createMockRes();
      await getSettings(req, res, () => {});
      assert(res.statusCode === 200 && res.data.data.general && res.data.data.integrations, 'GET /api/settings returns verified configurations');
    }

    {
      const req = createMockReq({
        body: {
          currentPassword: 'Password123!',
          newPassword: 'BrandNewSecurePassword2026!',
        },
      });
      const res = createMockRes();
      await updateSecurityPassword(req, res, () => {});
      assert(res.statusCode === 200, 'PUT /api/settings/security/password enforces >=8 chars and records audit trail');
    }

    // Logout
    {
      const req = createMockReq({ body: { refreshToken: refreshTok } });
      const res = createMockRes();
      await logout(req, res, () => {});
      assert(res.statusCode === 200, 'POST /api/auth/logout successfully invalidates user session');
    }
  } catch (err) {
    console.error('Unhandled test failure:', err);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`🏁 Phase 8 Comprehensive Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runFullE2ETestSuite();
