import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCard } from '@/components/TaskCard';
import { AnalysisReport } from '@/components/AnalysisReport';
import { TimelineView } from '@/components/TimelineView';
import { GoalProgress } from '@/components/GoalProgress';
import { Plus, Calendar, ListChecks, Loader2 } from 'lucide-react';
import { 
  fetchTasks,
  filterTasksForDate,
  getTodayISO, 
  formatDate, 
  toggleTaskCompletion, 
  deleteTask,
} from '@/lib/taskStorage';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const today = getTodayISO();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const all = await fetchTasks();
    const todayTasks = filterTasksForDate(all, today);
    setTasks(todayTasks);
    setAllTasks(all);
    setLoading(false);
  };

  const handleToggle = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const updatedTask = await toggleTaskCompletion(task, today);
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    setAllTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    setAllTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Task deleted');
  };

  const regularTasks = tasks.filter(t => t.type !== 'goal');
  const goalTasks = tasks.filter(t => t.type === 'goal');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ListChecks className="h-6 w-6 text-primary" />
                Daily Routine
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(new Date())}
              </p>
            </div>
            <Button onClick={() => navigate('/add')} className="shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {/* Analysis Report */}
        <AnalysisReport tasks={tasks} date={today} />

        {/* Today's Tasks */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              📅 Today's Tasks
              <span className="text-sm font-normal text-muted-foreground">
                ({regularTasks.length} tasks)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {regularTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No tasks for today</p>
                <Button 
                  variant="link" 
                  onClick={() => navigate('/add')}
                  className="mt-2"
                >
                  Add your first task
                </Button>
              </div>
            ) : (
              regularTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  date={today}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Goal Tasks */}
        {goalTasks.length > 0 && (
          <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                🎯 Goal Tasks
                <span className="text-sm font-normal text-muted-foreground">
                  ({goalTasks.length} goals)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {goalTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  date={today}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Timeline View */}
        <TimelineView tasks={tasks} date={today} />

        {/* Goal Progress */}
        <GoalProgress tasks={allTasks} />
      </main>

      {/* Floating Add Button for Mobile */}
      <Button
        onClick={() => navigate('/add')}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg shadow-primary/30 md:hidden"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default Index;
