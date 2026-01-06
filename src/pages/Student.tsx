import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useChatHistory } from "@/hooks/useChatHistory";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  GraduationCap, 
  Camera,
  Image as ImageIcon,
  Send,
  Calculator,
  FlaskConical,
  Globe,
  BookText,
  Languages,
  Loader2,
  X
} from "lucide-react";
import ChatMessage from "@/components/chat/ChatMessage";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { useToast } from "@/hooks/use-toast";

const subjects = [
  { icon: Calculator, name: "Math", nepali: "गणित", color: "from-blue-500 to-cyan-500" },
  { icon: FlaskConical, name: "Science", nepali: "विज्ञान", color: "from-green-500 to-emerald-500" },
  { icon: Globe, name: "Social", nepali: "सामाजिक", color: "from-amber-500 to-orange-500" },
  { icon: BookText, name: "Nepali", nepali: "नेपाली", color: "from-red-500 to-rose-500" },
  { icon: Languages, name: "English", nepali: "अंग्रेजी", color: "from-purple-500 to-pink-500" },
];

const Student = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  } = useChatHistory(user?.id, "student");

  const [inputValue, setInputValue] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB"
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('homework-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('homework-images')
        .getPublicUrl(fileName);

      setUploadedImage(publicUrl);
      toast({
        title: "Image uploaded! 📸",
        description: "Ready to analyze your homework"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Please try again"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim() && !uploadedImage) return;

    let messageContent = "";
    
    if (selectedSubject) {
      messageContent = `[${selectedSubject} Homework Help]\n\n`;
    }
    
    if (uploadedImage) {
      messageContent += `[Image attached: ${uploadedImage}]\n\n`;
    }
    
    messageContent += inputValue || "Please help me solve this question from the image.";

    sendMessage(messageContent);
    setInputValue("");
    setUploadedImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startSubjectHelp = (subject: string) => {
    setSelectedSubject(subject);
    sendMessage(`[Student Mode - ${subject}]\n\nHello! I need help with my ${subject} homework. Please act as a friendly tutor who explains things step by step in simple language. Use Nepali when needed to help me understand better.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft">
          <GraduationCap className="w-12 h-12 text-teal-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border/50 bg-card/80 backdrop-blur-lg sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (messages.length > 0) {
              clearChat();
              setSelectedSubject(null);
            } else {
              navigate("/");
            }
          }}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">Student Mode</h1>
            <p className="text-xs text-muted-foreground">
              {selectedSubject || "Homework Help"}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearChat();
              setSelectedSubject(null);
            }}
            className="ml-auto text-xs"
          >
            New Session
          </Button>
        )}
      </header>

      {messages.length === 0 ? (
        /* Subject Selection */
        <div className="flex-1 p-4 space-y-6 overflow-y-auto safe-area-bottom">
          <div className="text-center py-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg mb-4">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Student Mode 📚</h2>
            <p className="text-muted-foreground text-sm">
              Homework help गर्छु • Step-by-step explanation
            </p>
          </div>

          {/* Subject Selection */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-center">Subject छान्नुहोस्:</h3>
            <div className="grid grid-cols-2 gap-3">
              {subjects.map((subject) => (
                <button
                  key={subject.name}
                  onClick={() => startSubjectHelp(subject.name)}
                  className="p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all active:scale-[0.98] text-left"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center mb-2`}>
                    <subject.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold">{subject.name}</h4>
                  <p className="text-xs text-muted-foreground">{subject.nepali}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload Option */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-center">वा Photo upload गर्नुहोस्:</h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-all flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                <Camera className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium">Upload Homework Photo</p>
                <p className="text-xs text-muted-foreground">Question को photo लिनुहोस्</p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Tips */}
          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
            <h4 className="font-medium text-sm mb-2 text-teal-600">💡 Tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Clear photo राख्नुहोस्</li>
              <li>• एक question मात्र राख्नुहोस्</li>
              <li>• Step-by-step explanation माग्नुहोस्</li>
            </ul>
          </div>
        </div>
      ) : (
        /* Chat Interface */
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview */}
          {uploadedImage && (
            <div className="px-4 py-2 border-t border-border/50">
              <div className="relative inline-block">
                <img
                  src={uploadedImage}
                  alt="Uploaded homework"
                  className="h-20 rounded-lg object-cover"
                />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="safe-area-bottom p-4 border-t border-border/50 bg-card/80 backdrop-blur-lg">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-12 w-12 rounded-xl shrink-0"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
              </Button>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Question लेख्नुहोस्..."
                rows={1}
                className="flex-1 px-4 py-3 rounded-xl bg-background border border-border/50 focus:outline-none focus:border-primary resize-none"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
              <Button
                onClick={handleSend}
                disabled={(!inputValue.trim() && !uploadedImage) || isLoading}
                className="h-12 w-12 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Student;
