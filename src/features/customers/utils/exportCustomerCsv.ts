import { CustomerRecord } from '../types/customer';

export function exportCustomerCsv(customers: CustomerRecord[], filename = 'convoai-customers-export.csv') {
  if (!customers || customers.length === 0) return;

  const headers = [
    'ID',
    'Full Name',
    'Email',
    'Phone',
    'Company',
    'Customer Type',
    'Status',
    'Sentiment',
    'Location',
    'Timezone',
    'Total Conversations',
    'Resolved Conversations',
    'Avg Response Time',
    'CSAT',
    'MRR',
    'Tags',
    'Joined Date',
  ];

  const rows = customers.map((c) => [
    `"${c.id}"`,
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.email.replace(/"/g, '""')}"`,
    `"${c.phone.replace(/"/g, '""')}"`,
    `"${c.company.replace(/"/g, '""')}"`,
    `"${c.customerType}"`,
    `"${c.status}"`,
    `"${c.sentiment}"`,
    `"${c.location.replace(/"/g, '""')}"`,
    `"${c.timezone}"`,
    c.totalConversations,
    c.resolvedConversations,
    `"${c.avgResponseTime}"`,
    c.csat,
    `"${c.mrr}"`,
    `"${c.tags.join('; ')}"`,
    `"${c.joinedDate}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
