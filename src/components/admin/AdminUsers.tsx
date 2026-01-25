import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Search, 
  Crown, 
  User,
  Calendar,
  MessageSquare,
  Mic,
  Loader2
} from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
  subscription?: {
    tier: string;
    expires_at: string | null;
  };
  stats?: {
    messages: number;
    voiceMinutes: number;
    streak: number;
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Get all profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get subscriptions
      const { data: subscriptions } = await supabase
        .from("user_subscriptions")
        .select("*");

      // Get message counts per user
      const { data: conversations } = await supabase
        .from("conversations")
        .select("user_id");

      // Get voice usage
      const { data: voiceUsage } = await supabase
        .from("voice_session_usage")
        .select("user_id, total_seconds");

      // Get streaks
      const { data: streaks } = await supabase
        .from("user_streaks")
        .select("user_id, current_streak");

      // Combine data
      const enrichedUsers = profiles?.map(profile => {
        const subscription = subscriptions?.find(s => s.user_id === profile.user_id);
        const userConversations = conversations?.filter(c => c.user_id === profile.user_id) || [];
        const userVoice = voiceUsage?.filter(v => v.user_id === profile.user_id) || [];
        const userStreak = streaks?.find(s => s.user_id === profile.user_id);

        const totalVoiceSeconds = userVoice.reduce((sum, v) => sum + (v.total_seconds || 0), 0);

        return {
          ...profile,
          subscription: subscription ? {
            tier: subscription.tier,
            expires_at: subscription.expires_at,
          } : undefined,
          stats: {
            messages: userConversations.length * 10, // Estimate
            voiceMinutes: Math.round(totalVoiceSeconds / 60),
            streak: userStreak?.current_streak || 0,
          },
        };
      }) || [];

      setUsers(enrichedUsers);
    } catch (err) {
      console.error("Error loading users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const upgradeUser = async (userId: string) => {
    setUpgrading(userId);
    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error } = await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: userId,
          tier: "pro",
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error) throw error;

      toast.success("User upgraded to Pro!");
      loadUsers();
    } catch (err) {
      console.error("Error upgrading user:", err);
      toast.error("Failed to upgrade user");
    } finally {
      setUpgrading(null);
    }
  };

  const downgradeUser = async (userId: string) => {
    setUpgrading(userId);
    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("User downgraded to Free");
      loadUsers();
    } catch (err) {
      console.error("Error downgrading user:", err);
      toast.error("Failed to downgrade user");
    } finally {
      setUpgrading(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.user_id.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or user ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {user.display_name || "Anonymous"}
                      </p>
                      {user.subscription?.tier === "pro" && (
                        <Badge variant="default" className="text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {user.user_id.slice(0, 8)}...
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {user.stats?.messages || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mic className="w-3 h-3" />
                        {user.stats?.voiceMinutes || 0}m
                      </span>
                      <span>🔥 {user.stats?.streak || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user.subscription?.tier === "pro" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downgradeUser(user.user_id)}
                      disabled={upgrading === user.user_id}
                    >
                      {upgrading === user.user_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Downgrade"
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => upgradeUser(user.user_id)}
                      disabled={upgrading === user.user_id}
                    >
                      {upgrading === user.user_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Crown className="w-4 h-4 mr-1" />
                          Make Pro
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
