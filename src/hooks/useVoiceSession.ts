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

interface LiveScore {
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
  overall: number;
  mistakes: string[];
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
  const [liveScore, setLiveScore] = useState<LiveScore>({
    fluency: 0,
    vocabulary: 0,
    grammar: 0,
    pronunciation: 0,
    overall: 0,
    mistakes: [],
  });

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesRef = useRef<VoiceMessage[]>([]);
  const isSessionActiveRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const { toast } = useToast();

  // Keep refs in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

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

  // Text to speech
  const speakText = useCallback((text: string, onComplete?: () => void) => {
    if (!("speechSynthesis" in window)) {
      onComplete?.();
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    // Try to use a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("female") || v.name.includes("Google")
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      // Stop listening while speaking
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      onComplete?.();
      // Resume listening
      if (isSessionActiveRef.current && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch (e) {
            console.log("Couldn't restart recognition:", e);
          }
        }, 300);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      onComplete?.();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Get AI response with scoring
  const getAIResponse = useCallback(async (allMessages: VoiceMessage[]) => {
    try {
      const messagesToSend = allMessages.map(m => ({
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
          body: JSON.stringify({ action: "chat", messages: messagesToSend }),
        }
      );

      const data = await response.json();
      
      // Update live scores if provided
      if (data.scores) {
        setLiveScore(prev => ({
          fluency: data.scores.fluency ?? prev.fluency,
          vocabulary: data.scores.vocabulary ?? prev.vocabulary,
          grammar: data.scores.grammar ?? prev.grammar,
          pronunciation: data.scores.pronunciation ?? prev.pronunciation,
          overall: data.scores.overall ?? prev.overall,
          mistakes: data.scores.mistakes ?? prev.mistakes,
        }));
      }
      
      return data.response || null;
    } catch (error) {
      console.error("AI response error:", error);
      return null;
    }
  }, []);

  // Handle user speech - uses refs to avoid stale closures
  const handleUserSpeech = useCallback(async (text: string) => {
    if (!text.trim() || isProcessingRef.current) return;

    const userMessage: VoiceMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messagesRef.current, userMessage];
    setMessages(updatedMessages);
    messagesRef.current = updatedMessages;
    setTranscript("");
    setIsProcessing(true);
    isProcessingRef.current = true;

    try {
      const aiText = await getAIResponse(updatedMessages);
      
      if (aiText) {
        const assistantMessage: VoiceMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: aiText,
          timestamp: new Date(),
        };
        const newMessages = [...updatedMessages, assistantMessage];
        setMessages(newMessages);
        messagesRef.current = newMessages;
        
        // Speak the response
        speakText(aiText, () => {
          setIsProcessing(false);
          isProcessingRef.current = false;
        });
      } else {
        setIsProcessing(false);
        isProcessingRef.current = false;
      }
    } catch (error) {
      console.error("Speech handling error:", error);
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  }, [getAIResponse, speakText]);

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Voice not supported", description: "Use Chrome or Edge for voice", variant: "destructive" });
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

      if (finalTranscript && finalTranscript.trim().length > 2) {
        handleUserSpeech(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.log("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast({ title: "Microphone access denied", description: "Please allow microphone access", variant: "destructive" });
        setIsSessionActive(false);
        isSessionActiveRef.current = false;
      }
    };

    recognition.onend = () => {
      // Auto-restart if session is active and not speaking
      if (isSessionActiveRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {}
        }, 100);
      }
    };

    return recognition;
  }, [handleUserSpeech, toast]);

  // Start session
  const startSession = useCallback(async () => {
    if (remainingSeconds <= 0) {
      toast({ 
        title: "Daily limit pugyo! 🕐", 
        description: "30 min bhayo aaja. Bholi feri practice gara!", 
        variant: "destructive" 
      });
      return;
    }

    // Request mic permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      toast({ title: "Microphone access needed", description: "Please allow microphone to use voice practice", variant: "destructive" });
      return;
    }

    const recognition = initSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    setIsSessionActive(true);
    isSessionActiveRef.current = true;
    setMessages([]);
    messagesRef.current = [];
    setSessionSeconds(0);

    // Start session timer
    timerRef.current = setInterval(() => {
      setSessionSeconds(prev => {
        const newSeconds = prev + 1;
        setRemainingSeconds(r => Math.max(0, r - 1));
        return newSeconds;
      });
    }, 1000);

    // Initial greeting
    const greeting = "Hello! I'm Sarah, your IELTS Speaking examiner. Welcome to your practice session! Which part would you like to practice - Part 1 about familiar topics, Part 2 with a cue card, or Part 3 for abstract discussion? Just tell me!";
    
    const assistantMessage: VoiceMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: greeting,
      timestamp: new Date(),
    };
    setMessages([assistantMessage]);
    messagesRef.current = [assistantMessage];

    // Speak greeting then start listening
    setTimeout(() => {
      speakText(greeting, () => {
        try {
          recognition.start();
          setIsListening(true);
        } catch (e) {
          console.log("Couldn't start recognition:", e);
        }
      });
    }, 500);
  }, [remainingSeconds, initSpeechRecognition, speakText, toast]);

  // Stop session
  const stopSession = useCallback(() => {
    setIsSessionActive(false);
    isSessionActiveRef.current = false;
    setIsListening(false);
    setIsSpeaking(false);
    setTranscript("");

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
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
    handleUserSpeech("Can you give me detailed feedback on my speaking? What's my estimated band score and what specific areas should I improve?");
  }, [handleUserSpeech]);

  // Check usage on mount
  useEffect(() => {
    checkDailyUsage();
  }, [checkDailyUsage]);

  // Load voices
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (e) {}
      if (timerRef.current) clearInterval(timerRef.current);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
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
    liveScore,
    startSession,
    stopSession,
    requestFeedback,
    formatTime,
  };
}
