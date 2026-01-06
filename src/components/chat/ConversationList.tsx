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
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h2 className="font-semibold text-lg">Chat History</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-border/50">
          <Button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full h-12 rounded-xl bg-gradient-hero text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`relative group p-4 rounded-xl border transition-all ${
                  currentConversationId === conv.id
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card border-border/50 hover:border-primary/30"
                }`}
              >
                <button
                  onClick={() => {
                    onSelect(conv.id);
                    onClose();
                  }}
                  className="w-full text-left"
                >
                  <p className="font-medium text-sm truncate pr-8">{conv.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive"
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
