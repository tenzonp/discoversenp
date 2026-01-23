import { ArrowLeft, MoreVertical, Volume2, VolumeX, Trash2, History } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
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
  const { isEnabled, toggleEnabled, isSupported } = useTextToSpeech();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm safe-area-top">
      {/* Left - Back */}
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        aria-label="Back"
      >
        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
      </button>
      
      {/* Center - Avatar & Status */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full gradient-warm flex items-center justify-center shadow-soft">
          <span className="text-sm text-white font-semibold">भ</span>
        </div>
        <div>
          <h1 className="text-base font-semibold text-foreground">Bhote</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-teal animate-breathe" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </div>

      {/* Right - Menu */}
      <div className="flex items-center gap-1">
        {isSupported && (
          <button
            onClick={toggleEnabled}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            title={isEnabled ? "Mute voice" : "Enable voice"}
          >
            {isEnabled ? (
              <Volume2 className="w-5 h-5 text-accent" />
            ) : (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl">
            {onShowHistory && (
              <DropdownMenuItem onClick={onShowHistory} className="gap-2 py-2.5 rounded-lg">
                <History className="w-4 h-4" />
                <span>History</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onClear} className="gap-2 py-2.5 rounded-lg text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4" />
              <span>Clear chat</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default ChatHeader;
