import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { Onboarding, useOnboarding } from "@/components/Onboarding";
import { Moon, Sun, User } from "lucide-react";
import DiscoverseText from "@/components/DiscoverseText";
import { useState, useEffect } from "react";
import { ChatMode } from "@/components/chat/ModeSelector";
import { cn } from "@/lib/utils";

const modes: { id: ChatMode; label: string; sub: string; emoji: string }[] = [
  { id: "friend", emoji: "😎", label: "Sathi", sub: "Chill & casual" },
  { id: "professional", emoji: "💼", label: "Pro", sub: "Formal mode" },
  { id: "exam", emoji: "📚", label: "Exam", sub: "Focus study" },
  { id: "ielts", emoji: "🎙️", label: "IELTS", sub: "Voice practice" },
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const [selectedMode, setSelectedMode] = useState<ChatMode | null>(null);

  if (showOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const handleModeSelect = (mode: ChatMode) => {
    setSelectedMode(mode);
    // Navigate after brief animation
    setTimeout(() => {
      navigate("/chat", { state: { mode } });
    }, 200);
  };

  return (
    <main className="min-h-[100dvh] bg-background flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="w-8" />
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={() => navigate(user ? "/profile" : "/auth")}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            <User className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-xs text-center space-y-8 animate-appear">
          {/* Text Logo */}
          <div className="flex flex-col items-center gap-2">
            <DiscoverseText size="xl" showVersion />
            <p className="text-sm text-muted-foreground">K cha?</p>
          </div>

          {/* Mode Selection */}
          <div className="space-y-3 pt-4">
            <p className="text-xs text-muted-foreground/70">Choose your vibe</p>
            <div className="grid grid-cols-2 gap-2">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={cn(
                    "py-4 px-3 rounded-xl bg-card hover:bg-accent/10 transition-all text-center group border border-transparent",
                    selectedMode === mode.id && "border-accent bg-accent/10 scale-95"
                  )}
                >
                  <span className="text-xl mb-1 block">{mode.emoji}</span>
                  <span className="text-sm font-medium block">{mode.label}</span>
                  <span className="text-xs text-muted-foreground/70">{mode.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground/40">Discoverse 0.1 Model • Nepal's AI</p>
      </footer>
    </main>
  );
};

export default Index;
