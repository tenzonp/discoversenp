import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  created_at: string;
}

interface FlashcardProgress {
  id: string;
  flashcard_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  last_reviewed_at: string | null;
}

interface FlashcardWithProgress extends Flashcard {
  progress?: FlashcardProgress;
}

export function useFlashcards() {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<FlashcardWithProgress[]>([]);
  const [dueCards, setDueCards] = useState<FlashcardWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFlashcards = useCallback(async () => {
    if (!user) {
      setFlashcards([]);
      setDueCards([]);
      setLoading(false);
      return;
    }

    try {
      // Load user's flashcards
      const { data: cards } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Load progress for each card
      const { data: progress } = await supabase
        .from("flashcard_progress")
        .select("*")
        .eq("user_id", user.id);

      const progressMap = new Map(progress?.map(p => [p.flashcard_id, p]) || []);
      
      const cardsWithProgress: FlashcardWithProgress[] = (cards || []).map(card => ({
        ...card,
        progress: progressMap.get(card.id),
      }));

      setFlashcards(cardsWithProgress);

      // Calculate due cards (next_review_date <= today or no progress yet)
      const today = new Date().toISOString().split("T")[0];
      const due = cardsWithProgress.filter(card => {
        if (!card.progress) return true;
        return card.progress.next_review_date <= today;
      });

      setDueCards(due);
    } catch (error) {
      console.error("Error loading flashcards:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  const createFlashcard = useCallback(async (front: string, back: string, category: string = "general") => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("flashcards")
        .insert({
          user_id: user.id,
          front,
          back,
          category,
        })
        .select()
        .single();

      if (error) throw error;

      await loadFlashcards();
      return data;
    } catch (error) {
      console.error("Error creating flashcard:", error);
      return null;
    }
  }, [user, loadFlashcards]);

  const deleteFlashcard = useCallback(async (id: string) => {
    if (!user) return;

    try {
      await supabase
        .from("flashcards")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      await loadFlashcards();
    } catch (error) {
      console.error("Error deleting flashcard:", error);
    }
  }, [user, loadFlashcards]);

  // SM-2 Algorithm implementation
  const reviewCard = useCallback(async (flashcardId: string, quality: number) => {
    // quality: 0-5 (0-2 = fail, 3-5 = pass)
    if (!user) return;

    try {
      const { data: existingProgress } = await supabase
        .from("flashcard_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("flashcard_id", flashcardId)
        .single();

      let easeFactor = existingProgress?.ease_factor || 2.5;
      let interval = existingProgress?.interval_days || 0;
      let repetitions = existingProgress?.repetitions || 0;

      if (quality < 3) {
        // Failed - reset
        repetitions = 0;
        interval = 0;
      } else {
        // Passed - apply SM-2
        if (repetitions === 0) {
          interval = 1;
        } else if (repetitions === 1) {
          interval = 6;
        } else {
          interval = Math.round(interval * easeFactor);
        }
        repetitions += 1;
      }

      // Update ease factor
      easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + interval);

      if (existingProgress) {
        await supabase
          .from("flashcard_progress")
          .update({
            ease_factor: easeFactor,
            interval_days: interval,
            repetitions,
            next_review_date: nextReviewDate.toISOString().split("T")[0],
            last_reviewed_at: new Date().toISOString(),
          })
          .eq("id", existingProgress.id);
      } else {
        await supabase
          .from("flashcard_progress")
          .insert({
            user_id: user.id,
            flashcard_id: flashcardId,
            ease_factor: easeFactor,
            interval_days: interval,
            repetitions,
            next_review_date: nextReviewDate.toISOString().split("T")[0],
            last_reviewed_at: new Date().toISOString(),
          });
      }

      await loadFlashcards();
    } catch (error) {
      console.error("Error reviewing card:", error);
    }
  }, [user, loadFlashcards]);

  return {
    flashcards,
    dueCards,
    loading,
    createFlashcard,
    deleteFlashcard,
    reviewCard,
    refresh: loadFlashcards,
  };
}
