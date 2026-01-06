import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight, BookOpen, Languages, GraduationCap, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

const modes = [
  {
    icon: MessageCircle,
    title: "Chat",
    desc: "Casual talk",
    route: "/chat",
  },
  {
    icon: BookOpen,
    title: "Loksewa",
    desc: "Exam prep",
    route: "/loksewa",
  },
  {
    icon: Languages,
    title: "IELTS",
    desc: "Speaking",
    route: "/ielts",
  },
  {
    icon: GraduationCap,
    title: "Student",
    desc: "Homework",
    route: "/student",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="min-h-[100dvh] bg-background flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between p-4">
        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
          <span className="text-lg text-primary-foreground font-bold">भ</span>
        </div>
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
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary mb-6 animate-slide-up">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-medium">AI for South Asia</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-center mb-3 animate-slide-up tracking-tight">
          Meet <span className="gradient-text">Bhote</span>
        </h1>

        <p className="text-muted-foreground text-center mb-8 max-w-xs text-base animate-slide-up" style={{ animationDelay: "50ms" }}>
          Your smart companion for learning, exams & everyday questions
        </p>

        <Button 
          onClick={() => navigate("/chat")}
          className="animate-slide-up group h-12 px-6 rounded-full bg-foreground text-background hover:bg-foreground/90"
          style={{ animationDelay: "100ms" }}
        >
          Start Chatting
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </section>

      {/* Modes */}
      <section className="px-6 pb-8">
        <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
          {modes.map((mode, index) => (
            <button
              key={mode.title}
              onClick={() => navigate(mode.route)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-secondary hover:bg-secondary/80 transition-all animate-slide-up"
              style={{ animationDelay: `${150 + index * 30}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                <mode.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{mode.title}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Index;