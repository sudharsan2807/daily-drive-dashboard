export type TaskType = 'daily' | 'weekly' | 'particular' | 'goal' | 'floating' | 'notify';

export interface Task {
  id: string;
  name: string;
  type: TaskType;
  description?: string;
  time?: string;
  weekdays?: number[]; // 0-6 for Sunday-Saturday
  exceptDays?: number[]; // Days to exclude for daily tasks
  date?: string; // ISO date string for particular day tasks
  fromDate?: string; // Start date for daily tasks with date range
  toDate?: string; // End date for daily tasks with date range (optional)
  goalTarget?: number;
  goalCompleted?: number;
  howToDo?: string;
  completedDates: string[]; // ISO date strings when task was completed
  createdAt: string;
  carriedFrom?: string; // ISO date string if carried from another day
  postponedFrom?: string; // Original date for postponed particular tasks
  dayCount?: number; // Days since creation for floating tasks
  sortOrder: number;
}

export interface TaskStore {
  tasks: Task[];
  lastCleanup: string;
}
