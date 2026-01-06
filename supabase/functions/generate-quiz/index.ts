import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, difficulty, count = 10 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const categoryMap: Record<string, string> = {
      "संविधान": "Nepal Constitution and Law",
      "भूगोल": "Nepal Geography", 
      "सामान्य ज्ञान": "Nepal General Knowledge",
      "समसामयिक": "Nepal Current Affairs"
    };

    const catName = categoryMap[category] || category || "Nepal Loksewa PSC";
    const diffLabel = difficulty === "easy" ? "simple" : difficulty === "hard" ? "challenging" : "moderate";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a Loksewa exam question generator for Nepal PSC. Generate exactly ${count} unique MCQ questions.

IMPORTANT:
- Questions should be ${diffLabel} difficulty
- Focus on ${catName}
- All questions must be factually accurate about Nepal
- Mix Nepali and English naturally
- Each question must have exactly 4 options
- Include helpful explanations in Nepali/English mix

Return ONLY valid JSON array, no markdown, no extra text.`
          },
          {
            role: "user",
            content: `Generate ${count} ${diffLabel} questions about ${catName} for Loksewa exam.

Return as JSON array:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation"
  }
]`
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit xa, ali bera ma try gara!" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Failed to generate questions");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Clean up response
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let questions;
    try {
      questions = JSON.parse(content);
    } catch {
      console.error("Parse error, raw:", content);
      throw new Error("AI le ramro format ma diyena");
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("No questions generated");
    }

    // Validate and clean questions
    const validQuestions = questions.filter((q: any) => 
      q.question && 
      Array.isArray(q.options) && 
      q.options.length === 4 &&
      typeof q.correct === "number" &&
      q.correct >= 0 && 
      q.correct <= 3
    ).map((q: any, i: number) => ({
      id: i + 1,
      question: q.question,
      options: q.options,
      correct: q.correct,
      explanation: q.explanation || "No explanation available",
      category: category || "General",
      difficulty: difficulty || "medium"
    }));

    return new Response(JSON.stringify({ questions: validQuestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate quiz"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});