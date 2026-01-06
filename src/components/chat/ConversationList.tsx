import { Conversation } from "@/hooks/useChatHistory";
import { Button } from "@/components/ui/button";
import { MessageCircle, Trash2, Plus, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}

export const ConversationList = ({
  conversations,
  currentConversationId,
  onSelect,
  onDelete,
  onNewChat,
  onClose,
}: ConversationListProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex flex-col h-full max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">History</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* New Chat */}
        <div className="p-4">
          <Button
            onClick={() => { onNewChat(); onClose(); }}
            className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                  currentConversationId === conv.id
                    ? "bg-secondary"
                    : "hover:bg-secondary/50"
                }`}
                onClick={() => { onSelect(conv.id); onClose(); }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};