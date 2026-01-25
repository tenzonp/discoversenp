import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin, PRIMARY_ADMIN_EMAIL } from "@/hooks/useAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  Shield, 
  ArrowLeft,
  Loader2,
  Lock,
  CheckCircle,
  Crown
} from "lucide-react";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminRoles from "@/components/admin/AdminRoles";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";

function AdminPanel() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>();
  const { isPrimaryAdmin, userEmail, securityToken } = useAdmin(userId);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Secure Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Admin Panel
                <Lock className="w-4 h-4 text-green-500" />
              </h1>
              <p className="text-xs text-muted-foreground">Secure Management Console</p>
            </div>
          </div>
          
          {/* Security Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Verified</span>
            </div>
            
            {isPrimaryAdmin && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                <Crown className="w-3 h-3 mr-1" />
                Primary Admin
              </Badge>
            )}
            
            {userEmail && (
              <Badge variant="outline" className="hidden md:flex">
                {userEmail}
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Security Banner */}
      <div className="bg-green-500/10 border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <Lock className="w-4 h-4" />
            <span>Secure session active</span>
            {securityToken && (
              <span className="text-xs opacity-60">• Token: {securityToken.slice(0, 4)}***</span>
            )}
          </div>
          <div className="text-xs text-green-600 dark:text-green-500">
            Multi-layer protection enabled
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Roles</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="payments">
            <AdminPayments />
          </TabsContent>

          <TabsContent value="roles">
            <AdminRoles />
          </TabsContent>
        </Tabs>
      </main>

      {/* Security Footer */}
      <footer className="border-t border-border py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>🔐 Protected by multi-layer security • Database RLS • Session validation • Access logging</p>
          <p className="mt-1 opacity-60">Primary Admin: {PRIMARY_ADMIN_EMAIL}</p>
        </div>
      </footer>
    </div>
  );
}

// Export wrapped with protection
export default function Admin() {
  return (
    <ProtectedAdminRoute>
      <AdminPanel />
    </ProtectedAdminRoute>
  );
}
