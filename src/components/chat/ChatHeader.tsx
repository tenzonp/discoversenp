import { ArrowLeft, MoreVertical, Trash2, History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
  onBack: () => void;
  onClear: () => void;
  onShowHistory?: () => void;
}

const ChatHeader = ({ onBack, onClear, onShowHistory }: ChatHeaderProps) => {
  return (
    <header className="flex items-center justify-between px-5 py-4 bg-background safe-area-top">
      {/* Left - Back */}
      <button
        onClick={onBack}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors duration-300"
        aria-label="Back"
      >
        <ArrowLeft className="w-4 h-4 text-muted-foreground/70" />
      </button>
      
      {/* Center - Minimal identity */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
          <span className="text-accent text-xs font-medium">भ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-teal/70 animate-breathe" />
          <span className="text-xs text-muted-foreground/60">Online</span>
        </div>
      </div>

      {/* Right - Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors duration-300"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground/50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 rounded-xl border-border/50">
          {onShowHistory && (
            <DropdownMenuItem onClick={onShowHistory} className="gap-2 py-2.5 rounded-lg text-muted-foreground">
              <History className="w-3.5 h-3.5" />
              <span className="text-sm">History</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onClear} className="gap-2 py-2.5 rounded-lg text-destructive/80 focus:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-sm">Clear</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default ChatHeader;
