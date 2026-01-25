import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Shield, Users, AlertTriangle, Scale } from "lucide-react";

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: FileText,
      title: "1. Acceptance of Terms",
      content: `By accessing or using Discoverse ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.

Discoverse is an AI-powered educational and conversational platform designed primarily for users in Nepal. By using our Service, you confirm that you are at least 13 years of age.`
    },
    {
      icon: Users,
      title: "2. User Accounts",
      content: `• You are responsible for maintaining the confidentiality of your account credentials
• You agree to provide accurate and complete information during registration
• You are responsible for all activities that occur under your account
• You must notify us immediately of any unauthorized use of your account
• We reserve the right to suspend or terminate accounts that violate these terms`
    },
    {
      icon: Shield,
      title: "3. Acceptable Use",
      content: `You agree NOT to use Discoverse to:
• Generate or distribute harmful, illegal, or offensive content
• Harass, bully, or intimidate other users
• Attempt to bypass safety measures or usage limits
• Use the service for commercial purposes without permission
• Share your account with others or create multiple accounts
• Attempt to reverse engineer or hack the platform
• Spread misinformation or fake educational content`
    },
    {
      icon: Scale,
      title: "4. AI-Generated Content",
      content: `• Discoverse uses AI to generate responses and educational content
• AI responses are meant to assist, not replace professional advice
• We do not guarantee the accuracy of AI-generated content
• For medical, legal, or financial matters, consult appropriate professionals
• IELTS scores are estimates and may not reflect actual exam performance
• Educational content follows Nepal Board curriculum but should be verified`
    },
    {
      icon: AlertTriangle,
      title: "5. Limitations & Disclaimers",
      content: `THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.

• We are not liable for any damages arising from use of the Service
• We do not guarantee uninterrupted or error-free service
• Usage limits (messages, voice minutes) are subject to change
• Subscription prices may be updated with prior notice
• We reserve the right to modify or discontinue features

For Pro subscriptions purchased via eSewa:
• Payments are processed manually within 24 hours
• Refunds are handled on a case-by-case basis
• Contact support for payment-related issues`
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
            <h1 className="font-semibold">Terms of Service</h1>
            <p className="text-xs text-muted-foreground">Last updated: January 2026</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Discoverse Terms</h2>
          <p className="text-muted-foreground text-sm">
            Please read these terms carefully before using our service
          </p>
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
              <p className="text-muted-foreground text-sm whitespace-pre-line leading-relaxed">
                {section.content}
              </p>
            </div>
          </section>
        ))}

        {/* Contact */}
        <div className="p-6 rounded-2xl bg-muted/50 text-center">
          <h3 className="font-semibold mb-2">Questions?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Contact us for any questions about these terms
          </p>
          <Button
            variant="outline"
            onClick={() => window.open("mailto:support@discoverse.com.np", "_blank")}
          >
            Contact Support
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          <p>© 2026 Discoverse. Made with ❤️ in Nepal</p>
        </div>
      </main>
    </div>
  );
};

export default Terms;
