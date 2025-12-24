import { useState } from 'react';
import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Trash2, AlertTriangle, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTaskTypeLabel, isTaskCompletedToday, isGoalComplete } from '@/lib/taskStorage';

interface TaskCardProps {
  task: Task;
  date: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskCard = ({ task, date, onToggle, onDelete }: TaskCardProps) => {
  const [showHowTo, setShowHowTo] = useState(false);
  const isCompleted = isTaskCompletedToday(task, date);
  const isCarried = !!task.carriedFrom;
  const goalProgress = task.type === 'goal' && task.goalTarget 
    ? ((task.goalCompleted || 0) / task.goalTarget) * 100 
    : 0;

  const getTaskClass = () => {
    if (isCarried) return 'task-carried';
    switch (task.type) {
      case 'daily': return 'task-daily';
      case 'weekly': return 'task-weekly';
      case 'particular': return 'task-particular';
      case 'goal': return 'task-goal';
      default: return '';
    }
  };

  const getBadgeClass = () => {
    switch (task.type) {
      case 'daily': return 'badge-daily';
      case 'weekly': return 'badge-weekly';
      case 'particular': return 'badge-particular';
      case 'goal': return 'badge-goal';
      default: return '';
    }
  };

  return (
    <div
      className={cn(
        'group relative rounded-lg p-4 transition-all duration-200 hover:shadow-md animate-fade-in',
        getTaskClass(),
        isCompleted && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => onToggle(task.id)}
          className={cn(
            'mt-1 h-5 w-5 rounded-full transition-all',
            isCompleted && 'animate-check'
          )}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className={cn(
              'font-semibold text-foreground transition-all',
              isCompleted && 'line-through text-muted-foreground'
            )}>
              {task.name}
            </h3>
            <Badge className={cn('text-xs', getBadgeClass())}>
              {getTaskTypeLabel(task.type)}
            </Badge>
            {isCarried && (
              <Badge variant="destructive" className="text-xs flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Carried
              </Badge>
            )}
          </div>
          
          {task.time && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <Clock className="h-3.5 w-3.5" />
              {task.time}
            </div>
          )}
          
          {task.type === 'goal' && task.goalTarget && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Target className="h-3.5 w-3.5" />
                  Progress
                </span>
                <span className="font-medium">
                  {task.goalCompleted || 0} / {task.goalTarget}
                </span>
              </div>
              <Progress value={goalProgress} className="h-2" />
            </div>
          )}
          
          {task.type === 'goal' && task.howToDo && (
            <div className="mt-2">
              <button
                onClick={() => setShowHowTo(!showHowTo)}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                How to do?
                {showHowTo ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {showHowTo && (
                <p className="mt-2 text-sm text-muted-foreground bg-background/50 rounded p-2">
                  {task.howToDo}
                </p>
              )}
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
