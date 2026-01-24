import { ArrowLeft, Trash2, History, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import DiscoverseText from "@/components/DiscoverseText";
import { useState } from "react";
import VoiceChatModal from "./VoiceChatModal";

interface ChatHeaderProps {
  onBack: () => void;
  onClear: () => void;
  onShowHistory?: () => void;
}

const ChatHeader = ({ onBack, onClear, onShowHistory }: ChatHeaderProps) => {
  const [showVoice, setShowVoice] = useState(false);

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVoice(true)}
            className="w-8 h-8 rounded-full text-accent"
          >
            <Phone className="w-4 h-4" />
          </Button>
          {onShowHistory && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowHistory}
              className="w-8 h-8 rounded-full"
            >
              <History className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="w-8 h-8 rounded-full"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
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
