import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/hooks/useChatHistory";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  // Extract image URL from content if present
  const imageMatch = message.content.match(/\[Image: (https?:\/\/[^\]]+)\]/);
  const imageUrl = imageMatch?.[1] || message.imageUrl;
  const textContent = message.content.replace(/\[Image: https?:\/\/[^\]]+\]\n*/g, "").trim();

  return (
    <div
      className={cn(
        "flex items-end gap-2 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "gradient-bg text-primary-foreground"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[80%] px-4 py-3 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-secondary text-secondary-foreground rounded-2xl rounded-br-md"
            : "bg-card border border-border rounded-2xl rounded-bl-md"
        )}
      >
        {/* Image if present */}
        {imageUrl && (
          <div className="mb-2">
            <img 
              src={imageUrl} 
              alt="Uploaded" 
              className="max-w-full rounded-lg max-h-64 object-contain"
              loading="lazy"
            />
          </div>
        )}
        
        {/* Text content */}
        {textContent && (
          <p className="whitespace-pre-wrap break-words">{textContent}</p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
