import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MessageCircle, Calendar, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import DiscoverseText from "@/components/DiscoverseText";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SharedMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

interface ConversationInfo {
  id: string;
  title: string | null;
  mode: string | null;
  created_at: string;
}

const SharedChat = () => {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("id");
  
  const [messages, setMessages] = useState<SharedMessage[]>([]);
  const [conversation, setConversation] = useState<ConversationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId) {
      loadSharedChat();
    } else {
      setError("No conversation ID provided");
      setLoading(false);
    }
  }, [conversationId]);

  const loadSharedChat = async () => {
    try {
      // Load conversation info
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select("id, title, mode, created_at")
        .eq("id", conversationId)
        .single();

      if (convError || !convData) {
        setError("Conversation not found or is private");
        setLoading(false);
        return;
      }

      setConversation(convData);

      // Load messages
      const { data: msgData, error: msgError } = await supabase
        .from("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (msgError) {
        setError("Could not load messages");
        setLoading(false);
        return;
      }

      setMessages(msgData || []);
      setLoading(false);
    } catch (err) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  // Extract image URL from content
  const extractImage = (content: string) => {
    const match = content.match(/\[(?:Generated )?Image: (https?:\/\/[^\]]+)\]/);
    return match?.[1] || null;
  };

  // Clean text content
  const cleanContent = (content: string) => {
    return content
      .replace(/\[(?:Generated )?Image: https?:\/\/[^\]]+\]\n*/g, "")
      .replace(/^Generated: ?"[^"]*"\s*/i, "")
      .trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-medium text-foreground mb-2">
          {error}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          This conversation may be private or deleted
        </p>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go to Discoverse
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <DiscoverseText size="sm" showVersion />
          </Link>
          <Link to="/chat">
            <Button size="sm" className="gap-2 rounded-full">
              <MessageCircle className="w-4 h-4" />
              Start chatting
            </Button>
          </Link>
        </div>
      </header>

      {/* Conversation Info */}
      <div className="max-w-2xl mx-auto px-5 py-6 border-b border-border/30">
        <h1 className="text-lg font-medium text-foreground mb-1">
          {conversation?.title || "Shared Conversation"}
        </h1>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {conversation?.mode && (
            <span className="px-2 py-0.5 rounded-full bg-secondary capitalize">
              {conversation.mode}
            </span>
          )}
          {conversation?.created_at && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(conversation.created_at), "MMM d, yyyy")}
            </span>
          )}
          <span>{messages.length} messages</span>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
        {messages.map((message) => {
          const isUser = message.role === "user";
          const imageUrl = extractImage(message.content);
          const textContent = cleanContent(message.content);

          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                )}
              >
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Generated"
                    className="max-w-full rounded-xl mb-2 max-h-64 object-contain"
                    loading="lazy"
                  />
                )}
                {textContent && (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {textContent}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="bg-card rounded-2xl p-6 text-center border border-border/50">
          <DiscoverseText size="md" className="justify-center mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Nepal's Own AI Companion • Start your own conversation
          </p>
          <Link to="/chat">
            <Button className="gap-2 rounded-full">
              <MessageCircle className="w-4 h-4" />
              Try Discoverse Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedChat;
