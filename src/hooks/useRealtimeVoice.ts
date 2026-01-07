import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RealtimeVoiceChat, EmotionMetrics, RealtimeMessage } from "@/utils/RealtimeVoiceChat";

const MAX_FREE_SECONDS = 30 * 60; // 30 minutes per day

interface VoiceMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function useRealtimeVoice(userId: string | undefined) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentUserTranscript, setCurrentUserTranscript] = useState("");
  const [currentAITranscript, setCurrentAITranscript] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(MAX_FREE_SECONDS);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [emotionMetrics, setEmotionMetrics] = useState<EmotionMetrics>({
    confidence: 50,
    energy: 50,
    stress: 30,
    engagement: 50,
  });

  const chatRef = useRef<RealtimeVoiceChat | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Check daily usage
  const checkDailyUsage = useCallback(async () => {
    if (!userId) return;

    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("voice_session_usage")
      .select("total_seconds")
      .eq("user_id", userId)
      .eq("session_date", today)
      .single();

    if (data) {
      setRemainingSeconds(Math.max(0, MAX_FREE_SECONDS - data.total_seconds));
    } else {
      setRemainingSeconds(MAX_FREE_SECONDS);
    }
  }, [userId]);

  // Update usage in database
  const updateUsage = useCallback(async (seconds: number) => {
    if (!userId || seconds <= 0) return;

    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("voice_session_usage")
      .select("id, total_seconds")
      .eq("user_id", userId)
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
        .insert({ user_id: userId, session_date: today, total_seconds: seconds });
    }
  }, [userId]);

  // Handle realtime messages
  const handleMessage = useCallback((event: RealtimeMessage) => {
    console.log("Realtime event:", event.type);
    
    if (event.type === "error") {
      console.error("Realtime error:", event);
      toast({
        title: "Connection error",
        description: "Voice session encountered an error. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Handle transcripts
  const handleTranscript = useCallback((text: string, isFinal: boolean, role: "user" | "assistant") => {
    if (role === "user") {
      if (isFinal && text.trim()) {
        // Add final user message
        const userMessage: VoiceMessage = {
          id: crypto.randomUUID(),
          role: "user",
          content: text.trim(),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setCurrentUserTranscript("");
      } else {
        setCurrentUserTranscript((prev) => prev + text);
      }
    } else {
      if (isFinal && text.trim()) {
        // Add final assistant message
        const assistantMessage: VoiceMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: text.trim(),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setCurrentAITranscript("");
      } else {
        setCurrentAITranscript((prev) => prev + text);
      }
    }
  }, []);

  // Handle speaking changes
  const handleSpeakingChange = useCallback((isSpeaking: boolean, who: "user" | "assistant") => {
    if (who === "user") {
      setIsUserSpeaking(isSpeaking);
      if (isSpeaking) {
        setCurrentUserTranscript("");
      }
    } else {
      setIsAISpeaking(isSpeaking);
      if (isSpeaking) {
        setCurrentAITranscript("");
      }
    }
  }, []);

  // Handle emotion updates
  const handleEmotionUpdate = useCallback((metrics: EmotionMetrics) => {
    setEmotionMetrics(metrics);
  }, []);

  // Start session
  const startSession = useCallback(async () => {
    if (remainingSeconds <= 0) {
      toast({
        title: "Daily limit reached! 🕐",
        description: "30 min limit reached today. Come back tomorrow!",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnecting(true);

      // Request mic permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create and initialize realtime chat
      chatRef.current = new RealtimeVoiceChat(
        handleMessage,
        handleEmotionUpdate,
        handleTranscript,
        handleSpeakingChange
      );

      await chatRef.current.init();

      setIsSessionActive(true);
      setIsConnecting(false);
      setMessages([]);
      setSessionSeconds(0);

      // Start session timer
      timerRef.current = setInterval(() => {
        setSessionSeconds((prev) => {
          const newSeconds = prev + 1;
          setRemainingSeconds((r) => Math.max(0, r - 1));
          return newSeconds;
        });
      }, 1000);

      toast({
        title: "Connected! 🎤",
        description: "Real-time voice session started. Just start speaking!",
      });

    } catch (error) {
      console.error("Failed to start session:", error);
      setIsConnecting(false);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Could not start voice session",
        variant: "destructive",
      });
    }
  }, [remainingSeconds, handleMessage, handleEmotionUpdate, handleTranscript, handleSpeakingChange, toast]);

  // Stop session
  const stopSession = useCallback(() => {
    setIsSessionActive(false);
    setIsUserSpeaking(false);
    setIsAISpeaking(false);
    setCurrentUserTranscript("");
    setCurrentAITranscript("");

    if (chatRef.current) {
      chatRef.current.disconnect();
      chatRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Save usage
    if (sessionSeconds > 0) {
      updateUsage(sessionSeconds);
    }

    toast({
      title: "Session ended",
      description: `Great practice! You spoke for ${formatTime(sessionSeconds)}`,
    });
  }, [sessionSeconds, updateUsage, toast]);

  // Request feedback via text
  const requestFeedback = useCallback(() => {
    if (chatRef.current?.isConnected()) {
      chatRef.current.sendTextMessage(
        "Can you give me detailed feedback on my speaking so far? What's my estimated band score and what specific areas should I improve?"
      );
    }
  }, []);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Check usage on mount
  useEffect(() => {
    checkDailyUsage();
  }, [checkDailyUsage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chatRef.current) {
        chatRef.current.disconnect();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    isSessionActive,
    isConnecting,
    isUserSpeaking,
    isAISpeaking,
    messages,
    currentUserTranscript,
    currentAITranscript,
    remainingSeconds,
    sessionSeconds,
    emotionMetrics,
    startSession,
    stopSession,
    requestFeedback,
    formatTime,
  };
}
