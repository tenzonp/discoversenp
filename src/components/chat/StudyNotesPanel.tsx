import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Trash2, Calendar, Tag, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface StudyNote {
  id: string;
  title: string;
  content: string;
  subject: string | null;
  class_level: string | null;
  tags: string[] | null;
  created_at: string;
}

interface StudyNotesPanelProps {
  userId: string | undefined;
  trigger?: React.ReactNode;
  onInsertToChat?: (content: string) => void;
}

export function StudyNotesPanel({ userId, trigger, onInsertToChat }: StudyNotesPanelProps) {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const subjects = ['Math', 'Physics', 'Chemistry', 'Science', 'English', 'Social', 'Account', 'Economics'];

  const loadNotes = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('study_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (selectedSubject) {
        query = query.eq('subject', selectedSubject);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      loadNotes();
    }
  }, [isOpen, userId, selectedSubject]);

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('study_notes')
        .delete()
        .eq('id', noteId);
      
      if (error) throw error;
      
      setNotes(prev => prev.filter(n => n.id !== noteId));
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const filteredNotes = notes.filter(note => 
    searchQuery === '' || 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUseInChat = (note: StudyNote) => {
    if (onInsertToChat) {
      onInsertToChat(`Based on my saved note "${note.title}":\n\n${note.content}`);
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Study Notes
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            My Study Notes
            <Badge variant="secondary" className="ml-2">{notes.length}</Badge>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Subject Filter */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedSubject === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedSubject(null)}
            >
              All
            </Badge>
            {subjects.map(subject => (
              <Badge
                key={subject}
                variant={selectedSubject === subject ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedSubject(subject)}
              >
                {subject}
              </Badge>
            ))}
          </div>

          {/* Notes List */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No notes saved yet</p>
                <p className="text-sm mt-1">Save AI explanations by clicking the bookmark icon on messages</p>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {filteredNotes.map(note => (
                  <div
                    key={note.id}
                    className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">{note.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                          {note.content}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {note.subject && (
                            <Badge variant="secondary" className="text-xs">
                              {note.subject}
                            </Badge>
                          )}
                          {note.class_level && (
                            <Badge variant="outline" className="text-xs">
                              {note.class_level}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(note.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>

                        {note.tags && note.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            {note.tags.map((tag, idx) => (
                              <span key={idx} className="text-xs text-muted-foreground">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    
                    {onInsertToChat && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 text-xs"
                        onClick={() => handleUseInChat(note)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Use in Chat
                      </Button>
                    )}
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
