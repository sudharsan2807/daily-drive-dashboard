import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TaskType } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { addTask, getWeekdayName, getTodayISO, calculateDateGap } from '@/lib/taskStorage';
import { toast } from 'sonner';

const weekdays = [0, 1, 2, 3, 4, 5, 6];

export const AddTaskForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('daily');
  const [time, setTime] = useState('');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [exceptDays, setExceptDays] = useState<number[]>([]);
  const [date, setDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [howToDo, setHowToDo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check for type param in URL
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && ['daily', 'weekly', 'particular', 'goal', 'floating', 'notify'].includes(typeParam)) {
      setType(typeParam as TaskType);
    }
  }, [searchParams]);

  const getTomorrowISO = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

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

    // Calculate goal target from date range if both dates are provided
    let calculatedGoalTarget = type === 'goal' ? parseInt(goalTarget) : undefined;
    let taskType = type;
    
    // Use today's date as default if fromDate not entered for daily tasks
    const effectiveFromDate = type === 'daily' ? (fromDate || getTodayISO()) : undefined;
    
    // If daily task with date range, add to goal progress
    if (type === 'daily' && effectiveFromDate && toDate) {
      calculatedGoalTarget = calculateDateGap(effectiveFromDate, toDate);
    }
    
    const result = await addTask({
      name: name.trim(),
      type: taskType,
      description: description.trim() || undefined,
      time: type !== 'floating' ? time || undefined : undefined,
      weekdays: type === 'weekly' ? selectedWeekdays : undefined,
      exceptDays: type === 'daily' && exceptDays.length > 0 ? exceptDays : undefined,
      date: type === 'particular' ? date : undefined,
      fromDate: effectiveFromDate,
      toDate: type === 'daily' && toDate ? toDate : undefined,
      goalTarget: calculatedGoalTarget,
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

  const toggleExceptDay = (day: number) => {
    setExceptDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const setQuickDate = (dateStr: string) => {
    setDate(dateStr);
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
                    <SelectItem value="floating">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Floating Task
                      </span>
                    </SelectItem>
                    <SelectItem value="notify">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-purple-500" />
                        Notify Task
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              {type !== 'notify' && (
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description for this task..."
                    rows={2}
                  />
                </div>
              )}

              {(type !== 'floating') && (
                <div className="space-y-2">
                  <Label htmlFor="time">{type === 'notify' ? 'Notification Time *' : 'End Time (Optional)'}</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {type === 'notify' ? 'You will be notified at this time' : 'Tasks with time will be ordered by end time'}
                  </p>
                </div>
              )}

              {type === 'notify' && (
                <div className="space-y-2">
                  <Label htmlFor="notifyDate">Particular Date (Optional)</Label>
                  <Input
                    id="notifyDate"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Leave empty to notify daily at the specified time</p>
                </div>
              )}

              {type === 'daily' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromDate">From Date (Optional)</Label>
                      <Input
                        id="fromDate"
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        placeholder={getTodayISO()}
                      />
                      <p className="text-xs text-muted-foreground">Defaults to today</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toDate">To Date (Optional)</Label>
                      <Input
                        id="toDate"
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        min={fromDate || getTodayISO()}
                      />
                    </div>
                  </div>
                  {(fromDate || toDate) && toDate && (
                    <p className="text-sm text-muted-foreground">
                      Target: {calculateDateGap(fromDate || getTodayISO(), toDate)} days
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Except Days (Optional)</Label>
                    <p className="text-xs text-muted-foreground">Task won't appear on these days</p>
                    <div className="flex flex-wrap gap-2">
                      {weekdays.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleExceptDay(day)}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            exceptDays.includes(day)
                              ? 'bg-destructive text-destructive-foreground'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {getWeekdayName(day)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

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
                  <div className="flex gap-2 mb-2">
                    <Button
                      type="button"
                      variant={date === getTodayISO() ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuickDate(getTodayISO())}
                    >
                      Today
                    </Button>
                    <Button
                      type="button"
                      variant={date === getTomorrowISO() ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuickDate(getTomorrowISO())}
                    >
                      Tomorrow
                    </Button>
                  </div>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
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
