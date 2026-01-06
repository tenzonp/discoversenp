import { ArrowLeft, MoreVertical, Trash2, History, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface ChatHeaderProps {
  onBack: () => void;
  onClear: () => void;
  onShowHistory?: () => void;
}

const ChatHeader = ({ onBack, onClear, onShowHistory }: ChatHeaderProps) => {
  const { isEnabled, isSupported, toggleEnabled } = useTextToSpeech();

  return (
    <header className="sticky top-0 z-50 px-3 py-3 border-b border-border bg-background/80 backdrop-blur-xl safe-area-top">
      <div className="flex items-center gap-3 max-w-2xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center">
            <span className="text-sm text-primary-foreground font-bold">भ</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm">Bhote</h1>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>

        {isSupported && (
          <Button
            variant={isEnabled ? "default" : "ghost"}
            size="icon"
            onClick={toggleEnabled}
            className="h-9 w-9 rounded-full"
            title={isEnabled ? "Turn off voice" : "Turn on voice"}
          >
            {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {onShowHistory && (
              <DropdownMenuItem onClick={onShowHistory}>
                <History className="w-4 h-4 mr-2" />
                History
              </DropdownMenuItem>
            )}
            {isSupported && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleEnabled}>
                  {isEnabled ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                  {isEnabled ? "Disable Voice" : "Enable Voice"}
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onClear} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default ChatHeader;