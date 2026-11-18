import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  Moon,
  Plus,
} from 'lucide-react';
import { BalanceMetrics } from '../types/schedule';
import { formatDuration, formatHoursDecimal } from '../utils/scheduleMath';

interface BalanceDashboardProps {
  metrics: BalanceMetrics;
  sleepGoalHours: number;
  hobbyQuotaHours: number;
  onChangeSleepGoal: (hours: number) => void;
  onChangeHobbyQuota: (hours: number) => void;
  onQuickExtendSleep: () => void;
  onQuickAddHobby: () => void;
}

export const BalanceDashboard: React.FC<BalanceDashboardProps> = ({
  metrics,
  sleepGoalHours,
  hobbyQuotaHours,
  onChangeSleepGoal,
  onChangeHobbyQuota,
  onQuickExtendSleep,
  onQuickAddHobby,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const sleepProgressPct = Math.min(
    100,
    Math.round(
      (metrics.sleepMinutes / Math.max(1, metrics.sleepGoalMinutes)) * 100
    )
  );
  const hobbyProgressPct = Math.min(
    100,
    Math.round(
      (metrics.passionsMinutes / Math.max(1, metrics.hobbyQuotaMinutes)) * 100
    )
  );

  const hasWarning =
    metrics.sleepStatus !== 'optimal' || metrics.hobbyStatus !== 'met';

  return (
    <section
      aria-label="Life-Balance and Sleep Tracker"
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-5 py-4 shadow-2xs transition-all"
    >
      {/* Compact Default View: Core 24h Distribution Chart + Expand Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                24-Hour Day Balance
              </h2>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {formatHoursDecimal(metrics.totalScheduledMinutes)} / 24h planned
              </span>
              {hasWarning && !isExpanded && (
                <>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                    <span>
                      {metrics.sleepStatus !== 'optimal'
                        ? 'Sleep below goal'
                        : 'Hobbies below quota'}
                    </span>
                  </span>
                </>
              )}
            </div>

            {/* Inline legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                <span>Academics</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                  {formatDuration(metrics.academicsMinutes)} ({metrics.academicsPercent}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                <span>Passions</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                  {formatDuration(metrics.passionsMinutes)} ({metrics.passionsPercent}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400" />
                <span>Rest</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                  {formatDuration(metrics.restMinutes)} ({metrics.restPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Stacked horizontal 24h bar */}
          <div
            className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex"
            role="img"
            aria-label={`24 hour distribution: Academics ${metrics.academicsPercent}%, Passions ${metrics.passionsPercent}%, Rest ${metrics.restPercent}%`}
          >
            <div
              className="bg-indigo-600 dark:bg-indigo-500 transition-all duration-200"
              style={{ width: `${metrics.academicsPercent}%` }}
              title={`Academics: ${metrics.academicsPercent}%`}
            />
            <div
              className="bg-emerald-500 dark:bg-emerald-400 transition-all duration-200"
              style={{ width: `${metrics.passionsPercent}%` }}
              title={`Passions: ${metrics.passionsPercent}%`}
            />
            <div
              className="bg-sky-500 dark:bg-sky-400 transition-all duration-200"
              style={{ width: `${metrics.restPercent}%` }}
              title={`Rest & Sleep: ${metrics.restPercent}%`}
            />
          </div>
        </div>

        {/* Expand / Collapse Button */}
        <div className="flex items-center justify-end shrink-0">
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls="balance-dashboard-details"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Goals' : 'Goals & Actions'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Drawer: Detailed Sleep Goal, Hobbies Quota & Quick Recovery Actions */}
      {isExpanded && (
        <div
          id="balance-dashboard-details"
          className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Detailed Sleep Goal Panel */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Moon
                  className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Sleep Goal Indicator
                </span>
                <label htmlFor="sleep-goal-select" className="sr-only">
                  Daily sleep goal target
                </label>
                <select
                  id="sleep-goal-select"
                  aria-label="Daily sleep goal target"
                  value={sleepGoalHours}
                  onChange={(e) => onChangeSleepGoal(parseFloat(e.target.value))}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs rounded-md px-2 py-0.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <option value={7}>Target: 7.0h</option>
                  <option value={7.5}>Target: 7.5h</option>
                  <option value={8}>Target: 8.0h</option>
                  <option value={8.5}>Target: 8.5h</option>
                  <option value={9}>Target: 9.0h</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {formatDuration(metrics.sleepMinutes)}
                </span>
                {metrics.sleepStatus === 'optimal' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Sleep Protected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>-{formatDuration(metrics.sleepDeficitMinutes)}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  metrics.sleepStatus === 'optimal'
                    ? 'bg-emerald-500 dark:bg-emerald-400'
                    : metrics.sleepStatus === 'warning'
                    ? 'bg-amber-500 dark:bg-amber-400'
                    : 'bg-rose-500 dark:bg-rose-400'
                }`}
                style={{ width: `${sleepProgressPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {metrics.sleepMessage}
              </p>
              {metrics.sleepDeficitMinutes > 0 && (
                <button
                  type="button"
                  onClick={onQuickExtendSleep}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-3 h-3" aria-hidden="true" />
                  <span>Extend Sleep (+{formatDuration(metrics.sleepDeficitMinutes)})</span>
                </button>
              )}
            </div>
          </div>

          {/* Detailed Hobbies & Passions Quota Panel */}
          <div className="space-y-2.5 md:border-l md:border-slate-100 md:dark:border-slate-800 md:pl-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Heart
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Hobbies & Passions Quota
                </span>
                <label htmlFor="hobby-quota-select" className="sr-only">
                  Daily hobbies and passions quota
                </label>
                <select
                  id="hobby-quota-select"
                  aria-label="Daily hobbies and passions quota"
                  value={hobbyQuotaHours}
                  onChange={(e) =>
                    onChangeHobbyQuota(parseFloat(e.target.value))
                  }
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs rounded-md px-2 py-0.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <option value={1}>Quota: 1.0h</option>
                  <option value={1.5}>Quota: 1.5h</option>
                  <option value={2}>Quota: 2.0h</option>
                  <option value={2.5}>Quota: 2.5h</option>
                  <option value={3}>Quota: 3.0h</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {formatDuration(metrics.passionsMinutes)}
                </span>
                {metrics.hobbyStatus === 'met' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Quota Met</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Below Quota</span>
                  </span>
                )}
              </div>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  metrics.hobbyStatus === 'met'
                    ? 'bg-emerald-500 dark:bg-emerald-400'
                    : 'bg-amber-500 dark:bg-amber-400'
                }`}
                style={{ width: `${hobbyProgressPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {metrics.hobbyMessage}
              </p>
              <button
                type="button"
                onClick={onQuickAddHobby}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/70 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3 h-3" aria-hidden="true" />
                <span>+45m Hobby</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
