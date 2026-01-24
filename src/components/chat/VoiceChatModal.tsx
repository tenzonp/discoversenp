import { useState, useEffect, useCallback, useRef } from "react";
import { X, Mic, MicOff, Phone, PhoneOff, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useScribe, CommitStrategy } from "@elevenlabs/react";
import { supabase } from "@/integrations/supabase/client";
import { AudioAnalyzer, EmotionMetrics } from "@/utils/ElevenLabsVoiceChat";

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptAdd?: (text: string, role: "user" | "assistant") => void;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

const VoiceChatModal = ({ isOpen, onClose, onTranscriptAdd }: VoiceChatModalProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [aiTranscript, setAiTranscript] = useState("");
  const [emotionMetrics, setEmotionMetrics] = useState<EmotionMetrics | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  
  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Process user message: Get AI response and speak it
  const processUserMessage = useCallback(async (userMessage: string) => {
    setIsProcessing(true);
    
    try {
      // Add user message to history
      const updatedHistory = [...conversationHistory, { role: "user" as const, content: userMessage }];
      
      // Get AI response
      const { data: aiData, error: aiError } = await supabase.functions.invoke("bhote-voice-chat", {
        body: { 
          message: userMessage,
          conversationHistory: updatedHistory.slice(-10),
        },
      });

      if (aiError) throw aiError;
      
      const aiResponse = aiData?.response || "Maile bujhina, feri bhana?";
      console.log("🤖 AI response:", aiResponse);
      
      setAiTranscript(aiResponse);
      onTranscriptAdd?.(aiResponse, "assistant");
      
      // Update conversation history
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant" as const, content: aiResponse },
      ]);

      // Convert to speech using ElevenLabs TTS
      await speakResponse(aiResponse);
      
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "AI response ma problem ayo",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [conversationHistory, onTranscriptAdd, toast]);

  // Speak the AI response using ElevenLabs TTS
  const speakResponse = useCallback(async (text: string) => {
    try {
      setIsPlaying(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
      
    } catch (error) {
      console.error("TTS error:", error);
      setIsPlaying(false);
    }
  }, []);

  // ElevenLabs Scribe hook for real-time transcription with Hindi/Nepali support
  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    commitStrategy: CommitStrategy.VAD,
    languageCode: "hi", // Hindi - closest to Nepali for better recognition
    vadSilenceThresholdSecs: 0.8, // Wait a bit longer for natural pauses
    minSpeechDurationMs: 300,
    onPartialTranscript: (data) => {
      setCurrentTranscript(data.text);
    },
    onCommittedTranscript: async (data) => {
      const text = data.text.trim();
      if (text) {
        console.log("📝 User said:", text);
        setCurrentTranscript("");
        onTranscriptAdd?.(text, "user");
        
        // Process with AI
        await processUserMessage(text);
      }
    },
  });

  const isConnected = scribe.isConnected;
  const isAISpeaking = isPlaying;

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

      // Get Scribe token from edge function
      const { data, error } = await supabase.functions.invoke("elevenlabs-scribe-token");
      
      if (error || !data?.token) {
        console.error("Token error:", error);
        throw new Error("Failed to get Scribe token");
      }

      // Connect to ElevenLabs Scribe
      await scribe.connect({
        token: data.token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Start session timer
      timerRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: "Voice Connected! 🎤",
        description: "Discoverse sanga bolna ready!",
      });
      
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
  }, [scribe, toast, localStream]);

  const stopSession = useCallback(() => {
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

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    scribe.disconnect();
    
    setSessionDuration(0);
    setCurrentTranscript("");
    setAiTranscript("");
    setEmotionMetrics(null);
    setIsPlaying(false);
    setConversationHistory([]);
  }, [scribe, localStream]);

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
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [localStream]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if user is speaking based on partial transcript
  const isUserSpeaking = scribe.partialTranscript.length > 0;

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
          {isProcessing && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Thinking...
            </span>
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
            "w-32 h-32 rounded-full bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center text-2xl font-bold text-white shadow-2xl transition-all duration-300",
            isAISpeaking && "scale-110 ring-4 ring-teal-500/30 animate-pulse"
          )}>
            D*
          </div>
          {isAISpeaking && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
              Speaking...
            </div>
          )}
          {isProcessing && !isAISpeaking && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Thinking...
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
                  className={cn(
                    "h-full bg-green-500 transition-all duration-75 rounded-full",
                    isUserSpeaking ? "w-full animate-pulse" : "w-0"
                  )}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className={cn("w-4 h-4", isAISpeaking ? "text-primary" : "text-muted-foreground")} />
              <div className="w-24 h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full bg-primary transition-all duration-75 rounded-full",
                    isAISpeaking ? "w-full animate-pulse" : "w-0"
                  )}
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
              <span>Discoverse sanga connect huncha...</span>
            </div>
          ) : isConnected ? (
            <div className="space-y-3">
              {isUserSpeaking && (
                <p className="text-sm text-muted-foreground animate-pulse">🎤 Listening...</p>
              )}
              {(currentTranscript || scribe.partialTranscript) && (
                <p className="text-foreground bg-secondary/50 px-4 py-2 rounded-xl">
                  {currentTranscript || scribe.partialTranscript}
                </p>
              )}
              {aiTranscript && !isUserSpeaking && (
                <p className="text-muted-foreground italic">
                  "{aiTranscript.slice(-150)}{aiTranscript.length > 150 ? "..." : ""}"
                </p>
              )}
              {!isUserSpeaking && !aiTranscript && !currentTranscript && !scribe.partialTranscript && !isProcessing && (
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
                  className="w-full bg-destructive transition-all duration-200 rounded-full"
                  style={{ height: `${emotionMetrics.stress}%`, marginTop: `${100 - emotionMetrics.stress}%` }}
                />
              </div>
              <span className="text-muted-foreground">Stress</span>
            </div>
            <div className="space-y-1">
              <div className="h-16 w-2 mx-auto bg-secondary rounded-full overflow-hidden">
                <div 
                  className="w-full bg-primary transition-all duration-200 rounded-full"
                  style={{ height: `${emotionMetrics.engagement}%`, marginTop: `${100 - emotionMetrics.engagement}%` }}
                />
              </div>
              <span className="text-muted-foreground">Engaged</span>
            </div>
          </div>
        )}

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="w-full max-w-md max-h-32 overflow-y-auto space-y-2 text-sm">
            {conversationHistory.slice(-4).map((msg, i) => (
              <div 
                key={i} 
                className={cn(
                  "px-3 py-1.5 rounded-lg",
                  msg.role === "user" 
                    ? "bg-primary/10 text-foreground ml-8" 
                    : "bg-secondary text-foreground mr-8"
                )}
              >
                {msg.content.slice(0, 80)}{msg.content.length > 80 ? "..." : ""}
              </div>
            ))}
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
