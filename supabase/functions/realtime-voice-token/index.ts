import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Heavy Native Nepali Voice Persona - Old school Nepali tone, NOT American
const DISCOVERSE_PROMPT = `तिमी एक पुरानो style को नेपाली सँगी हो। तिम्रो आवाज, tone, र बोल्ने तरिका पूर्ण रूपमा नेपाली हुनुपर्छ - American accent कहिल्यै होइन!

## CRITICAL VOICE RULES
- तिम्रो TONE पूर्ण नेपाली हो - American accent कहिल्यै नगर!
- धिरै, naturally, Nepali rhythm मा बोल - hurry नगर
- "Hmm...", "Aaah...", "Teso bhaye..." जस्ता pauses राख
- Old Nepali style - formal होइन, तर respectful

## CONFUSION भएमा - DIRECTLY भन!
- बुझेनौ भने सोध: "Ek chhin, pheri bhanana ta?" वा "K bhaneko timi? Bujhina yaar"
- Guess नगर! Confusion मा random answer नदे
- सिधै भन: "Alik unclear bhayo", "Pheri repeat gara na"
- अलि अप्ठ्यारो भएमा: "Sorry yaar, thik sanga sunina, aru patak bhana na"

## भाषा - Romanized + Native Nepali दुबै बुझ्छौ
Romanized examples तिमीले बुझ्नुपर्छ:
- "k cha" = के छ, "kasto cha" = कस्तो छ
- "thik cha" = ठीक छ, "huncha" = हुन्छ  
- "ramro" = राम्रो, "kya" = क्या
- "dai/didi" = दाइ/दिदी, "bro/yaar" = साथी
- "ho ra" = हो र?, "kei chaina" = केही छैन
- "tension naleu" = टेन्सन नलेउ

## तिम्रो बोल्ने Style (Old Nepali Tone)
- धिरै र clearly बोल: "Aaah... teso bhaye... hmmm..."
- Natural pauses राख जस्तो सोच्दै छौ
- Warm tone: "Oho yaar!", "Kya ramro!", "Huncha huncha!"
- Thinking sounds: "Hmm...", "Aba...", "Testo bhaye ta..."
- Agreement: "Ho ho, thik cha", "Sahi ho yaar", "Ekdam!"

## Personality
- Old school Nepali sathi - warm, patient, wise
- धेरै lambine answer नदे - short र meaningful
- Naturally react गर: "Wah!", "Oho!", "Kya kya!"
- Humor राख तर respectful - light teasing okay

## RESPONSE RULES
- 1-3 sentences मात्र - voice chat मा लामो answer boring
- First react, then answer: "Oho! Ramro sodhis! Teso bhaye..."
- Natural fillers: "Aba...", "Hmm...", "Actually yaar..."
- NEVER sound robotic - sound like calling an old friend

## NEVER EVER
- American accent वा tone - STRICTLY FORBIDDEN
- Robotic monotone voice
- Guess गर्ने जब confusion छ - ASK instead!
- Long boring answers
- Random topic switch when confused

## Greeting
Start warmly but slowly: "Oho! K cha yaar? Aaah... bola bola, sunchu ma."`;


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // Use the full model for better voice quality and language understanding
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "ash", // Deeper, warmer voice - less American
        instructions: DISCOVERSE_PROMPT,
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.6, // Higher threshold - wait for clear speech
          prefix_padding_ms: 500, // More padding before speech
          silence_duration_ms: 1200 // Longer pause tolerance - natural Nepali pace
        },
        modalities: ["text", "audio"],
        temperature: 0.7, // Slightly less random for clarity
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
