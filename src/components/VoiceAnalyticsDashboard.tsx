import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar,
  Clock,
  Target,
  Award,
  ChevronLeft,
  ChevronRight,
  Mic,
  BarChart3,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceAnalyticsDashboardProps {
  userId: string;
  onClose?: () => void;
}

interface WeeklyData {
  date: string;
  sessions: number;
  avgScore: number;
  totalMinutes: number;
}

interface AnalyticsData {
  totalSessions: number;
  totalMinutes: number;
  avgBandScore: number;
  highestScore: number;
  weeklyData: WeeklyData[];
  scoreBreakdown: {
    fluency: number;
    vocabulary: number;
    grammar: number;
    pronunciation: number;
  };
  improvement: number; // percentage change from previous week
}

const VoiceAnalyticsDashboard = ({ userId, onClose }: VoiceAnalyticsDashboardProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, [userId, weekOffset]);

  const loadAnalytics = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Calculate date range for current week view
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() - (weekOffset * 7));
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Fetch sessions for the week
      const { data: sessions } = await supabase
        .from("voice_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("session_type", "ielts")
        .gte("created_at", startOfWeek.toISOString())
        .lte("created_at", endOfWeek.toISOString())
        .order("created_at", { ascending: true });

      // Fetch previous week for comparison
      const prevWeekStart = new Date(startOfWeek);
      prevWeekStart.setDate(startOfWeek.getDate() - 7);
      const prevWeekEnd = new Date(startOfWeek);
      prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);

      const { data: prevSessions } = await supabase
        .from("voice_sessions")
        .select("band_score_estimate")
        .eq("user_id", userId)
        .eq("session_type", "ielts")
        .gte("created_at", prevWeekStart.toISOString())
        .lte("created_at", prevWeekEnd.toISOString());

      // Process data
      const weeklyData: WeeklyData[] = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const daySessions = sessions?.filter(s => 
          s.created_at.startsWith(dateStr)
        ) || [];
        
        const avgScore = daySessions.length > 0
          ? daySessions.reduce((sum, s) => sum + (s.band_score_estimate || 0), 0) / daySessions.length
          : 0;
        
        const totalMins = daySessions.reduce((sum, s) => sum + (s.duration_seconds / 60), 0);
        
        weeklyData.push({
          date: dayNames[i],
          sessions: daySessions.length,
          avgScore: Math.round(avgScore * 10) / 10,
          totalMinutes: Math.round(totalMins),
        });
      }

      // Calculate totals
      const totalSessions = sessions?.length || 0;
      const totalMinutes = Math.round(
        (sessions?.reduce((sum, s) => sum + s.duration_seconds, 0) || 0) / 60
      );
      
      const avgBandScore = totalSessions > 0
        ? Math.round((sessions!.reduce((sum, s) => sum + (s.band_score_estimate || 0), 0) / totalSessions) * 10) / 10
        : 0;
      
      const highestScore = Math.max(
        ...(sessions?.map(s => s.band_score_estimate || 0) || [0])
      );

      // Calculate improvement
      const prevAvg = prevSessions && prevSessions.length > 0
        ? prevSessions.reduce((sum, s) => sum + (s.band_score_estimate || 0), 0) / prevSessions.length
        : 0;
      
      const improvement = prevAvg > 0 ? ((avgBandScore - prevAvg) / prevAvg) * 100 : 0;

      // Score breakdown from emotion_summary
      const scoreBreakdown = {
        fluency: 0,
        vocabulary: 0,
        grammar: 0,
        pronunciation: 0,
      };

      if (sessions && sessions.length > 0) {
        sessions.forEach(s => {
          const summary = s.emotion_summary as any;
          if (summary) {
            scoreBreakdown.fluency += summary.avgConfidence || 0;
            scoreBreakdown.vocabulary += summary.avgEnergy || 0;
            scoreBreakdown.grammar += 100 - (summary.avgStress || 0);
            scoreBreakdown.pronunciation += summary.avgEngagement || 0;
          }
        });
        
        const count = sessions.length;
        scoreBreakdown.fluency = Math.round(scoreBreakdown.fluency / count);
        scoreBreakdown.vocabulary = Math.round(scoreBreakdown.vocabulary / count);
        scoreBreakdown.grammar = Math.round(scoreBreakdown.grammar / count);
        scoreBreakdown.pronunciation = Math.round(scoreBreakdown.pronunciation / count);
      }

      setAnalytics({
        totalSessions,
        totalMinutes,
        avgBandScore,
        highestScore,
        weeklyData,
        scoreBreakdown,
        improvement: Math.round(improvement * 10) / 10,
      });
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const getWeekLabel = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() - (weekOffset * 7));
    
    if (weekOffset === 0) return "This Week";
    if (weekOffset === 1) return "Last Week";
    
    return startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTrendIcon = (value: number) => {
    if (value > 5) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value < -5) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <BarChart3 className="w-10 h-10 text-primary/50" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Voice Analytics</h2>
            <p className="text-xs text-muted-foreground">Your IELTS progress</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            ✕
          </button>
        )}
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{getWeekLabel()}</span>
        </div>
        <button
          onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
          className={cn(
            "p-2 rounded-lg transition-colors",
            weekOffset === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-muted"
          )}
          disabled={weekOffset === 0}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <Mic className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">Sessions</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.totalSessions || 0}</p>
          </div>
          
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-teal-500" />
              <span className="text-xs text-muted-foreground">Minutes</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.totalMinutes || 0}</p>
          </div>
          
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-accent" />
              <span className="text-xs text-muted-foreground">Avg Score</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{analytics?.avgBandScore || 0}</p>
              {getTrendIcon(analytics?.improvement || 0)}
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-xs text-muted-foreground">Best</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.highestScore || 0}</p>
          </div>
        </div>

        {/* Improvement Banner */}
        {analytics && analytics.improvement !== 0 && (
          <div className={cn(
            "p-4 rounded-2xl flex items-center gap-3",
            analytics.improvement > 0 
              ? "bg-green-500/10 border border-green-500/20" 
              : "bg-red-500/10 border border-red-500/20"
          )}>
            {analytics.improvement > 0 ? (
              <Sparkles className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
            <div>
              <p className="font-medium text-sm">
                {analytics.improvement > 0 ? "Great Progress! 🎉" : "Keep Practicing!"}
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.abs(analytics.improvement)}% {analytics.improvement > 0 ? "improvement" : "drop"} from last week
              </p>
            </div>
          </div>
        )}

        {/* Weekly Chart */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h3 className="font-medium text-sm mb-4">Daily Practice</h3>
          <div className="flex items-end justify-between h-32 gap-1">
            {analytics?.weeklyData.map((day, i) => {
              const maxSessions = Math.max(...analytics.weeklyData.map(d => d.sessions), 1);
              const height = day.sessions > 0 ? (day.sessions / maxSessions) * 100 : 5;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center">
                    {day.avgScore > 0 && (
                      <span className="text-[10px] font-medium text-primary mb-1">
                        {day.avgScore}
                      </span>
                    )}
                    <div 
                      className={cn(
                        "w-full rounded-t-lg transition-all",
                        day.sessions > 0 ? "bg-primary" : "bg-muted"
                      )}
                      style={{ height: `${height}%`, minHeight: 4 }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{day.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score Breakdown */}
        {analytics && analytics.totalSessions > 0 && (
          <div className="p-4 rounded-2xl bg-card border border-border">
            <h3 className="font-medium text-sm mb-4">Skill Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: "Fluency", value: analytics.scoreBreakdown.fluency, color: "bg-blue-500" },
                { label: "Vocabulary", value: analytics.scoreBreakdown.vocabulary, color: "bg-green-500" },
                { label: "Grammar", value: analytics.scoreBreakdown.grammar, color: "bg-amber-500" },
                { label: "Pronunciation", value: analytics.scoreBreakdown.pronunciation, color: "bg-purple-500" },
              ].map((skill) => (
                <div key={skill.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{skill.label}</span>
                    <span className="font-medium">{skill.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all", skill.color)}
                      style={{ width: `${skill.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {analytics && analytics.totalSessions === 0 && (
          <div className="text-center py-10">
            <Mic className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">No practice sessions this week</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Start practicing to see your progress!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAnalyticsDashboard;
