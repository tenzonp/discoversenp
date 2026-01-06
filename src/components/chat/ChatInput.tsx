import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Image, X, Loader2, Sparkles, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  onSend: (message: string, imageUrl?: string) => void;
  isLoading: boolean;
}

const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"ne-NP" | "en-US">("en-US");
  const [showImageGen, setShowImageGen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
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
      if (result.isFinal) {
        setInput(prev => prev + result.transcript + " ");
      }
    },
    onError: () => {}
  });

  useEffect(() => {
    checkRemaining();
  }, [checkRemaining]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + "px";
    }
  }, [input]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
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
        toast({ title: "Login Required", variant: "destructive" });
        return null;
      }
      const fileExt = selectedImage.name.split(".").pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from("chat-images").upload(fileName, selectedImage);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("chat-images").getPublicUrl(fileName);
      return publicUrl;
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    const imageUrl = await generateImage(imagePrompt);
    if (imageUrl) {
      onSend(`Generated: "${imagePrompt}"`, imageUrl);
      setImagePrompt("");
      setShowImageGen(false);
    }
  };

  const handleSubmit = async () => {
    if ((!input.trim() && !selectedImage) || isLoading || isUploading) return;
    let imageUrl: string | undefined;
    if (selectedImage) {
      const url = await uploadImage();
      if (url) imageUrl = url;
      else if (selectedImage) return;
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

        <Popover open={showImageGen} onOpenChange={setShowImageGen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isLoading || isGenerating} className="h-10 w-10 rounded-full flex-shrink-0 relative">
              <ImagePlus className="w-5 h-5" />
              {remaining !== null && remaining > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-[10px] rounded-full flex items-center justify-center font-bold text-accent-foreground">
                  {remaining}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="start">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="font-medium text-sm">Generate Image</span>
                <span className="text-xs text-muted-foreground ml-auto">{remaining}/5</span>
              </div>
              <Input
                placeholder="Describe the image..."
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerateImage()}
                disabled={isGenerating || remaining === 0}
              />
              <Button onClick={handleGenerateImage} disabled={!imagePrompt.trim() || isGenerating || remaining === 0} className="w-full" size="sm">
                {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : remaining === 0 ? "Limit reached" : "Generate"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

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
            placeholder={isListening ? "Listening..." : "Message..."}
            rows={1}
            className={cn(
              "w-full px-4 py-2.5 rounded-2xl bg-secondary border-0 text-sm resize-none placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-1 focus:ring-foreground/20",
              isListening && "ring-1 ring-red-500"
            )}
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={(!input.trim() && !selectedImage) || isLoading || isUploading}
          className="h-10 w-10 rounded-full flex-shrink-0 bg-foreground text-background hover:bg-foreground/90"
          size="icon"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;