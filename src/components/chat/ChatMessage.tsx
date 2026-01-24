import { Copy, Check, Volume2, VolumeX, Bookmark, BookmarkCheck, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import type { Message } from "@/hooks/useChatHistory";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useStudyNotes } from "@/hooks/useStudyNotes";
import { useFlashcards } from "@/hooks/useFlashcards";
import { toast } from "sonner";

interface ChatMessageProps {
  message: Message;
  autoSpeak?: boolean;
  isLatest?: boolean;
  userId?: string;
  examClass?: string;
  examSubject?: string;
}

const ChatMessage = ({ message, autoSpeak = false, isLatest = false, userId, examClass, examSubject }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(!isLatest);
  const { speak, stop, isSpeaking, isEnabled } = useTextToSpeech();
  const [hasSpoken, setHasSpoken] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isCardCreated, setIsCardCreated] = useState(false);
  const { saveNote, generateTitleFromContent, detectSubjectFromContent } = useStudyNotes();
  const { createFlashcard } = useFlashcards(userId);

  // Human-like delayed appearance
  useEffect(() => {
    if (isLatest && !visible) {
      const timer = setTimeout(() => setVisible(true), isUser ? 80 : 400);
      return () => clearTimeout(timer);
    }
  }, [isLatest, visible, isUser]);

  // Extract image URL and clean text
  const imageMatch = message.content.match(/\[(?:Generated )?Image: (https?:\/\/[^\]]+)\]/);
  const imageUrl = imageMatch?.[1] || message.imageUrl;
  
  // Clean the text content
  let textContent = message.content
    .replace(/\[(?:Generated )?Image: https?:\/\/[^\]]+\]\n*/g, "")
    .replace(/^Generated: ?"[^"]*"\s*/i, "")
    .trim();

  const isImageOnly = imageUrl && !textContent;

  // Auto-speak
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

  const handleSaveNote = async () => {
    if (!userId || !textContent) {
      toast.error('Please log in to save notes');
      return;
    }
    
    const title = generateTitleFromContent(textContent);
    const detectedSubject = examSubject || detectSubjectFromContent(textContent);
    
    const result = await saveNote({
      userId,
      title,
      content: textContent,
      subject: detectedSubject,
      classLevel: examClass || undefined,
      sourceMessageId: message.id
    });
    
    if (result) {
      setIsSaved(true);
    }
  };

  const handleCreateFlashcard = async () => {
    if (!userId || !textContent) {
      toast.error('Please log in to create flashcards');
      return;
    }
    
    // Auto-generate Q&A format
    const title = generateTitleFromContent(textContent);
    const detectedSubject = examSubject || detectSubjectFromContent(textContent);
    
    // Create question from title and answer from content
    const question = `Explain: ${title}`;
    
    const result = await createFlashcard(question, textContent, detectedSubject || 'general');
    
    if (result) {
      setIsCardCreated(true);
      toast.success('Flashcard created! 📚', {
        description: 'Review it in the Flashcards panel'
      });
    }
  };

  if (!visible) return null;

  return (
    <div 
      className={cn(
        "flex gap-3 group animate-thought-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "relative",
        isUser
          ? "thought-self"
          : "thought-other",
        imageUrl && !isUser && "p-0"
      )}>
        {/* Image */}
        {imageUrl && (
          <div className={cn(isUser ? "mb-2" : "mb-2")}>
            <img 
              src={imageUrl} 
              alt="Generated" 
              className="max-w-full rounded-2xl max-h-72 object-contain" 
              loading="lazy" 
            />
            {isImageOnly && !isUser && (
              <p className="text-xs text-muted-foreground/60 mt-2">✨ Discoverse generated</p>
            )}
          </div>
        )}

        {/* Text - Feels like thoughts, not messages */}
        {textContent && (
          <p className={cn(
            "whitespace-pre-wrap break-words leading-relaxed",
            isUser ? "text-[15px]" : "text-base",
            !isUser && "text-foreground"
          )}>
            {textContent}
          </p>
        )}
        
        {/* Actions - Ultra subtle, only on hover */}
        {!isUser && (textContent || imageUrl) && (
          <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleSpeak}
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
              title={isSpeaking ? "Stop" : "Read aloud"}
            >
              {isSpeaking ? (
                <VolumeX className="w-3.5 h-3.5 text-accent" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground/50" />
              )}
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
              title="Copy"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-teal" />
              ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground/50" />
            )}
          </button>
          {userId && (
            <>
              <button
                onClick={handleSaveNote}
                className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                title={isSaved ? "Saved" : "Save to notes"}
                disabled={isSaved}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5 text-muted-foreground/50" />
                )}
              </button>
              <button
                onClick={handleCreateFlashcard}
                className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                title={isCardCreated ? "Card created" : "Create flashcard"}
                disabled={isCardCreated}
              >
                {isCardCreated ? (
                  <Layers className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
                )}
              </button>
            </>
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
