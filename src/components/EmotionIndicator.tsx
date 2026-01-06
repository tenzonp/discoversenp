import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Brain, 
  Zap, 
  TrendingUp,
  Smile,
  Frown,
  Meh,
  AlertTriangle,
  Battery,
  BatteryLow,
  BatteryFull,
  Sparkles
} from "lucide-react";
import { DetectedEmotion } from "@/hooks/useEmotionDetection";
import { cn } from "@/lib/utils";

interface EmotionIndicatorProps {
  emotion: DetectedEmotion;
  confidence: number;
  energy: number;
  sentiment: "positive" | "neutral" | "negative";
  className?: string;
  showDetails?: boolean;
}

const emotionConfig: Record<DetectedEmotion, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
  suggestion: string;
}> = {
  confident: {
    icon: Sparkles,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/20",
    label: "Confident",
    suggestion: "You're doing great! Ready for a challenge?",
  },
  stressed: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bgColor: "bg-amber-500/20",
    label: "Stressed",
    suggestion: "Take a deep breath. You've got this!",
  },
  frustrated: {
    icon: Frown,
    color: "text-red-500",
    bgColor: "bg-red-500/20",
    label: "Frustrated",
    suggestion: "Let's take it step by step.",
  },
  excited: {
    icon: Zap,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/20",
    label: "Excited",
    suggestion: "Love the energy! Let's channel it!",
  },
  tired: {
    icon: BatteryLow,
    color: "text-slate-400",
    bgColor: "bg-slate-400/20",
    label: "Tired",
    suggestion: "Maybe a short break would help?",
  },
  neutral: {
    icon: Meh,
    color: "text-blue-400",
    bgColor: "bg-blue-400/20",
    label: "Focused",
    suggestion: "Good focus! Keep going.",
  },
};

export function EmotionIndicator({ 
  emotion, 
  confidence, 
  energy, 
  sentiment,
  className,
  showDetails = true,
}: EmotionIndicatorProps) {
  const config = emotionConfig[emotion];
  const EmotionIcon = config.icon;
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className={cn("py-3", config.bgColor)}>
        <CardTitle className="flex items-center gap-2 text-sm">
          <EmotionIcon className={cn("w-4 h-4", config.color)} />
          <span className={config.color}>{config.label}</span>
          <Badge variant="outline" className="ml-auto text-xs">
            {sentiment}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      {showDetails && (
        <CardContent className="pt-4 space-y-3">
          {/* Confidence Meter */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Brain className="w-3 h-3" /> Confidence
              </span>
              <span className="font-medium">{Math.round(confidence * 100)}%</span>
            </div>
            <Progress value={confidence * 100} className="h-1.5" />
          </div>
          
          {/* Energy Meter */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" /> Energy
              </span>
              <span className="font-medium">{Math.round(energy * 100)}%</span>
            </div>
            <Progress 
              value={energy * 100} 
              className={cn(
                "h-1.5",
                energy > 0.7 ? "[&>div]:bg-yellow-500" : 
                energy < 0.3 ? "[&>div]:bg-slate-400" : ""
              )} 
            />
          </div>
          
          {/* Suggestion */}
          <p className="text-xs text-muted-foreground italic pt-1 border-t">
            💡 {config.suggestion}
          </p>
        </CardContent>
      )}
    </Card>
  );
}

interface CompactEmotionBadgeProps {
  emotion: DetectedEmotion;
  className?: string;
}

export function CompactEmotionBadge({ emotion, className }: CompactEmotionBadgeProps) {
  const config = emotionConfig[emotion];
  const EmotionIcon = config.icon;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1 text-xs font-normal",
        config.bgColor,
        config.color,
        className
      )}
    >
      <EmotionIcon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
