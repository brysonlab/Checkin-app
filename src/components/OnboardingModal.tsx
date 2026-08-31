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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D302E]/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#FFFFFF] border border-[#E8E4DF] rounded-3xl p-6 sm:p-8 text-[#2D302E] shadow-xl overflow-hidden">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? "w-7 bg-[#8E9F85]" : s < step ? "w-3 bg-[#B5C2CD]" : "w-3 bg-[#E8E4DF]"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-[#7C827B] font-medium">Step {step} of 3</span>
        </div>

        {/* Step 1: Welcome & Purpose */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F0F4EE] border border-[#8E9F85]/40 flex items-center justify-center mb-2 shadow-xs">
              <Heart className="w-7 h-7 text-[#8E9F85] fill-[#8E9F85]/20" />
            </div>

            <h2 className="font-serif italic text-2xl sm:text-3xl font-medium text-[#2D302E] leading-tight">
              A quiet space for the in-between moments.
            </h2>

            <p className="text-xs sm:text-sm text-[#7C827B] leading-relaxed">
              <strong className="text-[#2D302E]">Check-In</strong> gives you a fast, low-friction way to process daily emotions between full therapy sessions or busy days.
            </p>

            <div className="bg-[#FAF8F5] border border-[#E8E4DF] rounded-2xl p-4 space-y-2 text-xs text-[#4A5049]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8E9F85]" />
                <span><strong className="text-[#2D302E]">5-second mood check-in</strong> with organic shapes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D29F54]" />
                <span><strong className="text-[#2D302E]">3-minute guided micro-sessions</strong> & interactive breathing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8392A0]" />
                <span><strong className="text-[#2D302E]">Private vent space</strong> with warm, validating reflections</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-4 py-3.5 px-4 rounded-xl bg-[#8E9F85] text-white font-semibold text-xs sm:text-sm hover:bg-[#7D8F75] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Boundaries & Crisis Safety */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FDF2F0] border border-[#D97B66]/40 flex items-center justify-center mb-2">
              <ShieldCheck className="w-7 h-7 text-[#D97B66]" />
            </div>

            <h2 className="font-serif italic text-2xl font-medium text-[#2D302E] leading-tight">
              Our safety commitment to you.
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-[#7C827B] leading-relaxed">
              <p>
                <strong className="text-[#2D302E]">Not a replacement for therapy:</strong> Check-In provides self-guided emotional regulation tools, never medical diagnoses or clinical advice.
              </p>
              <p>
                <strong className="text-[#2D302E]">Crisis support is always free:</strong> If you are in distress, 988 Lifeline and crisis contacts are reachable in 1 tap from any screen.
              </p>
              <p>
                <strong className="text-[#2D302E]">Privacy first:</strong> Your journal entries are private, never sold, and never used for ads or external AI training.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onOpenCrisis}
                className="text-xs text-[#D97B66] font-semibold hover:underline"
              >
                View crisis resources now
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3 px-6 rounded-xl bg-[#8E9F85] text-white font-semibold text-xs sm:text-sm hover:bg-[#7D8F75] transition-all flex items-center gap-2 shadow-xs"
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
              <h2 className="font-serif italic text-2xl font-medium text-[#2D302E]">
                What brings you here today?
              </h2>
              <p className="text-xs text-[#7C827B] mt-1">
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
                    className={`text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-[#F0F4EE] border-[#8E9F85] text-[#2D302E]"
                        : "bg-[#FAF8F5] border-[#E8E4DF] text-[#7C827B] hover:border-[#D9D4CC]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center flex-shrink-0 border ${
                        isSelected ? "bg-[#8E9F85] border-[#8E9F85] text-white" : "border-[#D9D4CC]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#2D302E]">{opt.label}</div>
                      <div className="text-[10px] text-[#7C827B] leading-tight mt-0.5">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional name / guest */}
            <div className="pt-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you? (Optional)"
                className="w-full bg-[#FAF8F5] border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-xs text-[#2D302E] placeholder-[#B0A79E] focus:outline-none focus:border-[#8E9F85] focus:bg-[#FFFFFF]"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleFinish}
                className="flex-1 py-3 px-4 rounded-xl bg-[#8E9F85] text-white font-semibold text-xs sm:text-sm hover:bg-[#7D8F75] transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Begin Check-In (Free)</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-[#7C827B]">
              No credit card required · Free forever tier available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
