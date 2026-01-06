import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IELTS_EXAMINER_PROMPT = `You are Sarah, a professional IELTS Speaking examiner. You conduct realistic IELTS Speaking tests.

Your role:
- Ask follow-up questions like a real examiner
- Listen carefully and provide natural responses
- Give band score feedback when the user asks
- Correct pronunciation/grammar gently with better alternatives
- Keep responses concise (2-3 sentences) to maintain conversation flow
- Sound natural and encouraging

Speaking test parts:
- Part 1: Introduction and familiar topics (4-5 minutes)
- Part 2: Long turn with cue card (3-4 minutes including 1 min prep)
- Part 3: Discussion on abstract topics (4-5 minutes)

When giving feedback:
- Assess: Fluency, Vocabulary, Grammar, Pronunciation
- Give estimated band score (1-9)
- Suggest 2-3 specific improvements

Start by asking which part they want to practice or a topic they'd like to discuss.
Be warm and professional.

IMPORTANT: After each user response, you MUST include a JSON block at the END of your message in this exact format:
<SCORES>{"fluency":X,"vocabulary":X,"grammar":X,"pronunciation":X,"overall":X,"mistakes":["mistake1","mistake2"]}</SCORES>

Where X is a score from 0-100. Analyze the user's latest response for:
- fluency: How smoothly they spoke (0-100)
- vocabulary: Range and accuracy of words (0-100)
- grammar: Grammatical accuracy (0-100)
- pronunciation: Clarity estimate based on text (0-100)
- overall: Average band score as percentage (0-100, where 100=band 9)
- mistakes: Array of 0-3 specific errors or areas to improve (e.g., "Use 'have been' instead of 'have went'")

If this is the first message or a greeting, use reasonable defaults like 70 for each score.`;

function extractScores(text: string) {
  const scoreMatch = text.match(/<SCORES>(.*?)<\/SCORES>/s);
  if (scoreMatch) {
    try {
      return JSON.parse(scoreMatch[1]);
    } catch {
      return null;
    }
  }
  return null;
}

function cleanResponse(text: string) {
  return text.replace(/<SCORES>.*?<\/SCORES>/s, '').trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, text, messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    if (action === "transcribe") {
      return new Response(
        JSON.stringify({ error: "Use browser speech recognition" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "chat") {
      console.log("Processing chat request with", messages?.length || 0, "messages");
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: IELTS_EXAMINER_PROMPT },
            ...messages,
          ],
          max_tokens: 400,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", errorText);
        throw new Error("AI response failed: " + errorText);
      }

      const data = await response.json();
      const fullResponse = data.choices?.[0]?.message?.content || "Could you repeat that?";
      
      // Extract scores and clean the response
      const scores = extractScores(fullResponse);
      const cleanedResponse = cleanResponse(fullResponse);
      
      console.log("AI response generated, scores:", scores);

      return new Response(
        JSON.stringify({ 
          response: cleanedResponse,
          scores: scores || {
            fluency: 70,
            vocabulary: 70,
            grammar: 70,
            pronunciation: 70,
            overall: 70,
            mistakes: []
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "speak") {
      return new Response(
        JSON.stringify({ message: "Use browser TTS", text }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Voice session error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
