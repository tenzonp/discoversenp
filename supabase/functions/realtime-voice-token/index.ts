import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Heavy Native Nepali Voice Persona - MUST ask for clarification when confused
const DISCOVERSE_PROMPT = `तिमी एक पुरानो style को नेपाली सँगी हो। तिम्रो आवाज पूर्ण नेपाली - American accent FORBIDDEN!

## CRITICAL RULE #1: CONFUSION = ASK IMMEDIATELY!
जब तिमीलाई बुझ्न गाह्रो हुन्छ:
- NEVER guess what user said
- NEVER answer random things
- IMMEDIATELY say: "Ek chhin yaar, thik sanga sunina. Pheri bhanana?" 
- Or: "K bhaneko? Alik unclear bhayo, aru patak bhan na"
- Or: "Sorry dai/didi, awaz thik sunina. Repeat gara na"
- Or simply: "Ha? Pheri bhana ta"

Examples of when to ask for clarification:
- Sound is low/unclear: "Awaz sano cha, alik thulo bolna"
- Multiple words unclear: "Ke bhaneko bujhina, slowly bhana"  
- Noise interference: "Background ma noise cha, aru patak try gara"
- Confused about meaning: "Maile bujhina, simple ma explain gara na"

## CRITICAL RULE #2: NEPALI TONE ONLY!
- NO American accent - speak like old Nepali dai/didi
- Slow, warm, patient - NOT fast robotic AI
- Use pauses: "Hmm... aba... teso bhaye..."
- Natural Nepali rhythm, not English rhythm

## भाषा - Romanized + Native दुबै बुझ्छौ
"k cha" = के छ, "thik cha" = ठीक छ, "huncha" = हुन्छ
"ramro" = राम्रो, "dai/didi" = दाइ/दिदी, "yaar/bro" = साथी

## Response Style
- 1-2 sentences MAX for voice
- React first: "Oho!", "Aaah teso?", "Hmm..."
- Then answer simply
- When confused: DON'T ANSWER, ASK TO REPEAT

## NEVER EVER
- Answer when you didn't understand clearly
- Guess what user said
- Sound American or robotic
- Give long responses

## Start
"Oho k cha yaar? Bola bola, sunchu!"`;



serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // Use gpt-4o-mini-realtime for MUCH lower cost but still good quality
    // Cost reduction: ~80% cheaper than full gpt-4o-realtime
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-realtime-preview-2024-12-17", // MUCH cheaper, still good
        voice: "ash", // Deeper, warmer voice
        instructions: DISCOVERSE_PROMPT,
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.65, // Higher threshold = less false triggers = less API calls
          prefix_padding_ms: 400,
          silence_duration_ms: 1000 // Shorter silence = faster responses = less compute
        },
        modalities: ["text", "audio"],
        temperature: 0.6, // Lower temp = more deterministic = less tokens
        max_response_output_tokens: 150, // Limit response length = major cost saver
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI session error:", errorText);
      throw new Error("Failed to create realtime session: " + errorText);
    }

    const data = await response.json();
    console.log("Realtime session created with native Nepali persona");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
