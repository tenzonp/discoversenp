import { useState, useEffect, useCallback, useRef } from "react";
import { X, Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RealtimeVoiceChat, EmotionMetrics } from "@/utils/RealtimeVoiceChat";
import { useToast } from "@/hooks/use-toast";

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptAdd?: (text: string, role: "user" | "assistant") => void;
}

const VoiceChatModal = ({ isOpen, onClose, onTranscriptAdd }: VoiceChatModalProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [aiTranscript, setAiTranscript] = useState("");
  const [emotionMetrics, setEmotionMetrics] = useState<EmotionMetrics | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  
  const chatRef = useRef<RealtimeVoiceChat | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleSpeakingChange = useCallback((speaking: boolean, who: "user" | "assistant") => {
    if (who === "user") setIsUserSpeaking(speaking);
    else setIsAISpeaking(speaking);
  }, []);

  const handleTranscript = useCallback((text: string, isFinal: boolean, role: "user" | "assistant") => {
    if (role === "user") {
      setCurrentTranscript(text);
      if (isFinal && text.trim()) {
        onTranscriptAdd?.(text, "user");
        setCurrentTranscript("");
      }
    } else {
      if (isFinal) {
        setAiTranscript(text);
        if (text.trim()) onTranscriptAdd?.(text, "assistant");
      } else {
        setAiTranscript(prev => prev + text);
      }
    }
  }, [onTranscriptAdd]);

  const handleEmotionUpdate = useCallback((metrics: EmotionMetrics) => {
    setEmotionMetrics(metrics);
  }, []);

  const startSession = useCallback(async () => {
    try {
      setIsConnecting(true);
      
      const chat = new RealtimeVoiceChat(
        () => {},
        handleEmotionUpdate,
        handleTranscript,
        handleSpeakingChange
      );
      
      await chat.init();
      chatRef.current = chat;
      setIsConnected(true);
      
      // Start session timer
      timerRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Voice Connected! 🎤",
        description: "Bhote sanga bolna ready!",
      });
    } catch (error) {
      console.error("Voice session error:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Microphone access deu ya feri try gara",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [handleEmotionUpdate, handleTranscript, handleSpeakingChange, toast]);

  const stopSession = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (chatRef.current) {
      chatRef.current.disconnect();
      chatRef.current = null;
    }
    
    setIsConnected(false);
    setSessionDuration(0);
    setCurrentTranscript("");
    setAiTranscript("");
  }, []);

  const toggleMute = useCallback(() => {
    if (chatRef.current) {
      const muted = chatRef.current.toggleMute();
      setIsMuted(muted);
    }
  }, []);

  const handleClose = useCallback(() => {
    stopSession();
    onClose();
  }, [stopSession, onClose]);

  // Auto-connect when modal opens
  useEffect(() => {
    if (isOpen && !isConnected && !isConnecting) {
      startSession();
    }
  }, [isOpen, isConnected, isConnecting, startSession]);

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
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-3 h-3 rounded-full",
            isConnected ? "bg-green-500 animate-pulse" : "bg-muted"
          )} />
          <span className="font-medium">
            {isConnecting ? "Connecting..." : isConnected ? `Live • ${formatTime(sessionDuration)}` : "Disconnected"}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Avatar with speaking indicator */}
        <div className="relative">
          <div className={cn(
            "w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-2xl transition-all duration-300",
            isAISpeaking && "scale-110 ring-4 ring-primary/30 animate-pulse"
          )}>
            भ
          </div>
          {isAISpeaking && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
              Speaking...
            </div>
          )}
        </div>

        {/* Status Text */}
        <div className="text-center max-w-md">
          {isConnecting ? (
            <div className="flex items-center gap-2 justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Bhote sanga connect huncha...</span>
            </div>
          ) : isConnected ? (
            <div className="space-y-3">
              {isUserSpeaking && (
                <p className="text-sm text-muted-foreground animate-pulse">🎤 Listening...</p>
              )}
              {currentTranscript && (
                <p className="text-foreground bg-secondary/50 px-4 py-2 rounded-xl">
                  {currentTranscript}
                </p>
              )}
              {aiTranscript && !isUserSpeaking && (
                <p className="text-muted-foreground italic">
                  "{aiTranscript.slice(-100)}{aiTranscript.length > 100 ? "..." : ""}"
                </p>
              )}
              {!isUserSpeaking && !aiTranscript && !currentTranscript && (
                <p className="text-muted-foreground">Kura gara, ma sunirako!</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Start ma click garera bolna suru gara</p>
          )}
        </div>

        {/* Emotion Metrics */}
        {emotionMetrics && isConnected && (
          <div className="grid grid-cols-4 gap-4 text-center text-xs">
            <div className="space-y-1">
              <div className="h-16 w-2 mx-auto bg-secondary rounded-full overflow-hidden">
                <div 
                  className="w-full bg-green-500 transition-all duration-200 rounded-full"
                  style={{ height: `${emotionMetrics.confidence}%`, marginTop: `${100 - emotionMetrics.confidence}%` }}
                />
              </div>
              <span className="text-muted-foreground">Confidence</span>
            </div>
            <div className="space-y-1">
              <div className="h-16 w-2 mx-auto bg-secondary rounded-full overflow-hidden">
                <div 
                  className="w-full bg-yellow-500 transition-all duration-200 rounded-full"
                  style={{ height: `${emotionMetrics.energy}%`, marginTop: `${100 - emotionMetrics.energy}%` }}
                />
              </div>
              <span className="text-muted-foreground">Energy</span>
            </div>
            <div className="space-y-1">
              <div className="h-16 w-2 mx-auto bg-secondary rounded-full overflow-hidden">
                <div 
                  className="w-full bg-red-500 transition-all duration-200 rounded-full"
                  style={{ height: `${emotionMetrics.stress}%`, marginTop: `${100 - emotionMetrics.stress}%` }}
                />
              </div>
              <span className="text-muted-foreground">Stress</span>
            </div>
            <div className="space-y-1">
              <div className="h-16 w-2 mx-auto bg-secondary rounded-full overflow-hidden">
                <div 
                  className="w-full bg-blue-500 transition-all duration-200 rounded-full"
                  style={{ height: `${emotionMetrics.engagement}%`, marginTop: `${100 - emotionMetrics.engagement}%` }}
                />
              </div>
              <span className="text-muted-foreground">Engaged</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 border-t border-border">
        <div className="flex items-center justify-center gap-6">
          {isConnected ? (
            <>
              <Button
                variant="outline"
                size="icon"
                className={cn("w-14 h-14 rounded-full", isMuted && "bg-destructive text-destructive-foreground")}
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
              
              <Button
                variant="destructive"
                size="icon"
                className="w-16 h-16 rounded-full"
                onClick={stopSession}
              >
                <PhoneOff className="w-7 h-7" />
              </Button>
            </>
          ) : (
            <Button
              className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700"
              size="icon"
              onClick={startSession}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <Phone className="w-7 h-7" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceChatModal;
