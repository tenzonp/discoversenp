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
  X,
  AlertCircle
} from "lucide-react";
import ChatMessage from "@/components/chat/ChatMessage";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { useToast } from "@/hooks/use-toast";

const MAX_MESSAGES = 100;

const subjects = [
  { icon: Calculator, name: "Math", color: "bg-blue-500" },
  { icon: FlaskConical, name: "Science", color: "bg-green-500" },
  { icon: Globe, name: "Social", color: "bg-amber-500" },
  { icon: BookText, name: "Nepali", color: "bg-red-500" },
  { icon: Languages, name: "English", color: "bg-purple-500" },
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

  const isLimitReached = messages.length >= MAX_MESSAGES;

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Max 5MB" });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('homework-images').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('homework-images').getPublicUrl(fileName);
      setUploadedImage(publicUrl);
      toast({ title: "Image uploaded!" });
    } catch {
      toast({ variant: "destructive", title: "Upload failed" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = () => {
    if ((!inputValue.trim() && !uploadedImage) || isLimitReached) return;
    let content = selectedSubject ? `[${selectedSubject}] ` : "";
    if (uploadedImage) content += `[Image: ${uploadedImage}]\n\n`;
    content += inputValue || "Help me solve this.";
    sendMessage(content);
    setInputValue("");
    setUploadedImage(null);
  };

  const startSubject = (name: string) => {
    setSelectedSubject(name);
    sendMessage(`[Student - ${name}] Hello! I need help with ${name}. Explain step by step.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => messages.length ? (clearChat(), setSelectedSubject(null)) : navigate("/")} className="rounded-full h-9 w-9">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">Student</h1>
            <p className="text-xs text-muted-foreground">{selectedSubject || "Homework Help"}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => { clearChat(); setSelectedSubject(null); }} className="text-xs">
            New
          </Button>
        )}
      </header>

      {messages.length === 0 ? (
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-500 flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Student Mode</h2>
            <p className="text-muted-foreground text-sm">Homework help with step-by-step explanations</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {subjects.map((s) => (
              <button key={s.name} onClick={() => startSubject(s.name)} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-all">
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium">{s.name}</span>
              </button>
            ))}
          </div>

          <button onClick={() => fileInputRef.current?.click()} className="w-full p-6 rounded-xl border-2 border-dashed border-border hover:border-foreground/30 transition-all flex flex-col items-center gap-2">
            <Camera className="w-8 h-8 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium text-sm">Upload Photo</p>
              <p className="text-xs text-muted-foreground">Take a picture of your question</p>
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => <ChatMessage key={m.id} message={m} />)}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {uploadedImage && (
            <div className="px-4 py-2 border-t border-border">
              <div className="relative inline-block">
                <img src={uploadedImage} alt="Homework" className="h-16 rounded-lg" />
                <button onClick={() => setUploadedImage(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {isLimitReached ? (
            <div className="p-4 border-t border-border bg-secondary/50">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <AlertCircle className="w-5 h-5" />
                <p>100 message limit reached. Start a new session.</p>
              </div>
            </div>
          ) : (
            <div className="safe-area-bottom p-3 border-t border-border bg-background">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="h-10 w-10 rounded-full">
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                </Button>
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-secondary border-0 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                />
                <Button onClick={handleSend} disabled={(!inputValue.trim() && !uploadedImage) || isLoading} className="h-10 w-10 rounded-full bg-teal-500 hover:bg-teal-600" size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Student;