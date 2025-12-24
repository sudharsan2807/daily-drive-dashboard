import { useState, useEffect } from 'react';
import { Task, TaskType } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { updateTask, getWeekdayName, getTodayISO } from '@/lib/taskStorage';
import { toast } from 'sonner';

const weekdays = [0, 1, 2, 3, 4, 5, 6];

interface EditTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: (task: Task) => void;
}

export const EditTaskDialog = ({ task, open, onOpenChange, onTaskUpdated }: EditTaskDialogProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TaskType>('daily');
  const [time, setTime] = useState('');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [date, setDate] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [howToDo, setHowToDo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setType(task.type);
      setTime(task.time || '');
      setSelectedWeekdays(task.weekdays || []);
      setDate(task.date || '');
      setGoalTarget(task.goalTarget?.toString() || '');
      setHowToDo(task.howToDo || '');
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    
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

    const updates: Partial<Task> = {
      name: name.trim(),
      type,
      time: time || undefined,
      weekdays: type === 'weekly' ? selectedWeekdays : undefined,
      date: type === 'particular' ? date : undefined,
      goalTarget: type === 'goal' ? parseInt(goalTarget) : undefined,
      howToDo: type === 'goal' ? howToDo.trim() || undefined : undefined,
    };

    await updateTask(task.id, updates);
    
    const updatedTask: Task = { ...task, ...updates };
    onTaskUpdated(updatedTask);
    toast.success('Task updated successfully!');
    onOpenChange(false);
    setSubmitting(false);
  };

  const toggleWeekday = (day: number) => {
    setSelectedWeekdays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Task Name *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter task name"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">Task Type *</Label>
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
            <Label htmlFor="edit-time">Time (Optional)</Label>
            <Input
              id="edit-time"
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
              <Label htmlFor="edit-date">Date *</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          )}

          {type === 'goal' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-goalTarget">Goal Target (Sessions) *</Label>
                <Input
                  id="edit-goalTarget"
                  type="number"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  placeholder="e.g., 20"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-howToDo">How to do? (Optional)</Label>
                <Textarea
                  id="edit-howToDo"
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
              <Save className="h-4 w-4 mr-2" />
            )}
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
