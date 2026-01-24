import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import discoverseLogoNew from "@/assets/discoverse-logo-new.png";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md mx-auto text-center space-y-8 animate-appear">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-card flex items-center justify-center shadow-sm">
            <img src={discoverseLogoNew} alt="Discoverse" className="w-12 h-12 object-contain" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Discoverse</h1>
          <p className="text-muted-foreground text-sm">
            Timro AI sathi
          </p>
        </div>

        {/* CTA */}
        <div className="pt-4">
          <Button 
            onClick={() => navigate("/chat")}
            className="w-full h-12 rounded-xl text-base gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Start Chat
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Tagline */}
        <p className="text-xs text-muted-foreground/60 pt-4">
          Nepal's own AI companion
        </p>
      </div>
    </section>
  );
};

export default Hero;
