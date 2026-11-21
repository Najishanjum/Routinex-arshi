import { TaskStatus } from './task';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export const DAYS_OF_WEEK: { id: DayOfWeek; label: string; short: string }[] = [
  { id: 'mon', label: 'Monday', short: 'Mon' },
  { id: 'tue', label: 'Tuesday', short: 'Tue' },
  { id: 'wed', label: 'Wednesday', short: 'Wed' },
  { id: 'thu', label: 'Thursday', short: 'Thu' },
  { id: 'fri', label: 'Friday', short: 'Fri' },
  { id: 'sat', label: 'Saturday', short: 'Sat' },
  { id: 'sun', label: 'Sunday', short: 'Sun' },
];

export interface RoutineActivity {
  id: string;
  title: string;
  startTime: string; // "06:00"
  endTime?: string; // "06:30"
  duration: number; // in minutes
  category: string;
  notes?: string;
  order: number;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  repeatDays: DayOfWeek[];
  activities: RoutineActivity[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface AISuggestion {
  id: string;
  routineId: string;
  activityId?: string;
  title: string;
  reason: string;
  patternType: 'frequently_missed' | 'unrealistic_time' | 'overcrowded' | 'high_consistency';
  currentValue: {
    activityName: string;
    startTime?: string;
    duration?: number;
    days?: DayOfWeek[];
  };
  proposedValue: {
    activityName: string;
    startTime?: string;
    duration?: number;
    days?: DayOfWeek[];
  };
  status: 'pending' | 'applied' | 'dismissed';
  createdAt: string;
}

export interface DailyProductivity {
  date: string;
  totalScheduled: number;
  eligibleTasks: number;
  completedTasks: number;
  pendingTasks: number;
  missedTasks: number;
  percentage: number;
  hasTasks: boolean;
}

export interface WeeklyProductivitySummary {
  dailyData: DailyProductivity[];
  weeklyAverage: number;
  bestDay: { date: string; dayName: string; percentage: number } | null;
  totalCompleted: number;
  totalMissed: number;
  totalEligible: number;
  trendPercentage: number; // Positive or negative vs previous 7-day period
}
