import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-8 px-6 text-center space-y-3">
      <div className="flex items-center justify-center gap-4 text-xs">
        <Link 
          to="/terms" 
          className="text-muted-foreground/70 hover:text-foreground transition-colors"
        >
          Terms
        </Link>
        <span className="text-muted-foreground/30">•</span>
        <Link 
          to="/privacy" 
          className="text-muted-foreground/70 hover:text-foreground transition-colors"
        >
          Privacy
        </Link>
        <span className="text-muted-foreground/30">•</span>
        <Link 
          to="/about" 
          className="text-muted-foreground/70 hover:text-foreground transition-colors"
        >
          About
        </Link>
      </div>
      <p className="text-xs text-muted-foreground/50">
        © 2026 Discoverse • Made in Nepal 🇳🇵
      </p>
    </footer>
  );
};

export default Footer;
