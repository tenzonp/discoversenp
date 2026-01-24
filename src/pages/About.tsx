import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import DiscoverseText from "@/components/DiscoverseText";
import { 
  ArrowLeft, 
  Heart, 
  Sparkles, 
  BookOpen, 
  Brain, 
  Users, 
  Globe,
  Rocket,
  MessageCircle
} from "lucide-react";

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

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl font-bold">
            Nepal ko Afnai AI 🇳🇵
          </h1>
          <p className="text-muted-foreground text-lg">
            Building the future of education from the heart of Nepal
          </p>
        </section>

        {/* Founder Story */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Heart className="w-5 h-5" />
            <h2 className="text-xl font-semibold">The Story</h2>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                N
              </div>
              <div>
                <h3 className="font-bold text-lg">Nishan Bhusal</h3>
                <p className="text-sm text-muted-foreground">Founder & CEO</p>
              </div>
            </div>
            
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                From a small village in Nepal, Nishan taught himself to code without formal training. 
                While friends played games, he was building things — one line of code at a time.
              </p>
              <p>
                He saw how students in Nepal struggled with expensive tutors and outdated learning methods. 
                That's when the dream was born: <span className="text-foreground font-medium">
                "What if every Nepali student had a brilliant friend who could explain anything?"
                </span>
              </p>
              <p>
                Late nights, countless failures, and unwavering determination led to Discoverse — 
                an AI that speaks Nepali, understands our culture, and teaches like a caring elder sibling.
              </p>
            </div>
            
            <blockquote className="border-l-2 border-primary pl-4 italic text-foreground">
              "I didn't have money for tuition. But I had curiosity and internet. 
              Discoverse is my gift to every student who feels the same."
              <footer className="text-sm text-muted-foreground mt-1">— Nishan</footer>
            </blockquote>
          </div>
        </section>

        {/* Mission */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Rocket className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Our Mission</h2>
          </div>
          
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <p className="text-lg text-center font-medium">
              Make quality education accessible to every Nepali student, 
              regardless of location or economic background.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-xl font-semibold">What Makes Us Special</h2>
          </div>
          
          <div className="grid gap-3">
            {[
              { icon: Globe, title: "Nepali First", desc: "Built for Nepali students, understanding local context and curriculum" },
              { icon: BookOpen, title: "SEE/NEB Focused", desc: "Aligned with Nepal's education board syllabus from Class 8-12" },
              { icon: Brain, title: "Smart Learning", desc: "Adapts to your pace, tracks mistakes, and builds on your strengths" },
              { icon: MessageCircle, title: "24/7 Study Buddy", desc: "Ask anything, anytime — like having a friend who never sleeps" },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Users className="w-5 h-5" />
            <h2 className="text-xl font-semibold">The Team</h2>
          </div>
          
          <div className="p-6 rounded-2xl bg-card border border-border/50 text-center space-y-3">
            <p className="text-muted-foreground">
              A small but passionate team working from Nepal, united by a single goal: 
              transforming education through technology.
            </p>
            <p className="text-sm">
              🇳🇵 Made with <span className="text-destructive">❤️</span> in Nepal
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-4 pb-8">
          <p className="text-muted-foreground">Ready to learn?</p>
          <Button
            onClick={() => navigate("/chat")}
            className="rounded-full px-8"
          >
            Start Chatting <MessageCircle className="w-4 h-4 ml-2" />
          </Button>
        </section>
      </main>
    </div>
  );
};

export default About;
