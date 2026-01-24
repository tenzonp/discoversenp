import { Heart, MapPin } from "lucide-react";
import discoververseLogo from "@/assets/discoverse-logo.png";

const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & tagline */}
          <div className="flex items-center gap-3">
            <img 
              src={discoververseLogo} 
              alt="Discoverse" 
              className="h-8 w-auto"
            />
            <div>
              <h3 className="font-bold text-foreground">Discoverse</h3>
              <p className="text-xs text-muted-foreground">Nepal's Own AI</p>
            </div>
          </div>

          {/* Center text */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
              Made with <Heart className="w-4 h-4 text-primary fill-primary" /> in Nepal
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-center">
              <MapPin className="w-3 h-3" /> Tulsipur, Dang
            </p>
          </div>

          {/* Founder */}
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Nishan Bhusal</p>
            <p className="text-xs text-muted-foreground">Founder & CEO</p>
          </div>
        </div>

        {/* Bottom text */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 Discoverse. All rights reserved. 🇳🇵
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;