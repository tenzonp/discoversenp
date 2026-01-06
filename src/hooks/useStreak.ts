import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

interface XPData {
  total_xp: number;
  level: number;
}

export function useStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [xp, setXP] = useState<XPData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStreakAndXP = useCallback(async () => {
    if (!user) {
      setStreak(null);
      setXP(null);
      setLoading(false);
      return;
    }

    try {
      // Load streak
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (streakData) {
        setStreak(streakData);
      }

      // Load XP
      const { data: xpData } = await supabase
        .from("user_xp")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (xpData) {
        setXP(xpData);
      }
    } catch (error) {
      console.error("Error loading streak/XP:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadStreakAndXP();
  }, [loadStreakAndXP]);

  const updateActivity = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    try {
      const { data: existingStreak } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!existingStreak) {
        // Create new streak record
        const { data } = await supabase
          .from("user_streaks")
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today,
          })
          .select()
          .single();

        if (data) setStreak(data);
      } else {
        const lastDate = new Date(existingStreak.last_activity_date);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        let newStreak = existingStreak.current_streak;

        if (diffDays === 0) {
          // Same day, no change
          return;
        } else if (diffDays === 1) {
          // Next day, increment streak
          newStreak = existingStreak.current_streak + 1;
        } else {
          // Streak broken, reset to 1
          newStreak = 1;
        }

        const newLongest = Math.max(newStreak, existingStreak.longest_streak);

        const { data } = await supabase
          .from("user_streaks")
          .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_activity_date: today,
          })
          .eq("user_id", user.id)
          .select()
          .single();

        if (data) setStreak(data);
      }
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  }, [user]);

  const addXP = useCallback(async (points: number) => {
    if (!user) return;

    try {
      const { data: existingXP } = await supabase
        .from("user_xp")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!existingXP) {
        // Create new XP record
        const newLevel = calculateLevel(points);
        const { data } = await supabase
          .from("user_xp")
          .insert({
            user_id: user.id,
            total_xp: points,
            level: newLevel,
          })
          .select()
          .single();

        if (data) setXP(data);
      } else {
        const newTotal = existingXP.total_xp + points;
        const newLevel = calculateLevel(newTotal);

        const { data } = await supabase
          .from("user_xp")
          .update({
            total_xp: newTotal,
            level: newLevel,
          })
          .eq("user_id", user.id)
          .select()
          .single();

        if (data) setXP(data);
      }
    } catch (error) {
      console.error("Error adding XP:", error);
    }
  }, [user]);

  return {
    streak,
    xp,
    loading,
    updateActivity,
    addXP,
    refresh: loadStreakAndXP,
  };
}

// Calculate level based on XP (100 XP per level, increasing)
function calculateLevel(xp: number): number {
  // Level = floor(sqrt(xp / 50)) + 1
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

// Calculate XP needed for next level
export function xpForNextLevel(currentLevel: number): number {
  return currentLevel * currentLevel * 50;
}

// Calculate progress to next level (0-100)
export function levelProgress(totalXP: number, currentLevel: number): number {
  const currentLevelXP = (currentLevel - 1) * (currentLevel - 1) * 50;
  const nextLevelXP = currentLevel * currentLevel * 50;
  const progress = ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return Math.min(100, Math.max(0, progress));
}
