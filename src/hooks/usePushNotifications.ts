import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PushState {
  isSupported: boolean;
  permission: NotificationPermission | "default";
  isSubscribed: boolean;
}

// VAPID public key would normally come from backend
// For demo, we'll use browser notifications directly
export function usePushNotifications(userId: string | undefined) {
  const [state, setState] = useState<PushState>({
    isSupported: false,
    permission: "default",
    isSubscribed: false,
  });

  useEffect(() => {
    const isSupported = "Notification" in window && "serviceWorker" in navigator;
    
    if (isSupported) {
      setState({
        isSupported: true,
        permission: Notification.permission,
        isSubscribed: Notification.permission === "granted",
      });
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!state.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission,
        isSubscribed: permission === "granted",
      }));

      if (permission === "granted" && userId) {
        // Store subscription in database
        // In production, you'd use Push API with service worker
        localStorage.setItem("push_enabled", "true");
        localStorage.setItem("push_user", userId);
      }

      return permission === "granted";
    } catch (err) {
      console.error("Push subscription error:", err);
      return false;
    }
  }, [state.isSupported, userId]);

  const unsubscribe = useCallback(async () => {
    localStorage.removeItem("push_enabled");
    localStorage.removeItem("push_user");
    
    setState(prev => ({
      ...prev,
      isSubscribed: false,
    }));
  }, []);

  const sendLocalNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (Notification.permission !== "granted") return null;

    try {
      return new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
    } catch (err) {
      console.error("Notification error:", err);
      return null;
    }
  }, []);

  const scheduleStudyReminder = useCallback(() => {
    if (!state.isSubscribed) return;

    const now = new Date();
    const reminderTime = new Date();
    
    // Schedule for 8 AM next day if past 8 AM
    reminderTime.setHours(8, 0, 0, 0);
    if (now >= reminderTime) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const delay = reminderTime.getTime() - now.getTime();
    const lastReminder = localStorage.getItem("lastStudyReminder");
    const today = new Date().toDateString();

    if (lastReminder === today) return;

    setTimeout(() => {
      sendLocalNotification("📚 Time to Study!", {
        body: "Your daily study session is waiting. Keep your streak alive! 🔥",
        tag: "study-reminder",
        requireInteraction: true,
      });
      localStorage.setItem("lastStudyReminder", today);
    }, delay);
  }, [state.isSubscribed, sendLocalNotification]);

  const sendStreakAlert = useCallback((currentStreak: number) => {
    if (!state.isSubscribed) return;

    const hour = new Date().getHours();
    
    // Evening reminder if user hasn't studied
    if (hour >= 18 && hour < 21) {
      sendLocalNotification("🔥 Don't Break Your Streak!", {
        body: `You have a ${currentStreak}-day streak! Practice now to keep it going.`,
        tag: "streak-alert",
        requireInteraction: true,
      });
    }
  }, [state.isSubscribed, sendLocalNotification]);

  const sendAchievementNotification = useCallback((achievement: string) => {
    if (!state.isSubscribed) return;

    sendLocalNotification("🏆 Achievement Unlocked!", {
      body: achievement,
      tag: "achievement",
    });
  }, [state.isSubscribed, sendLocalNotification]);

  const sendIELTSScoreNotification = useCallback((bandScore: number) => {
    if (!state.isSubscribed) return;

    if (bandScore >= 7) {
      sendLocalNotification("🎯 Excellent IELTS Score!", {
        body: `You achieved Band ${bandScore}! Share your certificate with friends!`,
        tag: "ielts-score",
      });
    }
  }, [state.isSubscribed, sendLocalNotification]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendLocalNotification,
    scheduleStudyReminder,
    sendStreakAlert,
    sendAchievementNotification,
    sendIELTSScoreNotification,
  };
}
