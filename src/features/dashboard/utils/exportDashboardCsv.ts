import {
  DashboardMetrics,
  AgentPerformanceItem,
  RecentConversationItem,
  DateRangeOption,
} from '../types/dashboard';

export function exportDashboardCsv(
  dateRange: DateRangeOption,
  metrics: DashboardMetrics,
  agents: AgentPerformanceItem[],
  conversations: RecentConversationItem[]
): void {
  const rows: string[] = [];

  // Header / Title
  rows.push(`"ConvoAI Executive Dashboard Report"`);
  rows.push(`"Date Range:","${dateRange}"`);
  rows.push(`"Generated At:","${new Date().toISOString()}"`);
  rows.push('');

  // Section 1: KPI Metrics
  rows.push(`"--- KPI METRICS SUMMARY ---"`);
  rows.push(`"Metric","Value","Sub Details"`);
  rows.push(`"Total Conversations","${metrics.totalConversations.count}","${metrics.totalConversations.change} ${metrics.totalConversations.timeframe}"`);
  rows.push(`"Active Conversations","${metrics.activeConversations.total}","Open: ${metrics.activeConversations.open}, Pending: ${metrics.activeConversations.pending}"`);
  rows.push(`"Resolved Conversations","${metrics.resolvedConversations.count}","Resolution Rate: ${metrics.resolvedConversations.rate}"`);
  rows.push(`"Avg First Response Time","${metrics.avgResponseTime.time}","${metrics.avgResponseTime.change}"`);
  rows.push(`"Customer Satisfaction (CSAT)","${metrics.customerSatisfaction.score}","${metrics.customerSatisfaction.satisfactionTrend}"`);
  rows.push(`"Active Agents","${metrics.activeAgents.online} Online","Total: ${metrics.activeAgents.total}, Busy: ${metrics.activeAgents.busy}"`);
  rows.push('');

  // Section 2: Agent Performance
  rows.push(`"--- AGENT PERFORMANCE ROSTER ---"`);
  rows.push(`"Agent Name","Email","Status","Role","Assigned Tickets","Resolved Tickets","Avg Response Time","CSAT Rating"`);
  agents.forEach((ag) => {
    rows.push(
      `"${ag.name}","${ag.email}","${ag.status}","${ag.role}","${ag.assignedCount}","${ag.resolvedCount}","${ag.avgResponseTime}","${ag.rating}"`
    );
  });
  rows.push('');

  // Section 3: Recent Priority Conversations
  rows.push(`"--- RECENT PRIORITY CONVERSATIONS ---"`);
  rows.push(`"Ticket ID","Customer Name","Email","Channel","Subject","Assigned Agent","Priority","Status","Last Updated"`);
  conversations.forEach((c) => {
    rows.push(
      `"${c.ticketNumber}","${c.customerName}","${c.customerEmail}","${c.channel}","${c.subject.replace(/"/g, '""')}","${c.assignedAgent.name}","${c.priority}","${c.status}","${c.lastUpdated}"`
    );
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ConvoAI-Dashboard-Report-${dateRange}-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
