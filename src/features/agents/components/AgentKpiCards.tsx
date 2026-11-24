import React from 'react';
import { Users, UserCheck, UserX, Clock, MessageSquare, ArrowUpRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setAgentFilter } from '@/app/store/slices/agentSlice';
import { cn } from '@/utils/cn';

export const AgentKpiCards: React.FC = () => {
  const dispatch = useAppDispatch();
  const agents = useAppSelector((state) => state.agent.agents);
  const activeAvailability = useAppSelector((state) => state.agent.filters.availability);

  const totalAgents = agents.length;
  const onlineAgents = agents.filter((a) => a.isActive && a.availability === 'online').length;
  const offlineAgents = agents.filter((a) => !a.isActive || a.availability === 'offline').length;
  const busyAgents = agents.filter((a) => a.isActive && a.availability === 'busy').length;
  const totalAssignedTickets = agents.reduce((sum, a) => sum + a.currentTicketsCount, 0);

  const kpis: {
    id: string;
    availability: string;
    title: string;
    value: number | string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'total',
      availability: 'all',
      title: 'Total Agents',
      value: totalAgents,
      subtitle: `${agents.filter((a) => a.isActive).length} active seat licenses`,
      icon: <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />,
      color: 'border-l-brand-600',
    },
    {
      id: 'online',
      availability: 'online',
      title: 'Online Agents',
      value: onlineAgents,
      subtitle: 'Currently accepting live chats',
      icon: <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      color: 'border-l-emerald-600',
    },
    {
      id: 'busy',
      availability: 'busy',
      title: 'Busy Agents',
      value: busyAgents,
      subtitle: 'At or near chat capacity',
      icon: <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      color: 'border-l-rose-500',
    },
    {
      id: 'offline',
      availability: 'offline',
      title: 'Offline Agents',
      value: offlineAgents,
      subtitle: 'Outside scheduled shift',
      icon: <UserX className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
      color: 'border-l-slate-400',
    },
    {
      id: 'tickets',
      availability: 'all',
      title: 'Total Assigned Tickets',
      value: totalAssignedTickets,
      subtitle: 'Active conversations in queue',
      icon: <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      color: 'border-l-indigo-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
      {kpis.map((kpi) => {
        const isSelected = activeAvailability === kpi.availability && kpi.id !== 'total' && kpi.id !== 'tickets';

        return (
          <button
            key={kpi.id}
            type="button"
            onClick={() => {
              if (kpi.availability !== 'all') {
                dispatch(setAgentFilter({ availability: kpi.availability }));
              } else {
                dispatch(setAgentFilter({ availability: 'all' }));
              }
            }}
            className={cn(
              'flex flex-col text-left p-4 rounded-xl border bg-white dark:bg-slate-900 transition-all select-none group',
              'hover:shadow-card hover:-translate-y-0.5 cursor-pointer',
              isSelected
                ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
                : 'border-slate-200/80 dark:border-slate-800'
            )}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                {kpi.title}
              </span>
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                {kpi.icon}
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
                {kpi.value}
              </span>
            </div>

            <p className="mt-1 text-[11px] text-slate-400 truncate w-full">
              {kpi.subtitle}
            </p>
          </button>
        );
      })}
    </div>
  );
};
