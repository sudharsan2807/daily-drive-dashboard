import { useEffect, useRef, useCallback } from 'react';
import { Task } from '@/types/task';
import { getTodayISO, isTaskCompletedToday } from '@/lib/taskStorage';
import despia from 'despia-native';

// Send local push notification using Despia SDK
const sendLocalNotification = (title: string, message: string, delaySeconds: number = 0) => {
  const url = window.location.href;
  despia(`sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${message}&!#${title}&!#${url}`);
};

export const useTaskNotifications = (tasks: Task[]) => {
  const notifiedTasksRef = useRef<Set<string>>(new Set());

  // Send immediate notification
  const sendNotification = useCallback((title: string, message: string) => {
    sendLocalNotification(title, message, 0);
  }, []);

  // Test notification function
  const sendTestNotification = useCallback(() => {
    sendLocalNotification('Test Notification', 'hi', 0);
  }, []);

  useEffect(() => {
    const today = getTodayISO();
    
    // Get tasks with time that are not completed today (for task reminders)
    const timedTasks = tasks.filter(
      (task) =>
        task.time &&
        task.type !== 'floating' &&
        task.type !== 'notify' &&
        !isTaskCompletedToday(task, today)
    );

    // Get notify type tasks for today
    const notifyTasks = tasks.filter(
      (task) =>
        task.type === 'notify' &&
        task.time &&
        (!task.date || task.date === today) // Either no date (daily) or today's date
    );

    const checkTasks = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Check timed tasks for reminders (not completed)
      timedTasks.forEach((task) => {
        if (!task.time) return;
        
        const notificationKey = `${task.id}-${today}`;
        
        if (
          currentTime >= task.time &&
          !notifiedTasksRef.current.has(notificationKey) &&
          !isTaskCompletedToday(task, today)
        ) {
          notifiedTasksRef.current.add(notificationKey);
          sendLocalNotification(
            'Task Reminder',
            `"${task.name}" is due now and not completed!`,
            0
          );
        }
      });

      // Check notify type tasks
      notifyTasks.forEach((task) => {
        if (!task.time) return;
        
        const notificationKey = `notify-${task.id}-${today}`;
        
        if (
          currentTime >= task.time &&
          !notifiedTasksRef.current.has(notificationKey)
        ) {
          notifiedTasksRef.current.add(notificationKey);
          sendLocalNotification(
            task.name,
            task.description || 'Notification reminder',
            0
          );
        }
      });
    };

    // Check immediately
    checkTasks();

    // Check every minute
    const interval = setInterval(checkTasks, 60000);

    return () => clearInterval(interval);
  }, [tasks]);

  // Clear notified tasks at midnight
  useEffect(() => {
    const clearAtMidnight = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const timeUntilMidnight = midnight.getTime() - now.getTime();

      setTimeout(() => {
        notifiedTasksRef.current.clear();
        clearAtMidnight(); // Schedule next clear
      }, timeUntilMidnight);
    };

    clearAtMidnight();
  }, []);

  return { sendNotification, sendTestNotification };
};
