// ElevenLabs Voice Chat Utility
// This provides a wrapper around the ElevenLabs React SDK for voice conversations

export interface EmotionMetrics {
  confidence: number;
  energy: number;
  stress: number;
  engagement: number;
}

export interface VoiceChatCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
  onTranscript?: (text: string, isFinal: boolean, role: 'user' | 'assistant') => void;
  onSpeakingChange?: (isSpeaking: boolean, who: 'user' | 'assistant') => void;
  onEmotionUpdate?: (metrics: EmotionMetrics) => void;
}

// Audio analysis for emotion detection (same logic as before)
export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private emotionInterval: NodeJS.Timeout | null = null;

  constructor(private onEmotionUpdate?: (metrics: EmotionMetrics) => void) {}

  setupAnalysis(stream: MediaStream): void {
    try {
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      // Start emotion detection loop
      this.emotionInterval = setInterval(() => {
        if (!this.analyser) return;
        
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        
        // Calculate audio metrics
        const avgVolume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const maxVolume = Math.max(...dataArray);
        
        // High frequency energy (voice stress indicator)
        const highFreqEnergy = dataArray.slice(dataArray.length / 2).reduce((a, b) => a + b, 0) / (dataArray.length / 2);
        
        // Calculate emotion metrics
        const metrics: EmotionMetrics = {
          confidence: Math.min(100, (avgVolume / 128) * 100 + 20),
          energy: Math.min(100, (maxVolume / 255) * 100),
          stress: Math.min(100, (highFreqEnergy / 128) * 80 + (avgVolume > 100 ? 20 : 0)),
          engagement: Math.min(100, avgVolume > 10 ? 70 + (avgVolume / 128) * 30 : 30),
        };
        
        this.onEmotionUpdate?.(metrics);
      }, 100);
    } catch (err) {
      console.error("Audio analysis setup failed:", err);
    }
  }

  cleanup(): void {
    if (this.emotionInterval) {
      clearInterval(this.emotionInterval);
      this.emotionInterval = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.analyser = null;
    }
  }
}

// Simple voice detection from audio levels
export function detectVoiceActivity(getVolume: () => number): boolean {
  const volume = getVolume();
  return volume > 0.02; // Threshold for voice activity
}
