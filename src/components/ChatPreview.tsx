import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const sampleConversation: Message[] = [
  { role: "user", content: "Namaste Bhote! K xa khabar?" },
  { role: "assistant", content: "Namaste bro! 😄 Sanchai xu, timro kura sun. K help chahinxa aaja?" },
  { role: "user", content: "Loksewa exam ko lagi tips deu na" },
  { role: "assistant", content: "La bujheu! Loksewa ko lagi:\n\n1️⃣ Samvidhan ra current affairs focus gar\n2️⃣ Daily 2-3 hours padh\n3️⃣ Mock test dinai gar\n\nKun subject weak lagxa? Teibata start garaum! 💪" },
];

const ChatPreview = () => {
  const [messages] = useState<Message[]>(sampleConversation);
  const [inputValue, setInputValue] = useState("");

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Section header */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            <span className="gradient-text">Try Bhote AI</span> अहिले
          </h2>
          <p className="text-lg text-muted-foreground">
            Yo ho hamro conversation style — friendly, helpful, ani Nepali! 🇳🇵
          </p>
        </div>

        {/* Chat window */}
        <div className="bg-card rounded-3xl border-2 border-border shadow-card overflow-hidden">
          {/* Chat header */}
          <div className="gradient-bg px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">Bhote AI</h3>
              <p className="text-xs text-primary-foreground/80">Always online for you ✨</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-primary-foreground/80">Live</span>
            </div>
          </div>

          {/* Messages */}
          <div className="p-6 space-y-4 min-h-[320px] bg-muted/20">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                } animate-fade-in`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-secondary text-secondary-foreground rounded-tr-sm"
                      : "bg-card border border-border rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message... (k sodhna man xa?)"
                className="flex-1 px-4 py-3 rounded-xl bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              <Button variant="chat" size="icon" className="h-11 w-11">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          💡 Yo demo ho — full experience ko lagi app use gara!
        </p>
      </div>
    </section>
  );
};

export default ChatPreview;
