import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GraduationCap, BookOpen, Calculator, FlaskConical, Globe, X, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ExamClass = "8" | "9" | "10" | "11" | "12" | null;
export type ExamSubject = "math" | "science" | "english" | "social" | "all";

interface ExamClassSelectorProps {
  selectedClass: ExamClass;
  selectedSubject: ExamSubject;
  onClassChange: (classLevel: ExamClass) => void;
  onSubjectChange: (subject: ExamSubject) => void;
  onClose: () => void;
}

const classLevels: { id: ExamClass; label: string; description: string }[] = [
  { id: "8", label: "Class 8", description: "Basic Foundation" },
  { id: "9", label: "Class 9", description: "SEE Prep Start" },
  { id: "10", label: "Class 10", description: "SEE Final" },
  { id: "11", label: "Class 11", description: "+2 First Year" },
  { id: "12", label: "Class 12", description: "+2 Final Year" },
];

const subjects: { id: ExamSubject; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All Subjects", icon: <BookOpen className="w-4 h-4" /> },
  { id: "math", label: "Mathematics", icon: <Calculator className="w-4 h-4" /> },
  { id: "science", label: "Science", icon: <FlaskConical className="w-4 h-4" /> },
  { id: "english", label: "English", icon: <Globe className="w-4 h-4" /> },
  { id: "social", label: "Social Studies", icon: <GraduationCap className="w-4 h-4" /> },
];

const ExamClassSelector = ({
  selectedClass,
  selectedSubject,
  onClassChange,
  onSubjectChange,
  onClose,
}: ExamClassSelectorProps) => {
  const [tempClass, setTempClass] = useState<ExamClass>(selectedClass);
  const [tempSubject, setTempSubject] = useState<ExamSubject>(selectedSubject);
  const [step, setStep] = useState<"class" | "subject">("class");

  useEffect(() => {
    setTempClass(selectedClass);
    setTempSubject(selectedSubject);
  }, [selectedClass, selectedSubject]);

  const handleConfirm = () => {
    onClassChange(tempClass);
    onSubjectChange(tempSubject);
    onClose();
  };

  const handleClassSelect = (classId: ExamClass) => {
    setTempClass(classId);
    setStep("subject");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="w-full max-w-md mx-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Exam Study Mode</h3>
              <p className="text-xs text-muted-foreground">
                {step === "class" ? "Select your class level" : "Choose focus subject"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 px-4 pt-4">
          <div className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            step === "class" ? "bg-primary" : "bg-primary/30"
          )} />
          <div className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            step === "subject" ? "bg-primary" : "bg-muted"
          )} />
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {step === "class" ? (
            <>
              <p className="text-sm text-muted-foreground text-center mb-4">
                I'll tailor web search results to your exact curriculum level
              </p>
              <div className="grid grid-cols-1 gap-2">
                {classLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleClassSelect(level.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      tempClass === level.id
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                        tempClass === level.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {level.id}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{level.label}</p>
                        <p className="text-xs text-muted-foreground">{level.description}</p>
                      </div>
                    </div>
                    {tempClass === level.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setStep("class")}
                  className="text-sm text-primary hover:underline"
                >
                  ← Change class
                </button>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Class {tempClass}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setTempSubject(subject.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      tempSubject === subject.id
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        tempSubject === subject.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {subject.icon}
                      </div>
                      <p className="font-medium">{subject.label}</p>
                    </div>
                    {tempSubject === subject.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              {/* Confirm Button */}
              <Button
                onClick={handleConfirm}
                disabled={!tempClass}
                className="w-full mt-4 h-12 rounded-xl text-base font-medium gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Start Focused Study
              </Button>
            </>
          )}
        </div>

        {/* Features */}
        <div className="px-4 pb-4">
          <div className="bg-muted/50 rounded-xl p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">✨ Exam Mode Features:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Real-time web search for curriculum-specific content</li>
              <li>• Step-by-step Math & Science solutions</li>
              <li>• Nepal Board SEE/+2 focused answers</li>
              <li>• Practice questions & explanations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamClassSelector;
