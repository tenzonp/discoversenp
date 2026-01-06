import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEmotionDetection, DetectedEmotion } from "./useEmotionDetection";
import { useMistakeTracker } from "./useMistakeTracker";

export type AIPersonality = "professional" | "friendly" | "strict" | "playful";
export type LearningStyle = "visual" | "auditory" | "kinesthetic" | "balanced";
export type Pace = "slow" | "normal" | "fast";
export type EncouragementLevel = "minimal" | "moderate" | "high";

interface UserPreferences {
  learningStyle: LearningStyle;
  preferredPace: Pace;
  encouragementLevel: EncouragementLevel;
  aiPersonality: AIPersonality;
  studyGoals: string[];
  weakAreas: string[];
  strongAreas: string[];
  totalSessions: number;
  averageSessionMinutes: number;
}

interface AdaptivePrompt {
  systemPrompt: string;
  greetingStyle: string;
  feedbackStyle: string;
  paceInstructions: string;
  encouragementPhrases: string[];
}

const DEFAULT_PREFERENCES: UserPreferences = {
  learningStyle: "balanced",
  preferredPace: "normal",
  encouragementLevel: "moderate",
  aiPersonality: "friendly",
  studyGoals: [],
  weakAreas: [],
  strongAreas: [],
  totalSessions: 0,
  averageSessionMinutes: 0,
};

export function usePersonalizedAI(userId: string | undefined) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  
  const { emotionState, detectEmotion, getEmotionalResponse } = useEmotionDetection(userId);
  const { insights, getWeakAreas } = useMistakeTracker(userId);

  // Load preferences from database
  const loadPreferences = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    
    const { data } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (data) {
      setPreferences({
        learningStyle: (data.learning_style as LearningStyle) || "balanced",
        preferredPace: (data.preferred_pace as Pace) || "normal",
        encouragementLevel: (data.encouragement_level as EncouragementLevel) || "moderate",
        aiPersonality: (data.ai_personality as AIPersonality) || "friendly",
        studyGoals: (data.study_goals as string[]) || [],
        weakAreas: (data.weak_areas as string[]) || [],
        strongAreas: (data.strong_areas as string[]) || [],
        totalSessions: data.total_sessions || 0,
        averageSessionMinutes: Number(data.average_session_minutes) || 0,
      });
    }
    setLoading(false);
  }, [userId]);

  // Save preferences
  const savePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!userId) return;
    
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    
    const dbData = {
      user_id: userId,
      learning_style: newPrefs.learningStyle,
      preferred_pace: newPrefs.preferredPace,
      encouragement_level: newPrefs.encouragementLevel,
      ai_personality: newPrefs.aiPersonality,
      study_goals: newPrefs.studyGoals,
      weak_areas: newPrefs.weakAreas,
      strong_areas: newPrefs.strongAreas,
      total_sessions: newPrefs.totalSessions,
      average_session_minutes: newPrefs.averageSessionMinutes,
      updated_at: new Date().toISOString(),
    };
    
    await supabase
      .from("user_preferences")
      .upsert(dbData, { onConflict: "user_id" });
  }, [userId, preferences]);

  // Update session stats
  const updateSessionStats = useCallback(async (sessionMinutes: number) => {
    const newTotal = preferences.totalSessions + 1;
    const newAvg = (preferences.averageSessionMinutes * preferences.totalSessions + sessionMinutes) / newTotal;
    
    await savePreferences({
      totalSessions: newTotal,
      averageSessionMinutes: newAvg,
    });
  }, [preferences, savePreferences]);

  // Generate adaptive AI prompt based on all factors
  const generateAdaptivePrompt = useCallback((
    currentEmotion?: DetectedEmotion,
    context?: string,
  ): AdaptivePrompt => {
    const emotion = currentEmotion || emotionState.emotion;
    const emotionalResponse = getEmotionalResponse(emotion);
    
    // Base personality prompts
    const personalityPrompts: Record<AIPersonality, string> = {
      professional: "You are a professional IELTS examiner. Be precise, formal, and focus on accuracy.",
      friendly: "You are a friendly IELTS tutor. Be warm, supportive, and encouraging while maintaining standards.",
      strict: "You are a strict but fair IELTS coach. Push for excellence and don't accept mediocrity.",
      playful: "You are an enthusiastic IELTS buddy. Make learning fun with humor while teaching effectively.",
    };
    
    // Pace instructions
    const paceInstructions: Record<Pace, string> = {
      slow: "Take your time explaining concepts. Break down complex ideas into smaller parts. Wait for understanding before moving on.",
      normal: "Maintain a balanced pace. Explain when needed but keep the conversation flowing.",
      fast: "Be concise and efficient. The student learns quickly, so keep moving forward with minimal repetition.",
    };
    
    // Learning style adaptations
    const styleAdaptations: Record<LearningStyle, string> = {
      visual: "Use descriptive language and ask the student to visualize scenarios. Suggest making notes or diagrams.",
      auditory: "Focus on pronunciation and rhythm of speech. Use verbal explanations and encourage repeat-after-me exercises.",
      kinesthetic: "Make it practical with real-world examples. Encourage the student to practice immediately.",
      balanced: "Mix different approaches - some visualization, some verbal practice, and practical examples.",
    };
    
    // Encouragement phrases based on level
    const encouragementSets: Record<EncouragementLevel, string[]> = {
      minimal: ["Good.", "Continue.", "Okay."],
      moderate: ["Well done!", "Keep going!", "That's good!", "Nice effort!"],
      high: ["Fantastic work! 🌟", "You're amazing! 💪", "I'm so proud of you! 🎉", "Brilliant! Keep shining! ✨", "You're doing incredibly well! 🚀"],
    };
    
    // Combine weak areas into focus
    const weakAreasFocus = preferences.weakAreas.length > 0
      ? `Focus especially on: ${preferences.weakAreas.join(", ")}.`
      : "";
    
    // Build the system prompt
    const systemPrompt = `${personalityPrompts[preferences.aiPersonality]}

${styleAdaptations[preferences.learningStyle]}

${paceInstructions[preferences.preferredPace]}

The student is currently feeling ${emotion}. Adapt your tone to be ${emotionalResponse.tone}.

${weakAreasFocus}

${context ? `Context: ${context}` : ""}

Remember to:
- Adjust your speaking pace: ${emotionalResponse.pacing}
- Use appropriate encouragement
- Be aware of the student's emotional state and respond sensitively`;

    return {
      systemPrompt,
      greetingStyle: emotionalResponse.encouragement,
      feedbackStyle: emotionalResponse.tone,
      paceInstructions: paceInstructions[preferences.preferredPace],
      encouragementPhrases: encouragementSets[preferences.encouragementLevel],
    };
  }, [preferences, emotionState, getEmotionalResponse]);

  // Auto-detect and suggest preference changes
  const analyzeAndSuggestPreferences = useCallback(() => {
    const suggestions: string[] = [];
    
    // If many high-priority mistakes, suggest focusing on those areas
    const weakAreas = getWeakAreas();
    if (weakAreas.length > 0 && !weakAreas.every(w => preferences.weakAreas.includes(w))) {
      suggestions.push(`We noticed you struggle with ${weakAreas.join(", ")}. Would you like to focus on these areas?`);
    }
    
    // If often frustrated, suggest more encouragement
    if (emotionState.emotion === "frustrated" && preferences.encouragementLevel !== "high") {
      suggestions.push("You seem to be working hard! Would you like more encouragement during sessions?");
    }
    
    // If often tired, suggest shorter sessions
    if (emotionState.emotion === "tired" && preferences.averageSessionMinutes > 20) {
      suggestions.push("Consider shorter, more frequent sessions for better retention!");
    }
    
    return suggestions;
  }, [preferences, emotionState, getWeakAreas]);

  // Get personalized greeting based on time and history
  const getPersonalizedGreeting = useCallback(() => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    
    const sessionCount = preferences.totalSessions;
    let personalTouch = "";
    
    if (sessionCount === 0) {
      personalTouch = "Welcome to your first session! I'm excited to help you improve.";
    } else if (sessionCount < 5) {
      personalTouch = "Great to see you back! Let's continue your progress.";
    } else if (sessionCount < 20) {
      personalTouch = "You're building a great habit! Your consistency is impressive.";
    } else {
      personalTouch = "You're a dedicated learner! Your hard work is paying off.";
    }
    
    return `${timeGreeting}! ${personalTouch}`;
  }, [preferences]);

  useEffect(() => {
    if (userId) {
      loadPreferences();
    }
  }, [userId, loadPreferences]);

  return {
    preferences,
    emotionState,
    loading,
    savePreferences,
    updateSessionStats,
    generateAdaptivePrompt,
    analyzeAndSuggestPreferences,
    getPersonalizedGreeting,
    detectEmotion,
    insights,
  };
}
