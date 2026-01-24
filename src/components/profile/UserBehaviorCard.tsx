import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Heart, 
  Zap, 
  Brain, 
  Smile, 
  MessageSquare,
  Target,
  Sparkles,
  Save,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface UserBehavior {
  flirt_level: number;
  energy_level: number;
  expertise_level: number;
  mood_tendency: string;
  communication_style: string;
  current_focus: string | null;
  interests: string[];
  conversation_depth: number;
  humor_appreciation: number;
  emotional_openness: number;
}

interface UserBehaviorCardProps {
  userId: string;
  isPro: boolean;
  onUpdate?: () => void;
}

const FOCUS_OPTIONS = [
  "Coding", "Graphics Design", "UI/UX Design", "Video Editing",
  "Content Writing", "Marketing", "Business", "Photography",
  "Music Production", "3D Modeling", "Data Science", "Mobile Development",
  "Game Development", "Studying", "Learning Languages", "Other"
];

const INTEREST_OPTIONS = [
  "Technology", "Art", "Music", "Sports", "Gaming", "Travel",
  "Food", "Fashion", "Movies", "Books", "Science", "Philosophy"
];

export function UserBehaviorCard({ userId, isPro, onUpdate }: UserBehaviorCardProps) {
  const [behavior, setBehavior] = useState<UserBehavior>({
    flirt_level: 0,
    energy_level: 50,
    expertise_level: 0,
    mood_tendency: "neutral",
    communication_style: "balanced",
    current_focus: null,
    interests: [],
    conversation_depth: 50,
    humor_appreciation: 50,
    emotional_openness: 50,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showFocusSelector, setShowFocusSelector] = useState(false);

  useEffect(() => {
    loadBehavior();
  }, [userId]);

  const loadBehavior = async () => {
    const { data } = await supabase
      .from("user_preferences")
      .select("flirt_level, energy_level, expertise_level, mood_tendency, communication_style, current_focus, interests, conversation_depth, humor_appreciation, emotional_openness")
      .eq("user_id", userId)
      .single();

    if (data) {
      setBehavior({
        flirt_level: data.flirt_level ?? 0,
        energy_level: data.energy_level ?? 50,
        expertise_level: data.expertise_level ?? 0,
        mood_tendency: data.mood_tendency ?? "neutral",
        communication_style: data.communication_style ?? "balanced",
        current_focus: data.current_focus,
        interests: (data.interests as string[]) ?? [],
        conversation_depth: data.conversation_depth ?? 50,
        humor_appreciation: data.humor_appreciation ?? 50,
        emotional_openness: data.emotional_openness ?? 50,
      });
    }
    setLoading(false);
  };

  const saveBehavior = async () => {
    setSaving(true);
    
    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: userId,
        ...behavior,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (!error) {
      onUpdate?.();
    }
    setSaving(false);
  };

  const toggleInterest = (interest: string) => {
    setBehavior(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const getLevelLabel = (value: number) => {
    if (value < 25) return "Low";
    if (value < 50) return "Moderate";
    if (value < 75) return "High";
    return "Very High";
  };

  const getLevelColor = (value: number) => {
    if (value < 25) return "text-blue-500";
    if (value < 50) return "text-green-500";
    if (value < 75) return "text-amber-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border/50 animate-pulse">
        <div className="h-20 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-card border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          Your Personality Profile
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-rose-500/10">
          <Heart className="w-4 h-4 mx-auto mb-1 text-rose-500" />
          <p className="text-lg font-bold">{behavior.flirt_level}%</p>
          <p className="text-[10px] text-muted-foreground">Flirt Level</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-amber-500/10">
          <Zap className="w-4 h-4 mx-auto mb-1 text-amber-500" />
          <p className="text-lg font-bold">{behavior.energy_level}%</p>
          <p className="text-[10px] text-muted-foreground">Energy</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-primary/10">
          <Brain className="w-4 h-4 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold">{behavior.expertise_level}%</p>
          <p className="text-[10px] text-muted-foreground">Expertise</p>
        </div>
      </div>

      {/* Current Focus (Pro Only) */}
      {isPro && (
        <div className="mb-4">
          <label className="text-xs font-medium flex items-center gap-1 mb-2">
            <Target className="w-3 h-3 text-primary" />
            Current Focus
          </label>
          {showFocusSelector ? (
            <div className="flex flex-wrap gap-1.5">
              {FOCUS_OPTIONS.map((focus) => (
                <Badge
                  key={focus}
                  variant={behavior.current_focus === focus ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => {
                    setBehavior(prev => ({ ...prev, current_focus: focus }));
                    setShowFocusSelector(false);
                  }}
                >
                  {focus}
                </Badge>
              ))}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setShowFocusSelector(true)}
            >
              {behavior.current_focus || "Select what you're working on..."}
            </Button>
          )}
        </div>
      )}

      {expanded && (
        <div className="space-y-4 pt-4 border-t border-border/50">
          {/* Detailed Stats */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Conversation Depth
                </span>
                <span className={getLevelColor(behavior.conversation_depth)}>
                  {getLevelLabel(behavior.conversation_depth)}
                </span>
              </div>
              <Progress value={behavior.conversation_depth} className="h-1.5" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1">
                  <Smile className="w-3 h-3" />
                  Humor Appreciation
                </span>
                <span className={getLevelColor(behavior.humor_appreciation)}>
                  {getLevelLabel(behavior.humor_appreciation)}
                </span>
              </div>
              <Progress value={behavior.humor_appreciation} className="h-1.5" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  Emotional Openness
                </span>
                <span className={getLevelColor(behavior.emotional_openness)}>
                  {getLevelLabel(behavior.emotional_openness)}
                </span>
              </div>
              <Progress value={behavior.emotional_openness} className="h-1.5" />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="text-xs font-medium flex items-center gap-1 mb-2">
              <Sparkles className="w-3 h-3 text-primary" />
              Interests
            </label>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_OPTIONS.map((interest) => (
                <Badge
                  key={interest}
                  variant={behavior.interests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={saveBehavior}
            disabled={saving}
            className="w-full"
            size="sm"
          >
            {saving ? "Saving..." : (
              <>
                <Save className="w-3 h-3 mr-1" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      )}

      {!isPro && !expanded && (
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          <Sparkles className="w-3 h-3 inline mr-1 text-primary" />
          Upgrade to Pro for Current Focus tracking
        </p>
      )}
    </div>
  );
}
