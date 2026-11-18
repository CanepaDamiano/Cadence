import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Clock,
  Edit3,
  Moon,
  Play,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  BlockCategory,
  OverlapPair,
  TimeBlock,
} from '../types/schedule';
import {
  CATEGORY_LIST,
  CATEGORY_META,
  formatDuration,
  getOverlappingBlockIds,
  minutesToTimeStr,
  sortTimeBlocks,
} from '../utils/scheduleMath';

interface DailyTimelineProps {
  blocks: TimeBlock[];
  overlaps: OverlapPair[];
  activeTimerBlockId: string | null;
  onAddBlockAtSlot: (
    startMinutes: number,
    endMinutes: number,
    defaultCategory?: BlockCategory
  ) => void;
  onEditBlock: (block: TimeBlock) => void;
  onDeleteBlock: (blockId: string) => void;
  onAdjustDuration: (blockId: string, deltaMinutes: number) => void;
  onToggleComplete: (blockId: string) => void;
  onSelectForTimer: (blockId: string) => void;
  onAutoResolveOverlaps: () => void;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({
  blocks,
  overlaps,
  activeTimerBlockId,
  onAddBlockAtSlot,
  onEditBlock,
  onDeleteBlock,
  onAdjustDuration,
  onToggleComplete,
  onSelectForTimer,
  onAutoResolveOverlaps,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<BlockCategory | 'all'>(
    'all'
  );
  const [showGaps, setShowGaps] = useState<boolean>(false);

  const sortedBlocks = sortTimeBlocks(blocks);
  const overlappingIds = getOverlappingBlockIds(blocks);

  const overnightBlocks = sortedBlocks.filter((b) => b.startMinutes < 360);
  const daytimeBlocks = sortedBlocks.filter((b) => b.startMinutes >= 360);

  const filteredOvernight =
    categoryFilter === 'all'
      ? overnightBlocks
      : overnightBlocks.filter((b) => b.category === categoryFilter);

  const filteredDaytime =
    categoryFilter === 'all'
      ? daytimeBlocks
      : daytimeBlocks.filter((b) => b.category === categoryFilter);

  // Compute open gaps >= 15 mins only when user toggles `showGaps` on
  const gapsByAfterBlockId = new Map<string, { start: number; end: number }>();
  if (categoryFilter === 'all' && showGaps && daytimeBlocks.length > 0) {
    for (let i = 0; i < daytimeBlocks.length - 1; i++) {
      const currentEnd = daytimeBlocks[i].endMinutes;
      const nextStart = daytimeBlocks[i + 1].startMinutes;
      if (nextStart - currentEnd >= 15) {
        gapsByAfterBlockId.set(daytimeBlocks[i].id, {
          start: currentEnd,
          end: nextStart,
        });
      }
    }
  }

  const renderBlockRow = (block: TimeBlock) => {
    const meta = CATEGORY_META[block.category];
    const duration = block.endMinutes - block.startMinutes;
    const isOverlapping = overlappingIds.has(block.id);
    const isTimerActive = activeTimerBlockId === block.id;

    return (
      <div
        key={block.id}
        className={`group relative rounded-xl border px-4 py-3 transition-all duration-150 ${
          meta.surfaceClass
        } ${
          isOverlapping
            ? 'ring-2 ring-rose-500/80 dark:ring-rose-400/80'
            : isTimerActive
            ? 'ring-2 ring-indigo-600 dark:ring-indigo-400'
            : ''
        } ${block.completed ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left: Checkbox + Time column + Title & clean metadata */}
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onToggleComplete(block.id)}
              aria-label={`Mark '${block.title}' as ${
                block.completed ? 'incomplete' : 'completed'
              }`}
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                block.completed
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900'
                  : 'bg-white/80 dark:bg-slate-900/70 border-slate-300 dark:border-slate-600 hover:border-indigo-500'
              }`}
            >
              {block.completed && (
                <Check className="w-3 h-3" aria-hidden="true" />
              )}
            </button>

            {/* Fixed-width tabular time column */}
            <div className="w-28 sm:w-32 shrink-0">
              <div className="font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {minutesToTimeStr(block.startMinutes)} –{' '}
                {minutesToTimeStr(block.endMinutes)}
              </div>
              <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {formatDuration(duration)} · {meta.shortLabel}
              </div>
            </div>

            {/* Title & concise secondary line */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3
                  className={`text-sm font-semibold text-slate-900 dark:text-slate-100 truncate ${
                    block.completed
                      ? 'line-through text-slate-500 dark:text-slate-400'
                      : ''
                  }`}
                >
                  {block.title}
                </h3>
                {isOverlapping && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 shrink-0">
                    <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                    <span>Overlap</span>
                  </span>
                )}
              </div>

              {(block.courseTag || block.location) && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {block.courseTag && (
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                      {block.courseTag}
                    </span>
                  )}
                  {block.courseTag && block.location && (
                    <span aria-hidden="true">·</span>
                  )}
                  {block.location && (
                    <span className="truncate">{block.location}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Quiet action controls (expanded on hover/focus, or always if active timer) */}
          <div
            className={`items-center gap-1 shrink-0 ${
              isTimerActive
                ? 'flex'
                : 'flex sm:hidden sm:group-hover:flex sm:focus-within:flex'
            }`}
          >
            {/* Quick -15m / +15m */}
            <button
              type="button"
              disabled={duration <= 15}
              onClick={() => onAdjustDuration(block.id, -15)}
              aria-label={`Shorten '${block.title}' by 15 minutes`}
              className="px-1.5 py-1 text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-md disabled:opacity-40 cursor-pointer"
            >
              -15m
            </button>
            <button
              type="button"
              disabled={block.endMinutes >= 1440}
              onClick={() => onAdjustDuration(block.id, 15)}
              aria-label={`Extend '${block.title}' by 15 minutes`}
              className="px-1.5 py-1 text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-md disabled:opacity-40 cursor-pointer"
            >
              +15m
            </button>

            {block.category !== 'sleep' && (
              <button
                type="button"
                onClick={() => onSelectForTimer(block.id)}
                aria-label={`Start focus timer for '${block.title}'`}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                  isTimerActive
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                <Play className="w-3 h-3" aria-hidden="true" />
                <span className="hidden md:inline">
                  {isTimerActive ? 'Active' : 'Focus'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onEditBlock(block)}
              aria-label={`Edit '${block.title}'`}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 rounded-md cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => onDeleteBlock(block.id)}
              aria-label={`Delete '${block.title}'`}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 rounded-md cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      aria-label="Interactive Daily Timeline"
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs"
    >
      {/* Clean Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Daily Schedule
          </h2>

          {/* Category Filter Dropdown or Compact Pills */}
          <select
            aria-label="Filter timeline blocks by category"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as BlockCategory | 'all')
            }
            className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1.5 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 font-medium cursor-pointer"
          >
            <option value="all">All Categories ({blocks.length})</option>
            {CATEGORY_LIST.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label} ({blocks.filter((b) => b.category === cat.id).length})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGaps((prev) => !prev)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showGaps
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {showGaps ? 'Hide Free Gaps' : 'Show Free Gaps'}
          </button>

          <button
            type="button"
            onClick={() => onAddBlockAtSlot(540, 630, 'study')}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Block</span>
          </button>
        </div>
      </div>

      {/* Overlap Warning Banner */}
      {overlaps.length > 0 && (
        <div
          role="alert"
          className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200">
            <AlertTriangle
              className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0"
              aria-hidden="true"
            />
            <span>
              <strong>{overlaps.length} overlap{overlaps.length > 1 ? 's' : ''}</strong>{' '}
              detected in your timeline.
            </span>
          </div>

          <button
            type="button"
            onClick={onAutoResolveOverlaps}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            <span>Auto-Fix Overlaps</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredOvernight.length === 0 && filteredDaytime.length === 0 && (
        <div className="mt-4 py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <Clock
            className="w-6 h-6 text-slate-400 mx-auto"
            aria-hidden="true"
          />
          <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            No time blocks found
          </p>
        </div>
      )}

      {/* Timeline List */}
      <div className="mt-4 space-y-2">
        {filteredOvernight.map((block) => renderBlockRow(block))}

        {filteredOvernight.length > 0 && filteredDaytime.length > 0 && (
          <div className="flex items-center gap-2 py-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            <Moon className="w-3 h-3" aria-hidden="true" />
            <span>06:00 Morning Wake-Up</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          </div>
        )}

        {filteredDaytime.map((block) => {
          const gapAfter = gapsByAfterBlockId.get(block.id);
          return (
            <React.Fragment key={block.id}>
              {renderBlockRow(block)}
              {gapAfter && (
                <div className="flex items-center justify-between px-4 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
                  <span className="font-mono tabular-nums">
                    {minutesToTimeStr(gapAfter.start)} –{' '}
                    {minutesToTimeStr(gapAfter.end)} ·{' '}
                    {formatDuration(gapAfter.end - gapAfter.start)} free
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onAddBlockAtSlot(gapAfter.start, gapAfter.end, 'study')
                    }
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    + Fill slot
                  </button>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};
