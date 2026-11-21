import { useState, useMemo } from 'react';
import { Task } from '@/types/task';
import { Routine, AISuggestion } from '@/types/routine';
import { calculateWeeklyProductivity, getLocalDateString } from '@/lib/productivity';
import { 
  Sparkles, CheckCircle2, X, RefreshCw, Clock, ArrowRight, 
  AlertTriangle, Lightbulb, TrendingUp, ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AICoachSectionProps {
  tasks: Task[];
  routines: Routine[];
  suggestions: AISuggestion[];
  onGenerateSuggestions: () => void;
  onApplySuggestion: (id: string) => void;
  onDismissSuggestion: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AICoachSection({
  tasks,
  routines,
  suggestions,
  onGenerateSuggestions,
  onApplySuggestion,
  onDismissSuggestion,
  isOpen,
  onClose,
}: AICoachSectionProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Filter to pending suggestions
  const activeSuggestions = useMemo(() => {
    return suggestions.filter(s => s.status === 'pending');
  }, [suggestions]);

  // Analyze missed tasks across history
  const missedTaskStats = useMemo(() => {
    const counts: Record<string, { count: number; category: string; times: string[] }> = {};
    const todayStr = getLocalDateString();

    tasks.forEach(t => {
      const isMissed = t.status === 'missed' || (!t.completed && t.status !== 'completed' && t.date < todayStr);
      if (isMissed) {
        const title = t.title.trim();
        if (!counts[title]) {
          counts[title] = { count: 0, category: t.category, times: [] };
        }
        counts[title].count++;
        if (t.startTime) counts[title].times.push(t.startTime);
      }
    });

    return Object.entries(counts)
      .map(([title, val]) => ({ title, ...val }))
      .sort((a, b) => b.count - a.count);
  }, [tasks]);

  const weeklySummary = useMemo(() => {
    return calculateWeeklyProductivity(tasks);
  }, [tasks]);

  const handleRefresh = async () => {
    setIsAnalyzing(true);
    // Simulate smart pattern scanning
    await new Promise(r => setTimeout(r, 600));
    onGenerateSuggestions();
    setIsAnalyzing(false);
    toast.success('AI pattern analysis refreshed!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-6 sm:p-8 w-full max-w-4xl max-h-[92vh] overflow-y-auto animate-slide-up shadow-2xl border border-white/20 dark:border-gray-800 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                RoutineX AI Productivity Coach
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Data-driven schedule recommendations to eliminate bottlenecks and build consistent habits
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

        {/* Coach Overview Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-200/50 dark:border-purple-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-600 text-white text-xs">
                Weekly Performance: {weeklySummary.weeklyAverage}%
              </Badge>
              {weeklySummary.bestDay && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Peak Day: {weeklySummary.bestDay.dayName}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {tasks.length < 3
                ? "Record at least 3–5 daily tasks to allow the AI to pinpoint missed routines and time conflicts."
                : `Analyzed ${tasks.length} task events. ${missedTaskStats.length > 0 ? `Identified ${missedTaskStats.length} activities with repeated drop-offs.` : 'Consistency is solid across all scheduled routines!'}`
              }
            </p>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={isAnalyzing}
            className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-sm whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing Patterns...' : 'Refresh Insights'}
          </Button>
        </div>

        {/* Frequently Missed Tasks Breakdown */}
        {missedTaskStats.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Frequently Missed Activities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {missedTaskStats.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Missed {item.count}x
                    </span>
                    {item.times.length > 0 && (
                      <span className="text-xs text-gray-500">
                        @ {item.times[0]}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Consider shifting to earlier in the day or shortening duration.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personalized Recommendations & Schedule Updates */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Actionable AI Schedule Suggestions ({activeSuggestions.length})
            </h3>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              Explicit approval required
            </span>
          </div>

          {activeSuggestions.length === 0 ? (
            <div className="p-8 text-center glass-card rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                No Schedule Adjustments Needed Right Now!
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1">
                Your routines and completions are well-balanced. When the AI detects repeated missed tasks or schedule conflicts, suggestions will appear here with one-click routine updates.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSuggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="glass-card rounded-2xl p-5 border border-purple-200/70 dark:border-purple-900/40 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs">
                        {sug.patternType === 'frequently_missed' ? 'Bottleneck Detected' : 'Optimization'}
                      </Badge>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">
                        {sug.title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {sug.reason}
                  </p>

                  {/* Before vs Proposed Comparison Box */}
                  <div className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Current */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                        Current Schedule
                      </p>
                      <div className="space-y-0.5 text-xs text-gray-800 dark:text-gray-200">
                        <p className="font-semibold">{sug.currentValue.activityName}</p>
                        {sug.currentValue.startTime && (
                          <p>⏰ Start Time: {sug.currentValue.startTime}</p>
                        )}
                        {sug.currentValue.duration && (
                          <p>⏱️ Duration: {sug.currentValue.duration} mins</p>
                        )}
                      </div>
                    </div>

                    {/* Proposed */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Proposed Change
                      </p>
                      <div className="space-y-0.5 text-xs text-purple-950 dark:text-purple-200 font-medium">
                        <p className="font-bold">{sug.proposedValue.activityName}</p>
                        {sug.proposedValue.startTime && (
                          <p>⏰ New Time: <span className="font-bold underline">{sug.proposedValue.startTime}</span></p>
                        )}
                        {sug.proposedValue.duration && (
                          <p>⏱️ New Duration: <span className="font-bold underline">{sug.proposedValue.duration} mins</span></p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismissSuggestion(sug.id)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-xs"
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onApplySuggestion(sug.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 text-xs shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Apply Suggestion to Routine
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
