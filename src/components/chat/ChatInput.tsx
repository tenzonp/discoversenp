import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Image, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSend: (message: string, imageUrl?: string) => void;
  isLoading: boolean;
}

const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"ne-NP" | "en-US">("ne-NP");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { 
    isListening, 
    transcript, 
    isSupported: voiceSupported, 
    toggleListening,
    setTranscript 
  } = useVoiceInput({
    language: voiceLang,
    onResult: (result) => {
      if (result.isFinal) {
        setInput(prev => prev + result.transcript + " ");
      }
    },
    onError: (error) => {
      toast({
        title: "Voice Error",
        description: error === "not-allowed" 
          ? "Please allow microphone access" 
          : "Voice recognition failed",
        variant: "destructive",
      });
    }
  });

  // Update input with transcript while listening
  useEffect(() => {
    if (isListening && transcript) {
      // Show interim results in real-time
    }
  }, [transcript, isListening]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;

    setIsUploading(true);
    try {
      const fileExt = selectedImage.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `chat/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("homework-images")
        .upload(filePath, selectedImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("homework-images")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if ((!input.trim() && !selectedImage) || isLoading || isUploading) return;

    let imageUrl: string | undefined;
    
    if (selectedImage) {
      const url = await uploadImage();
      if (url) {
        imageUrl = url;
      }
    }

    onSend(input, imageUrl);
    setInput("");
    removeImage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleVoiceLang = () => {
    setVoiceLang(prev => prev === "ne-NP" ? "en-US" : "ne-NP");
  };

  return (
    <div className="p-3 border-t border-border bg-card/80 backdrop-blur-sm safe-area-bottom">
      {/* Image Preview */}
      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-2">
          <div className="relative inline-block">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="h-20 w-auto rounded-lg border border-border"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        {/* Image Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isUploading}
          className="h-11 w-11 flex-shrink-0 rounded-full"
        >
          <Image className="w-5 h-5 text-muted-foreground" />
        </Button>

        {/* Voice Input Button */}
        {voiceSupported && (
          <div className="flex flex-col items-center gap-1">
            <Button
              variant={isListening ? "default" : "ghost"}
              size="icon"
              onClick={toggleListening}
              disabled={isLoading}
              className={cn(
                "h-11 w-11 flex-shrink-0 rounded-full transition-all",
                isListening && "bg-red-500 hover:bg-red-600 animate-pulse"
              )}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5 text-muted-foreground" />
              )}
            </Button>
            <button
              onClick={toggleVoiceLang}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              {voiceLang === "ne-NP" ? "🇳🇵" : "🇺🇸"}
            </button>
          </div>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "बोल्नुहोस्... Listening..." : "Message Bhote... (Nepali, English, Roman)"}
            rows={1}
            className={cn(
              "w-full px-4 py-3 pr-12 rounded-2xl bg-muted border-0",
              "focus:outline-none focus:ring-2 focus:ring-primary/30",
              "text-sm resize-none placeholder:text-muted-foreground/60",
              "transition-all duration-200",
              isListening && "ring-2 ring-red-500/50"
            )}
            disabled={isLoading}
          />
          {isListening && transcript && (
            <div className="absolute left-4 right-4 bottom-full mb-1 text-xs text-muted-foreground bg-muted rounded px-2 py-1">
              {transcript}
            </div>
          )}
        </div>

        <Button
          variant="chat"
          size="icon"
          onClick={handleSubmit}
          disabled={(!input.trim() && !selectedImage) || isLoading || isUploading}
          className={cn(
            "h-11 w-11 flex-shrink-0 transition-all duration-300",
            (input.trim() || selectedImage) && !isLoading ? "scale-100 opacity-100" : "scale-95 opacity-70"
          )}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className={cn("w-4 h-4", isLoading && "animate-pulse")} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
