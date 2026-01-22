import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useMoodHistory } from "@/hooks/useMoodHistory";
import { useChatMemory } from "@/hooks/useChatMemory";
import { useWebSearch } from "@/hooks/useWebSearch";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import TypingIndicator from "@/components/chat/TypingIndicator";
import WelcomeScreen from "@/components/chat/WelcomeScreen";
import { ConversationList } from "@/components/chat/ConversationList";
import ModeSelector, { ChatMode } from "@/components/chat/ModeSelector";
import MoodCheckin from "@/components/chat/MoodCheckin";
import VoiceChatModal from "@/components/chat/VoiceChatModal";
import WebSearchResults from "@/components/chat/WebSearchResults";
import { AlertCircle, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_MESSAGES = 100;

const modeGreetings: Record<ChatMode, { title: string; subtitle: string }> = {
  friend: { title: "Hey there! 👋", subtitle: "La bro, k cha halkhabar? Kura gar na!" },
};

const Chat = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [showMoodCheckin, setShowMoodCheckin] = useState(true);
  const [mode, setMode] = useState<ChatMode>("friend");
  
  const {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    sendMessage,
    loadMessages,
    deleteConversation,
    clearChat,
  } = useChatHistory(user?.id, mode);

  const { buildMoodContext, loadMoodHistory } = useMoodHistory(user?.id);
  const { buildMemoryContext, extractAndSaveInfo } = useChatMemory(user?.id);
  const { 
    isSearching, 
    results: searchResults, 
    query: searchQuery, 
    search, 
    clearResults,
    shouldAutoSearch,
  } = useWebSearch();

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

  const handleModeChange = (newMode: ChatMode) => {
    if (newMode !== mode) {
      setMode(newMode);
      clearChat();
    }
  };

  const handleSend = async (content: string, imageUrl?: string, generateImagePrompt?: string, webSearchQuery?: string) => {
    if (isLimitReached) return;
    // Extract and save important info from user message
    await extractAndSaveInfo(content);
    
    // Build context
    const moodContext = buildMoodContext();
    const memoryContext = buildMemoryContext();
    let fullContext = memoryContext + moodContext;
    
    // Determine if we need web search:
    // 1. Explicit search query passed from ChatInput
    // 2. Auto-detect based on message content
    const searchQueryToUse = webSearchQuery || (shouldAutoSearch(content) ? content : null);
    
    // If web search is needed, perform search and add results to context
    if (searchQueryToUse) {
      const results = await search(searchQueryToUse);
      if (results && results.length > 0) {
        const searchContext = `\n\n🔍 WEB SEARCH RESULTS for "${searchQueryToUse}":\n${results.slice(0, 5).map((r, i) => 
          `${i + 1}. [${r.title}](${r.url})\n   ${r.description || r.markdown?.slice(0, 200) || ''}`
        ).join('\n\n')}\n\nUse these search results to answer the user's question. Cite sources when relevant.`;
        fullContext += searchContext;
      }
    }
    
    sendMessage(content, imageUrl, generateImagePrompt, fullContext);
  };

  const handleMoodComplete = () => {
    setShowMoodCheckin(false);
    loadMoodHistory();
  };

  const handleVoiceTranscript = (text: string, role: "user" | "assistant") => {
    if (role === "user" && text.trim()) {
      handleSend(text);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100dvh] bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
      </div>
    );
  }

  const greeting = modeGreetings[mode];

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <ChatHeader 
        onBack={() => navigate("/")} 
        onClear={clearChat}
        onShowHistory={() => setShowHistory(true)}
      />

      {/* Voice Chat Button */}
      <Button
        onClick={() => setShowVoiceChat(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full shadow-lg bg-gradient-to-br from-primary to-primary/80"
        size="icon"
      >
        <Mic className="w-6 h-6" />
      </Button>

      {/* Mode Selector */}
      <div className="px-4 py-3 border-b border-border bg-background/50">
        <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Web Search Results Panel */}
        {(isSearching || searchResults.length > 0) && (
          <div className="px-4 py-3 max-w-2xl mx-auto">
            <WebSearchResults 
              results={searchResults}
              query={searchQuery}
              isSearching={isSearching}
              onClose={clearResults}
              onSelectResult={(result) => {
                handleSend(`Tell me more about: ${result.title} - ${result.url}`);
                clearResults();
              }}
            />
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            {/* Mood Check-in */}
            {user && showMoodCheckin && (
              <div className="w-full max-w-md mb-6">
                <MoodCheckin 
                  userId={user.id} 
                  onComplete={handleMoodComplete}
                  onDismiss={() => setShowMoodCheckin(false)}
                />
              </div>
            )}
            
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-6 shadow-lg">
              <span className="text-2xl text-primary-foreground font-bold">भ</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
              {greeting.title}
            </h2>
            <p className="text-muted-foreground text-center mb-8 max-w-xs">
              {greeting.subtitle}
            </p>
            <WelcomeScreen onSuggestionClick={(s) => handleSend(s)} />
          </div>
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

      {/* Voice Chat Modal */}
      <VoiceChatModal
        isOpen={showVoiceChat}
        onClose={() => setShowVoiceChat(false)}
        onTranscriptAdd={handleVoiceTranscript}
      />
    </div>
  );
};

export default Chat;