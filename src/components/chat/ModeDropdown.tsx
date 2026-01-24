import { useState } from "react";
import { ChevronDown, MessageCircle, Briefcase, GraduationCap, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMode } from "./ModeSelector";

interface ModeDropdownProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const modes: { id: ChatMode; label: string; labelNe: string; icon: React.ElementType; color: string }[] = [
  { id: "friend", label: "Sathi", labelNe: "साथी", icon: MessageCircle, color: "text-teal" },
  { id: "professional", label: "Pro", labelNe: "प्रो", icon: Briefcase, color: "text-blue-500" },
  { id: "exam", label: "Study", labelNe: "पढाई", icon: GraduationCap, color: "text-amber-500" },
  { id: "cultural", label: "Nepali", labelNe: "नेपाली", icon: Heart, color: "text-rose-500" },
];

const ModeDropdown = ({ currentMode, onModeChange }: ModeDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const current = modes.find((m) => m.id === currentMode) || modes[0];
  const Icon = current.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full",
          "bg-secondary/60 hover:bg-secondary transition-all duration-200",
          "text-xs font-medium text-muted-foreground"
        )}
      >
        <Icon className={cn("w-3.5 h-3.5", current.color)} />
        <span>{current.label}</span>
        <ChevronDown className={cn(
          "w-3 h-3 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className={cn(
            "absolute bottom-full left-0 mb-2 z-50",
            "bg-card border border-border rounded-xl shadow-lg overflow-hidden",
            "min-w-[160px] animate-in fade-in slide-in-from-bottom-2 duration-200"
          )}>
            {modes.map((mode) => {
              const ModeIcon = mode.icon;
              const isActive = mode.id === currentMode;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    onModeChange(mode.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3",
                    "text-left hover:bg-secondary/50 transition-colors",
                    isActive && "bg-secondary"
                  )}
                >
                  <ModeIcon className={cn("w-4 h-4", mode.color)} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {mode.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {mode.labelNe}
                    </span>
                  </div>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ModeDropdown;
