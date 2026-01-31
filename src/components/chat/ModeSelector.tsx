import { cn } from "@/lib/utils";

export type ChatMode = "friend" | "professional" | "life" | "roast";

interface ModeSelectorProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const modes: { id: ChatMode; label: string; sub: string }[] = [
  { id: "friend", label: "Sathi", sub: "Chill" },
  { id: "professional", label: "Pro", sub: "Formal" },
  { id: "life", label: "Life", sub: "Admin" },
  { id: "roast", label: "Roast", sub: "Group" },
];

const ModeSelector = ({ currentMode, onModeChange }: ModeSelectorProps) => {
  return (
    <div className={cn("flex gap-1.5 overflow-x-auto scrollbar-hide", `vibe-${currentMode}`)}>
      {modes.map((mode) => {
        const isActive = currentMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              "vibe-pill whitespace-nowrap transition-all duration-500",
              isActive
                ? "vibe-pill-active"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="text-sm">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;
