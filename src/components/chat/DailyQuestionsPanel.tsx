import { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  RefreshCw, 
  BookOpen, 
  Calculator, 
  Atom, 
  FlaskConical,
  GraduationCap,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyQuestion {
  id: string;
  subject: string;
  question: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
  year?: string;
}

interface DailyQuestionsPanelProps {
  classLevel: string;
  stream?: string;
  subject?: string;
  trigger?: React.ReactNode;
  onAskQuestion?: (question: string) => void;
}

// Curated questions based on Nepal SEE/NEB past papers
const questionBank: Record<string, Record<string, DailyQuestion[]>> = {
  '8': {
    math: [
      { id: '8m1', subject: 'Math', question: 'If x + y = 10 and x - y = 4, find the values of x and y.', hint: 'Add both equations', difficulty: 'easy', source: 'SEE Model 2023' },
      { id: '8m2', subject: 'Math', question: 'Find the area of a circle with radius 7 cm. (Use π = 22/7)', hint: 'A = πr²', difficulty: 'easy', source: 'Class 8 Final 2022' },
      { id: '8m3', subject: 'Math', question: 'Simplify: (a + b)² - (a - b)²', hint: 'Expand both and subtract', difficulty: 'medium', source: 'SEE Practice' },
    ],
    science: [
      { id: '8s1', subject: 'Science', question: 'What is the SI unit of force? Define it.', hint: 'F = ma', difficulty: 'easy', source: 'Class 8 Final 2023' },
      { id: '8s2', subject: 'Science', question: 'Explain the law of conservation of mass with an example.', difficulty: 'medium', source: 'SEE Model' },
    ]
  },
  '9': {
    math: [
      { id: '9m1', subject: 'Math', question: 'Solve the quadratic equation: x² - 5x + 6 = 0', hint: 'Factorize', difficulty: 'easy', source: 'SEE 2079' },
      { id: '9m2', subject: 'Math', question: 'Find the distance between points A(2,3) and B(5,7).', hint: 'd = √[(x₂-x₁)² + (y₂-y₁)²]', difficulty: 'medium', source: 'SEE 2080' },
      { id: '9m3', subject: 'Math', question: 'If v = u + at, find t when v = 30 m/s, u = 10 m/s, a = 5 m/s².', difficulty: 'easy', source: 'SEE Model' },
    ],
    science: [
      { id: '9s1', subject: 'Science', question: 'State Newton\'s second law of motion and derive F = ma.', difficulty: 'medium', source: 'SEE 2080' },
      { id: '9s2', subject: 'Science', question: 'Calculate the work done when a force of 20N moves an object 5m.', hint: 'W = F × d', difficulty: 'easy', source: 'SEE 2079' },
    ]
  },
  '10': {
    math: [
      { id: '10m1', subject: 'Math', question: 'Prove: sin²θ + cos²θ = 1', hint: 'Use Pythagorean theorem', difficulty: 'medium', source: 'SEE 2080' },
      { id: '10m2', subject: 'Math', question: 'Find the value of sin 60° × cos 30° + cos 60° × sin 30°.', hint: 'sin(A+B) formula', difficulty: 'medium', source: 'SEE 2079' },
      { id: '10m3', subject: 'Math', question: 'The mean of 5, 8, x, 11, 14 is 10. Find x.', hint: 'Sum/n = mean', difficulty: 'easy', source: 'SEE Model 2081' },
      { id: '10m4', subject: 'Math', question: 'Find the median of: 3, 7, 2, 9, 5, 8, 1', difficulty: 'easy', source: 'SEE Practice' },
    ],
    science: [
      { id: '10s1', subject: 'Science', question: 'Calculate the resistance when V = 12V and I = 3A.', hint: 'V = IR', difficulty: 'easy', source: 'SEE 2080' },
      { id: '10s2', subject: 'Science', question: 'What is the power of a lens with focal length 25 cm?', hint: 'P = 1/f (in meters)', difficulty: 'easy', source: 'SEE 2079' },
      { id: '10s3', subject: 'Science', question: 'Balance: Fe + O₂ → Fe₂O₃', difficulty: 'medium', source: 'SEE 2080' },
    ]
  },
  '11': {
    math: [
      { id: '11m1', subject: 'Math', question: 'Find the derivative of f(x) = x³ - 3x² + 2x - 1', hint: 'Power rule: d/dx(xⁿ) = nxⁿ⁻¹', difficulty: 'medium', source: 'NEB 2080' },
      { id: '11m2', subject: 'Math', question: 'Evaluate: lim(x→2) (x² - 4)/(x - 2)', hint: 'Factorize numerator', difficulty: 'medium', source: 'NEB Model' },
      { id: '11m3', subject: 'Math', question: 'Prove: sin 2A = 2 sin A cos A', hint: 'Use sin(A+B) formula', difficulty: 'medium', source: 'NEB 2079' },
    ],
    physics: [
      { id: '11p1', subject: 'Physics', question: 'A projectile is fired at 30° with velocity 20 m/s. Find the range.', hint: 'R = u²sin2θ/g', difficulty: 'medium', source: 'NEB 2080' },
      { id: '11p2', subject: 'Physics', question: 'Calculate escape velocity for Earth (R = 6400 km, g = 10 m/s²).', hint: 'vₑ = √(2gR)', difficulty: 'medium', source: 'NEB 2079' },
      { id: '11p3', subject: 'Physics', question: 'A wave has frequency 500 Hz and wavelength 0.6 m. Find velocity.', hint: 'v = fλ', difficulty: 'easy', source: 'NEB Model' },
    ],
    chemistry: [
      { id: '11c1', subject: 'Chemistry', question: 'Calculate the energy of electron in 2nd orbit of hydrogen atom.', hint: 'Eₙ = -13.6/n² eV', difficulty: 'medium', source: 'NEB 2080' },
      { id: '11c2', subject: 'Chemistry', question: 'Find ΔG if ΔH = -50 kJ, ΔS = 100 J/K, T = 300K', hint: 'ΔG = ΔH - TΔS', difficulty: 'medium', source: 'NEB 2079' },
    ]
  },
  '12': {
    math: [
      { id: '12m1', subject: 'Math', question: 'Evaluate: ∫(x² + 2x + 1)dx', hint: 'Power rule: ∫xⁿdx = xⁿ⁺¹/(n+1) + C', difficulty: 'easy', source: 'NEB 2080' },
      { id: '12m2', subject: 'Math', question: 'Find the dot product of a⃗ = 2î + 3ĵ and b⃗ = 4î - ĵ', hint: 'a⃗·b⃗ = a₁b₁ + a₂b₂', difficulty: 'easy', source: 'NEB Model' },
      { id: '12m3', subject: 'Math', question: 'If P(A) = 0.6, P(B) = 0.4, P(A∩B) = 0.2, find P(A|B).', hint: 'P(A|B) = P(A∩B)/P(B)', difficulty: 'medium', source: 'NEB 2079' },
    ],
    physics: [
      { id: '12p1', subject: 'Physics', question: 'Calculate the force between two charges of 2μC each, separated by 30 cm.', hint: 'F = kq₁q₂/r²', difficulty: 'medium', source: 'NEB 2080' },
      { id: '12p2', subject: 'Physics', question: 'Find the work function if threshold frequency is 5×10¹⁴ Hz.', hint: 'φ = hν₀', difficulty: 'medium', source: 'NEB 2079' },
      { id: '12p3', subject: 'Physics', question: 'Calculate half-life if decay constant λ = 0.0231/day.', hint: 't½ = 0.693/λ', difficulty: 'easy', source: 'NEB Model' },
    ],
    chemistry: [
      { id: '12c1', subject: 'Chemistry', question: 'Calculate E°cell for Zn-Cu cell. E°(Zn²⁺/Zn) = -0.76V, E°(Cu²⁺/Cu) = +0.34V', hint: 'E°cell = E°cathode - E°anode', difficulty: 'easy', source: 'NEB 2080' },
      { id: '12c2', subject: 'Chemistry', question: 'A first order reaction has k = 0.0693 min⁻¹. Find half-life.', hint: 't½ = 0.693/k', difficulty: 'easy', source: 'NEB 2079' },
      { id: '12c3', subject: 'Chemistry', question: 'Calculate boiling point elevation for 0.5m glucose solution. Kb = 0.52 K/m', hint: 'ΔTb = Kb × m', difficulty: 'easy', source: 'NEB Model' },
    ]
  }
};

export function DailyQuestionsPanel({ classLevel, stream, subject, trigger, onAskQuestion }: DailyQuestionsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dailyQuestions, setDailyQuestions] = useState<DailyQuestion[]>([]);
  const [activeSubject, setActiveSubject] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const getSubjectIcon = (subj: string) => {
    switch (subj.toLowerCase()) {
      case 'math': return <Calculator className="h-4 w-4" />;
      case 'physics': return <Atom className="h-4 w-4" />;
      case 'chemistry': return <FlaskConical className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
      case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/30';
      default: return '';
    }
  };

  const loadDailyQuestions = useCallback(() => {
    setIsLoading(true);
    
    const classNum = classLevel.replace('Class ', '');
    const classQuestions = questionBank[classNum] || {};
    
    let allQuestions: DailyQuestion[] = [];
    
    // Get questions based on subject filter
    if (subject && subject !== 'all') {
      const subjectKey = subject.toLowerCase();
      allQuestions = classQuestions[subjectKey] || [];
    } else {
      // Get all subjects
      Object.values(classQuestions).forEach(questions => {
        allQuestions = [...allQuestions, ...questions];
      });
    }

    // Shuffle and pick 5 daily questions
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const daily = shuffled.slice(0, 5);
    
    setDailyQuestions(daily);
    setIsLoading(false);
  }, [classLevel, subject]);

  useEffect(() => {
    if (isOpen) {
      loadDailyQuestions();
    }
  }, [isOpen, loadDailyQuestions]);

  const availableSubjects = (() => {
    const classNum = classLevel.replace('Class ', '');
    return Object.keys(questionBank[classNum] || {});
  })();

  const filteredQuestions = activeSubject === 'all' 
    ? dailyQuestions 
    : dailyQuestions.filter(q => q.subject.toLowerCase() === activeSubject);

  const handleAskQuestion = (question: DailyQuestion) => {
    if (onAskQuestion) {
      onAskQuestion(`Solve this ${question.subject} question step by step:\n\n${question.question}${question.hint ? `\n\nHint: ${question.hint}` : ''}`);
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Daily Questions
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Daily Important Questions
            <Badge variant="secondary" className="ml-2">{classLevel}</Badge>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          {/* Info Banner */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">From Past Papers 📝</p>
                <p>Questions curated from Nepal SEE/NEB past papers and model questions for maximum exam relevance.</p>
              </div>
            </div>
          </div>

          {/* Subject Filter */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={activeSubject === 'all' ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setActiveSubject('all')}
            >
              All
            </Badge>
            {availableSubjects.map(subj => (
              <Badge
                key={subj}
                variant={activeSubject === subj ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => setActiveSubject(subj)}
              >
                {subj}
              </Badge>
            ))}
          </div>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={loadDailyQuestions}
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Get New Questions
          </Button>

          {/* Questions List */}
          <ScrollArea className="h-[calc(100vh-350px)]">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No questions available</p>
                <p className="text-sm mt-1">Try refreshing or selecting a different subject</p>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {filteredQuestions.map((question, idx) => (
                  <div
                    key={question.id}
                    className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline" className="text-xs gap-1">
                            {getSubjectIcon(question.subject)}
                            {question.subject}
                          </Badge>
                          <Badge variant="outline" className={cn("text-xs", getDifficultyColor(question.difficulty))}>
                            {question.difficulty}
                          </Badge>
                          {question.year && (
                            <span className="text-xs text-muted-foreground">{question.source}</span>
                          )}
                        </div>
                        
                        <p className="text-sm font-medium leading-relaxed mb-2">
                          {question.question}
                        </p>
                        
                        {question.hint && (
                          <p className="text-xs text-muted-foreground mb-3">
                            💡 Hint: {question.hint}
                          </p>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => handleAskQuestion(question)}
                        >
                          Solve with AI
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
