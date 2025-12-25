import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { fetchTasks, getTaskTypeLabel } from '@/lib/taskStorage';
import { cn } from '@/lib/utils';

const History = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'entered' | 'completed'>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const allTasks = await fetchTasks();
    setTasks(allTasks);
    setLoading(false);
  };

  // Get all entered tasks (sorted by created date, recent first)
  const enteredTasks = [...tasks].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Get tasks with completion history (sorted by most recent completion)
  const completedTasks = tasks
    .filter(t => t.completedDates.length > 0)
    .sort((a, b) => {
      const aLatest = a.completedDates[a.completedDates.length - 1];
      const bLatest = b.completedDates[b.completedDates.length - 1];
      return bLatest.localeCompare(aLatest);
    });

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'daily': return 'badge-daily';
      case 'weekly': return 'badge-weekly';
      case 'particular': return 'badge-particular';
      case 'goal': return 'badge-goal';
      case 'floating': return 'bg-floating text-floating-foreground';
      default: return '';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredTasks = filter === 'completed' ? completedTasks : 
                        filter === 'entered' ? enteredTasks : 
                        enteredTasks;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Task History</h1>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'entered' | 'completed')}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="entered" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Entered
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found
              </div>
            ) : (
              filteredTasks.map(task => (
                <Card key={task.id} className="animate-fade-in">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-foreground">{task.name}</h3>
                          <Badge className={cn('text-xs', getBadgeClass(task.type))}>
                            {getTaskTypeLabel(task.type)}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created: {formatDate(task.createdAt)}
                          </div>
                          
                          {task.time && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Time: {task.time}
                            </div>
                          )}
                          
                          {task.completedDates.length > 0 && (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              Completed {task.completedDates.length} time(s)
                              {filter === 'completed' && (
                                <span className="ml-1">
                                  - Last: {formatDate(task.completedDates[task.completedDates.length - 1])}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default History;