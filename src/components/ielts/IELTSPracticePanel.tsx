import { useVoiceSession } from "@/hooks/useVoiceSession";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import LiveAnalysisPanel from "./LiveAnalysisPanel";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageSquare,
  Crown,
  Clock,
  Volume2,
  Loader2,
} from "lucide-react";

interface IELTSPracticePanelProps {
  userId: string | undefined;
  onClose: () => void;
}

const IELTSPracticePanel = ({ userId, onClose }: IELTSPracticePanelProps) => {
  const navigate = useNavigate();
  const { subscription } = useSubscription(userId);
  const isPro = subscription.tier === "pro" || subscription.tier === "premium";
  
  const {
    isSessionActive,
    isListening,
    isSpeaking,
    isProcessing,
    messages,
    transcript,
    remainingSeconds,
    sessionSeconds,
    liveScore,
    wordCount,
    speakingDuration,
    startSession,
    stopSession,
    requestFeedback,
    formatTime,
  } = useVoiceSession(userId);

  const isLimitReached = !isPro && remainingSeconds <= 0;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in">
      <div className="h-full flex flex-col max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">IELTS Speaking</h2>
              <p className="text-xs text-muted-foreground">Practice with AI Examiner</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            ✕
          </button>
        </div>

        {/* Time Display */}
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Session:</span>
              <span className="font-mono font-semibold">{formatTime(sessionSeconds)}</span>
            </div>
            <div className="flex items-center gap-2">
              {isPro ? (
                <span className="flex items-center gap-1 text-primary">
                  <Crown className="w-4 h-4" />
                  <span className="text-xs">Unlimited</span>
                </span>
              ) : (
                <>
                  <span className="text-muted-foreground">Free:</span>
                  <span className={cn(
                    "font-mono font-semibold",
                    remainingSeconds < 30 ? "text-destructive" : "text-foreground"
                  )}>
                    {formatTime(Math.max(0, remainingSeconds))}
                  </span>
                  <span className="text-xs text-muted-foreground">/2:00</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {!isSessionActive ? (
            // Start Screen
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
                <Mic className="w-10 h-10 text-primary" />
              </div>
              
              <h3 className="text-xl font-semibold mb-2">IELTS Speaking Practice</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                Talk with AI examiner Sarah. Get real-time scores on fluency, vocabulary, grammar & pronunciation.
              </p>

              {isLimitReached ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted border border-border">
                    <p className="text-sm text-foreground mb-2">
                      Daily free practice used! 🕐
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bholi feri 2 min free milcha
                    </p>
                  </div>
                  
                  <button
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to Pro - Unlimited Practice
                  </button>
                </div>
              ) : (
                <button
                  onClick={startSession}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all hover:scale-105"
                >
                  <Phone className="w-5 h-5" />
                  Start Practice Session
                </button>
              )}

              {!isPro && !isLimitReached && (
                <p className="text-xs text-muted-foreground mt-4">
                  {formatTime(remainingSeconds)} free remaining today
                </p>
              )}

              {/* Features */}
              <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-sm">
                {[
                  { label: "Fluency", icon: "🗣️" },
                  { label: "Vocabulary", icon: "📚" },
                  { label: "Grammar", icon: "✍️" },
                  { label: "Pronunciation", icon: "🎯" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-xl bg-muted text-center"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Active Session
            <div className="flex flex-col h-full">
              {/* Live Analysis Panel */}
              <div className="p-4">
                <LiveAnalysisPanel
                  liveScore={liveScore}
                  isListening={isListening}
                  transcript={transcript}
                  wordCount={wordCount}
                  speakingDuration={speakingDuration}
                />
              </div>

              {/* Conversation */}
              <div className="flex-1 px-4 overflow-y-auto space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "p-3 rounded-xl text-sm max-w-[85%]",
                      msg.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {msg.content}
                  </div>
                ))}
                
                {/* Current transcript */}
                {transcript && (
                  <div className="ml-auto p-3 rounded-xl text-sm max-w-[85%] bg-primary/50 text-primary-foreground italic">
                    {transcript}...
                  </div>
                )}

                {/* Speaking indicator */}
                {isSpeaking && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span>Sarah is speaking...</span>
                  </div>
                )}

                {isProcessing && !isSpeaking && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-4 border-t border-border bg-background">
                <div className="flex items-center justify-center gap-4">
                  {/* Mic Status */}
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                    isListening 
                      ? "bg-accent animate-pulse" 
                      : isSpeaking
                      ? "bg-primary"
                      : "bg-muted"
                  )}>
                    {isListening ? (
                      <Mic className="w-7 h-7 text-accent-foreground" />
                    ) : isSpeaking ? (
                      <Volume2 className="w-7 h-7 text-primary-foreground" />
                    ) : (
                      <MicOff className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>

                  {/* Feedback Button */}
                  <button
                    onClick={requestFeedback}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">Get Feedback</span>
                  </button>

                  {/* End Session */}
                  <button
                    onClick={stopSession}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span className="text-sm">End</span>
                  </button>
                </div>

                {/* Status Text */}
                <p className="text-center text-xs text-muted-foreground mt-3">
                  {isListening
                    ? "🎙️ Listening... speak now"
                    : isSpeaking
                    ? "🔊 Sarah is speaking..."
                    : isProcessing
                    ? "⏳ Processing..."
                    : "Ready"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IELTSPracticePanel;
