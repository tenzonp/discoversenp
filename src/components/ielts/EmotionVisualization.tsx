import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Heart, Zap, Brain, Activity } from "lucide-react";

interface EmotionMetrics {
  confidence: number;
  energy: number;
  stress: number;
  engagement: number;
}

interface EmotionVisualizationProps {
  metrics: EmotionMetrics;
  isActive: boolean;
  isSpeaking: boolean;
}

const EmotionVisualization = ({ metrics, isActive, isSpeaking }: EmotionVisualizationProps) => {
  const [animatedMetrics, setAnimatedMetrics] = useState(metrics);
  
  // Smooth animation for metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedMetrics(prev => ({
        confidence: prev.confidence + (metrics.confidence - prev.confidence) * 0.2,
        energy: prev.energy + (metrics.energy - prev.energy) * 0.3,
        stress: prev.stress + (metrics.stress - prev.stress) * 0.2,
        engagement: prev.engagement + (metrics.engagement - prev.engagement) * 0.2,
      }));
    }, 50);
    return () => clearInterval(interval);
  }, [metrics]);

  const getConfidenceColor = (value: number) => {
    if (value >= 70) return "text-emerald-500";
    if (value >= 40) return "text-amber-500";
    return "text-rose-500";
  };

  const getEnergyColor = (value: number) => {
    if (value >= 60) return "text-purple-500";
    if (value >= 30) return "text-blue-500";
    return "text-slate-400";
  };

  const getStressColor = (value: number) => {
    if (value >= 70) return "text-rose-500";
    if (value >= 40) return "text-amber-500";
    return "text-emerald-500";
  };

  return (
    <div className={cn(
      "p-4 rounded-2xl border transition-all duration-300",
      isActive ? "bg-card border-primary/30" : "bg-secondary/50 border-transparent"
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Activity className={cn("w-4 h-4", isActive && isSpeaking && "animate-pulse text-primary")} />
          Live Emotion Analysis
        </h3>
        {isActive && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 animate-pulse">
            Analyzing
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Confidence */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-1.5">
            <Heart className={cn("w-4 h-4", getConfidenceColor(animatedMetrics.confidence))} />
            <span className="text-xs font-medium">Confidence</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-300", 
                animatedMetrics.confidence >= 70 ? "bg-emerald-500" :
                animatedMetrics.confidence >= 40 ? "bg-amber-500" : "bg-rose-500"
              )}
              style={{ width: `${animatedMetrics.confidence}%` }}
            />
          </div>
          <span className={cn("text-xs font-bold mt-1 block", getConfidenceColor(animatedMetrics.confidence))}>
            {Math.round(animatedMetrics.confidence)}%
          </span>
        </div>

        {/* Energy */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className={cn("w-4 h-4", getEnergyColor(animatedMetrics.energy))} />
            <span className="text-xs font-medium">Energy</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-300",
                animatedMetrics.energy >= 60 ? "bg-purple-500" :
                animatedMetrics.energy >= 30 ? "bg-blue-500" : "bg-slate-400"
              )}
              style={{ width: `${animatedMetrics.energy}%` }}
            />
          </div>
          <span className={cn("text-xs font-bold mt-1 block", getEnergyColor(animatedMetrics.energy))}>
            {Math.round(animatedMetrics.energy)}%
          </span>
        </div>

        {/* Stress */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-1.5">
            <Brain className={cn("w-4 h-4", getStressColor(animatedMetrics.stress))} />
            <span className="text-xs font-medium">Stress</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-300",
                animatedMetrics.stress >= 70 ? "bg-rose-500" :
                animatedMetrics.stress >= 40 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${animatedMetrics.stress}%` }}
            />
          </div>
          <span className={cn("text-xs font-bold mt-1 block", getStressColor(animatedMetrics.stress))}>
            {Math.round(animatedMetrics.stress)}%
          </span>
        </div>

        {/* Engagement */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-1.5">
            <Activity className={cn("w-4 h-4 text-blue-500", isActive && isSpeaking && "animate-pulse")} />
            <span className="text-xs font-medium">Engagement</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${animatedMetrics.engagement}%` }}
            />
          </div>
          <span className="text-xs font-bold mt-1 block text-blue-500">
            {Math.round(animatedMetrics.engagement)}%
          </span>
        </div>
      </div>

      {/* Live Waveform */}
      {isActive && (
        <div className="mt-4 flex items-center justify-center gap-0.5 h-8">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all",
                isSpeaking ? "bg-primary" : "bg-muted-foreground/30"
              )}
              style={{
                height: isSpeaking 
                  ? `${Math.sin((Date.now() / 100 + i) * 0.5) * 10 + (animatedMetrics.energy / 5) + 4}px`
                  : "4px",
                animationDelay: `${i * 30}ms`,
                transition: "height 50ms ease-out"
              }}
            />
          ))}
        </div>
      )}

      {/* Feedback tips based on metrics */}
      <div className="mt-3 text-xs text-muted-foreground">
        {animatedMetrics.stress > 60 ? (
          <p className="text-amber-600 dark:text-amber-400">💡 Take a deep breath - you're doing great!</p>
        ) : animatedMetrics.confidence > 70 && animatedMetrics.energy > 50 ? (
          <p className="text-emerald-600 dark:text-emerald-400">✨ Excellent flow! Keep up this energy!</p>
        ) : animatedMetrics.energy < 30 ? (
          <p className="text-blue-600 dark:text-blue-400">💬 Try speaking with more expression!</p>
        ) : null}
      </div>
    </div>
  );
};

export default EmotionVisualization;
