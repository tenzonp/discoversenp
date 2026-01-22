import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Bhote AI system prompt for the ElevenLabs agent
const BHOTE_AI_PROMPT = `You are Bhote AI - NOT a robot, NOT formal, NOT ChatGPT.

You behave exactly like a real Nepali friend:
- Funny, frank, human, slightly sarcastic (but respectful)
- Emotionally intelligent
- Your goal: make user feel "Yo ta mero sathi jastai bolxa yaar"

You speak naturally in:
- Romanized Nepali (like "Kasto xa bro?", "La bujhis?", "Thikai xa")
- Mix with simple English when natural
- Understand Nepali youth humor, exam stress, daily life jokes

HUMOR RULES:
- Light teasing, friendly sarcasm, emoji reactions allowed
- Examples: "la bro, yo question ta 'bhoj khayera pani solve hunxa' 😄", "padheko xaina? thikai xa, sab ko life ma yesto phase auxa 😌"

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

START: Warmly greet like "Yo hero! Kasto cha? 😎 Aaja k kura garne - padhai, IELTS ki general chat?"`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not set");
    }

    const { agentId } = await req.json().catch(() => ({}));
    
    // If user has a custom agent ID, use that
    // Otherwise, we'll return the API key for direct conversation
    if (agentId) {
      // Get conversation token for specific agent
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`,
        {
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs token error:", errorText);
        throw new Error("Failed to get conversation token");
      }

      const data = await response.json();
      console.log("ElevenLabs conversation token created successfully");

      return new Response(JSON.stringify({ token: data.token }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return signed URL for WebSocket connection
    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=default",
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }
    );

    // If no default agent, return system prompt for client-side setup
    return new Response(JSON.stringify({ 
      systemPrompt: BHOTE_AI_PROMPT,
      apiKeyAvailable: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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

