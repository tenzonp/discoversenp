import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  Mic, 
  Image, 
  Users,
  Crown,
  TrendingUp,
  Calendar,
  Activity
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Analytics {
  totalMessages: number;
  totalVoiceMinutes: number;
  totalImages: number;
  totalUsers: number;
  proUsers: number;
  activeToday: number;
  weeklyChats: { date: string; count: number }[];
  weeklyVoice: { date: string; minutes: number }[];
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get total messages
      const { count: messagesCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true });

      // Get total voice minutes
      const { data: voiceData } = await supabase
        .from("voice_session_usage")
        .select("total_seconds");
      
      const totalVoiceSeconds = voiceData?.reduce((sum, r) => sum + (r.total_seconds || 0), 0) || 0;

      // Get total images generated
      const { count: imagesCount } = await supabase
        .from("image_generation_usage")
        .select("*", { count: "exact", head: true });

      // Get total users from profiles
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get pro users
      const { count: proCount } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("tier", "pro");

      // Get active users today
      const today = new Date().toISOString().split("T")[0];
      const { count: activeCount } = await supabase
        .from("user_streaks")
        .select("*", { count: "exact", head: true })
        .eq("last_activity_date", today);

      // Get weekly chat data
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: weeklyMessages } = await supabase
        .from("messages")
        .select("created_at")
        .gte("created_at", weekAgo.toISOString())
        .order("created_at");

      // Process weekly messages into daily counts
      const dailyCounts: Record<string, number> = {};
      weeklyMessages?.forEach(msg => {
        const date = new Date(msg.created_at).toLocaleDateString("en-US", { weekday: "short" });
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

      const weeklyChats = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));

      // Get weekly voice data
      const { data: weeklyVoiceData } = await supabase
        .from("voice_session_usage")
        .select("session_date, total_seconds")
        .gte("session_date", weekAgo.toISOString().split("T")[0]);

      const voiceCounts: Record<string, number> = {};
      weeklyVoiceData?.forEach(v => {
        const date = new Date(v.session_date).toLocaleDateString("en-US", { weekday: "short" });
        voiceCounts[date] = (voiceCounts[date] || 0) + Math.round((v.total_seconds || 0) / 60);
      });

      const weeklyVoice = Object.entries(voiceCounts).map(([date, minutes]) => ({ date, minutes }));

      setAnalytics({
        totalMessages: messagesCount || 0,
        totalVoiceMinutes: Math.round(totalVoiceSeconds / 60),
        totalImages: imagesCount || 0,
        totalUsers: usersCount || 0,
        proUsers: proCount || 0,
        activeToday: activeCount || 0,
        weeklyChats: weeklyChats.length > 0 ? weeklyChats : [{ date: "Today", count: 0 }],
        weeklyVoice: weeklyVoice.length > 0 ? weeklyVoice : [{ date: "Today", minutes: 0 }],
      });
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Messages
            </CardTitle>
            <MessageSquare className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time across Discoverse</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Voice Minutes
            </CardTitle>
            <Mic className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVoiceMinutes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total voice chat time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Images Generated
            </CardTitle>
            <Image className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalImages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">AI generated images</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pro Users
            </CardTitle>
            <Crown className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.proUsers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalUsers > 0 
                ? `${Math.round((analytics.proUsers / analytics.totalUsers) * 100)}% conversion`
                : "0% conversion"
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Today
            </CardTitle>
            <Activity className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeToday}</div>
            <p className="text-xs text-muted-foreground">Users active today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue (Est.)
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">रू {(analytics.proUsers * 299).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly at रू 299/user</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Messages/User
            </CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalUsers > 0 
                ? Math.round(analytics.totalMessages / analytics.totalUsers)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">Average engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Weekly Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics.weeklyChats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary)/0.2)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Weekly Voice Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.weeklyVoice}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="minutes" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
