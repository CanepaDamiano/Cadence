import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { BlockCategory, TimeBlock } from '../types/schedule';
import {
  CATEGORY_LIST,
  detectOverlaps,
  formatDuration,
  minutesToTimeStr,
  timeStrToMinutes,
} from '../utils/scheduleMath';

interface BlockModalProps {
  isOpen: boolean;
  editingBlock: TimeBlock | null;
  initialStartMinutes: number;
  initialEndMinutes: number;
  initialCategory: BlockCategory;
  existingBlocks: TimeBlock[];
  onClose: () => void;
  onSave: (blockData: Omit<TimeBlock, 'id'>, existingId?: string) => void;
}

export const BlockModal: React.FC<BlockModalProps> = ({
  isOpen,
  editingBlock,
  initialStartMinutes,
  initialEndMinutes,
  initialCategory,
  existingBlocks,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BlockCategory>('study');
  const [startStr, setStartStr] = useState('09:00');
  const [endStr, setEndStr] = useState('10:30');
  const [courseTag, setCourseTag] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);
    if (editingBlock) {
      setTitle(editingBlock.title);
      setCategory(editingBlock.category);
      setStartStr(minutesToTimeStr(editingBlock.startMinutes));
      setEndStr(minutesToTimeStr(editingBlock.endMinutes));
      setCourseTag(editingBlock.courseTag || '');
      setLocation(editingBlock.location || '');
      setNotes(editingBlock.notes || '');
    } else {
      setTitle('');
      setCategory(initialCategory);
      setStartStr(minutesToTimeStr(initialStartMinutes));
      setEndStr(minutesToTimeStr(initialEndMinutes));
      setCourseTag('');
      setLocation('');
      setNotes('');
    }
  }, [
    isOpen,
    editingBlock,
    initialStartMinutes,
    initialEndMinutes,
    initialCategory,
  ]);

  if (!isOpen) return null;

  const startMinutes = timeStrToMinutes(startStr);
  const endMinutes = endStr === '24:00' ? 1440 : timeStrToMinutes(endStr);
  const durationMinutes = endMinutes - startMinutes;

  // Preview potential overlap with other blocks
  const candidateId = editingBlock ? editingBlock.id : '__candidate__';
  const simulatedBlocks: TimeBlock[] = [
    ...existingBlocks.filter((b) => b.id !== candidateId),
    {
      id: candidateId,
      title: title || 'New Block',
      category,
      startMinutes,
      endMinutes: Math.max(startMinutes + 15, endMinutes),
    },
  ];
  const candidateOverlaps = detectOverlaps(simulatedBlocks).filter(
    (o) => o.blockAId === candidateId || o.blockBId === candidateId
  );

  const handleQuickDuration = (mins: number) => {
    const nextEnd = Math.min(1440, startMinutes + mins);
    setEndStr(minutesToTimeStr(nextEnd));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage('Please enter a descriptive title for this time block.');
      return;
    }
    if (endMinutes <= startMinutes) {
      setErrorMessage('End time must be after start time.');
      return;
    }
    if (endMinutes - startMinutes < 15) {
      setErrorMessage('Time blocks must be at least 15 minutes long.');
      return;
    }

    onSave(
      {
        title: trimmedTitle,
        category,
        startMinutes,
        endMinutes,
        courseTag: courseTag.trim() || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        completed: editingBlock?.completed ?? false,
        linkedTaskId: editingBlock?.linkedTaskId,
      },
      editingBlock?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="block-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2
            id="block-modal-title"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            {editingBlock ? 'Edit Time Block' : 'Add Time Block'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close time block modal"
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-300"
            >
              {errorMessage}
            </div>
          )}

          {/* Block Title */}
          <div>
            <label
              htmlFor="block-title-input"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Activity or Session Title *
            </label>
            <input
              id="block-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g., CS 301 Dynamic Programming Problem Set"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
            />
          </div>

          {/* Category Selector */}
          <div>
            <span className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_LIST.map((cat) => {
                const selected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all cursor-pointer ${
                      selected
                        ? `${cat.surfaceClass} ring-2 ring-indigo-600 dark:ring-indigo-400 font-semibold`
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start & End Time + Quick Duration Presets */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="block-start-time"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Start Time
              </label>
              <input
                id="block-start-time"
                type="time"
                value={startStr === '24:00' ? '23:45' : startStr}
                onChange={(e) => setStartStr(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="block-end-time"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  End Time
                </label>
                <button
                  type="button"
                  onClick={() => setEndStr('24:00')}
                  className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Set 24:00
                </button>
              </div>
              <input
                id="block-end-time"
                type="time"
                value={endStr === '24:00' ? '23:59' : endStr}
                onChange={(e) => setEndStr(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Quick Duration Buttons */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              Duration:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {durationMinutes > 0 ? formatDuration(durationMinutes) : 'Invalid'}
              </strong>
              {endStr === '24:00' ? ' (Ends at 24:00)' : ''}
            </span>
            <div className="flex items-center gap-1">
              {[30, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleQuickDuration(mins)}
                  className="px-2 py-1 text-[11px] font-mono bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors cursor-pointer"
                >
                  {formatDuration(mins)}
                </button>
              ))}
            </div>
          </div>

          {/* Live overlap warning */}
          {candidateOverlaps.length > 0 && durationMinutes > 0 && (
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                Note: This time window overlaps with {candidateOverlaps.length}{' '}
                existing block{candidateOverlaps.length > 1 ? 's' : ''}. You can
                still save and auto-resolve on the timeline.
              </span>
            </div>
          )}

          {/* Optional Course & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="block-course-input"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Course Tag (Optional)
              </label>
              <input
                id="block-course-input"
                type="text"
                value={courseTag}
                onChange={(e) => setCourseTag(e.target.value)}
                placeholder="e.g., CS 301 or MATH 240"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="block-location-input"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Location (Optional)
              </label>
              <input
                id="block-location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Science Library 3F"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="block-notes-input"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Notes or Study Goal (Optional)
            </label>
            <input
              id="block-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Complete problems 1-6 without looking at solutions"
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
            >
              {editingBlock ? 'Save Changes' : 'Add to Timeline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
