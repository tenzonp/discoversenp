import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles } from "lucide-react";
import discoververseLogo from "@/assets/discoverse-logo.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center space-y-8 animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Nepal's First Cultural AI</span>
          </div>

          {/* Main heading with Logo */}
          <div className="space-y-4">
            <span className="block text-3xl md:text-4xl font-bold text-foreground">नमस्ते! म हुँ</span>
            <img 
              src={discoververseLogo} 
              alt="Discoverse" 
              className="h-16 md:h-24 w-auto mx-auto"
            />
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            तिम्रो आफ्नै <span className="text-primary font-semibold">नेपाली AI साथी</span> — 
            पढाइ होस्, परीक्षा होस्, वा जीवनको कुरा, म सधैं तिम्रो साथमा छु 💪
          </p>

          {/* English tagline */}
          <p className="text-base text-muted-foreground/80">
            Your smart, friendly AI assistant built for Nepal & South Asia
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="hero" size="xl" className="group">
              <MessageCircle className="w-5 h-5 group-hover:animate-bounce-gentle" />
              कुरा गरौं — Let's Chat
            </Button>
            <Button variant="outline" size="xl">
              Modes हेर्नुहोस्
            </Button>
          </div>

          {/* Founder credit */}
          <div className="pt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-primary-foreground font-bold">
              NB
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Founded by Nishan Bhusal</p>
              <p className="text-xs">Tulsipur, Dang, Nepal 🇳🇵</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;