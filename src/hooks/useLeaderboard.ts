import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);

      // Get all XP data
      const { data: xpData, error: xpError } = await supabase
        .from("user_xp")
        .select("user_id, total_xp, level")
        .order("total_xp", { ascending: false })
        .limit(50);

      if (xpError) throw xpError;

      if (!xpData || xpData.length === 0) {
        setLeaderboard([]);
        return;
      }

      // Get streak data for these users
      const userIds = xpData.map(x => x.user_id);
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("user_id, current_streak, longest_streak")
        .in("user_id", userIds);

      // Get profile data for display names
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      // Combine the data
      const streakMap = new Map(streakData?.map(s => [s.user_id, s]) || []);
      const profileMap = new Map(profileData?.map(p => [p.user_id, p]) || []);

      const combined: LeaderboardEntry[] = xpData.map(xp => {
        const streak = streakMap.get(xp.user_id);
        const profile = profileMap.get(xp.user_id);

        return {
          user_id: xp.user_id,
          display_name: profile?.display_name || null,
          total_xp: xp.total_xp,
          level: xp.level,
          current_streak: streak?.current_streak || 0,
          longest_streak: streak?.longest_streak || 0,
        };
      });

      setLeaderboard(combined);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return {
    leaderboard,
    loading,
    refresh: loadLeaderboard,
  };
}
