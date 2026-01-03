import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, CheckCircle2, Clock, ListTodo, Search, Pencil, Trash2, Undo2 } from 'lucide-react';
import { fetchTasks, getTaskTypeLabel, deleteTask, updateTask } from '@/lib/taskStorage';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditTaskDialog } from '@/components/EditTaskDialog';

const History = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'entered' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [undoDialogOpen, setUndoDialogOpen] = useState(false);
  const [taskToUndo, setTaskToUndo] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const allTasks = await fetchTasks();
    setTasks(allTasks);
    setLoading(false);
  };

  // Get all entered tasks (sorted by created date, recent first)
  const enteredTasks = [...tasks].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Get tasks with completion history (sorted by most recent completion)
  const completedTasks = tasks
    .filter(t => t.completedDates.length > 0)
    .sort((a, b) => {
      const aLatest = a.completedDates[a.completedDates.length - 1];
      const bLatest = b.completedDates[b.completedDates.length - 1];
      return bLatest.localeCompare(aLatest);
    });

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'daily': return 'badge-daily';
      case 'weekly': return 'badge-weekly';
      case 'particular': return 'badge-particular';
      case 'goal': return 'badge-goal';
      case 'floating': return 'bg-floating text-floating-foreground';
      case 'floating_goal': return 'badge-goal';
      case 'notify': return 'bg-purple-500 text-white';
      default: return '';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const baseFilteredTasks = filter === 'completed' ? completedTasks : 
                            filter === 'entered' ? enteredTasks : 
                            enteredTasks;

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return baseFilteredTasks;
    const query = searchQuery.toLowerCase();
    return baseFilteredTasks.filter(task => 
      task.name.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.type.toLowerCase().includes(query)
    );
  }, [baseFilteredTasks, searchQuery]);

  const handleDoubleClick = (taskId: string) => {
    setActiveTaskId(activeTaskId === taskId ? null : taskId);
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id);
      setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
      toast.success('Task deleted');
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      setActiveTaskId(null);
    }
  };

  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setEditDialogOpen(true);
    setActiveTaskId(null);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleUndoClick = (task: Task) => {
    setTaskToUndo(task);
    setUndoDialogOpen(true);
  };

  const handleConfirmUndo = async () => {
    if (taskToUndo && taskToUndo.completedDates.length > 0) {
      // Remove the last completion date to "undo" the completion
      const newCompletedDates = [...taskToUndo.completedDates];
      newCompletedDates.pop();
      
      // Also decrement goalCompleted if it's a goal type
      let newGoalCompleted = taskToUndo.goalCompleted;
      if ((taskToUndo.type === 'goal' || taskToUndo.type === 'floating_goal') && newGoalCompleted && newGoalCompleted > 0) {
        newGoalCompleted--;
      }
      
      await updateTask(taskToUndo.id, { 
        completedDates: newCompletedDates,
        goalCompleted: newGoalCompleted,
      });
      
      setTasks(prev => prev.map(t => 
        t.id === taskToUndo.id 
          ? { ...t, completedDates: newCompletedDates, goalCompleted: newGoalCompleted }
          : t
      ));
      
      toast.success('Last completion undone');
      setUndoDialogOpen(false);
      setTaskToUndo(null);
      setActiveTaskId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Task History</h1>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'entered' | 'completed')}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="entered" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Entered
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found
              </div>
            ) : (
              filteredTasks.map(task => (
                <Card 
                  key={task.id} 
                  className="animate-fade-in cursor-pointer"
                  onDoubleClick={() => handleDoubleClick(task.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-foreground">{task.name}</h3>
                          <Badge className={cn('text-xs', getBadgeClass(task.type))}>
                            {getTaskTypeLabel(task.type)}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created: {formatDate(task.createdAt)}
                          </div>
                          
                          {task.time && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Time: {task.time}
                            </div>
                          )}
                          
                          {task.completedDates.length > 0 && (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              Completed {task.completedDates.length} time(s)
                              {filter === 'completed' && (
                                <span className="ml-1">
                                  - Last: {formatDate(task.completedDates[task.completedDates.length - 1])}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      
                      {activeTaskId === task.id && (
                        <div className="flex items-center gap-1 animate-fade-in">
                          {task.completedDates.length > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-orange-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUndoClick(task);
                              }}
                              title="Undo last completion"
                            >
                              <Undo2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(task);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(task);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={undoDialogOpen} onOpenChange={setUndoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Undo Last Completion</AlertDialogTitle>
            <AlertDialogDescription>
              Remove the last completion for "{taskToUndo?.name}"? 
              {taskToUndo?.completedDates.length && (
                <span className="block mt-1 text-sm">
                  Last completed: {formatDate(taskToUndo.completedDates[taskToUndo.completedDates.length - 1])}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUndo} className="bg-orange-500 hover:bg-orange-600">
              Undo Completion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditTaskDialog
        task={taskToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
};

export default History;