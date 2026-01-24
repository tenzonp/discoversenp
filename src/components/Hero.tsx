import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DiscoverseText from "@/components/DiscoverseText";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md mx-auto text-center space-y-8 animate-appear">
        {/* Text Logo */}
        <div className="flex flex-col items-center gap-2">
          <DiscoverseText size="xl" showVersion />
        </div>

        {/* Subtitle */}
        <p className="text-muted-foreground text-sm">
          Timro AI sathi
        </p>

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
          Discoverse 0.1 Model • Nepal's AI
        </p>
      </div>
    </section>
  );
};

export default Hero;
