import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, BookOpen, GraduationCap, ChevronRight, X } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: MessageCircle,
    title: "Yo Bhote ho! 👋",
    desc: "Tero AI sathi — Nepali ma bujhne, help garne, exam prep ma support dine.",
    color: "bg-foreground"
  },
  {
    icon: BookOpen,
    title: "Unlimited Quizzes 📚",
    desc: "Loksewa, UPSC prep — AI le fresh questions generate garcha. No limits!",
    color: "bg-amber-500"
  },
  {
    icon: GraduationCap,
    title: "Student Mode 🎓",
    desc: "Homework photo upload gara, step-by-step solve gardinchu.",
    color: "bg-teal-500"
  }
];

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      localStorage.setItem("bhote_onboarded", "true");
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("bhote_onboarded", "true");
    onComplete();
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex justify-end p-4">
        <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
          Skip
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className={`w-20 h-20 rounded-2xl ${slide.color} flex items-center justify-center mb-8 animate-slide-up`}>
          <slide.icon className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-3 animate-slide-up" style={{ animationDelay: "50ms" }}>
          {slide.title}
        </h2>
        
        <p className="text-muted-foreground text-center max-w-xs animate-slide-up" style={{ animationDelay: "100ms" }}>
          {slide.desc}
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-foreground' : 'w-1.5 bg-border'}`}
            />
          ))}
        </div>

        <Button onClick={handleNext} className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90">
          {currentSlide < slides.length - 1 ? (
            <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
          ) : (
            "Let's Go! 🚀"
          )}
        </Button>
      </div>
    </div>
  );
};

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem("bhote_onboarded");
    if (!onboarded) {
      setShowOnboarding(true);
    }
  }, []);

  return {
    showOnboarding,
    completeOnboarding: () => setShowOnboarding(false)
  };
};