import { useState } from 'react';
import { Task } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Trash2, Edit2, Wind, Target, X } from 'lucide-react';
import { getDaysSinceCreation, isTaskCompletedToday, getTodayISO, isGoalComplete } from '@/lib/taskStorage';
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

interface FloatingTasksBlockProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const FloatingTasksBlock = ({ tasks, onToggle, onDelete, onEdit }: FloatingTasksBlockProps) => {
  const [floatingExpanded, setFloatingExpanded] = useState(false);
  const [goalsExpanded, setGoalsExpanded] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const today = getTodayISO();

  // Floating tasks (type === 'floating')
  const floatingTasks = tasks.filter(t => t.type === 'floating');
  const activeFloatingTasks = floatingTasks.filter(t => t.completedDates.length === 0);
  const completedFloatingTasks = floatingTasks.filter(t => t.completedDates.length > 0);

  // Floating goals (type === 'floating_goal')
  const floatingGoals = tasks.filter(t => t.type === 'floating_goal');
  const activeFloatingGoals = floatingGoals.filter(t => !isGoalComplete(t));
  const completedFloatingGoals = floatingGoals.filter(t => isGoalComplete(t));

  const hasFloatingTasks = floatingTasks.length > 0;
  const hasFloatingGoals = floatingGoals.length > 0;

  if (!hasFloatingTasks && !hasFloatingGoals) {
    return null;
  }

  const getDayAgoLabel = (days: number) => {
    if (days === 0) return 'today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const handleDoubleClick = (taskId: string) => {
    setActiveTaskId(prev => prev === taskId ? null : taskId);
  };

  const handleDeleteClick = (task: Task) => {
    setSelectedTask(task);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTask) {
      onDelete(selectedTask.id);
      setDeleteDialogOpen(false);
      setSelectedTask(null);
      setActiveTaskId(null);
    }
  };

  const renderTaskItem = (task: Task, isCompleted: boolean = false) => {
    const daysSince = getDaysSinceCreation(task.createdAt);
    const isActive = activeTaskId === task.id;
    const isCompletedToday = isTaskCompletedToday(task, today);
    const isFloatingGoal = task.type === 'floating_goal';
    const progress = isFloatingGoal && task.goalTarget ? 
      ((task.goalCompleted || 0) / task.goalTarget) * 100 : 0;
    
    return (
      <div
        key={task.id}
        onDoubleClick={() => handleDoubleClick(task.id)}
        className={`flex items-start gap-3 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors group cursor-pointer ${isCompleted ? 'opacity-60' : ''}`}
      >
        <Checkbox
          checked={isCompleted || isCompletedToday}
          onCheckedChange={() => onToggle(task.id)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium text-sm truncate ${isCompleted ? 'line-through' : ''}`}>
              {task.name}
            </span>
            {daysSince > 0 && !isCompleted && (
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {getDayAgoLabel(daysSince)}
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground truncate">{task.description}</p>
          )}
          {isFloatingGoal && !isCompleted && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{task.goalCompleted || 0}/{task.goalTarget}</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
        </div>
        
        {isActive && (
          <div className="flex gap-1 animate-fade-in">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
                setActiveTaskId(null);
              }}
              className="h-6 w-6 p-0"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(task);
              }}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-3">
        {/* Floating Tasks Section */}
        {hasFloatingTasks && (
          <Card className="animate-slide-up bg-amber-500/10">
            <Collapsible open={floatingExpanded} onOpenChange={setFloatingExpanded}>
              <CardHeader className="pb-2">
                <CollapsibleTrigger asChild>
                  <CardTitle className="text-lg flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2">
                      <Wind className="h-5 w-5 text-amber-500" />
                      Floating Tasks
                      <Badge variant="secondary" className="ml-2 text-xs bg-amber-500/20 text-amber-600">
                        {activeFloatingTasks.length}
                      </Badge>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      {floatingExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                </CollapsibleTrigger>
              </CardHeader>
              
              <CollapsibleContent>
                <CardContent>
                  <ScrollArea className="max-h-[200px]">
                    <div className="space-y-2">
                      {activeFloatingTasks.map((task) => renderTaskItem(task))}

                      {completedFloatingTasks.length > 0 && (
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-1">Completed</p>
                          {completedFloatingTasks.map((task) => renderTaskItem(task, true))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {/* Floating Goals Section */}
        {hasFloatingGoals && (
          <Card className="animate-slide-up bg-emerald-500/10">
            <Collapsible open={goalsExpanded} onOpenChange={setGoalsExpanded}>
              <CardHeader className="pb-2">
                <CollapsibleTrigger asChild>
                  <CardTitle className="text-lg flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-emerald-500" />
                      Floating Goals
                      <Badge variant="secondary" className="ml-2 text-xs bg-emerald-500/20 text-emerald-600">
                        {activeFloatingGoals.length}
                      </Badge>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      {goalsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                </CollapsibleTrigger>
              </CardHeader>
              
              <CollapsibleContent>
                <CardContent>
                  <ScrollArea className="max-h-[200px]">
                    <div className="space-y-2">
                      {activeFloatingGoals.map((task) => renderTaskItem(task))}

                      {completedFloatingGoals.length > 0 && (
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-1">Completed</p>
                          {completedFloatingGoals.map((task) => renderTaskItem(task, true))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTask?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
