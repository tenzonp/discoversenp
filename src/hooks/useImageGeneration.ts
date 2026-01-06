import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

interface UseImageGenerationReturn {
  isGenerating: boolean;
  remaining: number | null;
  generateImage: (prompt: string) => Promise<string | null>;
  checkRemaining: () => Promise<number>;
}

export const useImageGeneration = (): UseImageGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const { toast } = useToast();

  const checkRemaining = useCallback(async (): Promise<number> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return 5;

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { count } = await supabase
        .from("image_generation_usage")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .gte("generated_at", twentyFourHoursAgo);

      const used = count || 0;
      const left = Math.max(0, 5 - used);
      setRemaining(left);
      return left;
    } catch {
      return 5;
    }
  }, []);

  const generateImage = useCallback(async (prompt: string): Promise<string | null> => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please provide a prompt for the image",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Login Required",
          description: "Please login to generate images",
          variant: "destructive",
        });
        return null;
      }

      const response = await fetch(GENERATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Limit Reached",
            description: data.message || "You've used all 5 generations for today",
            variant: "destructive",
          });
          setRemaining(0);
          return null;
        }
        throw new Error(data.error || "Failed to generate image");
      }

      setRemaining(data.remaining);
      
      toast({
        title: "Image Generated!",
        description: `${data.remaining} generations remaining today`,
      });

      return data.imageUrl;
    } catch (error) {
      console.error("Image generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  return {
    isGenerating,
    remaining,
    generateImage,
    checkRemaining,
  };
};
