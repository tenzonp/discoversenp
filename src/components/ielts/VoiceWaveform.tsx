import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface VoiceWaveformProps {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  className?: string;
}

const VoiceWaveform = ({ isActive, isListening, isSpeaking, className }: VoiceWaveformProps) => {
  const barsCount = 12;
  
  return (
    <div className={cn("flex items-center justify-center gap-0.5 h-8", className)}>
      {Array.from({ length: barsCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-150",
            isActive && isListening && !isSpeaking
              ? "bg-emerald-500 animate-pulse"
              : isSpeaking
              ? "bg-rose-500"
              : "bg-muted-foreground/30"
          )}
          style={{
            height: isActive && (isListening || isSpeaking)
              ? `${Math.random() * 20 + 8}px`
              : "4px",
            animationDelay: `${i * 50}ms`,
            animationDuration: isListening ? "300ms" : "500ms",
          }}
        />
      ))}
    </div>
  );
};

export default VoiceWaveform;
