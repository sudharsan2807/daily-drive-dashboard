import { Task, TaskType } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';

export const getTodayISO = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Convert database row to Task type
const rowToTask = (row: any): Task => ({
  id: row.id,
  name: row.name,
  type: row.type as TaskType,
  time: row.time || undefined,
  weekdays: row.weekdays || undefined,
  date: row.date || undefined,
  goalTarget: row.goal_target || undefined,
  goalCompleted: row.goal_completed || undefined,
  howToDo: row.how_to_do || undefined,
  completedDates: row.completed_dates || [],
  createdAt: row.created_at?.split('T')[0] || getTodayISO(),
});

// Fetch all tasks from Supabase
export const fetchTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return (data || []).map(rowToTask);
};

// Add a new task
export const addTask = async (task: Omit<Task, 'id' | 'completedDates' | 'createdAt'>): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      name: task.name,
      type: task.type,
      time: task.time || null,
      weekdays: task.weekdays || null,
      date: task.date || null,
      goal_target: task.goalTarget || null,
      goal_completed: task.type === 'goal' ? 0 : null,
      how_to_do: task.howToDo || null,
      completed_dates: [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding task:', error);
    return null;
  }

  return rowToTask(data);
};

// Update a task
export const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
  const dbUpdates: any = {};
  
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.time !== undefined) dbUpdates.time = updates.time;
  if (updates.weekdays !== undefined) dbUpdates.weekdays = updates.weekdays;
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.goalTarget !== undefined) dbUpdates.goal_target = updates.goalTarget;
  if (updates.goalCompleted !== undefined) dbUpdates.goal_completed = updates.goalCompleted;
  if (updates.howToDo !== undefined) dbUpdates.how_to_do = updates.howToDo;
  if (updates.completedDates !== undefined) dbUpdates.completed_dates = updates.completedDates;

  const { error } = await supabase
    .from('tasks')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    console.error('Error updating task:', error);
  }
};

// Delete a task
export const deleteTask = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
  }
};

// Toggle task completion for a specific date
export const toggleTaskCompletion = async (task: Task, date: string): Promise<Task> => {
  let newCompletedDates = [...task.completedDates];
  let newGoalCompleted = task.goalCompleted;

  if (newCompletedDates.includes(date)) {
    newCompletedDates = newCompletedDates.filter(d => d !== date);
    if (task.type === 'goal' && newGoalCompleted !== undefined && newGoalCompleted > 0) {
      newGoalCompleted--;
    }
  } else {
    newCompletedDates.push(date);
    if (task.type === 'goal') {
      newGoalCompleted = (newGoalCompleted || 0) + 1;
    }
  }

  const { error } = await supabase
    .from('tasks')
    .update({
      completed_dates: newCompletedDates,
      goal_completed: newGoalCompleted,
    })
    .eq('id', task.id);

  if (error) {
    console.error('Error toggling task completion:', error);
  }

  return {
    ...task,
    completedDates: newCompletedDates,
    goalCompleted: newGoalCompleted,
  };
};

export const isTaskCompletedToday = (task: Task, date: string): boolean => {
  return task.completedDates.includes(date);
};

export const isGoalComplete = (task: Task): boolean => {
  if (task.type !== 'goal') return false;
  return (task.goalCompleted || 0) >= (task.goalTarget || 0);
};

// Filter tasks for a specific date
export const filterTasksForDate = (tasks: Task[], date: string): Task[] => {
  const dayOfWeek = new Date(date).getDay();

  return tasks.filter(task => {
    // Skip completed goals
    if (task.type === 'goal' && isGoalComplete(task)) {
      return false;
    }

    switch (task.type) {
      case 'daily':
        return true;
      case 'weekly':
        return task.weekdays?.includes(dayOfWeek);
      case 'particular':
        // Show if it's the scheduled date or if it was carried forward
        if (task.date === date) return true;
        // Check if it should be carried forward (incomplete past task)
        if (task.date && task.date < date && !task.completedDates.includes(task.date)) {
          return true;
        }
        return false;
      case 'goal':
        return true;
      default:
        return false;
    }
  }).map(task => {
    // Mark carried forward tasks
    if (task.type === 'particular' && task.date && task.date < date && !task.completedDates.includes(task.date)) {
      return { ...task, carriedFrom: task.date };
    }
    return task;
  });
};

export const getTaskTypeLabel = (type: TaskType): string => {
  const labels: Record<TaskType, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    particular: 'Specific Day',
    goal: 'Goal',
  };
  return labels[type];
};

export const getWeekdayName = (day: number): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[day];
};
