import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Mail, KeyRound, User, Sparkles, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import DiscoverseText from "@/components/DiscoverseText";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type AuthMode = "otp" | "password";
type AuthStep = "email" | "otp" | "password-login" | "signup-details" | "forgot-password" | "reset-password";

const REMEMBER_ME_KEY = "discoverse_remember_me";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<AuthMode>("otp");
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSignup, setIsSignup] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    const saved = localStorage.getItem(REMEMBER_ME_KEY);
    return saved !== "false"; // Default to true
  });

  // Handle session cleanup on browser close if "Remember Me" is unchecked
  useEffect(() => {
    const handleBeforeUnload = () => {
      const shouldRemember = localStorage.getItem(REMEMBER_ME_KEY);
      if (shouldRemember === "false") {
        // Clear session data when browser closes
        supabase.auth.signOut();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Save remember me preference
  useEffect(() => {
    localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
  }, [rememberMe]);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/chat");
    }
  }, [user, authLoading, navigate]);

  // Check for password reset token in URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");
    
    if (accessToken && type === "recovery") {
      setStep("reset-password");
    }
  }, []);

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
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
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

      const isNew = !data.user?.user_metadata?.display_name;
      
      if (isNew) {
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

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          throw new Error("Passwords don't match");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: displayName || email.split("@")[0],
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Account Created! 🎉",
          description: "Swagat xa! Welcome to Discoverse",
        });
        navigate("/chat");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back! 🙏",
          description: "Namaste, Discoverse ma swagat xa!",
        });
        navigate("/chat");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isSignup ? "Signup Failed" : "Login Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Reset Link Sent! 📧",
        description: "Check your email for the password reset link from Discoverse",
      });
      setResendCooldown(60);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send reset link",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Error",
        description: "Passwords don't match",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      toast({
        title: "Password Updated! 🎉",
        description: "You can now login with your new password",
      });
      
      // Clear hash and redirect
      window.location.hash = "";
      setStep("email");
      setMode("password");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: error.message,
      });
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
    if (step === "otp" || step === "password-login" || step === "forgot-password") {
      setStep("email");
      setOtp("");
      setPassword("");
    }
  };

  const switchMode = () => {
    setMode(mode === "otp" ? "password" : "otp");
    setStep("email");
    setPassword("");
    setOtp("");
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
          disabled={step === "signup-details" || step === "reset-password"}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Logo */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <DiscoverseText size="lg" showVersion />
            </div>
            <p className="text-sm text-muted-foreground">
              {step === "email" && (mode === "otp" ? "Sign in with email OTP" : (isSignup ? "Create your account" : "Sign in with password"))}
              {step === "otp" && "Enter the code sent to your email"}
              {step === "password-login" && "Enter your password"}
              {step === "signup-details" && "Complete your profile"}
              {step === "forgot-password" && "Reset your password"}
              {step === "reset-password" && "Set your new password"}
            </p>
          </div>

          {/* Reset Password Step */}
          {step === "reset-password" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-medium text-lg">Set New Password</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword" className="text-sm">Confirm Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !password || password !== confirmPassword}
                className="w-full h-12 rounded-xl"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
              </Button>
            </form>
          )}

          {/* Forgot Password Step */}
          {step === "forgot-password" && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-medium text-lg">Forgot Password?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resetEmail" className="text-sm">Email Address</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !email.trim() || resendCooldown > 0}
                className="w-full h-12 rounded-xl"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <p className="text-center">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back to login
                </button>
              </p>
            </form>
          )}

          {/* Email Step */}
          {step === "email" && (
            <form onSubmit={mode === "otp" ? handleSendOTP : handlePasswordAuth} className="space-y-5">
              {mode === "password" && isSignup && (
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
                    className="h-12 rounded-xl"
                  />
                </div>
              )}

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

              {mode === "password" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-12 rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isSignup && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-12 rounded-xl"
                      />
                    </div>
                  )}

                  {!isSignup && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="rememberMe" 
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                        />
                        <Label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer">
                          Remember me
                        </Label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep("forgot-password")}
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </>
              )}

              <Button
                type="submit"
                disabled={loading || !email.trim() || (mode === "password" && !password)}
                className="w-full h-12 rounded-xl text-base font-medium"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : mode === "otp" ? (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send OTP Code
                  </>
                ) : isSignup ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>

              {mode === "otp" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Checkbox 
                      id="rememberMeOtp" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="rememberMeOtp" className="text-sm text-muted-foreground cursor-pointer">
                      Remember me on this device
                    </Label>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    We'll send a 6-digit code to your email. No password needed!
                  </p>
                </div>
              )}

              {mode === "password" && (
                <p className="text-center text-sm text-muted-foreground">
                  {isSignup ? "Already have an account? " : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignup(!isSignup);
                      setPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    {isSignup ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              )}

              {/* Mode Switcher */}
              <div className="pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={switchMode}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mode === "otp" ? (
                    <>
                      <Lock className="w-4 h-4 inline mr-1" />
                      Use password instead
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 inline mr-1" />
                      Use OTP instead (no password)
                    </>
                  )}
                </button>
              </div>
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
