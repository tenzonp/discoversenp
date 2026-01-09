import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MemoryItem {
  key: string;
  value: string;
  updated_at: string;
}

interface ConversationSummary {
  id: string;
  title: string;
  mode: string;
  lastMessage: string;
  created_at: string;
}

export const useChatMemory = (userId: string | undefined) => {
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [recentConversations, setRecentConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load user memory and recent conversations
  const loadMemory = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    // Load memory items
    const { data: memoryData } = await supabase
      .from("user_memory")
      .select("key, value, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(20);
    
    if (memoryData) {
      setMemory(memoryData);
    }
    
    // Load recent conversations with last messages
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id, title, mode, created_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10);
    
    if (conversations) {
      // Get last message from each conversation
      const summaries: ConversationSummary[] = [];
      
      for (const conv of conversations.slice(0, 5)) {
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        summaries.push({
          ...conv,
          lastMessage: lastMsg?.content?.slice(0, 100) || "",
        });
      }
      
      setRecentConversations(summaries);
    }
    
    setIsLoading(false);
  }, [userId]);

  // Save memory item
  const saveMemory = useCallback(async (key: string, value: string) => {
    if (!userId) return;
    
    await supabase
      .from("user_memory")
      .upsert({
        user_id: userId,
        key,
        value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "user_id,key"
      });
    
    await loadMemory();
  }, [userId, loadMemory]);

  // Auto-extract important info from user messages
  const extractAndSaveInfo = useCallback(async (message: string) => {
    if (!userId) return;
    
    const lowerMsg = message.toLowerCase();
    
    // Patterns to extract user info
    const patterns = [
      { 
        regex: /(?:my name is|i am|i'm|call me|मेरो नाम|म)\s+([A-Za-z]+)/i, 
        key: "user_name" 
      },
      { 
        regex: /(?:studying|preparing for|पढ्दै|पढ्दै छु)\s+([\w\s]+?)(?:\s|$|\.)/i, 
        key: "studying" 
      },
      { 
        regex: /(?:i live in|from|बाट|म)\s+(kathmandu|pokhara|biratnagar|lalitpur|bhaktapur|dharan|butwal|hetauda)/i, 
        key: "location" 
      },
      { 
        regex: /(?:i work at|working at|job at|काम गर्छु)\s+([\w\s]+?)(?:\s|$|\.)/i, 
        key: "work" 
      },
      {
        regex: /(?:i like|i love|मलाई मन पर्छ)\s+([\w\s]+?)(?:\s|$|\.)/i,
        key: "likes"
      },
    ];
    
    for (const { regex, key } of patterns) {
      const match = message.match(regex);
      if (match && match[1] && match[1].length > 1 && match[1].length < 50) {
        await saveMemory(key, match[1].trim());
      }
    }
  }, [userId, saveMemory]);

  // Build context string for AI
  const buildMemoryContext = useCallback(() => {
    let context = "";
    
    if (memory.length > 0) {
      context += "\n🧠 USER MEMORY (Things Bhote remembers about this user):\n";
      memory.forEach(m => {
        context += `- ${m.key}: ${m.value}\n`;
      });
    }
    
    if (recentConversations.length > 0) {
      context += "\n📜 RECENT CONVERSATION TOPICS:\n";
      recentConversations.forEach(conv => {
        context += `- "${conv.title}": ${conv.lastMessage.slice(0, 50)}${conv.lastMessage.length > 50 ? "..." : ""}\n`;
      });
      context += "\nYou can reference these past conversations naturally if relevant.\n";
    }
    
    return context;
  }, [memory, recentConversations]);

  // Get specific memory value
  const getMemory = useCallback((key: string): string | undefined => {
    return memory.find(m => m.key === key)?.value;
  }, [memory]);

  useEffect(() => {
    if (userId) {
      loadMemory();
    }
  }, [userId, loadMemory]);

  return {
    memory,
    recentConversations,
    isLoading,
    loadMemory,
    saveMemory,
    extractAndSaveInfo,
    buildMemoryContext,
    getMemory,
  };
};
