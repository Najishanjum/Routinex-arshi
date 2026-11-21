import { useMemo } from 'react';
import { Task } from '@/types/task';
import { calculateWeeklyProductivity } from '@/lib/productivity';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Award, CheckCircle2, 
  XCircle, Calendar, BarChart3 
} from 'lucide-react';

interface WeeklyProductivityChartProps {
  tasks: Task[];
  selectedDate?: string;
}

export function WeeklyProductivityChart({ tasks, selectedDate }: WeeklyProductivityChartProps) {
  const summary = useMemo(() => {
    return calculateWeeklyProductivity(tasks, selectedDate);
  }, [tasks, selectedDate]);

  const chartData = useMemo(() => {
    return summary.dailyData.map((d) => {
      const [year, month, day] = d.date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dayLabel = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
      const dateFormatted = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

      return {
        date: d.date,
        dayLabel: `${dayLabel} (${dateFormatted})`,
        percentage: d.hasTasks ? d.percentage : 0,
        hasTasks: d.hasTasks,
        completed: d.completedTasks,
        eligible: d.eligibleTasks,
        missed: d.missedTasks,
        pending: d.pendingTasks,
      };
    });
  }, [summary]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-3 rounded-xl shadow-lg border border-white/20 dark:border-gray-700 text-xs space-y-1">
          <p className="font-bold text-gray-900 dark:text-white">{data.dayLabel}</p>
          {data.hasTasks ? (
            <>
              <p className="text-blue-600 dark:text-blue-400 font-semibold">
                Productivity: {data.percentage}%
              </p>
              <div className="space-y-0.5 text-gray-600 dark:text-gray-300">
                <p>✅ Completed: {data.completed} of {data.eligible}</p>
                <p>❌ Missed: {data.missed}</p>
                <p>⏳ Pending: {data.pending}</p>
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic">No scheduled tasks</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            7-Day Productivity Trends
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real task completion percentages calculated dynamically from your schedule
          </p>
        </div>

        {/* Quick Trend Badge */}
        {summary.trendPercentage !== 0 && (
          <div className={`self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            summary.trendPercentage > 0
              ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300'
              : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
          }`}>
            {summary.trendPercentage > 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {summary.trendPercentage > 0 ? `+${summary.trendPercentage}%` : `${summary.trendPercentage}%`} vs last week
            </span>
          </div>
        )}
      </div>

      {/* Grid: Graph + Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        
        {/* Chart Column (2 cols) */}
        <div className="lg:col-span-2 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis 
                dataKey="dayLabel" 
                tick={{ fontSize: 11, fill: 'currentColor' }} 
                className="text-gray-500"
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-gray-500"
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={
                      !entry.hasTasks 
                        ? '#cbd5e1' 
                        : entry.percentage >= 80 
                          ? '#10b981' 
                          : entry.percentage >= 50 
                            ? '#3b82f6' 
                            : '#f59e0b'
                    }
                    opacity={entry.hasTasks ? 0.9 : 0.3}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 mt-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> High (≥80%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Moderate (50–79%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Incomplete (&lt;50%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-700 inline-block" /> No Tasks
            </span>
          </div>
        </div>

        {/* Analytics Summary Cards (1 col) */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Weekly Average</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {summary.weeklyAverage}%
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400">active days</span>
            </div>
          </div>

          <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">Best Day</p>
              <Award className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-base font-bold text-purple-900 dark:text-purple-100 mt-1">
              {summary.bestDay ? `${summary.bestDay.dayName} (${summary.bestDay.percentage}%)` : 'N/A'}
            </p>
          </div>

          <div className="p-3.5 bg-green-50/70 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs text-green-700 dark:text-green-300 font-medium">Completed</p>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
              {summary.totalCompleted}
              <span className="text-xs font-normal text-green-600 dark:text-green-400 ml-1">
                / {summary.totalEligible} tasks
              </span>
            </p>
          </div>

          <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">Missed</p>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-rose-900 dark:text-rose-100 mt-1">
              {summary.totalMissed}
              <span className="text-xs font-normal text-rose-600 dark:text-rose-400 ml-1">tasks</span>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
