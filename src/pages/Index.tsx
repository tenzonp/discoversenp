import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { Onboarding, useOnboarding } from "@/components/Onboarding";
import { Moon, Sun } from "lucide-react";

// Time-based greeting - feels like a friend checking in
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return { text: "Sutteu ki?", sub: "Rati ko samay ho" };
  if (hour < 12) return { text: "Subha prabhat", sub: "Bihana ko fresh" };
  if (hour < 17) return { text: "Namaste", sub: "Diuso kasto cha?" };
  if (hour < 21) return { text: "Sandhya", sub: "Aram se?" };
  return { text: "Subha ratri", sub: "Aja k bhayo?" };
};

// Mood-based prompts - intimate check-in, not menu options
const vibes = [
  { 
    id: "tired", 
    text: "Thakeko chu...", 
    prompt: "I'm feeling tired today, just need someone to talk to",
    subtle: "Rest linu parcha"
  },
  { 
    id: "study", 
    text: "Padhai garnu cha", 
    prompt: "Help me study, I want to focus",
    subtle: "Focus mode"
  },
  { 
    id: "happy", 
    text: "Aaja ramro din", 
    prompt: "Hey! I'm in a good mood today, let's chat",
    subtle: "Share garau"
  },
  { 
    id: "confused", 
    text: "Kei bujhnu cha...", 
    prompt: "I need help figuring something out",
    subtle: "Help chaiyo"
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const greeting = getGreeting();

  if (showOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const handleVibeClick = (prompt: string) => {
    navigate("/chat", { state: { initialMessage: prompt } });
  };

  return (
    <main className="min-h-[100dvh] bg-background flex flex-col">
      {/* Minimal, almost invisible header */}
      <header className="flex items-center justify-between px-6 pt-6">
        {/* Logo - Subtle, not shouting */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <span className="text-accent text-sm font-medium">भ</span>
          </div>
        </div>
        
        {/* Actions - Nearly invisible */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors duration-300"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-muted-foreground/70" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground/70" />
            )}
          </button>
          <button
            onClick={() => navigate(user ? "/profile" : "/auth")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors duration-300"
            aria-label={user ? "Profile" : "Login"}
          >
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground">
                {user ? "👤" : "→"}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* Hero - Personal, intimate, like checking in with someone */}
      <section className="flex-1 flex flex-col px-6 pt-16 pb-8">
        {/* Greeting - Slow, thoughtful animation */}
        <div className="mb-16 animate-appear">
          <h1 className="text-3xl font-medium text-foreground mb-2 tracking-tight">
            {greeting.text}
          </h1>
          <p className="text-muted-foreground text-base">
            {greeting.sub}
          </p>
        </div>

        {/* Vibe Selector - Feels like confiding in a friend */}
        <div className="space-y-2 animate-appear delay-200">
          <p className="text-xs text-muted-foreground/70 uppercase tracking-wider mb-4">
            Aaja k vibe cha?
          </p>
          
          <div className="space-y-1.5">
            {vibes.map((vibe, index) => (
              <button
                key={vibe.id}
                onClick={() => handleVibeClick(vibe.prompt)}
                className="w-full vibe-card group flex items-center justify-between text-left animate-fade-up"
                style={{ animationDelay: `${200 + index * 80}ms` }}
              >
                <div>
                  <span className="text-foreground text-base group-hover:text-accent transition-colors duration-300">
                    {vibe.text}
                  </span>
                  <span className="block text-xs text-muted-foreground/60 mt-0.5 group-hover:text-muted-foreground transition-colors duration-300">
                    {vibe.subtle}
                  </span>
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Direct chat option - Almost hidden, for those who know */}
        <button
          onClick={() => navigate("/chat")}
          className="self-start text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-500 animate-fade-in delay-500"
        >
          Seedha chat →
        </button>
      </section>

      {/* Footer - Barely visible */}
      <footer className="px-6 pb-8 animate-fade-in delay-500">
        <p className="text-[11px] text-muted-foreground/30">
          Made with ❤️ in Nepal
        </p>
      </footer>
    </main>
  );
};

export default Index;
