import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Download, Trash2, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface GeneratedImage {
  id: string;
  image_url: string | null;
  prompt: string | null;
  generated_at: string;
}

interface ImageGalleryProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageGallery = ({ userId, isOpen, onClose }: ImageGalleryProps) => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchImages();
    }
  }, [isOpen, userId]);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("image_generation_usage")
      .select("*")
      .eq("user_id", userId)
      .order("generated_at", { ascending: false });

    if (error) {
      console.error("Error fetching images:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load images",
      });
    } else {
      setImages(data || []);
    }
    setLoading(false);
  };

  const handleDownload = async (imageUrl: string, prompt: string | null) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `discoverse-${prompt?.slice(0, 20).replace(/\s/g, "-") || "image"}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded! 📥",
        description: "Image saved to your device",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not download image",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("image_generation_usage")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete image",
      });
    } else {
      setImages((prev) => prev.filter((img) => img.id !== id));
      setSelectedImage(null);
      toast({
        title: "Deleted",
        description: "Image removed from gallery",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-foreground">Your Creations</h2>
              <p className="text-xs text-muted-foreground">{images.length} images generated</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-5 py-6 pb-24 overflow-y-auto h-[calc(100vh-80px)]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No images yet</h3>
            <p className="text-sm text-muted-foreground">
              Generate your first image by asking Discoverse!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-muted/30 cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => setSelectedImage(image)}
              >
                {image.image_url ? (
                  <img
                    src={image.image_url}
                    alt={image.prompt || "Generated image"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs text-white/90 line-clamp-2 mb-1">
                      {image.prompt || "No prompt"}
                    </p>
                    <p className="text-[10px] text-white/60 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(image.generated_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-card rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative">
              {selectedImage.image_url && (
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.prompt || "Generated image"}
                  className="w-full max-h-[60vh] object-contain bg-black"
                />
              )}
              
              {/* Close button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Details */}
            <div className="p-5">
              <p className="text-sm text-foreground mb-2">
                {selectedImage.prompt || "No prompt available"}
              </p>
              <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(selectedImage.generated_at), "MMMM d, yyyy 'at' h:mm a")}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => selectedImage.image_url && handleDownload(selectedImage.image_url, selectedImage.prompt)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Download</span>
                </button>
                <button
                  onClick={() => handleDelete(selectedImage.id)}
                  className="p-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
