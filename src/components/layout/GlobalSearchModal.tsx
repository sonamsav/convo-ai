import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Sparkles, MessageSquare, Users, Settings, Moon, Sun, Zap } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setGlobalSearchOpen, toggleTheme } from '@/app/store/slices/uiSlice';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { cn } from '@/utils/cn';

interface SearchItem {
  id: string;
  category: 'Navigation' | 'Quick Actions' | 'Recent Conversations';
  title: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

export const GlobalSearchModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isOpen = useAppSelector((state) => state.ui.globalSearchOpen);
  const theme = useAppSelector((state) => state.ui.theme);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle modal on Ctrl+K or Cmd+K
  useKeyboardShortcut('k', () => {
    dispatch(setGlobalSearchOpen(!isOpen));
  }, { ctrlOrCmd: true });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items: SearchItem[] = useMemo(() => [
    // Navigation items
    {
      id: 'nav-dashboard',
      category: 'Navigation',
      title: 'Dashboard',
      description: 'Platform overview, key SLA stats, agent activity',
      icon: <Sparkles className="w-4 h-4 text-brand-500" />,
      action: () => navigate('/dashboard'),
    },
    {
      id: 'nav-inbox',
      category: 'Navigation',
      title: 'Smart Inbox',
      description: 'Unified multi-channel customer conversations',
      icon: <MessageSquare className="w-4 h-4 text-indigo-500" />,
      badge: '12 new',
      action: () => navigate('/inbox'),
    },
    {
      id: 'nav-customers',
      category: 'Navigation',
      title: 'Customers Directory',
      description: 'Enterprise contacts, sentiment histories & 360 profile',
      icon: <Users className="w-4 h-4 text-emerald-500" />,
      action: () => navigate('/customers'),
    },
    {
      id: 'nav-ai',
      category: 'Navigation',
      title: 'AI Intelligence Center',
      description: 'Copilot suggestions, intent models & sentiment metrics',
      icon: <Sparkles className="w-4 h-4 text-violet-500" />,
      badge: 'v2.4',
      action: () => navigate('/ai-intelligence'),
    },
    {
      id: 'nav-automation',
      category: 'Navigation',
      title: 'Automation Rules',
      description: 'Triggers, auto-assignment & SLA escalation flows',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      action: () => navigate('/automation'),
    },
    {
      id: 'nav-settings',
      category: 'Navigation',
      title: 'Workspace Settings',
      description: 'Channels, webhooks, branding and team configuration',
      icon: <Settings className="w-4 h-4 text-slate-500" />,
      action: () => navigate('/settings'),
    },
    // Quick Actions
    {
      id: 'act-theme',
      category: 'Quick Actions',
      title: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      description: 'Toggle UI color theme appearance',
      icon: theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />,
      action: () => dispatch(toggleTheme()),
    },
    {
      id: 'act-new-convo',
      category: 'Quick Actions',
      title: 'Start Outbound Conversation',
      description: 'Initiate proactive email or in-app message to a customer',
      icon: <MessageSquare className="w-4 h-4 text-brand-600" />,
      action: () => navigate('/inbox'),
    },
  ], [navigate, dispatch, theme]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const lower = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        (item.description && item.description.toLowerCase().includes(lower)) ||
        item.category.toLowerCase().includes(lower)
    );
  }, [items, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        dispatch(setGlobalSearchOpen(false));
      }
    } else if (e.key === 'Escape') {
      dispatch(setGlobalSearchOpen(false));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={() => dispatch(setGlobalSearchOpen(false))}
      />

      {/* Palette Container */}
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-modal border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-100"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search platform (e.g. Inbox, Theme)..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
              No matching commands or navigation items found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    dispatch(setGlobalSearchOpen(false));
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-brand-50/80 dark:bg-brand-950/50 text-brand-900 dark:text-brand-200'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                  )}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shrink-0">
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 text-[10px] rounded bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 font-medium">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <ArrowRight className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0 ml-2" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 border border-slate-200 dark:border-slate-700 rounded">↑</kbd>
              <kbd className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 border border-slate-200 dark:border-slate-700 rounded ml-1">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 border border-slate-200 dark:border-slate-700 rounded">↵</kbd> to select
            </span>
          </div>
          <span>ConvoAI Command Palette</span>
        </div>
      </div>
    </div>
  );
};
