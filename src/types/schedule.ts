export type BlockCategory =
  | 'lecture'
  | 'study'
  | 'exercise'
  | 'hobby'
  | 'meal'
  | 'sleep';

export type MacroGroup = 'academics' | 'passions' | 'rest';

export interface TimeBlock {
  id: string;
  title: string;
  category: BlockCategory;
  /** Minutes from 00:00 (0 to 1440) */
  startMinutes: number;
  /** Minutes from 00:00 (0 to 1440), must be > startMinutes */
  endMinutes: number;
  courseTag?: string;
  location?: string;
  notes?: string;
  completed?: boolean;
  linkedTaskId?: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';

export interface CourseworkTask {
  id: string;
  title: string;
  course: string;
  priority: TaskPriority;
  estimatedMinutes: number;
  dueLabel: string;
  completed: boolean;
  scheduledBlockId?: string;
  category: 'exercise' | 'study';
}

export type RoutineTemplateId =
  | 'default-balanced'
  | 'lecture-heavy'
  | 'exam-crunch'
  | 'balanced-weekend';

export interface RoutineTemplate {
  id: RoutineTemplateId;
  name: string;
  subtitle: string;
  description: string;
  recommendedSleepHours: number;
  recommendedHobbyHours: number;
  blocks: Omit<TimeBlock, 'id'>[];
}

export interface CategoryMeta {
  id: BlockCategory;
  label: string;
  shortLabel: string;
  macroGroup: MacroGroup;
  description: string;
  /** Subtle surface & border classes for Light & Dark modes (no border-l-4) */
  surfaceClass: string;
  badgeTextClass: string;
  dotColorClass: string;
  strokeHex: string;
  darkStrokeHex: string;
}

export interface OverlapPair {
  blockAId: string;
  blockBId: string;
  overlapMinutes: number;
}

export interface BalanceMetrics {
  totalScheduledMinutes: number;
  unscheduledMinutes: number;
  academicsMinutes: number;
  passionsMinutes: number;
  restMinutes: number;
  sleepMinutes: number;
  mealsMinutes: number;
  lectureMinutes: number;
  studyMinutes: number;
  exerciseMinutes: number;
  academicsPercent: number;
  passionsPercent: number;
  restPercent: number;
  unscheduledPercent: number;
  sleepGoalMinutes: number;
  sleepDeficitMinutes: number;
  sleepStatus: 'optimal' | 'warning' | 'deficit';
  sleepMessage: string;
  hobbyQuotaMinutes: number;
  hobbyDeficitMinutes: number;
  hobbyStatus: 'met' | 'low' | 'neglected';
  hobbyMessage: string;
  burnoutRisk: 'low' | 'moderate' | 'high';
  burnoutReason: string;
}
