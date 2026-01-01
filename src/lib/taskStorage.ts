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
  description: row.description || undefined,
  time: row.time || undefined,
  weekdays: row.weekdays || undefined,
  exceptDays: row.except_days || undefined,
  date: row.date || undefined,
  fromDate: row.from_date || undefined,
  toDate: row.to_date || undefined,
  goalTarget: row.goal_target || undefined,
  goalCompleted: row.goal_completed || undefined,
  howToDo: row.how_to_do || undefined,
  completedDates: row.completed_dates || [],
  createdAt: row.created_at?.split('T')[0] || getTodayISO(),
  postponedFrom: row.postponed_from || undefined,
  dayCount: row.day_count || 0,
  sortOrder: row.sort_order || 0,
  intervalDays: row.interval_days || 1,
  skippedDates: row.skipped_dates || [],
});

// Fetch all tasks from Supabase
export const fetchTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return (data || []).map(rowToTask);
};

// Add a new task
export const addTask = async (task: Omit<Task, 'id' | 'completedDates' | 'createdAt' | 'sortOrder'>): Promise<Task | null> => {
  // Get the max sort_order to add new task at the end
  const { data: maxData } = await supabase
    .from('tasks')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  
  const maxSortOrder = maxData && maxData.length > 0 ? (maxData[0].sort_order || 0) : 0;
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      name: task.name,
      type: task.type,
      description: task.description || null,
      time: task.time || null,
      weekdays: task.weekdays || null,
      except_days: task.exceptDays || null,
      date: task.date || null,
      from_date: task.fromDate || null,
      to_date: task.toDate || null,
      goal_target: task.goalTarget || null,
      goal_completed: (task.type === 'goal' || task.type === 'floating_goal') ? 0 : null,
      how_to_do: task.howToDo || null,
      completed_dates: [],
      sort_order: maxSortOrder + 1,
      day_count: 0,
      interval_days: task.intervalDays || 1,
      skipped_dates: [],
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
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.time !== undefined) dbUpdates.time = updates.time;
  if (updates.weekdays !== undefined) dbUpdates.weekdays = updates.weekdays;
  if (updates.exceptDays !== undefined) dbUpdates.except_days = updates.exceptDays;
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.fromDate !== undefined) dbUpdates.from_date = updates.fromDate;
  if (updates.toDate !== undefined) dbUpdates.to_date = updates.toDate;
  if (updates.goalTarget !== undefined) dbUpdates.goal_target = updates.goalTarget;
  if (updates.goalCompleted !== undefined) dbUpdates.goal_completed = updates.goalCompleted;
  if (updates.howToDo !== undefined) dbUpdates.how_to_do = updates.howToDo;
  if (updates.completedDates !== undefined) dbUpdates.completed_dates = updates.completedDates;
  if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;
  if (updates.postponedFrom !== undefined) dbUpdates.postponed_from = updates.postponedFrom;
  if (updates.dayCount !== undefined) dbUpdates.day_count = updates.dayCount;
  if (updates.intervalDays !== undefined) dbUpdates.interval_days = updates.intervalDays;
  if (updates.skippedDates !== undefined) dbUpdates.skipped_dates = updates.skippedDates;

  const { error } = await supabase
    .from('tasks')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    console.error('Error updating task:', error);
  }
};

// Update sort order for multiple tasks
export const updateTasksOrder = async (taskOrders: { id: string; sortOrder: number }[]): Promise<void> => {
  for (const { id, sortOrder } of taskOrders) {
    const { error } = await supabase
      .from('tasks')
      .update({ sort_order: sortOrder })
      .eq('id', id);

    if (error) {
      console.error('Error updating task order:', error);
    }
  }
};

// Calculate date gap in days
export const calculateDateGap = (fromDate: string, toDate: string): number => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffTime = Math.abs(to.getTime() - from.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
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

// Skip a task for a specific date (remove for today only)
export const skipTaskForDate = async (task: Task, date: string): Promise<Task> => {
  const newSkippedDates = [...(task.skippedDates || []), date];
  
  const { error } = await supabase
    .from('tasks')
    .update({ skipped_dates: newSkippedDates })
    .eq('id', task.id);

  if (error) {
    console.error('Error skipping task:', error);
  }

  return {
    ...task,
    skippedDates: newSkippedDates,
  };
};

// Toggle task completion for a specific date
export const toggleTaskCompletion = async (task: Task, date: string): Promise<Task> => {
  let newCompletedDates = [...task.completedDates];
  let newGoalCompleted = task.goalCompleted;

  if (newCompletedDates.includes(date)) {
    newCompletedDates = newCompletedDates.filter(d => d !== date);
    if ((task.type === 'goal' || task.type === 'floating_goal') && newGoalCompleted !== undefined && newGoalCompleted > 0) {
      newGoalCompleted--;
    }
  } else {
    newCompletedDates.push(date);
    if (task.type === 'goal' || task.type === 'floating_goal') {
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
  if (task.type !== 'goal' && task.type !== 'floating_goal') return false;
  return (task.goalCompleted || 0) >= (task.goalTarget || 0);
};

// Calculate days difference between two dates
const daysDifference = (fromDate: string, toDate: string): number => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffTime = to.getTime() - from.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Filter tasks for a specific date
export const filterTasksForDate = (tasks: Task[], date: string): Task[] => {
  const dayOfWeek = new Date(date).getDay();

  return tasks.filter(task => {
    // Skip if this date is in skipped dates
    if (task.skippedDates?.includes(date)) {
      return false;
    }

    // Skip completed goals
    if ((task.type === 'goal' || task.type === 'floating_goal') && isGoalComplete(task)) {
      return false;
    }

    // Skip floating tasks (they go in separate block)
    if (task.type === 'floating' || task.type === 'floating_goal') {
      return false;
    }

    switch (task.type) {
      case 'daily':
        // Check if this day is excluded
        if (task.exceptDays?.includes(dayOfWeek)) {
          return false;
        }
        // Check date range - don't show before fromDate (when task was created/assigned)
        if (task.fromDate && date < task.fromDate) return false;
        if (task.toDate && date > task.toDate) return false;
        // If no fromDate set, don't show before createdAt date
        if (!task.fromDate && task.createdAt && date < task.createdAt) return false;
        
        // Check interval days
        if (task.intervalDays && task.intervalDays > 1) {
          const startDate = task.fromDate || task.createdAt;
          const daysSinceStart = daysDifference(startDate, date);
          if (daysSinceStart < 0 || daysSinceStart % task.intervalDays !== 0) {
            return false;
          }
        }
        return true;
      case 'weekly':
        return task.weekdays?.includes(dayOfWeek);
      case 'particular':
        // Show ONLY if it's the scheduled date
        return task.date === date;
      case 'goal':
        return true;
      case 'notify':
        // Show on specific date if set, otherwise show every day
        if (task.date) return task.date === date;
        return true;
      default:
        return false;
    }
  });
};

// Get floating tasks (always show until completed)
export const getFloatingTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task => task.type === 'floating' && !task.completedDates.length);
};

// Get floating goals (always show until goal completed)
export const getFloatingGoals = (tasks: Task[]): Task[] => {
  return tasks.filter(task => task.type === 'floating_goal' && !isGoalComplete(task));
};

// Get postponed tasks for a specific date (tasks from previous days that weren't completed)
export const getPostponedTasks = (tasks: Task[], date: string): Task[] => {
  return tasks.filter(task => {
    // Only particular tasks can be postponed
    if (task.type !== 'particular') return false;
    
    // Skip if already skipped for this date
    if (task.skippedDates?.includes(date)) return false;
    
    // Task must have a date that's in the past
    if (!task.date || task.date >= date) return false;
    
    // Task must not be completed on its original date
    if (task.completedDates.includes(task.date)) return false;
    
    // Task must not be completed on current date
    if (task.completedDates.includes(date)) return false;
    
    return true;
  });
};

// Calculate days since a task was postponed
export const getDaysPostponed = (taskDate: string, currentDate: string): number => {
  return daysDifference(taskDate, currentDate);
};

// Calculate days since creation
export const getDaysSinceCreation = (createdAt: string): number => {
  const created = new Date(createdAt);
  const today = new Date(getTodayISO());
  const diffTime = today.getTime() - created.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const getTaskTypeLabel = (type: TaskType, intervalDays?: number): string => {
  // If it's a daily task with interval > 1, show as "Task"
  if (type === 'daily' && intervalDays && intervalDays > 1) {
    return 'Task';
  }
  
  const labels: Record<TaskType, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    particular: 'Specific Day',
    goal: 'Goal',
    floating: 'Floating',
    notify: 'Notify',
    floating_goal: 'Floating Goal',
  };
  return labels[type];
};

export const getWeekdayName = (day: number): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[day];
};
