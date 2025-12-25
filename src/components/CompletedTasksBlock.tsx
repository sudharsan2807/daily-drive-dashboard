import { useState } from 'react';
import { Task } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { isTaskCompletedToday, getTaskTypeLabel, getTodayISO } from '@/lib/taskStorage';
import { cn } from '@/lib/utils';

interface CompletedTasksBlockProps {
  tasks: Task[];
  date: string;
  onToggle: (id: string) => void;
}

export const CompletedTasksBlock = ({ tasks, date, onToggle }: CompletedTasksBlockProps) => {
  const [expanded, setExpanded] = useState(false);

  const completedTasks = tasks.filter(t => isTaskCompletedToday(t, date));
  const today = getTodayISO();
  const isNotToday = date !== today;

  if (completedTasks.length === 0) {
    return null;
  }

  return (
    <Card className="animate-slide-up bg-task-daily-bg/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-task-daily" />
            Completed
            <Badge variant="secondary" className="ml-2 text-xs bg-task-daily/20 text-task-daily">
              {completedTasks.length}
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
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-background/30"
              >
                <Checkbox
                  checked={true}
                  onCheckedChange={() => !isNotToday && onToggle(task.id)}
                  disabled={isNotToday}
                  className={cn(isNotToday && 'opacity-50 cursor-not-allowed')}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm line-through opacity-60">{task.name}</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {getTaskTypeLabel(task.type)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};