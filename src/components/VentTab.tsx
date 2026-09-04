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
        <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#1A1C19]">
          Say It Here First
        </h2>
        <p className="text-xs sm:text-sm text-[#414741] mt-1 font-medium">
          A confidential space to get things off your chest and receive a warm, grounding reflection.
        </p>
      </div>

      {/* Trust & Privacy Guarantee Pill */}
      <div className="bg-[#FAF8F5] border border-[#DDD6CC] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-[#414741]">
        <Lock className="w-4 h-4 text-[#2A5A3B] flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed font-medium">
          <strong className="text-[#1A1C19] font-bold">Zero-Ad & Private:</strong> Your writing is stored locally on your device. It is never sold, never used for ad targeting, and never used to train public AI models.
        </div>
      </div>

      {/* Free Tier Monthly Quota Indicator */}
      {!user.isPlus && (
        <div className="flex items-center justify-between text-xs px-1 text-[#414741] font-semibold">
          <span>Free Tier Monthly Reflections:</span>
          <span className="font-bold text-[#1B4B27]">
            {entriesThisMonth.length} of 5 used ({remainingFreeEntries} remaining)
          </span>
        </div>
      )}

      {/* Free-Text Entry Input */}
      <div className="bg-[#FFFFFF] border border-[#DDD6CC] rounded-3xl p-5 shadow-xs space-y-3">
        <label htmlFor="vent-input" className="block text-xs font-bold text-[#1A1C19]">
          What's running through your mind right now?
        </label>

        <textarea
          id="vent-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I'm feeling so exhausted with work today, and nobody seems to notice how much effort it takes just to keep up..."
          rows={5}
          className="w-full bg-[#FAF8F5] border border-[#CDC4B6] rounded-2xl p-4 text-sm text-[#1A1C19] placeholder-[#767C75] focus:outline-none focus:border-[#2A5A3B] focus:bg-[#FFFFFF] transition-colors resize-none leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[#5C635C] font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#2A5A3B]" />
            <span>Safety screened prior to reflection</span>
          </div>

          <button
            onClick={handleSend}
            disabled={isSubmitting || !text.trim()}
            className={`flex items-center gap-2 py-2.5 px-5 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95 ${
              isSubmitting || !text.trim()
                ? "bg-[#FAF8F5] border border-[#DDD6CC] text-[#AFA596] cursor-not-allowed"
                : "bg-[#2A5A3B] text-[#FFFFFF] hover:bg-[#20472E]"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Reflecting..." : "Let It Out"}</span>
          </button>
        </div>
      </div>

      {/* Fresh Reflection Card */}
      {latestReflection && (
        <div className="bg-[#EAF3EB] border-2 border-[#2A5A3B] rounded-2xl p-5 shadow-xs space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1B4B27]">
            <Heart className="w-4 h-4 fill-current text-[#2A5A3B]" />
            <span>A gentle reflection for you</span>
          </div>
          <p className="font-serif italic text-sm sm:text-base text-[#1A1C19] leading-relaxed font-medium">
            "{latestReflection}"
          </p>
        </div>
      )}

      {/* Previous Vent Journal History */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif italic text-lg font-bold text-[#1A1C19]">
            Past Reflections
          </h3>
          <span className="text-xs text-[#5C635C] font-semibold">
            {journalEntries.length} {journalEntries.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {journalEntries.length === 0 ? (
          <div className="bg-[#FAF8F5] border border-[#DDD6CC] rounded-2xl p-6 text-center text-xs text-[#5C635C] space-y-1">
            <MessageCircle className="w-6 h-6 text-[#BDB3A4] mx-auto mb-2" />
            <p className="font-semibold text-[#333933]">No vent entries logged yet.</p>
            <p className="text-[11px] text-[#5C635C]">Whenever you need to express something raw or quiet, write it above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {journalEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#FFFFFF] border border-[#DDD6CC] rounded-2xl p-4 space-y-3 hover:border-[#2A5A3B] transition-colors shadow-xs"
              >
                <div className="flex items-center justify-between text-xs text-[#5C635C] font-semibold">
                  <span>{entry.date}</span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1 text-[#5C635C] hover:text-[#C2381E] transition-colors"
                    title="Delete entry permanently"
                    aria-label="Delete entry permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-[#1A1C19] leading-relaxed whitespace-pre-wrap font-normal">
                  {entry.text}
                </p>

                {entry.reflection && (
                  <div className="bg-[#FAF8F5] border-l-3 border-[#2A5A3B] p-3 rounded-xl text-xs sm:text-sm font-serif italic text-[#1A1C19] leading-relaxed font-medium">
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
