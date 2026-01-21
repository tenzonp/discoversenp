import { ExternalLink, Globe, Clock, X } from "lucide-react";
import { SearchResult } from "@/lib/api/firecrawl";
import { cn } from "@/lib/utils";

interface WebSearchResultsProps {
  results: SearchResult[];
  query: string;
  isSearching: boolean;
  onClose: () => void;
  onSelectResult?: (result: SearchResult) => void;
}

const WebSearchResults = ({ 
  results, 
  query, 
  isSearching, 
  onClose,
  onSelectResult 
}: WebSearchResultsProps) => {
  if (!isSearching && results.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {isSearching ? 'Searching...' : `Results for "${query}"`}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="px-4 py-8 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Fetching real-time results...</p>
        </div>
      )}

      {/* Results */}
      {!isSearching && results.length > 0 && (
        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {results.map((result, index) => (
            <div 
              key={index}
              className={cn(
                "px-4 py-3 hover:bg-secondary/50 transition-colors cursor-pointer group",
              )}
              onClick={() => onSelectResult?.(result)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {result.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {result.url}
                  </p>
                  {result.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {result.description}
                    </p>
                  )}
                </div>
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-primary/10 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-primary" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isSearching && results.length === 0 && query && (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
        </div>
      )}

      {/* Footer */}
      {!isSearching && results.length > 0 && (
        <div className="px-4 py-2 border-t border-border bg-secondary/20">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Real-time results powered by Firecrawl
          </p>
        </div>
      )}
    </div>
  );
};

export default WebSearchResults;
