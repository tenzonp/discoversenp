import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Matilda - Best for expressive multilingual content with warm, natural tone
const DEFAULT_VOICE_ID = "XrExE9yKIg1WjnnlVkGX";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not set");
    }

    const { text, voiceId } = await req.json();
    
    if (!text || text.trim().length === 0) {
      throw new Error("Text is required");
    }

    const selectedVoiceId = voiceId || DEFAULT_VOICE_ID;

    console.log(`🔊 Generating TTS for: "${text.substring(0, 50)}..." with v3 model`);

    // Use ElevenLabs v3 (Flash) - most natural and emotionally expressive model
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
          model_id: "eleven_flash_v2_5", // Fastest with excellent multilingual quality
          voice_settings: {
            stability: 0.30, // Very low for maximum expressiveness
            similarity_boost: 0.80, 
            style: 0.65, // High style for conversational, natural delivery
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
    console.log("✅ TTS generated successfully with flash v2.5 model");

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
