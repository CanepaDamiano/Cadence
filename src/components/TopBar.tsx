import React from 'react';
import { Plus } from 'lucide-react';

export type ActiveSection = 'all' | 'timeline' | 'balance' | 'backlog' | 'timer';

interface TopBarProps {
  activeSection: ActiveSection;
  onSelectSection: (section: ActiveSection) => void;
  onOpenAddModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeSection,
  onSelectSection,
  onOpenAddModal,
}) => {
  const navItems: { id: ActiveSection; label: string }[] = [
    { id: 'all', label: 'Workspace' },
    { id: 'timeline', label: 'Daily Timeline' },
    { id: 'balance', label: 'Life Balance' },
    { id: 'backlog', label: 'Coursework' },
    { id: 'timer', label: 'Focus Timer' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          onSelectSection('all');
        }}
        className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600 rounded"
      >
        Cadence
      </a>

      {/* Zone 2: 5 concise single-line text navigation links */}
      <nav
        aria-label="Primary Workspace Navigation"
        className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400"
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                isActive
                  ? 'text-slate-900 dark:text-slate-100 border-indigo-600 dark:border-indigo-400 font-semibold'
                  : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Add Time Block</span>
        </button>
      </div>
    </header>
  );
};
