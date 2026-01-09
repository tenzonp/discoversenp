import { useState, useEffect, useCallback } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MoodCheckinProps {
  userId: string;
  onComplete?: (mood: string, score: number) => void;
  onDismiss?: () => void;
}

const MOODS = [
  { emoji: "😊", label: "Khusi", score: 9 },
  { emoji: "😌", label: "Thik xa", score: 7 },
  { emoji: "😐", label: "Neutral", score: 5 },
  { emoji: "😔", label: "Sad", score: 3 },
  { emoji: "😰", label: "Stressed", score: 2 },
  { emoji: "😴", label: "Tired", score: 4 },
  { emoji: "🤩", label: "Excited", score: 10 },
  { emoji: "😤", label: "Frustrated", score: 3 },
];

const ENERGY_LEVELS = [
  { level: 1, label: "Very Low" },
  { level: 2, label: "Low" },
  { level: 3, label: "Medium" },
  { level: 4, label: "High" },
  { level: 5, label: "Very High" },
];

const MoodCheckin = ({ userId, onComplete, onDismiss }: MoodCheckinProps) => {
  const [step, setStep] = useState<"mood" | "energy" | "note">("mood");
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[0] | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(3);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const { toast } = useToast();

  // Check if already checked in today
  const checkTodayStatus = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    
    const { data } = await supabase
      .from("mood_checkins")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)
      .limit(1);
    
    setHasCheckedInToday((data?.length || 0) > 0);
  }, [userId]);

  useEffect(() => {
    checkTodayStatus();
  }, [checkTodayStatus]);

  const handleMoodSelect = (mood: typeof MOODS[0]) => {
    setSelectedMood(mood);
    setStep("energy");
  };

  const handleEnergySelect = (level: number) => {
    setSelectedEnergy(level);
    setStep("note");
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("mood_checkins")
        .insert({
          user_id: userId,
          mood: selectedMood.label,
          mood_score: selectedMood.score,
          energy_level: selectedEnergy,
          note: note.trim() || null,
        });
      
      if (error) throw error;
      
      toast({
        title: "Mood saved! ✨",
        description: `Aaja ${selectedMood.emoji} feel gardai xau. Noted!`,
      });
      
      onComplete?.(selectedMood.label, selectedMood.score);
    } catch (error) {
      console.error("Mood save error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Save garna sakiena 😔",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasCheckedInToday) return null;

  return (
    <div className="bg-gradient-to-br from-secondary/80 to-secondary/40 border border-border rounded-2xl p-4 mb-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/5 rounded-full blur-lg" />
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={onDismiss}
      >
        <X className="w-4 h-4" />
      </Button>

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Daily Mood Check-in</span>
        </div>

        {step === "mood" && (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">Aaja kasto feel gardai xau?</p>
            <div className="grid grid-cols-4 gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => handleMoodSelect(mood)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:bg-primary/10 hover:scale-105",
                    selectedMood?.label === mood.label && "bg-primary/20 ring-2 ring-primary"
                  )}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs text-muted-foreground">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "energy" && (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">Energy level kati xa?</p>
            <div className="flex gap-2">
              {ENERGY_LEVELS.map((e) => (
                <button
                  key={e.level}
                  onClick={() => handleEnergySelect(e.level)}
                  className={cn(
                    "flex-1 p-3 rounded-xl transition-all hover:bg-primary/10",
                    selectedEnergy === e.level && "bg-primary/20 ring-2 ring-primary"
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            i < e.level ? "bg-primary" : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{e.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep("mood")}>
              ← Back
            </Button>
          </div>
        )}

        {step === "note" && (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">Kei add garna xau? (Optional)</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind..."
              className="w-full p-3 rounded-xl bg-background/50 border border-border text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              rows={2}
            />
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("energy")}>
                ← Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                size="sm"
                className="flex-1"
              >
                {isSubmitting ? "Saving..." : "Save Mood ✨"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodCheckin;
