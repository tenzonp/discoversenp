import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
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

  return (
    <div className={cn("flex gap-2 group", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[85%] px-4 py-2.5 text-sm leading-relaxed relative",
        isUser
          ? "bg-foreground text-background rounded-2xl rounded-br-md"
          : "bg-secondary text-foreground rounded-2xl rounded-bl-md"
      )}>
        {imageUrl && (
          <div className="mb-2">
            <img src={imageUrl} alt="Image" className="max-w-full rounded-lg max-h-56 object-contain" loading="lazy" />
          </div>
        )}
        {textContent && <p className="whitespace-pre-wrap break-words">{textContent}</p>}
        
        {!isUser && textContent && (
          <button
            onClick={handleCopy}
            className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-secondary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;