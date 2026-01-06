import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, RotateCcw, Check, X, Layers, Flame, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useStreak } from "@/hooks/useStreak";
import { defaultFlashcards } from "@/data/defaultFlashcards";
import { MobileNav } from "@/components/MobileNav";
import { cn } from "@/lib/utils";

type TabType = "study" | "browse" | "create";

const Flashcards = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { flashcards, dueCards, loading, createFlashcard, deleteFlashcard, reviewCard, refresh } = useFlashcards();
  const { addXP, updateActivity } = useStreak();
  
  const [activeTab, setActiveTab] = useState<TabType>("study");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [studyCards, setStudyCards] = useState<typeof dueCards>([]);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Combine user cards with defaults for new users
    if (dueCards.length > 0) {
      setStudyCards(dueCards);
    } else if (flashcards.length === 0 && !loading) {
      // Show default cards for study if user has no cards
      const defaultCards = defaultFlashcards.map((card, i) => ({
        id: `default-${i}`,
        ...card,
        created_at: new Date().toISOString(),
      }));
      setStudyCards(defaultCards as any);
    }
  }, [dueCards, flashcards, loading]);

  const currentCard = studyCards[currentCardIndex];

  const handleAnswer = async (quality: number) => {
    if (!currentCard) return;

    // Update stats
    if (quality >= 3) {
      setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      await addXP(10); // 10 XP for correct answer
    } else {
      setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    // Review the card (only for user's own cards)
    if (!currentCard.id.startsWith("default-")) {
      await reviewCard(currentCard.id, quality);
    }

    // Update streak
    await updateActivity();

    // Move to next card
    setIsFlipped(false);
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // Session complete
      setCurrentCardIndex(0);
      await refresh();
    }
  };

  const handleCreateCard = async () => {
    if (!newFront.trim() || !newBack.trim()) return;

    await createFlashcard(newFront, newBack, newCategory);
    await addXP(5); // 5 XP for creating a card

    setNewFront("");
    setNewBack("");
    setNewCategory("general");
  };

  const handleAddDefaultCards = async () => {
    for (const card of defaultFlashcards.slice(0, 10)) {
      await createFlashcard(card.front, card.back, card.category);
    }
    await refresh();
  };

  const categories = Array.from(new Set(flashcards.map(f => f.category)));

  if (authLoading || loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-background flex flex-col pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            फ्ल्यासकार्ड
          </h1>
          <div className="flex items-center gap-1 text-xs">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>{sessionStats.correct}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-3">
          {(["study", "browse", "create"] as TabType[]).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className="flex-1 text-xs"
            >
              {tab === "study" && "अध्ययन"}
              {tab === "browse" && "ब्राउज"}
              {tab === "create" && "बनाउनुहोस्"}
            </Button>
          ))}
        </div>
      </header>

      <div className="flex-1 p-4">
        {/* Study Tab */}
        {activeTab === "study" && (
          <div className="max-w-md mx-auto">
            {studyCards.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="font-semibold mb-2">कुनै कार्ड बाँकी छैन!</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  तपाईंले आजको लागि सबै कार्डहरू review गर्नुभयो
                </p>
                <Button onClick={handleAddDefaultCards}>
                  <Plus className="w-4 h-4 mr-2" />
                  Default कार्डहरू थप्नुहोस्
                </Button>
              </div>
            ) : (
              <>
                {/* Progress */}
                <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                  <span>{currentCardIndex + 1} / {studyCards.length}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-green-500">
                      <Check className="w-4 h-4" /> {sessionStats.correct}
                    </span>
                    <span className="flex items-center gap-1 text-red-500">
                      <X className="w-4 h-4" /> {sessionStats.incorrect}
                    </span>
                  </div>
                </div>

                {/* Flashcard */}
                {currentCard && (
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className={cn(
                      "relative w-full aspect-[3/4] cursor-pointer perspective-1000",
                      "transition-transform duration-500 transform-style-preserve-3d",
                      isFlipped && "rotate-y-180"
                    )}
                  >
                    <Card className={cn(
                      "absolute inset-0 backface-hidden flex items-center justify-center p-6 text-center",
                      "bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20"
                    )}>
                      <CardContent className="p-0">
                        <p className="text-sm text-muted-foreground mb-2">{currentCard.category}</p>
                        <p className="text-lg font-medium">{currentCard.front}</p>
                        <p className="text-xs text-muted-foreground mt-4">👆 फ्लिप गर्न क्लिक गर्नुहोस्</p>
                      </CardContent>
                    </Card>

                    <Card className={cn(
                      "absolute inset-0 backface-hidden flex items-center justify-center p-6 text-center",
                      "bg-gradient-to-br from-secondary/5 to-accent/5 border-2 border-secondary/20",
                      "rotate-y-180"
                    )}>
                      <CardContent className="p-0">
                        <p className="text-sm text-muted-foreground mb-2">उत्तर</p>
                        <p className="text-lg font-medium text-primary">{currentCard.back}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Answer Buttons */}
                {isFlipped && (
                  <div className="flex gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => handleAnswer(1)}
                      className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4 mr-1" />
                      भुलें
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAnswer(3)}
                      className="flex-1 border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      कठिन
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAnswer(5)}
                      className="flex-1 border-green-500/50 text-green-500 hover:bg-green-500/10"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      सजिलो
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Browse Tab */}
        {activeTab === "browse" && (
          <div className="space-y-4 max-w-md mx-auto">
            {flashcards.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="font-semibold mb-2">कुनै कार्ड छैन</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  आफ्नो पहिलो फ्ल्यासकार्ड बनाउनुहोस्
                </p>
                <Button onClick={() => setActiveTab("create")}>
                  <Plus className="w-4 h-4 mr-2" />
                  कार्ड बनाउनुहोस्
                </Button>
              </div>
            ) : (
              flashcards.map((card) => (
                <Card key={card.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {card.category}
                      </span>
                      <p className="font-medium mt-2">{card.front}</p>
                      <p className="text-sm text-muted-foreground mt-1">{card.back}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteFlashcard(card.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === "create" && (
          <div className="max-w-md mx-auto space-y-4">
            <Card className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">अगाडि (प्रश्न)</label>
                <Textarea
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="नेपालको राजधानी कहाँ हो?"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">पछाडि (उत्तर)</label>
                <Textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="काठमाडौं"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="general"
                />
              </div>

              <Button onClick={handleCreateCard} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                कार्ड बनाउनुहोस्
                <Zap className="w-4 h-4 ml-2 text-yellow-400" />
                +5 XP
              </Button>
            </Card>

            {/* Quick add defaults */}
            <Card className="p-4">
              <h3 className="font-medium mb-2">Quick Add</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Loksewa र IELTS को लागि तयार कार्डहरू थप्नुहोस्
              </p>
              <Button variant="outline" onClick={handleAddDefaultCards} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                10 Default कार्डहरू थप्नुहोस्
              </Button>
            </Card>
          </div>
        )}
      </div>

      <MobileNav />
    </main>
  );
};

export default Flashcards;
