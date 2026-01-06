import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useChatHistory } from "@/hooks/useChatHistory";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import TypingIndicator from "@/components/chat/TypingIndicator";
import WelcomeScreen from "@/components/chat/WelcomeScreen";
import { ConversationList } from "@/components/chat/ConversationList";
import { AlertCircle } from "lucide-react";

const MAX_MESSAGES = 100;

const Chat = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  
  const {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    sendMessage,
    loadMessages,
    deleteConversation,
    clearChat,
  } = useChatHistory(user?.id, "friend");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLimitReached = messages.length >= MAX_MESSAGES;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = (content: string, imageUrl?: string) => {
    if (isLimitReached) return;
    sendMessage(content, imageUrl);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100dvh] bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <ChatHeader 
        onBack={() => navigate("/")} 
        onClear={clearChat}
        onShowHistory={() => setShowHistory(true)}
      />

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSend} />
        ) : (
          <div className="px-4 py-4 space-y-3 max-w-2xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <TypingIndicator />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {isLimitReached ? (
        <div className="p-4 border-t border-border bg-secondary/50">
          <div className="flex items-center gap-3 max-w-2xl mx-auto text-sm text-muted-foreground">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>This chat has reached 100 messages. Start a new chat to continue.</p>
          </div>
        </div>
      ) : (
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      )}

      {showHistory && (
        <ConversationList
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelect={loadMessages}
          onDelete={deleteConversation}
          onNewChat={clearChat}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

export default Chat;