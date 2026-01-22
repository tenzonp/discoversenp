import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
- Keep responses SHORT for voice (under 3 sentences usually)

NEVER: Insult, shame, be rude, use vulgar language

IMPORTANT FOR VOICE: Keep responses concise and natural for speaking. No emojis in responses (they can't be spoken).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not set");
    }

    const { message, conversationHistory = [] } = await req.json();
    
    if (!message || message.trim().length === 0) {
      throw new Error("Message is required");
    }

    console.log(`💬 Processing voice message: "${message.substring(0, 50)}..."`);

    // Build conversation messages
    const messages = [
      { role: "system", content: BHOTE_AI_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 150, // Keep responses short for voice
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Maile bujhina, feri bhana ta?";
    
    console.log(`✅ AI response: "${aiResponse.substring(0, 50)}..."`);

    return new Response(JSON.stringify({ response: aiResponse }), {
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
