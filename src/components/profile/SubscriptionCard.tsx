import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  Zap, 
  MessageCircle, 
  Mic, 
  Check,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
  tier: "free" | "pro" | "premium";
  messageLimit: number;
  voiceMinutes: number;
  messagesUsed?: number;
  voiceUsed?: number;
  expiresAt?: Date | null;
  onUpgrade: () => void;
}

const TIER_INFO = {
  free: {
    name: "Free",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    borderColor: "border-border",
    icon: Zap,
  },
  pro: {
    name: "Pro",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    icon: Crown,
  },
  premium: {
    name: "Premium",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: Sparkles,
  },
};

const PRO_FEATURES = [
  "150 messages per chat",
  "30 minutes voice chat",
  "Priority AI responses",
  "Current focus tracking",
  "Advanced behavior insights",
];

export function SubscriptionCard({
  tier,
  messageLimit,
  voiceMinutes,
  messagesUsed = 0,
  voiceUsed = 0,
  expiresAt,
  onUpgrade,
}: SubscriptionCardProps) {
  const [showProModal, setShowProModal] = useState(false);
  const info = TIER_INFO[tier];
  const Icon = info.icon;

  const messagePercent = Math.min((messagesUsed / messageLimit) * 100, 100);
  const voicePercent = Math.min((voiceUsed / voiceMinutes) * 100, 100);

  return (
    <div className={cn(
      "p-4 rounded-xl border",
      info.bgColor,
      info.borderColor
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-5 h-5", info.color)} />
          <span className={cn("font-semibold", info.color)}>{info.name} Plan</span>
          {tier === "pro" && expiresAt && (
            <Badge variant="outline" className="text-xs">
              Expires {expiresAt.toLocaleDateString()}
            </Badge>
          )}
        </div>
        {tier === "free" && (
          <Button 
            size="sm" 
            onClick={onUpgrade}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            <Crown className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        )}
      </div>

      {/* Usage Stats */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="w-3 h-3" />
              Messages
            </span>
            <span>{messagesUsed}/{messageLimit}</span>
          </div>
          <Progress value={messagePercent} className="h-1.5" />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Mic className="w-3 h-3" />
              Voice Minutes
            </span>
            <span>{Math.round(voiceUsed)}/{voiceMinutes}</span>
          </div>
          <Progress value={voicePercent} className="h-1.5" />
        </div>
      </div>

      {/* Pro Features Preview for Free Users */}
      {tier === "free" && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs font-medium mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            Unlock with Pro:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {PRO_FEATURES.slice(0, 3).map((feature, i) => (
              <li key={i} className="flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
