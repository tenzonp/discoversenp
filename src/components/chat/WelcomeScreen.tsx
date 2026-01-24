import { ChatMode } from "./ModeSelector";
import { ExamClass, ExamStream, ExamGroup, ExamSubject } from "./ExamClassSelector";

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
  mode?: ChatMode;
  examClass?: ExamClass;
  examStream?: ExamStream;
  examGroup?: ExamGroup;
  examSubject?: ExamSubject;
}

const defaultSuggestions = [
  { text: "K cha?", sub: "Casual chat" },
  { text: "Padhai help", sub: "Study mode" },
  { text: "IELTS practice", sub: "English prep" },
  { text: "Kei explain gar", sub: "Learn something" },
];

const getExamSuggestions = (examClass: ExamClass, examStream: ExamStream, examSubject: ExamSubject) => {
  const classNum = examClass ? parseInt(examClass) : 10;
  const isPlus2 = classNum >= 11;
  
  // Math focused
  if (examSubject === "math") {
    if (isPlus2) {
      return [
        { text: `Derivative ko step-by-step solve`, sub: "Calculus basics" },
        { text: `Integration formula haru`, sub: "With examples" },
        { text: `Trigonometry prove gar`, sub: "Identity proofs" },
        { text: `Matrix multiplication`, sub: "Linear algebra" },
      ];
    }
    return [
      { text: `Quadratic equation solve`, sub: "ax² + bx + c = 0" },
      { text: `Algebra simplify gar`, sub: "Step-by-step" },
      { text: `Geometry theorem prove`, sub: "With diagram" },
      { text: `Arithmetic progression formula`, sub: "AP/GP series" },
    ];
  }
  
  // Physics focused
  if (examSubject === "physics") {
    if (isPlus2) {
      return [
        { text: `Newton's laws derivation`, sub: "With proof" },
        { text: `Electric field numerical`, sub: "Coulomb's law" },
        { text: `Thermodynamics formula`, sub: "Heat & work" },
        { text: `Wave optics explain`, sub: "Interference/diffraction" },
      ];
    }
    return [
      { text: `Force & motion numerical`, sub: "F = ma problems" },
      { text: `Light reflection diagram`, sub: "Mirror formula" },
      { text: `Simple machine calculation`, sub: "MA, VR, efficiency" },
      { text: `Electricity circuit solve`, sub: "Ohm's law" },
    ];
  }
  
  // Chemistry focused
  if (examSubject === "chemistry") {
    if (isPlus2) {
      return [
        { text: `Organic reaction mechanism`, sub: "SN1/SN2/E1/E2" },
        { text: `Electrochemistry numerical`, sub: "Nernst equation" },
        { text: `Chemical equilibrium solve`, sub: "Kp, Kc problems" },
        { text: `Coordination compound`, sub: "IUPAC naming" },
      ];
    }
    return [
      { text: `Chemical equation balance`, sub: "Redox reactions" },
      { text: `Periodic table trends`, sub: "Properties explain" },
      { text: `Acid-base reaction`, sub: "Neutralization" },
      { text: `Metal extraction process`, sub: "Metallurgy" },
    ];
  }
  
  // Biology focused  
  if (examSubject === "biology") {
    return [
      { text: `Cell structure diagram`, sub: "Labeling & functions" },
      { text: `Photosynthesis process`, sub: "Light/dark reaction" },
      { text: `Human digestive system`, sub: "Organs & enzymes" },
      { text: `Genetics problems solve`, sub: "Punnett square" },
    ];
  }
  
  // Computer Science
  if (examSubject === "computer") {
    return [
      { text: `C programming example`, sub: "Loop/array code" },
      { text: `Flowchart banaideu`, sub: "Algorithm design" },
      { text: `Database SQL query`, sub: "SELECT/JOIN" },
      { text: `Number system convert`, sub: "Binary/decimal/hex" },
    ];
  }
  
  // Accountancy (Management)
  if (examSubject === "accountancy") {
    return [
      { text: `Journal entry banaideu`, sub: "Double entry" },
      { text: `Trial balance prepare`, sub: "Step-by-step" },
      { text: `Depreciation calculate`, sub: "SLM/WDV method" },
      { text: `Final accounts prepare`, sub: "P&L, Balance sheet" },
    ];
  }
  
  // Economics (Management)
  if (examSubject === "economics") {
    return [
      { text: `Demand curve explain`, sub: "Law of demand" },
      { text: `GDP calculation`, sub: "National income" },
      { text: `Elasticity numerical`, sub: "Price/income elasticity" },
      { text: `Market structure compare`, sub: "Perfect vs monopoly" },
    ];
  }
  
  // All subjects - Science stream
  if (examStream === "science") {
    return [
      { text: `Math numerical solve`, sub: "Any equation" },
      { text: `Physics derivation`, sub: "Formula proof" },
      { text: `Chemistry reaction`, sub: "Balancing & mechanism" },
      { text: `SEE/+2 question solve`, sub: "Past papers" },
    ];
  }
  
  // All subjects - Management stream
  if (examStream === "management") {
    return [
      { text: `Accountancy problem`, sub: "Journal/ledger" },
      { text: `Business math solve`, sub: "Interest/profit" },
      { text: `Economics concept`, sub: "Theory & graphs" },
      { text: `+2 question solve`, sub: "Past papers" },
    ];
  }
  
  // Default all subjects
  return [
    { text: `Math problem solve`, sub: "Any equation" },
    { text: `Science concept explain`, sub: "Physics/Chemistry" },
    { text: `${isPlus2 ? "+2" : "SEE"} preparation`, sub: "Exam strategy" },
    { text: `Homework help`, sub: "Any subject" },
  ];
};

const WelcomeScreen = ({ onSuggestionClick, mode, examClass, examStream, examSubject }: WelcomeScreenProps) => {
  const isExamMode = mode === "exam" && examClass;
  const suggestions = isExamMode 
    ? getExamSuggestions(examClass, examStream || null, examSubject || "all")
    : defaultSuggestions;

  return (
    <div className="w-full max-w-sm animate-appear delay-200">
      <p className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-5">
        {isExamMode ? `📚 Class ${examClass} ${examStream ? `• ${examStream}` : ""} Study` : "Kaha bata suru?"}
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
