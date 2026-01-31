import { ChatMode } from "./ModeSelector";

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
  mode?: ChatMode;
}

const defaultSuggestions = [
  { text: "K cha?", sub: "Casual chat" },
  { text: "Help me decide something", sub: "Decision engine" },
  { text: "Bore bhayo, kei ramro idea de", sub: "Fun ideas" },
  { text: "Kei explain gar", sub: "Learn something" },
];

const jugaadSuggestions = [
  { text: "Passport kasari banauney? Full process", sub: "🏛️ Sarkari Bato" },
  { text: "80k salary KTM ma ramro ho?", sub: "💰 Market Intelligence" },
  { text: "Laptop kaha bata kinnu sasto huncha?", sub: "🔄 Best Deals" },
  { text: "Driving license form help", sub: "📋 Form Filler" },
];

const professionalSuggestions = [
  { text: "Help me with a business email", sub: "Professional tone" },
  { text: "Explain a complex concept", sub: "Clear breakdown" },
  { text: "Review my document", sub: "Feedback & edits" },
  { text: "Brainstorm ideas", sub: "Strategic thinking" },
];

const roastSuggestions = [
  { text: "Roast my friend group", sub: "Tell me about them" },
  { text: "Roast based on our photo", sub: "Send group pic" },
  { text: "Roast my college squad", sub: "Batch stereotypes" },
  { text: "Roast my work team", sub: "Office politics" },
];

const WelcomeScreen = ({ onSuggestionClick, mode }: WelcomeScreenProps) => {
  let suggestions = defaultSuggestions;
  let headerText = "Kaha bata suru?";
  
  if (mode === "jugaad") {
    suggestions = jugaadSuggestions;
    headerText = "🔄 Nepal's Street-Smart AI";
  } else if (mode === "professional") {
    suggestions = professionalSuggestions;
    headerText = "How may I assist you today?";
  } else if (mode === "roast") {
    suggestions = roastSuggestions;
    headerText = "🔥 Who's getting roasted?";
  }

  return (
    <div className="w-full max-w-sm animate-appear delay-200">
      <p className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-5">
        {headerText}
      </p>
      <div className="space-y-1.5">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="w-full vibe-card group flex items-center justify-between text-left animate-fade-up py-4"
            style={{ animationDelay: `${200 + index * 60}ms` }}
          >
            <div>
              <p className="text-foreground text-base group-hover:text-accent transition-colors duration-300">
                {suggestion.text}
              </p>
              <p className="text-xs text-muted-foreground/50 mt-0.5">
                {suggestion.sub}
              </p>
            </div>
            <div className="w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-3 h-3 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
