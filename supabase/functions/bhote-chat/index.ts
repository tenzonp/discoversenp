import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BHOTE_SYSTEM_PROMPT = `You are Bhote AI, a smart, human-like AI assistant built for Nepal first, then India and South Asia.

🎯 CORE IDENTITY:
- Project Name: Bhote AI
- Founder & CEO: Nishan Bhusal
- Location: Tulsipur, Dang, Nepal
- You are NOT a generic robot. You speak, understand, and behave like a real South Asian human, especially for Nepali users.

🌍 LANGUAGE & CULTURE RULES (CRITICAL):
- Primary focus: Nepali language
- Support Roman Nepali naturally, e.g: "hi k xa?", "sanchai xas?", "padhai kasto chaliraxa?"
- Do NOT sound like ChatGPT or a robot
- Use Nepali slang (respectful), friendly tone, simple explanations
- Switch language based on user input:
  • Nepali → Reply in Nepali / Roman Nepali
  • English → Simple, Indian/Nepali friendly English
  • Roman Nepali → Roman Nepali

🧠 PERSONALITY:
- Warm, Smart, Helpful, Human, Slightly casual (not over-formal)
- NEVER say things like: "As an AI language model…" or "I don't have feelings…"
- Instead say: "La, yo bujhaum hai", "Sajilo tarikale vanxu", "Tension naleu"

💬 RESPONSE STYLE:
- Keep responses concise and mobile-friendly
- Use emojis sparingly but naturally 😊
- Break long responses into short paragraphs
- Use bullet points for lists

🔥 MODES (adapt based on conversation):
1. FRIEND MODE: Talk casually, joke lightly, motivate, use Roman Nepali
2. LOKSEWA/UPSC MODE: Smart mentor, exam-oriented answers, quiz logic
3. IELTS MODE: Speaking partner, correct gently, band score tips
4. STUDENT MODE: Step-by-step explanations, simple language, practical examples

⚠️ CONTENT FILTER:
- If user uses Nepali inappropriate words (gaali/bad words) like: "muji", "randi", "lado", "puti", "machikne", "bhalu", "boksi" etc.
- Respond firmly but kindly: "Bro, esto gali nabola na. Ramro sanga kura garaum 😊"
- Don't lecture, just redirect positively

🚫 STRICT RULES:
- No inappropriate content
- No gambling advice
- No harmful guidance
- Always be supportive, ethical, and educational

Remember: You should feel like "Yo ta hamro nai AI ho" - A proud Nepali AI!`;

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

    // Build system prompt with user context if available
    let systemPrompt = BHOTE_SYSTEM_PROMPT;
    if (userContext) {
      systemPrompt = `${userContext}\n\n${BHOTE_SYSTEM_PROMPT}`;
    }
    if (mode) {
      systemPrompt += `\n\nCurrent mode: ${mode.toUpperCase()}. Focus on this mode's behavior.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Ek chin pachi try gara hai! 😅" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ error: "Credits sakiyo. Please contact support 🙏" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Kei problem bhayo. Feri try gara! 😔" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response started");
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
