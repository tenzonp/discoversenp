import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  isDue: boolean;
}

// SM-2 Spaced Repetition Algorithm
const calculateNextReview = (
  quality: number, // 0-5, where 5 is perfect recall
  easeFactor: number,
  interval: number,
  repetitions: number
): { newInterval: number; newEaseFactor: number; newRepetitions: number } => {
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);

  let newInterval: number;
  let newRepetitions: number;

  if (quality < 3) {
    // Failed - reset
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = repetitions + 1;
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  return { newInterval, newEaseFactor, newRepetitions };
};

export function useFlashcards(userId: string | undefined, category?: string) {
  const [flashcards, setFlashcards] = useState<FlashcardWithProgress[]>([]);
  const [dueCards, setDueCards] = useState<FlashcardWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFlashcards = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data: cards, error: cardsError } = await query;
      if (cardsError) throw cardsError;

      // Get progress for all cards
      const { data: progress, error: progressError } = await supabase
        .from('flashcard_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) throw progressError;

      const today = new Date().toISOString().split('T')[0];
      const progressMap = new Map(progress?.map(p => [p.flashcard_id, p]) || []);

      const cardsWithProgress: FlashcardWithProgress[] = (cards || []).map(card => {
        const cardProgress = progressMap.get(card.id);
        const isDue = !cardProgress || cardProgress.next_review_date <= today;
        return {
          ...card,
          progress: cardProgress,
          isDue
        };
      });

      setFlashcards(cardsWithProgress);
      setDueCards(cardsWithProgress.filter(c => c.isDue));
    } catch (error) {
      console.error('Error loading flashcards:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, category]);

  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  const createFlashcard = useCallback(async (front: string, back: string, cardCategory?: string) => {
    if (!userId) {
      toast.error('Please log in to create flashcards');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          user_id: userId,
          front,
          back,
          category: cardCategory || category || 'general'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Flashcard created! 📚');
      loadFlashcards();
      return data;
    } catch (error) {
      console.error('Error creating flashcard:', error);
      toast.error('Failed to create flashcard');
      return null;
    }
  }, [userId, category, loadFlashcards]);

  const reviewCard = useCallback(async (flashcardId: string, quality: number) => {
    if (!userId) return;

    try {
      // Get current progress
      const { data: existingProgress } = await supabase
        .from('flashcard_progress')
        .select('*')
        .eq('flashcard_id', flashcardId)
        .eq('user_id', userId)
        .single();

      const currentEase = existingProgress?.ease_factor || 2.5;
      const currentInterval = existingProgress?.interval_days || 0;
      const currentReps = existingProgress?.repetitions || 0;

      const { newInterval, newEaseFactor, newRepetitions } = calculateNextReview(
        quality,
        currentEase,
        currentInterval,
        currentReps
      );

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + newInterval);

      if (existingProgress) {
        await supabase
          .from('flashcard_progress')
          .update({
            ease_factor: newEaseFactor,
            interval_days: newInterval,
            repetitions: newRepetitions,
            next_review_date: nextDate.toISOString().split('T')[0],
            last_reviewed_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);
      } else {
        await supabase
          .from('flashcard_progress')
          .insert({
            user_id: userId,
            flashcard_id: flashcardId,
            ease_factor: newEaseFactor,
            interval_days: newInterval,
            repetitions: newRepetitions,
            next_review_date: nextDate.toISOString().split('T')[0],
            last_reviewed_at: new Date().toISOString()
          });
      }

      loadFlashcards();
    } catch (error) {
      console.error('Error reviewing card:', error);
      toast.error('Failed to save review');
    }
  }, [userId, loadFlashcards]);

  const deleteFlashcard = useCallback(async (flashcardId: string) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', flashcardId);

      if (error) throw error;
      
      setFlashcards(prev => prev.filter(f => f.id !== flashcardId));
      toast.success('Flashcard deleted');
    } catch (error) {
      toast.error('Failed to delete flashcard');
    }
  }, []);

  const createFromNote = useCallback(async (noteContent: string, noteTitle: string, noteSubject?: string) => {
    // Auto-generate Q&A from note content
    const front = noteTitle || noteContent.slice(0, 100) + '...';
    const back = noteContent;
    return createFlashcard(front, back, noteSubject);
  }, [createFlashcard]);

  return {
    flashcards,
    dueCards,
    isLoading,
    createFlashcard,
    createFromNote,
    reviewCard,
    deleteFlashcard,
    loadFlashcards
  };
}
