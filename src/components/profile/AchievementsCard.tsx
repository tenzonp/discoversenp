import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock } from "lucide-react";
import { Achievement } from "@/hooks/useAchievements";
import { cn } from "@/lib/utils";

interface AchievementsCardProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  progress: number;
}

export function AchievementsCard({ 
  achievements, 
  unlockedCount, 
  totalCount, 
  progress 
}: AchievementsCardProps) {
  // Sort: unlocked first, then by category
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    if (a.category === "special") return -1;
    if (b.category === "special") return 1;
    return 0;
  });

  return (
    <div className="p-4 rounded-xl bg-card border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          Achievements
        </h3>
        <Badge variant="outline" className="text-xs">
          {unlockedCount}/{totalCount}
        </Badge>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {sortedAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={cn(
              "relative p-2 rounded-lg text-center transition-all",
              achievement.unlocked
                ? "bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30"
                : "bg-muted/50 opacity-60"
            )}
            title={`${achievement.name}: ${achievement.description}`}
          >
            <div className="text-2xl mb-1">
              {achievement.unlocked ? (
                achievement.icon
              ) : (
                <Lock className="w-5 h-5 mx-auto text-muted-foreground" />
              )}
            </div>
            <p className="text-[9px] font-medium truncate">{achievement.name}</p>
            {!achievement.unlocked && (
              <div className="mt-1">
                <Progress 
                  value={(achievement.currentValue / achievement.requirement) * 100} 
                  className="h-1"
                />
                <p className="text-[8px] text-muted-foreground mt-0.5">
                  {achievement.currentValue}/{achievement.requirement}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center mt-3">
        Keep chatting to unlock more badges! 🏆
      </p>
    </div>
  );
}
