import { Task, TaskStatus } from '@/types/task';
import { DailyProductivity, WeeklyProductivitySummary } from '@/types/routine';

/**
 * Checks if a task is eligible for productivity calculation.
 * 
 * Rules:
 * - Completed tasks are ALWAYS eligible (they count towards success).
 * - Missed tasks are ALWAYS eligible (they count in denominator).
 * - For past dates, all scheduled tasks are eligible.
 * - For future dates, pending tasks are NOT yet eligible (they haven't occurred).
 * - For today's date:
 *   - Completed or Missed tasks: Eligible.
 *   - Pending tasks with a start time: Eligible if start time has arrived (task is due/in-progress/past).
 *   - Pending tasks without a start time: Eligible (scheduled for today).
 */
export function isTaskEligible(task: Task, targetDate: string, now: Date = new Date()): boolean {
  if (task.date !== targetDate) return false;

  const currentStatus = getEffectiveTaskStatus(task, now);

  // Completed or explicitly marked missed tasks are always eligible
  if (currentStatus === 'completed' || currentStatus === 'missed') {
    return true;
  }

  const todayStr = getLocalDateString(now);

  // If target date is in the past, all tasks are eligible
  if (targetDate < todayStr) {
    return true;
  }

  // If target date is in the future, pending tasks are not yet due
  if (targetDate > todayStr) {
    return false;
  }

  // Target date is TODAY: check start time if available
  if (!task.startTime) {
    return true; // Tasks scheduled for today without time are considered active
  }

  // Parse task start time "HH:mm"
  const [hours, minutes] = task.startTime.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    return true;
  }

  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  // If current time >= task start time, it is due/active
  if (currentHours > hours || (currentHours === hours && currentMinutes >= minutes)) {
    return true;
  }

  // Task is in the future today
  return false;
}

/**
 * Normalizes and resolves the effective status of a task.
 * Respects explicit user overrides: if user marked as completed or missed, returns that.
 * If pending on a past date, marks as missed if not completed.
 */
export function getEffectiveTaskStatus(task: Task, now: Date = new Date()): TaskStatus {
  // If task has explicit status
  if (task.status) {
    if (task.status === 'completed' || task.completed) return 'completed';
    if (task.status === 'missed') return 'missed';
    
    // If pending, check if it's on a past date
    const todayStr = getLocalDateString(now);
    if (task.date < todayStr) {
      return 'missed';
    }
    return 'pending';
  }

  // Backward compatibility check for task.completed boolean
  if (task.completed) {
    return 'completed';
  }

  const todayStr = getLocalDateString(now);
  if (task.date < todayStr) {
    return 'missed';
  }

  return 'pending';
}

/**
 * Calculates productivity metrics for a specific date.
 */
export function calculateDailyProductivity(
  tasks: Task[],
  dateStr: string,
  now: Date = new Date()
): DailyProductivity {
  const dayTasks = tasks.filter(t => t.date === dateStr);
  
  if (dayTasks.length === 0) {
    return {
      date: dateStr,
      totalScheduled: 0,
      eligibleTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      missedTasks: 0,
      percentage: 0,
      hasTasks: false,
    };
  }

  let completedTasks = 0;
  let missedTasks = 0;
  let pendingTasks = 0;
  let eligibleCount = 0;

  for (const task of dayTasks) {
    const status = getEffectiveTaskStatus(task, now);
    const eligible = isTaskEligible(task, dateStr, now);

    if (status === 'completed') {
      completedTasks++;
      eligibleCount++;
    } else if (eligible) {
      eligibleCount++;
      if (status === 'missed') {
        missedTasks++;
      } else {
        pendingTasks++;
      }
    } else {
      // Pending and not yet due
      pendingTasks++;
    }
  }

  // Avoid division by zero
  const percentage = eligibleCount > 0 
    ? Math.round((completedTasks / eligibleCount) * 100) 
    : 0;

  return {
    date: dateStr,
    totalScheduled: dayTasks.length,
    eligibleTasks: eligibleCount,
    completedTasks,
    pendingTasks,
    missedTasks,
    percentage,
    hasTasks: eligibleCount > 0,
  };
}

/**
 * Calculates 7-day weekly productivity summary and trend.
 */
export function calculateWeeklyProductivity(
  tasks: Task[],
  endDateStr?: string,
  now: Date = new Date()
): WeeklyProductivitySummary {
  const end = endDateStr ? new Date(endDateStr) : new Date(now);
  const dailyData: DailyProductivity[] = [];

  // Generate 7 days ending at `end`
  for (let i = 6; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const dateStr = getLocalDateString(d);
    dailyData.push(calculateDailyProductivity(tasks, dateStr, now));
  }

  // Days with valid scheduled tasks
  const activeDays = dailyData.filter(d => d.hasTasks);

  const weeklyAverage = activeDays.length > 0
    ? Math.round(activeDays.reduce((acc, d) => acc + d.percentage, 0) / activeDays.length)
    : 0;

  let bestDay: WeeklyProductivitySummary['bestDay'] = null;
  if (activeDays.length > 0) {
    const sorted = [...activeDays].sort((a, b) => b.percentage - a.percentage);
    const top = sorted[0];
    const topDate = new Date(top.date);
    const dayName = topDate.toLocaleDateString(undefined, { weekday: 'long' });
    bestDay = {
      date: top.date,
      dayName,
      percentage: top.percentage,
    };
  }

  const totalCompleted = dailyData.reduce((acc, d) => acc + d.completedTasks, 0);
  const totalMissed = dailyData.reduce((acc, d) => acc + d.missedTasks, 0);
  const totalEligible = dailyData.reduce((acc, d) => acc + d.eligibleTasks, 0);

  // Previous 7-day period for trend calculation
  let prevTotalCompleted = 0;
  let prevTotalEligible = 0;
  for (let i = 13; i >= 7; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const dateStr = getLocalDateString(d);
    const p = calculateDailyProductivity(tasks, dateStr, now);
    prevTotalCompleted += p.completedTasks;
    prevTotalEligible += p.eligibleTasks;
  }

  const prevAverage = prevTotalEligible > 0
    ? Math.round((prevTotalCompleted / prevTotalEligible) * 100)
    : 0;

  const trendPercentage = prevTotalEligible > 0
    ? weeklyAverage - prevAverage
    : 0;

  return {
    dailyData,
    weeklyAverage,
    bestDay,
    totalCompleted,
    totalMissed,
    totalEligible,
    trendPercentage,
  };
}

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
