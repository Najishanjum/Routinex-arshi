import { Clock, Calendar, Camera, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Task, TaskStatus, CATEGORIES, PRIORITIES } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { getEffectiveTaskStatus } from '@/lib/productivity';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange?: (task: Task, status: TaskStatus) => void;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const category = CATEGORIES.find(c => c.id === task.category);
  const priority = PRIORITIES.find(p => p.id === task.priority);
  const effectiveStatus = getEffectiveTaskStatus(task);
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const getPriorityBorderClass = () => {
    if (effectiveStatus === 'completed') return 'border-l-4 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10';
    if (effectiveStatus === 'missed') return 'border-l-4 border-rose-500 bg-rose-50/10 dark:bg-rose-950/10';
    if (!priority) return '';
    switch (priority.id) {
      case 'urgent-important':
        return 'border-l-4 border-red-500';
      case 'not-urgent-important':
        return 'border-l-4 border-yellow-500';
      case 'urgent-not-important':
        return 'border-l-4 border-blue-500';
      case 'low-priority':
        return 'border-l-4 border-green-500';
      default:
        return '';
    }
  };

  return (
    <div className={`task-item glass-card rounded-2xl p-5 group transition-all duration-300 ${getPriorityBorderClass()}`}>
      <div className="flex items-start justify-between gap-4">
        
        {/* Left Side: Status Action Button + Task Info */}
        <div className="flex items-start gap-3 flex-1">
          {/* Quick status toggle button */}
          {onStatusChange && (
            <button
              onClick={() => {
                const nextStatus: TaskStatus = effectiveStatus === 'completed' ? 'pending' : 'completed';
                onStatusChange(task, nextStatus);
              }}
              className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                effectiveStatus === 'completed'
                  ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                  : effectiveStatus === 'missed'
                    ? 'border-rose-400 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500 text-transparent hover:text-emerald-500'
              }`}
              title={effectiveStatus === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
            >
              <CheckCircle2 className="w-4 h-4 fill-current" />
            </button>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className={`text-base font-semibold ${
                effectiveStatus === 'completed'
                  ? 'line-through text-gray-500 dark:text-gray-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {task.title}
              </h3>

              {/* Status Badge */}
              <Badge
                variant="outline"
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  effectiveStatus === 'completed'
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                    : effectiveStatus === 'missed'
                      ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200'
                      : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200'
                }`}
              >
                {effectiveStatus === 'completed' ? 'Completed' : effectiveStatus === 'missed' ? 'Missed' : 'Pending'}
              </Badge>

              {priority && (
                <Badge 
                  variant="outline" 
                  className={`priority-${priority.id} flex items-center gap-1 font-medium text-xs`}
                >
                  <span>{priority.icon}</span>
                  {priority.label}
                </Badge>
              )}
              {category && (
                <Badge 
                  variant="outline" 
                  className={`category-${category.id} flex items-center gap-1 font-medium text-xs`}
                >
                  <span>{category.icon}</span>
                  {category.label}
                </Badge>
              )}
              {task.photos && task.photos.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-xs">
                  <Camera className="w-3 h-3" />
                  {task.photos.length}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              {task.startTime && (
                <div className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                  <Clock className="w-3.5 h-3.5" />
                  {task.startTime} {task.endTime ? `- ${task.endTime}` : ''}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(task.duration)}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(task.date).toLocaleDateString()}
              </div>
            </div>
            
            {task.notes && (
              <p className="text-gray-700 dark:text-gray-300 mt-2 text-xs leading-relaxed">
                {task.notes}
              </p>
            )}

            {task.photos && task.photos.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {task.photos.slice(0, 3).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${task.title} photo ${index + 1}`}
                    className="w-14 h-14 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => {
                      const newWindow = window.open('', '_blank');
                      if (newWindow) {
                        newWindow.document.write(`<img src="${photo}" style="max-width:100%;max-height:100%;object-fit:contain;" />`);
                      }
                    }}
                  />
                ))}
                {task.photos.length > 3 && (
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                    +{task.photos.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Status Actions & Edit/Delete */}
        <div className="flex items-center gap-1 self-start">
          {onStatusChange && (
            <div className="flex items-center gap-1 mr-1">
              {effectiveStatus === 'pending' && (
                <button
                  onClick={() => onStatusChange(task, 'missed')}
                  className="px-2 py-1 text-[11px] rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1"
                  title="Mark as Missed"
                >
                  <XCircle className="w-3.5 h-3.5" /> Missed
                </button>
              )}
              {effectiveStatus !== 'pending' && (
                <button
                  onClick={() => onStatusChange(task, 'pending')}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Reset to Pending"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            title="Edit task"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            title="Delete task"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
