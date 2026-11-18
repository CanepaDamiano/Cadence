import {
  BalanceMetrics,
  BlockCategory,
  CategoryMeta,
  OverlapPair,
  TimeBlock,
} from '../types/schedule';

export const CATEGORY_META: Record<BlockCategory, CategoryMeta> = {
  lecture: {
    id: 'lecture',
    label: 'Lectures & Classes',
    shortLabel: 'Lecture',
    macroGroup: 'academics',
    description: 'Scheduled university lectures, seminars, and lab sessions',
    surfaceClass:
      'bg-sky-50/90 hover:bg-sky-100/80 border-sky-200/90 text-sky-950 dark:bg-sky-950/45 dark:hover:bg-sky-900/50 dark:border-sky-800/70 dark:text-sky-100',
    badgeTextClass: 'text-sky-700 dark:text-sky-300',
    dotColorClass: 'bg-sky-500 dark:bg-sky-400',
    strokeHex: '#0284c7',
    darkStrokeHex: '#38bdf8',
  },
  study: {
    id: 'study',
    label: 'Deep Study',
    shortLabel: 'Deep Study',
    macroGroup: 'academics',
    description: 'Focused reading, concept review, and exam preparation',
    surfaceClass:
      'bg-indigo-50/90 hover:bg-indigo-100/80 border-indigo-200/90 text-indigo-950 dark:bg-indigo-950/45 dark:hover:bg-indigo-900/50 dark:border-indigo-800/70 dark:text-indigo-100',
    badgeTextClass: 'text-indigo-700 dark:text-indigo-300',
    dotColorClass: 'bg-indigo-500 dark:bg-indigo-400',
    strokeHex: '#4f46e5',
    darkStrokeHex: '#818cf8',
  },
  exercise: {
    id: 'exercise',
    label: 'Exercises & Assignments',
    shortLabel: 'Exercises',
    macroGroup: 'academics',
    description: 'Problem sets, coding labs, essays, and graded coursework',
    surfaceClass:
      'bg-amber-50/90 hover:bg-amber-100/80 border-amber-200/90 text-amber-950 dark:bg-amber-950/40 dark:hover:bg-amber-900/45 dark:border-amber-800/70 dark:text-amber-100',
    badgeTextClass: 'text-amber-800 dark:text-amber-300',
    dotColorClass: 'bg-amber-500 dark:bg-amber-400',
    strokeHex: '#d97706',
    darkStrokeHex: '#fbbf24',
  },
  hobby: {
    id: 'hobby',
    label: 'Hobbies & Passions',
    shortLabel: 'Passions',
    macroGroup: 'passions',
    description: 'Creative pursuits, sports, music, clubs, and personal joy',
    surfaceClass:
      'bg-emerald-50/90 hover:bg-emerald-100/80 border-emerald-200/90 text-emerald-950 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/45 dark:border-emerald-800/70 dark:text-emerald-100',
    badgeTextClass: 'text-emerald-800 dark:text-emerald-300',
    dotColorClass: 'bg-emerald-500 dark:bg-emerald-400',
    strokeHex: '#059669',
    darkStrokeHex: '#34d399',
  },
  meal: {
    id: 'meal',
    label: 'Meals & Breaks',
    shortLabel: 'Meals & Break',
    macroGroup: 'rest',
    description: 'Nourishment, coffee walks, power naps, and decompression',
    surfaceClass:
      'bg-rose-50/85 hover:bg-rose-100/75 border-rose-200/85 text-rose-950 dark:bg-rose-950/35 dark:hover:bg-rose-900/45 dark:border-rose-800/65 dark:text-rose-100',
    badgeTextClass: 'text-rose-800 dark:text-rose-300',
    dotColorClass: 'bg-rose-400 dark:bg-rose-400',
    strokeHex: '#e11d48',
    darkStrokeHex: '#fb7185',
  },
  sleep: {
    id: 'sleep',
    label: 'Sleep & Night Rest',
    shortLabel: 'Sleep',
    macroGroup: 'rest',
    description: 'Restorative overnight sleep and wind-down routine',
    surfaceClass:
      'bg-slate-100/90 hover:bg-slate-200/75 border-slate-300/90 text-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-800/80 dark:border-slate-700/80 dark:text-slate-200',
    badgeTextClass: 'text-slate-700 dark:text-slate-300',
    dotColorClass: 'bg-slate-500 dark:bg-slate-400',
    strokeHex: '#475569',
    darkStrokeHex: '#94a3b8',
  },
};

export const CATEGORY_LIST: CategoryMeta[] = Object.values(CATEGORY_META);

/**
 * Converts minutes from midnight (e.g. 510) to "08:30"
 */
export function minutesToTimeStr(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(1440, Math.round(totalMinutes)));
  if (clamped === 1440) return '24:00';
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Converts "08:30" to 510 minutes from midnight
 */
export function timeStrToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const trimmed = timeStr.trim();
  if (trimmed === '24:00') return 1440;
  const parts = trimmed.split(':');
  if (parts.length !== 2) return 0;
  const hours = parseInt(parts[0], 10);
  const mins = parseInt(parts[1], 10);
  if (Number.isNaN(hours) || Number.isNaN(mins)) return 0;
  return Math.max(0, Math.min(1440, hours * 60 + mins));
}

/**
 * Formats a duration in minutes into a human-friendly string like "1h 30m" or "45m"
 */
export function formatDuration(minutes: number): string {
  const rounded = Math.max(0, Math.round(minutes));
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Formats minutes into decimal hours like "7.5h"
 */
export function formatHoursDecimal(minutes: number): string {
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours.toFixed(0) : hours.toFixed(1)}h`;
}

/**
 * Sorts time blocks chronologically by startMinutes, then by endMinutes
 */
export function sortTimeBlocks(blocks: TimeBlock[]): TimeBlock[] {
  return [...blocks].sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) {
      return a.startMinutes - b.startMinutes;
    }
    return a.endMinutes - b.endMinutes;
  });
}

/**
 * Detects all overlapping block pairs in a schedule.
 * Two blocks overlap if max(startA, startB) < min(endA, endB).
 */
export function detectOverlaps(blocks: TimeBlock[]): OverlapPair[] {
  const sorted = sortTimeBlocks(blocks);
  const overlaps: OverlapPair[] = [];

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      const overlapStart = Math.max(a.startMinutes, b.startMinutes);
      const overlapEnd = Math.min(a.endMinutes, b.endMinutes);
      if (overlapStart < overlapEnd) {
        overlaps.push({
          blockAId: a.id,
          blockBId: b.id,
          overlapMinutes: overlapEnd - overlapStart,
        });
      }
    }
  }

  return overlaps;
}

/**
 * Returns the set of block IDs that participate in at least one overlap
 */
export function getOverlappingBlockIds(blocks: TimeBlock[]): Set<string> {
  const pairs = detectOverlaps(blocks);
  const ids = new Set<string>();
  for (const p of pairs) {
    ids.add(p.blockAId);
    ids.add(p.blockBId);
  }
  return ids;
}

/**
 * Adjusts a block's duration by deltaMinutes (e.g. +15, -15, +30),
 * clamping duration between 15 minutes and the end of day (1440).
 */
export function adjustBlockDuration(
  block: TimeBlock,
  deltaMinutes: number
): TimeBlock {
  const currentDuration = block.endMinutes - block.startMinutes;
  const nextDuration = Math.max(15, currentDuration + deltaMinutes);
  const nextEnd = Math.min(1440, block.startMinutes + nextDuration);
  // Ensure at least 15m even near 24:00
  const adjustedStart =
    nextEnd - block.startMinutes < 15
      ? Math.max(0, nextEnd - 15)
      : block.startMinutes;

  return {
    ...block,
    startMinutes: adjustedStart,
    endMinutes: nextEnd,
  };
}

/**
 * Finds the next available non-overlapping time slot of `durationMinutes`
 * starting at or after `preferredStartMinutes` (defaults to 08:00 = 480).
 * Searches 08:00–22:30 first, then falls back to 06:00–24:00.
 */
export function findNextAvailableSlot(
  blocks: TimeBlock[],
  durationMinutes: number,
  preferredStartMinutes = 480
): { startMinutes: number; endMinutes: number } {
  const dur = Math.max(15, Math.min(360, durationMinutes));
  const sorted = sortTimeBlocks(blocks);

  const isRangeFree = (start: number, end: number): boolean => {
    if (start < 0 || end > 1440 || start >= end) return false;
    return !sorted.some(
      (b) => Math.max(start, b.startMinutes) < Math.min(end, b.endMinutes)
    );
  };

  // Search in 15-minute increments from preferredStartMinutes up to 22:30 (1350)
  for (let t = preferredStartMinutes; t + dur <= 1350; t += 15) {
    if (isRangeFree(t, t + dur)) {
      return { startMinutes: t, endMinutes: t + dur };
    }
  }

  // Search earlier waking hours 06:00 (360) to preferredStartMinutes
  for (let t = 360; t + dur <= preferredStartMinutes; t += 15) {
    if (isRangeFree(t, t + dur)) {
      return { startMinutes: t, endMinutes: t + dur };
    }
  }

  // Search late evening up to 24:00
  for (let t = 360; t + dur <= 1440; t += 15) {
    if (isRangeFree(t, t + dur)) {
      return { startMinutes: t, endMinutes: t + dur };
    }
  }

  // If no gap of full `dur` exists, find the largest open gap between 07:00 (420) and 23:00 (1380)
  let bestGapStart = preferredStartMinutes;
  let bestGapDuration = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const gapStart = Math.max(420, sorted[i].endMinutes);
    const gapEnd = Math.min(1380, sorted[i + 1].startMinutes);
    if (gapEnd - gapStart > bestGapDuration) {
      bestGapDuration = gapEnd - gapStart;
      bestGapStart = gapStart;
    }
  }

  if (bestGapDuration >= 15) {
    return {
      startMinutes: bestGapStart,
      endMinutes: Math.min(1440, bestGapStart + dur),
    };
  }

  // Final fallback
  const fallbackStart = Math.min(preferredStartMinutes, 1440 - dur);
  return {
    startMinutes: fallbackStart,
    endMinutes: fallbackStart + dur,
  };
}

/**
 * Resolves overlaps automatically by shifting colliding non-sleep, non-lecture blocks forward
 * or trimming them so the schedule has zero overlaps.
 */
export function autoResolveOverlaps(blocks: TimeBlock[]): TimeBlock[] {
  const sorted = sortTimeBlocks(blocks);
  const resolved: TimeBlock[] = [];

  for (const block of sorted) {
    const duration = Math.max(15, block.endMinutes - block.startMinutes);
    let candidateStart = block.startMinutes;

    // Check against already placed blocks
    for (const placed of resolved) {
      const overlapStart = Math.max(candidateStart, placed.startMinutes);
      const overlapEnd = Math.min(candidateStart + duration, placed.endMinutes);
      if (overlapStart < overlapEnd) {
        candidateStart = placed.endMinutes;
      }
    }

    if (candidateStart + duration <= 1440) {
      resolved.push({
        ...block,
        startMinutes: candidateStart,
        endMinutes: candidateStart + duration,
      });
    } else if (candidateStart < 1425) {
      resolved.push({
        ...block,
        startMinutes: candidateStart,
        endMinutes: 1440,
      });
    } else {
      // Keep original if day is completely full
      resolved.push(block);
    }
  }

  return sortTimeBlocks(resolved);
}

/**
 * Calculates full 24-hour Life-Balance, Sleep Goal, and Passions Quota metrics.
 */
export function calculateBalanceMetrics(
  blocks: TimeBlock[],
  sleepGoalHours = 7.5,
  hobbyQuotaHours = 1.5
): BalanceMetrics {
  let lectureMinutes = 0;
  let studyMinutes = 0;
  let exerciseMinutes = 0;
  let passionsMinutes = 0;
  let sleepMinutes = 0;
  let mealsMinutes = 0;

  for (const block of blocks) {
    const dur = Math.max(0, block.endMinutes - block.startMinutes);
    switch (block.category) {
      case 'lecture':
        lectureMinutes += dur;
        break;
      case 'study':
        studyMinutes += dur;
        break;
      case 'exercise':
        exerciseMinutes += dur;
        break;
      case 'hobby':
        passionsMinutes += dur;
        break;
      case 'sleep':
        sleepMinutes += dur;
        break;
      case 'meal':
        mealsMinutes += dur;
        break;
    }
  }

  const academicsMinutes = lectureMinutes + studyMinutes + exerciseMinutes;
  const restMinutes = sleepMinutes + mealsMinutes;
  const totalScheduledMinutes =
    academicsMinutes + passionsMinutes + restMinutes;
  const unscheduledMinutes = Math.max(0, 1440 - totalScheduledMinutes);

  const academicsPercent = Math.round((academicsMinutes / 1440) * 100);
  const passionsPercent = Math.round((passionsMinutes / 1440) * 100);
  const restPercent = Math.round((restMinutes / 1440) * 100);
  const unscheduledPercent = Math.max(
    0,
    100 - academicsPercent - passionsPercent - restPercent
  );

  const sleepGoalMinutes = Math.round(sleepGoalHours * 60);
  const sleepDeficitMinutes = Math.max(0, sleepGoalMinutes - sleepMinutes);

  let sleepStatus: 'optimal' | 'warning' | 'deficit' = 'optimal';
  let sleepMessage = `On track for ${formatHoursDecimal(sleepMinutes)} of restorative sleep (Target: ${formatHoursDecimal(sleepGoalMinutes)}).`;

  if (sleepMinutes < sleepGoalMinutes - 60) {
    sleepStatus = 'deficit';
    sleepMessage = `Schedule cuts into sleep by ${formatDuration(sleepDeficitMinutes)}. Consider shifting late study blocks to protect memory consolidation.`;
  } else if (sleepMinutes < sleepGoalMinutes) {
    sleepStatus = 'warning';
    sleepMessage = `${formatDuration(sleepDeficitMinutes)} shy of your ${formatHoursDecimal(sleepGoalMinutes)} sleep target. Try winding down a bit earlier tonight.`;
  }

  const hobbyQuotaMinutes = Math.round(hobbyQuotaHours * 60);
  const hobbyDeficitMinutes = Math.max(0, hobbyQuotaMinutes - passionsMinutes);

  let hobbyStatus: 'met' | 'low' | 'neglected' = 'met';
  let hobbyMessage = `${formatDuration(passionsMinutes)} reserved for hobbies and personal passions today.`;

  if (passionsMinutes === 0) {
    hobbyStatus = 'neglected';
    hobbyMessage =
      'No personal passion time scheduled yet. Even 45 minutes of a hobby lowers academic burnout.';
  } else if (passionsMinutes < hobbyQuotaMinutes) {
    hobbyStatus = 'low';
    hobbyMessage = `Add ${formatDuration(hobbyDeficitMinutes)} more of personal time to reach your ${formatHoursDecimal(hobbyQuotaMinutes)} daily passion quota.`;
  }

  // Burnout assessment
  let burnoutRisk: 'low' | 'moderate' | 'high' = 'low';
  let burnoutReason =
    'Healthy cadence across coursework, personal hobbies, and sleep recovery.';

  if (
    academicsMinutes > 600 ||
    (sleepStatus === 'deficit' && hobbyStatus === 'neglected')
  ) {
    burnoutRisk = 'high';
    burnoutReason =
      'High academic load combined with reduced recovery time. Add a break or protect your sleep window.';
  } else if (
    academicsMinutes > 480 ||
    sleepStatus !== 'optimal' ||
    hobbyStatus !== 'met'
  ) {
    burnoutRisk = 'moderate';
    burnoutReason =
      'Solid productivity, though recovery or hobby quota is slightly compressed.';
  }

  return {
    totalScheduledMinutes,
    unscheduledMinutes,
    academicsMinutes,
    passionsMinutes,
    restMinutes,
    sleepMinutes,
    mealsMinutes,
    lectureMinutes,
    studyMinutes,
    exerciseMinutes,
    academicsPercent,
    passionsPercent,
    restPercent,
    unscheduledPercent,
    sleepGoalMinutes,
    sleepDeficitMinutes,
    sleepStatus,
    sleepMessage,
    hobbyQuotaMinutes,
    hobbyDeficitMinutes,
    hobbyStatus,
    hobbyMessage,
    burnoutRisk,
    burnoutReason,
  };
}
