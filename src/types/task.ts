export type TaskType = 'daily' | 'weekly' | 'particular' | 'goal';

export interface Task {
  id: string;
  name: string;
  type: TaskType;
  description?: string;
  time?: string;
  weekdays?: number[]; // 0-6 for Sunday-Saturday
  date?: string; // ISO date string for particular day tasks
  fromDate?: string; // Start date for daily tasks with date range
  toDate?: string; // End date for daily tasks with date range (optional)
  goalTarget?: number;
  goalCompleted?: number;
  howToDo?: string;
  completedDates: string[]; // ISO date strings when task was completed
  createdAt: string;
  carriedFrom?: string; // ISO date string if carried from another day
  sortOrder: number;
}

export interface TaskStore {
  tasks: Task[];
  lastCleanup: string;
}
