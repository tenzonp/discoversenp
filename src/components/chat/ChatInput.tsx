import { useState, useRef, useEffect } from "react";
import { Send, Image, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import ModeDropdown from "./ModeDropdown";
import { ChatMode } from "./ModeSelector";

interface ChatInputProps {
  onSend: (message: string, imageUrl?: string, generateImagePrompt?: string, webSearchQuery?: string) => void;
  isLoading: boolean;
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const ChatInput = ({ onSend, isLoading, currentMode, onModeChange }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [voiceLang] = useState<"ne-NP" | "en-US">("ne-NP");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isGenerating, remaining, checkRemaining } = useImageGeneration();

  const { 
    isListening, 
    toggleListening,
  } = useVoiceInput({
    language: voiceLang,
    onResult: (result) => {
      if (result.isFinal) setInput(prev => prev + result.transcript + " ");
    },
    onError: () => {}
  });

  useEffect(() => { checkRemaining(); }, [checkRemaining]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 140) + "px";
    }
  }, [input]);

  const isImageRequest = (text: string) => {
    const triggers = [
      /^generate\s+/i, /^create\s+/i, /^draw\s+/i, /^make\s+/i,
      /^banau\s+/i, /^bana\s+/i, /image\s+banau/i, /photo\s+banau/i,
      /^imagine\s+/i, /picture\s+of/i
    ];
    return triggers.some(t => t.test(text.trim()));
  };

  const extractImagePrompt = (text: string) => {
    return text.replace(/^(generate|create|draw|make|banau|bana|imagine)\s+/i, "")
               .replace(/\s*(image|photo|picture)\s*(banau|of)?\s*/i, " ")
               .trim();
  };

  const isExplicitWebSearchRequest = (text: string) => {
    const triggers = [
      /^search\s+/i, /^google\s+/i, /^find\s+/i, /^lookup\s+/i, /^look up\s+/i,
      /^khoja\s+/i, /^khoj\s+/i, /web\s+search/i, /internet\s+search/i
    ];
    return triggers.some(t => t.test(text.trim()));
  };

  const extractSearchQuery = (text: string) => {
    return text.replace(/^(search|google|find|lookup|look up|khoja|khoj)\s+(for\s+)?/i, "")
               .replace(/\s*(web|internet)\s*search\s*/i, " ")
               .trim();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File dherai thulo", description: "5MB bhanda sano", variant: "destructive" });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;
    setIsUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Login gara pahila", variant: "destructive" });
        return null;
      }
      const fileExt = selectedImage.name.split(".").pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from("chat-images").upload(fileName, selectedImage);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("chat-images").getPublicUrl(fileName);
      return publicUrl;
    } catch {
      toast({ title: "Upload fail", variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if ((!input.trim() && !selectedImage) || isLoading || isUploading || isGenerating) return;

    const trimmedInput = input.trim();

    if (isExplicitWebSearchRequest(trimmedInput)) {
      const query = extractSearchQuery(trimmedInput);
      if (query) {
        setInput("");
        onSend(trimmedInput, undefined, undefined, query);
        return;
      }
    }

    if (isImageRequest(trimmedInput) && remaining && remaining > 0) {
      const prompt = extractImagePrompt(trimmedInput);
      if (prompt) {
        setInput("");
        onSend(trimmedInput, undefined, prompt);
        return;
      }
    }

    let imageUrl: string | undefined;
    if (selectedImage) {
      const url = await uploadImage();
      if (url) imageUrl = url;
      else if (selectedImage) return;
    }

    onSend(trimmedInput, imageUrl);
    setInput("");
    removeImage();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = (input.trim() || selectedImage) && !isLoading && !isUploading && !isGenerating;

  return (
    <div className="bg-background px-4 py-4 safe-area-bottom">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img src={imagePreview} alt="Selected" className="max-h-20 rounded-xl object-cover" />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center shadow-soft"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 max-w-2xl mx-auto">
        <div className="flex items-end gap-3">
          {/* Image Upload - Subtle */}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors duration-300 flex-shrink-0 mb-0.5"
            disabled={isLoading}
          >
            <Image className="w-4 h-4 text-muted-foreground/50" />
          </button>

          {/* Text Input - Clean, minimal, no borders */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Sunirako..." : "Lekhnus..."}
              rows={1}
              className={cn(
                "w-full resize-none bg-secondary/60 rounded-2xl px-4 py-3 pr-12",
                "text-foreground placeholder:text-muted-foreground/50",
                "focus:outline-none focus:bg-secondary",
                "transition-all duration-300",
                "text-[15px] leading-relaxed",
                isListening && "bg-accent/5"
              )}
              disabled={isLoading}
            />

            {/* Send Button - Minimal, appears on content */}
            <button
              onClick={handleSubmit}
              disabled={!canSend}
              className={cn(
                "absolute right-2 bottom-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                canSend
                  ? "bg-foreground text-background scale-100"
                  : "bg-transparent text-muted-foreground/30 scale-95"
              )}
            >
              {isUploading || isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Mode Selector - Like Perplexity */}
        <div className="flex items-center justify-start pl-12">
          <ModeDropdown currentMode={currentMode} onModeChange={onModeChange} />
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
