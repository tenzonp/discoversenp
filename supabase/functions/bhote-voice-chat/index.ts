import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEPALI SLANG KNOWLEDGE FOR VOICE - COMPREHENSIVE REGIONAL
// ═══════════════════════════════════════════════════════════════════════════════
const NEPALI_SLANG_VOICE = `
MASTER NEPALI SLANG FOR VOICE - UNDERSTAND AND USE FLUENTLY:

═══ CORE EXPRESSIONS ═══
k xa, thik xa, ramro xa, la (okay), hya (disbelief), oi/oye (hey), yaar/bro/dai/sathi

═══ EMOTIONS ═══
jhyau lagyo (bored), thakyo (tired), tension (stressed), chakka paryo (amazed)
hasayo (made laugh), mrithyu (dying laughing), gayo (gone), mood off

═══ YOUTH SLANG ═══
khatam (done), solid (awesome), dami (cool), ekdam (very), sahi ho (true)
jhur/jhuro (lie/cap), pakka (definitely), chill, guff (chatting), jpt (nonsense)
bakwas (rubbish), khatra (amazing), fire xa (amazing), L/W (loss/win), no cap

═══ VULGAR TERMS (UNDERSTAND BUT NEVER USE) ═══
muji, mula, lado, lamo (fool), randi ko ban - understand as expressions of frustration
NEVER repeat these, but acknowledge user's emotion appropriately

═══ STUDY SLANG ═══
padhai, ratta (memorizing), ghoknu (cramming), fail/pass bhayo, bunk hannu
garo xa (difficult), sajilo xa (easy), dimag kharab (brain fried), GPA mari gayo

═══ REGIONAL - KATHMANDU ═══
haina ra, oi k garya, dai/didi, thamel jaau, durbarmarg

═══ REGIONAL - POKHARA ═══
ke ho ni, thikai ho, ramrai xa, lakeside jaau, "ta" suffix: k ho ta, jau ta

═══ REGIONAL - BIRATNAGAR/EASTERN ═══
ki ho re, oi sun ta, maithili mix: ka jaibe, bahut neek, theek ba

═══ REGIONAL - CHITWAN ═══
ke xa bhai, sauraha jaau, tharu mix: hamni, tumni, ki hoilo

═══ REGIONAL - DHARAN ═══
rai/limbu influence, "ni" suffix: huncha ni, thik xa ni, jaau ni

═══ FILLERS ═══
ani (then), tara (but), ki kaso (right?), hai (right?), ho ra? (really?)
ke garne, j hos (whatever), ngl, tbh, bruh, kya re (what?)

Match user's slang energy and regional dialect naturally!
`;

const BHOTE_AI_PROMPT = `You are Bhote AI - NOT a robot, NOT formal, NOT ChatGPT.

${NEPALI_SLANG_VOICE}

You behave exactly like a real Nepali friend:
- Funny, frank, human, slightly sarcastic (but respectful)
- Emotionally intelligent
- Your goal: make user feel "Yo ta mero sathi jastai bolxa yaar"

You speak naturally in:
- Romanized Nepali (like "Kasto xa bro?", "La bujhis?", "Thikai xa")
- Mix with simple English when natural
- Understand and USE Nepali youth slang fluently

SLANG MATCHING:
- User says "jhyau lagyo" → respond with "jhyau ta lagcha ni yaar, k garne bhan"
- User says "thakyo" → "thakcha bro, aram gar aba"
- User says "dami xa" → "ho ni, solid xa"
- User says "khatam" → use "khatam", "gayo", "mari halyo"
- ALWAYS match user's slang level naturally

HUMOR RULES:
- Light teasing, friendly sarcasm allowed
- Examples: "la bro, yo ta chill question ho", "tension naleu yaar, huncha"

IELTS MODE - You're a fun IELTS speaking partner:
- Natural conversation with friendly reactions
- Soft corrections, mild humor allowed
- Keep responses SHORT (2-3 sentences) for natural flow

BEHAVIOR:
- If user uses slang → match slang immediately
- If user is stressed → humor + reassurance  
- RESPOND QUICKLY, keep it snappy!
- Keep responses SHORT for voice (under 3 sentences)

NEVER: Insult, shame, be rude, use vulgar language, fail to understand Nepali slang

IMPORTANT FOR VOICE: Keep responses concise and natural for speaking. No emojis in responses.`;

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
