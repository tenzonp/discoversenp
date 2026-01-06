import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Mic, 
  MicOff,
  BookOpen, 
  PenLine, 
  Headphones,
  Send,
  MessageCircle,
  Phone,
  PhoneOff,
  Clock,
  Volume2,
  Loader2,
  Star
} from "lucide-react";
import ChatMessage from "@/components/chat/ChatMessage";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { cn } from "@/lib/utils";

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
    messages: textMessages, 
    isLoading, 
    sendMessage, 
    clearChat 
  } = useChatHistory(user?.id, "ielts");

  const {
    isSessionActive,
    isListening,
    isSpeaking,
    isProcessing,
    messages: voiceMessages,
    transcript,
    remainingSeconds,
    sessionSeconds,
    startSession,
    stopSession,
    requestFeedback,
    formatTime,
  } = useVoiceSession(user?.id);
  
  const [inputValue, setInputValue] = useState("");
  const [selectedMode, setSelectedMode] = useState<"speaking" | "writing" | "voice" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [textMessages, voiceMessages]);

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

  // Voice Practice Mode
  if (selectedMode === "voice") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border/50 bg-card/80 backdrop-blur-lg sticky top-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isSessionActive) stopSession();
              setSelectedMode(null);
            }}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Voice Practice</h1>
              <p className="text-xs text-muted-foreground">
                {isSessionActive ? `Session: ${formatTime(sessionSeconds)}` : "Real-time AI Trainer"}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              <Clock className="w-3 h-3" />
              <span>{formatTime(remainingSeconds)} left today</span>
            </div>
          </div>
        </header>

        {/* Voice Session UI */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
            {voiceMessages.length === 0 && !isSessionActive ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg animate-pulse">
                  <Headphones className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Real-Time Voice Practice</h2>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    Practice speaking with AI examiner Sarah. 30 minutes free daily!
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 rounded-xl bg-secondary">
                    <Mic className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <span>Speak freely</span>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary">
                    <Volume2 className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <span>AI responds</span>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary">
                    <Star className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <span>Get feedback</span>
                  </div>
                </div>
              </div>
            ) : (
              voiceMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] p-3 rounded-2xl text-sm",
                      message.role === "user"
                        ? "bg-foreground text-background rounded-br-sm"
                        : "bg-secondary rounded-bl-sm"
                    )}
                  >
                    {message.role === "assistant" && (
                      <p className="text-xs text-primary font-medium mb-1">Sarah (Examiner)</p>
                    )}
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            
            {/* Live transcript */}
            {transcript && (
              <div className="flex justify-end">
                <div className="max-w-[80%] p-3 rounded-2xl bg-foreground/50 text-background rounded-br-sm text-sm italic">
                  {transcript}...
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-secondary p-3 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Controls */}
          <div className="p-6 border-t border-border bg-card/80 backdrop-blur-lg safe-area-bottom">
            <div className="max-w-md mx-auto space-y-4">
              {isSessionActive && (
                <div className="flex items-center justify-center gap-4 text-sm">
                  {isSpeaking && (
                    <div className="flex items-center gap-2 text-primary animate-pulse">
                      <Volume2 className="w-4 h-4" />
                      <span>Sarah is speaking...</span>
                    </div>
                  )}
                  {isListening && !isSpeaking && (
                    <div className="flex items-center gap-2 text-emerald-500">
                      <Mic className="w-4 h-4 animate-pulse" />
                      <span>Listening to you...</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center gap-4">
                {!isSessionActive ? (
                  <Button
                    size="lg"
                    onClick={startSession}
                    disabled={remainingSeconds <= 0}
                    className="h-16 px-8 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-lg"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Start Voice Session
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={requestFeedback}
                      className="h-12 w-12 rounded-full"
                      title="Get feedback"
                    >
                      <Star className="w-5 h-5" />
                    </Button>

                    <Button
                      size="lg"
                      onClick={stopSession}
                      className="h-16 px-8 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
                    >
                      <PhoneOff className="w-5 h-5 mr-2" />
                      End Session
                    </Button>

                    <div className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center",
                      isListening ? "bg-emerald-500 animate-pulse" : "bg-secondary"
                    )}>
                      {isListening ? (
                        <Mic className="w-5 h-5 text-white" />
                      ) : (
                        <MicOff className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </>
                )}
              </div>

              {remainingSeconds <= 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  Daily limit reached! Come back tomorrow for more practice 🌙
                </p>
              )}
            </div>
          </div>
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
            if (selectedMode && textMessages.length === 0) {
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
        {selectedMode && textMessages.length > 0 && (
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
              AI examiner sanga practice gara! 🎯
            </p>
          </div>

          <div className="space-y-4">
            {/* Voice Practice - New Featured Mode */}
            <button
              onClick={() => setSelectedMode("voice")}
              className="w-full p-6 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border-2 border-rose-500/50 flex items-center gap-4 hover:border-rose-500 transition-all active:scale-[0.98] relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full font-medium">
                NEW
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                <Headphones className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Voice Practice</h3>
                <p className="text-sm text-muted-foreground">Real-time AI conversation • 30 min/day free</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedMode("speaking")}
              className="w-full p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/30 flex items-center gap-4 hover:border-emerald-500/50 transition-all active:scale-[0.98]"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Text Speaking Practice</h3>
                <p className="text-sm text-muted-foreground">Type and practice with AI</p>
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
                <MessageCircle className="w-7 h-7 text-white" />
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
              <li>• Voice practice daily 15-20 min gara</li>
              <li>• Natural bolna practice gara, rataune hoina</li>
              <li>• Variety of vocabulary use gara</li>
              <li>• Fluency important, perfect grammar hoina</li>
            </ul>
          </div>
        </div>
      ) : textMessages.length === 0 ? (
        /* Topic Selection */
        <div className="flex-1 p-4 space-y-6">
          <div className="text-center py-4">
            <h2 className="text-xl font-bold mb-2">
              {selectedMode === "speaking" ? "Speaking Topics" : "Writing Topics"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Topic select gara practice start garna
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
              Or afno topic type gara tala 👇
            </p>
          </div>

          {/* Custom Topic Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Afno topic lekha..."
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
            {textMessages.map((message) => (
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
