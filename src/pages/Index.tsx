import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles, Users, BookOpen, Languages, GraduationCap, Flame, Zap, Layers, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStreak, levelProgress } from "@/hooks/useStreak";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/MobileNav";
import { Progress } from "@/components/ui/progress";

const modes = [
  {
    icon: Users,
    title: "Friend",
    desc: "Casual chat & advice",
    color: "bg-gradient-to-br from-primary/20 to-primary/5",
    iconColor: "text-primary",
    route: "/chat",
  },
  {
    icon: BookOpen,
    title: "Loksewa",
    desc: "Exam prep & quizzes",
    color: "bg-gradient-to-br from-secondary/20 to-secondary/5",
    iconColor: "text-secondary",
    route: "/loksewa",
  },
  {
    icon: Languages,
    title: "IELTS",
    desc: "Speaking practice",
    color: "bg-gradient-to-br from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
    route: "/ielts",
  },
  {
    icon: GraduationCap,
    title: "Student",
    desc: "Homework help",
    color: "bg-gradient-to-br from-teal-500/20 to-teal-500/5",
    iconColor: "text-teal-500",
    route: "/student",
  },
  {
    icon: Layers,
    title: "Flashcards",
    desc: "Smart memorization",
    color: "bg-gradient-to-br from-pink-500/20 to-pink-500/5",
    iconColor: "text-pink-500",
    route: "/flashcards",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { streak, xp } = useStreak();

  const handleStartChat = () => {
    navigate("/chat");
  };

  return (
    <main className="min-h-[100dvh] bg-background flex flex-col pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
        {/* Subtle gradient orbs */}
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          {/* Streak & XP */}
          {user && (streak || xp) && (
            <div className="flex items-center gap-2">
              {streak && streak.current_streak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-500">{streak.current_streak}</span>
                </div>
              )}
              {xp && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Lv.{xp.level}</span>
                </div>
              )}
            </div>
          )}
          {!user && <div />}

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(user ? "/profile" : "/auth")}
              className="rounded-full text-sm font-medium"
            >
              {user ? "Profile" : "Login"}
            </Button>
          </div>
        </div>

        {/* XP Progress */}
        {user && xp && (
          <div className="w-full max-w-xs mb-6 mt-12">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span className="font-medium">Level {xp.level}</span>
              <span>{xp.total_xp} XP</span>
            </div>
            <Progress value={levelProgress(xp.total_xp, xp.level)} className="h-1.5" />
          </div>
        )}

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-8 animate-slide-up">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Smart AI for South Asia</span>
        </div>

        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mb-6 shadow-lg animate-float">
          <span className="text-4xl text-primary-foreground font-bold">भ</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 animate-slide-up tracking-tight">
          Meet <span className="gradient-text">Bhote</span>
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-center mb-8 max-w-sm text-lg animate-slide-up" style={{ animationDelay: "100ms" }}>
          Your smart companion for learning, exams, and everyday questions
        </p>

        {/* CTA Button */}
        <Button 
          variant="hero" 
          size="lg" 
          onClick={handleStartChat}
          className="animate-slide-up group text-base px-8"
          style={{ animationDelay: "200ms" }}
        >
          <MessageCircle className="w-5 h-5" />
          Start Chatting
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </section>

      {/* Modes Grid */}
      <section className="px-6 pb-8">
        <p className="text-sm text-muted-foreground text-center mb-5 font-medium">Choose a mode</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
          {modes.map((mode, index) => (
            <button
              key={mode.title}
              onClick={() => navigate(mode.route)}
              className={`p-4 rounded-2xl ${mode.color} border border-transparent hover:border-primary/20 transition-all duration-300 text-left animate-slide-up group`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl bg-background/80 backdrop-blur flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                <mode.icon className={`w-5 h-5 ${mode.iconColor}`} />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{mode.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{mode.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <MobileNav />
    </main>
  );
};

export default Index;
