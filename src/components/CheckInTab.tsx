import React, { useState, useEffect } from "react";
import { Sun, Moon, Sparkles, Check, Edit2, ShieldAlert, ArrowRight, Tag, Clock } from "lucide-react";
import { CheckInItem, UserProfile } from "../types";
import { MOODS } from "../data/moodsData";
import { StorageService } from "../utils/storage";

interface CheckInTabProps {
  user: UserProfile;
  checkIns: CheckInItem[];
  onCheckInSaved: (item: CheckInItem) => void;
  onOpenCrisis: () => void;
  onNavigateToSessions: () => void;
}

const COMMON_TAGS = [
  "Restless",
  "Grateful",
  "Overwhelmed",
  "Peaceful",
  "Tired",
  "Connected",
  "Stressed",
  "Grounded",
];

export const CheckInTab: React.FC<CheckInTabProps> = ({
  user,
  checkIns,
  onCheckInSaved,
  onOpenCrisis,
  onNavigateToSessions,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const existingToday = checkIns.find((c) => c.date === todayStr);

  const [selectedMood, setSelectedMood] = useState<number | null>(existingToday ? existingToday.mood : null);
  const [note, setNote] = useState<string>(existingToday ? existingToday.note || "" : "");
  const [selectedTags, setSelectedTags] = useState<string[]>(existingToday ? existingToday.tags || [] : []);
  const [isSaved, setIsSaved] = useState<boolean>(!!existingToday);
  const [isEditing, setIsEditing] = useState<boolean>(!existingToday);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [safetyRiskDetected, setSafetyRiskDetected] = useState<boolean>(false);

  useEffect(() => {
    if (existingToday) {
      setSelectedMood(existingToday.mood);
      setNote(existingToday.note || "");
      setSelectedTags(existingToday.tags || []);
      setIsSaved(true);
    }
  }, [existingToday]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const GreetingIcon = hour < 18 ? Sun : Moon;

  const currentMoodObj = MOODS.find((m) => m.id === selectedMood);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = async () => {
    if (selectedMood === null) return;
    setIsSubmitting(true);
    try {
      const res = await StorageService.saveCheckIn({
        date: todayStr,
        mood: selectedMood,
        note,
        tags: selectedTags,
      });

      onCheckInSaved(res.checkIn);
      setIsSaved(true);
      setIsEditing(false);

      if (res.safetyRiskDetected) {
        setSafetyRiskDetected(true);
        onOpenCrisis();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto animate-fade-in pb-8">
      {/* Top Greeting */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#414741]">
          <GreetingIcon className="w-4 h-4 text-[#2A5A3B]" />
          <span>{greeting}, {user.name || "Friend"}</span>
        </div>
        <div className="text-[11px] text-[#5C635C] font-semibold">
          {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
        </div>
      </div>

      {/* Hero Question */}
      <div>
        <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#1A1C19] leading-tight">
          How is today sitting with you?
        </h2>
        <p className="text-xs sm:text-sm text-[#414741] mt-1 font-medium">
          Pick the shape that matches your energy right now. Less than 30 seconds.
        </p>
      </div>

      {/* 5-State Organic Mood Picker */}
      <div className="bg-[#FFFFFF] border border-[#DDD6CC] rounded-3xl p-5 shadow-xs">
        <div className="flex items-end justify-between px-2 pt-2 pb-4 gap-2">
          {MOODS.map((m) => {
            const isSelected = selectedMood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedMood(m.id);
                  if (isSaved && !isEditing) setIsEditing(true);
                }}
                className="group flex flex-col items-center focus:outline-none transition-all duration-300 relative"
                aria-label={m.label}
              >
                {/* Organic fluid shape */}
                <div
                  style={{
                    width: m.size,
                    height: m.size,
                    backgroundColor: m.color,
                    boxShadow: isSelected ? `0 0 16px ${m.bgGlow}, 0 2px 8px rgba(0,0,0,0.15)` : "none",
                  }}
                  className={`transition-all duration-300 flex items-center justify-center cursor-pointer ${m.shapeClass} ${
                    isSelected
                      ? "scale-110 ring-4 ring-[#1A1C19] ring-offset-2 ring-offset-white opacity-100"
                      : selectedMood === null
                      ? "opacity-90 hover:opacity-100 hover:scale-105"
                      : "opacity-50 hover:opacity-85"
                  }`}
                >
                  {isSelected && (
                    <Check className="w-5 h-5 text-[#FFFFFF] stroke-[3] animate-fade-in drop-shadow" />
                  )}
                </div>

                {/* Mood label */}
                <span
                  className={`text-xs mt-2.5 transition-colors ${
                    isSelected ? "text-[#1A1C19] font-bold" : "text-[#484E48] font-semibold group-hover:text-[#1A1C19]"
                  }`}
                >
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected State Description */}
        {currentMoodObj && (
          <div className="mt-2 pt-3 border-t border-[#DDD6CC] text-center animate-fade-in">
            <span className="text-sm font-bold text-[#1A1C19]">
              {currentMoodObj.label}
            </span>
            <span className="text-xs text-[#414741] font-medium ml-2">
              — {currentMoodObj.subtext}
            </span>
          </div>
        )}
      </div>

      {/* Safety Risk Alert banner if triggered */}
      {safetyRiskDetected && (
        <div className="bg-[#FDF1EE] border-2 border-[#C2381E] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#1A1C19] animate-fade-in shadow-xs">
          <ShieldAlert className="w-5 h-5 text-[#C2381E] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[#C2381E]">Support is available right now</p>
            <p className="text-[#383E38] font-medium">
              Your note mentioned heavy feelings. You don't have to navigate this alone.
            </p>
            <button
              onClick={onOpenCrisis}
              className="mt-1 inline-flex items-center gap-1 text-[#C2381E] font-bold hover:underline"
            >
              <span>Connect with 988 Lifeline & Resources</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Note & Tags (When mood is selected) */}
      {selectedMood !== null && (isEditing || !isSaved) && (
        <div className="bg-[#FFFFFF] border border-[#DDD6CC] rounded-3xl p-5 space-y-4 shadow-xs animate-fade-in">
          {/* Tags */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#333933] font-bold mb-2">
              <Tag className="w-3.5 h-3.5 text-[#2A5A3B]" />
              <span>Add a feeling tag (Optional)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      active
                        ? "bg-[#EAF3EB] border-[#2A5A3B] text-[#1B4B27] font-bold shadow-2xs"
                        : "bg-[#FAF8F5] border-[#DDD6CC] text-[#414741] font-medium hover:text-[#1A1C19] hover:border-[#BDB3A4]"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Short Text Note */}
          <div>
            <label htmlFor="daily-note" className="block text-xs text-[#333933] font-bold mb-1.5">
              What's on your mind? (Optional note)
            </label>
            <textarea
              id="daily-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="A word or two about what contributed to this feeling..."
              rows={3}
              maxLength={280}
              className="w-full bg-[#FAF8F5] border border-[#CDC4B6] rounded-2xl p-3.5 text-xs sm:text-sm text-[#1A1C19] placeholder-[#767C75] focus:outline-none focus:border-[#2A5A3B] focus:bg-[#FFFFFF] transition-colors resize-none"
            />
            <div className="flex justify-between items-center text-[10px] text-[#5C635C] font-medium mt-1 px-1">
              <span>Runs instant safety validation on save</span>
              <span>{note.length}/280</span>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#2A5A3B] text-[#FFFFFF] font-bold text-sm hover:bg-[#20472E] transition-all shadow-xs active:scale-98 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isSubmitting ? "Saving..." : isSaved ? "Update Today's Check-In" : "Save Daily Check-In"}</span>
          </button>
        </div>
      )}

      {/* Saved confirmation card */}
      {isSaved && !isEditing && (
        <div className="bg-[#EAF3EB] border border-[#8DC39A] rounded-3xl p-5 shadow-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#2A5A3B] flex items-center justify-center text-white">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-[#1B4B27]">
                Logged for today ({existingToday?.time || "today"})
              </span>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-xs text-[#414741] hover:text-[#1A1C19] font-bold transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          {existingToday?.note && (
            <p className="text-xs sm:text-sm text-[#1A1C19] bg-[#FFFFFF] p-3 rounded-2xl border border-[#DDD6CC] italic font-medium">
              "{existingToday.note}"
            </p>
          )}

          {existingToday?.tags && existingToday.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {existingToday.tags.map((t) => (
                <span key={t} className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFFFFF] text-[#1B4B27] font-bold border border-[#8DC39A]">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Calming next micro-step suggestion */}
          <div className="pt-2 border-t border-[#8DC39A]/40 flex items-center justify-between">
            <span className="text-xs text-[#383E38] font-medium">
              Want a 3-minute breath or release?
            </span>
            <button
              onClick={onNavigateToSessions}
              className="inline-flex items-center gap-1 text-xs text-[#1B4B27] font-bold hover:underline"
            >
              <span>Explore Sessions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Helpful reminder status */}
      <div className="bg-[#FFFFFF] border border-[#DDD6CC] rounded-2xl p-4 flex items-center justify-between text-xs text-[#414741]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#2A5A3B]" />
          <span>Daily check-in reminder: <strong className="text-[#1A1C19]">{user.notificationsEnabled ? user.reminderTime || "20:00" : "Off (Opt-in)"}</strong></span>
        </div>
        <span className="text-[10px] text-[#5C635C] font-semibold">
          One check-in per day
        </span>
      </div>
    </div>
  );
};
