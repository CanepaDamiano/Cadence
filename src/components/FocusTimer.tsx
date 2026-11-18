import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
} from 'lucide-react';
import { TimeBlock } from '../types/schedule';
import { CATEGORY_META, minutesToTimeStr } from '../utils/scheduleMath';

interface FocusTimerProps {
  blocks: TimeBlock[];
  activeBlockId: string | null;
  onSelectBlockId: (blockId: string | null) => void;
  onCompleteLinkedBlock: (blockId: string) => void;
}

type TimerPreset = {
  id: '25-5' | '50-10';
  label: string;
  focusMinutes: number;
  breakMinutes: number;
};

const PRESETS: TimerPreset[] = [
  { id: '25-5', label: '25 / 5m', focusMinutes: 25, breakMinutes: 5 },
  { id: '50-10', label: '50 / 10m', focusMinutes: 50, breakMinutes: 10 },
];

export const FocusTimer: React.FC<FocusTimerProps> = ({
  blocks,
  activeBlockId,
  onSelectBlockId,
  onCompleteLinkedBlock,
}) => {
  const [presetId, setPresetId] = useState<'25-5' | '50-10'>('25-5');
  const [phase, setPhase] = useState<'focus' | 'break'>('focus');
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const currentPreset =
    PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const totalPhaseSeconds =
    (phase === 'focus'
      ? currentPreset.focusMinutes
      : currentPreset.breakMinutes) * 60;

  const focusableBlocks = blocks.filter((b) => b.category !== 'sleep');
  const linkedBlock =
    focusableBlocks.find((b) => b.id === activeBlockId) ?? null;

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (phase === 'focus') {
            setPhase('break');
            return currentPreset.breakMinutes * 60;
          } else {
            setPhase('focus');
            return currentPreset.focusMinutes * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, phase, currentPreset]);

  const handleSelectPreset = (nextPreset: TimerPreset) => {
    setIsRunning(false);
    setPresetId(nextPreset.id);
    setSecondsLeft(
      (phase === 'focus' ? nextPreset.focusMinutes : nextPreset.breakMinutes) *
        60
    );
  };

  const handleSwitchPhase = (nextPhase: 'focus' | 'break') => {
    setIsRunning(false);
    setPhase(nextPhase);
    setSecondsLeft(
      (nextPhase === 'focus'
        ? currentPreset.focusMinutes
        : currentPreset.breakMinutes) * 60
    );
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalPhaseSeconds);
  };

  const handleSkipPhase = () => {
    setIsRunning(false);
    if (phase === 'focus') {
      setPhase('break');
      setSecondsLeft(currentPreset.breakMinutes * 60);
    } else {
      setPhase('focus');
      setSecondsLeft(currentPreset.focusMinutes * 60);
    }
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(
    2,
    '0'
  )}`;

  const progressFraction =
    totalPhaseSeconds > 0
      ? Math.max(0, Math.min(1, 1 - secondsLeft / totalPhaseSeconds))
      : 0;

  return (
    <div aria-label="Built-in Focus Timer" className="space-y-4">
      {/* Top Row: Phase & Preset */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => handleSwitchPhase('focus')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              phase === 'focus'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Focus ({currentPreset.focusMinutes}m)
          </button>
          <button
            type="button"
            onClick={() => handleSwitchPhase('break')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              phase === 'break'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Break ({currentPreset.breakMinutes}m)
          </button>
        </div>

        <div
          className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
          role="group"
          aria-label="Pomodoro timer duration presets"
        >
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                presetId === preset.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Countdown Display */}
      <div className="py-6 px-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 text-center">
        <div
          className="text-5xl font-bold font-mono tabular-nums tracking-tight text-slate-900 dark:text-slate-100"
          aria-live="polite"
        >
          {formattedTime}
        </div>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs mx-auto">
          {phase === 'focus'
            ? linkedBlock
              ? linkedBlock.title
              : 'Deep focus session'
            : 'Short recovery break'}
        </p>

        {/* Progress Bar */}
        <div className="mt-4 max-w-xs mx-auto h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              phase === 'focus'
                ? 'bg-indigo-600 dark:bg-indigo-400'
                : 'bg-emerald-500 dark:bg-emerald-400'
            }`}
            style={{ width: `${Math.round(progressFraction * 100)}%` }}
          />
        </div>

        {/* Controls */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setIsRunning((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500'
                : 'bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset focus timer"
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handleSkipPhase}
            aria-label="Skip to next timer phase"
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Linked Activity Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="focus-linked-block-select"
            className="text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Active Block
          </label>
          {linkedBlock && (
            <button
              type="button"
              onClick={() => onCompleteLinkedBlock(linkedBlock.id)}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {linkedBlock.completed ? 'Completed' : 'Mark Block Done'}
              </span>
            </button>
          )}
        </div>

        <select
          id="focus-linked-block-select"
          value={linkedBlock?.id || ''}
          onChange={(e) =>
            onSelectBlockId(e.target.value ? e.target.value : null)
          }
          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
        >
          <option value="">General Focus (Unlinked)</option>
          {focusableBlocks.map((b) => (
            <option key={b.id} value={b.id}>
              {minutesToTimeStr(b.startMinutes)} – {b.title} (
              {CATEGORY_META[b.category].shortLabel})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
