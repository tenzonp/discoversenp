import { Trophy, Flame, Zap, Medal, Crown, Award } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function Leaderboard() {
  const { leaderboard, loading } = useLeaderboard();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No leaderboard data yet</p>
        <p className="text-xs">Be the first to earn XP!</p>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getDisplayName = (entry: typeof leaderboard[0], index: number) => {
    if (entry.display_name) return entry.display_name;
    return `Player ${index + 1}`;
  };

  return (
    <div className="space-y-2">
      {leaderboard.slice(0, 10).map((entry, index) => {
        const isCurrentUser = user?.id === entry.user_id;
        const rank = index + 1;

        return (
          <div
            key={entry.user_id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all",
              isCurrentUser 
                ? "bg-primary/10 border border-primary/20" 
                : "bg-card border border-border/50",
              rank <= 3 && "bg-gradient-to-r from-card to-transparent"
            )}
          >
            {/* Rank */}
            <div className="w-8 flex justify-center">
              {getRankIcon(rank)}
            </div>

            {/* Avatar */}
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
              rank === 1 ? "bg-yellow-500/20 text-yellow-600" :
              rank === 2 ? "bg-gray-400/20 text-gray-500" :
              rank === 3 ? "bg-amber-600/20 text-amber-600" :
              "bg-muted text-muted-foreground"
            )}>
              {getDisplayName(entry, index).charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-medium text-sm truncate",
                isCurrentUser && "text-primary"
              )}>
                {getDisplayName(entry, index)}
                {isCurrentUser && " (You)"}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-primary" />
                  Lv.{entry.level}
                </span>
                {entry.current_streak > 0 && (
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    {entry.current_streak}
                  </span>
                )}
              </div>
            </div>

            {/* XP */}
            <div className="text-right">
              <p className="font-bold text-sm text-primary">{entry.total_xp.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">XP</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
