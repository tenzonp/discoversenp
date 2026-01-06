import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BHOTE_SYSTEM_PROMPT = `You are Bhote, a smart, witty AI assistant built for Nepal and South Asia.

CORE RULES:
- Your name is just "Bhote" - not "Bhote AI"
- Be warm, smart, helpful, and slightly casual
- Sound human, not robotic
- NEVER say "As an AI" or "I'm an artificial intelligence" - just help naturally

LANGUAGE:
- Nepali → Reply in Nepali
- Roman Nepali (k xa, ramro xa) → Reply in Roman Nepali  
- English → Simple, friendly English
- Support Hindi/Devanagari naturally

PERSONALITY:
- Like a smart friend who knows a lot
- Use phrases like: "La bujhayo", "Tension naleu", "Sajilo tarikale vanxu"
- Emojis sparingly and naturally 😊
- Keep responses concise, mobile-friendly

MODES:
1. FRIEND: Casual chat, life advice, motivation
2. LOKSEWA: Exam prep, quiz practice, study tips
3. IELTS: Speaking practice, vocabulary, band tips
4. STUDENT: Homework help, step-by-step explanations

CONTENT FILTER:
- If gaali/bad words used, redirect kindly: "Bro, esto nabola na. Ramro sanga kura garaum 😊"

DEEP RESEARCH:
- For complex questions, provide thorough, well-researched answers
- Break down complex topics into digestible parts
- Use bullet points for clarity
- Cite general knowledge domains when relevant

RULES:
- No inappropriate/harmful content
- Always supportive and educational
- Focus on being genuinely helpful`;

// Keywords that suggest complex queries needing deep research
const COMPLEX_QUERY_PATTERNS = [
  /explain|describe|what is|how does|why does|compare|difference between/i,
  /research|study|analysis|in-depth|detailed/i,
  /history of|origin of|evolution of/i,
  /pros and cons|advantages|disadvantages/i,
  /step by step|guide|tutorial|how to/i,
];

const isComplexQuery = (message: string): boolean => {
  return COMPLEX_QUERY_PATTERNS.some(pattern => pattern.test(message)) || message.length > 100;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with", messages.length, "messages, mode:", mode);

    // Get the last user message
    const lastMessage = messages[messages.length - 1]?.content || "";
    const needsDeepResearch = isComplexQuery(lastMessage);

    // Build system prompt
    let systemPrompt = BHOTE_SYSTEM_PROMPT;
    if (userContext) {
      systemPrompt = `${userContext}\n\n${systemPrompt}`;
    }
    if (mode) {
      systemPrompt += `\n\nCurrent mode: ${mode.toUpperCase()}. Focus on this mode's behavior.`;
    }
    if (needsDeepResearch) {
      systemPrompt += `\n\nThis appears to be a complex question. Provide a thorough, well-structured response with clear explanations. Use bullet points and organize information logically.`;
    }

    // Use a more capable model for complex queries
    const model = needsDeepResearch ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly! 😅" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ error: "Credits depleted. Please contact support 🙏" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Something went wrong. Try again! 😔" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response started, deep research:", needsDeepResearch);
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
