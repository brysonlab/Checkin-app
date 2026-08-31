import React from "react";
import { X, Phone, MessageSquare, ExternalLink, ShieldCheck, Heart } from "lucide-react";
import { CRISIS_RESOURCES } from "../data/crisisResources";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTriggeredBySafetyCheck?: boolean;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  onClose,
  isTriggeredBySafetyCheck = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D302E]/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border border-[#E8E4DF] rounded-3xl p-6 text-[#2D302E] shadow-xl my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#FAF8F5] text-[#7C827B] hover:text-[#2D302E] hover:bg-[#F0EDE6] transition-colors"
          aria-label="Close crisis support"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gentle Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F0] border border-[#D97B66]/40 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 text-[#D97B66] fill-[#D97B66]/20" />
          </div>
          <div>
            <h2 className="font-serif italic text-2xl font-medium text-[#2D302E]">
              {isTriggeredBySafetyCheck ? "We're holding space for you" : "Immediate Support Resources"}
            </h2>
            <p className="text-xs sm:text-sm text-[#7C827B]">
              Free, confidential, and available 24 hours a day.
            </p>
          </div>
        </div>

        {/* Compassionate Message */}
        <div className="bg-[#FAF8F5] border border-[#E8E4DF] rounded-2xl p-4 mb-5 text-xs sm:text-sm leading-relaxed text-[#4A5049]">
          {isTriggeredBySafetyCheck ? (
            <p>
              It sounds like things are feeling exceptionally heavy right now. You don't have to carry this alone or figure it all out tonight. Real people who care are ready to listen right this second.
            </p>
          ) : (
            <p>
              If you or someone you know is going through a difficult time, experiencing suicidal thoughts, or feeling overwhelmed, please reach out to these trusted lifelines.
            </p>
          )}
        </div>

        {/* Quick Action Dial Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <a
            href="tel:988"
            className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#D97B66] text-white font-semibold text-xs sm:text-sm hover:bg-[#C86D58] transition-all shadow-xs active:scale-95"
          >
            <Phone className="w-4 h-4 fill-current" />
            <span>Call 988 (Toll-Free)</span>
          </a>

          <a
            href="sms:741741?body=HOME"
            className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-[#2D302E] font-semibold text-xs sm:text-sm hover:bg-[#F0EDE6] transition-all active:scale-95 shadow-xs"
          >
            <MessageSquare className="w-4 h-4 text-[#8E9F85]" />
            <span>Text HOME to 741741</span>
          </a>
        </div>

        {/* Resource Directory */}
        <h3 className="text-xs uppercase tracking-wider text-[#7C827B] font-semibold mb-3">
          Confidential Helplines Directory
        </h3>

        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {CRISIS_RESOURCES.map((r, i) => (
            <div
              key={i}
              className="bg-[#FAF8F5] border border-[#E8E4DF] rounded-xl p-3.5 hover:border-[#D9D4CC] transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-medium text-xs sm:text-sm text-[#2D302E]">{r.name}</span>
                {r.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0F4EE] text-[#4D6045] font-semibold border border-[#8E9F85]/30">
                    {r.badge}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#7C827B] mb-2">{r.description}</p>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {r.phone && (
                  <a
                    href={`tel:${r.phone.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-1 text-[#D97B66] font-semibold hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{r.phone}</span>
                  </a>
                )}
                {r.text && (
                  <span className="text-[#53684B] font-medium">
                    · {r.text}
                  </span>
                )}
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#8392A0] hover:underline ml-auto"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Non-Diagnostic Clinical Disclaimer */}
        <div className="mt-5 pt-4 border-t border-[#E8E4DF] flex items-center justify-between text-xs text-[#7C827B]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#8E9F85]" />
            <span>Check-In does not replace professional emergency care.</span>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-[#7C827B] hover:text-[#2D302E] underline underline-offset-2 ml-3 flex-shrink-0"
          >
            I'm safe, return to app
          </button>
        </div>
      </div>
    </div>
  );
};
