import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SortableTaskList } from '@/components/SortableTaskList';
import { AnalysisReport } from '@/components/AnalysisReport';
import { TimelineView } from '@/components/TimelineView';
import { GoalProgress } from '@/components/GoalProgress';
import { GoalHistory } from '@/components/GoalHistory';
import { EditTaskDialog } from '@/components/EditTaskDialog';
import { DateSwitcher } from '@/components/DateSwitcher';
import { FloatingTasksBlock } from '@/components/FloatingTasksBlock';
import { CompletedTasksBlock } from '@/components/CompletedTasksBlock';
import { Plus, ListChecks, Loader2 } from 'lucide-react';
import { 
  fetchTasks,
  filterTasksForDate,
  getTodayISO, 
  toggleTaskCompletion, 
  deleteTask,
  isTaskCompletedToday,
} from '@/lib/taskStorage';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(getTodayISO());
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (allTasks.length > 0) {
      const filtered = filterTasksForDate(allTasks, currentDate);
      // Sort by time if available
      const sorted = [...filtered].sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time) return -1;
        if (b.time) return 1;
        return a.sortOrder - b.sortOrder;
      });
      setTasks(sorted);
    }
  }, [currentDate, allTasks]);

  const loadTasks = async () => {
    setLoading(true);
    const all = await fetchTasks();
    setAllTasks(all);
    const filtered = filterTasksForDate(all, currentDate);
    const sorted = [...filtered].sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return a.sortOrder - b.sortOrder;
    });
    setTasks(sorted);
    setLoading(false);
  };

  const handleToggle = async (id: string) => {
    const task = allTasks.find(t => t.id === id);
    if (!task) return;
    
    const updatedTask = await toggleTaskCompletion(task, currentDate);
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    setAllTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    setAllTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Task deleted');
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setAllTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleReorder = useCallback((reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
    setAllTasks(prev => {
      const taskIds = new Set(reorderedTasks.map(t => t.id));
      const otherTasks = prev.filter(t => !taskIds.has(t.id));
      return [...reorderedTasks, ...otherTasks];
    });
  }, []);

  // Filter pending tasks (not completed)
  const pendingTasks = tasks.filter(t => !isTaskCompletedToday(t, currentDate));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-primary" />
              Daily Routine
            </h1>
            <Button onClick={() => navigate('/add')} className="shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          <DateSwitcher
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </header>

      <main className="container py-6 space-y-6">
        <AnalysisReport tasks={tasks} date={currentDate} />

        <FloatingTasksBlock
          tasks={allTasks}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />

        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              📅 Tasks
              <span className="text-sm font-normal text-muted-foreground">
                ({pendingTasks.length} pending)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No pending tasks</p>
                <Button 
                  variant="link" 
                  onClick={() => navigate('/add')}
                  className="mt-2"
                >
                  Add a task
                </Button>
              </div>
            ) : (
              <SortableTaskList
                tasks={pendingTasks}
                date={currentDate}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onReorder={handleReorder}
              />
            )}
          </CardContent>
        </Card>

        <CompletedTasksBlock
          tasks={tasks}
          date={currentDate}
          onToggle={handleToggle}
        />

        <TimelineView tasks={tasks} date={currentDate} />
        <GoalProgress tasks={allTasks} />
        <GoalHistory tasks={allTasks} />
      </main>

      <Button
        onClick={() => navigate('/add')}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg shadow-primary/30 md:hidden"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <EditTaskDialog
        task={editingTask}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
};

export default Index;