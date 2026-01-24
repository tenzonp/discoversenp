import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChatMode } from "./ModeSelector";

interface HangingModeSelectorProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const modes: { id: ChatMode; label: string; emoji: string }[] = [
  { id: "friend", label: "Sathi", emoji: "😎" },
  { id: "professional", label: "Pro", emoji: "💼" },
  { id: "exam", label: "Study", emoji: "📚" },
  { id: "cultural", label: "नेपाली", emoji: "🇳🇵" },
];

const HangingModeSelector = ({ currentMode, onModeChange }: HangingModeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const current = modes.find((m) => m.id === currentMode) || modes[0];

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-0 z-30 flex flex-col items-center">
      {/* Rope */}
      <div className="w-0.5 h-6 bg-gradient-to-b from-muted-foreground/40 to-muted-foreground/20 animate-rope-sway origin-top" />
      
      {/* Hanging Tag */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full",
          "bg-card/95 backdrop-blur-sm border border-border/50",
          "shadow-lg hover:shadow-xl transition-all duration-300",
          "animate-hang-sway origin-top",
          "text-xs font-medium"
        )}
      >
        <span className="text-base">{current.emoji}</span>
        <span className="text-foreground/80">{current.label}</span>
        
        {/* Rope attachment knot */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-muted-foreground/30" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className={cn(
            "absolute top-full mt-1 z-50",
            "bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl overflow-hidden",
            "animate-in fade-in slide-in-from-top-2 duration-200",
            "min-w-[120px]"
          )}>
            {modes.map((mode, index) => (
              <button
                key={mode.id}
                onClick={() => {
                  onModeChange(mode.id);
                  setIsOpen(false);
                }}
                style={{ animationDelay: `${index * 50}ms` }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2.5 text-left",
                  "hover:bg-muted/50 transition-colors text-sm",
                  "animate-in fade-in slide-in-from-top-1",
                  mode.id === currentMode && "bg-accent/10 text-accent"
                )}
              >
                <span className="text-base">{mode.emoji}</span>
                <span className="font-medium">{mode.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HangingModeSelector;
