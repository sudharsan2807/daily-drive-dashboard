import { useState } from 'react';
import { Task } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, Trash2, Edit2, Wind } from 'lucide-react';
import { getDaysSinceCreation, isTaskCompletedToday, getTodayISO } from '@/lib/taskStorage';

interface FloatingTasksBlockProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const FloatingTasksBlock = ({ tasks, onToggle, onDelete, onEdit }: FloatingTasksBlockProps) => {
  const [expanded, setExpanded] = useState(true);
  const today = getTodayISO();

  const floatingTasks = tasks.filter(t => t.type === 'floating');
  const activeTasks = floatingTasks.filter(t => !t.completedDates.includes(today));
  const completedTasks = floatingTasks.filter(t => t.completedDates.includes(today));

  if (floatingTasks.length === 0) {
    return null;
  }

  const getDayAgoLabel = (days: number) => {
    if (days === 0) return 'today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <Card className="animate-slide-up task-floating">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-[hsl(var(--task-floating))]" />
            Floating Tasks
            <Badge variant="secondary" className="ml-2 text-xs">
              {activeTasks.length}
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
          <ScrollArea className="max-h-[180px]">
            <div className="space-y-2">
              {activeTasks.map((task) => {
                const daysSince = getDaysSinceCreation(task.createdAt);
                
                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors group"
                  >
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => onToggle(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{task.name}</span>
                        {daysSince > 0 && (
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {getDayAgoLabel(daysSince)}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(task)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(task.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {completedTasks.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Completed today</p>
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-2 rounded-lg opacity-60"
                    >
                      <Checkbox
                        checked={true}
                        onCheckedChange={() => onToggle(task.id)}
                      />
                      <span className="text-sm line-through">{task.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
};