import { useState, useEffect, useCallback } from "react";

interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission | "default";
  isEnabled: boolean;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    isSupported: false,
    permission: "default",
    isEnabled: false,
  });

  useEffect(() => {
    const isSupported = "Notification" in window;
    
    if (isSupported) {
      setState({
        isSupported: true,
        permission: Notification.permission,
        isEnabled: Notification.permission === "granted",
      });
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({
        ...prev,
        permission,
        isEnabled: permission === "granted",
      }));
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [state.isSupported]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!state.isEnabled) return null;

    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });

      return notification;
    } catch (error) {
      console.error("Error sending notification:", error);
      return null;
    }
  }, [state.isEnabled]);

  const scheduleStreakReminder = useCallback(() => {
    if (!state.isEnabled) return;

    // Check if we should remind (e.g., if user hasn't been active today)
    const lastReminder = localStorage.getItem("lastStreakReminder");
    const today = new Date().toDateString();

    if (lastReminder === today) return;

    // Schedule a reminder for later in the day
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(18, 0, 0, 0); // 6 PM

    if (now < reminderTime) {
      const delay = reminderTime.getTime() - now.getTime();
      
      setTimeout(() => {
        sendNotification("🔥 Don't break your streak!", {
          body: "Practice with Bhote AI today to keep your streak alive!",
          tag: "streak-reminder",
        });
        localStorage.setItem("lastStreakReminder", today);
      }, delay);
    }
  }, [state.isEnabled, sendNotification]);

  const sendStreakCelebration = useCallback((streakCount: number) => {
    if (!state.isEnabled) return;

    sendNotification(`🎉 ${streakCount} Day Streak!`, {
      body: `Amazing! You've been learning for ${streakCount} days in a row!`,
      tag: "streak-celebration",
    });
  }, [state.isEnabled, sendNotification]);

  const sendXPNotification = useCallback((xp: number, action: string) => {
    if (!state.isEnabled) return;

    sendNotification(`+${xp} XP!`, {
      body: `Great job! You earned ${xp} XP for ${action}`,
      tag: "xp-earned",
      silent: true,
    });
  }, [state.isEnabled, sendNotification]);

  return {
    ...state,
    requestPermission,
    sendNotification,
    scheduleStreakReminder,
    sendStreakCelebration,
    sendXPNotification,
  };
}
