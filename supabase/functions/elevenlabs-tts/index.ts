import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hindi/Nepali optimized voices from Voice Library
const HINDI_VOICES = {
  // DB - Indian Hindi Voice (Female) - Trained specifically for Hindi
  hindi_female: "2F1KINpxsttim2WfMbVs",
  // Aria - Natural conversational female voice, great for South Asian languages
  aria: "9BWtsMINqrJLrRacOk9x",
  // Jessica - Warm, expressive female voice
  jessica: "cgSgspJ2msm6clMCkdW9",
  // Matilda - Warm multilingual voice
  matilda: "XrExE9yKIg1WjnnlVkGX",
};

// Default to Hindi-trained voice for best Nepali/Hindi output
const DEFAULT_VOICE_ID = HINDI_VOICES.hindi_female;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not set");
    }

    const { text, voiceId, voiceType } = await req.json();
    
    if (!text || text.trim().length === 0) {
      throw new Error("Text is required");
    }

    // Allow selecting voice by type or direct ID
    let selectedVoiceId = voiceId || DEFAULT_VOICE_ID;
    if (voiceType && HINDI_VOICES[voiceType as keyof typeof HINDI_VOICES]) {
      selectedVoiceId = HINDI_VOICES[voiceType as keyof typeof HINDI_VOICES];
    }

    console.log(`🔊 Generating TTS with Hindi voice: ${selectedVoiceId}`);
    console.log(`📝 Text: "${text.substring(0, 80)}..."`);

    // Use multilingual v2 with Hindi-trained voice for natural Nepali/Hindi
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2", // Best for Hindi/Nepali
          voice_settings: {
            stability: 0.25, // Very low for maximum natural expression
            similarity_boost: 0.75,
            style: 0.70, // High style for conversational, natural delivery
            use_speaker_boost: true,
            speed: 1.0,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs TTS error:", errorText);
      throw new Error(`TTS failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("✅ TTS generated with Hindi-trained voice");

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
