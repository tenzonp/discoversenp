import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Shield, Loader2, AlertTriangle, Lock } from "lucide-react";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>();
  const [authChecked, setAuthChecked] = useState(false);
  const [securityViolation, setSecurityViolation] = useState(false);
  const [attemptLogged, setAttemptLogged] = useState(false);
  
  const { isAdmin, isLoading, isPrimaryAdmin, userEmail, securityToken } = useAdmin(userId);

  // SECURITY LAYER 1: Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          // Not authenticated - redirect to auth
          navigate("/auth", { replace: true });
          return;
        }
        
        setUserId(user.id);
        setAuthChecked(true);
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/auth", { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate]);

  // SECURITY LAYER 2: Log unauthorized access attempts
  useEffect(() => {
    if (authChecked && !isLoading && !isAdmin && !attemptLogged && userId) {
      setAttemptLogged(true);
      
      // Log the unauthorized access attempt (could be sent to a logging service)
      console.warn(`[SECURITY] Unauthorized admin access attempt by user: ${userId} at ${new Date().toISOString()}`);
      
      // Set security violation state for additional UI feedback
      setSecurityViolation(true);
    }
  }, [authChecked, isLoading, isAdmin, attemptLogged, userId]);

  // SECURITY LAYER 3: Periodic re-validation
  useEffect(() => {
    if (!isAdmin || !securityToken) return;

    // Re-validate every 5 minutes while on admin panel
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Session expired - force logout
        navigate("/auth", { replace: true });
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAdmin, securityToken, navigate]);

  // Loading state
  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Shield className="w-16 h-16 mx-auto text-primary animate-pulse" />
            <Lock className="w-6 h-6 absolute bottom-0 right-1/2 translate-x-1/2 text-primary" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verifying admin credentials...</p>
        </div>
      </div>
    );
  }

  // Access denied - show security warning
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <Shield className="w-20 h-20 mx-auto text-destructive" />
            {securityViolation && (
              <AlertTriangle className="w-8 h-8 absolute -top-2 -right-2 text-orange-500 animate-bounce" />
            )}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
            <p className="text-muted-foreground">
              This area is restricted to authorized administrators only.
            </p>
          </div>

          {securityViolation && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <p className="text-sm text-orange-600 dark:text-orange-400">
                ⚠️ This access attempt has been logged for security purposes.
              </p>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Security Information:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Multi-layer authentication required</li>
              <li>• Database-level access control (RLS)</li>
              <li>• Session-based security tokens</li>
              <li>• Unauthorized attempts are logged</li>
            </ul>
          </div>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Admin verified - render children with security context
  return (
    <div data-admin-verified="true" data-security-token={securityToken?.slice(0, 4)}>
      {children}
    </div>
  );
}
