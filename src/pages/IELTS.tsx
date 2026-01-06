import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useChatHistory } from "@/hooks/useChatHistory";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Mic, 
  BookOpen, 
  PenLine, 
  Headphones,
  Send,
  MessageCircle
} from "lucide-react";
import ChatMessage from "@/components/chat/ChatMessage";
import TypingIndicator from "@/components/chat/TypingIndicator";

const ieltsTopics = [
  "Describe your hometown and what you like about it.",
  "Talk about a book that had a significant impact on you.",
  "Describe a memorable trip you have taken.",
  "What are the advantages and disadvantages of social media?",
  "Describe a person who has influenced your life.",
  "Talk about your favorite hobby and why you enjoy it.",
  "Describe a challenge you have overcome.",
  "What changes would you like to see in your country's education system?",
];

const IELTS = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearChat 
  } = useChatHistory(user?.id, "ielts");
  
  const [inputValue, setInputValue] = useState("");
  const [selectedMode, setSelectedMode] = useState<"speaking" | "writing" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startPractice = (topic: string) => {
    if (selectedMode === "speaking") {
      sendMessage(`[IELTS Speaking Practice] Topic: ${topic}\n\nHello, I want to practice this speaking topic. Please act as an IELTS examiner and ask me follow-up questions. Give me feedback on my responses.`);
    } else {
      sendMessage(`[IELTS Writing Practice] Topic: ${topic}\n\nI want to practice writing about this topic. Please guide me on structure and vocabulary, then evaluate my response.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft">
          <BookOpen className="w-12 h-12 text-secondary" />
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
            if (selectedMode && messages.length === 0) {
              setSelectedMode(null);
            } else {
              navigate("/");
            }
          }}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">IELTS Practice</h1>
            <p className="text-xs text-muted-foreground">
              {selectedMode === "speaking" ? "Speaking Practice" : selectedMode === "writing" ? "Writing Practice" : "Choose Mode"}
            </p>
          </div>
        </div>
        {selectedMode && messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearChat();
              setSelectedMode(null);
            }}
            className="ml-auto text-xs"
          >
            New Session
          </Button>
        )}
      </header>

      {!selectedMode ? (
        /* Mode Selection */
        <div className="flex-1 p-4 space-y-6">
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg mb-4">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">IELTS Practice</h2>
            <p className="text-muted-foreground">
              Practice with AI examiner for better band scores
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setSelectedMode("speaking")}
              className="w-full p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/30 flex items-center gap-4 hover:border-emerald-500/50 transition-all active:scale-[0.98]"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Speaking Practice</h3>
                <p className="text-sm text-muted-foreground">Practice with AI examiner</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedMode("writing")}
              className="w-full p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/30 flex items-center gap-4 hover:border-blue-500/50 transition-all active:scale-[0.98]"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <PenLine className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Writing Practice</h3>
                <p className="text-sm text-muted-foreground">Get feedback on essays</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/chat")}
              className="w-full p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/30 flex items-center gap-4 hover:border-purple-500/50 transition-all active:scale-[0.98]"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Headphones className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Free Conversation</h3>
                <p className="text-sm text-muted-foreground">Practice English naturally</p>
              </div>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              Tips for Better Score
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Speak naturally, don't memorize scripts</li>
              <li>• Use a variety of vocabulary and structures</li>
              <li>• Practice for 15-20 minutes daily</li>
              <li>• Record yourself and listen back</li>
            </ul>
          </div>
        </div>
      ) : messages.length === 0 ? (
        /* Topic Selection */
        <div className="flex-1 p-4 space-y-6">
          <div className="text-center py-4">
            <h2 className="text-xl font-bold mb-2">
              {selectedMode === "speaking" ? "Speaking Topics" : "Writing Topics"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Select a topic to start practicing
            </p>
          </div>

          <div className="space-y-3">
            {ieltsTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => startPractice(topic)}
                className="w-full p-4 rounded-xl bg-card border border-border/50 text-left hover:border-primary/50 transition-all active:scale-[0.98]"
              >
                <p className="text-sm">{topic}</p>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-sm text-center">
              Or type your own topic below 👇
            </p>
          </div>

          {/* Custom Topic Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your own topic..."
              className="flex-1 px-4 py-3 rounded-xl bg-card border border-border/50 focus:outline-none focus:border-primary"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="h-12 w-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600"
            >
              <Send className="w-5 h-5" />
            </Button>
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

          {/* Input */}
          <div className="safe-area-bottom p-4 border-t border-border/50 bg-card/80 backdrop-blur-lg">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response..."
                rows={1}
                className="flex-1 px-4 py-3 rounded-xl bg-background border border-border/50 focus:outline-none focus:border-primary resize-none"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="h-12 w-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600"
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

export default IELTS;
