import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StudyBuddy {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  status: "pending" | "active" | "ended";
  matchReason: string;
  compatibilityScore: number;
  sharedGoals: string[];
}

interface PotentialMatch {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  compatibilityScore: number;
  matchReasons: string[];
  sharedGoals: string[];
  learningStyle: string;
}

interface UserPreferences {
  learning_style: string;
  study_goals: string[];
  weak_areas: string[];
  ai_personality: string;
}

export function useStudyBuddy(userId: string | undefined) {
  const [buddies, setBuddies] = useState<StudyBuddy[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load current buddies
  const loadBuddies = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    
    const { data } = await supabase
      .from("study_buddies")
      .select(`
        id,
        partner_id,
        status,
        match_reason,
        compatibility_score
      `)
      .or(`user_id.eq.${userId},partner_id.eq.${userId}`)
      .order("created_at", { ascending: false });
    
    if (data) {
      // Get partner profiles
      const partnerIds = data.map(b => 
        b.partner_id === userId ? b.partner_id : b.partner_id
      );
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", partnerIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const buddyList: StudyBuddy[] = data.map(b => {
        const partnerId = b.partner_id;
        const profile = profileMap.get(partnerId);
        return {
          id: b.id,
          partnerId,
          partnerName: profile?.display_name || "Study Buddy",
          partnerAvatar: profile?.avatar_url || undefined,
          status: b.status as "pending" | "active" | "ended",
          matchReason: b.match_reason || "",
          compatibilityScore: b.compatibility_score || 0,
          sharedGoals: [],
        };
      });
      
      setBuddies(buddyList);
    }
    setLoading(false);
  }, [userId]);

  // Find potential matches based on preferences
  const findMatches = useCallback(async () => {
    if (!userId) return;
    setIsSearching(true);
    
    // Get current user's preferences
    const { data: myPrefs } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (!myPrefs) {
      setIsSearching(false);
      return;
    }
    
    // Get all other users' preferences (simplified - in production, use server-side matching)
    const { data: otherPrefs } = await supabase
      .from("user_preferences")
      .select("*")
      .neq("user_id", userId)
      .limit(50);
    
    if (!otherPrefs) {
      setIsSearching(false);
      return;
    }
    
    // Get profiles for potential matches
    const otherUserIds = otherPrefs.map(p => p.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", otherUserIds);
    
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
    
    // Calculate compatibility scores
    const matches: PotentialMatch[] = otherPrefs.map(other => {
      let score = 0;
      const reasons: string[] = [];
      const sharedGoals: string[] = [];
      
      // Same learning style = good match
      if (myPrefs.learning_style === other.learning_style) {
        score += 20;
        reasons.push(`Both prefer ${myPrefs.learning_style} learning`);
      }
      
      // Complementary weak/strong areas
      const myWeakAreas = (myPrefs.weak_areas as string[]) || [];
      const otherStrongAreas = (other.strong_areas as string[]) || [];
      const complementary = myWeakAreas.filter(w => otherStrongAreas.includes(w));
      if (complementary.length > 0) {
        score += complementary.length * 15;
        reasons.push(`Can help with: ${complementary.join(", ")}`);
      }
      
      // Shared study goals
      const myGoals = (myPrefs.study_goals as string[]) || [];
      const otherGoals = (other.study_goals as string[]) || [];
      const shared = myGoals.filter(g => otherGoals.includes(g));
      if (shared.length > 0) {
        score += shared.length * 10;
        sharedGoals.push(...shared);
        reasons.push(`Shared goals: ${shared.join(", ")}`);
      }
      
      // Similar pace preference
      if (myPrefs.preferred_pace === other.preferred_pace) {
        score += 10;
      }
      
      // Activity level (more sessions = more engaged)
      if (other.total_sessions > 10) {
        score += 15;
        reasons.push("Active learner");
      }
      
      const profile = profileMap.get(other.user_id);
      
      return {
        userId: other.user_id,
        displayName: profile?.display_name || "Fellow Learner",
        avatarUrl: profile?.avatar_url || undefined,
        compatibilityScore: Math.min(100, score),
        matchReasons: reasons,
        sharedGoals,
        learningStyle: other.learning_style,
      };
    });
    
    // Sort by compatibility and filter out low matches
    const goodMatches = matches
      .filter(m => m.compatibilityScore >= 25)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 10);
    
    setPotentialMatches(goodMatches);
    setIsSearching(false);
  }, [userId]);

  // Send buddy request
  const sendBuddyRequest = useCallback(async (partnerId: string, matchReason: string) => {
    if (!userId) return false;
    
    try {
      await supabase.from("study_buddies").insert({
        user_id: userId,
        partner_id: partnerId,
        status: "pending",
        match_reason: matchReason,
        compatibility_score: potentialMatches.find(m => m.userId === partnerId)?.compatibilityScore || 50,
      });
      
      await loadBuddies();
      return true;
    } catch (e) {
      console.error("Failed to send buddy request:", e);
      return false;
    }
  }, [userId, potentialMatches, loadBuddies]);

  // Accept buddy request
  const acceptBuddyRequest = useCallback(async (buddyId: string) => {
    await supabase
      .from("study_buddies")
      .update({ status: "active" })
      .eq("id", buddyId);
    
    await loadBuddies();
  }, [loadBuddies]);

  // End buddy relationship
  const endBuddyRelationship = useCallback(async (buddyId: string) => {
    await supabase
      .from("study_buddies")
      .update({ status: "ended" })
      .eq("id", buddyId);
    
    await loadBuddies();
  }, [loadBuddies]);

  // Check for pending requests
  const getPendingRequests = useCallback(() => {
    return buddies.filter(b => b.status === "pending");
  }, [buddies]);

  // Get active buddies
  const getActiveBuddies = useCallback(() => {
    return buddies.filter(b => b.status === "active");
  }, [buddies]);

  useEffect(() => {
    if (userId) {
      loadBuddies();
    }
  }, [userId, loadBuddies]);

  return {
    buddies,
    potentialMatches,
    loading,
    isSearching,
    findMatches,
    sendBuddyRequest,
    acceptBuddyRequest,
    endBuddyRelationship,
    getPendingRequests,
    getActiveBuddies,
    loadBuddies,
  };
}
