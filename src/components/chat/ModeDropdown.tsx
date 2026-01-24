import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMode } from "./ModeSelector";

interface ModeDropdownProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const modes: { id: ChatMode; label: string; emoji: string }[] = [
  { id: "friend", label: "Sathi", emoji: "😎" },
  { id: "professional", label: "Pro", emoji: "💼" },
  { id: "exam", label: "Study", emoji: "📚" },
  { id: "cultural", label: "नेपाली", emoji: "🇳🇵" },
];

const ModeDropdown = ({ currentMode, onModeChange }: ModeDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const current = modes.find((m) => m.id === currentMode) || modes[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-md",
          "hover:bg-muted/50 transition-colors",
          "text-xs text-muted-foreground"
        )}
      >
        <span>{current.emoji}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronUp className={cn(
          "w-3 h-3 transition-transform",
          !isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className={cn(
            "absolute bottom-full left-0 mb-1 z-50",
            "bg-popover border rounded-lg shadow-md overflow-hidden",
            "animate-in fade-in slide-in-from-bottom-1 duration-150"
          )}>
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  onModeChange(mode.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-left",
                  "hover:bg-muted/50 transition-colors text-sm",
                  mode.id === currentMode && "bg-muted"
                )}
              >
                <span>{mode.emoji}</span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ModeDropdown;
