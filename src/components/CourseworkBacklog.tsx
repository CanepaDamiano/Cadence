import React, { useState } from 'react';
import {
  CalendarPlus,
  Check,
  CheckCircle2,
  ClipboardList,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  CourseworkTask,
  TaskPriority,
  TimeBlock,
} from '../types/schedule';
import { formatDuration, minutesToTimeStr } from '../utils/scheduleMath';

interface CourseworkBacklogProps {
  tasks: CourseworkTask[];
  blocks: TimeBlock[];
  onAddTask: (task: Omit<CourseworkTask, 'id' | 'completed'>) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onScheduleTask: (task: CourseworkTask) => void;
}

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const CourseworkBacklog: React.FC<CourseworkBacklogProps> = ({
  tasks,
  blocks,
  onAddTask,
  onToggleTaskComplete,
  onDeleteTask,
  onScheduleTask,
}) => {
  const [hideCompleted, setHideCompleted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('CS 301');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(60);
  const [formError, setFormError] = useState<string | null>(null);

  const blockMap = new Map<string, TimeBlock>();
  for (const b of blocks) {
    blockMap.set(b.id, b);
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });

  const visibleTasks = hideCompleted
    ? sortedTasks.filter((t) => !t.completed)
    : sortedTasks;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedCourse = course.trim();
    if (!trimmedTitle) {
      setFormError('Please enter a task title.');
      return;
    }

    onAddTask({
      title: trimmedTitle,
      course: trimmedCourse || 'General',
      priority,
      estimatedMinutes,
      dueLabel: 'Upcoming',
      category: 'exercise',
    });
    setTitle('');
    setFormError(null);
    setIsAdding(false);
  };

  return (
    <div aria-label="Coursework and Exercise Backlog" className="space-y-3.5">
      {/* Compact Subheader Actions */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setHideCompleted((prev) => !prev)}
          className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
        >
          {hideCompleted ? 'Show completed tasks' : 'Hide completed'}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsAdding((prev) => !prev);
            setFormError(null);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isAdding ? 'Close' : 'New Task'}</span>
        </button>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3"
        >
          {formError && (
            <p
              role="alert"
              className="text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {formError}
            </p>
          )}

          <input
            id="new-task-title"
            type="text"
            aria-label="Task or problem set title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (formError) setFormError(null);
            }}
            placeholder="e.g., Problem Set 5: Dynamic Programming"
            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
          />

          <div className="grid grid-cols-3 gap-2">
            <input
              id="new-task-course"
              type="text"
              aria-label="Course code"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="CS 301"
              className="px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />

            <select
              id="new-task-priority"
              aria-label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              id="new-task-duration"
              aria-label="Estimated duration"
              value={estimatedMinutes}
              onChange={(e) =>
                setEstimatedMinutes(parseInt(e.target.value, 10))
              }
              className="px-2 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            >
              <option value={30}>30m</option>
              <option value={45}>45m</option>
              <option value={60}>1h</option>
              <option value={90}>1h 30m</option>
              <option value={120}>2h</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Task Rows */}
      {visibleTasks.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <ClipboardList
            className="w-5 h-5 text-slate-400 mx-auto"
            aria-hidden="true"
          />
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            All tasks completed
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {visibleTasks.map((task) => {
            const linkedBlock = task.scheduledBlockId
              ? blockMap.get(task.scheduledBlockId)
              : undefined;

            return (
              <div
                key={task.id}
                className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2.5 group"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggleTaskComplete(task.id)}
                    aria-label={`Mark task '${task.title}' as ${
                      task.completed ? 'incomplete' : 'completed'
                    }`}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      task.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                    }`}
                  >
                    {task.completed && (
                      <Check className="w-3 h-3" aria-hidden="true" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-medium text-slate-900 dark:text-slate-100 truncate ${
                        task.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : ''
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                        {task.course}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {formatDuration(task.estimatedMinutes)}
                      </span>
                      {task.priority === 'high' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-rose-600 dark:text-rose-400 font-medium">
                            High
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {linkedBlock ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                      <span>{minutesToTimeStr(linkedBlock.startMinutes)}</span>
                    </span>
                  ) : (
                    !task.completed && (
                      <button
                        type="button"
                        onClick={() => onScheduleTask(task)}
                        aria-label={`Schedule '${task.title}' into daily timeline`}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 rounded-md transition-colors cursor-pointer"
                      >
                        <CalendarPlus className="w-3 h-3" aria-hidden="true" />
                        <span>Schedule</span>
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    aria-label={`Delete task '${task.title}'`}
                    className="p-1 text-slate-400 hover:text-rose-600 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
