import { Task } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Target, TrendingUp } from 'lucide-react';
import { isTaskCompletedToday, isGoalComplete } from '@/lib/taskStorage';

interface AnalysisReportProps {
  tasks: Task[];
  date: string;
}

export const AnalysisReport = ({ tasks, date }: AnalysisReportProps) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => isTaskCompletedToday(t, date)).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const goalTasks = tasks.filter(t => t.type === 'goal');
  const goalProgress = goalTasks.length > 0
    ? goalTasks.reduce((acc, t) => {
        const progress = t.goalTarget ? ((t.goalCompleted || 0) / t.goalTarget) * 100 : 0;
        return acc + progress;
      }, 0) / goalTasks.length
    : 0;

  const stats = [
    {
      label: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-task-daily',
      bgColor: 'bg-task-daily-bg',
    },
    {
      label: 'Pending',
      value: pendingTasks,
      icon: TrendingUp,
      color: 'text-task-particular',
      bgColor: 'bg-task-particular-bg',
    },
    {
      label: 'Goal Progress',
      value: `${Math.round(goalProgress)}%`,
      icon: Target,
      color: 'text-task-goal',
      bgColor: 'bg-task-goal-bg',
    },
  ];

  return (
    <Card className="animate-slide-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          📊 Daily Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`p-3 rounded-lg ${stat.bgColor} animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Today's Progress</span>
            <span className="font-medium">{Math.round(completionRate)}%</span>
          </div>
          <Progress value={completionRate} className="h-3" />
        </div>
      </CardContent>
    </Card>
  );
};
