import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { Onboarding, useOnboarding } from "@/components/Onboarding";
import { Moon, Sun, User } from "lucide-react";
import discoverseLogoNew from "@/assets/discoverse-logo-new.png";

// Mood-based prompts - minimal
const vibes = [
  { id: "chat", text: "Kura gara", subtle: "General chat" },
  { id: "study", text: "Padhai", subtle: "Focus mode" },
  { id: "help", text: "Help chaiyo", subtle: "Ask anything" },
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  if (showOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const handleVibeClick = (vibe: typeof vibes[0]) => {
    if (vibe.id === "study") {
      navigate("/chat", { state: { mode: "exam", focusInput: true } });
    } else {
      navigate("/chat");
    }
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
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center">
              <img src={discoverseLogoNew} alt="Discoverse" className="w-10 h-10 object-contain" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-xl font-medium">Discoverse</h1>
            <p className="text-sm text-muted-foreground">K cha?</p>
          </div>

          {/* Vibes */}
          <div className="space-y-2 pt-4">
            {vibes.map((vibe) => (
              <button
                key={vibe.id}
                onClick={() => handleVibeClick(vibe)}
                className="w-full py-3 px-4 rounded-xl bg-card hover:bg-accent/10 transition-colors text-left flex items-center justify-between group"
              >
                <span className="text-sm font-medium">{vibe.text}</span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {vibe.subtle}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground/40">Nepal's AI</p>
      </footer>
    </main>
  );
};

export default Index;
