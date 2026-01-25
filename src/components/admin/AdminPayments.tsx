import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Check, 
  X, 
  Clock, 
  CreditCard,
  Loader2,
  User,
  Calendar
} from "lucide-react";

interface PaymentVerification {
  id: string;
  user_id: string;
  transaction_id: string;
  amount: number;
  payment_method: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  verified_at: string | null;
  user_email?: string;
  user_name?: string;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<PaymentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_verifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich with user info
      const enrichedPayments = await Promise.all(
        (data || []).map(async (payment) => {
          // Get email using the security definer function
          const { data: email } = await supabase.rpc("get_user_email", {
            _user_id: payment.user_id,
          });

          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", payment.user_id)
            .single();

          return {
            ...payment,
            user_email: email || "Unknown",
            user_name: profile?.display_name || "Anonymous",
          };
        })
      );

      setPayments(enrichedPayments);
    } catch (err) {
      console.error("Error loading payments:", err);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentId: string, userId: string) => {
    setProcessing(paymentId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update payment status
      const { error: paymentError } = await supabase
        .from("payment_verifications")
        .update({
          status: "verified",
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          notes: notes[paymentId] || null,
        })
        .eq("id", paymentId);

      if (paymentError) throw paymentError;

      // Upgrade user to Pro
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error: subError } = await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: userId,
          tier: "pro",
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (subError) throw subError;

      toast.success("Payment verified and user upgraded to Pro!");
      loadPayments();
    } catch (err) {
      console.error("Error verifying payment:", err);
      toast.error("Failed to verify payment");
    } finally {
      setProcessing(null);
    }
  };

  const rejectPayment = async (paymentId: string) => {
    setProcessing(paymentId);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("payment_verifications")
        .update({
          status: "rejected",
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          notes: notes[paymentId] || "Payment could not be verified",
        })
        .eq("id", paymentId);

      if (error) throw error;

      toast.success("Payment rejected");
      loadPayments();
    } catch (err) {
      console.error("Error rejecting payment:", err);
      toast.error("Failed to reject payment");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "verified":
        return <Badge variant="default" className="bg-accent text-accent-foreground"><Check className="w-3 h-3 mr-1" />Verified</Badge>;
      case "rejected":
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === "pending");
  const processedPayments = payments.filter(p => p.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Pending Payments */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Pending Verification ({pendingPayments.length})
        </h3>
        
        {pendingPayments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No pending payments to verify
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingPayments.map((payment) => (
              <Card key={payment.id} className="border-primary/30">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{payment.user_name}</span>
                          {getStatusBadge(payment.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{payment.user_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">रू {payment.amount}</p>
                        <p className="text-xs text-muted-foreground">{payment.payment_method}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                      <p className="font-mono font-semibold">{payment.transaction_id}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Submitted: {new Date(payment.created_at).toLocaleString()}
                    </div>

                    <Textarea
                      placeholder="Add notes (optional)..."
                      value={notes[payment.id] || ""}
                      onChange={(e) => setNotes({ ...notes, [payment.id]: e.target.value })}
                      className="text-sm"
                      rows={2}
                    />

                    <div className="flex gap-2">
                      <Button
                        onClick={() => verifyPayment(payment.id, payment.user_id)}
                        disabled={processing === payment.id}
                        className="flex-1"
                      >
                        {processing === payment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Verify & Upgrade
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => rejectPayment(payment.id)}
                        disabled={processing === payment.id}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Processed Payments */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-muted-foreground" />
          Payment History ({processedPayments.length})
        </h3>

        {processedPayments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No payment history
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {processedPayments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{payment.user_name}</span>
                          {getStatusBadge(payment.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {payment.transaction_id} • {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                        {payment.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Note: {payment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="font-semibold">रू {payment.amount}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
