import { Copy, Check, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import type { Message } from "@/hooks/useChatHistory";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface ChatMessageProps {
  message: Message;
  autoSpeak?: boolean;
}

const ChatMessage = ({ message, autoSpeak = false }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const { speak, stop, isSpeaking, isEnabled } = useTextToSpeech();
  const [hasSpoken, setHasSpoken] = useState(false);

  // Extract image URL and clean text
  const imageMatch = message.content.match(/\[(?:Generated )?Image: (https?:\/\/[^\]]+)\]/);
  const imageUrl = imageMatch?.[1] || message.imageUrl;
  
  // Clean the text content - remove image markers and prefixes
  let textContent = message.content
    .replace(/\[(?:Generated )?Image: https?:\/\/[^\]]+\]\n*/g, "")
    .replace(/^Generated: ?"[^"]*"\s*/i, "")
    .trim();

  // If it's just a generated image message with no other text, show a nice label
  const isImageOnly = imageUrl && !textContent;

  // Auto-speak assistant messages when enabled
  useEffect(() => {
    if (autoSpeak && !isUser && isEnabled && textContent && !hasSpoken) {
      speak(textContent);
      setHasSpoken(true);
    }
  }, [autoSpeak, isUser, isEnabled, textContent, hasSpoken, speak]);

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent || "Image");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(textContent || "Generated image");
    }
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
          <div className="absolute -bottom-6 left-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleSpeak}
              className="p-1 rounded hover:bg-secondary"
              title={isSpeaking ? "Stop speaking" : "Read aloud"}
            >
              {isSpeaking ? (
                <VolumeX className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-secondary"
              title="Copy"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;