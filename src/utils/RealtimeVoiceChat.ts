import { supabase } from "@/integrations/supabase/client";

export interface RealtimeMessage {
  type: 
    | "session.created"
    | "session.updated"
    | "input_audio_buffer.speech_started"
    | "input_audio_buffer.speech_stopped"
    | "input_audio_buffer.committed"
    | "conversation.item.created"
    | "conversation.item.input_audio_transcription.completed"
    | "response.created"
    | "response.audio.delta"
    | "response.audio.done"
    | "response.audio_transcript.delta"
    | "response.audio_transcript.done"
    | "response.done"
    | "error";
  [key: string]: any;
}

export interface EmotionMetrics {
  confidence: number;
  energy: number;
  stress: number;
  engagement: number;
}

export class RealtimeVoiceChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private localStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private emotionInterval: NodeJS.Timeout | null = null;
  
  constructor(
    private onMessage: (message: RealtimeMessage) => void,
    private onEmotionUpdate?: (metrics: EmotionMetrics) => void,
    private onTranscript?: (text: string, isFinal: boolean, role: 'user' | 'assistant') => void,
    private onSpeakingChange?: (isSpeaking: boolean, who: 'user' | 'assistant') => void
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async init(): Promise<void> {
    try {
      console.log("🎤 Requesting ephemeral token...");
      
      const { data, error } = await supabase.functions.invoke("realtime-voice-token");
      
      if (error || !data?.client_secret?.value) {
        console.error("Token error:", error, data);
        throw new Error("Failed to get ephemeral token");
      }

      const EPHEMERAL_KEY = data.client_secret.value;
      console.log("✅ Got ephemeral token");

      // Create peer connection
      this.pc = new RTCPeerConnection();

      // Set up remote audio playback
      this.pc.ontrack = (e) => {
        console.log("🔊 Received remote audio track");
        this.audioEl.srcObject = e.streams[0];
      };

      // Get local audio with high quality settings
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Set up audio analysis for emotion detection
      this.setupAudioAnalysis(this.localStream);

      // Add local audio track
      this.localStream.getTracks().forEach((track) => {
        this.pc!.addTrack(track, this.localStream!);
      });

      // Set up data channel for events
      this.dc = this.pc.createDataChannel("oai-events");
      this.setupDataChannel();

      // Create and set local description
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      console.log("📡 Connecting to OpenAI Realtime API...");

      // Connect to OpenAI's Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        throw new Error("Failed to connect to OpenAI Realtime API");
      }

      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };

      await this.pc.setRemoteDescription(answer);
      console.log("✅ WebRTC connection established!");

    } catch (error) {
      console.error("❌ Init error:", error);
      this.disconnect();
      throw error;
    }
  }

  private setupDataChannel(): void {
    if (!this.dc) return;

    this.dc.onopen = () => {
      console.log("📨 Data channel opened");
    };

    this.dc.onmessage = (e) => {
      try {
        const event: RealtimeMessage = JSON.parse(e.data);
        console.log("📥 Event:", event.type);
        
        // Handle specific events
        switch (event.type) {
          case "input_audio_buffer.speech_started":
            this.onSpeakingChange?.(true, "user");
            break;
            
          case "input_audio_buffer.speech_stopped":
            this.onSpeakingChange?.(false, "user");
            break;
            
          case "response.audio.delta":
            this.onSpeakingChange?.(true, "assistant");
            break;
            
          case "response.audio.done":
            this.onSpeakingChange?.(false, "assistant");
            break;
            
          case "conversation.item.input_audio_transcription.completed":
            this.onTranscript?.(event.transcript, true, "user");
            break;
            
          case "response.audio_transcript.delta":
            this.onTranscript?.(event.delta, false, "assistant");
            break;
            
          case "response.audio_transcript.done":
            this.onTranscript?.(event.transcript, true, "assistant");
            break;
        }
        
        this.onMessage(event);
      } catch (err) {
        console.error("Failed to parse event:", err);
      }
    };

    this.dc.onerror = (e) => {
      console.error("Data channel error:", e);
    };

    this.dc.onclose = () => {
      console.log("Data channel closed");
    };
  }

  private setupAudioAnalysis(stream: MediaStream): void {
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

  sendTextMessage(text: string): void {
    if (!this.dc || this.dc.readyState !== "open") {
      console.warn("Data channel not ready");
      return;
    }

    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    };

    this.dc.send(JSON.stringify(event));
    this.dc.send(JSON.stringify({ type: "response.create" }));
  }

  disconnect(): void {
    console.log("🔌 Disconnecting...");
    
    if (this.emotionInterval) {
      clearInterval(this.emotionInterval);
      this.emotionInterval = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.analyser = null;
    }

    if (this.dc) {
      this.dc.close();
      this.dc = null;
    }

    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    this.audioEl.srcObject = null;
  }

  isConnected(): boolean {
    return this.dc?.readyState === "open";
  }
}
