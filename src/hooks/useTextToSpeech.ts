import { useState, useCallback, useEffect, useRef } from "react";

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported("speechSynthesis" in window);
    
    // Load preference from localStorage
    const saved = localStorage.getItem("bhote-tts-enabled");
    setIsEnabled(saved === "true");

    // Preload voices
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem("bhote-tts-enabled", String(newValue));
      if (!newValue && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return newValue;
    });
  }, []);

  const speak = useCallback((text: string, onComplete?: () => void) => {
    if (!isSupported || !isEnabled) {
      onComplete?.();
      return;
    }

    // Clean text for better speech
    const cleanText = text
      .replace(/\[Image:.*?\]/g, "Generated image")
      .replace(/```[\s\S]*?```/g, "Code block")
      .replace(/[#*_~`]/g, "")
      .replace(/\n+/g, ". ")
      .trim();

    if (!cleanText) {
      onComplete?.();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    // Try to get a good voice
    const voices = window.speechSynthesis.getVoices();
    const goodVoice = voices.find(v => 
      v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Microsoft")
    ) || voices.find(v => v.lang.startsWith("en"));
    
    if (goodVoice) utterance.voice = goodVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onComplete?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      onComplete?.();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, isEnabled]);

  const stop = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isSpeaking,
    isSupported,
    isEnabled,
    toggleEnabled,
    speak,
    stop,
  };
}
