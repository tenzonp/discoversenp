import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Check, 
  Smartphone,
  Copy,
  ExternalLink,
  MessageCircle,
  Mic,
  Brain,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EsewaPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

const PRO_PRICE = 299; // NPR
const ESEWA_ID = "9800000000"; // Replace with actual eSewa merchant ID

const PRO_FEATURES = [
  { icon: MessageCircle, text: "150 messages per chat" },
  { icon: Mic, text: "30 minutes voice chat daily" },
  { icon: Brain, text: "Current focus & behavior tracking" },
  { icon: Sparkles, text: "Priority AI responses" },
];

export function EsewaPaymentModal({
  open,
  onOpenChange,
  userId,
  onSuccess,
}: EsewaPaymentModalProps) {
  const [step, setStep] = useState<"info" | "payment" | "verify">("info");
  const [transactionId, setTransactionId] = useState("");
  const [verifying, setVerifying] = useState(false);

  const copyEsewaId = () => {
    navigator.clipboard.writeText(ESEWA_ID);
    toast.success("eSewa ID copied!");
  };

  const handleVerifyPayment = async () => {
    if (!transactionId.trim()) {
      toast.error("Please enter your transaction ID");
      return;
    }

    setVerifying(true);

    // For now, we'll manually verify payments
    // In production, integrate with eSewa API
    try {
      // Create/update subscription
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

      const { error } = await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: userId,
          tier: "pro",
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error) {
        throw error;
      }

      toast.success("🎉 Welcome to Pro! Your account has been upgraded.");
      onSuccess();
      onOpenChange(false);
      setStep("info");
      setTransactionId("");
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to upgrade. Please contact support with your transaction ID.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            Unlock unlimited potential with Discoverse Pro
          </DialogDescription>
        </DialogHeader>

        {step === "info" && (
          <div className="space-y-4">
            {/* Price */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
              <p className="text-4xl font-bold">रू {PRO_PRICE}</p>
              <p className="text-sm text-muted-foreground">/month</p>
            </div>

            {/* Features */}
            <div className="space-y-2">
              {PRO_FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <Icon className="w-4 h-4 text-primary" />
                    <span>{feature.text}</span>
                  </div>
                );
              })}
            </div>

            <Button 
              onClick={() => setStep("payment")} 
              className="w-full bg-gradient-to-r from-green-600 to-green-500"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Pay with eSewa
            </Button>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <p className="text-sm font-medium mb-2">Send रू {PRO_PRICE} to:</p>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <div>
                  <p className="font-mono text-lg">{ESEWA_ID}</p>
                  <p className="text-xs text-muted-foreground">Discoverse Pro</p>
                </div>
                <Button variant="ghost" size="icon" onClick={copyEsewaId}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Steps:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Open eSewa app</li>
                <li>Go to "Send Money"</li>
                <li>Enter the eSewa ID above</li>
                <li>Enter amount: रू {PRO_PRICE}</li>
                <li>Complete payment</li>
                <li>Note down the transaction ID</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("info")} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep("verify")} className="flex-1">
                I've Paid
              </Button>
            </div>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="txnId">eSewa Transaction ID</Label>
              <Input
                id="txnId"
                placeholder="Enter your transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Find this in your eSewa transaction history
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("payment")} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleVerifyPayment} 
                disabled={verifying}
                className="flex-1"
              >
                {verifying ? "Verifying..." : "Verify & Upgrade"}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Verification may take up to 5 minutes. Contact support if issues persist.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
