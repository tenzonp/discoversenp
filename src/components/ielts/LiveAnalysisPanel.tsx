import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Zap } from "lucide-react";

interface LiveScore {
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
  overall: number;
  mistakes: string[];
}

interface LiveAnalysisPanelProps {
  liveScore: LiveScore;
  isListening: boolean;
  transcript: string;
  wordCount: number;
  speakingDuration: number;
}

const ScoreBar = ({ label, score, color }: { label: string; score: number; color: string }) => {
  const getScoreIcon = () => {
    if (score >= 75) return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (score >= 50) return <Minus className="w-3 h-3 text-amber-500" />;
    return <TrendingDown className="w-3 h-3 text-red-500" />;
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1">
          {getScoreIcon()}
          <span className="font-semibold">{Math.round(score)}</span>
        </div>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
};

const LiveAnalysisPanel = ({
  liveScore,
  isListening,
  transcript,
  wordCount,
  speakingDuration,
}: LiveAnalysisPanelProps) => {
  const wordsPerMinute = speakingDuration > 0 ? Math.round((wordCount / speakingDuration) * 60) : 0;
  const fluencyStatus = wordsPerMinute >= 120 ? "Great pace!" : wordsPerMinute >= 80 ? "Good" : "Speak naturally";

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      {/* Overall Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
            liveScore.overall >= 70 ? "bg-emerald-500/20 text-emerald-600" :
            liveScore.overall >= 50 ? "bg-amber-500/20 text-amber-600" :
            "bg-red-500/20 text-red-600"
          )}>
            {Math.round(liveScore.overall)}
          </div>
          <div>
            <p className="font-semibold text-sm">Live Score</p>
            <p className="text-xs text-muted-foreground">
              Band ~{(liveScore.overall / 100 * 9).toFixed(1)}
            </p>
          </div>
        </div>
        
        {isListening && (
          <div className="flex items-center gap-1 text-xs text-emerald-500 animate-pulse">
            <Zap className="w-3 h-3" />
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-lg bg-secondary">
          <div className="font-semibold text-foreground">{wordCount}</div>
          <div className="text-muted-foreground">Words</div>
        </div>
        <div className="p-2 rounded-lg bg-secondary">
          <div className="font-semibold text-foreground">{wordsPerMinute}</div>
          <div className="text-muted-foreground">WPM</div>
        </div>
        <div className="p-2 rounded-lg bg-secondary">
          <div className="font-semibold text-foreground">{Math.round(speakingDuration)}s</div>
          <div className="text-muted-foreground">Time</div>
        </div>
      </div>

      {/* Score Bars */}
      <div className="space-y-3">
        <ScoreBar label="Fluency" score={liveScore.fluency} color="bg-blue-500" />
        <ScoreBar label="Vocabulary" score={liveScore.vocabulary} color="bg-purple-500" />
        <ScoreBar label="Grammar" score={liveScore.grammar} color="bg-emerald-500" />
        <ScoreBar label="Pronunciation" score={liveScore.pronunciation} color="bg-amber-500" />
      </div>

      {/* Live Mistakes */}
      {liveScore.mistakes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            Areas to improve:
          </p>
          <div className="space-y-1">
            {liveScore.mistakes.map((mistake, i) => (
              <div
                key={i}
                className="text-xs p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border-l-2 border-amber-500"
              >
                {mistake}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fluency Tip */}
      <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-secondary">
        <CheckCircle className={cn(
          "w-4 h-4",
          wordsPerMinute >= 100 ? "text-emerald-500" : "text-muted-foreground"
        )} />
        <span className="text-muted-foreground">{fluencyStatus}</span>
      </div>
    </div>
  );
};

export default LiveAnalysisPanel;
