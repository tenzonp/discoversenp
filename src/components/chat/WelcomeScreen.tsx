import { Sparkles, BookOpen, Languages, Users, GraduationCap } from "lucide-react";

const suggestions = [
  { icon: Users, text: "Hi, k xa khabar?", color: "text-primary" },
  { icon: BookOpen, text: "Loksewa tips deu", color: "text-secondary" },
  { icon: Languages, text: "IELTS speaking practice", color: "text-accent" },
  { icon: GraduationCap, text: "Math help chahiyo", color: "text-teal-500" },
];

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      {/* Logo */}
      <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center mb-6 shadow-glow animate-float">
        <span className="text-3xl text-primary-foreground font-bold">भ</span>
      </div>

      {/* Welcome text */}
      <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
        नमस्ते! 🙏
      </h2>
      <p className="text-muted-foreground text-center mb-8 max-w-xs">
        म Bhote AI हुँ। तिम्रो साथी। कुरा गरौं — Nepali, English, Roman मा!
      </p>

      {/* Quick suggestions */}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          Quick start गर
        </p>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion.text)}
              className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-soft transition-all duration-300 text-left group"
            >
              <suggestion.icon className={`w-4 h-4 ${suggestion.color} flex-shrink-0`} />
              <span className="text-xs text-foreground truncate">{suggestion.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
