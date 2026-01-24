import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Mail, KeyRound, User, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import DiscoverseText from "@/components/DiscoverseText";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type AuthStep = "email" | "otp" | "signup-details";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/chat");
    }
  }, [user, authLoading, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    try {
      // Use signInWithOtp - works for both new and existing users
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true, // Create user if doesn't exist
        },
      });

      if (error) throw error;

      toast({
        title: "OTP Sent! 📧",
        description: `Check ${email} for your 6-digit code from Discoverse`,
      });
      
      setStep("otp");
      setResendCooldown(60);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: "email",
      });

      if (error) throw error;

      // Check if this is a new user (no display_name in metadata)
      const isNew = !data.user?.user_metadata?.display_name;
      
      if (isNew) {
        setIsNewUser(true);
        setStep("signup-details");
      } else {
        toast({
          title: "Welcome back! 🙏",
          description: "Namaste, Discoverse ma swagat xa!",
        });
        navigate("/chat");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: error.message || "Please check your code and try again",
      });
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName.trim(),
        },
      });

      if (error) throw error;

      toast({
        title: "Account Created! 🎉",
        description: "Swagat xa! Welcome to Discoverse",
      });
      navigate("/chat");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      toast({
        title: "OTP Resent! 📧",
        description: "Check your inbox for the new code",
      });
      setResendCooldown(60);
      setOtp("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to resend",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("email");
      setOtp("");
    } else if (step === "signup-details") {
      // Can't go back after OTP verification
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="p-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={step === "email" ? () => navigate("/") : handleBack} 
          className="w-8 h-8 rounded-full"
          disabled={step === "signup-details"}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <DiscoverseText size="lg" showVersion />
            </div>
            <p className="text-sm text-muted-foreground">
              {step === "email" && "Sign in with your email"}
              {step === "otp" && "Enter the code sent to your email"}
              {step === "signup-details" && "Complete your profile"}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex justify-center gap-2">
            {["email", "otp", "signup-details"].map((s, i) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === s 
                    ? "bg-primary w-6" 
                    : i < ["email", "otp", "signup-details"].indexOf(step)
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Email Step */}
          {step === "email" && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl text-base"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full h-12 rounded-xl text-base font-medium"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send OTP Code
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                We'll send a 6-digit code to your email. No password needed!
              </p>
            </form>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm flex items-center gap-2 justify-center">
                  <KeyRound className="w-4 h-4" />
                  Enter 6-Digit Code
                </Label>
                
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6} 
                    value={otp} 
                    onChange={setOtp}
                    autoFocus
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Code sent to <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-12 rounded-xl text-base font-medium"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Verify & Continue
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading || resendCooldown > 0}
                  className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  {resendCooldown > 0 
                    ? `Resend code in ${resendCooldown}s` 
                    : "Didn't receive code? Resend"
                  }
                </button>
              </div>
            </form>
          )}

          {/* Signup Details Step */}
          {step === "signup-details" && (
            <form onSubmit={handleCompleteSignup} className="space-y-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-medium text-lg">Welcome to Discoverse!</h3>
                <p className="text-sm text-muted-foreground">Let's set up your profile</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Your Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="What should we call you?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="h-12 rounded-xl text-base"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !displayName.trim()}
                className="w-full h-12 rounded-xl text-base font-medium"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Exploring
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
