import { ChatMode } from "./ModeSelector";
import { ExamClass, ExamSubject } from "./ExamClassSelector";

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
  mode?: ChatMode;
  examClass?: ExamClass;
  examSubject?: ExamSubject;
}

const defaultSuggestions = [
  { text: "K cha?", sub: "Casual chat" },
  { text: "Padhai help", sub: "Study mode" },
  { text: "IELTS practice", sub: "English prep" },
  { text: "Kei explain gar", sub: "Learn something" },
];

const getExamSuggestions = (examClass: ExamClass, examSubject: ExamSubject) => {
  const classNum = examClass ? parseInt(examClass) : 10;
  
  if (examSubject === "math") {
    return [
      { text: `Quadratic equation solve गर`, sub: "Step-by-step solution" },
      { text: `Class ${examClass} Algebra basics`, sub: "Foundation concepts" },
      { text: `Geometry theorem explain`, sub: "With diagrams" },
      { text: `Trigonometry formula help`, sub: "Sin, Cos, Tan" },
    ];
  }
  
  if (examSubject === "science") {
    return [
      { text: `Newton's laws explain`, sub: "Physics fundamentals" },
      { text: `Chemical reactions balance`, sub: "Chemistry help" },
      { text: `Human body systems`, sub: "Biology concepts" },
      { text: `Class ${examClass} Science questions`, sub: "Practice problems" },
    ];
  }
  
  if (examSubject === "english") {
    return [
      { text: `Essay writing tips`, sub: "Structure & format" },
      { text: `Grammar rules explain`, sub: "Tense & voice" },
      { text: `Letter writing format`, sub: "Formal & informal" },
      { text: `Comprehension practice`, sub: "Reading skills" },
    ];
  }
  
  if (examSubject === "social") {
    return [
      { text: `Nepal history timeline`, sub: "Important events" },
      { text: `Geography of Nepal`, sub: "Mountains & rivers" },
      { text: `Civics concepts`, sub: "Government & rights" },
      { text: `Map reading help`, sub: "Physical features" },
    ];
  }
  
  // All subjects
  return [
    { text: `Class ${examClass} Math problem`, sub: "Solve any equation" },
    { text: `Science concept explain`, sub: "Physics/Chemistry/Bio" },
    { text: `SEE preparation tips`, sub: classNum <= 10 ? "Exam strategy" : "+2 strategy" },
    { text: `Homework help`, sub: "Any subject" },
  ];
};

const WelcomeScreen = ({ onSuggestionClick, mode, examClass, examSubject }: WelcomeScreenProps) => {
  const isExamMode = mode === "exam" && examClass;
  const suggestions = isExamMode 
    ? getExamSuggestions(examClass, examSubject || "all")
    : defaultSuggestions;

  return (
    <div className="w-full max-w-sm animate-appear delay-200">
      <p className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-5">
        {isExamMode ? `📚 Class ${examClass} Study` : "Kaha bata suru?"}
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
