import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  subcategory?: string;
  keywords?: string[];
  upvotes?: number;
  verified?: boolean;
  contributed_by?: string;
  created_at: string;
}

export function useJugaadKnowledge(userId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<KnowledgeEntry[]>([]);

  // Search knowledge base for relevant answers
  const searchKnowledge = useCallback(async (query: string, category?: string): Promise<KnowledgeEntry[]> => {
    if (!query.trim()) return [];
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('search_nepal_knowledge', {
          search_query: query,
          category_filter: category || null
        });

      if (error) throw error;
      
      setResults(data || []);
      return data || [];
    } catch (error) {
      console.error('Error searching knowledge:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Contribute new knowledge
  const contributeKnowledge = useCallback(async ({
    question,
    answer,
    category,
    subcategory,
    keywords
  }: {
    question: string;
    answer: string;
    category: string;
    subcategory?: string;
    keywords?: string[];
  }) => {
    if (!userId) {
      toast.error('Login garera contribute gara 🙏');
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('nepal_knowledge_base')
        .insert({
          question,
          answer,
          category,
          subcategory: subcategory || null,
          keywords: keywords || [],
          contributed_by: userId,
          verified: false,
          upvotes: 0
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Knowledge contribute bhayo! 🙏', {
        description: 'Review pachi verify huncha'
      });
      return data;
    } catch (error) {
      console.error('Error contributing knowledge:', error);
      toast.error('Contribute garna sakiyena');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Upvote helpful knowledge
  const upvoteKnowledge = useCallback(async (id: string) => {
    try {
      // First get current upvotes
      const { data: current, error: fetchError } = await supabase
        .from('nepal_knowledge_base')
        .select('upvotes')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('nepal_knowledge_base')
        .update({ upvotes: (current?.upvotes || 0) + 1 })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Thanks for the feedback! 👍');
      return true;
    } catch (error) {
      console.error('Error upvoting:', error);
      return false;
    }
  }, []);

  // Get knowledge by category for browsing
  const getByCategory = useCallback(async (category: string, limit = 10): Promise<KnowledgeEntry[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('nepal_knowledge_base')
        .select('*')
        .eq('category', category)
        .order('upvotes', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching category:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get popular/trending knowledge
  const getPopular = useCallback(async (limit = 10): Promise<KnowledgeEntry[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('nepal_knowledge_base')
        .select('*')
        .eq('verified', true)
        .order('upvotes', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching popular:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Build context string from knowledge results for AI
  const buildKnowledgeContext = useCallback((entries: KnowledgeEntry[]): string => {
    if (!entries.length) return '';
    
    return `\n\n📚 NEPAL KNOWLEDGE BASE (Verified local knowledge):\n${entries.map((e, i) => 
      `${i + 1}. Q: ${e.question}\n   A: ${e.answer}${e.verified ? ' ✅ Verified' : ''}`
    ).join('\n\n')}`;
  }, []);

  return {
    isLoading,
    results,
    searchKnowledge,
    contributeKnowledge,
    upvoteKnowledge,
    getByCategory,
    getPopular,
    buildKnowledgeContext
  };
}
