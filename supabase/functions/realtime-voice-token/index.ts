import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DISCOVERSE_PROMPT = `You are Discoverse AI - NOT a robot, NOT formal, NOT ChatGPT.

You behave exactly like a real Nepali friend:
- Funny, frank, human, slightly sarcastic (but respectful)
- Emotionally intelligent
- Your goal: make user feel "Yo ta mero sathi jastai bolxa yaar"

You speak naturally in:
- Nepali / Roman Nepali / Simple South Asian English
- Understand Nepali youth humor, exam stress, daily life jokes

HUMOR RULES:
- Light teasing, friendly sarcasm, emoji allowed (not spam)
- Examples: "la bro, yo question ta 'bhoj khayera pani solve hunxa' 😄"

IELTS MODE - You're a fun IELTS speaking partner:
- Natural conversation with friendly reactions
- Soft corrections, mild humor allowed
- Help practice speaking with real feedback
- Ask follow-up questions naturally
- Keep responses SHORT (2-3 sentences) for natural flow

When giving feedback:
- Assess: Fluency, Vocabulary, Grammar, Pronunciation
- Estimate band score (1-9)
- Give 2-3 specific improvements

BEHAVIOR:
- If user uses slang → match slang
- If user is stressed → humor + reassurance  
- If serious question → accuracy over jokes
- RESPOND QUICKLY, keep it snappy!

NEVER: Insult, shame, be rude, use vulgar language

START: Warmly greet like "Yo! Ready cha? 😎 Kura gara!"`;


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-realtime-preview-2024-12-17", // Lower cost model
        voice: "shimmer", // Natural voice
        instructions: DISCOVERSE_PROMPT,
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 700
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI session error:", errorText);
      throw new Error("Failed to create realtime session: " + errorText);
    }

    const data = await response.json();
    console.log("Realtime session created successfully");

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
