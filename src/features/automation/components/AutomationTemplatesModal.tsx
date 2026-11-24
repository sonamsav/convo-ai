import React from 'react';
import {
  Zap,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  CreditCard,
  Clock,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { AutomationTemplate } from '../types/automation';
import { Modal, Button, Badge } from '@/components/ui';
import { cn } from '@/utils/cn';

interface AutomationTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: AutomationTemplate[];
  onSelectTemplate: (template: AutomationTemplate) => void;
}

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  'tpl-1': UserCheck,
  'tpl-2': ShieldAlert,
  'tpl-3': Sparkles,
  'tpl-4': CreditCard,
  'tpl-5': Clock,
};

export const AutomationTemplatesModal: React.FC<AutomationTemplatesModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSelectTemplate,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Automation Templates Gallery"
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Jumpstart your team's workflow with battle-tested automation templates. Selecting a
          template pre-populates the Visual Workflow Builder for one-click activation or custom
          tuning.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[62vh] overflow-y-auto pr-1">
          {templates.map((tpl) => {
            const Icon = TEMPLATE_ICONS[tpl.id] || Zap;

            return (
              <div
                key={tpl.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card hover:border-brand-300 dark:hover:border-brand-700/60 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {tpl.name}
                        </h4>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {tpl.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {tpl.description}
                  </p>

                  {/* Flow Summary Pill Preview */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1.5 text-[10px]">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <strong className="text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
                        WHEN:
                      </strong>
                      <span className="truncate">{tpl.trigger.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <strong className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
                        IF:
                      </strong>
                      <span className="truncate">
                        {tpl.conditionGroups[0]?.conditions
                          .map((c) => `${c.field.replace('_', ' ')} ${c.operator} "${c.value}"`)
                          .join(' & ') || 'Always true'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <strong className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                        THEN:
                      </strong>
                      <span className="truncate">
                        {tpl.actions.map((a) => a.label).join(' → ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onSelectTemplate(tpl);
                      onClose();
                    }}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
