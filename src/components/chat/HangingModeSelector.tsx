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
  { id: "ielts", label: "IELTS", emoji: "🎙️" },
  { id: "roast", label: "Roast", emoji: "🔥" },
];

const HangingModeSelector = ({ currentMode, onModeChange }: HangingModeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const current = modes.find((m) => m.id === currentMode) || modes[0];

  const handleClick = () => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 600);
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-14 z-30 flex flex-col items-center pointer-events-none">
      {/* Rope */}
      <div 
        className={cn(
          "w-0.5 bg-gradient-to-b from-muted-foreground/50 via-muted-foreground/30 to-muted-foreground/20 origin-top",
          "transition-all duration-300",
          isBouncing ? "h-10 animate-rope-bounce" : "h-7 animate-rope-sway"
        )} 
      />
      
      {/* Knot */}
      <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 -mt-1 relative z-10" />
      
      {/* Hanging Tag */}
      <button
        onClick={handleClick}
        className={cn(
          "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full -mt-1 pointer-events-auto",
          "bg-card/95 backdrop-blur-sm border border-border/50",
          "shadow-lg hover:shadow-xl transition-all duration-300",
          "text-xs font-medium cursor-pointer",
          isBouncing ? "animate-tag-bounce" : "animate-hang-sway"
        )}
      >
        <span className="text-base">{current.emoji}</span>
        <span className="text-foreground/80">{current.label}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />
          <div className={cn(
            "absolute top-full mt-1 z-50 pointer-events-auto",
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
                  setIsBouncing(true);
                  setTimeout(() => setIsBouncing(false), 600);
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
