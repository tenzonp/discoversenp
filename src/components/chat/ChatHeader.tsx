import { ArrowLeft, MoreVertical, Trash2, History, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onShare?: () => void;
}

const ChatHeader = ({ onBack, onClear, onShowHistory, onShare }: ChatHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 px-3 py-3 border-b border-border bg-background/80 backdrop-blur-lg safe-area-top">
      <div className="flex items-center gap-3 max-w-3xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-primary-foreground font-bold text-sm">
              भ
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-sm">Bhote</h1>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onShowHistory && (
              <DropdownMenuItem onClick={onShowHistory}>
                <History className="w-4 h-4 mr-2" />
                Chat History
              </DropdownMenuItem>
            )}
            {onShare && (
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Chat
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onClear} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default ChatHeader;
