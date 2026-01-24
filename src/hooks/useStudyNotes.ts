import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SaveNoteParams {
  userId: string;
  title: string;
  content: string;
  subject?: string;
  classLevel?: string;
  tags?: string[];
  sourceMessageId?: string;
}

export function useStudyNotes() {
  const [isSaving, setIsSaving] = useState(false);

  const saveNote = useCallback(async ({
    userId,
    title,
    content,
    subject,
    classLevel,
    tags,
    sourceMessageId
  }: SaveNoteParams) => {
    if (!userId) {
      toast.error('Please log in to save notes');
      return null;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('study_notes')
        .insert({
          user_id: userId,
          title,
          content,
          subject: subject || null,
          class_level: classLevel || null,
          tags: tags || null,
          source_message_id: sourceMessageId || null
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Note saved! 📝');
      return data;
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const generateTitleFromContent = useCallback((content: string): string => {
    // Extract first meaningful line or create summary
    const cleanContent = content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    
    // Get first sentence or first 50 chars
    const firstSentence = cleanContent.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length > 10) {
      return firstSentence.slice(0, 60) + (firstSentence.length > 60 ? '...' : '');
    }
    
    return cleanContent.slice(0, 50) + (cleanContent.length > 50 ? '...' : '');
  }, []);

  const detectSubjectFromContent = useCallback((content: string): string | undefined => {
    const lowerContent = content.toLowerCase();
    
    // Math indicators
    if (/\b(equation|formula|derivative|integral|algebra|geometry|trigonometry|calculus|x\s*=|sin|cos|tan)\b/.test(lowerContent)) {
      return 'Math';
    }
    
    // Physics indicators
    if (/\b(velocity|acceleration|force|energy|momentum|newton|gravity|electric|magnetic|wave|frequency)\b/.test(lowerContent)) {
      return 'Physics';
    }
    
    // Chemistry indicators
    if (/\b(atom|molecule|element|compound|reaction|acid|base|electron|proton|chemical|organic|inorganic)\b/.test(lowerContent)) {
      return 'Chemistry';
    }
    
    // Biology indicators
    if (/\b(cell|dna|rna|protein|enzyme|organism|species|evolution|photosynthesis|respiration)\b/.test(lowerContent)) {
      return 'Biology';
    }
    
    return undefined;
  }, []);

  return {
    saveNote,
    isSaving,
    generateTitleFromContent,
    detectSubjectFromContent
  };
}
