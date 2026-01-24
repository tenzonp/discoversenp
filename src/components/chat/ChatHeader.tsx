import { ArrowLeft, MoreVertical, Phone, History, Image, Trash2, Share2, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import DiscoverseText from "@/components/DiscoverseText";
import { useState } from "react";
import VoiceChatModal from "./VoiceChatModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ChatHeaderProps {
  onBack: () => void;
  onClear: () => void;
  onShowHistory?: () => void;
  onShowGallery?: () => void;
  onShareChat?: () => void;
  conversationId?: string | null;
}

const ChatHeader = ({ onBack, onClear, onShowHistory, onShowGallery, onShareChat, conversationId }: ChatHeaderProps) => {
  const [showVoice, setShowVoice] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    if (!conversationId) {
      toast({
        title: "No chat to share",
        description: "Start a conversation first",
      });
      return;
    }
    
    const shareUrl = `${window.location.origin}/shared?id=${conversationId}`;
    await navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied! 🔗",
      description: "Share this conversation with anyone",
    });
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm sticky top-0 z-40 safe-area-top">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="w-8 h-8 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <DiscoverseText size="sm" showVersion />
        </div>

        <div className="flex items-center gap-1">
          {/* Voice Call - Primary action */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVoice(true)}
            className="w-9 h-9 rounded-full text-accent hover:bg-accent/10"
          >
            <Phone className="w-4 h-4" />
          </Button>

          {/* More Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-full"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onShowGallery && (
                <DropdownMenuItem onClick={onShowGallery} className="gap-3">
                  <Image className="w-4 h-4" />
                  <span>Image Gallery</span>
                </DropdownMenuItem>
              )}
              {onShowHistory && (
                <DropdownMenuItem onClick={onShowHistory} className="gap-3">
                  <History className="w-4 h-4" />
                  <span>Chat History</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleCopyLink} className="gap-3">
                <Link className="w-4 h-4" />
                <span>Copy Chat Link</span>
              </DropdownMenuItem>
              
              {onShareChat && (
                <DropdownMenuItem onClick={onShareChat} className="gap-3">
                  <Share2 className="w-4 h-4" />
                  <span>Share Chat</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={onClear} className="gap-3 text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4" />
                <span>Clear Chat</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </div>
      </header>

      <VoiceChatModal 
        isOpen={showVoice} 
        onClose={() => setShowVoice(false)} 
      />
    </>
  );
};

export default ChatHeader;
