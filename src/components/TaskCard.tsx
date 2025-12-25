import { useState } from 'react';
import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trash2, Pencil, AlertTriangle, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTaskTypeLabel, isTaskCompletedToday } from '@/lib/taskStorage';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  date: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  isDragging?: boolean;
  disableCheckbox?: boolean;
}

export const TaskCard = ({ task, date, onToggle, onDelete, onEdit, isDragging, disableCheckbox = false }: TaskCardProps) => {
  const [showDescription, setShowDescription] = useState(false);
  const isCompleted = isTaskCompletedToday(task, date);
  const isCheckboxDisabled = disableCheckbox && !isCompleted;
  const isCarried = !!task.carriedFrom;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id, disabled: isCompleted });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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

  const hasDescription = task.description || (task.type === 'goal' && task.howToDo);
  const descriptionContent = task.type === 'goal' ? task.howToDo : task.description;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg p-4 transition-all duration-200 hover:shadow-md animate-fade-in',
        getTaskClass(),
        isCompleted && 'opacity-60',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <div className="flex items-start gap-3">
        {!isCompleted && (
          <button
            className="mt-1 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>
        )}
        
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => !isCheckboxDisabled && onToggle(task.id)}
          disabled={isCheckboxDisabled}
          className={cn(
            'mt-1 h-5 w-5 rounded-full transition-all',
            isCompleted && 'animate-check',
            isCheckboxDisabled && 'opacity-50 cursor-not-allowed'
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
          
          {hasDescription && (
            <div className="mt-2">
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {task.type === 'goal' ? 'How to do?' : 'Description'}
                {showDescription ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {showDescription && (
                <p className="mt-2 text-sm text-muted-foreground bg-background/50 rounded p-2">
                  {descriptionContent}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
