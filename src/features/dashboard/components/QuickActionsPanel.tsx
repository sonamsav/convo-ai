import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, UserPlus, Users, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { AddCustomerModal } from './AddCustomerModal';

export const QuickActionsPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  return (
    <>
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Quick Operational Actions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Instant shortcuts for routing, team assignment, and customer onboarding.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Action 1: View All Conversations */}
          <button
            type="button"
            onClick={() => navigate('/inbox')}
            className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 hover:bg-white dark:hover:bg-slate-800 hover:border-brand-300 dark:hover:border-brand-800 transition-all duration-150 text-left flex flex-col justify-between space-y-3"
          >
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-fit transition-transform group-hover:scale-105">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>View Inbox</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                All omnichannel queues
              </p>
            </div>
          </button>

          {/* Action 2: Add Customer */}
          <button
            type="button"
            onClick={() => setIsCustomerModalOpen(true)}
            className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all duration-150 text-left flex flex-col justify-between space-y-3"
          >
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 w-fit transition-transform group-hover:scale-105">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>Add Customer</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Register new account
              </p>
            </div>
          </button>

          {/* Action 3: Manage Agents */}
          <button
            type="button"
            onClick={() => navigate('/agents')}
            className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 hover:bg-white dark:hover:bg-slate-800 hover:border-amber-300 dark:hover:border-amber-800 transition-all duration-150 text-left flex flex-col justify-between space-y-3"
          >
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 w-fit transition-transform group-hover:scale-105">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>Manage Agents</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Roster, skills & shifts
              </p>
            </div>
          </button>

          {/* Action 4: View Reports */}
          <button
            type="button"
            onClick={() => navigate('/analytics')}
            className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 hover:bg-white dark:hover:bg-slate-800 hover:border-sky-300 dark:hover:border-sky-800 transition-all duration-150 text-left flex flex-col justify-between space-y-3"
          >
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 w-fit transition-transform group-hover:scale-105">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>View Reports</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                SLA & CSAT analytics
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
      />
    </>
  );
};
