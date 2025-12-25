import { Task } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar } from 'lucide-react';
import { isGoalComplete } from '@/lib/taskStorage';

interface GoalHistoryProps {
  tasks: Task[];
}

export const GoalHistory = ({ tasks }: GoalHistoryProps) => {
  const completedGoals = tasks.filter(t => t.type === 'goal' && isGoalComplete(t));
  const completedDailyGoals = tasks.filter(t => 
    t.type === 'daily' && t.goalTarget && (t.goalCompleted || 0) >= t.goalTarget
  );

  const allCompleted = [...completedGoals, ...completedDailyGoals];

  if (allCompleted.length === 0) {
    return null;
  }

  return (
    <Card className="animate-slide-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-task-daily" />
          Achievement History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allCompleted.map((task, index) => {
            const lastCompleted = task.completedDates[task.completedDates.length - 1];
            
            return (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg bg-task-daily-bg animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-task-daily" />
                  <div>
                    <span className="font-medium">{task.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {task.type === 'goal' ? 'Goal' : 'Daily Challenge'}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {task.goalCompleted}/{task.goalTarget} sessions
                      </span>
                    </div>
                  </div>
                </div>
                {lastCompleted && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(lastCompleted).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};