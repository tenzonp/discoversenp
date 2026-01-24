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
  X,
  Brain,
  Rocket,
  Shield,
  Star
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
    bgColor: "bg-muted/50",
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

// Feature comparison between Free and Pro
const FEATURE_COMPARISON = [
  { 
    name: "Chat Messages", 
    free: "50/chat", 
    pro: "150/chat", 
    icon: MessageCircle,
    highlight: true 
  },
  { 
    name: "Voice Minutes", 
    free: "3 min/day", 
    pro: "30 min/day", 
    icon: Mic,
    highlight: true 
  },
  { 
    name: "AI Personality", 
    free: "Basic", 
    pro: "Fully Adaptive", 
    icon: Brain,
    highlight: true 
  },
  { 
    name: "Expert Mode", 
    free: false, 
    pro: true, 
    icon: Rocket,
    highlight: false 
  },
  { 
    name: "Beta Features", 
    free: false, 
    pro: true, 
    icon: Star,
    highlight: false 
  },
  { 
    name: "Current Focus", 
    free: false, 
    pro: true, 
    icon: Shield,
    highlight: false 
  },
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
  const info = TIER_INFO[tier];
  const Icon = info.icon;

  const messagePercent = Math.min((messagesUsed / messageLimit) * 100, 100);
  const voicePercent = Math.min((voiceUsed / voiceMinutes) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Current Plan Card */}
      <div className={cn(
        "p-4 rounded-xl border-2 transition-all",
        info.bgColor,
        info.borderColor,
        tier === "pro" && "shadow-lg shadow-primary/10"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              tier === "pro" ? "bg-primary/20" : "bg-muted"
            )}>
              <Icon className={cn("w-5 h-5", info.color)} />
            </div>
            <div>
              <span className={cn("font-bold text-lg", info.color)}>{info.name}</span>
              {tier === "pro" && expiresAt && (
                <p className="text-xs text-muted-foreground">
                  Active until {expiresAt.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {tier === "pro" && (
            <Badge className="bg-primary/20 text-primary border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </div>

        {/* Usage Stats with visual difference */}
        <div className="space-y-3 mb-4">
          <div className={cn(
            "p-3 rounded-lg",
            tier === "pro" ? "bg-background/50" : "bg-background"
          )}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="flex items-center gap-2 font-medium">
                <MessageCircle className="w-4 h-4 text-primary" />
                Messages
              </span>
              <span className={cn(
                "font-bold",
                messagePercent > 80 ? "text-destructive" : "text-foreground"
              )}>
                {messagesUsed}/{messageLimit}
              </span>
            </div>
            <Progress 
              value={messagePercent} 
              className={cn(
                "h-2",
                tier === "pro" && "[&>div]:bg-primary"
              )} 
            />
          </div>

          <div className={cn(
            "p-3 rounded-lg",
            tier === "pro" ? "bg-background/50" : "bg-background"
          )}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="flex items-center gap-2 font-medium">
                <Mic className="w-4 h-4 text-accent" />
                Voice Minutes
              </span>
              <span className={cn(
                "font-bold",
                voicePercent > 80 ? "text-destructive" : "text-foreground"
              )}>
                {Math.round(voiceUsed)}/{voiceMinutes} min
              </span>
            </div>
            <Progress 
              value={voicePercent} 
              className={cn(
                "h-2",
                tier === "pro" && "[&>div]:bg-accent"
              )} 
            />
          </div>
        </div>

        {/* Pro benefits reminder */}
        {tier === "pro" && (
          <div className="text-xs text-muted-foreground text-center">
            ✨ Enjoy your Pro benefits: Expert AI, 30min voice, full analytics
          </div>
        )}
      </div>

      {/* Upgrade CTA for Free Users */}
      {tier === "free" && (
        <div className="p-4 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">Upgrade to Pro</span>
            <Badge className="bg-primary/20 text-primary border-0 text-xs">
              रू 299/mo
            </Badge>
          </div>

          {/* Feature Comparison Table */}
          <div className="space-y-2 mb-4">
            {FEATURE_COMPARISON.map((feature, i) => {
              const FeatureIcon = feature.icon;
              return (
                <div 
                  key={i} 
                  className={cn(
                    "flex items-center justify-between text-sm py-2 px-3 rounded-lg",
                    feature.highlight && "bg-background/50"
                  )}
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <FeatureIcon className="w-4 h-4" />
                    {feature.name}
                  </span>
                  <div className="flex items-center gap-4">
                    {/* Free column */}
                    <span className="text-muted-foreground text-xs w-16 text-center">
                      {typeof feature.free === "boolean" ? (
                        feature.free ? (
                          <Check className="w-4 h-4 mx-auto text-muted-foreground" />
                        ) : (
                          <X className="w-4 h-4 mx-auto text-muted-foreground/50" />
                        )
                      ) : (
                        feature.free
                      )}
                    </span>
                    {/* Pro column */}
                    <span className={cn(
                      "font-medium text-xs w-20 text-center",
                      feature.highlight ? "text-primary" : "text-foreground"
                    )}>
                      {typeof feature.pro === "boolean" ? (
                        feature.pro ? (
                          <Check className="w-4 h-4 mx-auto text-primary" />
                        ) : (
                          <X className="w-4 h-4 mx-auto text-muted-foreground/50" />
                        )
                      ) : (
                        feature.pro
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <Button 
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-primary to-accent text-white font-medium hover:opacity-90"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now - रू 299/month
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Pay via eSewa • Instant activation
          </p>
        </div>
      )}
    </div>
  );
}