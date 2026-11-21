import { useState } from 'react';
import { Routine, RoutineActivity, DayOfWeek, DAYS_OF_WEEK } from '@/types/routine';
import { CATEGORIES } from '@/types/task';
import { 
  X, Plus, Trash2, Edit2, Check, Clock, Calendar, AlertCircle, 
  Sparkles, Power, ArrowRight, ChevronDown, ChevronUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface RoutineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  routines: Routine[];
  onCreateRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateRoutine: (id: string, updates: Partial<Routine>) => void;
  onDeleteRoutine: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function RoutineManagerModal({
  isOpen,
  onClose,
  routines,
  onCreateRoutine,
  onUpdateRoutine,
  onDeleteRoutine,
  onToggleActive,
}: RoutineManagerModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null);
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [activities, setActivities] = useState<Omit<RoutineActivity, 'id' | 'order'>[]>([
    {
      title: 'Morning Routine',
      startTime: '07:00',
      duration: 30,
      category: 'health',
      notes: '',
    },
  ]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setDescription('');
    setRepeatDays(['mon', 'tue', 'wed', 'thu', 'fri']);
    setActivities([
      {
        title: 'Morning Focus',
        startTime: '07:00',
        duration: 30,
        category: 'health',
        notes: '',
      },
    ]);
    setIsEditing(false);
    setEditingRoutineId(null);
  };

  const startCreate = () => {
    resetForm();
    setIsEditing(true);
  };

  const startEdit = (routine: Routine) => {
    setName(routine.name);
    setDescription(routine.description || '');
    setRepeatDays(routine.repeatDays);
    setActivities(
      routine.activities.map(a => ({
        title: a.title,
        startTime: a.startTime,
        endTime: a.endTime,
        duration: a.duration,
        category: a.category,
        notes: a.notes,
      }))
    );
    setEditingRoutineId(routine.id);
    setIsEditing(true);
  };

  const toggleDay = (day: DayOfWeek) => {
    setRepeatDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const setPresetDays = (preset: 'all' | 'weekdays' | 'weekends') => {
    if (preset === 'all') setRepeatDays(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
    if (preset === 'weekdays') setRepeatDays(['mon', 'tue', 'wed', 'thu', 'fri']);
    if (preset === 'weekends') setRepeatDays(['sat', 'sun']);
  };

  const addActivity = () => {
    setActivities(prev => [
      ...prev,
      {
        title: '',
        startTime: '08:00',
        duration: 30,
        category: 'work',
        notes: '',
      },
    ]);
  };

  const removeActivity = (index: number) => {
    if (activities.length <= 1) {
      toast.error('A routine must have at least one activity.');
      return;
    }
    setActivities(prev => prev.filter((_, i) => i !== index));
  };

  const updateActivity = (index: number, field: string, value: any) => {
    setActivities(prev => prev.map((act, i) => {
      if (i === index) {
        return { ...act, [field]: value };
      }
      return act;
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a routine name.');
      return;
    }
    if (repeatDays.length === 0) {
      toast.error('Please select at least one repeating day.');
      return;
    }
    if (activities.some(a => !a.title.trim())) {
      toast.error('Please give all activities a title.');
      return;
    }

    const formattedActivities: RoutineActivity[] = activities.map((a, idx) => ({
      ...a,
      id: `act-${Date.now()}-${idx}`,
      order: idx + 1,
    }));

    if (editingRoutineId) {
      onUpdateRoutine(editingRoutineId, {
        name: name.trim(),
        description: description.trim(),
        repeatDays,
        activities: formattedActivities,
      });
    } else {
      onCreateRoutine({
        name: name.trim(),
        description: description.trim(),
        isActive: true,
        repeatDays,
        activities: formattedActivities,
      });
    }

    resetForm();
  };

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-4xl max-h-[92vh] overflow-y-auto animate-slide-up shadow-2xl border border-white/20 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200/50 dark:border-gray-700/50 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-md">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Daily Routine Builder
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Design custom repeatable routines that automatically populate your daily schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Mode */}
        {isEditing ? (
          /* Form for Create / Edit */
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Routine Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Productive Day, Evening Wind-Down"
                  className="w-full px-4 py-2.5 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Structured study and health routine"
                  className="w-full px-4 py-2.5 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Repeat Days Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Repeat Schedule *
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPresetDays('all')}
                    className="text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Everyday
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDays('weekdays')}
                    className="text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Weekdays
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDays('weekends')}
                    className="text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Weekends
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => {
                  const selected = repeatDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                        selected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Activities List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Scheduled Activities ({activities.length})
                </h3>
                <Button
                  type="button"
                  size="sm"
                  onClick={addActivity}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Activity
                </Button>
              </div>

              <div className="space-y-3">
                {activities.map((act, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Activity name (e.g. Exercise, Deep Coding, Reading)"
                        value={act.title}
                        onChange={(e) => updateActivity(index, 'title', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeActivity(index)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Remove activity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          required
                          value={act.startTime}
                          onChange={(e) => updateActivity(index, 'startTime', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          min="5"
                          step="5"
                          required
                          value={act.duration}
                          onChange={(e) => updateActivity(index, 'duration', Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                          Category
                        </label>
                        <select
                          value={act.category}
                          onChange={(e) => updateActivity(index, 'category', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.icon} {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                {editingRoutineId ? 'Save Changes' : 'Create Routine'}
              </Button>
            </div>
          </form>
        ) : (
          /* List of Existing Routines */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You have {routines.length} saved routine{routines.length !== 1 ? 's' : ''}.
              </p>
              <Button
                onClick={startCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" /> Create New Routine
              </Button>
            </div>

            {routines.length === 0 ? (
              <div className="text-center py-12 glass-card rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  📅
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No routines created yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
                  Build your first personalized daily routine to schedule recurring activities, track your habits, and receive AI-guided improvements.
                </p>
                <Button
                  onClick={startCreate}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white gap-2"
                >
                  <Plus className="w-4 h-4" /> Build My First Routine
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {routines.map((routine) => {
                  const isExpanded = expandedRoutineId === routine.id;
                  const totalMinutes = routine.activities.reduce((sum, a) => sum + a.duration, 0);

                  return (
                    <div
                      key={routine.id}
                      className={`glass-card rounded-2xl p-5 border transition-all ${
                        routine.isActive
                          ? 'border-blue-200/60 dark:border-blue-900/40 shadow-sm'
                          : 'border-gray-200/40 dark:border-gray-800/40 opacity-70'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => onToggleActive(routine.id)}
                            className={`p-2.5 rounded-xl transition-all ${
                              routine.isActive
                                ? 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 shadow-sm'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                            }`}
                            title={routine.isActive ? 'Active (Click to disable)' : 'Disabled (Click to enable)'}
                          >
                            <Power className="w-5 h-5" />
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {routine.name}
                              </h3>
                              <Badge
                                variant={routine.isActive ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {routine.isActive ? 'Active' : 'Disabled'}
                              </Badge>
                            </div>
                            {routine.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                {routine.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1 font-medium">
                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                {routine.activities.length} activities ({Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m)
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                Repeats: {routine.repeatDays.map(d => d.toUpperCase()).join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card controls */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedRoutineId(isExpanded ? null : routine.id)}
                            className="text-gray-600 dark:text-gray-400 gap-1 text-xs"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {isExpanded ? 'Hide' : 'Timeline'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(routine)}
                            className="gap-1 text-xs"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRoutineToDelete(routine)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Expandable Activity Timeline */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Activity Timeline
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {routine.activities.map((act) => {
                              const cat = CATEGORIES.find(c => c.id === act.category);
                              return (
                                <div
                                  key={act.id}
                                  className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {act.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {act.startTime} • {act.duration} mins
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {cat?.icon || '📋'} {cat?.label || act.category}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {routineToDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-2xl p-6 max-w-sm w-full space-y-4 animate-scale-in">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  Delete Routine?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Are you sure you want to delete "{routineToDelete.name}"? Historical task completions will be preserved.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setRoutineToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    onDeleteRoutine(routineToDelete.id);
                    setRoutineToDelete(null);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
