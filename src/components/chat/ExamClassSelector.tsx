import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  GraduationCap, BookOpen, Calculator, FlaskConical, Globe, X, Check, Sparkles,
  Laptop, Microscope, TrendingUp, Atom, Brain, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type ExamClass = "8" | "9" | "10" | "11" | "12" | null;
export type ExamStream = "science" | "management" | null;
export type ExamGroup = "computer" | "biology" | null;
export type ExamSubject = "math" | "physics" | "chemistry" | "biology" | "computer" | "english" | "nepali" | "social" | "accountancy" | "economics" | "all";

interface ExamClassSelectorProps {
  selectedClass: ExamClass;
  selectedStream: ExamStream;
  selectedGroup: ExamGroup;
  selectedSubject: ExamSubject;
  onClassChange: (classLevel: ExamClass) => void;
  onStreamChange: (stream: ExamStream) => void;
  onGroupChange: (group: ExamGroup) => void;
  onSubjectChange: (subject: ExamSubject) => void;
  onClose: () => void;
}

const classLevels: { id: ExamClass; label: string; description: string }[] = [
  { id: "8", label: "Class 8", description: "Basic Foundation" },
  { id: "9", label: "Class 9", description: "SEE Prep Start" },
  { id: "10", label: "Class 10", description: "SEE Final Year" },
  { id: "11", label: "Class 11", description: "+2 First Year" },
  { id: "12", label: "Class 12", description: "+2 Final Year" },
];

const streams: { id: ExamStream; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "science", label: "Science", icon: <FlaskConical className="w-5 h-5" />, description: "Physics, Chemistry, Math" },
  { id: "management", label: "Management", icon: <TrendingUp className="w-5 h-5" />, description: "Accountancy, Economics" },
];

const groups: { id: ExamGroup; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "computer", label: "Computer Science", icon: <Laptop className="w-5 h-5" />, description: "Programming & IT" },
  { id: "biology", label: "Biology", icon: <Microscope className="w-5 h-5" />, description: "Medical Science" },
];

const getSubjects = (classLevel: ExamClass, stream: ExamStream, group: ExamGroup) => {
  const classNum = classLevel ? parseInt(classLevel) : 10;
  
  // Class 8-10: General subjects
  if (classNum <= 10) {
    return [
      { id: "all" as ExamSubject, label: "All Subjects", icon: <BookOpen className="w-4 h-4" />, highlight: false },
      { id: "math" as ExamSubject, label: "Mathematics", icon: <Calculator className="w-4 h-4" />, highlight: true },
      { id: "physics" as ExamSubject, label: "Science (Physics)", icon: <Atom className="w-4 h-4" />, highlight: true },
      { id: "chemistry" as ExamSubject, label: "Science (Chemistry)", icon: <FlaskConical className="w-4 h-4" />, highlight: true },
      { id: "english" as ExamSubject, label: "English", icon: <Globe className="w-4 h-4" />, highlight: false },
      { id: "social" as ExamSubject, label: "Social Studies", icon: <GraduationCap className="w-4 h-4" />, highlight: false },
    ];
  }
  
  // Class 11-12 Science
  if (stream === "science") {
    const subjects = [
      { id: "all" as ExamSubject, label: "All Subjects", icon: <BookOpen className="w-4 h-4" />, highlight: false },
      { id: "math" as ExamSubject, label: "Mathematics", icon: <Calculator className="w-4 h-4" />, highlight: true },
      { id: "physics" as ExamSubject, label: "Physics", icon: <Atom className="w-4 h-4" />, highlight: true },
      { id: "chemistry" as ExamSubject, label: "Chemistry", icon: <FlaskConical className="w-4 h-4" />, highlight: true },
    ];
    
    if (group === "biology") {
      subjects.push({ id: "biology" as ExamSubject, label: "Biology", icon: <Microscope className="w-4 h-4" />, highlight: true });
    } else if (group === "computer") {
      subjects.push({ id: "computer" as ExamSubject, label: "Computer Science", icon: <Laptop className="w-4 h-4" />, highlight: true });
    }
    
    subjects.push({ id: "english" as ExamSubject, label: "English", icon: <Globe className="w-4 h-4" />, highlight: false });
    return subjects;
  }
  
  // Class 11-12 Management
  if (stream === "management") {
    return [
      { id: "all" as ExamSubject, label: "All Subjects", icon: <BookOpen className="w-4 h-4" />, highlight: false },
      { id: "accountancy" as ExamSubject, label: "Accountancy", icon: <Calculator className="w-4 h-4" />, highlight: true },
      { id: "economics" as ExamSubject, label: "Economics", icon: <TrendingUp className="w-4 h-4" />, highlight: true },
      { id: "math" as ExamSubject, label: "Business Math", icon: <Calculator className="w-4 h-4" />, highlight: true },
      { id: "english" as ExamSubject, label: "English", icon: <Globe className="w-4 h-4" />, highlight: false },
    ];
  }
  
  return [
    { id: "all" as ExamSubject, label: "All Subjects", icon: <BookOpen className="w-4 h-4" />, highlight: false },
  ];
};

type Step = "class" | "stream" | "group" | "subject";

const ExamClassSelector = ({
  selectedClass,
  selectedStream,
  selectedGroup,
  selectedSubject,
  onClassChange,
  onStreamChange,
  onGroupChange,
  onSubjectChange,
  onClose,
}: ExamClassSelectorProps) => {
  const [tempClass, setTempClass] = useState<ExamClass>(selectedClass);
  const [tempStream, setTempStream] = useState<ExamStream>(selectedStream);
  const [tempGroup, setTempGroup] = useState<ExamGroup>(selectedGroup);
  const [tempSubject, setTempSubject] = useState<ExamSubject>(selectedSubject);
  const [step, setStep] = useState<Step>("class");

  const classNum = tempClass ? parseInt(tempClass) : 0;
  const needsStream = classNum >= 11;
  const needsGroup = needsStream && tempStream === "science";

  useEffect(() => {
    setTempClass(selectedClass);
    setTempStream(selectedStream);
    setTempGroup(selectedGroup);
    setTempSubject(selectedSubject);
  }, [selectedClass, selectedStream, selectedGroup, selectedSubject]);

  const handleConfirm = () => {
    onClassChange(tempClass);
    onStreamChange(tempStream);
    onGroupChange(tempGroup);
    onSubjectChange(tempSubject);
    onClose();
  };

  const handleClassSelect = (classId: ExamClass) => {
    setTempClass(classId);
    const num = classId ? parseInt(classId) : 0;
    if (num >= 11) {
      setStep("stream");
    } else {
      setTempStream(null);
      setTempGroup(null);
      setStep("subject");
    }
  };

  const handleStreamSelect = (streamId: ExamStream) => {
    setTempStream(streamId);
    if (streamId === "science") {
      setStep("group");
    } else {
      setTempGroup(null);
      setStep("subject");
    }
  };

  const handleGroupSelect = (groupId: ExamGroup) => {
    setTempGroup(groupId);
    setStep("subject");
  };

  const getSteps = (): Step[] => {
    const steps: Step[] = ["class"];
    if (needsStream) steps.push("stream");
    if (needsGroup) steps.push("group");
    steps.push("subject");
    return steps;
  };

  const currentStepIndex = getSteps().indexOf(step);
  const totalSteps = getSteps().length;

  const subjects = getSubjects(tempClass, tempStream, tempGroup);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="w-full max-w-md mx-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Exam Study Mode</h3>
              <p className="text-xs text-muted-foreground">
                {step === "class" && "Select your class"}
                {step === "stream" && "Choose your stream"}
                {step === "group" && "Select subject group"}
                {step === "subject" && "Pick focus subject"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-1.5 px-4 pt-4 shrink-0">
          {getSteps().map((s, i) => (
            <div key={s} className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i <= currentStepIndex ? "bg-primary" : "bg-muted"
            )} />
          ))}
        </div>

        {/* Breadcrumb */}
        {step !== "class" && (
          <div className="px-4 pt-3 flex items-center gap-1 text-xs text-muted-foreground shrink-0 flex-wrap">
            <button onClick={() => setStep("class")} className="hover:text-foreground">
              Class {tempClass}
            </button>
            {tempStream && step !== "stream" && (
              <>
                <ChevronRight className="w-3 h-3" />
                <button onClick={() => setStep("stream")} className="hover:text-foreground capitalize">
                  {tempStream}
                </button>
              </>
            )}
            {tempGroup && step !== "group" && step !== "stream" && (
              <>
                <ChevronRight className="w-3 h-3" />
                <button onClick={() => setStep("group")} className="hover:text-foreground capitalize">
                  {tempGroup}
                </button>
              </>
            )}
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* Class Selection */}
          {step === "class" && (
            <>
              <p className="text-sm text-muted-foreground text-center mb-3">
                📚 Super focused study with real-time web search
              </p>
              <div className="grid grid-cols-1 gap-2">
                {classLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleClassSelect(level.id)}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-xl border transition-all",
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
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Stream Selection (Class 11-12) */}
          {step === "stream" && (
            <>
              <p className="text-sm text-muted-foreground text-center mb-3">
                Choose your +2 stream
              </p>
              <div className="grid grid-cols-1 gap-3">
                {streams.map((stream) => (
                  <button
                    key={stream.id}
                    onClick={() => handleStreamSelect(stream.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      tempStream === stream.id
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        tempStream === stream.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {stream.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-lg">{stream.label}</p>
                        <p className="text-sm text-muted-foreground">{stream.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Group Selection (Science Stream) */}
          {step === "group" && (
            <>
              <p className="text-sm text-muted-foreground text-center mb-3">
                Select your subject group
              </p>
              <div className="grid grid-cols-1 gap-3">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleGroupSelect(group.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      tempGroup === group.id
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        tempGroup === group.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {group.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-lg">{group.label}</p>
                        <p className="text-sm text-muted-foreground">{group.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Subject Selection */}
          {step === "subject" && (
            <>
              <div className="grid grid-cols-1 gap-2">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setTempSubject(subject.id)}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-xl border transition-all",
                      tempSubject === subject.id
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-muted/50",
                      subject.highlight && "ring-1 ring-amber-500/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        tempSubject === subject.id
                          ? "bg-primary text-primary-foreground"
                          : subject.highlight
                          ? "bg-amber-500/20 text-amber-600"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {subject.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-medium flex items-center gap-2">
                          {subject.label}
                          {subject.highlight && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 font-medium">
                              🔥 Pro Solver
                            </span>
                          )}
                        </p>
                      </div>
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
                Start Super Study
              </Button>
            </>
          )}
        </div>

        {/* Features Footer */}
        <div className="px-4 pb-4 shrink-0">
          <div className="bg-gradient-to-r from-amber-500/10 to-primary/10 rounded-xl p-3 border border-amber-500/20">
            <p className="text-xs font-semibold text-amber-600 mb-1.5">🧠 AI Problem Solver Features:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <span className="text-amber-600 font-medium">Math:</span> Step-by-step solutions with formulas</li>
              <li>• <span className="text-amber-600 font-medium">Physics:</span> Diagrams, derivations & numericals</li>
              <li>• <span className="text-amber-600 font-medium">Chemistry:</span> Reactions, mechanisms & balancing</li>
              <li>• <span className="text-amber-600 font-medium">Real-time:</span> Web search for accurate answers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamClassSelector;
