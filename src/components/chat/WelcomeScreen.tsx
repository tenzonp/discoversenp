import { Sparkles, BookOpen, Languages, Users, GraduationCap, Search, ImagePlus } from "lucide-react";

const suggestions = [
  { icon: Users, text: "Hey, what's up?", color: "text-primary" },
  { icon: BookOpen, text: "Help me study", color: "text-secondary" },
  { icon: Languages, text: "IELTS practice", color: "text-violet-500" },
  { icon: GraduationCap, text: "Explain this topic", color: "text-teal-500" },
  { icon: Search, text: "Research something", color: "text-pink-500" },
  { icon: ImagePlus, text: "Generate an image", color: "text-orange-500" },
];

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  return (
    <div className="w-full max-w-sm space-y-4">
      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5 font-medium">
        <Sparkles className="w-3.5 h-3.5" />
        Quick start
      </p>
      <div className="grid grid-cols-2 gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-accent/50 transition-all duration-200 text-left group"
          >
            <suggestion.icon className={`w-4 h-4 ${suggestion.color} flex-shrink-0`} />
            <span className="text-sm text-foreground">{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
