import { useState, useEffect, useCallback, useRef } from "react";
import { X, Mic, MicOff, Phone, PhoneOff, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeVoiceChat, EmotionMetrics, RealtimeMessage } from "@/utils/RealtimeVoiceChat";
import { useAuth } from "@/hooks/useAuth";
import DiscoverseText from "@/components/DiscoverseText";

const FREE_LIMIT_SECONDS = 180; // 3 minutes strict limit

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptAdd?: (text: string, role: "user" | "assistant") => void;
}

const VoiceChatModal = ({ isOpen, onClose, onTranscriptAdd }: VoiceChatModalProps) => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [aiTranscript, setAiTranscript] = useState("");
  const [sessionDuration, setSessionDuration] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(FREE_LIMIT_SECONDS);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [emotionMetrics, setEmotionMetrics] = useState<EmotionMetrics | null>(null);
  
  const chatRef = useRef<RealtimeVoiceChat | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Check daily usage on mount
  const checkDailyUsage = useCallback(async () => {
    if (!user?.id) return FREE_LIMIT_SECONDS;

    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("voice_session_usage")
      .select("total_seconds")
      .eq("user_id", user.id)
      .eq("session_date", today)
      .single();

    const used = data?.total_seconds || 0;
    const remaining = Math.max(0, FREE_LIMIT_SECONDS - used);
    setRemainingSeconds(remaining);
    setIsLimitReached(remaining <= 0);
    return remaining;
  }, [user?.id]);

  // Update usage in database
  const updateUsage = useCallback(async (seconds: number) => {
    if (!user?.id || seconds <= 0) return;

    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("voice_session_usage")
      .select("id, total_seconds")
      .eq("user_id", user.id)
      .eq("session_date", today)
      .single();

    if (existing) {
      await supabase
        .from("voice_session_usage")
        .update({ total_seconds: existing.total_seconds + seconds })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("voice_session_usage")
        .insert({ user_id: user.id, session_date: today, total_seconds: seconds });
    }
  }, [user?.id]);

  // STRICT: Force stop session when limit reached
  const forceStopSession = useCallback(async () => {
    const durationToSave = sessionDuration;
    
    setIsConnected(false);
    setIsUserSpeaking(false);
    setIsAISpeaking(false);
    setCurrentTranscript("");
    setAiTranscript("");
    setIsLimitReached(true);

    if (chatRef.current) {
      chatRef.current.disconnect();
      chatRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (durationToSave > 0) {
      await updateUsage(durationToSave);
    }

    setSessionDuration(0);
    
    toast({
      title: "⏱️ Time's up!",
      description: "3 minute free limit reached. Pay to continue.",
    });
  }, [sessionDuration, updateUsage, toast]);

  // Handle realtime messages
  const handleMessage = useCallback((event: RealtimeMessage) => {
    if (event.type === "error") {
      toast({
        variant: "destructive",
        title: "Connection error",
        description: "Voice session error. Please try again.",
      });
    }
  }, [toast]);

  // Handle transcripts
  const handleTranscript = useCallback((text: string, isFinal: boolean, role: "user" | "assistant") => {
    if (role === "user") {
      if (isFinal && text.trim()) {
        setCurrentTranscript("");
        onTranscriptAdd?.(text.trim(), "user");
      } else {
        setCurrentTranscript(prev => prev + text);
      }
    } else {
      if (isFinal && text.trim()) {
        setAiTranscript(text.trim());
        onTranscriptAdd?.(text.trim(), "assistant");
      } else {
        setAiTranscript(prev => prev + text);
      }
    }
  }, [onTranscriptAdd]);

  // Handle speaking changes
  const handleSpeakingChange = useCallback((isSpeaking: boolean, who: "user" | "assistant") => {
    if (who === "user") {
      setIsUserSpeaking(isSpeaking);
      if (isSpeaking) setCurrentTranscript("");
    } else {
      setIsAISpeaking(isSpeaking);
      if (isSpeaking) setAiTranscript("");
    }
  }, []);

  const startSession = useCallback(async () => {
    const remaining = await checkDailyUsage();
    
    // STRICT: Don't allow if limit already reached
    if (remaining <= 0) {
      setIsLimitReached(true);
      toast({
        variant: "destructive",
        title: "Daily limit reached",
        description: "Pay Rs. 50 for 30 extra minutes",
      });
      return;
    }

    try {
      setIsConnecting(true);
      
      await navigator.mediaDevices.getUserMedia({ audio: true });

      chatRef.current = new RealtimeVoiceChat(
        handleMessage,
        setEmotionMetrics,
        handleTranscript,
        handleSpeakingChange
      );

      await chatRef.current.init();

      setIsConnected(true);
      setIsConnecting(false);
      setSessionDuration(0);

      // Timer that STRICTLY enforces limit
      timerRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
        setRemainingSeconds(r => {
          const newRemaining = r - 1;
          // STRICT: Force stop at 0
          if (newRemaining <= 0) {
            forceStopSession();
            return 0;
          }
          return newRemaining;
        });
      }, 1000);

      toast({
        title: "Connected! 🎤",
        description: `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')} remaining`,
      });

    } catch (error) {
      console.error("Voice session error:", error);
      setIsConnecting(false);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Microphone access needed",
      });
    }
  }, [checkDailyUsage, handleMessage, handleTranscript, handleSpeakingChange, forceStopSession, toast]);

  const stopSession = useCallback(async () => {
    const durationToSave = sessionDuration;
    
    setIsConnected(false);
    setIsUserSpeaking(false);
    setIsAISpeaking(false);
    setCurrentTranscript("");
    setAiTranscript("");

    if (chatRef.current) {
      chatRef.current.disconnect();
      chatRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (durationToSave > 0) {
      await updateUsage(durationToSave);
    }

    setSessionDuration(0);
  }, [sessionDuration, updateUsage]);

  const toggleMute = useCallback(() => {
    if (chatRef.current) {
      const newMuted = chatRef.current.toggleMute();
      setIsMuted(newMuted);
    }
  }, []);

  const handleClose = useCallback(() => {
    stopSession();
    onClose();
  }, [stopSession, onClose]);

  // Check usage when modal opens
  useEffect(() => {
    if (isOpen && !isConnected && !isConnecting) {
      checkDailyUsage();
    }
  }, [isOpen, isConnected, isConnecting, checkDailyUsage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (chatRef.current) chatRef.current.disconnect();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500 animate-pulse" : "bg-muted"
          )} />
          <span className="text-sm text-muted-foreground">
            {isConnecting ? "Connecting..." : isConnected ? formatTime(sessionDuration) : "Ready"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-sm font-medium tabular-nums",
            remainingSeconds <= 30 ? "text-destructive" : 
            remainingSeconds <= 60 ? "text-amber-500" : "text-muted-foreground"
          )}>
            {formatTime(remainingSeconds)}
          </span>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Warning when low on time */}
      {isConnected && remainingSeconds <= 30 && remainingSeconds > 0 && (
        <div className="mx-4 px-3 py-2 rounded-lg bg-destructive/10 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-xs text-destructive font-medium">
            {remainingSeconds} seconds remaining!
          </span>
        </div>
      )}

      {/* Limit Reached Screen */}
      {isLimitReached && !isConnected && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-medium text-foreground mb-2">
            Daily Limit Reached
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            You've used all 3 minutes of free voice chat today. Get 30 more minutes for just Rs. 50!
          </p>
          <Button 
            className="gap-2 mb-3 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => {
              window.open("https://esewa.com.np", "_blank");
              toast({
                title: "eSewa Payment",
                description: "Pay Rs. 50 and send screenshot to unlock 30 minutes",
              });
            }}
          >
            Pay Rs. 50 via eSewa
          </Button>
          <p className="text-xs text-muted-foreground">
            Or come back tomorrow for free minutes
          </p>
        </div>
      )}

      {/* Main Content */}
      {!isLimitReached && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className={cn(
              "w-24 h-24 rounded-full bg-card flex items-center justify-center transition-all duration-500 border",
              isAISpeaking && "scale-110 ring-4 ring-accent/20"
            )}>
              <DiscoverseText size="sm" />
            </div>
            {isAISpeaking && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                <div className="w-1 h-3 bg-accent rounded-full animate-pulse" />
                <div className="w-1 h-4 bg-accent rounded-full animate-pulse" style={{ animationDelay: "75ms" }} />
                <div className="w-1 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
              </div>
            )}
          </div>

          {/* Transcripts */}
          <div className="w-full max-w-xs text-center space-y-2 min-h-[60px]">
            {isConnecting && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Connecting...</span>
              </div>
            )}
            
            {isConnected && (
              <>
                {isUserSpeaking && (
                  <p className="text-xs text-muted-foreground">🎤 Listening...</p>
                )}
                {currentTranscript && (
                  <p className="text-foreground text-sm">{currentTranscript}</p>
                )}
                {aiTranscript && !isUserSpeaking && (
                  <p className="text-muted-foreground text-sm">"{aiTranscript.slice(-80)}"</p>
                )}
                {!isUserSpeaking && !aiTranscript && !currentTranscript && (
                  <p className="text-muted-foreground text-sm">Bola...</p>
                )}
              </>
            )}
            
            {!isConnected && !isConnecting && (
              <p className="text-sm text-muted-foreground">
                Tap to start voice chat
              </p>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      {!isLimitReached && (
        <div className="p-6 pb-8">
          <div className="flex items-center justify-center gap-4">
            {isConnected ? (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "w-12 h-12 rounded-full",
                    isMuted && "bg-destructive text-destructive-foreground border-destructive"
                  )}
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                
                <Button
                  variant="destructive"
                  size="icon"
                  className="w-14 h-14 rounded-full"
                  onClick={stopSession}
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </>
            ) : (
              <Button
                size="icon"
                className="w-16 h-16 rounded-full bg-accent hover:bg-accent/90"
                onClick={startSession}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Phone className="w-6 h-6" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceChatModal;
