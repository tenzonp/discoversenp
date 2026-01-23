interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  { text: "K cha?", sub: "Casual chat" },
  { text: "Padhai help", sub: "Study mode" },
  { text: "IELTS practice", sub: "English prep" },
  { text: "Kei explain gar", sub: "Learn something" },
];

const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  return (
    <div className="w-full max-w-sm animate-appear delay-200">
      <p className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-5">
        Kaha bata suru?
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
