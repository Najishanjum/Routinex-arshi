import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from './useAuth';
import { Routine, RoutineActivity, AISuggestion, DayOfWeek, DAYS_OF_WEEK } from '@/types/routine';
import { Task } from '@/types/task';
import { getLocalDateString } from '@/lib/productivity';
import { toast } from 'sonner';

const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'default-morning-routine',
    name: 'Morning Productivity Ritual',
    description: 'Energizing start to build momentum for the day.',
    isActive: true,
    repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 'act-1',
        title: 'Wake up & Hydrate',
        startTime: '06:00',
        endTime: '06:15',
        duration: 15,
        category: 'health',
        notes: 'Drink a large glass of water and stretch',
        order: 1,
      },
      {
        id: 'act-2',
        title: 'Morning Workout & Jog',
        startTime: '06:30',
        endTime: '07:15',
        duration: 45,
        category: 'exercise',
        notes: 'Cardio and core exercises',
        order: 2,
      },
      {
        id: 'act-3',
        title: 'Deep Work & Coding',
        startTime: '09:00',
        endTime: '11:00',
        duration: 120,
        category: 'work',
        notes: 'Priority engineering project focus',
        order: 3,
      },
    ],
  },
];

export function useRoutines(
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) {
  const { user } = useAuth();
  const userId = user?.id ?? 'guest';

  const [routines, setRoutines] = useLocalStorage<Routine[]>(
    `routinex-routines-${userId}`,
    DEFAULT_ROUTINES
  );

  const [aiSuggestions, setAiSuggestions] = useLocalStorage<AISuggestion[]>(
    `routinex-ai-suggestions-${userId}`,
    []
  );

  /**
   * Helper to get DayOfWeek from date string YYYY-MM-DD
   */
  const getDayOfWeekFromDate = useCallback((dateStr: string): DayOfWeek => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const days: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[date.getDay()];
  }, []);

  /**
   * Synchronize routine activities into daily tasks for a given date.
   * Prevents duplicate tasks for the same routine activity on the same date.
   */
  const syncRoutinesToTasks = useCallback((dateStr: string) => {
    const dayOfWeek = getDayOfWeekFromDate(dateStr);

    setTasks(prevTasks => {
      const updated = [...prevTasks];
      let addedCount = 0;

      routines.forEach(routine => {
        if (!routine.isActive || !routine.repeatDays.includes(dayOfWeek)) {
          return;
        }

        routine.activities.forEach(activity => {
          // Check if a task already exists for this activity on this date
          const exists = updated.some(
            t => t.date === dateStr && (
              (t.routineId === routine.id && t.activityId === activity.id) ||
              (t.title === activity.title && t.startTime === activity.startTime)
            )
          );

          if (!exists) {
            const newTask: Task = {
              id: `task-${routine.id}-${activity.id}-${dateStr}`,
              title: activity.title,
              duration: activity.duration,
              date: dateStr,
              category: activity.category,
              notes: activity.notes,
              createdAt: new Date().toISOString(),
              completed: false,
              status: 'pending',
              startTime: activity.startTime,
              endTime: activity.endTime,
              routineId: routine.id,
              activityId: activity.id,
              priority: 'not-urgent-important',
            };
            updated.push(newTask);
            addedCount++;
          }
        });
      });

      return updated;
    });
  }, [routines, getDayOfWeekFromDate, setTasks]);

  /**
   * Create a new routine
   */
  const createRoutine = useCallback((routineData: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRoutine: Routine = {
      ...routineData,
      id: `routine-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRoutines(prev => [...prev, newRoutine]);
    toast.success(`Routine "${newRoutine.name}" created successfully!`);
    return newRoutine;
  }, [setRoutines]);

  /**
   * Update an existing routine
   */
  const updateRoutine = useCallback((id: string, updates: Partial<Routine>) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    }));
    toast.success('Routine updated successfully!');
  }, [setRoutines]);

  /**
   * Delete a routine
   */
  const deleteRoutine = useCallback((id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    toast.success('Routine deleted.');
  }, [setRoutines]);

  /**
   * Toggle routine active state
   */
  const toggleRoutineActive = useCallback((id: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === id) {
        const nextState = !r.isActive;
        toast.info(`Routine "${r.name}" ${nextState ? 'enabled' : 'disabled'}`);
        return { ...r, isActive: nextState, updatedAt: new Date().toISOString() };
      }
      return r;
    }));
  }, [setRoutines]);

  /**
   * Generate AI recommendations based on user task history
   */
  const generateAISuggestions = useCallback(() => {
    const missedTaskMap: Record<string, { count: number; category: string; times: string[]; titles: string[]; routineId?: string; activityId?: string }> = {};
    const completedTaskMap: Record<string, number> = {};

    tasks.forEach(task => {
      const isMissed = task.status === 'missed' || (!task.completed && task.status !== 'completed' && task.date < getLocalDateString());
      const isCompleted = task.status === 'completed' || task.completed;

      const normTitle = task.title.trim().toLowerCase();

      if (isMissed) {
        if (!missedTaskMap[normTitle]) {
          missedTaskMap[normTitle] = {
            count: 0,
            category: task.category,
            times: [],
            titles: [task.title],
            routineId: task.routineId,
            activityId: task.activityId,
          };
        }
        missedTaskMap[normTitle].count++;
        if (task.startTime) missedTaskMap[normTitle].times.push(task.startTime);
      } else if (isCompleted) {
        completedTaskMap[normTitle] = (completedTaskMap[normTitle] || 0) + 1;
      }
    });

    const suggestions: AISuggestion[] = [];

    // Analyze repeatedly missed tasks
    Object.entries(missedTaskMap).forEach(([normTitle, data]) => {
      if (data.count >= 2) {
        // Find matching routine and activity
        for (const routine of routines) {
          const act = routine.activities.find(a => 
            a.id === data.activityId || a.title.trim().toLowerCase() === normTitle
          );

          if (act) {
            // Suggest earlier time or shorter session
            const [h, m] = act.startTime.split(':').map(Number);
            let proposedStart = act.startTime;
            let proposedDuration = act.duration;
            let reason = '';

            if (h >= 18) {
              // Evening task missed repeatedly -> move earlier
              const newH = Math.max(7, h - 2);
              proposedStart = `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
              reason = `You have missed "${act.title}" ${data.count} times in the evening. Shifting it earlier to ${proposedStart} when mental energy is higher will help you stay consistent.`;
            } else if (act.duration > 45) {
              // Long task missed -> reduce initial session
              proposedDuration = Math.round(act.duration * 0.7);
              reason = `You have missed "${act.title}" ${data.count} times. Reducing duration from ${act.duration}m to ${proposedDuration}m will lower friction and rebuild your streak.`;
            } else {
              // Shift by 30 mins
              const newM = (m + 30) % 60;
              const newH = (h + (m + 30 >= 60 ? 1 : 0)) % 24;
              proposedStart = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
              reason = `"${act.title}" was missed ${data.count} times. Adjusting schedule to ${proposedStart} provides a better transition between activities.`;
            }

            suggestions.push({
              id: `sug-${routine.id}-${act.id}-${Date.now()}`,
              routineId: routine.id,
              activityId: act.id,
              patternType: 'frequently_missed',
              title: `Optimize Schedule for "${act.title}"`,
              reason,
              currentValue: {
                activityName: act.title,
                startTime: act.startTime,
                duration: act.duration,
              },
              proposedValue: {
                activityName: act.title,
                startTime: proposedStart,
                duration: proposedDuration,
              },
              status: 'pending',
              createdAt: new Date().toISOString(),
            });
            break;
          }
        }
      }
    });

    // If no suggestions derived from repeated misses, check if routines are overloaded (>6 activities)
    routines.forEach(routine => {
      if (routine.activities.length > 5 && suggestions.length === 0) {
        const lastAct = routine.activities[routine.activities.length - 1];
        suggestions.push({
          id: `sug-${routine.id}-overload-${Date.now()}`,
          routineId: routine.id,
          activityId: lastAct.id,
          patternType: 'overcrowded',
          title: `Streamline Routine: ${routine.name}`,
          reason: `Your routine "${routine.name}" has ${routine.activities.length} activities. Research shows focusing on 3–4 high-impact daily priorities dramatically improves completion rates.`,
          currentValue: {
            activityName: lastAct.title,
            duration: lastAct.duration,
            startTime: lastAct.startTime,
          },
          proposedValue: {
            activityName: lastAct.title,
            duration: Math.max(15, Math.round(lastAct.duration * 0.75)),
            startTime: lastAct.startTime,
          },
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }
    });

    // Update suggestions state
    setAiSuggestions(prev => {
      // Keep existing non-dismissed suggestions and merge new ones
      const existing = prev.filter(s => s.status === 'pending');
      const newItems = suggestions.filter(s => 
        !existing.some(e => e.routineId === s.routineId && e.activityId === s.activityId)
      );
      return [...existing, ...newItems];
    });

    return suggestions;
  }, [tasks, routines, setAiSuggestions]);

  /**
   * Apply an AI suggestion to the routine and existing scheduled tasks
   */
  const applySuggestion = useCallback((suggestionId: string) => {
    const sug = aiSuggestions.find(s => s.id === suggestionId);
    if (!sug) {
      toast.error('Suggestion not found.');
      return;
    }

    // 1. Find and update the target routine
    setRoutines(prevRoutines => {
      return prevRoutines.map(routine => {
        if (routine.id !== sug.routineId) return routine;

        const updatedActivities = routine.activities.map(act => {
          if (act.id !== sug.activityId && act.title !== sug.currentValue.activityName) {
            return act;
          }

          return {
            ...act,
            startTime: sug.proposedValue.startTime ?? act.startTime,
            duration: sug.proposedValue.duration ?? act.duration,
          };
        });

        return {
          ...routine,
          activities: updatedActivities,
          updatedAt: new Date().toISOString(),
        };
      });
    });

    // 2. Update future / pending tasks in tasks state
    const todayStr = getLocalDateString();
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (
          (task.routineId === sug.routineId && task.activityId === sug.activityId) ||
          (task.title === sug.currentValue.activityName && task.date >= todayStr && task.status === 'pending')
        ) {
          return {
            ...task,
            startTime: sug.proposedValue.startTime ?? task.startTime,
            duration: sug.proposedValue.duration ?? task.duration,
          };
        }
        return task;
      });
    });

    // 3. Mark suggestion as applied
    setAiSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, status: 'applied' } : s
    ));

    toast.success(`Applied AI suggestion for "${sug.currentValue.activityName}"! Routine updated.`);
  }, [aiSuggestions, setRoutines, setTasks, setAiSuggestions]);

  /**
   * Dismiss an AI suggestion
   */
  const dismissSuggestion = useCallback((suggestionId: string) => {
    setAiSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, status: 'dismissed' } : s
    ));
    toast.info('Suggestion dismissed.');
  }, [setAiSuggestions]);

  return {
    routines,
    aiSuggestions,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    toggleRoutineActive,
    syncRoutinesToTasks,
    generateAISuggestions,
    applySuggestion,
    dismissSuggestion,
  };
}
