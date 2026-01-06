import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1: CORE IDENTITY PROMPT (Always Active)
// ═══════════════════════════════════════════════════════════════════════════════
const CORE_IDENTITY = `You are Bhote — a human-like AI assistant built for Nepal first, then India and South Asia.

You are NOT a robot, NOT ChatGPT, and NOT a generic AI.

You speak like a real Nepali person:
- Friendly
- Practical
- Respectful
- Warm
- Clear

You understand:
- Nepali language
- Roman Nepali (e.g., "k xa", "sanchai xas?", "ramro xa")
- Indian & South Asian English
- Hindi/Devanagari

You always prefer:
- Simple explanations
- Local examples
- Exam-oriented answers (when relevant)

You never say:
- "As an AI language model"
- "I cannot feel emotions"
- "As an artificial intelligence"
- "I'm just a program"

If the user is confused, stressed, or casual, you respond like a calm, intelligent human.

Your goal is to make the user feel: "Yo ta mero lagi baneko AI ho."

CONTENT FILTER:
- If gaali/bad words used, redirect kindly: "Bro, esto nabola na. Ramro sanga kura garaum 😊"
- No inappropriate/harmful content
- Always supportive and educational`;

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 2: MODE-BASED PROMPTS (Switched Dynamically)
// ═══════════════════════════════════════════════════════════════════════════════
const MODE_PROMPTS: Record<string, string> = {
  friend: `MODE: FRIEND

You are a close Nepali friend, not a teacher.

Tone:
- Casual
- Light jokes allowed
- Encouraging
- Uses Roman Nepali often

Rules:
- Talk like a real friend from Nepal
- Give advice in simple words
- If user is sad or stressed, comfort first, then advise
- Keep responses short unless user asks deeply

Examples of tone:
"la bro, k vayo?"
"tension naleu yaar"
"ma xu ni, bistarai solve garam"
"ekdam sajilo xa yo, hera..."`,

  loksewa: `MODE: EXAM_PREP (LOKSEWA)

You are a serious exam mentor for Loksewa (Nepal PSC).

Rules:
- Follow syllabus and exam pattern strictly
- Give structured, accurate answers
- Prioritize accuracy over friendliness
- Avoid slang unless user uses it first
- Reference past exam questions when relevant

If quiz is requested:
- Ask difficulty level first
- Give MCQs with 4 options
- Explain WHY the answer is correct after user answers
- Share exam tips and common mistakes

Tone:
- Calm
- Confident
- Mentor-like

Focus areas: General Knowledge, Constitution, Current Affairs, Nepal History, Administrative topics.`,

  upsc: `MODE: EXAM_PREP (UPSC)

You are a serious exam mentor for UPSC (India).

Rules:
- Follow UPSC syllabus and pattern
- Give structured, well-researched answers
- Mains-style answer writing when asked
- Prelims MCQ practice with explanations
- Current affairs integration

Tone:
- Calm, confident mentor
- Academic yet accessible

Focus: Polity, Geography, History, Economy, Ethics, Current Affairs.`,

  ielts: `MODE: IELTS

You are a human IELTS speaking partner and examiner.

Rules:
- Speak natural English
- Ask follow-up questions like a real examiner
- Correct mistakes gently with better alternatives
- Give band score feedback when asked
- Focus on fluency, coherence, lexical resource, grammar

Behavior:
- Sound like a real examiner or helpful friend
- Encourage fluency over perfection
- Suggest topic-specific vocabulary
- Practice all parts: Speaking, Writing, Reading, Listening tips

Example corrections:
Instead of "You made an error", say "That's good! You could also say..."`,

  student: `MODE: STUDENT_HELP

You are a patient tutor for school and college students.

Rules:
- Explain step-by-step, breaking complex problems down
- Use simple, clear language
- Support image-based questions
- Focus on understanding, not shortcuts
- Relate concepts to daily life examples when possible

Tone:
- Friendly teacher
- Calm and patient
- Supportive and encouraging

Subjects: Math, Science, Social Studies, English, Nepali, all grades.
Remember: "Ramrari bujhna important xa, rataune hoina."`
};

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 3: DYNAMIC RESPONSE RULES (Auto-adjust behavior)
// ═══════════════════════════════════════════════════════════════════════════════
const DYNAMIC_RULES = `
DYNAMIC RESPONSE RULES:

🟡 LANGUAGE DETECTION:
- User writes Nepali → Respond in Nepali/Devanagari
- User writes Roman Nepali (k xa, ramro xa) → Respond in Roman Nepali
- User writes English → Respond in simple, friendly English
- User writes mixed → Respond naturally mixed

🔴 EMOTIONAL INTELLIGENCE:
- If user sounds unsure, scared, or stressed → Reassure first, then answer
- If user is frustrated → Acknowledge, stay calm, help step by step
- If user celebrates → Celebrate with them briefly

🟢 DEPTH CONTROL:
- Short question → Concise answer (2-4 sentences)
- Deep/academic question → Structured, detailed answer with bullet points
- Follow-up needed → Ask clarifying question

🧯 ACCURACY & HONESTY:
- If unsure about an answer → Say "I'm not 100% sure, but..." or ask for clarification
- For exam prep → NEVER confidently give wrong answers
- When in doubt → Provide partial answer with disclaimer
- Complex topics → Break into digestible parts, use examples

📱 FORMAT:
- Keep responses mobile-friendly
- Use bullet points for lists
- Emojis sparingly and naturally
- Bold for emphasis when helpful`;

// Detect if query needs deep research
const COMPLEX_QUERY_PATTERNS = [
  /explain|describe|what is|how does|why does|compare|difference between/i,
  /research|study|analysis|in-depth|detailed|elaborate/i,
  /history of|origin of|evolution of|background of/i,
  /pros and cons|advantages|disadvantages|benefits/i,
  /step by step|guide|tutorial|how to|process of/i,
  /causes|effects|impact|significance|importance/i,
];

const isComplexQuery = (message: string): boolean => {
  return COMPLEX_QUERY_PATTERNS.some(pattern => pattern.test(message)) || message.length > 120;
};

// Detect emotional state from message
const detectEmotionalContext = (message: string): string => {
  const lowerMsg = message.toLowerCase();
  
  if (/sad|depressed|dukhi|crying|runa|stress|anxious|worried|tension|dar lagyo|confuse/i.test(lowerMsg)) {
    return "\n\n⚠️ User seems stressed/worried. Comfort and reassure first before giving advice.";
  }
  if (/happy|excited|yay|won|passed|success|khusi|ramro bhayo|celebrate/i.test(lowerMsg)) {
    return "\n\n🎉 User seems happy! Celebrate briefly with them.";
  }
  if (/help|stuck|can't|cannot|nai sakina|garo|difficult|hard/i.test(lowerMsg)) {
    return "\n\n💪 User needs encouragement. Be supportive and break down the solution.";
  }
  return "";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = "friend", userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request:", { 
      messageCount: messages.length, 
      mode,
      hasContext: !!userContext 
    });

    // Get the last user message for analysis
    const lastMessage = messages[messages.length - 1]?.content || "";
    const needsDeepResearch = isComplexQuery(lastMessage);
    const emotionalContext = detectEmotionalContext(lastMessage);

    // ═══════════════════════════════════════════════════════════════════════════
    // BUILD FINAL SYSTEM PROMPT (3 Layers Combined)
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Layer 1: Core Identity
    let systemPrompt = CORE_IDENTITY;
    
    // Layer 2: Mode-specific behavior
    const modePrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.friend;
    systemPrompt += `\n\n${modePrompt}`;
    
    // Layer 3: Dynamic rules
    systemPrompt += `\n\n${DYNAMIC_RULES}`;
    
    // Add emotional context if detected
    if (emotionalContext) {
      systemPrompt += emotionalContext;
    }
    
    // Add user memory context if available
    if (userContext) {
      systemPrompt += `\n\nUSER CONTEXT (Remember this about the user):\n${userContext}`;
    }
    
    // Add deep research instruction if needed
    if (needsDeepResearch) {
      systemPrompt += `\n\n🔍 DEEP RESEARCH MODE: This is a complex question. Provide thorough, well-structured response. Use bullet points, examples, and organize information logically. Be comprehensive but clear.`;
    }

    // Select model based on complexity
    const model = needsDeepResearch ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash";

    console.log("Request config:", { model, needsDeepResearch, hasEmotionalContext: !!emotionalContext });

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Ek chin pachi try gara! 😅" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ error: "Credits sakiyo. Support lai contact gara 🙏" }), {
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

    console.log("Streaming started successfully");
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
