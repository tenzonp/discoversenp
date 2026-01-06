import { Bot, User, Share2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Message } from "@/hooks/useChatHistory";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const imageMatch = message.content.match(/\[Image: (https?:\/\/[^\]]+)\]/);
  const imageUrl = imageMatch?.[1] || message.imageUrl;
  const textContent = message.content.replace(/\[Image: https?:\/\/[^\]]+\]\n*/g, "").trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: textContent });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className={cn("flex items-end gap-2 group", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
        isUser ? "bg-secondary/20" : "gradient-bg"
      )}>
        {isUser ? <User className="w-3.5 h-3.5 text-secondary" /> : <span className="text-xs text-primary-foreground font-bold">भ</span>}
      </div>

      <div className={cn(
        "max-w-[80%] px-4 py-3 text-sm leading-relaxed relative",
        isUser
          ? "bg-secondary text-secondary-foreground rounded-2xl rounded-br-md"
          : "bg-card border border-border rounded-2xl rounded-bl-md"
      )}>
        {imageUrl && (
          <div className="mb-2">
            <img src={imageUrl} alt="Image" className="max-w-full rounded-lg max-h-64 object-contain" loading="lazy" />
          </div>
        )}
        {textContent && <p className="whitespace-pre-wrap break-words">{textContent}</p>}
        
        {!isUser && textContent && (
          <div className="absolute -bottom-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleShare}>
              <Share2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
