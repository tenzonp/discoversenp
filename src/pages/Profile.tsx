import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStreak, levelProgress } from "@/hooks/useStreak";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Leaderboard } from "@/components/Leaderboard";
import { 
  ArrowLeft, 
  User,
  Trophy,
  MessageCircle,
  BookOpen,
  Languages,
  GraduationCap,
  LogOut,
  ChevronRight,
  TrendingUp,
  Flame,
  Zap,
  Layers,
  Target,
  Calendar,
  Bell,
  Crown
} from "lucide-react";

interface Stats {
  totalChats: number;
  totalMessages: number;
  quizzesTaken: number;
  averageScore: number;
  bestCategory: string;
  streakDays: number;
}

interface QuizScore {
  category: string;
  score: number;
  total_questions: number;
  created_at: string;
  difficulty: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { streak, xp } = useStreak();
  const { isSupported: notifSupported, isEnabled: notifEnabled, requestPermission, scheduleStreakReminder } = useNotifications();
  const [activeTab, setActiveTab] = useState<"stats" | "leaderboard">("stats");
  const [stats, setStats] = useState<Stats>({
    totalChats: 0,
    totalMessages: 0,
    quizzesTaken: 0,
    averageScore: 0,
    bestCategory: "-",
    streakDays: 0
  });
  const [recentScores, setRecentScores] = useState<QuizScore[]>([]);
  const [profile, setProfile] = useState<{ display_name: string | null }>({ display_name: null });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadStats();
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    // Load conversations count
    const { count: chatCount } = await supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Load messages count
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id);

    let messageCount = 0;
    if (conversations && conversations.length > 0) {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", conversations.map(c => c.id));
      messageCount = count || 0;
    }

    // Load quiz scores
    const { data: scores } = await supabase
      .from("quiz_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const quizScores = scores || [];
    setRecentScores(quizScores.slice(0, 5).map(s => ({
      category: s.category,
      score: s.score,
      total_questions: s.total_questions,
      created_at: s.created_at,
      difficulty: s.difficulty || 'medium'
    })));

    // Calculate stats
    let avgScore = 0;
    let bestCategory = "-";
    let bestCategoryScore = 0;

    if (quizScores.length > 0) {
      const totalScore = quizScores.reduce((acc, s) => acc + (s.score / s.total_questions) * 100, 0);
      avgScore = Math.round(totalScore / quizScores.length);

      // Find best category
      const categoryScores: Record<string, { total: number; count: number }> = {};
      quizScores.forEach(s => {
        if (!categoryScores[s.category]) {
          categoryScores[s.category] = { total: 0, count: 0 };
        }
        categoryScores[s.category].total += (s.score / s.total_questions) * 100;
        categoryScores[s.category].count += 1;
      });

      Object.entries(categoryScores).forEach(([cat, data]) => {
        const avg = data.total / data.count;
        if (avg > bestCategoryScore) {
          bestCategoryScore = avg;
          bestCategory = cat;
        }
      });
    }

    // Calculate streak (simplified - just count unique days with activity)
    const uniqueDays = new Set(quizScores.map(s => 
      new Date(s.created_at).toDateString()
    )).size;

    setStats({
      totalChats: chatCount || 0,
      totalMessages: messageCount,
      quizzesTaken: quizScores.length,
      averageScore: avgScore,
      bestCategory,
      streakDays: uniqueDays
    });
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft">
          <User className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  const displayName = profile.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      {/* Header */}
      <header className="safe-area-top px-4 py-3 flex items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Profile</h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 overflow-y-auto safe-area-bottom">
        {/* Profile Card */}
        <div className="p-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/50 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-hero flex items-center justify-center text-white text-2xl font-bold mb-3">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                Bhote AI Member
              </span>
            </div>
          </div>
        </div>

        {/* Streak & XP */}
        {(streak || xp) && (
          <div className="px-4 pb-4">
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xl font-bold">{streak?.current_streak || 0}</p>
                      <p className="text-xs text-muted-foreground">Day Streak</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xl font-bold">Lv.{xp?.level || 1}</p>
                      <p className="text-xs text-muted-foreground">{xp?.total_xp || 0} XP</p>
                    </div>
                  </div>
                </div>
              </div>
              {xp && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress to Lv.{xp.level + 1}</span>
                    <span>{Math.round(levelProgress(xp.total_xp, xp.level))}%</span>
                  </div>
                  <Progress value={levelProgress(xp.total_xp, xp.level)} className="h-2" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 p-1 rounded-xl bg-muted">
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === "stats" 
                  ? "bg-background shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Stats
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === "leaderboard" 
                  ? "bg-background shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Crown className="w-4 h-4 inline mr-1" />
              Leaderboard
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        {notifSupported && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Study Reminders</p>
                  <p className="text-xs text-muted-foreground">Get notified to maintain your streak</p>
                </div>
              </div>
              <Switch
                checked={notifEnabled}
                onCheckedChange={async (checked) => {
                  if (checked) {
                    const granted = await requestPermission();
                    if (granted) {
                      scheduleStreakReminder();
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {activeTab === "leaderboard" ? (
          <div className="px-4 pb-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              Top Learners
            </h3>
            <Leaderboard />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="px-4 pb-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Your Stats
              </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <MessageCircle className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.totalChats}</p>
              <p className="text-xs text-muted-foreground">Total Chats</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <Trophy className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-2xl font-bold">{stats.quizzesTaken}</p>
              <p className="text-xs text-muted-foreground">Quizzes Taken</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <Target className="w-5 h-5 text-green-500 mb-2" />
              <p className="text-2xl font-bold">{stats.averageScore}%</p>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <Calendar className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{stats.streakDays}</p>
              <p className="text-xs text-muted-foreground">Active Days</p>
            </div>
          </div>
        </div>

        {/* Recent Quiz Scores */}
        {recentScores.length > 0 && (
          <div className="px-4 pb-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Recent Quiz Scores
            </h3>
            <div className="space-y-2">
              {recentScores.map((score, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      score.category === 'loksewa' 
                        ? 'bg-amber-500/20 text-amber-600'
                        : 'bg-blue-500/20 text-blue-600'
                    }`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm capitalize">{score.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(score.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      (score.score / score.total_questions) >= 0.7 
                        ? 'text-green-500'
                        : (score.score / score.total_questions) >= 0.5
                          ? 'text-amber-500'
                          : 'text-red-500'
                    }`}>
                      {score.score}/{score.total_questions}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{score.difficulty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="px-4 pb-4">
          <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/chat")}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">Friend Chat</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => navigate("/loksewa")}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                </div>
                <span className="font-medium">Loksewa Quiz</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => navigate("/ielts")}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Languages className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-medium">IELTS Practice</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => navigate("/student")}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-teal-600" />
                </div>
                <span className="font-medium">Student Mode</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
          </>
        )}

        {/* Logout */}
        <div className="px-4 pb-8">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full h-12 rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <MobileNav />
    </div>
  );
};

export default Profile;
