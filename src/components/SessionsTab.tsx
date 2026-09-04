import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Play, Pause, RotateCcw, Check, Lock, X, ChevronRight, ChevronLeft, Heart, Volume2, VolumeX } from "lucide-react";
import { GuidedSession, UserProfile } from "../types";
import { GUIDED_SESSIONS } from "../data/sessionsData";
import { StorageService } from "../utils/storage";

interface SessionsTabProps {
  user: UserProfile;
  onSessionCompleted: (sessionId: string) => void;
  onOpenPaywall: () => void;
}

const ALL_TAGS = ["All", "Anxious", "Overwhelmed", "Tense", "Can't sleep", "Angry", "Lonely", "Relaxing", "Grounding"];

export const SessionsTab: React.FC<SessionsTabProps> = ({
  user,
  onSessionCompleted,
  onOpenPaywall,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [activeSession, setActiveSession] = useState<GuidedSession | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Filtered sessions
  const filteredSessions = GUIDED_SESSIONS.filter((s) => {
    if (selectedTag === "All") return true;
    return s.tag.toLowerCase() === selectedTag.toLowerCase();
  });

  const handleStartSession = (session: GuidedSession) => {
    if (!session.isFree && !user.isPlus) {
      onOpenPaywall();
      return;
    }
    setActiveSession(session);
    setCurrentStepIndex(0);
  };

  const handleCompleteActive = async () => {
    if (!activeSession) return;
    await StorageService.completeSession(activeSession.id);
    onSessionCompleted(activeSession.id);
    setActiveSession(null);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto animate-fade-in pb-8">
      {/* If a session is open */}
      {activeSession ? (
        <ActiveSessionViewer
          session={activeSession}
          currentStep={currentStepIndex}
          onNextStep={() => setCurrentStepIndex((prev) => Math.min(prev + 1, activeSession.steps.length - 1))}
          onPrevStep={() => setCurrentStepIndex((prev) => Math.max(prev - 1, 0))}
          onClose={() => setActiveSession(null)}
          onComplete={handleCompleteActive}
        />
      ) : (
        <>
          {/* Header */}
          <div>
            <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#1A1C19]">
              Guided Micro-Sessions
            </h2>
            <p className="text-xs sm:text-sm text-[#414741] mt-1 font-medium">
              3 to 5-minute structured somatic and breathing practices for in-the-moment relief.
            </p>
          </div>

          {/* Tag Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {ALL_TAGS.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border whitespace-nowrap transition-all ${
                    active
                      ? "bg-[#2A5A3B] border-[#2A5A3B] text-white font-bold shadow-xs"
                      : "bg-[#FFFFFF] border-[#DDD6CC] text-[#414741] font-semibold hover:text-[#1A1C19] hover:border-[#BDB3A4]"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Session Cards Grid */}
          <div className="space-y-3">
            {filteredSessions.map((session) => {
              const isLocked = !session.isFree && !user.isPlus;
              const isDone = user.completedSessions.includes(session.id);

              return (
                <div
                  key={session.id}
                  onClick={() => handleStartSession(session)}
                  className={`relative p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer group ${
                    isLocked
                      ? "bg-[#FAF8F5]/90 border-[#DDD6CC] opacity-80 hover:opacity-100"
                      : "bg-[#FFFFFF] border-[#DDD6CC] hover:border-[#2A5A3B] hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${session.tagColor || "bg-[#EAF3EB] text-[#1B4B27] border-[#8DC39A]"}`}>
                          {session.tag}
                        </span>
                        <span className="text-[11px] text-[#5C635C] font-semibold">
                          {session.duration}
                        </span>
                        {isDone && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#EAF3EB] text-[#1B4B27] font-bold border border-[#8DC39A]">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Practiced</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif italic text-lg font-bold text-[#1A1C19] group-hover:text-[#1B4B27] transition-colors">
                        {session.title}
                      </h3>

                      <p className="text-xs text-[#414741] font-medium line-clamp-2 leading-relaxed">
                        {session.summary}
                      </p>
                    </div>

                    {/* Action Icon */}
                    <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2A5A3B] flex-shrink-0 group-hover:bg-[#2A5A3B] group-hover:text-white group-hover:border-[#2A5A3B] transition-all shadow-xs">
                      {isLocked ? (
                        <Lock className="w-4 h-4 text-[#5C635C]" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plus upgrade banner if on free tier */}
          {!user.isPlus && (
            <div className="bg-[#FAF8F5] border-2 border-[#2A5A3B]/30 rounded-3xl p-5 text-center space-y-3 shadow-xs">
              <Sparkles className="w-6 h-6 text-[#2A5A3B] mx-auto" />
              <div>
                <h3 className="font-serif italic text-lg font-bold text-[#1A1C19]">
                  Unlock the Complete 8+ Session Library
                </h3>
                <p className="text-xs text-[#414741] font-medium mt-1">
                  Access 4-7-8 relaxation, 3am sleep loops, loneliness soothing, and anger release exercises with Check-In Plus.
                </p>
              </div>
              <button
                onClick={onOpenPaywall}
                className="py-2.5 px-6 rounded-xl bg-[#2A5A3B] text-white font-bold text-xs hover:bg-[#20472E] transition-all shadow-xs active:scale-95"
              >
                Try 7 Days Free
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ========================================================================= */
/* Active Session Viewer with Interactive Breathing Visualizers               */
/* ========================================================================= */

interface ActiveSessionViewerProps {
  session: GuidedSession;
  currentStep: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onClose: () => void;
  onComplete: () => void;
}

const ActiveSessionViewer: React.FC<ActiveSessionViewerProps> = ({
  session,
  currentStep,
  onNextStep,
  onPrevStep,
  onClose,
  onComplete,
}) => {
  const isLastStep = currentStep === session.steps.length - 1;

  return (
    <div className="bg-[#FFFFFF] border border-[#DDD6CC] rounded-3xl p-6 shadow-md space-y-6 animate-fade-in">
      {/* Header with Close */}
      <div className="flex items-center justify-between pb-3 border-b border-[#DDD6CC]">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EAF3EB] text-[#1B4B27] font-bold border border-[#8DC39A]">
            {session.tag}
          </span>
          <span className="text-xs text-[#414741] font-semibold">{session.duration}</span>
        </div>

        <button
          onClick={onClose}
          aria-label="Close active session"
          className="p-1.5 rounded-full bg-[#FAF8F5] text-[#414741] hover:text-[#1A1C19] border border-[#DDD6CC] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <h2 className="font-serif italic text-2xl font-bold text-[#1A1C19]">
          {session.title}
        </h2>
        <p className="text-xs text-[#414741] font-medium mt-1">{session.summary}</p>
      </div>

      {/* Interactive visual breathing timer if applicable */}
      {session.breathingType === "box" && <BoxBreathingVisualizer />}
      {session.breathingType === "relaxing" && <RelaxingBreathingVisualizer />}

      {/* Step by step card */}
      <div className="bg-[#FAF8F5] border border-[#DDD6CC] rounded-2xl p-5 min-h-[140px] flex flex-col justify-between shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#414741] font-semibold">
            <span>Step {currentStep + 1} of {session.steps.length}</span>
            <div className="flex items-center gap-1.5">
              {session.steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === currentStep ? "w-5 bg-[#2A5A3B]" : i < currentStep ? "w-2 bg-[#8DC39A]" : "w-2 bg-[#DDD6CC]"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#1A1C19] leading-relaxed font-serif italic pt-2 font-medium">
            {session.steps[currentStep]}
          </p>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#DDD6CC]">
          <button
            onClick={onPrevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg border transition-colors ${
              currentStep === 0
                ? "border-transparent text-[#AFA596] cursor-default"
                : "border-[#DDD6CC] text-[#333933] font-semibold hover:text-[#1A1C19] hover:bg-[#EAF3EB]"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {isLastStep ? (
            <button
              onClick={onComplete}
              className="flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl bg-[#2A5A3B] text-white font-bold hover:bg-[#20472E] transition-all shadow-xs active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Complete Practice</span>
            </button>
          ) : (
            <button
              onClick={onNextStep}
              className="flex items-center gap-1 text-xs py-2 px-4 rounded-xl bg-[#2A5A3B] text-white font-bold hover:bg-[#20472E] transition-all shadow-xs"
            >
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* Box Breathing (4-4-4-4) Animated Timer                                    */
/* ========================================================================= */

const BoxBreathingVisualizer: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [phase, setPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [roundCount, setRoundCount] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Advance phase
        setPhase((currentPhase) => {
          if (currentPhase === "inhale") return "hold1";
          if (currentPhase === "hold1") return "exhale";
          if (currentPhase === "exhale") return "hold2";
          // after hold2 -> new round
          setRoundCount((r) => r + 1);
          return "inhale";
        });

        return 4;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const resetTimer = () => {
    setIsRunning(false);
    setPhase("inhale");
    setSecondsLeft(4);
    setRoundCount(1);
  };

  const phaseConfig = {
    inhale: { label: "Inhale slowly", scale: "scale-100", color: "#2D7245", instruction: "Through the nose, feeling lungs fill" },
    hold1: { label: "Hold full", scale: "scale-100", color: "#C2780E", instruction: "Soft and still, shoulders relaxed" },
    exhale: { label: "Exhale gently", scale: "scale-60", color: "#3A6485", instruction: "Through the mouth, letting go" },
    hold2: { label: "Hold empty", scale: "scale-60", color: "#7D6B53", instruction: "Rest in the quiet pause" },
  };

  const current = phaseConfig[phase];

  return (
    <div className="bg-[#FAF8F5] border border-[#DDD6CC] rounded-2xl p-5 flex flex-col items-center justify-center space-y-4 shadow-xs">
      {/* Circle Animation Container */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Outer subtle glow ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-dashed border-[#C4BCB0] transition-all duration-1000 animate-spin-slow"
          style={{ opacity: isRunning ? 0.9 : 0.5 }}
        />

        {/* Breathing Circle */}
        <div
          className="w-36 h-36 rounded-full flex flex-col items-center justify-center text-center p-2 transition-all duration-1000 ease-in-out shadow-md"
          style={{
            backgroundColor: `${current.color}20`,
            border: `3.5px solid ${current.color}`,
            transform: isRunning && (phase === "inhale" || phase === "hold1") ? "scale(1.15)" : "scale(0.85)",
          }}
        >
          <span className="text-3xl font-bold font-serif italic text-[#1A1C19]">
            {isRunning ? secondsLeft : "4"}
          </span>
          <span className="text-xs font-bold mt-0.5" style={{ color: current.color }}>
            {isRunning ? current.label : "Box Breath"}
          </span>
        </div>
      </div>

      {/* Instruction subtitle */}
      <div className="text-center space-y-0.5">
        <div className="text-xs font-bold text-[#1A1C19]">
          {isRunning ? current.instruction : "4s Inhale · 4s Hold · 4s Exhale · 4s Hold"}
        </div>
        <div className="text-[11px] text-[#484E48] font-semibold">
          Round {roundCount} · Aim for 4 to 6 cycles
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex items-center gap-2 py-2 px-5 rounded-full bg-[#2A5A3B] text-white font-bold text-xs hover:bg-[#20472E] transition-all shadow-xs active:scale-95"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          <span>{isRunning ? "Pause" : "Start Box Rhythm"}</span>
        </button>

        <button
          onClick={resetTimer}
          aria-label="Reset box rhythm timer"
          className="p-2 rounded-full bg-[#EAE4D9] text-[#333933] hover:text-[#1A1C19] border border-[#DDD6CC] transition-colors"
          title="Reset timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 4-7-8 Deep Relaxation Timer                                               */
/* ========================================================================= */

const RelaxingBreathingVisualizer: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [cycle, setCycle] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        setPhase((currentPhase) => {
          if (currentPhase === "inhale") {
            setSecondsLeft(7);
            return "hold";
          }
          if (currentPhase === "hold") {
            setSecondsLeft(8);
            return "exhale";
          }
          // After exhale -> cycle completes
          setCycle((c) => c + 1);
          setSecondsLeft(4);
          return "inhale";
        });

        return 4;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const resetTimer = () => {
    setIsRunning(false);
    setPhase("inhale");
    setSecondsLeft(4);
    setCycle(1);
  };

  const labels = {
    inhale: { text: "Inhale (4s)", color: "#2D7245" },
    hold: { text: "Hold gently (7s)", color: "#C2780E" },
    exhale: { text: "Whoosh exhale (8s)", color: "#3A6485" },
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#DDD6CC] rounded-2xl p-5 flex flex-col items-center justify-center space-y-4 shadow-xs">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div
          className="w-32 h-32 rounded-full flex flex-col items-center justify-center text-center p-2 transition-all duration-1000 ease-in-out shadow-md"
          style={{
            backgroundColor: `${labels[phase].color}20`,
            border: `3.5px solid ${labels[phase].color}`,
            transform: isRunning && phase === "inhale" ? "scale(1.2)" : phase === "hold" ? "scale(1.2)" : "scale(0.8)",
          }}
        >
          <span className="text-3xl font-bold font-serif italic text-[#1A1C19]">
            {isRunning ? secondsLeft : "4"}
          </span>
          <span className="text-xs font-bold mt-0.5" style={{ color: labels[phase].color }}>
            {isRunning ? labels[phase].text : "4-7-8 Breath"}
          </span>
        </div>
      </div>

      <div className="text-center space-y-0.5">
        <div className="text-xs font-bold text-[#1A1C19]">
          4s Inhale · 7s Hold · 8s Complete Exhale
        </div>
        <div className="text-[11px] text-[#484E48] font-semibold">
          Cycle {cycle} of 4 · Parasympathetic nervous system reset
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex items-center gap-2 py-2 px-5 rounded-full bg-[#2A5A3B] text-white font-bold text-xs hover:bg-[#20472E] transition-all shadow-xs active:scale-95"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          <span>{isRunning ? "Pause" : "Start 4-7-8"}</span>
        </button>

        <button
          onClick={resetTimer}
          aria-label="Reset 4-7-8 timer"
          className="p-2 rounded-full bg-[#EAE4D9] text-[#333933] hover:text-[#1A1C19] border border-[#DDD6CC] transition-colors"
          title="Reset timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
