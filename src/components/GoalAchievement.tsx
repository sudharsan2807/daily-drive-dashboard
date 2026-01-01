import { useState } from 'react';
import { Task } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Trophy, Target, Wind, CheckCircle2 } from 'lucide-react';
import { isGoalComplete } from '@/lib/taskStorage';

interface GoalAchievementProps {
  tasks: Task[];
}

export const GoalAchievement = ({ tasks }: GoalAchievementProps) => {
  const [expanded, setExpanded] = useState(false);

  // Get completed goals
  const completedGoals = tasks.filter(t => t.type === 'goal' && isGoalComplete(t));
  
  // Get completed floating goals
  const completedFloatingGoals = tasks.filter(t => t.type === 'floating_goal' && isGoalComplete(t));
  
  // Get completed floating tasks (have at least one completion date)
  const completedFloatingTasks = tasks.filter(t => t.type === 'floating' && t.completedDates.length > 0);

  const totalAchievements = completedGoals.length + completedFloatingGoals.length + completedFloatingTasks.length;

  if (totalAchievements === 0) {
    return null;
  }

  return (
    <Card className="animate-slide-up bg-gradient-to-r from-yellow-500/10 to-amber-500/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Goal Achievements
            <Badge variant="secondary" className="ml-2 text-xs bg-yellow-500/20 text-yellow-600">
              {totalAchievements}
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
        <CardContent className="space-y-4">
          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Target className="h-4 w-4 text-emerald-500" />
                Goals ({completedGoals.length})
              </div>
              <div className="space-y-1 ml-6">
                {completedGoals.map(task => (
                  <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">{task.name}</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {task.goalCompleted}/{task.goalTarget}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Floating Goals */}
          {completedFloatingGoals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Target className="h-4 w-4 text-amber-500" />
                Floating Goals ({completedFloatingGoals.length})
              </div>
              <div className="space-y-1 ml-6">
                {completedFloatingGoals.map(task => (
                  <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">{task.name}</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {task.goalCompleted}/{task.goalTarget}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Floating Tasks */}
          {completedFloatingTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Wind className="h-4 w-4 text-amber-500" />
                Floating Tasks ({completedFloatingTasks.length})
              </div>
              <div className="space-y-1 ml-6">
                {completedFloatingTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">{task.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      Completed {task.completedDates[task.completedDates.length - 1]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
