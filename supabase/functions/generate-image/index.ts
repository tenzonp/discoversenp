import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DAILY_LIMIT = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt, editImageUrl } = await req.json();
    
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check usage in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { count } = await supabase
      .from("image_generation_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("generated_at", twentyFourHoursAgo);

    const currentCount = count || 0;
    
    if (currentCount >= DAILY_LIMIT) {
      return new Response(JSON.stringify({ 
        error: "Daily limit reached", 
        message: `Aja ko ${DAILY_LIMIT} image sakiyo! Bholi try gara 🙏`,
        remaining: 0 
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build the message content based on whether it's an edit or generate request
    let messageContent: any;
    
    if (editImageUrl) {
      // Image editing request - could be editing generated or uploaded image
      messageContent = [
        {
          type: "text",
          text: `Edit this image according to these instructions: ${prompt}
Make the requested changes while preserving the overall style and quality.
IMPORTANT: Add a subtle "Discoverse" text watermark in the bottom-right corner.`
        },
        {
          type: "image_url",
          image_url: { url: editImageUrl }
        }
      ];
    } else {
      // Image generation request with Discoverse branding
      messageContent = `Generate a high quality, artistic image: ${prompt}. 
IMPORTANT: Add a subtle "Discoverse" text watermark in the bottom-right corner of the image. 
The watermark should be small, elegant, semi-transparent white text with a subtle shadow for visibility.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content: messageContent }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Image generate garna sakiyena");
    }

    const data = await response.json();
    const base64Image = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!base64Image) {
      throw new Error("No image generated");
    }

    // Extract base64 data and upload to storage
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const fileName = `${user.id}/generated-${Date.now()}.png`;
    
    const { error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(fileName, imageBuffer, {
        contentType: "image/png",
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to save image");
    }

    const { data: { publicUrl } } = supabase.storage
      .from("chat-images")
      .getPublicUrl(fileName);

    // Record usage
    await supabase.from("image_generation_usage").insert({
      user_id: user.id,
      prompt: prompt.slice(0, 500),
      image_url: publicUrl,
    });

    const remaining = DAILY_LIMIT - currentCount - 1;

    return new Response(JSON.stringify({ 
      imageUrl: publicUrl, 
      remaining,
      message: `Image ready! ${remaining} baaki cha aja 🎨`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate image error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate image" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});