import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DetectedEmotion = "confident" | "stressed" | "frustrated" | "excited" | "tired" | "neutral";

interface EmotionState {
  emotion: DetectedEmotion;
  confidence: number;
  energy: number;
  sentiment: "positive" | "neutral" | "negative";
}

interface VoiceMetrics {
  wordsPerMinute: number;
  pauseFrequency: number;
  averagePauseLength: number;
  volumeVariation: number;
  pitchPattern: "monotone" | "varied" | "erratic";
}

export function useEmotionDetection(userId: string | undefined) {
  const [emotionState, setEmotionState] = useState<EmotionState>({
    emotion: "neutral",
    confidence: 0.5,
    energy: 0.5,
    sentiment: "neutral",
  });

  const [voiceMetrics, setVoiceMetrics] = useState<VoiceMetrics>({
    wordsPerMinute: 0,
    pauseFrequency: 0,
    averagePauseLength: 0,
    volumeVariation: 0,
    pitchPattern: "varied",
  });

  const wordTimestamps = useRef<number[]>([]);
  const pauseStarts = useRef<number[]>([]);
  const lastSpeechTime = useRef<number>(Date.now());

  // Analyze text for emotional markers
  const analyzeTextEmotion = useCallback((text: string): Partial<EmotionState> => {
    const lowerText = text.toLowerCase();
    
    // Frustration markers
    const frustrationMarkers = ["i can't", "i don't know", "difficult", "confused", "hard", "stuck", "wrong", "mistake", "again", "ugh", "hmm"];
    const frustrationCount = frustrationMarkers.filter(m => lowerText.includes(m)).length;
    
    // Confidence markers
    const confidenceMarkers = ["i think", "definitely", "sure", "absolutely", "i believe", "clearly", "obviously"];
    const confidenceCount = confidenceMarkers.filter(m => lowerText.includes(m)).length;
    
    // Excitement markers
    const excitementMarkers = ["!", "amazing", "great", "love", "excited", "wonderful", "fantastic"];
    const excitementCount = excitementMarkers.filter(m => lowerText.includes(m)).length;
    
    // Tiredness markers
    const tirednessMarkers = ["tired", "sleepy", "exhausted", "long day", "can we stop", "break"];
    const tirednessCount = tirednessMarkers.filter(m => lowerText.includes(m)).length;
    
    // Calculate scores
    const scores = {
      frustrated: frustrationCount * 0.3,
      confident: confidenceCount * 0.25,
      excited: excitementCount * 0.3,
      tired: tirednessCount * 0.4,
      stressed: (frustrationCount + tirednessCount) * 0.15,
    };
    
    // Find dominant emotion
    const maxScore = Math.max(...Object.values(scores));
    let emotion: DetectedEmotion = "neutral";
    
    if (maxScore > 0.2) {
      emotion = Object.entries(scores).find(([_, v]) => v === maxScore)?.[0] as DetectedEmotion || "neutral";
    }
    
    // Calculate sentiment
    const positiveWords = ["good", "great", "nice", "love", "happy", "yes", "correct", "right", "thank"];
    const negativeWords = ["bad", "wrong", "no", "hate", "difficult", "hard", "confused", "stuck"];
    
    const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;
    
    let sentiment: "positive" | "neutral" | "negative" = "neutral";
    if (positiveCount > negativeCount + 1) sentiment = "positive";
    else if (negativeCount > positiveCount + 1) sentiment = "negative";
    
    return { emotion, sentiment };
  }, []);

  // Analyze voice patterns for emotion
  const analyzeVoicePatterns = useCallback((
    speakingDuration: number,
    wordCount: number,
    pauseCount: number,
  ): Partial<EmotionState> => {
    const wpm = speakingDuration > 0 ? (wordCount / speakingDuration) * 60 : 0;
    
    // Update voice metrics
    setVoiceMetrics(prev => ({
      ...prev,
      wordsPerMinute: Math.round(wpm),
      pauseFrequency: pauseCount,
    }));
    
    // Analyze patterns
    let energy = 0.5;
    let confidence = 0.5;
    
    // High WPM = high energy (excited or stressed)
    if (wpm > 150) {
      energy = 0.8;
      confidence = wpm > 180 ? 0.4 : 0.7; // Very fast might indicate stress
    } else if (wpm < 80) {
      energy = 0.3;
      confidence = wpm < 50 ? 0.3 : 0.5; // Very slow might indicate tiredness
    } else {
      // Normal range
      energy = 0.5 + (wpm - 100) / 100;
      confidence = 0.6;
    }
    
    // High pause frequency might indicate uncertainty
    if (pauseCount > 5 && speakingDuration > 30) {
      confidence -= 0.2;
    }
    
    return {
      energy: Math.max(0, Math.min(1, energy)),
      confidence: Math.max(0, Math.min(1, confidence)),
    };
  }, []);

  // Combined emotion detection
  const detectEmotion = useCallback((
    text: string,
    speakingDuration: number,
    wordCount: number,
    pauseCount: number = 0,
  ) => {
    const textAnalysis = analyzeTextEmotion(text);
    const voiceAnalysis = analyzeVoicePatterns(speakingDuration, wordCount, pauseCount);
    
    const newState: EmotionState = {
      emotion: textAnalysis.emotion || "neutral",
      confidence: voiceAnalysis.confidence || 0.5,
      energy: voiceAnalysis.energy || 0.5,
      sentiment: textAnalysis.sentiment || "neutral",
    };
    
    setEmotionState(newState);
    
    // Save to database for pattern analysis
    if (userId) {
      saveEmotionData(newState, "ielts_voice", text);
    }
    
    return newState;
  }, [analyzeTextEmotion, analyzeVoicePatterns, userId]);

  // Save emotion data
  const saveEmotionData = useCallback(async (
    state: EmotionState,
    sessionType: string,
    messageText: string,
  ) => {
    if (!userId) return;
    
    try {
      await supabase.from("session_emotions").insert({
        user_id: userId,
        session_type: sessionType,
        detected_emotion: state.emotion,
        confidence_level: state.confidence,
        energy_level: state.energy,
        message_text: messageText.slice(0, 500),
      });
    } catch (e) {
      console.error("Failed to save emotion:", e);
    }
  }, [userId]);

  // Get adaptive AI response based on emotion
  const getEmotionalResponse = useCallback((emotion: DetectedEmotion): {
    tone: string;
    encouragement: string;
    pacing: "slower" | "normal" | "faster";
  } => {
    switch (emotion) {
      case "frustrated":
        return {
          tone: "supportive and patient",
          encouragement: "You're doing great! Let's take this step by step. 💪",
          pacing: "slower",
        };
      case "stressed":
        return {
          tone: "calm and reassuring",
          encouragement: "Take a deep breath. There's no rush - you're learning! 🌟",
          pacing: "slower",
        };
      case "tired":
        return {
          tone: "gentle and brief",
          encouragement: "Would you like to take a short break? Rest is important too! 😊",
          pacing: "slower",
        };
      case "excited":
        return {
          tone: "enthusiastic and engaging",
          encouragement: "Love the energy! Let's keep this momentum going! 🚀",
          pacing: "faster",
        };
      case "confident":
        return {
          tone: "challenging and growth-focused",
          encouragement: "Excellent! Ready for something more challenging? 🎯",
          pacing: "normal",
        };
      default:
        return {
          tone: "friendly and encouraging",
          encouragement: "You're making progress! Keep it up! ✨",
          pacing: "normal",
        };
    }
  }, []);

  // Get emotion history for insights
  const getEmotionHistory = useCallback(async () => {
    if (!userId) return [];
    
    const { data } = await supabase
      .from("session_emotions")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(50);
    
    return data || [];
  }, [userId]);

  return {
    emotionState,
    voiceMetrics,
    detectEmotion,
    getEmotionalResponse,
    getEmotionHistory,
    analyzeTextEmotion,
  };
}
