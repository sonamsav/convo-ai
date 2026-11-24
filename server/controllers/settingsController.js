/**
 * Settings Controller for ConvoAI
 * Manages organization settings, profile, notifications, AI config, security, and integrations
 */

import { OPENAI_CONFIG } from '../config/openai.js';

// Central in-memory settings store
let settingsStore = {
  general: {
    appName: 'ConvoAI Platform',
    workspaceName: 'Convo Global HQ',
    companyName: 'ConvoAI Technologies Inc.',
    companyWebsite: 'https://convoai.io',
    supportEmail: 'support@convoai.io',
    defaultTimezone: 'UTC',
    defaultLanguage: 'en',
    dateFormat: 'YYYY-MM-DD'
  },
  workspace: {
    planTier: 'Enterprise Growth',
    customDomain: 'support.convoai.io',
    slaUrgentMinutes: 15,
    slaResolutionMinutes: 240
  },
  profile: {
    name: 'Sonam Sav',
    email: 'sonam.sav@convoai.io',
    phone: '+1 (555) 234-5678',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80',
    bio: 'Lead Support Systems Architect & Senior Customer Experience Specialist.'
  },
  notifications: {
    inApp: {
      newConversations: true,
      conversationAssignment: true,
      highPriorityConversations: true,
      negativeSentimentAlerts: true,
      agentMentions: true,
      automationFailures: true,
      dailyPerformanceSummary: false
    },
    email: {
      newConversations: false,
      conversationAssignment: true,
      highPriorityConversations: true,
      negativeSentimentAlerts: true,
      agentMentions: true,
      automationFailures: true,
      dailyPerformanceSummary: true
    }
  },
  ai: {
    enabled: true,
    defaultTone: 'professional',
    defaultLanguage: 'en',
    enableAutoSummarize: true,
    enableSentimentTelemetry: true,
    enableSmartReply: true,
    visibility: 'all_agents'
  },
  security: {
    mfaEnforced: true,
    ssoEnabled: true,
    activeSessions: [
      {
        id: 'sess-1',
        device: 'MacBook Pro 16"',
        browser: 'Chrome 122.0',
        ipAddress: '198.51.100.42',
        location: 'San Francisco, CA, USA',
        lastActive: 'Just now',
        current: true
      },
      {
        id: 'sess-2',
        device: 'iPhone 15 Pro',
        browser: 'Mobile Safari 17.2',
        ipAddress: '198.51.100.89',
        location: 'San Francisco, CA, USA',
        lastActive: '3 hours ago',
        current: false
      }
    ],
    loginHistory: [
      { id: 'log-1', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), ip: '198.51.100.42', status: 'Success', location: 'San Francisco, USA' },
      { id: 'log-2', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), ip: '198.51.100.42', status: 'Success', location: 'San Francisco, USA' },
      { id: 'log-3', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), ip: '203.0.113.19', status: 'Blocked (2FA Challenge)', location: 'Unknown' }
    ]
  },
  appearance: {
    theme: 'system',
    compactMode: false,
    accentColor: 'indigo'
  }
};

/**
 * GET /api/settings
 */
export async function getSettings(req, res, next) {
  try {
    // Dynamically check integrations status
    const integrations = {
      openai: {
        id: 'openai',
        name: 'OpenAI Intelligence Engine',
        status: OPENAI_CONFIG.isConfigured ? 'connected' : 'disconnected',
        model: OPENAI_CONFIG.model,
        description: 'Powers GPT-4o conversation summaries, sentiment analysis, and smart response generation.'
      },
      emailProvider: {
        id: 'email',
        name: 'Inbound & Outbound Email (SMTP / SendGrid)',
        status: 'connected',
        description: 'Routes incoming emails directly to support tickets and dispatches outgoing replies.'
      },
      webhooks: {
        id: 'webhooks',
        name: 'Outgoing Webhook Dispatcher',
        status: 'connected',
        description: 'Sends real-time event payloads to external microservices and BI endpoints.'
      },
      crm: {
        id: 'crm',
        name: 'Salesforce / HubSpot CRM Sync',
        status: 'connected',
        description: 'Synchronizes customer account tier, ARR value, and lifecycle state.'
      },
      slack: {
        id: 'slack',
        name: 'Slack Team Collaboration',
        status: 'connected',
        description: 'Bridges internal conversation escalations to #customer-support.'
      },
      whatsapp: {
        id: 'whatsapp',
        name: 'WhatsApp Business API (Twilio)',
        status: 'connected',
        description: 'Enables two-way customer chat through official verified WhatsApp numbers.'
      }
    };

    res.json({
      success: true,
      data: {
        ...settingsStore,
        integrations
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/settings/general
 */
export async function updateGeneralSettings(req, res, next) {
  try {
    const userRole = req.headers['x-user-role'] || 'admin';
    if (userRole !== 'admin' && userRole !== 'owner') {
      return res.status(403).json({
        success: false,
        error: { message: 'Unauthorized: Only Administrators can update general workspace settings.' }
      });
    }

    const {
      appName,
      workspaceName,
      companyName,
      companyWebsite,
      supportEmail,
      defaultTimezone,
      defaultLanguage,
      dateFormat
    } = req.body;

    if (supportEmail && !supportEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please provide a valid support email address.' }
      });
    }

    settingsStore.general = {
      ...settingsStore.general,
      ...(appName && { appName }),
      ...(workspaceName && { workspaceName }),
      ...(companyName && { companyName }),
      ...(companyWebsite && { companyWebsite }),
      ...(supportEmail && { supportEmail }),
      ...(defaultTimezone && { defaultTimezone }),
      ...(defaultLanguage && { defaultLanguage }),
      ...(dateFormat && { dateFormat })
    };

    res.json({
      success: true,
      data: { general: settingsStore.general }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/settings/profile
 */
export async function updateProfileSettings(req, res, next) {
  try {
    const { name, phone, bio, avatar } = req.body;

    settingsStore.profile = {
      ...settingsStore.profile,
      ...(name && { name }),
      ...(phone && { phone }),
      ...(bio && { bio }),
      ...(avatar && { avatar })
    };

    res.json({
      success: true,
      data: { profile: settingsStore.profile }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/settings/notifications
 */
export async function updateNotificationSettings(req, res, next) {
  try {
    const { inApp, email } = req.body;

    if (inApp) {
      settingsStore.notifications.inApp = {
        ...settingsStore.notifications.inApp,
        ...inApp
      };
    }

    if (email) {
      settingsStore.notifications.email = {
        ...settingsStore.notifications.email,
        ...email
      };
    }

    res.json({
      success: true,
      data: { notifications: settingsStore.notifications }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/settings/ai
 */
export async function updateAiSettings(req, res, next) {
  try {
    const userRole = req.headers['x-user-role'] || 'admin';
    if (userRole === 'agent' || userRole === 'viewer') {
      return res.status(403).json({
        success: false,
        error: { message: 'Unauthorized: Support Agents cannot configure global AI parameters.' }
      });
    }

    settingsStore.ai = {
      ...settingsStore.ai,
      ...req.body
    };

    res.json({
      success: true,
      data: { ai: settingsStore.ai }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/settings/appearance
 */
export async function updateAppearanceSettings(req, res, next) {
  try {
    settingsStore.appearance = {
      ...settingsStore.appearance,
      ...req.body
    };

    res.json({
      success: true,
      data: { appearance: settingsStore.appearance }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/settings/security/password
 */
export async function updateSecurityPassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { message: 'Current password and new password are required.' }
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: { message: 'New password must contain at least 8 characters.' }
      });
    }

    // Record password change event in audit log
    settingsStore.security.loginHistory.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ip: req.ip || '198.51.100.42',
      status: 'Password Changed Successfully',
      location: 'San Francisco, USA'
    });

    res.json({
      success: true,
      data: { message: 'Password updated successfully.' }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/settings/security/sessions/:id
 */
export async function revokeSession(req, res, next) {
  try {
    const { id } = req.params;
    settingsStore.security.activeSessions = settingsStore.security.activeSessions.filter(
      (s) => s.id !== id
    );

    res.json({
      success: true,
      data: { activeSessions: settingsStore.security.activeSessions }
    });
  } catch (err) {
    next(err);
  }
}
