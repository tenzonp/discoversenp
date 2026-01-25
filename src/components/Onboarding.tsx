import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Sparkles, 
  MessageCircle, 
  Mic, 
  GraduationCap, 
  ChevronRight, 
  Check,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Sparkles,
    emoji: "🇳🇵",
    title: "Namaste! 👋",
    subtitle: "Nepal's First AI Companion",
    desc: "Timilai bujhne, help garne, ani grow garna support dine — yo ho Discoverse.",
    gradient: "from-primary/20 to-accent/20",
    iconBg: "bg-primary",
  },
  {
    icon: MessageCircle,
    emoji: "💬",
    title: "Talk Like a Friend",
    subtitle: "Nepali + English Mixed",
    desc: "Natural conversation gara — homework help, career advice, ya just time pass. Sab milcha!",
    gradient: "from-teal-500/20 to-blue-500/20",
    iconBg: "bg-teal-500",
  },
  {
    icon: Mic,
    emoji: "🎙️",
    title: "Voice Practice",
    subtitle: "IELTS Speaking Expert",
    desc: "Real AI examiner sanga practice gara. Live scoring paau — fluency, vocabulary, grammar sabai.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconBg: "bg-purple-500",
  },
  {
    icon: GraduationCap,
    emoji: "📚",
    title: "Exam Ready",
    subtitle: "SEE to +2 Curriculum",
    desc: "Step-by-step solutions, formulas, flashcards — Class 8-12 ko lagi Nepal Board curriculum ma focused.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconBg: "bg-amber-500",
  },
];

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const handleNext = () => {
    if (isAnimating) return;
    
    if (currentSlide < slides.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(s => s + 1);
        setIsAnimating(false);
      }, 300);
    } else if (termsAccepted) {
      setShowCompletion(true);
      setTimeout(() => {
        localStorage.setItem("discoverse_onboarded", "true");
        onComplete();
      }, 1000);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("discoverse_onboarded", "true");
    onComplete();
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  // Completion animation
  if (showCompletion) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
        <div className="relative">
          {/* Animated rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-2 border-primary/30 animate-ping" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center" style={{ animationDelay: "150ms" }}>
            <div className="w-24 h-24 rounded-full border-2 border-primary/50 animate-ping" />
          </div>
          
          {/* Check icon */}
          <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center animate-scale-in">
            <Check className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mt-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
          Welcome to Discoverse! 🎉
        </h2>
        <p className="text-muted-foreground mt-2 animate-fade-in" style={{ animationDelay: "400ms" }}>
          Let's start exploring...
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {/* Skip Button */}
      <div className="safe-area-top flex justify-end p-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSkip} 
          className="text-muted-foreground hover:text-foreground"
        >
          Skip
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        {/* Animated Background Gradient */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-50 transition-all duration-700",
            slide.gradient
          )}
        />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/20 animate-float"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Slide Content */}
        <div className={cn(
          "relative z-10 flex flex-col items-center text-center transition-all duration-300",
          isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        )}>
          {/* Icon with animated ring */}
          <div className="relative mb-8">
            <div className={cn(
              "w-24 h-24 rounded-3xl flex items-center justify-center",
              slide.iconBg
            )}>
              <slide.icon className="w-12 h-12 text-white" />
            </div>
            
            {/* Pulsing ring */}
            <div className="absolute -inset-2 rounded-[2rem] border-2 border-primary/30 animate-pulse" />
            
            {/* Emoji badge */}
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-background shadow-lg flex items-center justify-center text-xl">
              {slide.emoji}
            </div>
          </div>

          {/* Text */}
          <h2 className="text-3xl font-bold mb-2">
            {slide.title}
          </h2>
          <p className="text-sm text-primary font-medium mb-4">
            {slide.subtitle}
          </p>
          <p className="text-muted-foreground text-base max-w-xs leading-relaxed">
            {slide.desc}
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 safe-area-bottom p-6 space-y-4">
        {/* Terms & Privacy - Only on last slide */}
        {isLastSlide && (
          <div className="animate-fade-in">
            <div 
              className="flex items-start gap-3 p-4 rounded-2xl bg-muted/50 cursor-pointer transition-colors hover:bg-muted"
              onClick={() => setTermsAccepted(!termsAccepted)}
            >
              <Checkbox 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <p className="text-sm">
                  I agree to the{" "}
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate("/terms"); }}
                    className="text-primary underline underline-offset-2"
                  >
                    Terms of Service
                  </button>
                  {" "}and{" "}
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate("/privacy"); }}
                    className="text-primary underline underline-offset-2"
                  >
                    Privacy Policy
                  </button>
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Your data is encrypted and secure
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button 
              key={i}
              onClick={() => !isAnimating && setCurrentSlide(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === currentSlide 
                  ? "w-8 bg-primary" 
                  : i < currentSlide 
                    ? "w-2 bg-primary/50" 
                    : "w-2 bg-border"
              )}
            />
          ))}
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleNext}
          disabled={isLastSlide && !termsAccepted}
          className={cn(
            "w-full h-14 rounded-2xl text-base font-medium transition-all",
            isLastSlide && !termsAccepted
              ? "bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
          )}
        >
          {isLastSlide ? (
            termsAccepted ? (
              <>Let's Go! 🚀</>
            ) : (
              <>Accept Terms to Continue</>
            )
          ) : (
            <>Next <ChevronRight className="w-5 h-5 ml-1" /></>
          )}
        </Button>
      </div>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem("discoverse_onboarded");
    if (!onboarded) {
      setShowOnboarding(true);
    }
  }, []);

  return {
    showOnboarding,
    completeOnboarding: () => setShowOnboarding(false)
  };
};
