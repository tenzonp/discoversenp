import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Share2, 
  Award,
  Calendar,
  Star
} from "lucide-react";
import { toast } from "sonner";

interface IELTSCertificateProps {
  userName: string;
  bandScore: number;
  date: Date;
  sessionId?: string;
  scores?: {
    fluency: number;
    vocabulary: number;
    grammar: number;
    pronunciation: number;
  };
  onClose?: () => void;
}

export default function IELTSCertificate({
  userName,
  bandScore,
  date,
  sessionId,
  scores,
  onClose,
}: IELTSCertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = useCallback(async () => {
    if (!certificateRef.current) return;

    try {
      // Use html2canvas dynamically
      const html2canvas = (await import("html2canvas")).default;
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `IELTS-Certificate-${bandScore}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("Certificate downloaded!");
    } catch (err) {
      console.error("Error generating certificate:", err);
      toast.error("Failed to download certificate");
    }
  }, [bandScore]);

  const shareCertificate = useCallback(async () => {
    const shareText = `🎯 I just scored Band ${bandScore} in IELTS Speaking practice on Discoverse AI! 

💪 Fluency: ${scores?.fluency || 0}%
📚 Vocabulary: ${scores?.vocabulary || 0}%
✍️ Grammar: ${scores?.grammar || 0}%
🎯 Pronunciation: ${scores?.pronunciation || 0}%

Practice with me at discoverse.ai 🚀`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My IELTS Practice Score",
          text: shareText,
          url: "https://discoverseai.lovable.app",
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          navigator.clipboard.writeText(shareText);
          toast.success("Copied to clipboard!");
        }
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Copied to clipboard!");
    }
  }, [bandScore, scores]);

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-orange-500";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 8) return "Exceptional Performance!";
    if (score >= 7) return "Excellent Work!";
    if (score >= 6) return "Good Progress!";
    if (score >= 5) return "Keep Practicing!";
    return "You're Learning!";
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-lg w-full space-y-4">
        {/* Certificate */}
        <div
          ref={certificateRef}
          className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-2xl p-6 border-2 border-primary/30 shadow-xl overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          
          {/* Header */}
          <div className="relative text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Award className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              IELTS Speaking
            </h2>
            <p className="text-sm text-muted-foreground">Practice Achievement Certificate</p>
          </div>

          {/* Main Score */}
          <div className="relative text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-foreground">{bandScore}</p>
                <p className="text-xs text-primary-foreground/80">Band Score</p>
              </div>
            </div>
            <p className={`mt-3 text-lg font-semibold ${getScoreColor(bandScore)}`}>
              {getScoreMessage(bandScore)}
            </p>
          </div>

          {/* Recipient */}
          <div className="relative text-center mb-6">
            <p className="text-sm text-muted-foreground">Awarded to</p>
            <p className="text-xl font-semibold">{userName || "Learner"}</p>
          </div>

          {/* Skill Breakdown */}
          {scores && (
            <div className="relative grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Fluency", value: scores.fluency, icon: "🗣️" },
                { label: "Vocabulary", value: scores.vocabulary, icon: "📚" },
                { label: "Grammar", value: scores.grammar, icon: "✍️" },
                { label: "Pronunciation", value: scores.pronunciation, icon: "🎯" },
              ].map((skill) => (
                <div
                  key={skill.label}
                  className="p-3 rounded-xl bg-muted/50 text-center"
                >
                  <span className="text-lg">{skill.icon}</span>
                  <p className="text-xs text-muted-foreground">{skill.label}</p>
                  <p className="font-semibold">{skill.value}%</p>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="relative flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              Discoverse AI
            </div>
          </div>

          {/* Watermark */}
          <div className="absolute bottom-2 right-2 opacity-30">
            <p className="text-[8px] font-mono">ID: {sessionId?.slice(0, 8) || "PRACTICE"}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={downloadCertificate}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={shareCertificate}
            className="flex-1"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {onClose && (
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
