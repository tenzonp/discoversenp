import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeCardProps {
  icon: LucideIcon;
  title: string;
  nepaliTitle: string;
  description: string;
  features: string[];
  color: "saffron" | "teal" | "accent" | "secondary";
  delay?: number;
}

const colorVariants = {
  saffron: "hover:border-primary group-hover:text-primary bg-primary/5",
  teal: "hover:border-secondary group-hover:text-secondary bg-secondary/5",
  accent: "hover:border-accent group-hover:text-accent bg-accent/5",
  secondary: "hover:border-teal-400 group-hover:text-teal-400 bg-teal-500/5",
};

const iconVariants = {
  saffron: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  teal: "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground",
  accent: "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground",
  secondary: "bg-teal-500/10 text-teal-500 group-hover:bg-teal-500 group-hover:text-white",
};

const ModeCard = ({ icon: Icon, title, nepaliTitle, description, features, color, delay = 0 }: ModeCardProps) => {
  return (
    <div 
      className={cn(
        "group relative p-6 rounded-2xl border-2 border-border bg-card transition-all duration-500 cursor-pointer",
        "hover:shadow-card hover:-translate-y-2",
        colorVariants[color],
        "animate-slide-up"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon */}
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
        iconVariants[color]
      )}>
        <Icon className="w-7 h-7" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{nepaliTitle}</p>

      {/* Description */}
      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{description}</p>

      {/* Features */}
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Hover arrow */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </div>
  );
};

export default ModeCard;
