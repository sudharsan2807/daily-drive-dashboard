import { useEffect, useRef, useCallback } from 'react';
import { Task } from '@/types/task';
import { getTodayISO, isTaskCompletedToday } from '@/lib/taskStorage';

export const useTaskNotifications = (tasks: Task[]) => {
  const notifiedTasksRef = useRef<Set<string>>(new Set());
  const permissionRequestedRef = useRef(false);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied' && !permissionRequestedRef.current) {
      permissionRequestedRef.current = true;
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  // Show notification
  const showNotification = useCallback((task: Task) => {
    if (Notification.permission !== 'granted') return;

    const notification = new Notification('Task Reminder', {
      body: `"${task.name}" is due now and not completed!`,
      icon: '/favicon.ico',
      tag: task.id, // Prevent duplicate notifications
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, []);

  useEffect(() => {
    // Request permission on mount
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    const today = getTodayISO();
    
    // Get tasks with time that are not completed today
    const timedTasks = tasks.filter(
      (task) =>
        task.time &&
        task.type !== 'floating' &&
        !isTaskCompletedToday(task, today)
    );

    if (timedTasks.length === 0) return;

    const checkTasks = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      timedTasks.forEach((task) => {
        if (!task.time) return;
        
        // Check if current time matches or has passed the task time
        // Only notify once per task per day
        const notificationKey = `${task.id}-${today}`;
        
        if (
          currentTime >= task.time &&
          !notifiedTasksRef.current.has(notificationKey) &&
          !isTaskCompletedToday(task, today)
        ) {
          notifiedTasksRef.current.add(notificationKey);
          showNotification(task);
        }
      });
    };

    // Check immediately
    checkTasks();

    // Check every minute
    const interval = setInterval(checkTasks, 60000);

    return () => clearInterval(interval);
  }, [tasks, showNotification]);

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

  return { requestPermission };
};
