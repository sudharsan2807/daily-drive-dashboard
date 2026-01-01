import { useState } from 'react';
import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trash2, Pencil, AlertTriangle, ChevronDown, ChevronUp, GripVertical, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTaskTypeLabel, isTaskCompletedToday } from '@/lib/taskStorage';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

interface TaskCardProps {
  task: Task;
  date: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onSkip?: (id: string) => void;
  isDragging?: boolean;
  disableCheckbox?: boolean;
}

export const TaskCard = ({ task, date, onToggle, onDelete, onEdit, onSkip, isDragging, disableCheckbox = false }: TaskCardProps) => {
  const [showDescription, setShowDescription] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
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
      case 'notify': return 'bg-purple-500/10 border-purple-500/30';
      case 'floating_goal': return 'task-goal';
      default: return '';
    }
  };

  const getBadgeClass = () => {
    switch (task.type) {
      case 'daily': return task.intervalDays && task.intervalDays > 1 ? 'bg-secondary text-secondary-foreground' : 'badge-daily';
      case 'weekly': return 'badge-weekly';
      case 'particular': return 'badge-particular';
      case 'goal': return 'badge-goal';
      case 'notify': return 'bg-purple-500 text-white';
      case 'floating_goal': return 'badge-goal';
      default: return '';
    }
  };

  const hasDescription = task.description || (task.type === 'goal' && task.howToDo);
  const descriptionContent = task.type === 'goal' ? task.howToDo : task.description;

  const handleDoubleClick = () => {
    setShowActions(prev => !prev);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleSkipClick = () => {
    setShowSkipDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(task.id);
    setShowDeleteDialog(false);
    setShowActions(false);
  };

  const handleConfirmSkip = () => {
    if (onSkip) {
      onSkip(task.id);
    }
    setShowSkipDialog(false);
    setShowActions(false);
  };

  // Determine if skip button should show (for daily/weekly/goal tasks - not particular)
  const canSkip = onSkip && task.type !== 'particular' && task.type !== 'floating' && task.type !== 'floating_goal';

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onDoubleClick={handleDoubleClick}
        className={cn(
          'group relative rounded-lg p-4 transition-all duration-200 hover:shadow-md animate-fade-in cursor-pointer',
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
                {getTaskTypeLabel(task.type, task.intervalDays)}
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
          
          {/* Skip button (X) - always visible for eligible tasks */}
          {canSkip && !isCompleted && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-orange-500 h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleSkipClick();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {showActions && (
            <div className="flex items-center gap-1 animate-fade-in">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                  setShowActions(false);
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
                  handleDeleteClick();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.name}"? This action cannot be undone.
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

      {/* Skip Dialog */}
      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Task for Today</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{task.name}" from today only? The task will still appear on other scheduled days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSkip} className="bg-orange-500 hover:bg-orange-600">
              Remove for Today
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
