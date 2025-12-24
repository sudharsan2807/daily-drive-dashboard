import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskType } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { addTask, getWeekdayName, getTodayISO } from '@/lib/taskStorage';
import { toast } from 'sonner';

const weekdays = [0, 1, 2, 3, 4, 5, 6];

export const AddTaskForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState<TaskType>('daily');
  const [time, setTime] = useState('');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [date, setDate] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [howToDo, setHowToDo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a task name');
      return;
    }

    if (type === 'weekly' && selectedWeekdays.length === 0) {
      toast.error('Please select at least one weekday');
      return;
    }

    if (type === 'particular' && !date) {
      toast.error('Please select a date');
      return;
    }

    if (type === 'goal' && (!goalTarget || parseInt(goalTarget) <= 0)) {
      toast.error('Please enter a valid goal target');
      return;
    }

    setSubmitting(true);
    
    const result = await addTask({
      name: name.trim(),
      type,
      time: time || undefined,
      weekdays: type === 'weekly' ? selectedWeekdays : undefined,
      date: type === 'particular' ? date : undefined,
      goalTarget: type === 'goal' ? parseInt(goalTarget) : undefined,
      howToDo: type === 'goal' ? howToDo.trim() || undefined : undefined,
    });

    if (result) {
      toast.success('Task added successfully!');
      navigate('/');
    } else {
      toast.error('Failed to add task');
      setSubmitting(false);
    }
  };

  const toggleWeekday = (day: number) => {
    setSelectedWeekdays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-lg mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Task Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter task name"
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Task Type *</Label>
                <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-task-daily" />
                        Daily Routine
                      </span>
                    </SelectItem>
                    <SelectItem value="weekly">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-task-weekly" />
                        Weekly (Specific Days)
                      </span>
                    </SelectItem>
                    <SelectItem value="particular">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-task-particular" />
                        Particular Day
                      </span>
                    </SelectItem>
                    <SelectItem value="goal">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-task-goal" />
                        Goal Task
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time (Optional)</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              {type === 'weekly' && (
                <div className="space-y-2">
                  <Label>Select Days *</Label>
                  <div className="flex flex-wrap gap-2">
                    {weekdays.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWeekday(day)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedWeekdays.includes(day)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {getWeekdayName(day)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {type === 'particular' && (
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={getTodayISO()}
                  />
                </div>
              )}

              {type === 'goal' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="goalTarget">Goal Target (Sessions) *</Label>
                    <Input
                      id="goalTarget"
                      type="number"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      placeholder="e.g., 20"
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="howToDo">How to do? (Optional)</Label>
                    <Textarea
                      id="howToDo"
                      value={howToDo}
                      onChange={(e) => setHowToDo(e.target.value)}
                      placeholder="Describe the steps or approach..."
                      rows={3}
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {submitting ? 'Adding...' : 'Add Task'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
