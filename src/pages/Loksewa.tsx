import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  BookOpen, 
  Trophy, 
  CheckCircle, 
  XCircle,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Loader2,
  Infinity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
  difficulty: string;
}

const categories = ["संविधान", "भूगोल", "सामान्य ज्ञान", "समसामयिक"];
const difficulties = [
  { value: "easy", label: "Sajilo 🟢" },
  { value: "medium", label: "Medium 🟡" },
  { value: "hard", label: "Garo 🔴" }
];

const Loksewa = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState("संविधान");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previousScores, setPreviousScores] = useState<{ score: number; total: number; created_at: string }[]>([]);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) loadScores();
  }, [user]);

  const loadScores = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("quiz_scores")
      .select("score, total_questions, created_at")
      .eq("user_id", user.id)
      .eq("category", "loksewa")
      .order("created_at", { ascending: false })
      .limit(5);
    
    if (data) setPreviousScores(data.map(s => ({ score: s.score, total: s.total_questions, created_at: s.created_at })));
  };

  const generateQuiz = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          category: selectedCategory,
          difficulty: selectedDifficulty,
          count: questionCount,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions generated");
      }

      setQuestions(data.questions);
      setQuizStarted(true);
      setCurrentIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuizComplete(false);
    } catch (error) {
      console.error("Quiz error:", error);
      toast({
        variant: "destructive",
        title: "Oops!",
        description: error instanceof Error ? error.message : "Quiz generate garna sakiyena 😔",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === currentQuestion.correct) setScore(s => s + 1);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
      if (user) {
        await supabase.from("quiz_scores").insert({
          user_id: user.id,
          category: "loksewa",
          score,
          total_questions: questions.length,
          difficulty: selectedDifficulty
        });
        await loadScores();
      }
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizComplete(false);
    setQuizStarted(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => quizStarted ? resetQuiz() : navigate("/")} className="rounded-full h-9 w-9">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">Loksewa Quiz</h1>
            <p className="text-xs text-muted-foreground">Unlimited Questions 🔥</p>
          </div>
        </div>
        {quizStarted && !quizComplete && (
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>{score}/{questions.length}</span>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto safe-area-bottom">
        {!quizStarted ? (
          <div className="p-4 space-y-6">
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500 flex items-center justify-center mb-4">
                <Infinity className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-1">Unlimited Quiz</h2>
              <p className="text-muted-foreground text-sm">AI-powered Loksewa prep 🚀</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-sm">Category chuna:</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="rounded-full"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-sm">Difficulty chuna:</h3>
              <div className="flex gap-2">
                {difficulties.map((d) => (
                  <Button
                    key={d.value}
                    variant={selectedDifficulty === d.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDifficulty(d.value)}
                    className="rounded-full flex-1"
                  >
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-sm">Kati questions?</h3>
              <div className="flex gap-2">
                {[10, 20, 30, 50].map((n) => (
                  <Button
                    key={n}
                    variant={questionCount === n ? "default" : "outline"}
                    size="sm"
                    onClick={() => setQuestionCount(n)}
                    className="rounded-full flex-1"
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>

            {previousScores.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Recent Scores
                </h3>
                <div className="space-y-1">
                  {previousScores.slice(0, 3).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary text-sm">
                      <span className="text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                      <span className="font-medium">{s.score}/{s.total} ({Math.round((s.score / s.total) * 100)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={generateQuiz} disabled={isGenerating} className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white">
              {isGenerating ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" />Start Quiz 🔥</>
              )}
            </Button>
          </div>
        ) : quizComplete ? (
          <div className="p-4 space-y-6">
            <div className="text-center py-8">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                score >= questions.length * 0.7 ? 'bg-green-500/20' : score >= questions.length * 0.5 ? 'bg-amber-500/20' : 'bg-red-500/20'
              }`}>
                <Trophy className={`w-10 h-10 ${
                  score >= questions.length * 0.7 ? 'text-green-500' : score >= questions.length * 0.5 ? 'text-amber-500' : 'text-red-500'
                }`} />
              </div>
              <h2 className="text-xl font-bold mb-2">
                {score >= questions.length * 0.7 ? "Dami! 🎉" : score >= questions.length * 0.5 ? "Thikai xa! 👍" : "Practice gara bro 💪"}
              </h2>
              <p className="text-3xl font-bold text-amber-500 mb-1">{score}/{questions.length}</p>
              <p className="text-muted-foreground">{Math.round((score / questions.length) * 100)}% correct</p>
            </div>

            <div className="space-y-2">
              <Button onClick={resetQuiz} className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white">
                <RotateCcw className="w-4 h-4 mr-2" />Feri khela
              </Button>
              <Button variant="outline" onClick={() => navigate("/chat")} className="w-full h-11 rounded-xl">
                Chat ma discuss gara
              </Button>
            </div>
          </div>
        ) : currentQuestion ? (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Q {currentIndex + 1}/{questions.length}</span>
                <span className="text-muted-foreground">{currentQuestion.category}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary">
              <p className="font-medium leading-relaxed">{currentQuestion.question}</p>
            </div>

            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correct;
                const showResult = selectedAnswer !== null;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                      showResult
                        ? isCorrect ? 'border-green-500 bg-green-500/10'
                          : isSelected ? 'border-red-500 bg-red-500/10'
                          : 'border-border/50 opacity-50'
                        : 'border-border hover:border-foreground/30'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                      showResult ? isCorrect ? 'bg-green-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-secondary' : 'bg-secondary'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 text-sm">{option}</span>
                    {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm"><span className="font-medium">💡 </span>{currentQuestion.explanation}</p>
              </div>
            )}

            {selectedAnswer !== null && (
              <Button onClick={handleNext} className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white">
                {currentIndex < questions.length - 1 ? <>Next <ChevronRight className="w-4 h-4 ml-1" /></> : "Result hera"}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Loksewa;