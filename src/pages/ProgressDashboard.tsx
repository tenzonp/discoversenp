import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Flame, 
  Zap, 
  Trophy, 
  Clock, 
  Target,
  TrendingUp,
  Award,
  Mic,
  BookOpen,
  RefreshCw
} from "lucide-react";
import { useEffect } from "react";

const ProgressDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data, loading, refresh } = useProgress(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
      </div>
    );
  }

  const stats = data || {
    streak: { current: 0, longest: 0, lastDate: null },
    xp: { total: 0, level: 1, progress: 0, nextLevelXP: 50 },
    quizzes: { totalTaken: 0, averageScore: 0, bestScore: 0 },
    voicePractice: { todayMinutes: 0, totalMinutes: 0, sessionsThisWeek: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border/50 bg-card/80 backdrop-blur-lg sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">Progress Dashboard</h1>
            <p className="text-xs text-muted-foreground">Tero journey hera</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={refresh} className="ml-auto rounded-full">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </header>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Level & XP Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {stats.xp.level}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Level</p>
                <p className="font-bold text-lg">Learner Level {stats.xp.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{stats.xp.total}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Next level: {stats.xp.nextLevelXP} XP</span>
              <span>{Math.round(stats.xp.progress)}%</span>
            </div>
            <Progress value={stats.xp.progress} className="h-2" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Streak */}
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-xs text-muted-foreground">Streak</span>
            </div>
            <p className="text-2xl font-bold">{stats.streak.current} <span className="text-sm font-normal text-muted-foreground">days</span></p>
            <p className="text-xs text-muted-foreground mt-1">Best: {stats.streak.longest} days</p>
          </div>

          {/* Quiz Performance */}
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-xs text-muted-foreground">Quiz Score</span>
            </div>
            <p className="text-2xl font-bold">{stats.quizzes.averageScore}<span className="text-sm font-normal text-muted-foreground">%</span></p>
            <p className="text-xs text-muted-foreground mt-1">{stats.quizzes.totalTaken} quizzes diyexa</p>
          </div>

          {/* Voice Practice Today */}
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <Mic className="w-4 h-4 text-rose-500" />
              </div>
              <span className="text-xs text-muted-foreground">Voice Today</span>
            </div>
            <p className="text-2xl font-bold">{stats.voicePractice.todayMinutes} <span className="text-sm font-normal text-muted-foreground">min</span></p>
            <p className="text-xs text-muted-foreground mt-1">{30 - stats.voicePractice.todayMinutes} min left</p>
          </div>

          {/* Weekly Activity */}
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-xs text-muted-foreground">This Week</span>
            </div>
            <p className="text-2xl font-bold">{stats.voicePractice.totalMinutes} <span className="text-sm font-normal text-muted-foreground">min</span></p>
            <p className="text-xs text-muted-foreground mt-1">{stats.voicePractice.sessionsThisWeek} sessions</p>
          </div>
        </div>

        {/* Achievements Preview */}
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Achievements
          </h3>
          <div className="grid grid-cols-4 gap-2">
            <div className={`aspect-square rounded-xl flex items-center justify-center text-2xl ${stats.streak.current >= 1 ? 'bg-amber-500/20' : 'bg-muted/50 opacity-40'}`}>
              🔥
            </div>
            <div className={`aspect-square rounded-xl flex items-center justify-center text-2xl ${stats.quizzes.totalTaken >= 1 ? 'bg-emerald-500/20' : 'bg-muted/50 opacity-40'}`}>
              📝
            </div>
            <div className={`aspect-square rounded-xl flex items-center justify-center text-2xl ${stats.voicePractice.totalMinutes >= 10 ? 'bg-rose-500/20' : 'bg-muted/50 opacity-40'}`}>
              🎤
            </div>
            <div className={`aspect-square rounded-xl flex items-center justify-center text-2xl ${stats.xp.level >= 5 ? 'bg-purple-500/20' : 'bg-muted/50 opacity-40'}`}>
              ⭐
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            {stats.streak.current >= 1 ? "First Streak! " : ""}
            {stats.quizzes.totalTaken >= 1 ? "Quiz Master! " : ""}
            {stats.voicePractice.totalMinutes >= 10 ? "Voice Champion! " : ""}
            {!stats.streak.current && !stats.quizzes.totalTaken && !stats.voicePractice.totalMinutes && "Start learning to unlock badges!"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Continue Learning</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate("/ielts")}
            >
              <Mic className="w-5 h-5 text-rose-500" />
              <span className="text-xs">Voice Practice</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate("/loksewa")}
            >
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <span className="text-xs">Take Quiz</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
