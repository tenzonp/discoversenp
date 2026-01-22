import { useState, useCallback, useRef } from 'react';
import { firecrawlApi, SearchResult } from '@/lib/api/firecrawl';
import { useToast } from '@/hooks/use-toast';

export interface WebSearchState {
  isSearching: boolean;
  results: SearchResult[];
  query: string;
  error: string | null;
}

// Cache structure: query -> { results, timestamp }
interface CacheEntry {
  results: SearchResult[];
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Patterns that indicate real-time/current info is needed
const REALTIME_PATTERNS = [
  // Time-sensitive queries
  /\b(today|aaj|aajako|hija|bholi|ahile|now|current|latest|recent|new|breaking)\b/i,
  /\b(news|samachar|khabar|update)\b/i,
  /\b(price|rate|cost|amount|paisa|rupees?|rs\.?|npr)\b/i,
  /\b(weather|mausam|temperature|barsha|rain|hot|cold)\b/i,
  /\b(score|match|game|khel|cricket|football|ipl|world cup)\b/i,
  /\b(stock|share|nifty|sensex|nepse)\b/i,
  /\b(who is|ko ho|kasari|how to|kaha|where|when|kahile)\b/i,
  /\b(prime minister|president|minister|mantri|sarkar|government)\b/i,
  /\b(election|chunab|vote|nirbachan)\b/i,
  /\b(trending|viral|popular|top)\b/i,
  /\b(release|launch|announce|announced)\b/i,
  /\b(result|nateeja|outcome)\b/i,
  /\b(live|happening|ongoing)\b/i,
  // Location-specific queries (often need current data)
  /\b(kathmandu|nepal|pokhara|biratnagar|lalitpur|bhaktapur)\b/i,
  // Event/time markers
  /\b(2024|2025|2026|2080|2081|2082|2083)\b/i,
  /\b(this week|this month|this year|yo hapta|yo mahina|yo barsa)\b/i,
];

// Check if query needs real-time web search
export const shouldAutoSearch = (message: string): boolean => {
  const trimmed = message.trim().toLowerCase();
  
  // Skip very short messages
  if (trimmed.length < 10) return false;
  
  // Skip greetings and casual chat
  const casualPatterns = /^(hi|hello|hey|namaste|namaskar|k cha|kasto cha|thank|dhanyabad|bye|alvida|ok|okay|huss|ho|chaina|cha|ramro|sahi)/i;
  if (casualPatterns.test(trimmed)) return false;
  
  // Check if any real-time pattern matches
  return REALTIME_PATTERNS.some(pattern => pattern.test(message));
};

export const useWebSearch = () => {
  const [state, setState] = useState<WebSearchState>({
    isSearching: false,
    results: [],
    query: '',
    error: null,
  });
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const { toast } = useToast();

  // Normalize query for cache key
  const normalizeQuery = (query: string): string => {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  // Check cache for valid entry
  const getCachedResults = useCallback((query: string): SearchResult[] | null => {
    const key = normalizeQuery(query);
    const cached = cacheRef.current.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Using cached results for:', key);
      return cached.results;
    }
    
    // Clean up expired entry
    if (cached) {
      cacheRef.current.delete(key);
    }
    
    return null;
  }, []);

  // Add results to cache
  const cacheResults = useCallback((query: string, results: SearchResult[]) => {
    const key = normalizeQuery(query);
    cacheRef.current.set(key, { results, timestamp: Date.now() });
    
    // Limit cache size to 20 entries
    if (cacheRef.current.size > 20) {
      const firstKey = cacheRef.current.keys().next().value;
      if (firstKey) cacheRef.current.delete(firstKey);
    }
  }, []);

  const search = useCallback(async (query: string, options?: { limit?: number; timeFilter?: string; skipCache?: boolean }) => {
    if (!query.trim()) return null;

    // Check cache first (unless skipCache is true)
    if (!options?.skipCache) {
      const cached = getCachedResults(query);
      if (cached) {
        setState(prev => ({ ...prev, isSearching: false, query, results: cached, error: null }));
        return cached;
      }
    }

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
      
      // Cache the results
      cacheResults(query, results);
      
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
  }, [toast, getCachedResults, cacheResults]);

  const clearResults = useCallback(() => {
    setState({ isSearching: false, results: [], query: '', error: null });
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    ...state,
    search,
    clearResults,
    clearCache,
    shouldAutoSearch,
  };
};
