import { Task } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Trophy, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isGoalComplete } from '@/lib/taskStorage';

interface GoalProgressProps {
  tasks: Task[];
}

export const GoalProgress = ({ tasks }: GoalProgressProps) => {
  const goalTasks = tasks.filter(t => t.type === 'goal');
  
  if (goalTasks.length === 0) {
    return null;
  }

  const completedGoals = goalTasks.filter(t => isGoalComplete(t));
  const activeGoals = goalTasks.filter(t => !isGoalComplete(t));

  return (
    <Card className="animate-slide-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          🎯 Goal Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeGoals.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-task-particular" />
              Active Goals
            </h4>
            {activeGoals.map((goal, index) => {
              const progress = goal.goalTarget 
                ? ((goal.goalCompleted || 0) / goal.goalTarget) * 100 
                : 0;
              
              return (
                <div
                  key={goal.id}
                  className="p-3 rounded-lg bg-task-goal-bg animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {goal.goalCompleted || 0} / {goal.goalTarget}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </div>
        )}
        
        {completedGoals.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-task-daily" />
              Completed Goals
            </h4>
            {completedGoals.map((goal, index) => (
              <div
                key={goal.id}
                className="p-3 rounded-lg bg-task-daily-bg flex items-center gap-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Trophy className="h-5 w-5 text-task-daily" />
                <span className="font-medium line-through opacity-75">{goal.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
