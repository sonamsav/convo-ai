import React, { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { Modal, Button, Badge } from '@/components/ui';
import { useAppDispatch } from '@/app/store/hooks';
import { bulkTagCustomers } from '@/app/store/slices/customerSlice';
import { addToast } from '@/app/store/slices/toastSlice';

interface BulkTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomerIds: string[];
}

const COMMON_TAGS = [
  'Enterprise Plan',
  'VIP Account',
  'Churn Risk',
  'High Volume',
  'Onboarding',
  'Beta Tester',
  'Billing Issue',
  'Custom Contract',
];

export const BulkTagModal: React.FC<BulkTagModalProps> = ({
  isOpen,
  onClose,
  selectedCustomerIds,
}) => {
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
      setCustomTagInput('');
    }
  };

  const handleSave = () => {
    if (selectedTags.length === 0) {
      dispatch(
        addToast({
          type: 'warning',
          title: 'No tags selected',
          message: 'Please choose or type at least one tag to apply.',
        })
      );
      return;
    }

    dispatch(
      bulkTagCustomers({
        ids: selectedCustomerIds,
        tags: selectedTags,
        mode,
      })
    );

    dispatch(
      addToast({
        type: 'success',
        title: 'Tags Updated',
        message: `Successfully ${mode === 'add' ? 'added' : 'removed'} ${selectedTags.length} tag(s) across ${selectedCustomerIds.length} customer account(s).`,
      })
    );

    setSelectedTags([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Tag Customers"
      description={`Apply or remove organizational tags across ${selectedCustomerIds.length} selected customer records.`}
      size="sm"
    >
      <div className="space-y-4 py-2">
        {/* Mode Toggle */}
        <div className="flex rounded-lg p-1 bg-slate-100 dark:bg-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setMode('add')}
            className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
              mode === 'add'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Add Tags
          </button>
          <button
            type="button"
            onClick={() => setMode('remove')}
            className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
              mode === 'remove'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Remove Tags
          </button>
        </div>

        {/* Selected Tags list */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Active Tags to {mode === 'add' ? 'Add' : 'Remove'}:
          </label>
          <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850">
            {selectedTags.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No tags selected yet. Click below or type custom.</span>
            ) : (
              selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60"
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="hover:text-rose-600 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Common tags chips */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Suggested Tags
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Tag input */}
        <form onSubmit={handleAddCustomTag} className="flex gap-2 pt-1">
          <input
            type="text"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            placeholder="Type custom tag name..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={!customTagInput.trim()}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add
          </Button>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Apply Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};
