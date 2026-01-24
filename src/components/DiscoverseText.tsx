import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface DiscoverseTextProps {
  size?: "sm" | "md" | "lg" | "xl";
  showVersion?: boolean;
  className?: string;
}

const DiscoverseText = forwardRef<HTMLDivElement, DiscoverseTextProps>(
  ({ size = "md", showVersion = false, className }, ref) => {
    const sizeClasses = {
      sm: "text-lg font-semibold",
      md: "text-xl font-semibold",
      lg: "text-2xl font-bold",
      xl: "text-3xl font-bold",
    };

    return (
      <div ref={ref} className={cn("flex items-center gap-1.5", className)}>
        <span className={cn(
          sizeClasses[size],
          "bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent"
        )}>
          Discoverse
        </span>
        {showVersion && (
          <span className="text-xs text-muted-foreground/60 mt-1">0.1</span>
        )}
      </div>
    );
  }
);

DiscoverseText.displayName = "DiscoverseText";

export default DiscoverseText;
