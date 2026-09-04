import React, { useState } from "react";
import { Heart, ShieldCheck, Sparkles, ArrowRight, Check } from "lucide-react";
import { UserProfile } from "../types";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (focusAreas: string[], name: string, email: string) => void;
  onOpenCrisis: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onOpenCrisis,
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedFocus, setSelectedFocus] = useState<string[]>([
    "General check-ins",
    "Anxiety relief",
  ]);

  if (!isOpen) return null;

  const focusOptions = [
    { id: "Anxiety relief", label: "Anxiety relief", desc: "Interrupt spiraling thoughts & ground" },
    { id: "Better sleep", label: "Better sleep", desc: "Wind down and ease nighttime loops" },
    { id: "Calming overwhelm", label: "Calming overwhelm", desc: "Structured breathing and brain dumps" },
    { id: "Releasing tension", label: "Releasing tension", desc: "Somatic release for jaw & shoulders" },
    { id: "Loneliness support", label: "Loneliness support", desc: "Gentle self-connection and warmth" },
    { id: "General check-ins", label: "General check-ins", desc: "Quick daily mood tracking in <30s" },
  ];

  const toggleFocus = (id: string) => {
    if (selectedFocus.includes(id)) {
      setSelectedFocus(selectedFocus.filter((f) => f !== id));
    } else {
      setSelectedFocus([...selectedFocus, id]);
    }
  };

  const handleFinish = () => {
    onComplete(selectedFocus, name.trim() || "Friend", email.trim() || "guest@checkin.internal");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1C19]/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-[#FFFFFF] border-2 border-[#DDD6CC] rounded-3xl p-6 sm:p-8 text-[#1A1C19] shadow-2xl overflow-hidden">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? "w-8 bg-[#2A5A3B]" : s < step ? "w-3.5 bg-[#8DC39A]" : "w-3 bg-[#CDC4B6]"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-[#1A1C19] font-bold">Step {step} of 3</span>
        </div>

        {/* Step 1: Welcome & Purpose */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF3EB] border-2 border-[#2A5A3B] flex items-center justify-center mb-2 shadow-xs">
              <Heart className="w-7 h-7 text-[#2A5A3B] fill-[#2A5A3B]/25" />
            </div>

            <h2 id="onboarding-modal-title" className="font-serif italic text-2xl sm:text-3xl font-bold text-[#1A1C19] leading-tight">
              A quiet space for the in-between moments.
            </h2>

            <p className="text-xs sm:text-sm text-[#383E38] leading-relaxed font-medium">
              <strong className="text-[#1A1C19] font-bold">Check-In</strong> gives you a fast, low-friction way to process daily emotions between full therapy sessions or busy days.
            </p>

            <div className="bg-[#FAF8F5] border border-[#DDD6CC] rounded-2xl p-4 space-y-2 text-xs text-[#1A1C19]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2A5A3B]" />
                <span><strong className="text-[#1A1C19] font-bold">5-second mood check-in</strong> with high clarity</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B85D19]" />
                <span><strong className="text-[#1A1C19] font-bold">3-minute guided micro-sessions</strong> & interactive breathing</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3A6485]" />
                <span><strong className="text-[#1A1C19] font-bold">Private vent space</strong> with warm, validating reflections</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-4 py-3.5 px-4 rounded-xl bg-[#2A5A3B] text-white font-bold text-xs sm:text-sm hover:bg-[#20472E] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Boundaries & Crisis Safety */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FDF1EE] border-2 border-[#C2381E] flex items-center justify-center mb-2">
              <ShieldCheck className="w-7 h-7 text-[#C2381E]" />
            </div>

            <h2 className="font-serif italic text-2xl font-bold text-[#1A1C19] leading-tight">
              Our safety commitment to you.
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-[#383E38] leading-relaxed font-medium">
              <p>
                <strong className="text-[#1A1C19] font-bold">Not a replacement for therapy:</strong> Check-In provides self-guided emotional regulation tools, never medical diagnoses or clinical advice.
              </p>
              <p>
                <strong className="text-[#1A1C19] font-bold">Crisis support is always free:</strong> If you are in distress, 988 Lifeline and crisis contacts are reachable in 1 tap from any screen.
              </p>
              <p>
                <strong className="text-[#1A1C19] font-bold">Privacy first:</strong> Your journal entries are private, never sold, and never used for ads or external AI training.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onOpenCrisis}
                className="text-xs text-[#C2381E] font-bold hover:underline"
              >
                View crisis resources now
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3 px-6 rounded-xl bg-[#2A5A3B] text-white font-bold text-xs sm:text-sm hover:bg-[#20472E] transition-all flex items-center gap-2 shadow-xs"
              >
                <span>I Understand</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Personalize & Start */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-serif italic text-2xl font-bold text-[#1A1C19]">
                What brings you here today?
              </h2>
              <p className="text-xs text-[#414741] font-medium mt-1">
                Optional: Pick areas to personalize which sessions surface first.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {focusOptions.map((opt) => {
                const isSelected = selectedFocus.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleFocus(opt.id)}
                    className={`text-left p-2.5 rounded-xl border-2 transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-[#EAF3EB] border-[#2A5A3B] text-[#1A1C19]"
                        : "bg-[#FAF8F5] border-[#DDD6CC] text-[#414741] hover:border-[#CDC4B6]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center flex-shrink-0 border-2 ${
                        isSelected ? "bg-[#2A5A3B] border-[#2A5A3B] text-white" : "border-[#CDC4B6]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1A1C19]">{opt.label}</div>
                      <div className="text-[10px] text-[#414741] font-medium leading-tight mt-0.5">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional name / guest */}
            <div className="pt-1">
              <label htmlFor="guest-name" className="sr-only">
                What should we call you? (Optional)
              </label>
              <input
                id="guest-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you? (Optional)"
                className="w-full bg-[#FAF8F5] border border-[#CDC4B6] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1C19] placeholder-[#767C75] focus:outline-none focus:border-[#2A5A3B] focus:bg-[#FFFFFF] font-medium"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleFinish}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2A5A3B] text-white font-bold text-xs sm:text-sm hover:bg-[#20472E] transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Begin Check-In (Free)</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-[#5C635C] font-semibold">
              No credit card required · Free forever tier available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
