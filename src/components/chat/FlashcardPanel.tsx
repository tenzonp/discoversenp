import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layers, 
  Plus, 
  RotateCcw, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Brain,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useFlashcards } from '@/hooks/useFlashcards';
import { cn } from '@/lib/utils';

interface FlashcardPanelProps {
  userId: string | undefined;
  category?: string;
  trigger?: React.ReactNode;
}

export function FlashcardPanel({ userId, category, trigger }: FlashcardPanelProps) {
  const { 
    flashcards, 
    dueCards, 
    isLoading, 
    createFlashcard, 
    reviewCard, 
    deleteFlashcard 
  } = useFlashcards(userId, category);
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('review');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newCategory, setNewCategory] = useState(category || 'general');

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  }, [isOpen]);

  const currentCard = dueCards[currentCardIndex];

  const handleReview = async (quality: number) => {
    if (!currentCard) return;
    
    await reviewCard(currentCard.id, quality);
    setIsFlipped(false);
    
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handleCreate = async () => {
    if (!newFront.trim() || !newBack.trim()) return;
    
    await createFlashcard(newFront, newBack, newCategory);
    setNewFront('');
    setNewBack('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Layers className="h-4 w-4" />
            Flashcards
            {dueCards.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                {dueCards.length}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Flashcards
            <Badge variant="secondary" className="ml-2">
              {dueCards.length} due
            </Badge>
          </SheetTitle>
        </SheetHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="review" className="gap-2">
              <RotateCcw className="h-3.5 w-3.5" />
              Review
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Layers className="h-3.5 w-3.5" />
              All ({flashcards.length})
            </TabsTrigger>
            <TabsTrigger value="create" className="gap-2">
              <Plus className="h-3.5 w-3.5" />
              Create
            </TabsTrigger>
          </TabsList>

          {/* Review Tab */}
          <TabsContent value="review" className="mt-4">
            {dueCards.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto mb-3 text-primary opacity-50" />
                <p className="font-medium text-foreground">All caught up! 🎉</p>
                <p className="text-sm text-muted-foreground mt-1">
                  No cards due for review. Create new ones or check back later.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Progress */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Card {currentCardIndex + 1} of {dueCards.length}</span>
                  <div className="flex gap-1">
                    {dueCards.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          i === currentCardIndex ? "bg-primary" : 
                          i < currentCardIndex ? "bg-primary/30" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Flashcard */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={cn(
                    "relative h-64 cursor-pointer perspective-1000",
                    "transition-transform duration-500 transform-style-3d",
                    isFlipped && "rotate-y-180"
                  )}
                >
                  {/* Front */}
                  <div className={cn(
                    "absolute inset-0 p-6 rounded-2xl border-2 bg-card backface-hidden",
                    "flex flex-col items-center justify-center text-center",
                    !isFlipped ? "border-primary/30" : "border-transparent"
                  )}>
                    <Badge variant="outline" className="mb-4">
                      {currentCard?.category}
                    </Badge>
                    <p className="text-lg font-medium leading-relaxed">
                      {currentCard?.front}
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Tap to reveal answer
                    </p>
                  </div>

                  {/* Back */}
                  <div className={cn(
                    "absolute inset-0 p-6 rounded-2xl border-2 bg-primary/5 backface-hidden rotate-y-180",
                    "flex flex-col items-center justify-center text-center overflow-auto",
                    isFlipped ? "border-primary/30" : "border-transparent"
                  )}>
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {currentCard?.back}
                    </p>
                  </div>
                </div>

                {/* Rating Buttons - Only show when flipped */}
                {isFlipped && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-xs text-center text-muted-foreground">
                      How well did you remember?
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-col h-auto py-3 border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
                        onClick={() => handleReview(1)}
                      >
                        <X className="h-4 w-4 text-destructive mb-1" />
                        <span className="text-xs">Again</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-col h-auto py-3 border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500"
                        onClick={() => handleReview(2)}
                      >
                        <span className="text-orange-500 text-lg mb-1">😕</span>
                        <span className="text-xs">Hard</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-col h-auto py-3 border-primary/30 hover:bg-primary/10 hover:border-primary"
                        onClick={() => handleReview(4)}
                      >
                        <span className="text-primary text-lg mb-1">😊</span>
                        <span className="text-xs">Good</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-col h-auto py-3 border-green-500/30 hover:bg-green-500/10 hover:border-green-500"
                        onClick={() => handleReview(5)}
                      >
                        <Check className="h-4 w-4 text-green-500 mb-1" />
                        <span className="text-xs">Easy</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCurrentCardIndex(prev => Math.max(0, prev - 1));
                      setIsFlipped(false);
                    }}
                    disabled={currentCardIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCurrentCardIndex(prev => Math.min(dueCards.length - 1, prev + 1));
                      setIsFlipped(false);
                    }}
                    disabled={currentCardIndex === dueCards.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* All Cards Tab */}
          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[calc(100vh-250px)]">
              {flashcards.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No flashcards yet</p>
                  <p className="text-sm mt-1">Create your first flashcard to start learning</p>
                </div>
              ) : (
                <div className="space-y-3 pr-4">
                  {flashcards.map(card => (
                    <div
                      key={card.id}
                      className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {card.category}
                            </Badge>
                            {card.isDue && (
                              <Badge variant="destructive" className="text-xs">
                                Due
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-sm line-clamp-2">{card.front}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {card.back}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteFlashcard(card.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Create Tab */}
          <TabsContent value="create" className="mt-4 space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Question (Front)</label>
                <Input
                  placeholder="What is the formula for kinetic energy?"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Answer (Back)</label>
                <Textarea
                  placeholder="KE = ½mv²"
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <Input
                  placeholder="Physics, Math, etc."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleCreate}
                disabled={!newFront.trim() || !newBack.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Flashcard
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
