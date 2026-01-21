import { useState, useCallback } from 'react';
import { firecrawlApi, SearchResult } from '@/lib/api/firecrawl';
import { useToast } from '@/hooks/use-toast';

export interface WebSearchState {
  isSearching: boolean;
  results: SearchResult[];
  query: string;
  error: string | null;
}

export const useWebSearch = () => {
  const [state, setState] = useState<WebSearchState>({
    isSearching: false,
    results: [],
    query: '',
    error: null,
  });
  const { toast } = useToast();

  const search = useCallback(async (query: string, options?: { limit?: number; timeFilter?: string }) => {
    if (!query.trim()) return null;

    setState(prev => ({ ...prev, isSearching: true, query, error: null }));

    try {
      const response = await firecrawlApi.search(query, {
        limit: options?.limit || 5,
        tbs: options?.timeFilter,
      });

      if (!response.success) {
        throw new Error(response.error || 'Search failed');
      }

      const results = response.data || [];
      setState(prev => ({ ...prev, isSearching: false, results }));
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setState(prev => ({ ...prev, isSearching: false, error: errorMessage }));
      toast({
        title: 'Search Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const clearResults = useCallback(() => {
    setState({ isSearching: false, results: [], query: '', error: null });
  }, []);

  return {
    ...state,
    search,
    clearResults,
  };
};
