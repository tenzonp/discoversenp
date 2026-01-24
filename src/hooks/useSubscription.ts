import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type SubscriptionTier = "free" | "pro" | "premium";

interface Subscription {
  tier: SubscriptionTier;
  expiresAt: Date | null;
  isActive: boolean;
}

interface UseSubscriptionReturn {
  subscription: Subscription;
  isLoading: boolean;
  messageLimit: number;
  voiceMinutes: number;
  refresh: () => Promise<void>;
}

const TIER_LIMITS = {
  free: { messages: 50, voiceMinutes: 3 },
  pro: { messages: 150, voiceMinutes: 30 },
  premium: { messages: 500, voiceMinutes: 120 },
};

export const useSubscription = (userId: string | undefined): UseSubscriptionReturn => {
  const [subscription, setSubscription] = useState<Subscription>({
    tier: "free",
    expiresAt: null,
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("tier, expires_at")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching subscription:", error);
      }

      if (data) {
        const expiresAt = data.expires_at ? new Date(data.expires_at) : null;
        const isActive = !expiresAt || expiresAt > new Date();
        
        setSubscription({
          tier: (isActive ? data.tier : "free") as SubscriptionTier,
          expiresAt,
          isActive,
        });
      } else {
        // No subscription record = free tier
        setSubscription({ tier: "free", expiresAt: null, isActive: true });
      }
    } catch (err) {
      console.error("Subscription fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const limits = TIER_LIMITS[subscription.tier];

  return {
    subscription,
    isLoading,
    messageLimit: limits.messages,
    voiceMinutes: limits.voiceMinutes,
    refresh: fetchSubscription,
  };
};
