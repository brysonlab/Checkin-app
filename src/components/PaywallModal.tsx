import React, { useState } from "react";
import { X, Sparkles, Check, ShieldCheck, HeartHandshake, FileText, Infinity as InfinityIcon } from "lucide-react";
import { UserProfile } from "../types";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpgrade: (plan: "monthly" | "yearly", startTrial: boolean) => Promise<void>;
  onCancelPlan: () => Promise<void>;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpgrade,
  onCancelPlan,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleStart = async (startTrial: boolean) => {
    setIsProcessing(true);
    try {
      await onUpgrade(selectedPlan, startTrial);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      await onCancelPlan();
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D302E]/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border border-[#E8E4DF] rounded-3xl p-6 sm:p-8 text-[#2D302E] shadow-xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#FAF8F5] text-[#7C827B] hover:text-[#2D302E] hover:bg-[#F0EDE6] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F0F4EE] border border-[#8E9F85]/40 mb-3 shadow-xs">
            <Sparkles className="w-6 h-6 text-[#8E9F85]" />
          </div>
          <h2 className="font-serif italic text-2xl sm:text-3xl font-medium text-[#2D302E]">
            Check-In Plus
          </h2>
          <p className="text-xs sm:text-sm text-[#7C827B] mt-1 max-w-xs mx-auto">
            Deeper historical insights, our full library of guided micro-sessions, and unlimited reflections.
          </p>
        </div>

        {/* Already Subscribed State */}
        {user.isPlus ? (
          <div className="space-y-4">
            <div className="bg-[#FAF8F5] border border-[#8E9F85]/40 rounded-2xl p-4 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4EE] text-[#4D6045] text-xs font-semibold mb-2 border border-[#8E9F85]/30">
                <Check className="w-3.5 h-3.5" />
                <span>Plus Active ({user.subscriptionPlan === "yearly" ? "Yearly Plan" : "Monthly Plan"})</span>
              </div>
              <p className="text-xs text-[#7C827B]">
                You have full access to all guided exercises, unlimited reflections, and 30-day observational trends.
              </p>
              {user.trialEndsAt && (
                <p className="text-[11px] text-[#53684B] font-semibold mt-2">
                  7-Day Free Trial ends on {new Date(user.trialEndsAt).toLocaleDateString()}
                </p>
              )}
            </div>

            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-[#7C827B] text-xs font-semibold hover:text-[#2D302E] hover:bg-[#F0EDE6] transition-all shadow-xs"
            >
              {isProcessing ? "Updating..." : "Downgrade to Free Tier"}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Feature Comparison */}
            <div className="bg-[#FAF8F5] border border-[#E8E4DF] rounded-2xl p-4 space-y-2.5 text-xs text-[#4A5049]">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#F0F4EE] border border-[#8E9F85]/30 flex items-center justify-center text-[#8E9F85]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span><strong className="text-[#2D302E]">Full guided session library:</strong> 8+ structured somatic & breathing exercises</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#F0F4EE] border border-[#8E9F85]/30 flex items-center justify-center text-[#8E9F85]">
                  <InfinityIcon className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-[#2D302E]">Unlimited vent reflections:</strong> Process anytime without monthly caps</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#F0F4EE] border border-[#8E9F85]/30 flex items-center justify-center text-[#8E9F85]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span><strong className="text-[#2D302E]">30-day trends & observational pattern callouts</strong> (e.g. weekly shifts)</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#F0F4EE] border border-[#8E9F85]/30 flex items-center justify-center text-[#8E9F85]">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-[#2D302E]">Therapist Report Export:</strong> Clean summary ready to print or take to sessions</span>
              </div>
            </div>

            {/* Plan selection buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlan("yearly")}
                className={`relative p-3.5 rounded-2xl border text-left transition-all ${
                  selectedPlan === "yearly"
                    ? "bg-[#F0F4EE] border-[#8E9F85] shadow-xs ring-1 ring-[#8E9F85]"
                    : "bg-[#FAF8F5] border-[#E8E4DF] hover:border-[#D9D4CC]"
                }`}
              >
                <div className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-[#8E9F85] text-white text-[10px] font-bold uppercase tracking-wider">
                  Save 37%
                </div>
                <div className="text-xs font-semibold text-[#2D302E]">Yearly Plan</div>
                <div className="text-lg font-bold text-[#53684B] font-serif italic mt-1">$59.99<span className="text-xs font-normal text-[#7C827B]">/yr</span></div>
                <div className="text-[10px] text-[#7C827B] mt-0.5">$4.99/month billed annually</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan("monthly")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedPlan === "monthly"
                    ? "bg-[#F0F4EE] border-[#8E9F85] shadow-xs ring-1 ring-[#8E9F85]"
                    : "bg-[#FAF8F5] border-[#E8E4DF] hover:border-[#D9D4CC]"
                }`}
              >
                <div className="text-xs font-semibold text-[#2D302E]">Monthly Plan</div>
                <div className="text-lg font-bold text-[#2D302E] font-serif italic mt-1">$7.99<span className="text-xs font-normal text-[#7C827B]">/mo</span></div>
                <div className="text-[10px] text-[#7C827B] mt-0.5">Cancel anytime</div>
              </button>
            </div>

            {/* Trial Action Button */}
            <button
              onClick={() => handleStart(true)}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-[#8E9F85] text-white font-bold text-xs sm:text-sm hover:bg-[#7D8F75] transition-all shadow-xs active:scale-98 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? "Activating..." : "Start 7-Day Free Trial"}</span>
            </button>

            {/* Respectful Trust Guarantees */}
            <div className="space-y-1 text-center">
              <p className="text-[11px] text-[#7C827B]">
                Then {selectedPlan === "yearly" ? "$59.99/year" : "$7.99/month"}. Cancel anytime in settings.
              </p>
              <div className="flex items-center justify-center gap-3 text-[10px] text-[#7C827B] pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#8E9F85]" />
                  <span>No dark patterns</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3 text-[#8E9F85]" />
                  <span>Crisis resources always free</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
