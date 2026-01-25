import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminState {
  isAdmin: boolean;
  isLoading: boolean;
}

export function useAdmin(userId: string | undefined) {
  const [state, setState] = useState<AdminState>({
    isAdmin: false,
    isLoading: true,
  });

  const checkAdminStatus = useCallback(async () => {
    if (!userId) {
      setState({ isAdmin: false, isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });

      if (error) {
        console.error("Error checking admin status:", error);
        setState({ isAdmin: false, isLoading: false });
        return;
      }

      setState({ isAdmin: !!data, isLoading: false });
    } catch (err) {
      console.error("Admin check error:", err);
      setState({ isAdmin: false, isLoading: false });
    }
  }, [userId]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  return state;
}
