import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatMode = "friend";

interface ModeSelectorProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const modes = [
  {
    id: "friend" as ChatMode,
    label: "Sathi",
    icon: Users,
    description: "Casual chat",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const ModeSelector = ({ currentMode, onModeChange }: ModeSelectorProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 whitespace-nowrap",
            currentMode === mode.id
              ? `${mode.bgColor} border-current ${mode.color}`
              : "bg-card border-border hover:border-muted-foreground/30"
          )}
        >
          <mode.icon className={cn("w-4 h-4", currentMode === mode.id ? mode.color : "text-muted-foreground")} />
          <div className="text-left">
            <p className={cn(
              "text-sm font-medium",
              currentMode === mode.id ? mode.color : "text-foreground"
            )}>
              {mode.label}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;
