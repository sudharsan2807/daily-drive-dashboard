import { useState } from 'react';
import { Task } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Clock, X, Edit2, Trash2 } from 'lucide-react';
import { getPostponedTasks, getDaysPostponed } from '@/lib/taskStorage';
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

interface PostponedTasksBlockProps {
  tasks: Task[];
  date: string;
  onToggle: (id: string) => void;
  onSkip: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const PostponedTasksBlock = ({ 
  tasks, 
  date, 
  onToggle, 
  onSkip, 
  onDelete,
  onEdit 
}: PostponedTasksBlockProps) => {
  const [expanded, setExpanded] = useState(true);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const postponedTasks = getPostponedTasks(tasks, date);

  if (postponedTasks.length === 0) {
    return null;
  }

  const handleDoubleClick = (taskId: string) => {
    setActiveTaskId(prev => prev === taskId ? null : taskId);
  };

  const handleSkipClick = (task: Task) => {
    setSelectedTask(task);
    setSkipDialogOpen(true);
  };

  const handleDeleteClick = (task: Task) => {
    setSelectedTask(task);
    setDeleteDialogOpen(true);
  };

  const confirmSkip = () => {
    if (selectedTask) {
      onSkip(selectedTask.id);
      setSkipDialogOpen(false);
      setSelectedTask(null);
      setActiveTaskId(null);
    }
  };

  const confirmDelete = () => {
    if (selectedTask) {
      onDelete(selectedTask.id);
      setDeleteDialogOpen(false);
      setSelectedTask(null);
      setActiveTaskId(null);
    }
  };

  const getDaysAgoLabel = (days: number) => {
    if (days === 1) return 'postponed 1 day ago';
    return `postponed ${days} days ago`;
  };

  return (
    <>
      <Card className="animate-slide-up bg-orange-500/10 border-orange-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Postponed Tasks
              <Badge variant="secondary" className="ml-2 text-xs bg-orange-500/20 text-orange-600">
                {postponedTasks.length}
              </Badge>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8 p-0"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        
        {expanded && (
          <CardContent>
            <div className="space-y-2">
              {postponedTasks.map((task) => {
                const daysPostponed = getDaysPostponed(task.date!, date);
                const isActive = activeTaskId === task.id;
                
                return (
                  <div
                    key={task.id}
                    onDoubleClick={() => handleDoubleClick(task.id)}
                    className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer group"
                  >
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => onToggle(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{task.name}</span>
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-500/30">
                          {getDaysAgoLabel(daysPostponed)}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate mt-1">{task.description}</p>
                      )}
                    </div>
                    
                    {/* Skip button (X) - always visible */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSkipClick(task);
                      }}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-orange-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    {/* Edit/Delete buttons - shown on double-tap */}
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
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(task);
                          }}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Skip Dialog */}
      <AlertDialog open={skipDialogOpen} onOpenChange={setSkipDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Task for Today</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{selectedTask?.name}" from today only? The task will still appear on other days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSkip} className="bg-orange-500 hover:bg-orange-600">
              Remove for Today
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task Permanently</AlertDialogTitle>
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
