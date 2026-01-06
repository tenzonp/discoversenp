import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MistakePattern {
  id: string;
  mistake_type: string;
  mistake_text: string;
  correction: string | null;
  frequency: number;
  context: string | null;
  detected_at: string;
}

interface MistakeInsight {
  type: string;
  count: number;
  examples: string[];
  suggestion: string;
  priority: "high" | "medium" | "low";
}

export function useMistakeTracker(userId: string | undefined) {
  const [mistakes, setMistakes] = useState<MistakePattern[]>([]);
  const [insights, setInsights] = useState<MistakeInsight[]>([]);
  const [loading, setLoading] = useState(false);

  // Load mistakes from database
  const loadMistakes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    
    const { data } = await supabase
      .from("mistake_patterns")
      .select("*")
      .eq("user_id", userId)
      .order("frequency", { ascending: false })
      .limit(100);
    
    if (data) {
      setMistakes(data);
      generateInsights(data);
    }
    setLoading(false);
  }, [userId]);

  // Track a new mistake
  const trackMistake = useCallback(async (
    mistakeType: string,
    mistakeText: string,
    correction?: string,
    context?: string,
  ) => {
    if (!userId) return;
    
    // Check if this mistake already exists
    const existing = mistakes.find(
      m => m.mistake_type === mistakeType && 
           m.mistake_text.toLowerCase() === mistakeText.toLowerCase()
    );
    
    if (existing) {
      // Increment frequency
      await supabase
        .from("mistake_patterns")
        .update({ 
          frequency: existing.frequency + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Insert new mistake
      await supabase.from("mistake_patterns").insert({
        user_id: userId,
        mistake_type: mistakeType,
        mistake_text: mistakeText,
        correction: correction,
        context: context,
      });
    }
    
    await loadMistakes();
  }, [userId, mistakes, loadMistakes]);

  // Extract mistakes from AI feedback
  const extractMistakesFromFeedback = useCallback((
    feedback: string,
    userText: string,
    context?: string,
  ) => {
    const mistakePatterns: Array<{ type: string; text: string; correction?: string }> = [];
    
    // Grammar patterns
    const grammarIndicators = [
      "grammatically", "should be", "instead of", "correct form is",
      "grammar", "verb tense", "subject-verb", "article"
    ];
    
    // Vocabulary patterns
    const vocabIndicators = [
      "better word", "synonym", "vocabulary", "word choice",
      "precise word", "appropriate term", "use 'X' instead"
    ];
    
    // Pronunciation hints in text
    const pronunIndicators = [
      "pronunciation", "pronounce", "stress", "intonation"
    ];
    
    const feedbackLower = feedback.toLowerCase();
    
    // Detect grammar mistakes
    if (grammarIndicators.some(g => feedbackLower.includes(g))) {
      // Try to extract the specific mistake
      const shouldBeMatch = feedback.match(/["']([^"']+)["']\s*(?:should be|instead of)\s*["']([^"']+)["']/i);
      if (shouldBeMatch) {
        mistakePatterns.push({
          type: "grammar",
          text: shouldBeMatch[1],
          correction: shouldBeMatch[2],
        });
      } else {
        // Generic grammar tracking
        mistakePatterns.push({
          type: "grammar",
          text: feedback.slice(0, 100),
        });
      }
    }
    
    // Detect vocabulary issues
    if (vocabIndicators.some(v => feedbackLower.includes(v))) {
      mistakePatterns.push({
        type: "vocabulary",
        text: feedback.slice(0, 100),
      });
    }
    
    // Detect pronunciation issues
    if (pronunIndicators.some(p => feedbackLower.includes(p))) {
      mistakePatterns.push({
        type: "pronunciation",
        text: feedback.slice(0, 100),
      });
    }
    
    // Track each detected mistake
    mistakePatterns.forEach(m => {
      trackMistake(m.type, m.text, m.correction, context);
    });
    
    return mistakePatterns;
  }, [trackMistake]);

  // Generate insights from mistake patterns
  const generateInsights = useCallback((data: MistakePattern[]) => {
    const typeGroups: Record<string, MistakePattern[]> = {};
    
    data.forEach(m => {
      if (!typeGroups[m.mistake_type]) {
        typeGroups[m.mistake_type] = [];
      }
      typeGroups[m.mistake_type].push(m);
    });
    
    const newInsights: MistakeInsight[] = [];
    
    Object.entries(typeGroups).forEach(([type, patterns]) => {
      const totalFrequency = patterns.reduce((sum, p) => sum + p.frequency, 0);
      const examples = patterns.slice(0, 3).map(p => p.mistake_text.slice(0, 50));
      
      let suggestion = "";
      let priority: "high" | "medium" | "low" = "low";
      
      if (totalFrequency > 10) {
        priority = "high";
      } else if (totalFrequency > 5) {
        priority = "medium";
      }
      
      switch (type) {
        case "grammar":
          suggestion = "Practice verb tenses and sentence structure. Try writing 5 sentences daily focusing on this pattern.";
          break;
        case "vocabulary":
          suggestion = "Expand your vocabulary by learning 3 new words daily. Use flashcards to review.";
          break;
        case "pronunciation":
          suggestion = "Listen to native speakers and practice shadowing. Record yourself to compare.";
          break;
        case "fluency":
          suggestion = "Practice speaking for 2 minutes without stopping. Focus on filler words like 'um' and 'uh'.";
          break;
        default:
          suggestion = "Review your mistakes and practice regularly.";
      }
      
      newInsights.push({
        type,
        count: totalFrequency,
        examples,
        suggestion,
        priority,
      });
    });
    
    // Sort by priority
    newInsights.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    setInsights(newInsights);
  }, []);

  // Get weak areas for user preferences
  const getWeakAreas = useCallback((): string[] => {
    return insights
      .filter(i => i.priority === "high" || i.priority === "medium")
      .map(i => i.type);
  }, [insights]);

  // Clear old mistakes (optional cleanup)
  const clearOldMistakes = useCallback(async (olderThanDays: number = 90) => {
    if (!userId) return;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    await supabase
      .from("mistake_patterns")
      .delete()
      .eq("user_id", userId)
      .lt("detected_at", cutoffDate.toISOString());
    
    await loadMistakes();
  }, [userId, loadMistakes]);

  useEffect(() => {
    if (userId) {
      loadMistakes();
    }
  }, [userId, loadMistakes]);

  return {
    mistakes,
    insights,
    loading,
    trackMistake,
    extractMistakesFromFeedback,
    getWeakAreas,
    loadMistakes,
    clearOldMistakes,
  };
}
