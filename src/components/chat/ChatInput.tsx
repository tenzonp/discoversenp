import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Image, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useImageGeneration } from "@/hooks/useImageGeneration";

interface ChatInputProps {
  onSend: (message: string, imageUrl?: string, generateImagePrompt?: string) => void;
  isLoading: boolean;
}

const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"ne-NP" | "en-US">("en-US");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isGenerating, remaining, generateImage, checkRemaining } = useImageGeneration();

  const { 
    isListening, 
    transcript, 
    isSupported: voiceSupported, 
    toggleListening,
  } = useVoiceInput({
    language: voiceLang,
    onResult: (result) => {
      if (result.isFinal) setInput(prev => prev + result.transcript + " ");
    },
    onError: () => {}
  });

  useEffect(() => { checkRemaining(); }, [checkRemaining]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + "px";
    }
  }, [input]);

  // Check if input is an image generation request
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File dherai thulo", description: "5MB bhanda sano file use gara", variant: "destructive" });
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
      toast({ title: "Upload fail bhayo", variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if ((!input.trim() && !selectedImage) || isLoading || isUploading || isGenerating) return;

    const trimmedInput = input.trim();

    // Check if this is an image generation request
    if (isImageRequest(trimmedInput) && remaining && remaining > 0) {
      const prompt = extractImagePrompt(trimmedInput);
      if (prompt) {
        setInput("");
        // Send the user message first, with flag to trigger image generation
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 border-t border-border bg-background safe-area-bottom">
      {imagePreview && (
        <div className="max-w-2xl mx-auto mb-2">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-16 rounded-lg border border-border" />
            <button onClick={removeImage} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 max-w-2xl mx-auto">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        
        <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading || isUploading} className="h-10 w-10 rounded-full flex-shrink-0">
          <Image className="w-5 h-5" />
        </Button>

        {voiceSupported && (
          <Button
            variant={isListening ? "default" : "ghost"}
            size="icon"
            onClick={toggleListening}
            disabled={isLoading}
            className={cn("h-10 w-10 rounded-full flex-shrink-0", isListening && "bg-red-500 hover:bg-red-600")}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Sunirako..." : "Message lekha... (\"draw cat\" for images)"}
            rows={1}
            className={cn(
              "w-full px-4 py-2.5 rounded-2xl bg-secondary border-0 text-sm resize-none placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-1 focus:ring-foreground/20",
              isListening && "ring-1 ring-red-500"
            )}
            disabled={isLoading}
          />
          {remaining !== null && remaining > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3" />
              {remaining}
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={(!input.trim() && !selectedImage) || isLoading || isUploading || isGenerating}
          className="h-10 w-10 rounded-full flex-shrink-0 bg-foreground text-background hover:bg-foreground/90"
          size="icon"
        >
          {isUploading || isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;