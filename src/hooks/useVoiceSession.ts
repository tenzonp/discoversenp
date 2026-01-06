import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MAX_FREE_SECONDS = 30 * 60; // 30 minutes per day

interface VoiceMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function useVoiceSession(userId: string | undefined) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [transcript, setTranscript] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(MAX_FREE_SECONDS);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
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
    if (!userId) return;

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

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Voice not supported", description: "Your browser doesn't support voice input", variant: "destructive" });
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += result;
        } else {
          interimTranscript += result;
        }
      }

      setTranscript(interimTranscript || finalTranscript);

      if (finalTranscript) {
        handleUserSpeech(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isSessionActive && !isSpeaking) {
        try {
          recognition.start();
        } catch (e) {
          // Ignore if already started
        }
      }
    };

    return recognition;
  }, [isSessionActive, isSpeaking, toast]);

  // Handle user's spoken text
  const handleUserSpeech = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMessage: VoiceMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setTranscript("");
    setIsProcessing(true);

    try {
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ielts-voice-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ action: "chat", messages: allMessages }),
        }
      );

      const data = await response.json();

      if (data.response) {
        const assistantMessage: VoiceMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        speakText(data.response);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({ title: "Error", description: "Couldn't get AI response", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  }, [messages, isProcessing, toast]);

  // Text to speech
  const speakText = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1;

      // Try to use a female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        v.name.includes("female") || v.name.includes("Samantha") || v.name.includes("Karen")
      );
      if (femaleVoice) utterance.voice = femaleVoice;

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
        }
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (isSessionActive && recognitionRef.current) {
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch (e) {}
        }
      };

      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [isSessionActive]);

  // Start session
  const startSession = useCallback(async () => {
    if (remainingSeconds <= 0) {
      toast({ 
        title: "Daily limit reached! 🕐", 
        description: "You've used 30 mins today. Bholi feri practice gara!", 
        variant: "destructive" 
      });
      return;
    }

    const recognition = initSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    setIsSessionActive(true);
    setMessages([]);
    setSessionSeconds(0);

    // Start session timer
    timerRef.current = setInterval(() => {
      setSessionSeconds(prev => {
        const newSeconds = prev + 1;
        setRemainingSeconds(r => Math.max(0, r - 1));
        
        if (newSeconds >= remainingSeconds) {
          stopSession();
          toast({ title: "Time's up! ⏰", description: "Daily free limit pugyo. Bholi feri aija!" });
        }
        return newSeconds;
      });
    }, 1000);

    // Add initial AI greeting
    const greeting = "Hello! I'm Sarah, your IELTS Speaking examiner. Welcome to your practice session. Would you like to practice Part 1 familiar topics, Part 2 long turn, or Part 3 discussion? Just speak your choice!";
    
    const assistantMessage: VoiceMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: greeting,
      timestamp: new Date(),
    };
    setMessages([assistantMessage]);

    // Wait a moment then speak and start listening
    setTimeout(() => {
      speakText(greeting);
    }, 500);
  }, [remainingSeconds, initSpeechRecognition, speakText, toast]);

  // Stop session
  const stopSession = useCallback(() => {
    setIsSessionActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setTranscript("");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    // Save usage
    if (sessionSeconds > 0) {
      updateUsage(sessionSeconds);
    }
  }, [sessionSeconds, updateUsage]);

  // Request feedback
  const requestFeedback = useCallback(() => {
    handleUserSpeech("Can you give me feedback on my speaking? What's my estimated band score and how can I improve?");
  }, [handleUserSpeech]);

  // Check usage on mount
  useEffect(() => {
    checkDailyUsage();
  }, [checkDailyUsage]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Load voices
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    isSessionActive,
    isListening,
    isSpeaking,
    isProcessing,
    messages,
    transcript,
    remainingSeconds,
    sessionSeconds,
    startSession,
    stopSession,
    requestFeedback,
    formatTime,
  };
}
