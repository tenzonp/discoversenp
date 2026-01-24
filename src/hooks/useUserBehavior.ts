import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserBehavior {
  flirtLevel: number;
  energyLevel: number;
  expertiseLevel: number;
  moodTendency: string;
  communicationStyle: string;
  currentFocus: string | null;
  interests: string[];
  conversationDepth: number;
  humorAppreciation: number;
  emotionalOpenness: number;
}

interface UseUserBehaviorReturn {
  behavior: UserBehavior;
  isLoading: boolean;
  updateBehavior: (updates: Partial<UserBehavior>) => Promise<void>;
  analyzeBehavior: (message: string, isFlirty?: boolean) => Promise<void>;
}

const DEFAULT_BEHAVIOR: UserBehavior = {
  flirtLevel: 0,
  energyLevel: 50,
  expertiseLevel: 0,
  moodTendency: "neutral",
  communicationStyle: "balanced",
  currentFocus: null,
  interests: [],
  conversationDepth: 50,
  humorAppreciation: 50,
  emotionalOpenness: 50,
};

export const useUserBehavior = (userId: string | undefined): UseUserBehaviorReturn => {
  const [behavior, setBehavior] = useState<UserBehavior>(DEFAULT_BEHAVIOR);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBehavior = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("flirt_level, energy_level, expertise_level, mood_tendency, communication_style, current_focus, interests, conversation_depth, humor_appreciation, emotional_openness")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching behavior:", error);
      }

      if (data) {
        setBehavior({
          flirtLevel: data.flirt_level ?? 0,
          energyLevel: data.energy_level ?? 50,
          expertiseLevel: data.expertise_level ?? 0,
          moodTendency: data.mood_tendency ?? "neutral",
          communicationStyle: data.communication_style ?? "balanced",
          currentFocus: data.current_focus,
          interests: (data.interests as string[]) ?? [],
          conversationDepth: data.conversation_depth ?? 50,
          humorAppreciation: data.humor_appreciation ?? 50,
          emotionalOpenness: data.emotional_openness ?? 50,
        });
      }
    } catch (err) {
      console.error("Behavior fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBehavior();
  }, [fetchBehavior]);

  const updateBehavior = async (updates: Partial<UserBehavior>) => {
    if (!userId) return;

    const dbUpdates: Record<string, any> = {};
    
    if (updates.flirtLevel !== undefined) dbUpdates.flirt_level = updates.flirtLevel;
    if (updates.energyLevel !== undefined) dbUpdates.energy_level = updates.energyLevel;
    if (updates.expertiseLevel !== undefined) dbUpdates.expertise_level = updates.expertiseLevel;
    if (updates.moodTendency !== undefined) dbUpdates.mood_tendency = updates.moodTendency;
    if (updates.communicationStyle !== undefined) dbUpdates.communication_style = updates.communicationStyle;
    if (updates.currentFocus !== undefined) dbUpdates.current_focus = updates.currentFocus;
    if (updates.interests !== undefined) dbUpdates.interests = updates.interests;
    if (updates.conversationDepth !== undefined) dbUpdates.conversation_depth = updates.conversationDepth;
    if (updates.humorAppreciation !== undefined) dbUpdates.humor_appreciation = updates.humorAppreciation;
    if (updates.emotionalOpenness !== undefined) dbUpdates.emotional_openness = updates.emotionalOpenness;

    await supabase
      .from("user_preferences")
      .upsert({
        user_id: userId,
        ...dbUpdates,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    setBehavior(prev => ({ ...prev, ...updates }));
  };

  // Analyze message to update behavior patterns
  const analyzeBehavior = async (message: string, isFlirty = false) => {
    if (!userId) return;

    const updates: Partial<UserBehavior> = {};

    // Detect flirty patterns
    const flirtyPatterns = /😘|❤️|😍|love|baby|sweetheart|darling|miss you|cute|handsome|beautiful/i;
    if (isFlirty || flirtyPatterns.test(message)) {
      updates.flirtLevel = Math.min(behavior.flirtLevel + 2, 100);
    }

    // Detect high energy
    const energyPatterns = /!{2,}|excited|amazing|awesome|🎉|🔥|let's go|yeah/i;
    if (energyPatterns.test(message)) {
      updates.energyLevel = Math.min(behavior.energyLevel + 3, 100);
    }

    // Detect technical expertise
    const techPatterns = /code|programming|algorithm|database|api|frontend|backend|react|python|javascript/i;
    if (techPatterns.test(message)) {
      updates.expertiseLevel = Math.min(behavior.expertiseLevel + 2, 100);
    }

    // Detect humor appreciation
    const humorPatterns = /😂|🤣|lol|lmao|haha|funny|joke/i;
    if (humorPatterns.test(message)) {
      updates.humorAppreciation = Math.min(behavior.humorAppreciation + 2, 100);
    }

    // Detect emotional openness
    const emotionalPatterns = /feel|feeling|sad|happy|anxious|worried|excited|love|hate|scared/i;
    if (emotionalPatterns.test(message)) {
      updates.emotionalOpenness = Math.min(behavior.emotionalOpenness + 2, 100);
    }

    // Update conversation depth based on message length
    if (message.length > 100) {
      updates.conversationDepth = Math.min(behavior.conversationDepth + 1, 100);
    }

    if (Object.keys(updates).length > 0) {
      await updateBehavior(updates);
    }
  };

  return {
    behavior,
    isLoading,
    updateBehavior,
    analyzeBehavior,
  };
};
