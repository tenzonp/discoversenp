import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MemoryItem {
  key: string;
  value: string;
}

export const useAIMemory = (userId: string | undefined) => {
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [recentContext, setRecentContext] = useState<string>("");

  // Load user's memory and recent context
  const loadMemory = useCallback(async () => {
    if (!userId) return;

    // Load memory items
    const { data: memoryData } = await supabase
      .from("user_memory")
      .select("key, value")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (memoryData) {
      setMemory(memoryData);
    }

    // Load recent conversations for context
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id, title, mode")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5);

    if (conversations && conversations.length > 0) {
      // Get recent messages from these conversations
      const { data: messages } = await supabase
        .from("messages")
        .select("content, role, created_at")
        .in("conversation_id", conversations.map(c => c.id))
        .order("created_at", { ascending: false })
        .limit(20);

      if (messages && messages.length > 0) {
        // Build context summary
        const contextSummary = messages
          .reverse()
          .map(m => `${m.role}: ${m.content.slice(0, 100)}${m.content.length > 100 ? '...' : ''}`)
          .join('\n');

        setRecentContext(contextSummary);
      }
    }
  }, [userId]);

  // Save memory item
  const saveMemory = useCallback(async (key: string, value: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from("user_memory")
      .upsert({
        user_id: userId,
        key,
        value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,key'
      });

    if (!error) {
      await loadMemory();
    }
  }, [userId, loadMemory]);

  // Delete memory item
  const deleteMemory = useCallback(async (key: string) => {
    if (!userId) return;

    await supabase
      .from("user_memory")
      .delete()
      .eq("user_id", userId)
      .eq("key", key);

    await loadMemory();
  }, [userId, loadMemory]);

  // Build context for AI
  const buildAIContext = useCallback(() => {
    let context = "";

    if (memory.length > 0) {
      context += "USER MEMORY (things I remember about this user):\n";
      memory.forEach(m => {
        context += `- ${m.key}: ${m.value}\n`;
      });
      context += "\n";
    }

    if (recentContext) {
      context += "RECENT CONVERSATION HISTORY (for context):\n";
      context += recentContext;
      context += "\n\n";
    }

    return context;
  }, [memory, recentContext]);

  // Auto-extract info from messages
  const extractAndSaveInfo = useCallback(async (userMessage: string) => {
    if (!userId) return;

    // Simple extraction patterns
    const patterns = [
      { regex: /(?:म|मेरो नाम|my name is|i am|i'm)\s+([^\s,\.]+)/i, key: "user_name" },
      { regex: /(?:class|कक्षा)\s+(\d+)/i, key: "class" },
      { regex: /(?:studying|पढ्दै|preparing for)\s+(\w+)/i, key: "studying" },
      { regex: /(?:from|बाट|को)\s+(dang|kathmandu|pokhara|biratnagar|lalitpur|bhaktapur)/i, key: "location" },
    ];

    for (const pattern of patterns) {
      const match = userMessage.match(pattern.regex);
      if (match && match[1]) {
        await saveMemory(pattern.key, match[1]);
      }
    }
  }, [userId, saveMemory]);

  useEffect(() => {
    if (userId) {
      loadMemory();
    }
  }, [userId, loadMemory]);

  return {
    memory,
    recentContext,
    buildAIContext,
    saveMemory,
    deleteMemory,
    extractAndSaveInfo,
    loadMemory
  };
};
