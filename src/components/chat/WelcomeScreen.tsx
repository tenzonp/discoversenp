interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  { emoji: "💬", text: "K cha bro?", description: "Casual chat" },
  { emoji: "📖", text: "Padhai ma help", description: "Study help" },
  { emoji: "🎯", text: "IELTS practice", description: "English prep" },
  { emoji: "💡", text: "Explain something", description: "Learn new" },
];

const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  return (
    <div className="w-full max-w-sm space-y-3">
      <p className="text-xs text-muted-foreground text-center mb-4">
        Kaha bata suru garney?
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="vibe-card flex flex-col items-start gap-2 p-4 text-left group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-xl">{suggestion.emoji}</span>
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                {suggestion.text}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {suggestion.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
