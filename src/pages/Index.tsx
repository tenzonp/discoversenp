import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles, Users, BookOpen, Languages, GraduationCap, Heart, MapPin, User, Flame, Zap, Layers } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStreak, levelProgress } from "@/hooks/useStreak";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/MobileNav";
import { Progress } from "@/components/ui/progress";

const modes = [
  {
    icon: Users,
    title: "Friend",
    nepali: "साथी",
    desc: "Casual chat, life advice",
    color: "bg-primary/10 text-primary",
    route: "/chat",
  },
  {
    icon: BookOpen,
    title: "Loksewa",
    nepali: "परीक्षा",
    desc: "Exam prep & quizzes",
    color: "bg-secondary/10 text-secondary",
    route: "/loksewa",
  },
  {
    icon: Languages,
    title: "IELTS",
    nepali: "अंग्रेजी",
    desc: "Speaking practice",
    color: "bg-accent/10 text-accent-foreground",
    route: "/ielts",
  },
  {
    icon: GraduationCap,
    title: "Student",
    nepali: "विद्यार्थी",
    desc: "Homework help",
    color: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    route: "/student",
  },
  {
    icon: Layers,
    title: "Flashcards",
    nepali: "कार्ड",
    desc: "Memorize facts",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
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
      {/* Hero Section - Mobile optimized */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
        <div className="absolute top-10 left-5 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-5 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />

        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          {/* Streak & XP Display */}
          {user && (streak || xp) && (
            <div className="flex items-center gap-3">
              {streak && streak.current_streak > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 text-orange-500">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-bold">{streak.current_streak}</span>
                </div>
              )}
              {xp && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold">Lv.{xp.level}</span>
                </div>
              )}
            </div>
          )}
          {!user && <div />}

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(user ? "/profile" : "/auth")}
              className="rounded-full"
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* XP Progress Bar */}
        {user && xp && (
          <div className="w-full max-w-xs mb-4 mt-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Level {xp.level}</span>
              <span>{xp.total_xp} XP</span>
            </div>
            <Progress value={levelProgress(xp.total_xp, xp.level)} className="h-2" />
          </div>
        )}

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-slide-up">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Nepal's First Cultural AI</span>
        </div>

        {/* Logo */}
        <div className="w-24 h-24 rounded-3xl gradient-bg flex items-center justify-center mb-6 shadow-glow animate-float">
          <span className="text-4xl text-primary-foreground font-bold">भ</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-3 animate-slide-up">
          <span className="block text-foreground">नमस्ते! म हुँ</span>
          <span className="gradient-text">Bhote AI</span>
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-center mb-8 max-w-xs animate-slide-up" style={{ animationDelay: "100ms" }}>
          तिम्रो आफ्नै <span className="text-primary font-medium">नेपाली AI साथी</span> — 
          पढाइ, परीक्षा, वा जीवन, म सधैं साथमा 💪
        </p>

        {/* CTA Button */}
        <Button 
          variant="hero" 
          size="lg" 
          onClick={handleStartChat}
          className="animate-slide-up group"
          style={{ animationDelay: "200ms" }}
        >
          <MessageCircle className="w-5 h-5 group-hover:animate-bounce-gentle" />
          कुरा गरौं — Chat Now
        </Button>

        {/* Founder */}
        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-[10px] font-bold">
            NB
          </div>
          <span>By Nishan Bhusal • 🇳🇵 Dang</span>
        </div>
      </section>

      {/* Modes Grid - Compact for mobile */}
      <section className="px-6 pb-8">
        <p className="text-xs text-muted-foreground text-center mb-4">5 Modes to help you</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
          {modes.map((mode, index) => (
            <button
              key={mode.title}
              onClick={() => navigate(mode.route)}
              className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all duration-300 text-left animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl ${mode.color} flex items-center justify-center mb-2`}>
                <mode.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{mode.title}</h3>
              <p className="text-[10px] text-muted-foreground">{mode.nepali}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-border hidden md:block">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-primary fill-primary" /> in Nepal
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Tulsipur
          </span>
        </div>
      </footer>

      <MobileNav />
    </main>
  );
};

export default Index;
