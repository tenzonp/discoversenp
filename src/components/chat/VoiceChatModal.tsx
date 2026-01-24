import { useState, useEffect, useCallback, useRef } from "react";
import { X, Mic, MicOff, Phone, PhoneOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeVoiceChat, EmotionMetrics, RealtimeMessage } from "@/utils/RealtimeVoiceChat";
import { useAuth } from "@/hooks/useAuth";
import DiscoverseText from "@/components/DiscoverseText";

const FREE_LIMIT_SECONDS = 180; // 3 minutes for free users

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
  const [isOverLimit, setIsOverLimit] = useState(false);
  const [emotionMetrics, setEmotionMetrics] = useState<EmotionMetrics | null>(null);
  
  const chatRef = useRef<RealtimeVoiceChat | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Check daily usage
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
    const remaining = FREE_LIMIT_SECONDS - used;
    setRemainingSeconds(remaining);
    setIsOverLimit(remaining <= 0);
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

  // Handle realtime messages
  const handleMessage = useCallback((event: RealtimeMessage) => {
    console.log("Realtime event:", event.type);
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
    await checkDailyUsage();

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

      timerRef.current = setInterval(() => {
        setSessionDuration(prev => {
          const newDuration = prev + 1;
          setRemainingSeconds(r => {
            const newRemaining = r - 1;
            // Just track - don't stop the session
            if (newRemaining <= 0) {
              setIsOverLimit(true);
            }
            return newRemaining;
          });
          return newDuration;
        });
      }, 1000);

      toast({
        title: "Connected! 🎤",
        description: "Voice ready - just start talking!",
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
  }, [checkDailyUsage, handleMessage, handleTranscript, handleSpeakingChange, toast]);

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
    setIsOverLimit(false);
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
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const sign = seconds < 0 ? "-" : "";
    return `${sign}${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col safe-area-top safe-area-bottom">
      {/* Header - Minimal */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-muted"
          )} />
          <span className="text-sm text-muted-foreground">
            {isConnecting ? "Connecting..." : isConnected ? formatTime(sessionDuration) : "Tap to start"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-xs",
            isOverLimit ? "text-amber-500" : "text-muted-foreground"
          )}>
            {isOverLimit ? "Over limit" : `${formatTime(remainingSeconds)} left`}
          </span>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Over limit banner */}
      {isOverLimit && isConnected && (
        <div className="mx-4 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-amber-600 dark:text-amber-400">
            Free limit reached! Pay for 30 min extra
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            className="ml-auto h-6 text-xs"
            onClick={() => {
              window.open("https://esewa.com.np", "_blank");
              toast({
                title: "eSewa Payment",
                description: "Pay Rs. 50 for 30 min. Send screenshot to activate.",
              });
            }}
          >
            Pay ₹50
          </Button>
        </div>
      )}

      {/* Main Content - Clean & Focused */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {/* Avatar */}
        <div className="relative">
          <div className={cn(
            "w-24 h-24 rounded-full bg-card flex items-center justify-center transition-all duration-500 border",
            isAISpeaking && "scale-110 ring-4 ring-accent/20"
          )}>
            <DiscoverseText size="sm" />
          </div>
          {isAISpeaking && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
              <div className="flex gap-0.5">
                <div className="w-1 h-3 bg-accent rounded-full animate-pulse" />
                <div className="w-1 h-4 bg-accent rounded-full animate-pulse delay-75" />
                <div className="w-1 h-2 bg-accent rounded-full animate-pulse delay-150" />
              </div>
            </div>
          )}
        </div>

        {/* Transcripts - Minimal */}
        <div className="w-full max-w-xs text-center space-y-3 min-h-[80px]">
          {isConnecting && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Connecting...</span>
            </div>
          )}
          
          {isConnected && (
            <>
              {isUserSpeaking && (
                <p className="text-xs text-muted-foreground">Listening...</p>
              )}
              {currentTranscript && (
                <p className="text-foreground text-sm">{currentTranscript}</p>
              )}
              {aiTranscript && !isUserSpeaking && (
                <p className="text-muted-foreground text-sm italic">
                  "{aiTranscript.slice(-100)}"
                </p>
              )}
              {!isUserSpeaking && !aiTranscript && !currentTranscript && (
                <p className="text-muted-foreground text-sm">Bola...</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Controls - Floating Bottom */}
      <div className="p-6 pb-8">
        <div className="flex items-center justify-center gap-4">
          {isConnected ? (
            <>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "w-12 h-12 rounded-full transition-colors",
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
    </div>
  );
};

export default VoiceChatModal;
