import { useState, useEffect, useCallback, useRef } from "react";
import { useCelebration } from "./useCelebration";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "behavior" | "activity" | "milestone" | "special";
  requirement: number;
  currentValue: number;
  unlocked: boolean;
  unlockedAt?: string;
}

interface UserBehaviorStats {
  flirtLevel: number;
  energyLevel: number;
  expertiseLevel: number;
  conversationDepth: number;
  humorAppreciation: number;
  emotionalOpenness: number;
  totalMessages: number;
  totalChats: number;
  quizzesTaken: number;
  streakDays: number;
  voiceMinutes: number;
}

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, "currentValue" | "unlocked" | "unlockedAt">[] = [
  // Founding Member
  {
    id: "founding_member",
    name: "Founding Member of Discoverse",
    description: "Early adopter of Discoverse - Nepal ko afnai AI",
    icon: "🏆",
    category: "special",
    requirement: 1,
  },
  // Behavior-based
  {
    id: "social_butterfly",
    name: "Social Butterfly",
    description: "High flirt and emotional openness levels",
    icon: "🦋",
    category: "behavior",
    requirement: 60,
  },
  {
    id: "tech_expert",
    name: "Tech Expert",
    description: "Expertise level above 70%",
    icon: "💻",
    category: "behavior",
    requirement: 70,
  },
  {
    id: "energizer",
    name: "Energizer",
    description: "High energy level in conversations",
    icon: "⚡",
    category: "behavior",
    requirement: 75,
  },
  {
    id: "deep_thinker",
    name: "Deep Thinker",
    description: "High conversation depth",
    icon: "🧠",
    category: "behavior",
    requirement: 70,
  },
  {
    id: "comedy_king",
    name: "Comedy King",
    description: "High humor appreciation",
    icon: "😂",
    category: "behavior",
    requirement: 80,
  },
  {
    id: "emotional_guru",
    name: "Emotional Guru",
    description: "High emotional openness",
    icon: "💖",
    category: "behavior",
    requirement: 75,
  },
  // Activity-based
  {
    id: "chatty",
    name: "Chatty",
    description: "Sent 100+ messages",
    icon: "💬",
    category: "activity",
    requirement: 100,
  },
  {
    id: "conversation_master",
    name: "Conversation Master",
    description: "Started 10+ conversations",
    icon: "🗣️",
    category: "activity",
    requirement: 10,
  },
  {
    id: "quiz_warrior",
    name: "Quiz Warrior",
    description: "Completed 20+ quizzes",
    icon: "📝",
    category: "activity",
    requirement: 20,
  },
  {
    id: "voice_pro",
    name: "Voice Pro",
    description: "Used voice chat for 30+ minutes",
    icon: "🎤",
    category: "activity",
    requirement: 30,
  },
  // Milestone-based
  {
    id: "streak_starter",
    name: "Streak Starter",
    description: "3 day learning streak",
    icon: "🔥",
    category: "milestone",
    requirement: 3,
  },
  {
    id: "streak_champion",
    name: "Streak Champion",
    description: "7 day learning streak",
    icon: "🔥",
    category: "milestone",
    requirement: 7,
  },
  {
    id: "streak_legend",
    name: "Streak Legend",
    description: "30 day learning streak",
    icon: "👑",
    category: "milestone",
    requirement: 30,
  },
];

export function useAchievements(stats: UserBehaviorStats | null) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const previousUnlockedRef = useRef<Set<string>>(new Set());
  const { celebrateAchievement } = useCelebration();

  const calculateAchievements = useCallback(() => {
    if (!stats) return;

    const calculated: Achievement[] = ACHIEVEMENT_DEFINITIONS.map((def) => {
      let currentValue = 0;
      let unlocked = false;

      switch (def.id) {
        case "founding_member":
          currentValue = 1;
          unlocked = true; // Always unlocked for current users
          break;
        case "social_butterfly":
          currentValue = Math.round((stats.flirtLevel + stats.emotionalOpenness) / 2);
          unlocked = currentValue >= def.requirement;
          break;
        case "tech_expert":
          currentValue = stats.expertiseLevel;
          unlocked = currentValue >= def.requirement;
          break;
        case "energizer":
          currentValue = stats.energyLevel;
          unlocked = currentValue >= def.requirement;
          break;
        case "deep_thinker":
          currentValue = stats.conversationDepth;
          unlocked = currentValue >= def.requirement;
          break;
        case "comedy_king":
          currentValue = stats.humorAppreciation;
          unlocked = currentValue >= def.requirement;
          break;
        case "emotional_guru":
          currentValue = stats.emotionalOpenness;
          unlocked = currentValue >= def.requirement;
          break;
        case "chatty":
          currentValue = stats.totalMessages;
          unlocked = currentValue >= def.requirement;
          break;
        case "conversation_master":
          currentValue = stats.totalChats;
          unlocked = currentValue >= def.requirement;
          break;
        case "quiz_warrior":
          currentValue = stats.quizzesTaken;
          unlocked = currentValue >= def.requirement;
          break;
        case "voice_pro":
          currentValue = stats.voiceMinutes;
          unlocked = currentValue >= def.requirement;
          break;
        case "streak_starter":
        case "streak_champion":
        case "streak_legend":
          currentValue = stats.streakDays;
          unlocked = currentValue >= def.requirement;
          break;
      }

      return {
        ...def,
        currentValue,
        unlocked,
        unlockedAt: unlocked ? new Date().toISOString() : undefined,
      };
    });

    // Check for newly unlocked achievements
    calculated.forEach((achievement) => {
      if (achievement.unlocked && !previousUnlockedRef.current.has(achievement.id)) {
        // New achievement unlocked! Celebrate!
        if (previousUnlockedRef.current.size > 0) {
          // Only celebrate if not the initial load
          celebrateAchievement(achievement.name);
        }
        previousUnlockedRef.current.add(achievement.id);
      }
    });

    setAchievements(calculated);
  }, [stats, celebrateAchievement]);

  useEffect(() => {
    calculateAchievements();
  }, [calculateAchievements]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return {
    achievements,
    unlockedCount,
    totalCount,
    progress: Math.round((unlockedCount / totalCount) * 100),
  };
}