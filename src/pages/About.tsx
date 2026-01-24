import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import DiscoverseText from "@/components/DiscoverseText";
import { ArrowLeft, MessageCircle } from "lucide-react";

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

      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* Hero - The Hook */}
        <section className="text-center mb-20 animate-fade-in">
          <p className="text-sm text-primary font-medium tracking-wide uppercase mb-4">
            Nepal ko Afnai AI
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
            What if everyone had access to a brilliant friend who never sleeps?
          </h1>
          <p className="text-lg text-muted-foreground">
            That question started everything.
          </p>
        </section>

        {/* The Origin - Setting the Scene */}
        <section className="mb-20 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-lg">
              In a small village in Nepal, there was no coding bootcamp. No tech mentors. 
              No startup ecosystem. Just a boy with an old computer and an internet connection 
              that worked maybe half the time.
            </p>
            <p>
              While other kids played, <span className="text-foreground font-medium">Nishan Bhusal</span> was 
              teaching himself to code — one YouTube tutorial at a time, one Stack Overflow answer at a time, 
              one failed project at a time.
            </p>
            <p>
              He didn't have money for courses. He didn't have connections. What he had was 
              an obsessive curiosity and the stubborn belief that if someone else could build it, 
              so could he.
            </p>
          </div>
        </section>

        {/* The Struggle */}
        <section className="mb-20 animate-fade-in" style={{ animationDelay: "150ms" }}>
          <h2 className="text-xl font-semibold mb-6">The Problem He Couldn't Ignore</h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Growing up, Nishan watched his friends struggle. They needed help with studies — 
              but tutors were expensive. They had questions at 2 AM — but nobody to ask. 
              They wanted to learn new skills — but resources were in English they couldn't fully understand.
            </p>
            <p>
              When ChatGPT arrived, Nishan saw the future. But he also saw the gap. These AI 
              systems didn't speak Nepali. They didn't understand Nepali humor, culture, or context. 
              They couldn't crack a joke in the local dialect or explain something the way a 
              Nepali elder sibling would.
            </p>
            <p className="text-foreground font-medium text-lg">
              Nepal was being left behind in the AI revolution. And that bothered him deeply.
            </p>
          </div>
        </section>

        {/* The Turning Point */}
        <section className="mb-20 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="text-xl font-semibold mb-6">The Moment Everything Changed</h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              One night, after yet another failed attempt to explain a coding concept to his 
              younger cousin over the phone, it hit him:
            </p>
            <blockquote className="border-l-4 border-primary pl-6 py-4 my-8 bg-muted/30 rounded-r-lg">
              <p className="text-foreground text-lg italic">
                "What if I could build an AI that talks like us? That understands when someone 
                says 'bujhena yaar' and explains it differently? That knows our curriculum, 
                our slang, our way of thinking?"
              </p>
            </blockquote>
            <p>
              That night, Discoverse was born — not as a business plan, but as a personal mission. 
              He didn't sleep for three days. He mapped out every feature. He imagined every 
              conversation. He saw the future he wanted to create.
            </p>
          </div>
        </section>

        {/* The Vision */}
        <section className="mb-20 animate-fade-in" style={{ animationDelay: "250ms" }}>
          <h2 className="text-xl font-semibold mb-6">What Discoverse Really Is</h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Discoverse isn't just another chatbot. It's Nepal's first AI companion that 
              truly <span className="text-foreground">gets</span> you.
            </p>
            <div className="grid gap-4 my-8">
              <div className="p-5 rounded-xl bg-card border border-border/50">
                <p className="font-medium text-foreground mb-2">It speaks your language</p>
                <p className="text-sm">Not just Nepali — but the way Nepali people actually talk. 
                The slang. The humor. The cultural references.</p>
              </div>
              <div className="p-5 rounded-xl bg-card border border-border/50">
                <p className="font-medium text-foreground mb-2">It adapts to you</p>
                <p className="text-sm">Whether you want a chill friend, a professional consultant, 
                a study partner, or a cultural companion — it becomes what you need.</p>
              </div>
              <div className="p-5 rounded-xl bg-card border border-border/50">
                <p className="font-medium text-foreground mb-2">It remembers you</p>
                <p className="text-sm">Your interests, your goals, your style. Every conversation 
                makes it understand you better.</p>
              </div>
              <div className="p-5 rounded-xl bg-card border border-border/50">
                <p className="font-medium text-foreground mb-2">It's always there</p>
                <p className="text-sm">3 AM doubts? Need to vent? Want to brainstorm? 
                Discoverse never judges, never sleeps, never gets tired of you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* The Philosophy */}
        <section className="mb-20 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <h2 className="text-xl font-semibold mb-6">The Belief Behind It All</h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Nishan believes technology should feel human. The best products don't feel like 
              products at all — they feel like friends who happen to be incredibly smart and 
              always available.
            </p>
            <p>
              That's why Discoverse doesn't have a corporate voice. It doesn't give you 
              cookie-cutter responses. It talks to you like someone who actually cares — 
              because it was built by someone who does.
            </p>
            <p className="text-foreground font-medium">
              This isn't about building the next billion-dollar company. It's about making 
              sure the kid in the next village has access to the same opportunities as 
              someone in Silicon Valley.
            </p>
          </div>
        </section>

        {/* The Founder Card */}
        <section className="mb-20 animate-fade-in" style={{ animationDelay: "350ms" }}>
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50">
            <div className="flex items-start gap-5 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold shrink-0">
                N
              </div>
              <div>
                <h3 className="text-xl font-bold">Nishan Bhusal</h3>
                <p className="text-muted-foreground">Founder & CEO</p>
              </div>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Self-taught developer. First-generation entrepreneur. Building from Nepal, for Nepal, 
                and eventually for the world.
              </p>
              <p className="text-sm italic border-l-2 border-primary/50 pl-4">
                "I didn't have money for tuition. But I had curiosity and internet. 
                Discoverse is my gift to every person who feels the same hunger to learn, 
                to grow, to become something more."
              </p>
            </div>
          </div>
        </section>

        {/* The Future */}
        <section className="mb-20 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <h2 className="text-xl font-semibold mb-6">Where This Is Going</h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Discoverse is just the beginning. The vision is bigger: to build AI that serves 
              the underserved. To prove that world-class technology can come from anywhere — 
              including a small country between India and China.
            </p>
            <p>
              Every feature added, every conversation had, every user helped — it all feeds 
              into a larger dream: <span className="text-foreground font-medium">democratizing 
              access to intelligence itself.</span>
            </p>
            <p>
              Because in the future Nishan imagines, where you're born doesn't determine 
              what you can become.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pt-8 pb-16 animate-fade-in" style={{ animationDelay: "450ms" }}>
          <p className="text-muted-foreground mb-6">
            Ready to meet your new companion?
          </p>
          <Button
            onClick={() => navigate("/chat")}
            className="rounded-full px-8 py-6 text-base"
          >
            Start a Conversation <MessageCircle className="w-4 h-4 ml-2" />
          </Button>
          
          <div className="mt-16 pt-8 border-t border-border/50">
            <p className="text-xs text-muted-foreground/60">
              Made with obsession in Nepal 🇳🇵
            </p>
            <p className="text-xs text-muted-foreground/40 mt-1">
              Discoverse 0.1
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
