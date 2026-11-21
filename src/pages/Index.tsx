import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { ViewToggle } from '@/components/ViewToggle';
import { SearchFilter } from '@/components/SearchFilter';
import { DailyStats } from '@/components/DailyStats';
import { ActivitySummary } from '@/components/ActivitySummary';
import { FloatingAddButton } from '@/components/FloatingAddButton';
import { VoiceTaskEntry } from '@/components/VoiceTaskEntry';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { UserProfile } from '@/components/UserProfile';
import { TermsConditions } from '@/components/TermsConditions';
import { PrivacyPolicy } from '@/components/PrivacyPolicy';
import { TextToSpeechAssistant } from '@/components/TextToSpeechAssistant';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useRoutines } from '@/hooks/useRoutines';
import { Task, ViewMode, TaskStatus } from '@/types/task';
import { toast } from 'sonner';
import { RoutineHistory } from '@/components/RoutineHistory';
import { StreakRewards } from '@/components/StreakRewards';
import { NotificationSettings } from '@/components/NotificationSettings';
import { CookieConsent } from '@/components/CookieConsent';
import { FriendMode } from '@/components/FriendMode';
import { WellnessReminders } from '@/components/WellnessReminders';
import { FocusMusic } from '@/components/FocusMusic';
import { FloatingMusicControl } from '@/components/FloatingMusicControl';
import { AIGoalPlanner } from '@/components/AIGoalPlanner';
import { PhotoTimeline } from '@/components/PhotoTimeline';
import { PrintMyDay } from '@/components/PrintMyDay';
import { ProgressCertificate } from '@/components/ProgressCertificate';
import { MiniCourses } from '@/components/MiniCourses';
import { MicroHabits } from '@/components/MicroHabits';
import { DailySnapTracker } from '@/components/DailySnapTracker';
import { AIChatCoach } from '@/components/AIChatCoach';
import { ProductivityDashboard } from '@/components/ProductivityDashboard';
import { WeeklyProductivityChart } from '@/components/WeeklyProductivityChart';
import { RoutineManagerModal } from '@/components/RoutineBuilder/RoutineManagerModal';
import { AICoachSection } from '@/components/AICoach/AICoachSection';
import { useAuth } from '@/hooks/useAuth';
import { Download, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadRoutineBackup } from '@/lib/downloadRoutineBackup';

const Index = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useLocalStorage<Task[]>(`routine-tasks-${user?.id ?? 'guest'}`, []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showActivitySummary, setShowActivitySummary] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showRoutineHistory, setShowRoutineHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFriendMode, setShowFriendMode] = useState(false);
  const [showWellnessReminders, setShowWellnessReminders] = useState(false);
  const [showFocusMusic, setShowFocusMusic] = useState(false);
  const [showGoalPlanner, setShowGoalPlanner] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [currentMusicTrack, setCurrentMusicTrack] = useState<string | null>(null);
  const [showPhotoTimeline, setShowPhotoTimeline] = useState(false);
  const [showMicroHabits, setShowMicroHabits] = useState(false);
  const [showDailySnapTracker, setShowDailySnapTracker] = useState(false);
  const [showAIChatCoach, setShowAIChatCoach] = useState(false);
  const [showRoutineManager, setShowRoutineManager] = useState(false);
  const [showAICoachSection, setShowAICoachSection] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showPrintMyDay, setShowPrintMyDay] = useState(false);
  const [showProgressCertificate, setShowProgressCertificate] = useState(false);
  const [showMiniCourses, setShowMiniCourses] = useState(false);

  // Routines & AI Suggestion Management
  const {
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
  } = useRoutines(tasks, setTasks);

  // Sync scheduled routine activities for selectedDate
  useEffect(() => {
    syncRoutinesToTasks(selectedDate);
  }, [selectedDate, syncRoutinesToTasks]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || task.category === selectedCategory;
    
    let matchesDate = true;
    if (viewMode === 'daily') {
      matchesDate = task.date === selectedDate;
    } else if (viewMode === 'weekly') {
      const taskDate = new Date(task.date);
      const selectedDateObj = new Date(selectedDate);
      const startOfWeek = new Date(selectedDateObj);
      startOfWeek.setDate(selectedDateObj.getDate() - selectedDateObj.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      matchesDate = taskDate >= startOfWeek && taskDate <= endOfWeek;
    } else if (viewMode === 'monthly') {
      const taskDate = new Date(task.date);
      const selectedDateObj = new Date(selectedDate);
      matchesDate = taskDate.getMonth() === selectedDateObj.getMonth() &&
                   taskDate.getFullYear() === selectedDateObj.getFullYear();
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  const handleSaveTask = (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { ...taskData, id: editingTask.id }
          : task
      ));
      toast.success('Task updated successfully!');
      
      if ((window as any).routineXSpeak) {
        (window as any).routineXSpeak(`Task "${taskData.title}" has been updated successfully`);
      }
    } else {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
        status: 'pending',
        completed: false,
      };
      setTasks([...tasks, newTask]);
      toast.success('Task added successfully!');
      
      if ((window as any).routineXSpeak) {
        (window as any).routineXSpeak(`New task "${taskData.title}" has been added to your routine`);
      }
    }
    
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    const isCompleted = newStatus === 'completed';
    const now = new Date().toISOString();

    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === task.id) {
        return {
          ...t,
          status: newStatus,
          completed: isCompleted,
          completedAt: isCompleted ? now : undefined,
          missedAt: newStatus === 'missed' ? now : undefined,
        };
      }
      return t;
    }));

    if (newStatus === 'completed') {
      toast.success(`Completed "${task.title}"! 🎉`);
    } else if (newStatus === 'missed') {
      toast.info(`Marked "${task.title}" as missed.`);
    } else {
      toast.info(`Reset "${task.title}" to pending.`);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      setTasks(tasks.filter(task => task.id !== taskToDelete.id));
      setTaskToDelete(null);
      toast.success('Task deleted successfully!');
      
      if ((window as any).routineXSpeak) {
        (window as any).routineXSpeak(`Task "${taskToDelete.title}" has been deleted`);
      }
    }
  };

  const handleAddClick = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleVoiceTask = (transcript: string) => {
    setEditingTask(null);
    setIsFormOpen(true);
    setTimeout(() => {
      const titleInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (titleInput) {
        titleInput.value = transcript;
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 100);
    
    if ((window as any).routineXSpeak) {
      (window as any).routineXSpeak(`Voice input received: ${transcript}. Please complete the task details.`);
    }
  };

  const handleMusicToggle = () => {
    setMusicPlaying(!musicPlaying);
  };

  const handleBackup = () => {
    try {
      downloadRoutineBackup();
      toast.success('RoutineX backup downloaded');
    } catch {
      toast.error('Could not download your backup. Please try again.');
    }
  };

  const handleGoalTasksGenerated = (generatedTasks: Omit<Task, 'id'>[]) => {
    const newTasks = generatedTasks.map(task => ({
      ...task,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      status: 'pending' as TaskStatus,
      completed: false,
    }));
    setTasks([...tasks, ...newTasks]);
    toast.success(`${generatedTasks.length} tasks added to your routine!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Content (3 Columns) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Action Bar / Feature Nav */}
            <div className="flex justify-between items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={() => setShowRoutineManager(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
                >
                  <CalendarIcon className="w-4 h-4" /> Routine Builder
                </Button>
                <Button
                  onClick={() => {
                    generateAISuggestions();
                    setShowAICoachSection(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" /> AI Productivity Coach
                </Button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBackup} 
                  className="bg-background/60 text-foreground border-border text-xs gap-1.5"
                  title="Download your RoutineX data as a backup"
                >
                  <Download className="w-3.5 h-3.5" />
                  Backup
                </Button>
                <button
                  onClick={() => setShowAIChatCoach(!showAIChatCoach)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    showAIChatCoach
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                  }`}
                >
                  💬 Chat Coach
                </button>
                <button
                  onClick={() => setShowDailySnapTracker(!showDailySnapTracker)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    showDailySnapTracker
                      ? 'bg-pink-600 text-white'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                  }`}
                >
                  📸 Snaps
                </button>
                <button
                  onClick={() => setShowMicroHabits(!showMicroHabits)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    showMicroHabits
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                  }`}
                >
                  🧠 Habits
                </button>
                <button
                  onClick={() => setShowPrintMyDay(!showPrintMyDay)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    showPrintMyDay
                      ? 'bg-green-600 text-white'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                  }`}
                >
                  🖨️ Print Day
                </button>
                <button
                  onClick={() => setShowUserProfile(!showUserProfile)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    showUserProfile
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                  }`}
                >
                  {showUserProfile ? 'Hide Profile' : 'Profile'}
                </button>
              </div>
            </div>

            {/* User Profile Section */}
            {showUserProfile && (
              <UserProfile tasks={tasks} />
            )}

            {/* Feature Three: Productivity Dashboard */}
            <ProductivityDashboard
              tasks={tasks}
              routines={routines}
              selectedDate={selectedDate}
              onOpenRoutineManager={() => setShowRoutineManager(true)}
              onOpenAddTask={handleAddClick}
              onOpenAICoach={() => {
                generateAISuggestions();
                setShowAICoachSection(true);
              }}
            />

            {/* Feature Four: Weekly Productivity Chart */}
            <WeeklyProductivityChart tasks={tasks} selectedDate={selectedDate} />

            {/* View Mode & Calendar Date Selector */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <ViewToggle 
                viewMode={viewMode} 
                onViewModeChange={setViewMode}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowActivitySummary(!showActivitySummary)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    showActivitySummary
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                  }`}
                >
                  {showActivitySummary ? 'Show Task List' : 'Category Distribution'}
                </button>
              </div>
            </div>

            <SearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            {/* Task Tracking List */}
            {showActivitySummary ? (
              <ActivitySummary tasks={filteredTasks} viewMode={viewMode} />
            ) : (
              <TaskList
                tasks={filteredTasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onStatusChange={handleStatusChange}
                viewMode={viewMode}
              />
            )}
          </div>

          {/* Sidebar (1 Column) */}
          <div className="lg:col-span-1 space-y-6">
            <DailyStats 
              tasks={filteredTasks}
              viewMode={viewMode}
              selectedDate={selectedDate}
            />
            <StreakRewards tasks={tasks} />

            {/* Quick Link Buttons in Sidebar */}
            <div className="glass-card rounded-2xl p-4 space-y-2 text-xs">
              <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
                More Features
              </h4>
              <button
                onClick={() => setShowGoalPlanner(true)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/40 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300 flex items-center justify-between"
              >
                <span>🎯 AI Goal Planner</span>
              </button>
              <button
                onClick={() => setShowFocusMusic(true)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/40 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300 flex items-center justify-between"
              >
                <span>🎵 Focus Music</span>
              </button>
              <button
                onClick={() => setShowMiniCourses(true)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/40 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300 flex items-center justify-between"
              >
                <span>🎓 Mini Courses</span>
              </button>
              <button
                onClick={() => setShowProgressCertificate(true)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/40 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300 flex items-center justify-between"
              >
                <span>🏆 Certificates</span>
              </button>
              <button
                onClick={() => setShowFriendMode(true)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/40 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300 flex items-center justify-between"
              >
                <span>👥 Friend Mode</span>
              </button>
              <button
                onClick={() => setShowWellnessReminders(true)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/40 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300 flex items-center justify-between"
              >
                <span>🌱 Wellness Reminders</span>
              </button>
              <button
                onClick={() => setShowRoutineHistory(true)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/40 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300 flex items-center justify-between"
              >
                <span>📜 Routine History</span>
              </button>
              <button
                onClick={() => setShowNotifications(true)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/40 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300 flex items-center justify-between"
              >
                <span>🔔 Notifications</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Feature Seven: Functional Contact Section delivering to arshukhan1600@gmail.com */}
      <Contact />

      {/* Footer */}
      <Footer 
        onTermsClick={() => setShowTerms(true)}
        onPrivacyClick={() => setShowPrivacy(true)}
      />

      {/* Text-to-Speech Assistant */}
      <TextToSpeechAssistant />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40 md:bottom-8 md:right-8">
        <VoiceTaskEntry onVoiceTask={handleVoiceTask} />
        <FloatingAddButton onClick={handleAddClick} />
      </div>

      {/* Floating Music Control */}
      <FloatingMusicControl
        isPlaying={musicPlaying}
        currentTrack={currentMusicTrack}
        onTogglePlay={handleMusicToggle}
        onOpenMusic={() => setShowFocusMusic(true)}
      />

      {/* Modals & Drawers */}
      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTask(null);
          }}
        />
      )}

      {/* Feature One Modal: Routine Builder */}
      <RoutineManagerModal
        isOpen={showRoutineManager}
        onClose={() => setShowRoutineManager(false)}
        routines={routines}
        onCreateRoutine={createRoutine}
        onUpdateRoutine={updateRoutine}
        onDeleteRoutine={deleteRoutine}
        onToggleActive={toggleRoutineActive}
      />

      {/* Feature Five & Six Modal: AI Productivity Coach & Schedule Recommendations */}
      <AICoachSection
        isOpen={showAICoachSection}
        onClose={() => setShowAICoachSection(false)}
        tasks={tasks}
        routines={routines}
        suggestions={aiSuggestions}
        onGenerateSuggestions={generateAISuggestions}
        onApplySuggestion={applySuggestion}
        onDismissSuggestion={dismissSuggestion}
      />

      <DeleteConfirmModal
        isOpen={!!taskToDelete}
        taskTitle={taskToDelete?.title || ''}
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />

      <TermsConditions
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      />

      <PrivacyPolicy
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />

      <RoutineHistory
        tasks={tasks}
        isOpen={showRoutineHistory}
        onClose={() => setShowRoutineHistory(false)}
      />

      <NotificationSettings
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <FriendMode
        tasks={tasks}
        isOpen={showFriendMode}
        onClose={() => setShowFriendMode(false)}
      />

      <WellnessReminders
        isOpen={showWellnessReminders}
        onClose={() => setShowWellnessReminders(false)}
      />

      <FocusMusic
        isOpen={showFocusMusic}
        onClose={() => setShowFocusMusic(false)}
      />

      <AIGoalPlanner
        isOpen={showGoalPlanner}
        onClose={() => setShowGoalPlanner(false)}
        onTasksGenerated={handleGoalTasksGenerated}
      />

      <PhotoTimeline
        tasks={tasks}
        isOpen={showPhotoTimeline}
        onClose={() => setShowPhotoTimeline(false)}
      />

      <PrintMyDay
        tasks={tasks}
        selectedDate={selectedDate}
        isOpen={showPrintMyDay}
        onClose={() => setShowPrintMyDay(false)}
      />

      <ProgressCertificate
        tasks={tasks}
        isOpen={showProgressCertificate}
        onClose={() => setShowProgressCertificate(false)}
      />

      <MiniCourses
        isOpen={showMiniCourses}
        onClose={() => setShowMiniCourses(false)}
        onTasksGenerated={handleGoalTasksGenerated}
      />

      <MicroHabits
        tasks={tasks}
        isOpen={showMicroHabits}
        onClose={() => setShowMicroHabits(false)}
        onTasksGenerated={handleGoalTasksGenerated}
      />

      <DailySnapTracker
        isOpen={showDailySnapTracker}
        onClose={() => setShowDailySnapTracker(false)}
      />

      <AIChatCoach
        isOpen={showAIChatCoach}
        onClose={() => setShowAIChatCoach(false)}
        tasks={tasks}
      />

      <CookieConsent />
    </div>
  );
};

export default Index;
