import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { 
  Clock, 
  MessageSquare, 
  Star, 
  ChevronRight, 
  Calendar,
  TrendingUp,
  Heart,
  Zap,
  Brain,
  Play,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VoiceSession {
  id: string;
  session_type: string;
  duration_seconds: number;
  messages: Array<{ role: string; content: string; timestamp: string }>;
  emotion_summary: {
    avgConfidence: number;
    avgEnergy: number;
    avgStress: number;
    avgEngagement: number;
  } | null;
  ai_feedback: string | null;
  band_score_estimate: number | null;
  created_at: string;
}

interface SessionHistoryPanelProps {
  userId: string;
  onClose?: () => void;
  onReplay?: (session: VoiceSession) => void;
}

const SessionHistoryPanel = ({ userId, onClose }: SessionHistoryPanelProps) => {
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<VoiceSession | null>(null);

  useEffect(() => {
    loadSessions();
  }, [userId]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("voice_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setSessions((data || []) as unknown as VoiceSession[]);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (selectedSession) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSession(null)}
            className="gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back
          </Button>
          <span className="text-sm font-medium">Session Details</span>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 p-4">
          {/* Session Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{new Date(selectedSession.created_at).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(selectedSession.duration_seconds)}</span>
              </div>
            </div>

            {/* Band Score */}
            {selectedSession.band_score_estimate && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30">
                <Star className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    Band {selectedSession.band_score_estimate}
                  </p>
                  <p className="text-xs text-muted-foreground">Estimated Score</p>
                </div>
              </div>
            )}

            {/* Emotion Summary */}
            {selectedSession.emotion_summary && (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-secondary rounded-lg flex items-center gap-2">
                  <Heart className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">{Math.round(selectedSession.emotion_summary.avgConfidence)}%</p>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                  </div>
                </div>
                <div className="p-3 bg-secondary rounded-lg flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">{Math.round(selectedSession.emotion_summary.avgEnergy)}%</p>
                    <p className="text-xs text-muted-foreground">Energy</p>
                  </div>
                </div>
                <div className="p-3 bg-secondary rounded-lg flex items-center gap-2">
                  <Brain className="w-4 h-4 text-rose-500" />
                  <div>
                    <p className="text-sm font-medium">{Math.round(selectedSession.emotion_summary.avgStress)}%</p>
                    <p className="text-xs text-muted-foreground">Stress</p>
                  </div>
                </div>
                <div className="p-3 bg-secondary rounded-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{Math.round(selectedSession.emotion_summary.avgEngagement)}%</p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Feedback */}
            {selectedSession.ai_feedback && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mb-2">Sarah's Feedback</p>
                <p className="text-sm leading-relaxed">{selectedSession.ai_feedback}</p>
              </div>
            )}

            {/* Conversation */}
            <div className="space-y-3 mt-4">
              <p className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Conversation ({selectedSession.messages.length} messages)
              </p>
              {selectedSession.messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-3 rounded-xl text-sm",
                    msg.role === "user"
                      ? "bg-foreground text-background ml-8"
                      : "bg-secondary mr-8"
                  )}
                >
                  {msg.role === "assistant" && (
                    <p className="text-xs text-rose-500 font-medium mb-1">Sarah</p>
                  )}
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Session History
        </h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">No sessions yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete a voice practice to see it here
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className="w-full p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(session.created_at)}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(session.duration_seconds)}
                      </span>
                    </div>
                    
                    {/* Preview of conversation */}
                    <p className="text-sm truncate text-foreground">
                      {session.messages[0]?.content.slice(0, 60)}...
                    </p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      {session.band_score_estimate && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Band {session.band_score_estimate}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {session.messages.length} msgs
                      </span>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default SessionHistoryPanel;
