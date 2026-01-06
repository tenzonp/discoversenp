import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  User,
  Smile,
  Frown,
  Zap,
  BookOpen,
  Headphones,
  Hand,
  Scale,
  Save,
  Sparkles,
  RefreshCw,
  Target,
  Heart,
  Volume2
} from "lucide-react";
import { 
  AIPersonality, 
  LearningStyle, 
  Pace, 
  EncouragementLevel 
} from "@/hooks/usePersonalizedAI";
import { cn } from "@/lib/utils";

interface UserPreferences {
  learningStyle: LearningStyle;
  preferredPace: Pace;
  encouragementLevel: EncouragementLevel;
  aiPersonality: AIPersonality;
  studyGoals: string[];
  weakAreas: string[];
  strongAreas: string[];
}

interface PersonalizationSettingsProps {
  preferences: UserPreferences;
  onSave: (preferences: Partial<UserPreferences>) => Promise<void>;
  suggestions?: string[];
  className?: string;
}

const personalityOptions: { value: AIPersonality; label: string; emoji: string; desc: string }[] = [
  { value: "professional", label: "Professional", emoji: "👔", desc: "Formal & precise" },
  { value: "friendly", label: "Friendly", emoji: "😊", desc: "Warm & supportive" },
  { value: "strict", label: "Strict", emoji: "📏", desc: "Push for excellence" },
  { value: "playful", label: "Playful", emoji: "🎉", desc: "Fun & engaging" },
];

const learningStyleOptions: { value: LearningStyle; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "visual", label: "Visual", icon: BookOpen, desc: "I learn by seeing" },
  { value: "auditory", label: "Auditory", icon: Headphones, desc: "I learn by listening" },
  { value: "kinesthetic", label: "Hands-on", icon: Hand, desc: "I learn by doing" },
  { value: "balanced", label: "Balanced", icon: Scale, desc: "Mix of everything" },
];

const paceOptions: { value: Pace; label: string; desc: string }[] = [
  { value: "slow", label: "Slow & Steady", desc: "Take time to understand" },
  { value: "normal", label: "Normal", desc: "Balanced pace" },
  { value: "fast", label: "Fast", desc: "Quick learner" },
];

const goalOptions = [
  "IELTS Band 7+", "IELTS Band 8+", "Fluent Speaking", "Grammar Mastery",
  "Vocabulary Building", "Pronunciation", "Academic Writing", "Confidence"
];

export function PersonalizationSettings({
  preferences,
  onSave,
  suggestions = [],
  className,
}: PersonalizationSettingsProps) {
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updatePref = <K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(localPrefs);
    setSaving(false);
    setHasChanges(false);
  };

  const toggleGoal = (goal: string) => {
    const goals = localPrefs.studyGoals.includes(goal)
      ? localPrefs.studyGoals.filter(g => g !== goal)
      : [...localPrefs.studyGoals, goal];
    updatePref("studyGoals", goals);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Personalize Your AI
        </CardTitle>
        <CardDescription>
          Make the AI adapt to your unique learning style
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Suggestions
            </p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              {suggestions.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Personality */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            AI Personality
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {personalityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updatePref("aiPersonality", option.value)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  localPrefs.aiPersonality === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-lg">{option.emoji}</span>
                <p className="text-sm font-medium mt-1">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Learning Style */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Learning Style
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {learningStyleOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => updatePref("learningStyle", option.value)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    localPrefs.learningStyle === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium mt-1">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pace */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Learning Pace
          </Label>
          <div className="flex gap-2">
            {paceOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updatePref("preferredPace", option.value)}
                className={cn(
                  "flex-1 p-2 rounded-lg border text-center transition-all",
                  localPrefs.preferredPace === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <p className="text-sm font-medium">{option.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Encouragement Level */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Encouragement Level
          </Label>
          <div className="flex items-center gap-4">
            <Frown className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[
                localPrefs.encouragementLevel === "minimal" ? 0 :
                localPrefs.encouragementLevel === "moderate" ? 50 : 100
              ]}
              onValueChange={([v]) => {
                const level: EncouragementLevel = 
                  v < 33 ? "minimal" : v < 66 ? "moderate" : "high";
                updatePref("encouragementLevel", level);
              }}
              max={100}
              step={1}
              className="flex-1"
            />
            <Smile className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground text-center capitalize">
            {localPrefs.encouragementLevel} encouragement
          </p>
        </div>

        {/* Study Goals */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            Study Goals
          </Label>
          <div className="flex flex-wrap gap-2">
            {goalOptions.map((goal) => (
              <Badge
                key={goal}
                variant={localPrefs.studyGoals.includes(goal) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleGoal(goal)}
              >
                {goal}
              </Badge>
            ))}
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
