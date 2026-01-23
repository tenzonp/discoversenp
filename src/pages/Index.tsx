import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { Onboarding, useOnboarding } from "@/components/Onboarding";
import { Moon, Sun, User } from "lucide-react";

// Mood-based prompts - feel like checking in with someone
const vibes = [
  { emoji: "😴", label: "Thakeko", prompt: "I'm feeling tired today..." },
  { emoji: "📚", label: "Padhdai", prompt: "Help me study..." },
  { emoji: "😄", label: "Khusi", prompt: "Hey! I'm in a good mood today" },
  { emoji: "🤔", label: "Confused", prompt: "I need help figuring something out" },
  { emoji: "💬", label: "Kura gara", prompt: "Just want to chat" },
];

// Time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Subha prabhat", emoji: "🌅" };
  if (hour < 17) return { text: "Namaste", emoji: "🙏" };
  if (hour < 21) return { text: "Subha sandhya", emoji: "🌆" };
  return { text: "Subha ratri", emoji: "🌙" };
};

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
    // Navigate to chat with the vibe context
    navigate("/chat", { state: { initialMessage: prompt } });
  };

  return (
    <main className="min-h-[100dvh] bg-background flex flex-col">
      {/* Minimal Top Bar */}
      <header className="flex items-center justify-between p-5">
        <div className="w-10 h-10 rounded-2xl gradient-warm flex items-center justify-center shadow-soft">
          <span className="text-lg text-white font-semibold">भ</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={() => navigate(user ? "/profile" : "/auth")}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            aria-label={user ? "Profile" : "Login"}
          >
            <User className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Hero - Feels like checking in with someone */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Greeting */}
        <div className="animate-fade-in mb-8 text-center">
          <span className="text-4xl mb-3 block">{greeting.emoji}</span>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
            {greeting.text}
          </h1>
          <p className="text-muted-foreground text-base">
            Aaja k mood cha?
          </p>
        </div>

        {/* Vibe Selector - Mood-based entry */}
        <div className="w-full max-w-sm space-y-3 animate-slide-up delay-100">
          {vibes.map((vibe, index) => (
            <button
              key={vibe.label}
              onClick={() => handleVibeClick(vibe.prompt)}
              className="w-full vibe-card group flex items-center gap-4"
              style={{ animationDelay: `${100 + index * 50}ms` }}
            >
              <span className="text-2xl">{vibe.emoji}</span>
              <div className="text-left flex-1">
                <span className="text-foreground font-medium text-base group-hover:text-accent transition-colors">
                  {vibe.label}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Subtle direct chat option */}
        <button
          onClick={() => navigate("/chat")}
          className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors animate-fade-in delay-300"
        >
          Seedha chat ma ja →
        </button>
      </section>

      {/* Footer - Minimal */}
      <footer className="px-6 pb-6 text-center animate-fade-in delay-300">
        <p className="text-xs text-muted-foreground/60">
          Made with ❤️ in Nepal
        </p>
      </footer>
    </main>
  );
};

export default Index;
