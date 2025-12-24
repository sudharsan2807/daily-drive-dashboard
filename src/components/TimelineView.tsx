import { Task } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isTaskCompletedToday } from '@/lib/taskStorage';

interface TimelineViewProps {
  tasks: Task[];
  date: string;
}

export const TimelineView = ({ tasks, date }: TimelineViewProps) => {
  const tasksWithTime = tasks
    .filter(t => t.time)
    .sort((a, b) => {
      if (!a.time || !b.time) return 0;
      return a.time.localeCompare(b.time);
    });

  if (tasksWithTime.length === 0) {
    return null;
  }

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'daily': return 'badge-daily';
      case 'weekly': return 'badge-weekly';
      case 'particular': return 'badge-particular';
      case 'goal': return 'badge-goal';
      default: return '';
    }
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          🕒 Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />
          <div className="space-y-4">
            {tasksWithTime.map((task, index) => {
              const isCompleted = isTaskCompletedToday(task, date);
              return (
                <div
                  key={task.id}
                  className="relative pl-8 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={cn(
                      'absolute left-1.5 top-1.5 h-4 w-4 rounded-full border-2 bg-card',
                      isCompleted ? 'border-task-daily bg-task-daily' : 'border-muted-foreground'
                    )}
                  />
                  <div className={cn(
                    'p-3 rounded-lg bg-secondary transition-opacity',
                    isCompleted && 'opacity-60'
                  )}>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      {task.time}
                    </div>
                    <p className={cn(
                      'font-medium',
                      isCompleted && 'line-through text-muted-foreground'
                    )}>
                      {task.name}
                    </p>
                    <Badge className={cn('text-xs mt-1', getBadgeClass(task.type))}>
                      {task.type}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
