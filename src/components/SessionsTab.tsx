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
            <h2 className="font-serif italic text-2xl sm:text-3xl font-medium text-[#2D302E]">
              Guided Micro-Sessions
            </h2>
            <p className="text-xs sm:text-sm text-[#7C827B] mt-1">
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
                  className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-all ${
                    active
                      ? "bg-[#8E9F85] border-[#8E9F85] text-white font-semibold shadow-xs"
                      : "bg-[#FFFFFF] border-[#E8E4DF] text-[#7C827B] hover:text-[#2D302E] hover:border-[#D9D4CC]"
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
                      ? "bg-[#FAF8F5]/80 border-[#E8E4DF] opacity-75 hover:opacity-100"
                      : "bg-[#FFFFFF] border-[#E8E4DF] hover:border-[#8E9F85]/60 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${session.tagColor || "bg-[#8E9F85]/15 text-[#4D6045] border-[#8E9F85]/30"}`}>
                          {session.tag}
                        </span>
                        <span className="text-[11px] text-[#7C827B]">
                          {session.duration}
                        </span>
                        {isDone && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#F0F4EE] text-[#4D6045] font-semibold border border-[#8E9F85]/30">
                            <Check className="w-3 h-3" />
                            <span>Practiced</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif italic text-lg font-medium text-[#2D302E] group-hover:text-[#53684B] transition-colors">
                        {session.title}
                      </h3>

                      <p className="text-xs text-[#7C827B] line-clamp-2">
                        {session.summary}
                      </p>
                    </div>

                    {/* Action Icon */}
                    <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-[#F7F3EE] border border-[#E8E4DF] text-[#8E9F85] flex-shrink-0 group-hover:bg-[#8E9F85] group-hover:text-white transition-all shadow-xs">
                      {isLocked ? (
                        <Lock className="w-4 h-4 text-[#7C827B]" />
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
            <div className="bg-[#FAF8F5] border border-[#8E9F85]/40 rounded-3xl p-5 text-center space-y-3 shadow-xs">
              <Sparkles className="w-6 h-6 text-[#8E9F85] mx-auto" />
              <div>
                <h3 className="font-serif italic text-lg font-medium text-[#2D302E]">
                  Unlock the Complete 8+ Session Library
                </h3>
                <p className="text-xs text-[#7C827B] mt-1">
                  Access 4-7-8 relaxation, 3am sleep loops, loneliness soothing, and anger release exercises with Check-In Plus.
                </p>
              </div>
              <button
                onClick={onOpenPaywall}
                className="py-2.5 px-6 rounded-xl bg-[#8E9F85] text-white font-bold text-xs hover:bg-[#7D8F75] transition-all shadow-xs"
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
    <div className="bg-[#FFFFFF] border border-[#E8E4DF] rounded-3xl p-6 shadow-md space-y-6 animate-fade-in">
      {/* Header with Close */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F0F4EE] text-[#4D6045] font-semibold border border-[#8E9F85]/30">
            {session.tag}
          </span>
          <span className="text-xs text-[#7C827B]">{session.duration}</span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full bg-[#F7F3EE] text-[#7C827B] hover:text-[#2D302E] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <h2 className="font-serif italic text-2xl font-medium text-[#2D302E]">
          {session.title}
        </h2>
        <p className="text-xs text-[#7C827B] mt-1">{session.summary}</p>
      </div>

      {/* Interactive visual breathing timer if applicable */}
      {session.breathingType === "box" && <BoxBreathingVisualizer />}
      {session.breathingType === "relaxing" && <RelaxingBreathingVisualizer />}

      {/* Step by step card */}
      <div className="bg-[#FAF8F5] border border-[#E8E4DF] rounded-2xl p-5 min-h-[140px] flex flex-col justify-between shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7C827B]">
            <span>Step {currentStep + 1} of {session.steps.length}</span>
            <div className="flex items-center gap-1">
              {session.steps.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentStep ? "w-4 bg-[#8E9F85]" : i < currentStep ? "bg-[#B5C2CD]" : "bg-[#E8E4DF]"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#2D302E] leading-relaxed font-serif italic pt-2">
            {session.steps[currentStep]}
          </p>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#E8E4DF]">
          <button
            onClick={onPrevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg border transition-colors ${
              currentStep === 0
                ? "border-transparent text-[#B0A79E] cursor-default"
                : "border-[#E8E4DF] text-[#7C827B] hover:text-[#2D302E] hover:bg-[#F0F4EE]"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {isLastStep ? (
            <button
              onClick={onComplete}
              className="flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl bg-[#8E9F85] text-white font-bold hover:bg-[#7D8F75] transition-all shadow-xs active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Complete Practice</span>
            </button>
          ) : (
            <button
              onClick={onNextStep}
              className="flex items-center gap-1 text-xs py-2 px-4 rounded-xl bg-[#8E9F85] text-white font-bold hover:bg-[#7D8F75] transition-all shadow-xs"
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
    inhale: { label: "Inhale slowly", scale: "scale-100", color: "#8E9F85", instruction: "Through the nose, feeling lungs fill" },
    hold1: { label: "Hold full", scale: "scale-100", color: "#D29F54", instruction: "Soft and still, shoulders relaxed" },
    exhale: { label: "Exhale gently", scale: "scale-60", color: "#8392A0", instruction: "Through the mouth, letting go" },
    hold2: { label: "Hold empty", scale: "scale-60", color: "#B4A999", instruction: "Rest in the quiet pause" },
  };

  const current = phaseConfig[phase];

  return (
    <div className="bg-[#FAF8F5] border border-[#E8E4DF] rounded-2xl p-5 flex flex-col items-center justify-center space-y-4 shadow-xs">
      {/* Circle Animation Container */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Outer subtle glow ring */}
        <div
          className="absolute inset-0 rounded-full border border-dashed border-[#D9D4CC] transition-all duration-1000 animate-spin-slow"
          style={{ opacity: isRunning ? 0.8 : 0.4 }}
        />

        {/* Breathing Circle */}
        <div
          className="w-36 h-36 rounded-full flex flex-col items-center justify-center text-center p-2 transition-all duration-1000 ease-in-out shadow-md"
          style={{
            backgroundColor: `${current.color}15`,
            border: `3px solid ${current.color}`,
            transform: isRunning && (phase === "inhale" || phase === "hold1") ? "scale(1.15)" : "scale(0.85)",
          }}
        >
          <span className="text-3xl font-bold font-serif italic text-[#2D302E]">
            {isRunning ? secondsLeft : "4"}
          </span>
          <span className="text-xs font-semibold mt-0.5" style={{ color: current.color }}>
            {isRunning ? current.label : "Box Breath"}
          </span>
        </div>
      </div>

      {/* Instruction subtitle */}
      <div className="text-center space-y-0.5">
        <div className="text-xs font-medium text-[#2D302E]">
          {isRunning ? current.instruction : "4s Inhale · 4s Hold · 4s Exhale · 4s Hold"}
        </div>
        <div className="text-[11px] text-[#7C827B]">
          Round {roundCount} · Aim for 4 to 6 cycles
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex items-center gap-2 py-2 px-5 rounded-full bg-[#8E9F85] text-white font-bold text-xs hover:bg-[#7D8F75] transition-all shadow-xs active:scale-95"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          <span>{isRunning ? "Pause" : "Start Box Rhythm"}</span>
        </button>

        <button
          onClick={resetTimer}
          className="p-2 rounded-full bg-[#F0EDE6] text-[#7C827B] hover:text-[#2D302E] transition-colors"
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
    inhale: { text: "Inhale (4s)", color: "#8E9F85" },
    hold: { text: "Hold gently (7s)", color: "#D29F54" },
    exhale: { text: "Whoosh exhale (8s)", color: "#8392A0" },
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#E8E4DF] rounded-2xl p-5 flex flex-col items-center justify-center space-y-4 shadow-xs">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div
          className="w-32 h-32 rounded-full flex flex-col items-center justify-center text-center p-2 transition-all duration-1000 ease-in-out shadow-md"
          style={{
            backgroundColor: `${labels[phase].color}15`,
            border: `3px solid ${labels[phase].color}`,
            transform: isRunning && phase === "inhale" ? "scale(1.2)" : phase === "hold" ? "scale(1.2)" : "scale(0.8)",
          }}
        >
          <span className="text-3xl font-bold font-serif italic text-[#2D302E]">
            {isRunning ? secondsLeft : "4"}
          </span>
          <span className="text-xs font-semibold mt-0.5" style={{ color: labels[phase].color }}>
            {isRunning ? labels[phase].text : "4-7-8 Breath"}
          </span>
        </div>
      </div>

      <div className="text-center space-y-0.5">
        <div className="text-xs font-medium text-[#2D302E]">
          4s Inhale · 7s Hold · 8s Complete Exhale
        </div>
        <div className="text-[11px] text-[#7C827B]">
          Cycle {cycle} of 4 · Parasympathetic nervous system reset
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex items-center gap-2 py-2 px-5 rounded-full bg-[#8E9F85] text-white font-bold text-xs hover:bg-[#7D8F75] transition-all shadow-xs active:scale-95"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          <span>{isRunning ? "Pause" : "Start 4-7-8"}</span>
        </button>

        <button
          onClick={resetTimer}
          className="p-2 rounded-full bg-[#F0EDE6] text-[#7C827B] hover:text-[#2D302E] transition-colors"
          title="Reset timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
