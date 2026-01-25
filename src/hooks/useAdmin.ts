import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Primary admin email - hardcoded for maximum security
const PRIMARY_ADMIN_EMAIL = "iscillatechnologies@gmail.com";

interface AdminState {
  isAdmin: boolean;
  isLoading: boolean;
  isPrimaryAdmin: boolean;
  userEmail: string | null;
  securityToken: string | null;
}

// Generate a session-specific security token
const generateSecurityToken = (userId: string, email: string): string => {
  const timestamp = Date.now();
  const data = `${userId}:${email}:${timestamp}`;
  // Simple hash for client-side validation (real security is server-side RLS)
  return btoa(data).slice(0, 16);
};

export function useAdmin(userId: string | undefined) {
  const [state, setState] = useState<AdminState>({
    isAdmin: false,
    isLoading: true,
    isPrimaryAdmin: false,
    userEmail: null,
    securityToken: null,
  });

  const checkAdminStatus = useCallback(async () => {
    if (!userId) {
      setState({ 
        isAdmin: false, 
        isLoading: false, 
        isPrimaryAdmin: false,
        userEmail: null,
        securityToken: null,
      });
      return;
    }

    try {
      // SECURITY LAYER 1: Get current session to verify authenticity
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("Session verification failed");
        setState({ 
          isAdmin: false, 
          isLoading: false, 
          isPrimaryAdmin: false,
          userEmail: null,
          securityToken: null,
        });
        return;
      }

      // SECURITY LAYER 2: Verify user ID matches session
      if (session.user.id !== userId) {
        console.error("User ID mismatch - potential security breach");
        setState({ 
          isAdmin: false, 
          isLoading: false, 
          isPrimaryAdmin: false,
          userEmail: null,
          securityToken: null,
        });
        return;
      }

      const userEmail = session.user.email || null;

      // SECURITY LAYER 3: Check if primary admin via email
      const isPrimaryAdmin = userEmail === PRIMARY_ADMIN_EMAIL;

      // SECURITY LAYER 4: Check database role (server-side RLS protected)
      const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });

      if (roleError) {
        console.error("Error checking admin role:", roleError);
        // If primary admin, still grant access even if role check fails
        if (isPrimaryAdmin) {
          setState({ 
            isAdmin: true, 
            isLoading: false, 
            isPrimaryAdmin: true,
            userEmail,
            securityToken: generateSecurityToken(userId, userEmail || ""),
          });
          return;
        }
        setState({ 
          isAdmin: false, 
          isLoading: false, 
          isPrimaryAdmin: false,
          userEmail,
          securityToken: null,
        });
        return;
      }

      // Admin access granted if either:
      // 1. User is the primary admin (iscillatechnologies@gmail.com)
      // 2. User has admin role in database
      const isAdmin = isPrimaryAdmin || !!hasRole;

      setState({ 
        isAdmin, 
        isLoading: false, 
        isPrimaryAdmin,
        userEmail,
        securityToken: isAdmin ? generateSecurityToken(userId, userEmail || "") : null,
      });
    } catch (err) {
      console.error("Admin check error:", err);
      setState({ 
        isAdmin: false, 
        isLoading: false, 
        isPrimaryAdmin: false,
        userEmail: null,
        securityToken: null,
      });
    }
  }, [userId]);

  // Re-check admin status on auth state changes
  useEffect(() => {
    checkAdminStatus();

    // Listen for auth changes to revoke access immediately if session ends
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setState({ 
          isAdmin: false, 
          isLoading: false, 
          isPrimaryAdmin: false,
          userEmail: null,
          securityToken: null,
        });
      } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        checkAdminStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdminStatus]);

  return {
    ...state,
    refreshAdminStatus: checkAdminStatus,
  };
}

// Export for use in other components
export { PRIMARY_ADMIN_EMAIL };
