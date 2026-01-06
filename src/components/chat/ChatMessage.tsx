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

  // Extract image URL and clean text
  const imageMatch = message.content.match(/\[Image: (https?:\/\/[^\]]+)\]/);
  const imageUrl = imageMatch?.[1] || message.imageUrl;
  
  // Clean the text content - remove image markers and "Generated:" prefix
  let textContent = message.content
    .replace(/\[Image: https?:\/\/[^\]]+\]\n*/g, "")
    .replace(/^Generated: ?"[^"]*"\s*/i, "")
    .trim();

  // If it's just a generated image message with no other text, show a nice label
  const isImageOnly = imageUrl && !textContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent || "Image");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex gap-2 group", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[85%] text-sm leading-relaxed relative",
        isUser
          ? "bg-foreground text-background rounded-2xl rounded-br-md px-4 py-2.5"
          : "bg-secondary text-foreground rounded-2xl rounded-bl-md",
        imageUrl && !isUser && "p-2",
        !imageUrl && !isUser && "px-4 py-2.5"
      )}>
        {imageUrl && (
          <div className={cn(isUser ? "mb-2" : "")}>
            <img 
              src={imageUrl} 
              alt="Generated" 
              className="max-w-full rounded-xl max-h-64 object-contain" 
              loading="lazy" 
            />
            {isImageOnly && !isUser && (
              <p className="text-xs text-muted-foreground mt-2 px-2">✨ AI generated image</p>
            )}
          </div>
        )}
        {textContent && <p className={cn("whitespace-pre-wrap break-words", imageUrl && !isUser && "px-2 pb-1")}>{textContent}</p>}
        
        {!isUser && (textContent || imageUrl) && (
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