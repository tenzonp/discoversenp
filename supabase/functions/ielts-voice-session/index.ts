import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IELTS_EXAMINER_PROMPT = `You are a professional IELTS Speaking examiner named Sarah. You conduct realistic IELTS Speaking tests.

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
Be warm and professional. Remember: "That's a good point! You could also say..."`;

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
      // For now, we use the browser's Web Speech API for transcription
      // This endpoint is for future server-side transcription
      return new Response(
        JSON.stringify({ error: "Use browser speech recognition" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "chat") {
      // Generate AI response for voice practice
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
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        throw new Error("AI response failed");
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || "Could you repeat that?";

      return new Response(
        JSON.stringify({ response: aiResponse }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "speak") {
      // Generate TTS using ElevenLabs-style response
      // For now, we'll use browser's speechSynthesis
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
