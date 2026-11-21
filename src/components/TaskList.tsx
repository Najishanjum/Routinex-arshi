import { useState, useMemo } from 'react';
import { TaskCard } from './TaskCard';
import { PriorityMatrix } from './PriorityMatrix';
import { Task, TaskStatus, ViewMode } from '@/types/task';
import { getEffectiveTaskStatus } from '@/lib/productivity';
import { Grid, List, CheckCircle2, Clock, AlertTriangle, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStatusChange?: (task: Task, status: TaskStatus) => void;
  viewMode: ViewMode;
}

export function TaskList({ 
  tasks, 
  onEditTask, 
  onDeleteTask, 
  onStatusChange, 
  viewMode 
}: TaskListProps) {
  const [showMatrix, setShowMatrix] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'missed'>('all');

  // Count by effective status
  const counts = useMemo(() => {
    let pending = 0;
    let completed = 0;
    let missed = 0;

    tasks.forEach(t => {
      const st = getEffectiveTaskStatus(t);
      if (st === 'completed') completed++;
      else if (st === 'missed') missed++;
      else pending++;
    });

    return { all: tasks.length, pending, completed, missed };
  }, [tasks]);

  // Filter tasks based on statusFilter
  const displayedTasks = useMemo(() => {
    if (statusFilter === 'all') return tasks;
    return tasks.filter(t => getEffectiveTaskStatus(t) === statusFilter);
  }, [tasks, statusFilter]);

  // Matrix view toggle & status filter header
  const ViewHeader = () => (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Your Schedule & Tasks
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Track daily activities, mark completions, and monitor your consistency
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowMatrix(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              !showMatrix
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List View
          </button>
          <button
            onClick={() => setShowMatrix(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              showMatrix
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Priority Matrix
          </button>
        </div>
      </div>

      {/* Status Filter Tabs (when not in matrix view) */}
      {!showMatrix && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-500" />
            Pending ({counts.pending})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              statusFilter === 'completed'
                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Completed ({counts.completed})
          </button>
          <button
            onClick={() => setStatusFilter('missed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              statusFilter === 'missed'
                ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            Missed ({counts.missed})
          </button>
        </div>
      )}
    </div>
  );

  if (tasks.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No tasks found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm mx-auto">
          {viewMode === 'daily' 
            ? "You haven't scheduled any tasks for today yet. Use 'Add Task' or your 'Routine Builder' to plan your activities." 
            : viewMode === 'weekly' 
              ? "No tasks recorded for this week." 
              : "No tasks recorded for this month."
          }
        </p>
      </div>
    );
  }

  if (showMatrix) {
    return (
      <div className="space-y-6">
        <ViewHeader />
        <PriorityMatrix 
          tasks={displayedTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onStatusChange={onStatusChange}
        />
      </div>
    );
  }

  // Group tasks by date for weekly/monthly views
  const groupedTasks = displayedTasks.reduce((groups, task) => {
    const date = task.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
    return groups;
  }, {} as Record<string, Task[]>);

  if (viewMode === 'daily') {
    return (
      <div className="space-y-6">
        <ViewHeader />
        {displayedTasks.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-2xl">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No tasks match the status filter "{statusFilter}".
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ViewHeader />
      <div className="space-y-6">
        {Object.entries(groupedTasks)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([date, dateTasks]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                <span className="text-xs font-normal text-gray-500">
                  ({dateTasks.length} task{dateTasks.length !== 1 ? 's' : ''})
                </span>
              </h3>
              {dateTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
