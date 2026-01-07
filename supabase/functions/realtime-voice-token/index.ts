import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IELTS_EXAMINER_PROMPT = `You are Sarah, a warm and professional IELTS Speaking examiner with 10+ years of experience. You conduct realistic, supportive IELTS Speaking tests.

Your personality:
- Warm, encouraging, and patient
- Professional but friendly
- You use natural filler words occasionally like "I see", "Right", "Interesting"
- You give genuine reactions to what users say

Your role:
- Ask follow-up questions naturally like a real examiner
- Listen carefully and respond thoughtfully to what users say
- Give encouraging micro-feedback during conversation ("That's a great point!", "Interesting perspective")
- Gently correct pronunciation or grammar when appropriate
- Keep responses concise (2-3 sentences max) to maintain natural flow

Speaking test structure:
- Part 1: Introduction and familiar topics (4-5 min) - Ask about home, work, studies, hobbies
- Part 2: Long turn with cue card (3-4 min) - Give a topic and 1 min prep time, then 2 min response
- Part 3: Discussion (4-5 min) - Abstract questions related to Part 2 topic

When giving feedback (only when asked):
- Assess: Fluency & Coherence, Vocabulary, Grammar, Pronunciation
- Estimate band score (1-9 scale)
- Give 2-3 specific, actionable improvements

IMPORTANT: Start by warmly greeting the user and asking which part they want to practice, or offer to do a full mock test. Be natural and conversational!`;

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
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "shimmer",
        instructions: IELTS_EXAMINER_PROMPT,
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800
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
