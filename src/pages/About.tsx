import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import DiscoverseText from "@/components/DiscoverseText";
import { ArrowLeft, Heart, MessageCircle } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="safe-area-top px-4 py-3 flex items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <DiscoverseText size="md" />
        </div>
        <ThemeToggle />
      </header>

      <main className="max-w-xl mx-auto px-6 py-12 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-3 animate-fade-in">
          <h1 className="text-2xl font-semibold">
            Nepal ko Afnai AI 🇳🇵
          </h1>
          <p className="text-muted-foreground">
            Your personal AI companion that truly understands you
          </p>
        </section>

        {/* What is Discoverse */}
        <section className="space-y-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <p className="text-muted-foreground leading-relaxed">
            Discoverse is a conversational AI built in Nepal. It speaks Nepali, 
            understands local context, and adapts to your personality — whether you want 
            a casual friend, professional assistant, study partner, or cultural companion.
          </p>
        </section>

        {/* Founder */}
        <section className="space-y-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-2 text-primary">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">The Story</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-semibold">
                N
              </div>
              <div>
                <p className="font-medium">Nishan Bhusal</p>
                <p className="text-sm text-muted-foreground">Founder & CEO</p>
              </div>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              Self-taught developer from Nepal. Started coding without formal training, 
              driven by curiosity and late nights. Built Discoverse to give Nepal its own AI — 
              one that speaks our language and understands our culture.
            </p>
            
            <blockquote className="border-l-2 border-primary/50 pl-4 text-sm italic text-muted-foreground">
              "I wanted to build something that feels like talking to a friend who gets you."
            </blockquote>
          </div>
        </section>

        {/* Simple features */}
        <section className="space-y-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span>🇳🇵</span>
              <span>Nepali language & cultural context</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span>🎭</span>
              <span>Multiple modes — friend, professional, exam, cultural</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span>🧠</span>
              <span>Adapts to your personality over time</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span>🔍</span>
              <span>Web search, image generation, voice chat</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pt-4 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <Button
            onClick={() => navigate("/chat")}
            variant="ghost"
            className="rounded-full"
          >
            Start Chatting <MessageCircle className="w-4 h-4 ml-2" />
          </Button>
          
          <p className="text-xs text-muted-foreground/60 mt-8">
            Made with ❤️ in Nepal
          </p>
        </section>
      </main>
    </div>
  );
};

export default About;
