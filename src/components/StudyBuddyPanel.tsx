import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  UserPlus, 
  Search,
  Check,
  X,
  MessageCircle,
  Target,
  Sparkles,
  Loader2,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyBuddy {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  status: "pending" | "active" | "ended";
  matchReason: string;
  compatibilityScore: number;
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

interface StudyBuddyPanelProps {
  buddies: StudyBuddy[];
  potentialMatches: PotentialMatch[];
  isSearching: boolean;
  onFindMatches: () => void;
  onSendRequest: (partnerId: string, reason: string) => Promise<boolean>;
  onAcceptRequest: (buddyId: string) => void;
  onEndRelationship: (buddyId: string) => void;
  className?: string;
}

export function StudyBuddyPanel({
  buddies,
  potentialMatches,
  isSearching,
  onFindMatches,
  onSendRequest,
  onAcceptRequest,
  onEndRelationship,
  className,
}: StudyBuddyPanelProps) {
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"buddies" | "find">("buddies");
  
  const activeBuddies = buddies.filter(b => b.status === "active");
  const pendingRequests = buddies.filter(b => b.status === "pending");
  
  const handleSendRequest = async (match: PotentialMatch) => {
    setSendingTo(match.userId);
    const reason = match.matchReasons.join(", ");
    await onSendRequest(match.userId, reason);
    setSendingTo(null);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="w-4 h-4 text-primary" />
          Study Buddies
        </CardTitle>
        <CardDescription>
          Learn together, grow faster
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "buddies" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("buddies")}
            className="flex-1"
          >
            My Buddies ({activeBuddies.length})
          </Button>
          <Button
            variant={activeTab === "find" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("find")}
            className="flex-1"
          >
            <Search className="w-3 h-3 mr-1" />
            Find
          </Button>
        </div>
        
        {activeTab === "buddies" ? (
          <div className="space-y-3">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Pending Requests</p>
                {pendingRequests.map((buddy) => (
                  <div
                    key={buddy.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={buddy.partnerAvatar} />
                      <AvatarFallback>{buddy.partnerName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{buddy.partnerName}</p>
                      <p className="text-xs text-muted-foreground truncate">{buddy.matchReason}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-emerald-500"
                        onClick={() => onAcceptRequest(buddy.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500"
                        onClick={() => onEndRelationship(buddy.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Active Buddies */}
            {activeBuddies.length > 0 ? (
              <div className="space-y-2">
                {pendingRequests.length > 0 && (
                  <p className="text-xs font-medium text-muted-foreground">Active Buddies</p>
                )}
                {activeBuddies.map((buddy) => (
                  <div
                    key={buddy.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={buddy.partnerAvatar} />
                      <AvatarFallback>{buddy.partnerName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{buddy.partnerName}</p>
                      <p className="text-xs text-muted-foreground truncate">{buddy.matchReason}</p>
                    </div>
                    <Badge variant="outline" className="text-xs gap-1">
                      <Heart className="w-3 h-3 text-red-500" />
                      {buddy.compatibilityScore}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-6">
                <Users className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No study buddies yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setActiveTab("find")}
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Find Your First Buddy
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Find Matches */}
            <Button
              onClick={onFindMatches}
              disabled={isSearching}
              className="w-full"
              variant="outline"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding matches...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find Compatible Buddies
                </>
              )}
            </Button>
            
            {/* Potential Matches */}
            {potentialMatches.length > 0 && (
              <div className="space-y-2 pt-2">
                {potentialMatches.slice(0, 5).map((match) => (
                  <div
                    key={match.userId}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={match.avatarUrl} />
                      <AvatarFallback>{match.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{match.displayName}</p>
                        <Badge variant="secondary" className="text-xs">
                          {match.compatibilityScore}% match
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {match.matchReasons[0]}
                      </p>
                      {match.sharedGoals.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {match.sharedGoals.slice(0, 2).map((goal, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] px-1">
                              <Target className="w-2 h-2 mr-0.5" />
                              {goal}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSendRequest(match)}
                      disabled={sendingTo === match.userId}
                    >
                      {sendingTo === match.userId ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <UserPlus className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {potentialMatches.length === 0 && !isSearching && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Click "Find Compatible Buddies" to discover learners like you!
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
