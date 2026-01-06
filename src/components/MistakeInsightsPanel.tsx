import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  TrendingUp, 
  BookOpen,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Target,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MistakeInsight {
  type: string;
  count: number;
  examples: string[];
  suggestion: string;
  priority: "high" | "medium" | "low";
}

interface MistakePattern {
  id: string;
  mistake_type: string;
  mistake_text: string;
  correction: string | null;
  frequency: number;
}

interface MistakeInsightsPanelProps {
  insights: MistakeInsight[];
  mistakes?: MistakePattern[];
  className?: string;
  compact?: boolean;
}

const priorityConfig = {
  high: {
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    icon: AlertTriangle,
  },
  medium: {
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: Target,
  },
  low: {
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: Lightbulb,
  },
};

const typeIcons: Record<string, React.ElementType> = {
  grammar: BookOpen,
  vocabulary: Lightbulb,
  pronunciation: TrendingUp,
  fluency: Target,
};

export function MistakeInsightsPanel({ 
  insights, 
  mistakes = [],
  className,
  compact = false,
}: MistakeInsightsPanelProps) {
  const [expandedType, setExpandedType] = useState<string | null>(null);
  
  if (insights.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
          <p className="text-muted-foreground">No recurring mistakes detected yet!</p>
          <p className="text-xs text-muted-foreground mt-1">Keep practicing to track your patterns.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-4 h-4 text-primary" />
          Learning Insights
        </CardTitle>
        <CardDescription>
          AI-detected patterns from your sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const config = priorityConfig[insight.priority];
          const TypeIcon = typeIcons[insight.type] || BookOpen;
          const isExpanded = expandedType === insight.type;
          
          return (
            <div
              key={insight.type}
              className={cn(
                "rounded-lg border p-3 transition-all",
                config.bgColor,
                config.borderColor,
              )}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedType(isExpanded ? null : insight.type)}
                className="w-full flex items-center gap-2"
              >
                <TypeIcon className={cn("w-4 h-4", config.color)} />
                <span className="font-medium capitalize flex-1 text-left">
                  {insight.type}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {insight.count}x
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {/* Priority indicator */}
              <div className="mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <config.icon className={cn("w-3 h-3", config.color)} />
                  <span className={config.color}>
                    {insight.priority === "high" ? "Needs attention" :
                     insight.priority === "medium" ? "Worth improving" : "Minor issue"}
                  </span>
                </div>
              </div>
              
              {/* Expanded content */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
                  {/* Examples */}
                  {insight.examples.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Examples:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {insight.examples.map((ex, i) => (
                          <li key={i} className="truncate">• {ex}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Suggestion */}
                  <div className="bg-background/50 p-2 rounded-md">
                    <p className="text-xs font-medium mb-1 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-500" />
                      Suggestion:
                    </p>
                    <p className="text-xs text-muted-foreground">{insight.suggestion}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Summary */}
        {!compact && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Focus on <span className="font-medium text-foreground">
                {insights.filter(i => i.priority === "high").length} high-priority
              </span> areas first
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CompactMistakesBadgeProps {
  insights: MistakeInsight[];
  className?: string;
}

export function CompactMistakesBadge({ insights, className }: CompactMistakesBadgeProps) {
  const highPriority = insights.filter(i => i.priority === "high").length;
  
  if (insights.length === 0) return null;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1 text-xs",
        highPriority > 0 ? "border-red-500/50 text-red-500" : "border-amber-500/50 text-amber-500",
        className
      )}
    >
      <AlertTriangle className="w-3 h-3" />
      {insights.length} pattern{insights.length !== 1 ? "s" : ""}
    </Badge>
  );
}
