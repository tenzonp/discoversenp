import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Database, Eye, Lock, Trash2, Globe } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Database,
      title: "1. Information We Collect",
      content: `We collect the following types of information:

**Account Information:**
• Email address and display name
• Authentication data (encrypted passwords)

**Usage Data:**
• Chat messages and conversation history
• Voice session recordings (for IELTS practice)
• Quiz scores and learning progress
• Study notes and flashcards you create

**Device Information:**
• Browser type and version
• Device type (mobile/desktop)
• IP address (for security purposes)

**Behavioral Data:**
• Mood check-ins and emotional patterns
• Learning preferences and study habits
• Feature usage statistics`
    },
    {
      icon: Eye,
      title: "2. How We Use Your Data",
      content: `We use your information to:

• Provide personalized AI responses based on your learning style
• Track your educational progress and suggest improvements
• Improve our AI models and service quality
• Send important service notifications
• Detect and prevent fraud or abuse
• Comply with legal obligations

**We do NOT:**
• Sell your personal data to third parties
• Share your conversations with other users
• Use your data for targeted advertising
• Access your data without your consent (except for moderation)`
    },
    {
      icon: Lock,
      title: "3. Data Security",
      content: `Your security is our priority:

• All data is encrypted in transit (TLS/SSL)
• Passwords are hashed using industry-standard algorithms
• Database access is restricted and logged
• Regular security audits and updates
• Two-factor authentication available

**AI Processing:**
• Conversations are processed by secure AI models
• Voice data is processed in real-time and not permanently stored
• AI models do not retain personal information between sessions`
    },
    {
      icon: Globe,
      title: "4. Data Storage & Transfer",
      content: `• Data is stored on secure cloud servers
• We use Supabase (backed by AWS) for data storage
• AI processing may occur on servers outside Nepal
• We comply with international data protection standards
• Your data is backed up regularly for disaster recovery`
    },
    {
      icon: Trash2,
      title: "5. Your Rights",
      content: `You have the right to:

**Access:** Request a copy of your personal data
**Correction:** Update or correct your information
**Deletion:** Delete your account and all associated data
**Export:** Download your data in a portable format
**Opt-out:** Disable certain data collection features

To exercise these rights, contact us at support@discoverse.com.np

**Data Retention:**
• Active accounts: Data retained while account is active
• Deleted accounts: Data removed within 30 days
• Legal holds: Some data may be retained for legal compliance`
    },
    {
      icon: Shield,
      title: "6. Children's Privacy",
      content: `• Discoverse is intended for users 13 years and older
• We do not knowingly collect data from children under 13
• Parents/guardians should monitor their children's use
• Contact us immediately if you believe a child's data was collected
• We will delete such data promptly upon verification`
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="safe-area-top sticky top-0 z-10 px-4 py-3 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold">Privacy Policy</h1>
            <p className="text-xs text-muted-foreground">Last updated: January 2026</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your Privacy Matters</h2>
          <p className="text-muted-foreground text-sm">
            We're committed to protecting your personal information
          </p>
        </div>

        {/* Quick Summary */}
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Quick Summary
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Your data is encrypted and secure</li>
            <li>✓ We don't sell your information</li>
            <li>✓ You can delete your data anytime</li>
            <li>✓ AI doesn't store personal conversations</li>
          </ul>
        </div>

        {/* Sections */}
        {sections.map((section, i) => (
          <section key={i} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <section.icon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="font-semibold text-lg">{section.title}</h3>
            </div>
            <div className="pl-[52px]">
              <div className="text-muted-foreground text-sm whitespace-pre-line leading-relaxed prose prose-sm dark:prose-invert">
                {section.content.split('\n').map((line, j) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <p key={j} className="font-semibold text-foreground mt-3 mb-1">
                        {line.replace(/\*\*/g, '')}
                      </p>
                    );
                  }
                  if (line.startsWith('•')) {
                    return <p key={j} className="ml-2">{line}</p>;
                  }
                  return <p key={j}>{line}</p>;
                })}
              </div>
            </div>
          </section>
        ))}

        {/* Contact */}
        <div className="p-6 rounded-2xl bg-muted/50 text-center">
          <h3 className="font-semibold mb-2">Privacy Questions?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Reach out to our privacy team
          </p>
          <Button
            variant="outline"
            onClick={() => window.open("mailto:privacy@discoverse.com.np", "_blank")}
          >
            Contact Privacy Team
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          <p>© 2026 Discoverse. Your data, your control.</p>
          <p className="mt-1">Made with ❤️ in Nepal</p>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
