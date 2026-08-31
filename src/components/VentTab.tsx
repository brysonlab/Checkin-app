import React, { useState } from "react";
import { Send, ShieldCheck, Trash2, Heart, Lock, Sparkles, MessageCircle, AlertCircle } from "lucide-react";
import { VentJournalItem, UserProfile } from "../types";
import { StorageService } from "../utils/storage";

interface VentTabProps {
  user: UserProfile;
  journalEntries: VentJournalItem[];
  onEntryAdded: (entry: VentJournalItem) => void;
  onEntryDeleted: (id: string) => void;
  onOpenCrisis: () => void;
  onOpenPaywall: () => void;
}

export const VentTab: React.FC<VentTabProps> = ({
  user,
  journalEntries,
  onEntryAdded,
  onEntryDeleted,
  onOpenCrisis,
  onOpenPaywall,
}) => {
  const [text, setText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [latestReflection, setLatestReflection] = useState<string | null>(null);
  const [quotaReached, setQuotaReached] = useState<boolean>(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const entriesThisMonth = journalEntries.filter((j) => j.date.startsWith(currentMonth));
  const remainingFreeEntries = Math.max(0, 5 - entriesThisMonth.length);

  const handleSend = async () => {
    if (!text.trim() || isSubmitting) return;

    if (!user.isPlus && entriesThisMonth.length >= 5) {
      setQuotaReached(true);
      onOpenPaywall();
      return;
    }

    setIsSubmitting(true);
    setLatestReflection(null);

    try {
      const res = await StorageService.submitVent(text);

      if (res.isCrisis) {
        onOpenCrisis();
        setText("");
        return;
      }

      if (res.entry) {
        onEntryAdded(res.entry);
        setLatestReflection(res.entry.reflection || "Thank you for sharing your thoughts.");
        setText("");
      }
    } catch (e) {
      console.error("Vent submit error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await StorageService.deleteJournalEntry(id);
    onEntryDeleted(id);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto animate-fade-in pb-8">
      {/* Header */}
      <div>
        <h2 className="font-serif italic text-2xl sm:text-3xl font-medium text-[#2D302E]">
          Say It Here First
        </h2>
        <p className="text-xs sm:text-sm text-[#7C827B] mt-1">
          A confidential space to get things off your chest and receive a warm, grounding reflection.
        </p>
      </div>

      {/* Trust & Privacy Guarantee Pill */}
      <div className="bg-[#FAF8F5] border border-[#E8E4DF] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-[#7C827B]">
        <Lock className="w-4 h-4 text-[#8E9F85] flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#2D302E]">Zero-Ad & Private:</strong> Your writing is stored locally on your device. It is never sold, never used for ad targeting, and never used to train public AI models.
        </div>
      </div>

      {/* Free Tier Monthly Quota Indicator */}
      {!user.isPlus && (
        <div className="flex items-center justify-between text-xs px-1 text-[#7C827B]">
          <span>Free Tier Monthly Reflections:</span>
          <span className="font-semibold text-[#53684B]">
            {entriesThisMonth.length} of 5 used ({remainingFreeEntries} remaining)
          </span>
        </div>
      )}

      {/* Free-Text Entry Input */}
      <div className="bg-[#FFFFFF] border border-[#E8E4DF] rounded-3xl p-5 shadow-xs space-y-3">
        <label htmlFor="vent-input" className="block text-xs font-semibold text-[#2D302E]">
          What's running through your mind right now?
        </label>

        <textarea
          id="vent-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I'm feeling so exhausted with work today, and nobody seems to notice how much effort it takes just to keep up..."
          rows={5}
          className="w-full bg-[#FAF8F5] border border-[#E8E4DF] rounded-2xl p-4 text-sm text-[#2D302E] placeholder-[#B0A79E] focus:outline-none focus:border-[#8E9F85] focus:bg-[#FFFFFF] transition-colors resize-none leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-[11px] text-[#7C827B]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8E9F85]" />
            <span>Safety screened prior to reflection</span>
          </div>

          <button
            onClick={handleSend}
            disabled={isSubmitting || !text.trim()}
            className={`flex items-center gap-2 py-2.5 px-5 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95 ${
              isSubmitting || !text.trim()
                ? "bg-[#FAF8F5] border border-[#E8E4DF] text-[#B0A79E] cursor-not-allowed"
                : "bg-[#8E9F85] text-[#FFFFFF] hover:bg-[#7D8F75]"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Reflecting..." : "Let It Out"}</span>
          </button>
        </div>
      </div>

      {/* Fresh Reflection Card */}
      {latestReflection && (
        <div className="bg-[#FAF8F5] border-l-4 border-[#8E9F85] border-t border-r border-b border-[#E8E4DF] rounded-2xl p-5 shadow-xs space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#53684B]">
            <Heart className="w-4 h-4 fill-current text-[#8E9F85]" />
            <span>A gentle reflection for you</span>
          </div>
          <p className="font-serif italic text-sm sm:text-base text-[#2D302E] leading-relaxed">
            "{latestReflection}"
          </p>
        </div>
      )}

      {/* Previous Vent Journal History */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif italic text-lg font-medium text-[#2D302E]">
            Past Reflections
          </h3>
          <span className="text-xs text-[#7C827B]">
            {journalEntries.length} {journalEntries.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {journalEntries.length === 0 ? (
          <div className="bg-[#FAF8F5] border border-[#E8E4DF] rounded-2xl p-6 text-center text-xs text-[#7C827B] space-y-1">
            <MessageCircle className="w-6 h-6 text-[#D9D4CC] mx-auto mb-2" />
            <p>No vent entries logged yet.</p>
            <p className="text-[11px] text-[#B0A79E]">Whenever you need to express something raw or quiet, write it above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {journalEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#FFFFFF] border border-[#E8E4DF] rounded-2xl p-4 space-y-3 hover:border-[#8E9F85]/40 transition-colors shadow-xs"
              >
                <div className="flex items-center justify-between text-xs text-[#7C827B]">
                  <span>{entry.date}</span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1 text-[#7C827B] hover:text-[#D97B66] transition-colors"
                    title="Delete entry permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-[#4A5049] leading-relaxed whitespace-pre-wrap">
                  {entry.text}
                </p>

                {entry.reflection && (
                  <div className="bg-[#FAF8F5] border-l-2 border-[#8E9F85] p-3 rounded-xl text-xs sm:text-sm font-serif italic text-[#2D302E] leading-relaxed">
                    "{entry.reflection}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
