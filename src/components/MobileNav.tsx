import { useLocation, useNavigate } from "react-router-dom";
import { Home, MessageCircle, BookOpen, Languages, GraduationCap, User, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "होम", path: "/" },
  { icon: MessageCircle, label: "च्याट", path: "/chat" },
  { icon: BookOpen, label: "लोकसेवा", path: "/loksewa" },
  { icon: Layers, label: "फ्ल्यासकार्ड", path: "/flashcards" },
  { icon: User, label: "प्रोफाइल", path: "/profile" },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "animate-pulse-soft")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
