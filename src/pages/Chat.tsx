import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useMoodHistory } from "@/hooks/useMoodHistory";
import { useChatMemory } from "@/hooks/useChatMemory";
import { useWebSearch } from "@/hooks/useWebSearch";
import { useSubscription } from "@/hooks/useSubscription";
import { useUserBehavior } from "@/hooks/useUserBehavior";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ImageGeneratingIndicator from "@/components/chat/ImageGeneratingIndicator";
import WelcomeScreen from "@/components/chat/WelcomeScreen";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatMode } from "@/components/chat/ModeSelector";
import MoodCheckin from "@/components/chat/MoodCheckin";
import WebSearchResults from "@/components/chat/WebSearchResults";
import ImageGallery from "@/components/ImageGallery";
import HangingModeSelector from "@/components/chat/HangingModeSelector";
import RecentImagesBar from "@/components/chat/RecentImagesBar";
import { cn } from "@/lib/utils";

const modeGreetings: Record<ChatMode, { title: string; subtitle: string }> = {
  friend: { title: "Hey", subtitle: "K cha bro?" },
  professional: { title: "Welcome", subtitle: "How may I assist you?" },
  jugaad: { title: "🔄 Jugaad", subtitle: "K solve garnu cha?" },
  roast: { title: "🔥 Roast Mode", subtitle: "Tell me about your group" },
};

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showMoodCheckin, setShowMoodCheckin] = useState(true);
  
  // Get mode from navigation state or default to friend
  const initialMode = (location.state as { mode?: ChatMode } | null)?.mode || "friend";
  const [mode, setMode] = useState<ChatMode>(initialMode);
  
  const [hasProcessedInitialState, setHasProcessedInitialState] = useState(false);
  
  // Get subscription tier for message limits
  const { messageLimit, subscription } = useSubscription(user?.id);
  
  // Get user behavior for AI personality adaptation
  const { behavior } = useUserBehavior(user?.id);
  
  const {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    isGeneratingImage,
    isExtractingText,
    imageRemaining,
    messageLimitReached,
    sendMessage,
    loadMessages,
    deleteConversation,
    clearChat,
  } = useChatHistory(user?.id, mode, messageLimit, {
    flirtLevel: behavior.flirtLevel,
    energyLevel: behavior.energyLevel,
    expertiseLevel: behavior.expertiseLevel,
    conversationDepth: behavior.conversationDepth,
    humorAppreciation: behavior.humorAppreciation,
    emotionalOpenness: behavior.emotionalOpenness,
    currentFocus: behavior.currentFocus,
    interests: behavior.interests,
    moodTendency: behavior.moodTendency,
    communicationStyle: behavior.communicationStyle,
  });

  const { buildMoodContext, loadMoodHistory } = useMoodHistory(user?.id);
  const { buildMemoryContext, extractAndSaveInfo } = useChatMemory(user?.id);
  const { 
    isSearching, 
    results: searchResults, 
    query: searchQuery, 
    activeTimeFilter,
    search, 
    clearResults,
    shouldAutoSearch,
  } = useWebSearch();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<{ focus: () => void; setValue: (value: string) => void } | null>(null);

  // Handle initial state from home page vibes
  useEffect(() => {
    if (hasProcessedInitialState) return;
    
    const state = location.state as { initialMessage?: string; mode?: ChatMode; focusInput?: boolean } | null;
    
    if (state && user && !loading) {
      setHasProcessedInitialState(true);
      
      // For life mode, just focus the input
      if (state.focusInput) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
      // For other vibes with initialMessage, auto-send
      else if (state.initialMessage) {
        handleSend(state.initialMessage);
      }
      
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user, loading, hasProcessedInitialState]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (content: string, imageUrl?: string, generateImagePrompt?: string, webSearchQuery?: string) => {
    if (messageLimitReached) return;
    await extractAndSaveInfo(content);
    
    const moodContext = buildMoodContext();
    const memoryContext = buildMemoryContext();
    let fullContext = memoryContext + moodContext;
    
    // Check if we should auto-search
    const searchQueryToUse = webSearchQuery || (shouldAutoSearch(content) ? content : null);
    
    // Add jugaad mode context
    if (mode === "jugaad") {
      fullContext += `\n\n🔄 JUGAAD MODE ACTIVE - Be Nepal's street-smart AI. Give specific answers about government processes, salaries, prices, form filling. No vague advice - give REAL numbers, locations, steps.`;
    }
    
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100dvh] bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  const greeting = modeGreetings[mode];

  return (
    <div className={cn("flex flex-col h-[100dvh] bg-background relative", `vibe-${mode}`)}>
      <ChatHeader 
        onBack={() => navigate("/")} 
        onClear={clearChat}
        onShowHistory={() => setShowHistory(true)}
        onShowGallery={() => setShowGallery(true)}
        conversationId={currentConversationId}
      />
      
      {/* Hanging Mode Selector - positioned below header */}
      <HangingModeSelector currentMode={mode} onModeChange={setMode} />

      <div className="flex-1 overflow-y-auto scrollbar-subtle">
        {/* Web Search Results */}
        {(isSearching || searchResults.length > 0) && (
          <div className="px-5 py-3 max-w-2xl mx-auto">
            <WebSearchResults 
              results={searchResults}
              query={searchQuery}
              isSearching={isSearching}
              activeTimeFilter={activeTimeFilter}
              onClose={clearResults}
              onSelectResult={(result) => {
                handleSend(`Tell me more about: ${result.title} - ${result.url}`);
                clearResults();
              }}
            />
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            {/* Mood Check-in */}
            {user && showMoodCheckin && (
              <div className="w-full max-w-md mb-10 animate-appear">
                <MoodCheckin 
                  userId={user.id} 
                  onComplete={handleMoodComplete}
                  onDismiss={() => setShowMoodCheckin(false)}
                />
              </div>
            )}
            
            {/* Welcome - Minimal, intimate */}
            <div className="text-center mb-10 animate-appear delay-100">
              <h2 className="text-xl font-medium text-foreground mb-1">
                {greeting.title}
              </h2>
              <p className="text-muted-foreground/70 text-sm">
                {greeting.subtitle}
              </p>
            </div>
            <WelcomeScreen 
              onSuggestionClick={(s) => handleSend(s)} 
              mode={mode}
            />
          </div>
        ) : (
          <div className="px-5 py-6 space-y-6 max-w-2xl mx-auto">
            {messages.map((message, index) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                isLatest={index === messages.length - 1}
                userId={user?.id}
              />
            ))}
            {isGeneratingImage && (
              <ImageGeneratingIndicator remaining={imageRemaining} />
            )}
            {isExtractingText && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span>Reading text from image...</span>
              </div>
            )}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <TypingIndicator />
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {messageLimitReached ? (
        <div className="px-5 py-4 bg-background space-y-2">
          {subscription.tier === "free" && (
            <button 
              onClick={() => navigate("/profile")}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-medium transition-all hover:opacity-90"
            >
              ⭐ Pro ma Upgrade - 150 Messages
            </button>
          )}
          <button 
            onClick={clearChat}
            className="w-full py-3 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-all"
          >
            ✨ Naya Chat Suru Gara
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Recent Images Bar */}
          {user && messages.length > 0 && (
            <div className="px-5 flex justify-center">
              <RecentImagesBar 
                userId={user.id} 
                onSelectImage={(imageUrl, prompt) => {
                  handleSend(`Edit this image: ${prompt || 'make it better'}`, imageUrl);
                }}
              />
            </div>
          )}
          <ChatInput onSend={handleSend} isLoading={isLoading || isGeneratingImage || isExtractingText} currentMode={mode} onModeChange={setMode} />
        </div>
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

      {user && (
        <ImageGallery
          userId={user.id}
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
};

export default Chat;
