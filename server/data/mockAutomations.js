/**
 * Seed data for Enterprise Automation Rules & Workflow Engine
 */

export const AUTOMATION_TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'Auto Assign New Conversations',
    description: 'Automatically round-robin routes newly initiated customer conversations to available support agents.',
    category: 'routing',
    trigger: {
      type: 'new_conversation_created',
      label: 'New Conversation Created',
      config: { channels: ['Web Chat', 'Email', 'WhatsApp', 'Slack'] }
    },
    conditionGroups: [
      {
        id: 'cg-1',
        logic: 'AND',
        conditions: [
          {
            id: 'c-1',
            field: 'conversation_status',
            operator: 'equals',
            value: 'open'
          },
          {
            id: 'c-2',
            field: 'assigned_agent',
            operator: 'is_empty',
            value: ''
          }
        ]
      }
    ],
    actions: [
      {
        id: 'a-1',
        type: 'assign_agent',
        label: 'Assign to Available Agent',
        config: { strategy: 'round_robin', fallbackAgentId: 'ag-1' }
      },
      {
        id: 'a-2',
        type: 'add_tag',
        label: 'Tag as Auto-Routed',
        config: { tag: 'auto-routed' }
      }
    ]
  },
  {
    id: 'tpl-2',
    name: 'High Priority Escalation',
    description: 'Immediately alerts team leads and flags senior on-call when a conversation is set to High or Urgent priority.',
    category: 'escalation',
    trigger: {
      type: 'priority_changed',
      label: 'Priority Changed',
      config: {}
    },
    conditionGroups: [
      {
        id: 'cg-1',
        logic: 'OR',
        conditions: [
          {
            id: 'c-1',
            field: 'conversation_priority',
            operator: 'equals',
            value: 'urgent'
          },
          {
            id: 'c-2',
            field: 'conversation_priority',
            operator: 'equals',
            value: 'high'
          }
        ]
      }
    ],
    actions: [
      {
        id: 'a-1',
        type: 'escalate',
        label: 'Escalate to Tier 2 Support',
        config: { targetDepartment: 'tier2_engineering', slaMinutes: 15 }
      },
      {
        id: 'a-2',
        type: 'send_notification',
        label: 'Notify Support Manager',
        config: { recipientRole: 'Manager', message: 'Urgent ticket flagged for immediate review.' }
      },
      {
        id: 'a-3',
        type: 'add_internal_note',
        label: 'Log Escalation Note',
        config: { note: '⚡ System Escalation: Priority raised to Urgent. Manager notified.' }
      }
    ]
  },
  {
    id: 'tpl-3',
    name: 'Negative Sentiment Alert & Retention Escalation',
    description: 'Intercepts conversations where AI detects negative customer sentiment, alerts leadership, and tags for churn prevention.',
    category: 'ai_intelligence',
    trigger: {
      type: 'customer_sentiment_changed',
      label: 'Customer Sentiment Changed',
      config: {}
    },
    conditionGroups: [
      {
        id: 'cg-1',
        logic: 'AND',
        conditions: [
          {
            id: 'c-1',
            field: 'customer_sentiment',
            operator: 'equals',
            value: 'Negative'
          }
        ]
      }
    ],
    actions: [
      {
        id: 'a-1',
        type: 'change_priority',
        label: 'Bump Priority to High',
        config: { priority: 'high' }
      },
      {
        id: 'a-2',
        type: 'add_tag',
        label: 'Add Churn-Risk Tag',
        config: { tag: 'churn-risk' }
      },
      {
        id: 'a-3',
        type: 'send_notification',
        label: 'Alert Team Lead',
        config: { recipientRole: 'Team Lead', message: 'Negative sentiment detected in customer conversation.' }
      },
      {
        id: 'a-4',
        type: 'trigger_ai_summary',
        label: 'Generate Incident AI Summary',
        config: { autoAttachNote: true }
      }
    ]
  },
  {
    id: 'tpl-4',
    name: 'Billing Query Routing',
    description: 'Uses AI intent classification to route payment, invoice, and renewal issues directly to the Finance & Billing team.',
    category: 'routing',
    trigger: {
      type: 'new_conversation_created',
      label: 'New Conversation Created',
      config: {}
    },
    conditionGroups: [
      {
        id: 'cg-1',
        logic: 'OR',
        conditions: [
          {
            id: 'c-1',
            field: 'detected_intent',
            operator: 'equals',
            value: 'Billing Inquiry'
          },
          {
            id: 'c-2',
            field: 'message_content',
            operator: 'contains',
            value: 'invoice'
          },
          {
            id: 'c-3',
            field: 'message_content',
            operator: 'contains',
            value: 'refund'
          }
        ]
      }
    ],
    actions: [
      {
        id: 'a-1',
        type: 'assign_team',
        label: 'Route to Billing Team',
        config: { teamId: 'team-billing', teamName: 'Billing & Subscriptions' }
      },
      {
        id: 'a-2',
        type: 'add_tag',
        label: 'Tag as Billing',
        config: { tag: 'billing-priority' }
      },
      {
        id: 'a-3',
        type: 'add_internal_note',
        label: 'Add Billing Triage Note',
        config: { note: '💳 AI Triage: Classified as Billing Inquiry. Transferred to Finance desk.' }
      }
    ]
  },
  {
    id: 'tpl-5',
    name: 'Inactive Conversation Follow-up',
    description: 'Identifies open conversations waiting without customer replies for over 24 hours and prompts automated follow-up.',
    category: 'lifecycle',
    trigger: {
      type: 'conversation_inactive',
      label: 'Conversation Inactive',
      config: { inactiveMinutes: 1440 } // 24 hours
    },
    conditionGroups: [
      {
        id: 'cg-1',
        logic: 'AND',
        conditions: [
          {
            id: 'c-1',
            field: 'conversation_status',
            operator: 'equals',
            value: 'open'
          },
          {
            id: 'c-2',
            field: 'conversation_age',
            operator: 'greater_than',
            value: '1440'
          }
        ]
      }
    ],
    actions: [
      {
        id: 'a-1',
        type: 'change_status',
        label: 'Move to Pending',
        config: { status: 'pending' }
      },
      {
        id: 'a-2',
        type: 'add_internal_note',
        label: 'System Reminder Note',
        config: { note: '⏳ Auto-Followup: Ticket idle for >24 hours. Follow-up reminder queued.' }
      },
      {
        id: 'a-3',
        type: 'add_tag',
        label: 'Tag as Awaiting Response',
        config: { tag: 'awaiting-customer' }
      }
    ]
  }
];

export const INITIAL_AUTOMATIONS = [
  {
    id: 'auto-1',
    name: 'Auto-Assign Enterprise Chats to Senior Engineers',
    description: 'Routes high-tier Enterprise conversations to senior technical specialists within 60 seconds.',
    status: 'active',
    category: 'routing',
    trigger: {
      type: 'new_conversation_created',
      label: 'New Conversation Created',
      config: { channels: ['Web Chat', 'Slack'] }
    },
    conditionGroups: [
      {
        id: 'cg-1',
        logic: 'AND',
        conditions: [
          {
            id: 'c-1',
            field: 'conversation_tags',
            operator: 'contains',
            value: 'enterprise'
          },
          {
            id: 'c-2',
            field: 'conversation_status',
            operator: 'equals',
            value: 'open'
          }
        ]
      }
    ],
    actions: [
      {
        id: 'a-1',
        type: 'assign_team',
        label: 'Assign to Tier 2 Engineering',
        config: { teamId: 'team-tier2', teamName: 'Tier 2 Engineering' }
      },
      {
        id: 'a-2',
        type: 'change_priority',
        label: 'Set Priority to High',
        config: { priority: 'high' }
      },
      {
        id: 'a-3',
        type: 'add_internal_note',
        label: 'Log Enterprise Routing',
        config: { note: '🏢 Enterprise VIP Customer routed to Tier 2 Engineering pool.' }
      }
    ],
    executionCount: 148,
    successfulExecutions: 146,
    failedExecutions: 2,
    lastExecutedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    createdBy: {
      id: 'usr-1',
      name: 'Alex Rivera',
      role: 'Admin'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'auto-2',
    name: 'Negative Sentiment Escalation & VIP Alert',
    description: 'Alerts support managers when negative customer sentiment is detected on active threads.',
    status: 'active',
    category: 'escalation',
    trigger: {
      type: 'customer_sentiment_changed',
      label: 'Customer Sentiment Changed',
      config: {}
    },
    conditionGroups: [
      {
        id: 'cg-1',
        logic: 'AND',
        conditions: [
          {
            id: 'c-1',
            field: 'customer_sentiment',
            operator: 'equals',
            value: 'Negative'
          }
        ]
      }
    ],
    actions: [
      {
        id: 'a-1',
        type: 'escalate',
        label: 'Escalate to Manager On-Call',
        config: { targetDepartment: 'vip_retention', slaMinutes: 10 }
      },
      {
        id: 'a-2',
        type: 'send_notification',
        label: 'Send Slack/In-App Alert',
        config: { recipientRole: 'Manager', message: '⚠️ Negative sentiment detected on high-impact customer thread.' }
      },
      {
        id: 'a-3',
        type: 'trigger_ai_sentiment',
        label: 'Evaluate Detailed Sentiment Indicators',
        config: {}
      }
    ],
    executionCount: 42,
    successfulExecutions: 41,
    failedExecutions: 1,
    lastExecutedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    createdBy: {
      id: 'usr-1',
      name: 'Alex Rivera',
      role: 'Admin'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    id: 'auto-3',
    name: 'Billing & Invoice Intent Auto-Routing',
    description: 'Detects payment, billing, or subscription questions and assigns them directly to the Finance Desk.',
    status: 'active',
    category: 'routing',
    trigger: {
      type: 'new_conversation_created',
      label: 'New Conversation Created',
      config: {}
    },
    conditionGroups: [
      {
        id: 'cg-1',
        logic: 'OR',
        conditions: [
          {
            id: 'c-1',
            field: 'detected_intent',
            operator: 'equals',
            value: 'Billing Inquiry'
          },
          {
            id: 'c-2',
            field: 'message_content',
            operator: 'contains',
            value: 'payment'
          }
        ]
      }
    ],
    actions: [
      {
        id: 'a-1',
        type: 'assign_team',
        label: 'Assign to Billing & Subscriptions',
        config: { teamId: 'team-billing', teamName: 'Billing & Subscriptions' }
      },
      {
        id: 'a-2',
        type: 'add_tag',
        label: 'Tag as Billing',
        config: { tag: 'billing' }
      }
    ],
    executionCount: 89,
    successfulExecutions: 89,
    failedExecutions: 0,
    lastExecutedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    createdBy: {
      id: 'usr-2',
      name: 'Sarah Chen',
      role: 'Manager'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: 'auto-4',
    name: 'Auto-Trigger AI Summary on Ticket Resolution',
    description: 'Generates a 6-point AI synthesis whenever a conversation is marked resolved by an agent.',
    status: 'active',
    category: 'ai_intelligence',
    trigger: {
      type: 'conversation_status_changed',
      label: 'Conversation Status Changed',
      config: { targetStatus: 'resolved' }
    },
    conditionGroups: [
      {
        id: 'cg-1',
        logic: 'AND',
        conditions: [
          {
            id: 'c-1',
            field: 'conversation_status',
            operator: 'equals',
            value: 'resolved'
          }
        ]
      }
    ],
    actions: [
      {
        id: 'a-1',
        type: 'trigger_ai_summary',
        label: 'Generate Resolution Summary',
        config: { autoAttachNote: true }
      },
      {
        id: 'a-2',
        type: 'add_tag',
        label: 'Tag as AI-Summarized',
        config: { tag: 'ai-summarized' }
      }
    ],
    executionCount: 215,
    successfulExecutions: 212,
    failedExecutions: 3,
    lastExecutedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    createdBy: {
      id: 'usr-1',
      name: 'Alex Rivera',
      role: 'Admin'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: 'auto-5',
    name: 'SLA Breach Warning for Stagnant Tickets',
    description: 'Monitors conversations inactive for 4 hours without response and triggers team lead notifications.',
    status: 'paused',
    category: 'lifecycle',
    trigger: {
      type: 'conversation_inactive',
      label: 'Conversation Inactive',
      config: { inactiveMinutes: 240 }
    },
    conditionGroups: [
      {
        id: 'cg-1',
        logic: 'AND',
        conditions: [
          {
            id: 'c-1',
            field: 'conversation_status',
            operator: 'equals',
            value: 'open'
          },
          {
            id: 'c-2',
            field: 'conversation_priority',
            operator: 'equals',
            value: 'high'
          }
        ]
      }
    ],
    actions: [
      {
        id: 'a-1',
        type: 'change_priority',
        label: 'Escalate to Urgent',
        config: { priority: 'urgent' }
      },
      {
        id: 'a-2',
        type: 'send_notification',
        label: 'Send SLA Breach Warning',
        config: { recipientRole: 'Team Lead', message: 'Ticket #CONV-1029 is nearing SLA threshold.' }
      }
    ],
    executionCount: 19,
    successfulExecutions: 18,
    failedExecutions: 1,
    lastExecutedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    createdBy: {
      id: 'usr-2',
      name: 'Sarah Chen',
      role: 'Manager'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  }
];
