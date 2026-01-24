import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ImageIcon, X } from "lucide-react";

interface GeneratedImage {
  id: string;
  image_url: string;
  prompt: string;
  generated_at: string;
}

interface RecentImagesBarProps {
  userId: string;
  onSelectImage: (imageUrl: string, prompt: string) => void;
  className?: string;
}

const RecentImagesBar = ({ userId, onSelectImage, className }: RecentImagesBarProps) => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("image_generation_usage")
        .select("id, image_url, prompt, generated_at")
        .eq("user_id", userId)
        .order("generated_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        setImages(data.filter(img => img.image_url));
      }
      setIsLoading(false);
    };

    if (userId) {
      fetchImages();
    }
  }, [userId]);

  if (isLoading || images.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      {/* Collapsed View - Just a small button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary text-xs text-muted-foreground hover:text-foreground transition-all"
        >
          <ImageIcon className="w-3 h-3" />
          <span>Recent ({images.length})</span>
          <div className="flex -space-x-1">
            {images.slice(0, 3).map((img, i) => (
              <img
                key={img.id}
                src={img.image_url}
                alt=""
                className="w-4 h-4 rounded-full border border-background object-cover"
                style={{ zIndex: 3 - i }}
              />
            ))}
          </div>
        </button>
      )}

      {/* Expanded View - Thumbnails with edit option */}
      {isExpanded && (
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-lg animate-appear">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Tap to re-edit</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-5 h-5 rounded-full hover:bg-muted flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => {
                  onSelectImage(img.image_url, img.prompt || "");
                  setIsExpanded(false);
                }}
                className="flex-shrink-0 group relative"
                title={img.prompt || "Click to edit"}
              >
                <img
                  src={img.image_url}
                  alt={img.prompt || "Generated image"}
                  className="w-14 h-14 rounded-lg object-cover border border-border/50 group-hover:border-primary/50 transition-all"
                />
                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] text-white font-medium">Edit</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentImagesBar;
