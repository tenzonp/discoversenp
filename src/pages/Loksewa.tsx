import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { loksewaQuestions, categories, difficulties, Question } from "@/data/loksewaQuestions";
import { 
  ArrowLeft, 
  BookOpen, 
  Trophy, 
  CheckCircle, 
  XCircle,
  RotateCcw,
  ChevronRight,
  Sparkles
} from "lucide-react";

const difficultyLabels: Record<string, string> = {
  "सबै": "All",
  "easy": "सजिलो",
  "medium": "मध्यम", 
  "hard": "कठिन"
};

const Loksewa = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("सबै");
  const [selectedDifficulty, setSelectedDifficulty] = useState("सबै");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [previousScores, setPreviousScores] = useState<{ score: number; total: number; created_at: string; difficulty?: string }[]>([]);

  const filteredQuestions = loksewaQuestions.filter(q => {
    const categoryMatch = selectedCategory === "सबै" || q.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === "सबै" || q.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadScores();
    }
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
    
    if (data) {
      setPreviousScores(data.map(s => ({ 
        score: s.score, 
        total: s.total_questions, 
        created_at: s.created_at 
      })));
    }
  };

  const saveScore = async () => {
    if (!user) return;
    await supabase.from("quiz_scores").insert({
      user_id: user.id,
      category: "loksewa",
      score,
      total_questions: filteredQuestions.length,
      difficulty: selectedDifficulty === "सबै" ? "mixed" : selectedDifficulty
    });
    await loadScores();
  };

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    setAnsweredQuestions([...answeredQuestions, currentQuestionIndex]);
    
    if (index === currentQuestion.correct) {
      setScore(score + 1);
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
      await saveScore();
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnsweredQuestions([]);
    setQuizComplete(false);
    setQuizStarted(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft">
          <BookOpen className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border/50 bg-card/80 backdrop-blur-lg sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">Loksewa Quiz</h1>
            <p className="text-xs text-muted-foreground">Nepal PSC Preparation</p>
          </div>
        </div>
        {quizStarted && !quizComplete && (
          <div className="ml-auto flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-primary" />
            <span>{score}/{filteredQuestions.length}</span>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto safe-area-bottom">
        {!quizStarted ? (
          /* Start Screen */
          <div className="p-4 space-y-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg mb-4">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Loksewa Quiz</h2>
              <p className="text-muted-foreground">
                नेपाल लोक सेवा आयोग परीक्षाको तयारी
              </p>
            </div>

            {/* Category Selection */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Category छान्नुहोस्:</h3>
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

            {/* Difficulty Selection */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Difficulty छान्नुहोस्:</h3>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((diff) => (
                  <Button
                    key={diff}
                    variant={selectedDifficulty === diff ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`rounded-full ${
                      diff === "easy" ? "border-green-500/50" :
                      diff === "medium" ? "border-amber-500/50" :
                      diff === "hard" ? "border-red-500/50" : ""
                    }`}
                  >
                    {difficultyLabels[diff] || diff}
                  </Button>
                ))}
              </div>
            </div>

            {/* Question Count Info */}
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">
                {filteredQuestions.length} questions available
              </p>
            </div>

            {/* Previous Scores */}
            {previousScores.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  Previous Scores
                </h3>
                <div className="space-y-2">
                  {previousScores.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50">
                      <span className="text-sm text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString('ne-NP')}
                      </span>
                      <span className="font-semibold">
                        {s.score}/{s.total} ({Math.round((s.score / s.total) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => setQuizStarted(true)}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Quiz सुरु गर्नुहोस्
            </Button>
          </div>
        ) : quizComplete ? (
          /* Results Screen */
          <div className="p-4 space-y-6">
            <div className="text-center py-8">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
                score >= filteredQuestions.length * 0.7 
                  ? 'bg-green-500/20' 
                  : score >= filteredQuestions.length * 0.5 
                    ? 'bg-yellow-500/20' 
                    : 'bg-red-500/20'
              }`}>
                <Trophy className={`w-12 h-12 ${
                  score >= filteredQuestions.length * 0.7 
                    ? 'text-green-500' 
                    : score >= filteredQuestions.length * 0.5 
                      ? 'text-yellow-500' 
                      : 'text-red-500'
                }`} />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {score >= filteredQuestions.length * 0.7 
                  ? "उत्कृष्ट! 🎉" 
                  : score >= filteredQuestions.length * 0.5 
                    ? "राम्रो! 👍" 
                    : "अझै प्रयास गर्नुहोस् 💪"}
              </h2>
              <p className="text-4xl font-bold text-primary mb-2">
                {score}/{filteredQuestions.length}
              </p>
              <p className="text-muted-foreground">
                {Math.round((score / filteredQuestions.length) * 100)}% सही
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={resetQuiz}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                फेरि खेल्नुहोस्
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/chat")}
                className="w-full h-12 rounded-xl"
              >
                Chat मा जानुहोस्
              </Button>
            </div>
          </div>
        ) : (
          /* Quiz Screen */
          <div className="p-4 space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Question {currentQuestionIndex + 1}/{filteredQuestions.length}</span>
                <span className="text-muted-foreground">{currentQuestion.category}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="p-4 rounded-2xl bg-card border border-border/50">
              <p className="text-lg font-medium leading-relaxed">{currentQuestion.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correct;
                const showResult = selectedAnswer !== null;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                      showResult
                        ? isCorrect
                          ? 'border-green-500 bg-green-500/10'
                          : isSelected
                            ? 'border-red-500 bg-red-500/10'
                            : 'border-border/50 bg-card opacity-50'
                        : 'border-border/50 bg-card hover:border-primary/50 active:scale-[0.98]'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      showResult
                        ? isCorrect
                          ? 'bg-green-500 text-white'
                          : isSelected
                            ? 'bg-red-500 text-white'
                            : 'bg-muted'
                        : 'bg-muted'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <h4 className="font-medium text-primary mb-2">व्याख्या:</h4>
                <p className="text-sm">{currentQuestion.explanation}</p>
              </div>
            )}

            {/* Next Button */}
            {selectedAnswer !== null && (
              <Button
                onClick={handleNext}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white"
              >
                {currentQuestionIndex < filteredQuestions.length - 1 ? (
                  <>
                    अर्को प्रश्न
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  "नतिजा हेर्नुहोस्"
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Loksewa;
