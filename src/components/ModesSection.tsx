import ModeCard from "./ModeCard";
import { Users, BookOpen, Languages, GraduationCap } from "lucide-react";

const ModesSection = () => {
  const modes = [
    {
      icon: Users,
      title: "Friend Mode",
      nepaliTitle: "साथी मोड",
      description: "Ma timro sathi ho — tension naleu, kura gar, hasau, ru pani sakxau. Life ko kura garaum!",
      features: ["Casual Nepali chat", "Life advice & motivation", "Stress relief & support"],
      color: "saffron" as const,
    },
    {
      icon: BookOpen,
      title: "Loksewa / UPSC",
      nepaliTitle: "परीक्षा तयारी",
      description: "Nepal ko Loksewa ki India ko UPSC — smart preparation with exam-oriented answers.",
      features: ["MCQ quizzes & practice", "Previous year patterns", "Nepal constitution & GK"],
      color: "teal" as const,
    },
    {
      icon: Languages,
      title: "IELTS Mode",
      nepaliTitle: "अंग्रेजी अभ्यास",
      description: "Real conversation partner for IELTS prep. Fluency, vocabulary, and band score tips!",
      features: ["Speaking practice", "Writing feedback", "Band score estimation"],
      color: "accent" as const,
    },
    {
      icon: GraduationCap,
      title: "Student Mode",
      nepaliTitle: "विद्यार्थी मोड",
      description: "School ra college students ko lagi — homework help, concepts, step-by-step solutions.",
      features: ["Image support for questions", "Simple explanations", "Exam-friendly answers"],
      color: "secondary" as const,
    },
  ];

  return (
    <section className="py-24 px-4 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            चार <span className="gradient-text">Powerful Modes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Timro need anusar — friend chahiyo, padhai chahiyo, ya English practice, Bhote AI tayar xa!
          </p>
        </div>

        {/* Mode cards grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {modes.map((mode, index) => (
            <ModeCard
              key={mode.title}
              {...mode}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModesSection;
