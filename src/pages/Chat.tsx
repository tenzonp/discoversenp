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
import ExamClassSelector, { ExamClass, ExamStream, ExamGroup, ExamSubject } from "@/components/chat/ExamClassSelector";
import { FormulaSheet } from "@/components/chat/FormulaSheet";
import { StudyNotesPanel } from "@/components/chat/StudyNotesPanel";
import { FlashcardPanel } from "@/components/chat/FlashcardPanel";
import { DailyQuestionsPanel } from "@/components/chat/DailyQuestionsPanel";
import { cn } from "@/lib/utils";
import { GraduationCap, Calculator, BookOpen, Layers, Lightbulb } from "lucide-react";

const modeGreetings: Record<ChatMode, { title: string; subtitle: string }> = {
  friend: { title: "Hey", subtitle: "K cha bro?" },
  professional: { title: "Namaste", subtitle: "Kasari help garnu?" },
  exam: { title: "📚 Study Mode", subtitle: "Focus on your curriculum" },
  cultural: { title: "नमस्ते", subtitle: "Nepali ma kura garaum" },
};

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showMoodCheckin, setShowMoodCheckin] = useState(true);
  
  // Exam mode state
  const [examClass, setExamClass] = useState<ExamClass>(() => {
    const saved = localStorage.getItem("discoverse_exam_class");
    return (saved as ExamClass) || null;
  });
  const [examStream, setExamStream] = useState<ExamStream>(() => {
    const saved = localStorage.getItem("discoverse_exam_stream");
    return (saved as ExamStream) || null;
  });
  const [examGroup, setExamGroup] = useState<ExamGroup>(() => {
    const saved = localStorage.getItem("discoverse_exam_group");
    return (saved as ExamGroup) || null;
  });
  const [examSubject, setExamSubject] = useState<ExamSubject>(() => {
    const saved = localStorage.getItem("discoverse_exam_subject");
    return (saved as ExamSubject) || "all";
  });
  const [showExamSelector, setShowExamSelector] = useState(false);
  
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
      
      // For study/exam mode, just focus the input
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

  // Save exam preferences
  useEffect(() => {
    if (examClass) localStorage.setItem("discoverse_exam_class", examClass);
    if (examStream) localStorage.setItem("discoverse_exam_stream", examStream);
    if (examGroup) localStorage.setItem("discoverse_exam_group", examGroup);
    if (examSubject) localStorage.setItem("discoverse_exam_subject", examSubject);
  }, [examClass, examStream, examGroup, examSubject]);

  // Show exam selector when entering exam mode without class selected
  useEffect(() => {
    if (mode === "exam" && !examClass) {
      setShowExamSelector(true);
    }
  }, [mode, examClass]);

  // Build exam-focused search query with enhanced subject-specific keywords
  const buildExamSearchQuery = (content: string): string => {
    if (mode !== "exam" || !examClass) return content;
    
    const classNum = parseInt(examClass);
    const curriculum = classNum <= 10 ? "SEE Nepal Board" : `NEB +2 ${examStream || "science"} Nepal`;
    
    const subjectMap: Record<ExamSubject, string> = {
      all: "",
      math: "mathematics algebra geometry trigonometry calculus step by step solution with formula",
      physics: "physics numericals derivation formula diagram explanation",
      chemistry: "chemistry reaction mechanism equation balancing organic inorganic",
      biology: "biology diagram labeling explanation process",
      computer: "computer science programming algorithm flowchart",
      english: "english grammar essay letter writing comprehension",
      nepali: "nepali vyakaran nibandha",
      social: "social studies history geography civics economics",
      accountancy: "accountancy journal ledger trial balance financial statement",
      economics: "economics microeconomics macroeconomics theory diagram",
    };
    
    const subjectKeywords = subjectMap[examSubject] || "";
    
    return `Class ${examClass} ${curriculum} ${subjectKeywords} ${content} solution explanation step by step with working`;
  };

  const handleSend = async (content: string, imageUrl?: string, generateImagePrompt?: string, webSearchQuery?: string) => {
    if (messageLimitReached) return;
    await extractAndSaveInfo(content);
    
    const moodContext = buildMoodContext();
    const memoryContext = buildMemoryContext();
    let fullContext = memoryContext + moodContext;
    
    // In exam mode, always do web search with curriculum-focused query
    const isExamMode = mode === "exam" && examClass;
    const baseSearchQuery = webSearchQuery || content;
    const searchQueryToUse = isExamMode 
      ? buildExamSearchQuery(baseSearchQuery)
      : (webSearchQuery || (shouldAutoSearch(content) ? content : null));
    
    // Add exam context to AI
    if (isExamMode) {
      const subjectLabel = examSubject === "all" ? "all subjects" : examSubject;
      fullContext += `\n\n📚 EXAM STUDY MODE ACTIVE:
- Student Class: Class ${examClass}
- Focus Subject: ${subjectLabel}
- Curriculum: ${parseInt(examClass) <= 10 ? "SEE (Secondary Education Examination) Nepal" : "NEB +2 Higher Secondary Nepal"}

INSTRUCTIONS FOR EXAM MODE:
1. Provide step-by-step solutions for math problems
2. Explain concepts clearly for a Class ${examClass} student
3. Use examples relevant to Nepal curriculum
4. For math, show all working steps
5. Cite sources and provide accurate information
6. Be encouraging and supportive`;
    }
    
    if (searchQueryToUse) {
      const results = await search(searchQueryToUse);
      if (results && results.length > 0) {
        const searchContext = `\n\n🔍 WEB SEARCH RESULTS for "${isExamMode ? content : searchQueryToUse}":\n${results.slice(0, 5).map((r, i) => 
          `${i + 1}. [${r.title}](${r.url})\n   ${r.description || r.markdown?.slice(0, 200) || ''}`
        ).join('\n\n')}\n\n${isExamMode ? 'Use these search results to provide accurate, curriculum-specific answers. Show step-by-step solutions for math problems.' : 'Use these search results to answer the user\'s question. Cite sources when relevant.'}`;
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

      {/* Exam Class Selector Modal */}
      {showExamSelector && (
        <ExamClassSelector
          selectedClass={examClass}
          selectedStream={examStream}
          selectedGroup={examGroup}
          selectedSubject={examSubject}
          onClassChange={setExamClass}
          onStreamChange={setExamStream}
          onGroupChange={setExamGroup}
          onSubjectChange={setExamSubject}
          onClose={() => setShowExamSelector(false)}
        />
      )}

      {/* Exam Mode - Minimal Badge */}
      {mode === "exam" && examClass && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 max-w-2xl mx-auto">
            <button
              onClick={() => setShowExamSelector(true)}
              className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors text-sm"
            >
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary">
                {examClass} • {examSubject === "all" ? "All" : examSubject.charAt(0).toUpperCase() + examSubject.slice(1)}
              </span>
            </button>
            
            <div className="flex items-center gap-1">
              <DailyQuestionsPanel
                classLevel={`Class ${examClass}`}
                stream={examStream || undefined}
                subject={examSubject}
                trigger={
                  <button className="p-2 rounded-full hover:bg-muted transition-colors" title="Daily Questions">
                    <Lightbulb className="w-4 h-4 text-muted-foreground" />
                  </button>
                }
                onAskQuestion={(q) => handleSend(q)}
              />
              <FormulaSheet 
                classLevel={`Class ${examClass}`}
                trigger={
                  <button className="p-2 rounded-full hover:bg-muted transition-colors" title="Formulas">
                    <Calculator className="w-4 h-4 text-muted-foreground" />
                  </button>
                }
              />
              <FlashcardPanel
                userId={user?.id}
                category={examSubject !== 'all' ? examSubject : undefined}
                trigger={
                  <button className="p-2 rounded-full hover:bg-muted transition-colors" title="Flashcards">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                  </button>
                }
              />
              <StudyNotesPanel 
                userId={user?.id}
                trigger={
                  <button className="p-2 rounded-full hover:bg-muted transition-colors" title="Notes">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                  </button>
                }
                onInsertToChat={(content) => handleSend(content)}
              />
            </div>
          </div>
        </div>
      )}

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
              examClass={examClass}
              examStream={examStream}
              examSubject={examSubject}
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
                examClass={mode === "exam" ? examClass || undefined : undefined}
                examSubject={mode === "exam" && examSubject !== "all" ? examSubject : undefined}
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