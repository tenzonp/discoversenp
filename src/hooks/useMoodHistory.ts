import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MoodEntry {
  id: string;
  mood: string;
  mood_score: number;
  energy_level: number | null;
  note: string | null;
  created_at: string;
}

interface MoodStats {
  averageScore: number;
  averageEnergy: number;
  dominantMood: string;
  moodTrend: "up" | "down" | "stable";
  totalCheckins: number;
}

export const useMoodHistory = (userId: string | undefined) => {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMoodHistory = useCallback(async (days: number = 30) => {
    if (!userId) return;
    
    setIsLoading(true);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from("mood_checkins")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error loading mood history:", error);
      setIsLoading(false);
      return;
    }
    
    setMoodHistory(data || []);
    
    // Calculate stats
    if (data && data.length > 0) {
      const avgScore = data.reduce((sum, m) => sum + m.mood_score, 0) / data.length;
      const avgEnergy = data.filter(m => m.energy_level).reduce((sum, m) => sum + (m.energy_level || 0), 0) / data.filter(m => m.energy_level).length || 0;
      
      // Find dominant mood
      const moodCounts: Record<string, number> = {};
      data.forEach(m => {
        moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
      });
      const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Neutral";
      
      // Calculate trend (compare first half to second half)
      const midPoint = Math.floor(data.length / 2);
      const recentAvg = data.slice(0, midPoint).reduce((sum, m) => sum + m.mood_score, 0) / midPoint || 0;
      const olderAvg = data.slice(midPoint).reduce((sum, m) => sum + m.mood_score, 0) / (data.length - midPoint) || 0;
      
      let trend: "up" | "down" | "stable" = "stable";
      if (recentAvg - olderAvg > 1) trend = "up";
      else if (olderAvg - recentAvg > 1) trend = "down";
      
      setStats({
        averageScore: Math.round(avgScore * 10) / 10,
        averageEnergy: Math.round(avgEnergy * 10) / 10,
        dominantMood,
        moodTrend: trend,
        totalCheckins: data.length,
      });
    }
    
    setIsLoading(false);
  }, [userId]);

  // Build context for AI about user's mood patterns
  const buildMoodContext = useCallback(() => {
    if (!stats || moodHistory.length === 0) return "";
    
    const recentMood = moodHistory[0];
    const trendText = stats.moodTrend === "up" ? "improving" : stats.moodTrend === "down" ? "declining" : "stable";
    
    let context = `\nUSER MOOD CONTEXT:\n`;
    context += `- Most recent mood: ${recentMood.mood} (score: ${recentMood.mood_score}/10)\n`;
    context += `- Mood trend over last ${moodHistory.length} check-ins: ${trendText}\n`;
    context += `- Dominant mood pattern: ${stats.dominantMood}\n`;
    context += `- Average mood score: ${stats.averageScore}/10\n`;
    
    if (recentMood.note) {
      context += `- User's recent note: "${recentMood.note}"\n`;
    }
    
    // Add behavioral hints
    if (stats.averageScore < 4) {
      context += `⚠️ User seems to be going through a tough time. Be extra supportive and gentle.\n`;
    } else if (stats.averageScore > 7) {
      context += `✨ User is generally in good spirits. Match their positive energy!\n`;
    }
    
    return context;
  }, [moodHistory, stats]);

  useEffect(() => {
    if (userId) {
      loadMoodHistory();
    }
  }, [userId, loadMoodHistory]);

  return {
    moodHistory,
    stats,
    isLoading,
    loadMoodHistory,
    buildMoodContext,
  };
};
