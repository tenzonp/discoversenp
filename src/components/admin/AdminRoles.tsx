import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Shield, 
  UserPlus, 
  Trash2,
  Loader2,
  Crown,
  AlertTriangle
} from "lucide-react";

interface AdminRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  email?: string;
}

export default function AdminRoles() {
  const [admins, setAdmins] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("role", "admin")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get emails for each admin
      const enrichedAdmins = await Promise.all(
        (data || []).map(async (admin) => {
          const { data: email } = await supabase.rpc("get_user_email", {
            _user_id: admin.user_id,
          });
          return { ...admin, email: email || "Unknown" };
        })
      );

      setAdmins(enrichedAdmins);
    } catch (err) {
      console.error("Error loading admins:", err);
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setAdding(true);
    try {
      // Call the bootstrap function
      const { error } = await supabase.rpc("bootstrap_admin_by_email", {
        _email: newAdminEmail.trim(),
      });

      if (error) throw error;

      toast.success(`Admin role will be assigned when ${newAdminEmail} signs up (or immediately if already registered)`);
      setNewAdminEmail("");
      loadAdmins();
    } catch (err) {
      console.error("Error adding admin:", err);
      toast.error("Failed to add admin. Make sure the email is registered.");
    } finally {
      setAdding(false);
    }
  };

  const removeAdmin = async (roleId: string, email: string) => {
    if (email === "iscillatechnologies@gmail.com") {
      toast.error("Cannot remove the primary admin");
      return;
    }

    setRemoving(roleId);
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast.success("Admin role removed");
      loadAdmins();
    } catch (err) {
      console.error("Error removing admin:", err);
      toast.error("Failed to remove admin");
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add New Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter user email..."
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              type="email"
            />
            <Button onClick={addAdmin} disabled={adding}>
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add Admin"
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            The user must be registered. Admin role will be assigned immediately.
          </p>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Security Notice</p>
              <p className="text-sm text-muted-foreground">
                Admins have full access to all user data, payments, and system settings. 
                Only add trusted team members.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Current Admins ({admins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{admin.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(admin.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {admin.email === "iscillatechnologies@gmail.com" ? (
                    <Badge variant="secondary">Primary</Badge>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAdmin(admin.id, admin.email || "")}
                      disabled={removing === admin.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {removing === admin.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {admins.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No admins configured
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
