export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  CONVERSATIONS: {
    LIST: '/conversations',
    DETAIL: (id: string) => `/conversations/${id}`,
    MESSAGES: (id: string) => `/conversations/${id}/messages`,
    ASSIGN: (id: string) => `/conversations/${id}/assign`,
    STATUS: (id: string) => `/conversations/${id}/status`,
  },
  CUSTOMERS: {
    LIST: '/customers',
    DETAIL: (id: string) => `/customers/${id}`,
    TIMELINE: (id: string) => `/customers/${id}/timeline`,
  },
  AI: {
    SUGGEST_REPLY: '/ai/suggest-reply',
    SUMMARIZE_THREAD: '/ai/summarize',
    SENTIMENT_ANALYSIS: '/ai/sentiment',
    INTENT_EXTRACTION: '/ai/intent',
  },
  AGENTS: {
    LIST: '/agents',
    STATUS: '/agents/status',
    PERFORMANCE: (id: string) => `/agents/${id}/performance`,
  },
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    RESPONSE_TIMES: '/analytics/response-times',
    CSAT_METRICS: '/analytics/csat',
    AI_DEFLECTION: '/analytics/ai-deflection',
  },
  AUTOMATION: {
    RULES: '/automation/rules',
    RULE_DETAIL: (id: string) => `/automation/rules/${id}`,
    EXECUTION_LOGS: '/automation/logs',
  },
};
