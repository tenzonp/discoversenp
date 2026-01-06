import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProgressData {
  streak: {
    current: number;
    longest: number;
    lastDate: string | null;
  };
  xp: {
    total: number;
    level: number;
    progress: number;
    nextLevelXP: number;
  };
  quizzes: {
    totalTaken: number;
    averageScore: number;
    bestScore: number;
  };
  voicePractice: {
    todayMinutes: number;
    totalMinutes: number;
    sessionsThisWeek: number;
  };
}

export function useProgress(userId: string | undefined) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    if (!userId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all data in parallel
      const [streakRes, xpRes, quizRes, voiceRes, voiceTotalRes] = await Promise.all([
        supabase.from("user_streaks").select("*").eq("user_id", userId).single(),
        supabase.from("user_xp").select("*").eq("user_id", userId).single(),
        supabase.from("quiz_scores").select("*").eq("user_id", userId),
        supabase.from("voice_session_usage")
          .select("*")
          .eq("user_id", userId)
          .eq("session_date", new Date().toISOString().split("T")[0])
          .single(),
        supabase.from("voice_session_usage")
          .select("*")
          .eq("user_id", userId)
          .gte("session_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
      ]);

      // Calculate streak data
      const streakData = streakRes.data;
      const streak = {
        current: streakData?.current_streak || 0,
        longest: streakData?.longest_streak || 0,
        lastDate: streakData?.last_activity_date || null,
      };

      // Calculate XP data
      const xpData = xpRes.data;
      const totalXP = xpData?.total_xp || 0;
      const level = xpData?.level || 1;
      const currentLevelXP = (level - 1) * (level - 1) * 50;
      const nextLevelXP = level * level * 50;
      const progress = Math.min(100, ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);

      const xp = {
        total: totalXP,
        level,
        progress: Math.max(0, progress),
        nextLevelXP,
      };

      // Calculate quiz stats
      const quizzes = quizRes.data || [];
      const quizStats = {
        totalTaken: quizzes.length,
        averageScore: quizzes.length > 0 
          ? Math.round(quizzes.reduce((sum, q) => sum + (q.score / q.total_questions) * 100, 0) / quizzes.length)
          : 0,
        bestScore: quizzes.length > 0
          ? Math.round(Math.max(...quizzes.map(q => (q.score / q.total_questions) * 100)))
          : 0,
      };

      // Calculate voice practice stats
      const todayVoice = voiceRes.data;
      const weekVoice = voiceTotalRes.data || [];
      const voicePractice = {
        todayMinutes: Math.round((todayVoice?.total_seconds || 0) / 60),
        totalMinutes: Math.round(weekVoice.reduce((sum, v) => sum + v.total_seconds, 0) / 60),
        sessionsThisWeek: weekVoice.length,
      };

      setData({
        streak,
        xp,
        quizzes: quizStats,
        voicePractice,
      });
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return { data, loading, refresh: loadProgress };
}
