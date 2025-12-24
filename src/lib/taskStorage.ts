import { Task, TaskStore, TaskType } from '@/types/task';

const STORAGE_KEY = 'daily-routine-tasks';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

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

export const getTaskStore = (): TaskStore => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { tasks: [], lastCleanup: getTodayISO() };
};

export const saveTaskStore = (store: TaskStore): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const addTask = (task: Omit<Task, 'id' | 'completedDates' | 'createdAt'>): Task => {
  const store = getTaskStore();
  const newTask: Task = {
    ...task,
    id: generateId(),
    completedDates: [],
    createdAt: getTodayISO(),
    goalCompleted: task.type === 'goal' ? 0 : undefined,
  };
  store.tasks.push(newTask);
  saveTaskStore(store);
  return newTask;
};

export const updateTask = (id: string, updates: Partial<Task>): void => {
  const store = getTaskStore();
  const index = store.tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    store.tasks[index] = { ...store.tasks[index], ...updates };
    saveTaskStore(store);
  }
};

export const deleteTask = (id: string): void => {
  const store = getTaskStore();
  store.tasks = store.tasks.filter(t => t.id !== id);
  saveTaskStore(store);
};

export const toggleTaskCompletion = (id: string, date: string): void => {
  const store = getTaskStore();
  const task = store.tasks.find(t => t.id === id);
  if (task) {
    if (task.completedDates.includes(date)) {
      task.completedDates = task.completedDates.filter(d => d !== date);
      if (task.type === 'goal' && task.goalCompleted !== undefined && task.goalCompleted > 0) {
        task.goalCompleted--;
      }
    } else {
      task.completedDates.push(date);
      if (task.type === 'goal') {
        task.goalCompleted = (task.goalCompleted || 0) + 1;
      }
    }
    saveTaskStore(store);
  }
};

export const isTaskCompletedToday = (task: Task, date: string): boolean => {
  return task.completedDates.includes(date);
};

export const isGoalComplete = (task: Task): boolean => {
  if (task.type !== 'goal') return false;
  return (task.goalCompleted || 0) >= (task.goalTarget || 0);
};

export const getTasksForDate = (date: string): Task[] => {
  const store = getTaskStore();
  const dayOfWeek = new Date(date).getDay();
  const today = getTodayISO();

  return store.tasks.filter(task => {
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
