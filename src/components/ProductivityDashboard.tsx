import { useMemo } from 'react';
import { Task } from '@/types/task';
import { Routine } from '@/types/routine';
import { calculateDailyProductivity } from '@/lib/productivity';
import { 
  CheckCircle2, Clock, AlertTriangle, Sparkles, Calendar, 
  Plus, Zap, ArrowRight, BarChart2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductivityDashboardProps {
  tasks: Task[];
  routines: Routine[];
  selectedDate: string;
  onOpenRoutineManager: () => void;
  onOpenAddTask: () => void;
  onOpenAICoach: () => void;
}

export function ProductivityDashboard({
  tasks,
  routines,
  selectedDate,
  onOpenRoutineManager,
  onOpenAddTask,
  onOpenAICoach,
}: ProductivityDashboardProps) {
  const productivity = useMemo(() => {
    return calculateDailyProductivity(tasks, selectedDate);
  }, [tasks, selectedDate]);

  const activeRoutinesCount = routines.filter(r => r.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Card: Large Productivity Percentage & Status Overview */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/20 dark:border-gray-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Circular / Large Score Display */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Circular SVG Progress */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-gray-200 dark:stroke-gray-700/60"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`transition-all duration-700 ease-out ${
                    productivity.percentage >= 80
                      ? 'stroke-emerald-500'
                      : productivity.percentage >= 50
                        ? 'stroke-blue-500'
                        : 'stroke-amber-500'
                  }`}
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - (productivity.hasTasks ? productivity.percentage : 0) / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {productivity.hasTasks ? (
                  <>
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      {productivity.percentage}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      Productivity
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-gray-400 text-center px-2">
                    No Tasks Due
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 rounded-full">
                  Daily Overview
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(selectedDate).toLocaleDateString(undefined, { 
                    weekday: 'short', month: 'short', day: 'numeric' 
                  })}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {productivity.hasTasks 
                  ? productivity.percentage >= 80 
                    ? "Phenomenal focus today! 🔥"
                    : productivity.percentage >= 50
                      ? "Good momentum, keep going! ⚡"
                      : "Off to a start — let's tackle your priorities! 🎯"
                  : "Ready to plan your productive day? 🚀"
                }
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                {productivity.hasTasks
                  ? `Completed ${productivity.completedTasks} out of ${productivity.eligibleTasks} eligible tasks scheduled for today.`
                  : "No tasks are due or eligible right now. Add activities or enable your daily routines to start tracking."
                }
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto justify-center">
            <Button
              onClick={onOpenRoutineManager}
              className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm gap-2"
            >
              <Calendar className="w-4 h-4 text-blue-500" />
              Manage Routines ({activeRoutinesCount})
            </Button>
            <Button
              onClick={onOpenAddTask}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>

        </div>

        {/* Progress Bar under score */}
        <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-800/60">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            <span>Schedule Progress</span>
            <span>
              {productivity.completedTasks} / {productivity.totalScheduled} Total Scheduled ({productivity.hasTasks ? productivity.percentage : 0}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700/60 rounded-full h-3 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ 
                width: productivity.totalScheduled > 0 
                  ? `${(productivity.completedTasks / productivity.totalScheduled) * 100}%` 
                  : '0%' 
              }}
              title={`Completed: ${productivity.completedTasks}`}
            />
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ 
                width: productivity.totalScheduled > 0 
                  ? `${(productivity.pendingTasks / productivity.totalScheduled) * 100}%` 
                  : '0%' 
              }}
              title={`Pending: ${productivity.pendingTasks}`}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ 
                width: productivity.totalScheduled > 0 
                  ? `${(productivity.missedTasks / productivity.totalScheduled) * 100}%` 
                  : '0%' 
              }}
              title={`Missed: ${productivity.missedTasks}`}
            />
          </div>
        </div>
      </div>

      {/* Breakdown Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Completed Card */}
        <div className="glass-card rounded-2xl p-5 border border-emerald-200/50 dark:border-emerald-900/30">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {productivity.completedTasks}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Successfully finished
          </p>
        </div>

        {/* Pending Card */}
        <div className="glass-card rounded-2xl p-5 border border-amber-200/50 dark:border-amber-900/30">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {productivity.pendingTasks}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Scheduled / in progress
          </p>
        </div>

        {/* Missed Card */}
        <div className="glass-card rounded-2xl p-5 border border-rose-200/50 dark:border-rose-900/30">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Missed</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {productivity.missedTasks}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Past due deadline
          </p>
        </div>

        {/* Total Scheduled */}
        <div className="glass-card rounded-2xl p-5 border border-blue-200/50 dark:border-blue-900/30">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
            <BarChart2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {productivity.totalScheduled}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {productivity.eligibleTasks} eligible for score
          </p>
        </div>

      </div>

      {/* AI Coach Summary Teaser Card */}
      <div className="glass-card rounded-2xl p-5 border border-purple-200/60 dark:border-purple-900/40 bg-gradient-to-r from-purple-50/50 via-indigo-50/30 to-blue-50/50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600 text-white rounded-xl shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              RoutineX AI Productivity Coach
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Analyzes your missed tasks, recommends schedule shifts, and helps you optimize your day.
            </p>
          </div>
        </div>
        <Button
          onClick={onOpenAICoach}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2 w-full sm:w-auto"
        >
          Open AI Coach <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

    </div>
  );
}
