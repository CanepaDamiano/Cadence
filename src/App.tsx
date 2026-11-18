import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ClipboardList,
  Moon,
  RotateCcw,
  Sun,
  Timer,
} from 'lucide-react';
import {
  BlockCategory,
  CourseworkTask,
  RoutineTemplateId,
  TimeBlock,
} from './types/schedule';
import {
  adjustBlockDuration,
  autoResolveOverlaps,
  calculateBalanceMetrics,
  detectOverlaps,
  findNextAvailableSlot,
  minutesToTimeStr,
  sortTimeBlocks,
} from './utils/scheduleMath';
import {
  createInitialBlocks,
  INITIAL_COURSEWORK_TASKS,
  ROUTINE_TEMPLATES,
} from './utils/seedData';
import { ActiveSection, TopBar } from './components/TopBar';
import { BalanceDashboard } from './components/BalanceDashboard';
import { DailyTimeline } from './components/DailyTimeline';
import { CourseworkBacklog } from './components/CourseworkBacklog';
import { FocusTimer } from './components/FocusTimer';
import { BlockModal } from './components/BlockModal';

const STORAGE_KEYS = {
  BLOCKS: 'cadence_blocks_v1',
  TASKS: 'cadence_tasks_v1',
  TEMPLATE: 'cadence_template_v1',
  SLEEP_GOAL: 'cadence_sleep_goal_v1',
  HOBBY_QUOTA: 'cadence_hobby_quota_v1',
  THEME: 'cadence_theme_v1',
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const [activeTemplateId, setActiveTemplateId] = useState<RoutineTemplateId>(
    () => {
      try {
        const saved = localStorage.getItem(
          STORAGE_KEYS.TEMPLATE
        ) as RoutineTemplateId | null;
        if (saved && ROUTINE_TEMPLATES[saved]) return saved;
      } catch {
        // ignore
      }
      return 'default-balanced';
    }
  );

  const [blocks, setBlocks] = useState<TimeBlock[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BLOCKS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return createInitialBlocks('default-balanced');
  });

  const [tasks, setTasks] = useState<CourseworkTask[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_COURSEWORK_TASKS;
  });

  const [sleepGoalHours, setSleepGoalHours] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SLEEP_GOAL);
      if (raw) {
        const val = parseFloat(raw);
        if (!Number.isNaN(val) && val >= 5 && val <= 11) return val;
      }
    } catch {
      // ignore
    }
    return 7.5;
  });

  const [hobbyQuotaHours, setHobbyQuotaHours] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HOBBY_QUOTA);
      if (raw) {
        const val = parseFloat(raw);
        if (!Number.isNaN(val) && val >= 0.5 && val <= 6) return val;
      }
    } catch {
      // ignore
    }
    return 1.5;
  });

  const [activeSection, setActiveSection] = useState<ActiveSection>('all');
  const [rightTab, setRightTab] = useState<'backlog' | 'timer'>('backlog');
  const [activeTimerBlockId, setActiveTimerBlockId] = useState<string | null>(
    () => {
      const firstStudy = blocks.find(
        (b) => b.category === 'study' || b.category === 'exercise'
      );
      return firstStudy ? firstStudy.id : null;
    }
  );

  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [modalDefaultSlot, setModalDefaultSlot] = useState<{
    start: number;
    end: number;
    category: BlockCategory;
  }>({ start: 540, end: 630, category: 'study' });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
    } catch {
      // ignore
    }
  }, [blocks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATE, activeTemplateId);
      localStorage.setItem(STORAGE_KEYS.SLEEP_GOAL, String(sleepGoalHours));
      localStorage.setItem(STORAGE_KEYS.HOBBY_QUOTA, String(hobbyQuotaHours));
    } catch {
      // ignore
    }
  }, [activeTemplateId, sleepGoalHours, hobbyQuotaHours]);

  const metrics = useMemo(
    () => calculateBalanceMetrics(blocks, sleepGoalHours, hobbyQuotaHours),
    [blocks, sleepGoalHours, hobbyQuotaHours]
  );

  const overlaps = useMemo(() => detectOverlaps(blocks), [blocks]);

  const handleSelectSection = (section: ActiveSection) => {
    setActiveSection(section);
    if (section === 'backlog') setRightTab('backlog');
    if (section === 'timer') setRightTab('timer');
  };

  const handleApplyTemplate = (templateId: RoutineTemplateId) => {
    const template = ROUTINE_TEMPLATES[templateId];
    if (!template) return;
    const nextBlocks = createInitialBlocks(templateId);
    setActiveTemplateId(templateId);
    setBlocks(nextBlocks);
    setSleepGoalHours(template.recommendedSleepHours);
    setHobbyQuotaHours(template.recommendedHobbyHours);

    const firstFocus = nextBlocks.find(
      (b) => b.category === 'study' || b.category === 'exercise'
    );
    setActiveTimerBlockId(firstFocus ? firstFocus.id : null);
    setFeedbackNotice(`Loaded "${template.name}" routine.`);
  };

  const handleSaveBlock = (
    blockData: Omit<TimeBlock, 'id'>,
    existingId?: string
  ) => {
    if (existingId) {
      setBlocks((prev) =>
        sortTimeBlocks(
          prev.map((b) =>
            b.id === existingId ? { ...blockData, id: existingId } : b
          )
        )
      );
      setFeedbackNotice(`Updated "${blockData.title}".`);
    } else {
      const newId = `block-${Date.now()}`;
      const newBlock: TimeBlock = { ...blockData, id: newId };
      setBlocks((prev) => sortTimeBlocks([...prev, newBlock]));
      if (
        blockData.category === 'study' ||
        blockData.category === 'exercise'
      ) {
        setActiveTimerBlockId(newId);
      }
      setFeedbackNotice(
        `Added "${blockData.title}" (${minutesToTimeStr(
          blockData.startMinutes
        )}–${minutesToTimeStr(blockData.endMinutes)}).`
      );
    }
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    setTasks((prev) =>
      prev.map((t) =>
        t.scheduledBlockId === blockId
          ? { ...t, scheduledBlockId: undefined }
          : t
      )
    );
    if (activeTimerBlockId === blockId) {
      setActiveTimerBlockId(null);
    }
  };

  const handleAdjustDuration = (blockId: string, deltaMinutes: number) => {
    setBlocks((prev) =>
      sortTimeBlocks(
        prev.map((b) =>
          b.id === blockId ? adjustBlockDuration(b, deltaMinutes) : b
        )
      )
    );
  };

  const handleToggleBlockComplete = (blockId: string) => {
    let linkedTaskToSync: string | undefined;
    let nextCompletedState = false;

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === blockId) {
          nextCompletedState = !b.completed;
          linkedTaskToSync = b.linkedTaskId;
          return { ...b, completed: nextCompletedState };
        }
        return b;
      })
    );

    if (linkedTaskToSync) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === linkedTaskToSync || t.scheduledBlockId === blockId
            ? { ...t, completed: nextCompletedState }
            : t
        )
      );
    }
  };

  const handleAutoResolveOverlaps = () => {
    setBlocks((prev) => autoResolveOverlaps(prev));
    setFeedbackNotice('Overlaps automatically resolved.');
  };

  const handleQuickExtendSleep = () => {
    if (metrics.sleepDeficitMinutes <= 0) return;
    setBlocks((prev) => {
      const sorted = sortTimeBlocks(prev);
      const morningSleep = sorted.find(
        (b) => b.category === 'sleep' && b.startMinutes === 0
      );
      if (morningSleep) {
        const added = Math.min(120, metrics.sleepDeficitMinutes);
        return sortTimeBlocks(
          sorted.map((b) =>
            b.id === morningSleep.id
              ? { ...b, endMinutes: Math.min(600, b.endMinutes + added) }
              : b
          )
        );
      }
      return sortTimeBlocks([
        ...sorted,
        {
          id: `block-sleep-${Date.now()}`,
          title: 'Night Sleep Extension',
          category: 'sleep',
          startMinutes: Math.max(1320, 1440 - metrics.sleepDeficitMinutes),
          endMinutes: 1440,
        },
      ]);
    });
  };

  const handleQuickAddHobby = () => {
    const slot = findNextAvailableSlot(blocks, 45, 960);
    const newBlock: TimeBlock = {
      id: `block-hobby-${Date.now()}`,
      title: 'Personal Passion & Recharge',
      category: 'hobby',
      startMinutes: slot.startMinutes,
      endMinutes: slot.endMinutes,
    };
    setBlocks((prev) => sortTimeBlocks([...prev, newBlock]));
  };

  const handleAddTask = (
    taskData: Omit<CourseworkTask, 'id' | 'completed'>
  ) => {
    const newTask: CourseworkTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTaskComplete = (taskId: string) => {
    let targetBlockId: string | undefined;
    let nextCompleted = false;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          nextCompleted = !t.completed;
          targetBlockId = t.scheduledBlockId;
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );

    if (targetBlockId) {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === targetBlockId ? { ...b, completed: nextCompleted } : b
        )
      );
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleScheduleTaskIntoTimeline = (task: CourseworkTask) => {
    const slot = findNextAvailableSlot(blocks, task.estimatedMinutes, 540);
    const newBlockId = `block-from-${task.id}-${Date.now()}`;
    const newBlock: TimeBlock = {
      id: newBlockId,
      title: task.title,
      category: task.category,
      startMinutes: slot.startMinutes,
      endMinutes: slot.endMinutes,
      courseTag: task.course,
      linkedTaskId: task.id,
      completed: task.completed,
    };

    setBlocks((prev) => sortTimeBlocks([...prev, newBlock]));
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, scheduledBlockId: newBlockId } : t
      )
    );
    setActiveTimerBlockId(newBlockId);
    setFeedbackNotice(
      `Scheduled "${task.title}" at ${minutesToTimeStr(
        slot.startMinutes
      )}–${minutesToTimeStr(slot.endMinutes)}.`
    );
  };

  const openAddModalWithSlot = (
    start = 540,
    end = 630,
    category: BlockCategory = 'study'
  ) => {
    setEditingBlock(null);
    setModalDefaultSlot({ start, end, category });
    setIsModalOpen(true);
  };

  const pendingTaskCount = tasks.filter((t) => !t.completed).length;

  return (
    <div
      id="top"
      className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
    >
      {/* 1. Strict 3-Zone Top Bar */}
      <TopBar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onOpenAddModal={() => {
          const nextSlot = findNextAvailableSlot(blocks, 60, 540);
          openAddModalWithSlot(
            nextSlot.startMinutes,
            nextSlot.endMinutes,
            'study'
          );
        }}
      />

      {/* 2. Calm Secondary Bar: Quick Routine Presets + Theme Switch */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/70 dark:border-slate-800 px-4 sm:px-6 py-2">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 whitespace-nowrap shrink-0">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Routine:</span>
            </span>

            {(Object.keys(ROUTINE_TEMPLATES) as RoutineTemplateId[]).map(
              (tplId) => {
                const tpl = ROUTINE_TEMPLATES[tplId];
                const isSelected = activeTemplateId === tplId;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tpl.name}
                  </button>
                );
              }
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {feedbackNotice && (
              <span
                role="status"
                className="hidden lg:inline-block text-xs text-indigo-600 dark:text-indigo-400 font-medium mr-2"
              >
                {feedbackNotice}
              </span>
            )}

            <button
              type="button"
              onClick={() => handleApplyTemplate(activeTemplateId)}
              aria-label="Reset current day template to default blocks"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
              }
              aria-label={
                theme === 'light'
                  ? 'Switch to dark mode'
                  : 'Switch to light mode'
              }
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Content Container (Generous Whitespace, Max 1280px) */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Summary Strip: 24h Balance, Sleep Goal, Hobbies Quota */}
        {(activeSection === 'all' || activeSection === 'balance') && (
          <BalanceDashboard
            metrics={metrics}
            sleepGoalHours={sleepGoalHours}
            hobbyQuotaHours={hobbyQuotaHours}
            onChangeSleepGoal={setSleepGoalHours}
            onChangeHobbyQuota={setHobbyQuotaHours}
            onQuickExtendSleep={handleQuickExtendSleep}
            onQuickAddHobby={handleQuickAddHobby}
          />
        )}

        {/* Main 2-Column Workspace: Left = Daily Schedule (7 cols), Right = Focused Tool Panel (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Daily Schedule */}
          {(activeSection === 'all' || activeSection === 'timeline') && (
            <div
              className={
                activeSection === 'timeline'
                  ? 'lg:col-span-12'
                  : 'lg:col-span-7'
              }
            >
              <DailyTimeline
                blocks={blocks}
                overlaps={overlaps}
                activeTimerBlockId={activeTimerBlockId}
                onAddBlockAtSlot={(start, end, cat) =>
                  openAddModalWithSlot(start, end, cat ?? 'study')
                }
                onEditBlock={(b) => {
                  setEditingBlock(b);
                  setIsModalOpen(true);
                }}
                onDeleteBlock={handleDeleteBlock}
                onAdjustDuration={handleAdjustDuration}
                onToggleComplete={handleToggleBlockComplete}
                onSelectForTimer={(blockId) => {
                  setActiveTimerBlockId(blockId);
                  setRightTab('timer');
                }}
                onAutoResolveOverlaps={handleAutoResolveOverlaps}
              />
            </div>
          )}

          {/* Right Column: Unified Tabbed Panel (Coursework Backlog OR Focus Timer) */}
          {(activeSection === 'all' ||
            activeSection === 'backlog' ||
            activeSection === 'timer') && (
            <div
              className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs lg:sticky lg:top-20 ${
                activeSection === 'all' ? 'lg:col-span-5' : 'lg:col-span-12'
              }`}
            >
              {/* Clean 2-Tab Switcher */}
              <div
                className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5"
                role="tablist"
                aria-label="Coursework and Focus Timer tools"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={rightTab === 'backlog'}
                  onClick={() => setRightTab('backlog')}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    rightTab === 'backlog'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Coursework ({pendingTaskCount})</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={rightTab === 'timer'}
                  onClick={() => setRightTab('timer')}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    rightTab === 'timer'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Focus Timer</span>
                </button>
              </div>

              {/* Active Tool View */}
              {rightTab === 'backlog' ? (
                <CourseworkBacklog
                  tasks={tasks}
                  blocks={blocks}
                  onAddTask={handleAddTask}
                  onToggleTaskComplete={handleToggleTaskComplete}
                  onDeleteTask={handleDeleteTask}
                  onScheduleTask={handleScheduleTaskIntoTimeline}
                />
              ) : (
                <FocusTimer
                  blocks={blocks}
                  activeBlockId={activeTimerBlockId}
                  onSelectBlockId={setActiveTimerBlockId}
                  onCompleteLinkedBlock={handleToggleBlockComplete}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Time Block Modal */}
      <BlockModal
        isOpen={isModalOpen}
        editingBlock={editingBlock}
        initialStartMinutes={modalDefaultSlot.start}
        initialEndMinutes={modalDefaultSlot.end}
        initialCategory={modalDefaultSlot.category}
        existingBlocks={blocks}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBlock}
      />
    </div>
  );
}
