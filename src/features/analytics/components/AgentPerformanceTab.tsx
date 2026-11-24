import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  ArrowUpDown,
  Download,
  ExternalLink,
  Star,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { AgentPerformanceRecord } from '../types/analytics';
import { Button, Badge } from '@/components/ui';

interface AgentPerformanceTabProps {
  agents: AgentPerformanceRecord[];
  onExportCsv: () => void;
  isLoading?: boolean;
}

export const AgentPerformanceTab: React.FC<AgentPerformanceTabProps> = ({
  agents,
  onExportCsv,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [sortBy, setSortBy] = useState<keyof AgentPerformanceRecord>('resolvedConversations');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtering
  const filtered = agents.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = teamFilter === 'all' || a.teamId === teamFilter;
    return matchesSearch && matchesTeam;
  });

  // Sorting
  filtered.sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (col: keyof AgentPerformanceRecord) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  const chartData = agents.map((a) => ({
    name: a.name.split(' ')[0], // First name for chart
    resolved: a.resolvedConversations,
    resolutionRate: a.resolutionRate,
    csat: a.csatRating * 20, // Scale to 100 for comparison
  }));

  return (
    <div className="space-y-6">
      {/* Comparative Performance Chart */}
      <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Agent Performance Benchmark
            </h3>
            <p className="text-xs text-slate-500">
              Comparison of resolved tickets, resolution rate (%), and CSAT index across team members.
            </p>
          </div>
          <Badge variant="info" size="sm">
            {agents.length} Registered Agents
          </Badge>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="resolved" name="Resolved Tickets" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolutionRate" name="Resolution Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search agent name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            aria-label="Filter agent table by team"
            className="text-xs py-1.5 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Teams</option>
            <option value="team-tech">Technical Support</option>
            <option value="team-general">General Support</option>
            <option value="team-billing">Billing & Subscriptions</option>
            <option value="team-success">Customer Success & VIP</option>
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          leftIcon={<Download className="w-3.5 h-3.5" />}
        >
          Export Agent CSV
        </Button>
      </div>

      {/* Main Agent Comparison Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Agent</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Team</th>
                <th
                  onClick={() => toggleSort('assignedConversations')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Assigned</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('resolvedConversations')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Resolved</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('resolutionRate')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Resolution Rate</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('avgResponseMinutes')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Avg. Response</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('avgResolutionMinutes')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Avg. Resolution</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('csatRating')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>CSAT (★)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((agent) => (
                <tr
                  key={agent.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Agent Name */}
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    <div className="space-y-0.5">
                      <span>{agent.name}</span>
                      <p className="text-[10px] text-slate-400">{agent.role}</p>
                    </div>
                  </td>

                  {/* Team */}
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {agent.teamName}
                  </td>

                  {/* Assigned */}
                  <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                    {agent.assignedConversations}
                  </td>

                  {/* Resolved */}
                  <td className="py-3 px-4 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                    {agent.resolvedConversations}
                  </td>

                  {/* Resolution Rate */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {agent.resolutionRate}%
                      </span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${agent.resolutionRate}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Avg Response */}
                  <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                    {agent.avgResponseMinutes}m
                  </td>

                  {/* Avg Resolution */}
                  <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                    {agent.avgResolutionMinutes}m
                  </td>

                  {/* CSAT Rating */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-amber-500 font-bold font-mono">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{agent.csatRating.toFixed(1)}</span>
                    </div>
                  </td>

                  {/* Action Link */}
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/agents/${agent.id}`)}
                      className="h-7 w-7 p-0"
                      title="View Agent Profile"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
