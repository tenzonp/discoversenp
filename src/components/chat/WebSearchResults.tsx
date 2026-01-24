import { ExternalLink, Globe, Clock, X, Sparkles, Search } from "lucide-react";
import { SearchResult } from "@/lib/api/firecrawl";
import { cn } from "@/lib/utils";
import { TIME_FILTER_LABELS, TIME_FILTER_LABELS_NE } from "@/hooks/useWebSearch";

interface WebSearchResultsProps {
  results: SearchResult[];
  query: string;
  isSearching: boolean;
  activeTimeFilter?: string;
  onClose: () => void;
  onSelectResult?: (result: SearchResult) => void;
}

const WebSearchResults = ({ 
  results, 
  query, 
  isSearching, 
  activeTimeFilter = 'qdr:d',
  onClose,
  onSelectResult 
}: WebSearchResultsProps) => {
  if (!isSearching && results.length === 0) return null;

  const timeLabel = TIME_FILTER_LABELS[activeTimeFilter] || 'Today';
  const timeLabelNe = TIME_FILTER_LABELS_NE[activeTimeFilter] || 'आज';

  return (
    <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Globe className="w-4 h-4 text-primary" />
            {isSearching && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-ping" />
            )}
          </div>
          <span className="text-sm font-medium">
            {isSearching ? 'Discoverse Search...' : `"${query}"`}
          </span>
          {!isSearching && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              {timeLabel}
            </span>
          )}
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Animated Loading State */}
      {isSearching && (
        <div className="px-4 py-8 flex flex-col items-center gap-4">
          {/* Animated Search Icon */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Search className="w-8 h-8 text-primary animate-pulse" />
            </div>
            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-teal" />
            </div>
          </div>

          {/* Animated Text */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-foreground animate-pulse">
              Discoverse le khojdai cha...
            </p>
            <div className="flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-xs font-medium">
            <Sparkles className="w-3 h-3 animate-pulse" />
            Live • {timeLabelNe}
          </span>
        </div>
      )}

      {/* Results */}
      {!isSearching && results.length > 0 && (
        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {results.map((result, index) => (
            <div 
              key={index}
              className={cn(
                "px-4 py-3 hover:bg-secondary/50 transition-all cursor-pointer group",
                "animate-in fade-in slide-in-from-bottom-2",
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onSelectResult?.(result)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
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
          <p className="text-sm text-muted-foreground">"{query}" ko lagi kei payena</p>
        </div>
      )}

      {/* Footer */}
      {!isSearching && results.length > 0 && (
        <div className="px-4 py-2 border-t border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span className="font-medium text-primary">Discoverse</span> le {timeLabelNe} ko data lyayo 🔍
          </p>
        </div>
      )}
    </div>
  );
};

export default WebSearchResults;
