import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  mode: string;
  created_at: string;
  updated_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/discoverse-chat`;

// Image generation detection patterns
const IMAGE_GENERATE_PATTERNS = [
  /(?:generate|create|make|draw|design|produce|craft|build)\s+(?:a|an|the|some|me)?\s*(?:image|picture|photo|graphic|art|illustration|poster|banner|logo|icon|avatar|thumbnail)/i,
  /(?:image|picture|photo|graphic|art|illustration|poster|banner|logo|icon)\s+(?:generate|create|make|draw|design|banau|bana)/i,
  /(?:banau|bana|banaideu|banaidinus)\s+(?:euta|ek|)?\s*(?:image|picture|photo|graphic|tasvir|chitra)/i,
  /(?:tasvir|chitra|photo)\s+(?:banau|bana|banaideu)/i,
  /(?:can you|please|pls)\s+(?:generate|create|make|draw)\s+(?:a|an)?\s*(?:image|picture|graphic)/i,
];

// Image edit/modify patterns
const IMAGE_EDIT_PATTERNS = [
  /(?:edit|modify|change|update|fix|improve|enhance|adjust|tweak|redo|remake|re-edit|reedit)\s+(?:the|this|that|my|last|previous|yo|tyo)?\s*(?:image|picture|photo|graphic)?/i,
  /(?:make|turn)\s+(?:it|the image|this)\s+(?:more|less|bigger|smaller|brighter|darker|colorful)/i,
  /(?:add|remove|put|delete)\s+(?:something|text|color|filter|effect|background|person|object)\s+(?:to|from|on|in)\s+(?:the|this|that)?\s*(?:image|picture)?/i,
  /(?:image|picture)\s+(?:lai|ma)\s+(?:edit|change|modify|update)/i,
  /(?:yo|tyo|last|aghi ko)\s+(?:image|picture)\s+(?:lai)?\s*(?:change|edit|modify|update)/i,
  /(?:regenerate|re-generate|redo|remake)\s+(?:the|this|that)?\s*(?:image|picture)?/i,
  /(?:different|another|new)\s+(?:version|style|look)\s+(?:of)?\s*(?:the|this)?\s*(?:image|picture)?/i,
  /(?:try|make)\s+(?:again|different|another)/i,
  /(?:feri|arko|naya)\s+(?:banau|bana|try)/i,
];

// Text extraction patterns for uploaded images
const TEXT_EXTRACT_PATTERNS = [
  /(?:extract|read|get|pull|copy)\s+(?:the|all)?\s*(?:text|words|content)\s+(?:from|in)\s+(?:this|the|that)?\s*(?:image|picture|photo)?/i,
  /(?:what|whats|what's)\s+(?:written|text|words|content)\s+(?:in|on)\s+(?:this|the|that)?\s*(?:image|picture)?/i,
  /(?:ocr|scan)\s+(?:this|the)?\s*(?:image|picture)?/i,
  /(?:yo|tyo)\s+(?:image|picture)\s+(?:ma|bata)\s+(?:text|lekheko)/i,
  /(?:text|lekheko)\s+(?:nikalau|nikala|padha|read)/i,
];

// Patterns for user uploading image + wanting edit
const UPLOADED_IMAGE_EDIT_PATTERNS = [
  /(?:edit|change|modify|update|fix|improve)\s+(?:this|the)?\s*(?:image|picture|photo)?/i,
  /(?:with|using)\s+(?:this|the)\s+(?:image|picture)/i,
  /(?:yo|tyo)\s+(?:image|photo)\s+(?:lai|ma)/i,
];

export interface UserBehaviorData {
  flirtLevel: number;
  energyLevel: number;
  expertiseLevel: number;
  conversationDepth: number;
  humorAppreciation: number;
  emotionalOpenness: number;
  currentFocus: string | null;
  interests: string[];
  moodTendency: string;
  communicationStyle: string;
}

export const useChatHistory = (
  userId: string | undefined, 
  mode: string = "friend", 
  messageLimit: number = 50,
  userBehavior?: UserBehaviorData | null
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [imageRemaining, setImageRemaining] = useState<number | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [messageLimitReached, setMessageLimitReached] = useState(false);
  const lastGeneratedImageRef = useRef<string | null>(null);
  const lastImagePromptRef = useRef<string | null>(null);
  const lastUploadedImageRef = useRef<string | null>(null);
  const { toast } = useToast();

  const EXTRACT_TEXT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-text`;

  // Analyze user behavior patterns (runs in background)
  const analyzeBehaviorPatterns = async (uid: string, message: string) => {
    try {
      // Check for behavior patterns in the message
      const updates: Record<string, any> = {};
      
      // Flirty patterns
      const flirtyPatterns = /😘|❤️|😍|love|baby|sweetheart|darling|miss you|cute|handsome|beautiful|maya|maaya|I love|mero maya/i;
      if (flirtyPatterns.test(message)) {
        updates.flirt_level = 2; // Increment
      }
      
      // High energy patterns  
      const energyPatterns = /!{2,}|excited|amazing|awesome|🎉|🔥|let's go|yeah|yeahhh|wow|superb/i;
      if (energyPatterns.test(message)) {
        updates.energy_level = 3;
      }
      
      // Technical expertise
      const techPatterns = /code|programming|algorithm|database|api|frontend|backend|react|python|javascript|debug|deploy|server|coding/i;
      if (techPatterns.test(message)) {
        updates.expertise_level = 2;
      }
      
      // Humor appreciation
      const humorPatterns = /😂|🤣|lol|lmao|haha|funny|joke|hasna|comedy/i;
      if (humorPatterns.test(message)) {
        updates.humor_appreciation = 2;
      }
      
      // Emotional openness
      const emotionalPatterns = /feel|feeling|sad|happy|anxious|worried|excited|love|hate|scared|stress|depression|tension/i;
      if (emotionalPatterns.test(message)) {
        updates.emotional_openness = 2;
      }

      // Update conversation depth based on message length
      if (message.length > 100) {
        updates.conversation_depth = 1;
      }

      // Only update if we have changes
      if (Object.keys(updates).length > 0) {
        // Get current values first
        const { data: current } = await supabase
          .from("user_preferences")
          .select("flirt_level, energy_level, expertise_level, humor_appreciation, emotional_openness, conversation_depth")
          .eq("user_id", uid)
          .single();

        const newValues: Record<string, number> = {};
        if (current) {
          if (updates.flirt_level) newValues.flirt_level = Math.min((current.flirt_level || 0) + updates.flirt_level, 100);
          if (updates.energy_level) newValues.energy_level = Math.min((current.energy_level || 50) + updates.energy_level, 100);
          if (updates.expertise_level) newValues.expertise_level = Math.min((current.expertise_level || 0) + updates.expertise_level, 100);
          if (updates.humor_appreciation) newValues.humor_appreciation = Math.min((current.humor_appreciation || 50) + updates.humor_appreciation, 100);
          if (updates.emotional_openness) newValues.emotional_openness = Math.min((current.emotional_openness || 50) + updates.emotional_openness, 100);
          if (updates.conversation_depth) newValues.conversation_depth = Math.min((current.conversation_depth || 50) + updates.conversation_depth, 100);
        }

        if (Object.keys(newValues).length > 0) {
          await supabase
            .from("user_preferences")
            .upsert({
              user_id: uid,
              ...newValues,
              updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });
        }
      }
    } catch (error) {
      console.error("Behavior analysis error:", error);
    }
  };

  // Load user's conversations
  const loadConversations = useCallback(async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("mode", mode)
      .order("updated_at", { ascending: false });
    
    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }
    
    setConversations(data || []);
  }, [userId, mode]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingHistory(true);
    
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("Error loading messages:", error);
      setLoadingHistory(false);
      return;
    }
    
    setMessages(
      (data || []).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: new Date(m.created_at),
      }))
    );
    setCurrentConversationId(conversationId);
    setLoadingHistory(false);
  }, []);

  // Create new conversation
  const createConversation = useCallback(async (title: string = "New Chat") => {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: userId, title, mode })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
    
    setCurrentConversationId(data.id);
    setMessages([]);
    await loadConversations();
    return data.id;
  }, [userId, mode, loadConversations]);

  // Save message to database
  const saveMessage = useCallback(async (conversationId: string, role: "user" | "assistant", content: string) => {
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, role, content });
    
    if (error) {
      console.error("Error saving message:", error);
    }
  }, []);

  // Update conversation title
  const updateConversationTitle = useCallback(async (conversationId: string, title: string) => {
    await supabase
      .from("conversations")
      .update({ title })
      .eq("id", conversationId);
    
    await loadConversations();
  }, [loadConversations]);

  // Check if message is asking for image generation
  const detectImageGeneration = useCallback((content: string): string | null => {
    const lowerContent = content.toLowerCase();
    
    // Check for direct generation patterns
    for (const pattern of IMAGE_GENERATE_PATTERNS) {
      if (pattern.test(content)) {
        // Extract the image description from the message
        return content;
      }
    }
    
    return null;
  }, []);

  // Check if message is asking for image editing
  const detectImageEdit = useCallback((content: string): { isEdit: boolean; basePrompt: string | null } => {
    for (const pattern of IMAGE_EDIT_PATTERNS) {
      if (pattern.test(content)) {
        return { 
          isEdit: true, 
          basePrompt: lastImagePromptRef.current 
        };
      }
    }
    return { isEdit: false, basePrompt: null };
  }, []);

  // Check if message is asking for text extraction from image
  const detectTextExtraction = useCallback((content: string): boolean => {
    for (const pattern of TEXT_EXTRACT_PATTERNS) {
      if (pattern.test(content)) {
        return true;
      }
    }
    return false;
  }, []);

  // Check if user uploaded image and wants to edit it
  const detectUploadedImageEdit = useCallback((content: string): boolean => {
    for (const pattern of UPLOADED_IMAGE_EDIT_PATTERNS) {
      if (pattern.test(content)) {
        return true;
      }
    }
    return false;
  }, []);

  // Handle text extraction from image
  const handleTextExtraction = useCallback(async (imageUrl: string, convId: string, content: string) => {
    setIsExtractingText(true);
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: `[Image: ${imageUrl}]\n\n${content}`,
      imageUrl,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    await saveMessage(convId, "user", `[Image: ${imageUrl}]\n\n${content}`);

    try {
      const response = await fetch(EXTRACT_TEXT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Text extraction failed");
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `📝 **Extracted Text:**\n\n${data.text}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      await saveMessage(convId, "assistant", assistantMessage.content);
    } catch (error) {
      console.error("Text extraction error:", error);
      toast({
        variant: "destructive",
        title: "Text Extract Error",
        description: error instanceof Error ? error.message : "Could not extract text",
      });
    } finally {
      setIsExtractingText(false);
    }
  }, [saveMessage, toast]);

  // Send message with streaming
  const sendMessage = useCallback(async (content: string, imageUrl?: string, generateImagePrompt?: string, userContext?: string) => {
    if ((!content.trim() && !imageUrl) || isLoading || isGeneratingImage || isExtractingText || !userId) return;

    let convId = currentConversationId;
    
    // Create conversation if none exists
    if (!convId) {
      convId = await createConversation(content.slice(0, 50) || "Image message");
      if (!convId) return;
    }

    // Check message limit based on tier
    if (messages.length >= messageLimit) {
      setMessageLimitReached(true);
      const limitMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: messageLimit <= 50 
          ? "📝 Yo chat ma 50 message pugyo! Pro ma upgrade gara 150 messages pauna, ya naya chat suru gara 🙏"
          : `📝 Yo chat ma ${messageLimit} message pugyo! Naya chat suru gara continue garna 🙏`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, limitMessage]);
      return;
    }

    // Check for text extraction request with uploaded image
    const isTextExtract = detectTextExtraction(content);
    if (isTextExtract && imageUrl) {
      await handleTextExtraction(imageUrl, convId, content);
      return;
    }

    // Store uploaded image for potential editing later
    if (imageUrl) {
      lastUploadedImageRef.current = imageUrl;
    }

    // Build message content with image if provided
    let messageContent = content.trim();
    if (imageUrl) {
      messageContent = imageUrl ? `[Image: ${imageUrl}]\n\n${messageContent}` : messageContent;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageContent,
      imageUrl,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    await saveMessage(convId, "user", messageContent);

    // Auto-detect image generation or use provided prompt
    let finalImagePrompt = generateImagePrompt;
    let imageToEdit: string | null = null;
    
    // Check for image edit request first - either from generated or uploaded image
    const editCheck = detectImageEdit(content);
    const uploadEditCheck = detectUploadedImageEdit(content);
    
    // Determine which image to edit
    if (editCheck.isEdit || uploadEditCheck) {
      // Prioritize: 1) user uploaded image with this message, 2) last generated, 3) last uploaded
      if (imageUrl) {
        imageToEdit = imageUrl;
        finalImagePrompt = content;
      } else if (lastGeneratedImageRef.current) {
        imageToEdit = lastGeneratedImageRef.current;
        finalImagePrompt = `${content}. Based on previous: ${editCheck.basePrompt || 'previous image'}`;
      } else if (lastUploadedImageRef.current) {
        imageToEdit = lastUploadedImageRef.current;
        finalImagePrompt = content;
      }
    }
    
    // Then check for new image generation
    if (!finalImagePrompt) {
      const detectedPrompt = detectImageGeneration(content);
      if (detectedPrompt) {
        finalImagePrompt = detectedPrompt;
      }
    }

    // If there's an image generation prompt, generate image and add as assistant message
    if (finalImagePrompt) {
      setIsGeneratingImage(true);
      try {
        // Get the user's actual session token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            variant: "destructive",
            title: "Login Required",
            description: "Image generate garna login gara 🙏",
          });
          setIsGeneratingImage(false);
          return;
        }

        const requestBody: { prompt: string; editImageUrl?: string } = { 
          prompt: finalImagePrompt 
        };
        
        // If editing, include the image to edit
        if (imageToEdit) {
          requestBody.editImageUrl = imageToEdit;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(requestBody),
          }
        );
        
        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 429) {
            toast({
              variant: "destructive",
              title: "Daily Limit Reached",
              description: data.message || "5 images per day limit reached. Try again tomorrow! 🌙",
            });
            setImageRemaining(0);
          } else {
            throw new Error(data.error || "Image generation failed");
          }
          setIsGeneratingImage(false);
          return;
        }
        
        if (data.imageUrl) {
          // Store for potential editing
          lastGeneratedImageRef.current = data.imageUrl;
          lastImagePromptRef.current = finalImagePrompt;
          setImageRemaining(data.remaining ?? null);
          
          const assistantImageMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Here's your image! 🎨 ${data.remaining !== undefined ? `(${data.remaining} left today)` : ''}`,
            imageUrl: data.imageUrl,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantImageMessage]);
          await saveMessage(convId, "assistant", `[Generated Image: ${data.imageUrl}]\n\nHere's your image! 🎨`);
          setIsGeneratingImage(false);
          return; // Don't continue with normal chat flow
        }
      } catch (error) {
        console.error("Image generation error:", error);
        toast({
          variant: "destructive",
          title: "Image Error",
          description: error instanceof Error ? error.message : "Image generate garna sakiena 😔",
        });
      }
      setIsGeneratingImage(false);
      return;
    }

    setIsLoading(true);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: assistantContent,
            timestamp: new Date(),
          },
        ];
      });
    };

    try {
      const messagesToSend = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: messagesToSend, 
          mode, 
          userContext,
          userBehavior: userBehavior ? {
            flirtLevel: userBehavior.flirtLevel,
            energyLevel: userBehavior.energyLevel,
            expertiseLevel: userBehavior.expertiseLevel,
            conversationDepth: userBehavior.conversationDepth,
            humorAppreciation: userBehavior.humorAppreciation,
            emotionalOpenness: userBehavior.emotionalOpenness,
            currentFocus: userBehavior.currentFocus,
            interests: userBehavior.interests,
            moodTendency: userBehavior.moodTendency,
            communicationStyle: userBehavior.communicationStyle,
          } : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Save assistant message
      if (assistantContent && convId) {
        await saveMessage(convId, "assistant", assistantContent);
        // Update conversation title if it's the first message
        if (messages.length === 0) {
          await updateConversationTitle(convId, content.slice(0, 50));
        }
        
        // Analyze user behavior patterns in background (don't await)
        analyzeBehaviorPatterns(userId, content).catch(console.error);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: error instanceof Error ? error.message : "Kei problem bhayo 😔",
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, isGeneratingImage, isExtractingText, userId, currentConversationId, createConversation, saveMessage, updateConversationTitle, mode, toast, messageLimit, userBehavior, detectImageGeneration, detectImageEdit, detectTextExtraction, detectUploadedImageEdit, handleTextExtraction]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    await supabase.from("conversations").delete().eq("id", conversationId);
    
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setMessages([]);
    }
    
    await loadConversations();
  }, [currentConversationId, loadConversations]);

  // Clear current chat
  const clearChat = useCallback(() => {
    setCurrentConversationId(null);
    setMessages([]);
    setMessageLimitReached(false);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId, loadConversations]);

  return {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    isGeneratingImage,
    isExtractingText,
    imageRemaining,
    loadingHistory,
    messageLimitReached,
    sendMessage,
    loadMessages,
    createConversation,
    deleteConversation,
    clearChat,
    loadConversations,
    lastGeneratedImage: lastGeneratedImageRef.current,
  };
};
