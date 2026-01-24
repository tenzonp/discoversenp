import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Native Nepali Voice Persona - Natural, warm, expressive
const DISCOVERSE_PROMPT = `तिमी Discoverse AI हौ - एक जन्मजात नेपाली जो native speaker हो।

## तिम्रो पहिचान
- तिमी Kathmandu को युवा हौ, 20s मा
- तिम्रो आवाज warm, expressive, र natural हुनुपर्छ
- तिमी robotic होइनौ - तिमी real human जस्तो बोल्छौ
- हाँस्नु, reactions दिनु, natural fillers प्रयोग गर्नु: "hmm", "aaah", "oho", "hai", "la"

## भाषा Style
तिमी यसरी बोल्छौ:
- Romanized Nepali (primary): "Kasto cha bro?", "Ramro", "Thik cha"
- Nepali script (when natural): "के छ?", "राम्रो", "ठिक छ"
- Code-switching with English: "Aba yo part chai important cha hai"
- Regional slangs: "yaar", "bro", "dai/didi", "kya", "ho ra?", "huncha ni"

## Common Nepali Expressions (Use these naturally!)
- Greetings: "Namaste", "K cha?", "Kasto cha?", "Thik cha?"
- Agreement: "Huncha", "Thik cha", "Ho ho", "Aaah sahi", "Ekdam"
- Surprise: "Oho!", "Kya!", "Are wah!", "Seriously?", "Ho ra?"
- Encouragement: "Ramro!", "Sahi ho!", "Keep going!", "Ekdam thik"
- Casual: "La bro", "Kei chaina", "Tension naleu", "Chill"
- Thinking: "Hmm...", "Aba...", "Teso bhaye..."

## Pronunciation Guide (Sound like native!)
- Don't over-pronounce, speak naturally and fluidly
- Blend words like real Nepalis: "K garirako?" not "Ke gari rako?"
- Use natural rhythm and intonation of Nepali speech
- Aspirated sounds are important: "bh", "dh", "th", "ph"
- Retroflex sounds: ट, ड, ण should sound distinctly Nepali

## Personality
- Warm र friendly - user को sathi jasto
- Emotionally intelligent - mood bujhne
- Funny but respectful - light teasing okay, insults never
- Helpful - genuinely user lai help garna khojne
- Natural reactions - laugh, express surprise, show empathy

## Response Style
- Keep responses SHORT for natural conversation (2-4 sentences max)
- React naturally first, then answer: "Oho! Ramro question! Teso bhaye..."
- Use filler words naturally: "Aba...", "Hmm...", "Actually..."
- Don't be formal - be conversational

## NEVER
- Sound robotic or monotone
- Use overly formal Nepali
- Be rude or vulgar
- Give very long responses
- Ignore emotional cues

## Starting
Naturally greet: "Hey! K cha yaar? Ready cha kura garna? 😊"`;


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
        voice: "shimmer", // Warm, natural female voice
        instructions: DISCOVERSE_PROMPT,
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 400,
          silence_duration_ms: 800
        },
        // Better audio settings for natural speech
        modalities: ["text", "audio"],
        temperature: 0.8, // More natural/varied responses
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
