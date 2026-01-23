import { cn } from "@/lib/utils";

export type ChatMode = "friend" | "professional" | "exam" | "cultural";

interface ModeSelectorProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const modes: { id: ChatMode; emoji: string; label: string; vibe: string }[] = [
  { id: "friend", emoji: "😎", label: "Sathi", vibe: "Chill" },
  { id: "professional", emoji: "💼", label: "Pro", vibe: "Formal" },
  { id: "exam", emoji: "📚", label: "Exam", vibe: "Focus" },
  { id: "cultural", emoji: "🎭", label: "Nepali", vibe: "Local" },
];

const modeColors: Record<ChatMode, string> = {
  friend: "bg-accent/10 text-accent border-accent/30",
  professional: "bg-primary/10 text-primary border-primary/30",
  exam: "bg-teal/10 text-teal border-teal/30",
  cultural: "bg-warm/10 text-warm border-warm/30",
};

const ModeSelector = ({ currentMode, onModeChange }: ModeSelectorProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {modes.map((mode) => {
        const isActive = currentMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all duration-300 whitespace-nowrap",
              isActive
                ? cn(modeColors[mode.id], "mode-pill-active")
                : "bg-card border-border hover:border-muted-foreground/30"
            )}
          >
            <span className="text-base">{mode.emoji}</span>
            <span className={cn(
              "text-sm font-medium",
              isActive ? "" : "text-foreground"
            )}>
              {mode.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;
