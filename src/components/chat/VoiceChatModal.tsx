import { useState, useEffect, useCallback, useRef } from "react";
import { X, Mic, MicOff, Phone, PhoneOff, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "@elevenlabs/react";
import { supabase } from "@/integrations/supabase/client";
import { AudioAnalyzer, EmotionMetrics } from "@/utils/ElevenLabsVoiceChat";

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptAdd?: (text: string, role: "user" | "assistant") => void;
}

const VoiceChatModal = ({ isOpen, onClose, onTranscriptAdd }: VoiceChatModalProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [aiTranscript, setAiTranscript] = useState("");
  const [emotionMetrics, setEmotionMetrics] = useState<EmotionMetrics | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log("✅ ElevenLabs connected");
      toast({
        title: "Voice Connected! 🎤",
        description: "Bhote sanga bolna ready!",
      });
      
      // Start session timer
      timerRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    },
    onDisconnect: () => {
      console.log("🔌 ElevenLabs disconnected");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    },
    onMessage: (payload) => {
      console.log("📥 ElevenLabs message:", payload);
      
      // Handle message based on role
      const { message, role } = payload;
      
      if (role === "user") {
        setCurrentTranscript(message);
        if (message.trim()) {
          onTranscriptAdd?.(message, "user");
        }
      } else if (role === "agent") {
        setAiTranscript(message);
        if (message.trim()) {
          onTranscriptAdd?.(message, "assistant");
        }
      }
    },
    onError: (errorMessage) => {
      console.error("❌ ElevenLabs error:", errorMessage);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Voice connection ma problem ayo. Feri try gara.",
      });
    },
  });

  const isConnected = conversation.status === "connected";
  const isAISpeaking = conversation.isSpeaking;

  const startSession = useCallback(async () => {
    try {
      setIsConnecting(true);
      
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      setLocalStream(stream);
      
      // Set up audio analysis for emotion detection
      audioAnalyzerRef.current = new AudioAnalyzer(setEmotionMetrics);
      audioAnalyzerRef.current.setupAnalysis(stream);

      // Get token from edge function
      const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token");
      
      if (error) {
        console.error("Token error:", error);
        throw new Error("Failed to get conversation token");
      }

      // Start conversation - user needs to provide their own agent ID
      // For now, we'll prompt them to set one up in ElevenLabs
      if (data?.token) {
        await conversation.startSession({
          conversationToken: data.token,
          connectionType: "webrtc",
        });
      } else {
        // No agent configured - show setup message
        toast({
          title: "Setup Required",
          description: "ElevenLabs Agent ID configure garna paryo. Settings ma ja.",
          variant: "destructive",
        });
        throw new Error("No ElevenLabs agent configured");
      }
      
    } catch (error) {
      console.error("Voice session error:", error);
      
      // Cleanup on error
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      if (audioAnalyzerRef.current) {
        audioAnalyzerRef.current.cleanup();
        audioAnalyzerRef.current = null;
      }
      
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Microphone access deu ya feri try gara",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, toast, localStream]);

  const stopSession = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (audioAnalyzerRef.current) {
      audioAnalyzerRef.current.cleanup();
      audioAnalyzerRef.current = null;
    }
    
    await conversation.endSession();
    
    setSessionDuration(0);
    setCurrentTranscript("");
    setAiTranscript("");
    setEmotionMetrics(null);
  }, [conversation, localStream]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  }, [localStream, isMuted]);

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
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (audioAnalyzerRef.current) {
        audioAnalyzerRef.current.cleanup();
      }
    };
  }, [localStream]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get input/output volumes for visualization
  const inputLevel = conversation.getInputVolume?.() || 0;
  const outputLevel = conversation.getOutputVolume?.() || 0;
  const isUserSpeaking = inputLevel > 0.02;

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
          {isConnected && (
            <div className="flex items-center gap-1 ml-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-100 rounded-full"
                  style={{ width: `${Math.min(100, outputLevel * 200)}%` }}
                />
              </div>
            </div>
          )}
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

        {/* Voice Activity Visualization */}
        {isConnected && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Mic className={cn("w-4 h-4", isUserSpeaking ? "text-green-500" : "text-muted-foreground")} />
              <div className="w-24 h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-75 rounded-full"
                  style={{ width: `${Math.min(100, inputLevel * 200)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className={cn("w-4 h-4", isAISpeaking ? "text-primary" : "text-muted-foreground")} />
              <div className="w-24 h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-75 rounded-full"
                  style={{ width: `${Math.min(100, outputLevel * 200)}%` }}
                />
              </div>
            </div>
          </div>
        )}

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
                  "{aiTranscript.slice(-150)}{aiTranscript.length > 150 ? "..." : ""}"
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
