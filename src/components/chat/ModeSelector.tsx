import { Users, BookOpen, Languages, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatMode = "friend" | "loksewa" | "ielts" | "student";

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
  {
    id: "loksewa" as ChatMode,
    label: "Loksewa",
    icon: BookOpen,
    description: "Exam prep",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "ielts" as ChatMode,
    label: "IELTS",
    icon: Languages,
    description: "English practice",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    id: "student" as ChatMode,
    label: "Student",
    icon: GraduationCap,
    description: "Study help",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
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
