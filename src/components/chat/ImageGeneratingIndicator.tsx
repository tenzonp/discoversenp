import { Sparkles, Image as ImageIcon } from "lucide-react";

interface ImageGeneratingIndicatorProps {
  remaining?: number | null;
}

const ImageGeneratingIndicator = ({ remaining }: ImageGeneratingIndicatorProps) => {
  return (
    <div className="flex gap-3 justify-start animate-thought-in">
      <div className="thought-other">
        <div className="flex items-center gap-3">
          {/* Animated icon */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-accent animate-pulse" />
            </div>
            <Sparkles className="w-4 h-4 text-primary absolute -top-1 -right-1 animate-bounce" />
          </div>
          
          {/* Text */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                Image generating...
              </span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              ✨ Discoverse AI creating your image
            </span>
          </div>
        </div>
        
        {/* Progress bar animation */}
        <div className="mt-3 h-1 bg-muted/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-accent via-primary to-accent rounded-full animate-shimmer"
            style={{ 
              width: "100%",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
        
        {/* Daily limit info */}
        {remaining !== null && remaining !== undefined && (
          <p className="text-xs text-muted-foreground/60 mt-2">
            🎨 {remaining > 0 ? `${remaining} generations left today` : "Daily limit reached"}
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageGeneratingIndicator;
