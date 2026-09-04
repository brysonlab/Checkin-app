import React, { useState } from "react";
import { ShieldAlert, Download, Trash2, FileText, Bell, Sparkles, ShieldCheck, HeartHandshake, Check, Info, Lock } from "lucide-react";
import { UserProfile, CheckInItem, VentJournalItem } from "../types";
import { StorageService } from "../utils/storage";

interface SettingsTabProps {
  user: UserProfile;
  checkIns: CheckInItem[];
  journalEntries: VentJournalItem[];
  onOpenCrisis: () => void;
  onOpenPaywall: () => void;
  onOpenTherapistExport: () => void;
  onUserUpdated: (user: UserProfile) => void;
  onResetAllData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  user,
  checkIns,
  journalEntries,
  onOpenCrisis,
  onOpenPaywall,
  onOpenTherapistExport,
  onUserUpdated,
  onResetAllData,
}) => {
  const [reminderTime, setReminderTime] = useState<string>(user.reminderTime || "20:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(user.notificationsEnabled);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleToggleNotifications = async () => {
    const nextVal = !notificationsEnabled;
    setNotificationsEnabled(nextVal);

    if (nextVal && "Notification" in window && Notification.permission !== "granted") {
      try {
        await Notification.requestPermission();
      } catch {
        // ignore
      }
    }

    const updated = await StorageService.updateUser({
      notificationsEnabled: nextVal,
      reminderTime,
    });
    onUserUpdated(updated);
    showNotice("Notification preferences updated.");
  };

  const handleTimeChange = async (newTime: string) => {
    setReminderTime(newTime);
    const updated = await StorageService.updateUser({
      reminderTime: newTime,
    });
    onUserUpdated(updated);
    showNotice("Reminder time saved.");
  };

  const showNotice = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleExportJSON = () => {
    const exportData = {
      app: "Check-In",
      version: "2.0",
      exportDate: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        focusAreas: user.focusAreas,
        completedSessions: user.completedSessions,
      },
      checkInsCount: checkIns.length,
      checkIns,
      journalEntriesCount: journalEntries.length,
      journalEntries: journalEntries.map((j) => ({
        date: j.date,
        text: j.text,
        reflection: j.reflection,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checkin_data_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await StorageService.deleteAccount();
      onResetAllData();
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto animate-fade-in pb-8">
      {/* Header */}
      <div>
        <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#1A1C19]">
          Settings & Privacy
        </h2>
        <p className="text-xs sm:text-sm text-[#414741] mt-1 font-medium">
          Full data sovereignty, crisis safety, and customizable notification preferences.
        </p>
      </div>

      {saveMessage && (
        <div className="bg-[#EAF3EB] border-2 border-[#2A5A3B] rounded-2xl p-3 text-xs text-[#1B4B27] font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <Check className="w-4 h-4 text-[#2A5A3B] stroke-[3]" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* 1. Crisis Resources Banner (Never Paywalled) */}
      <div className="bg-[#FDF1EE] border-2 border-[#C2381E] rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#C2381E]" />
            <h3 className="font-serif italic text-lg font-bold text-[#1A1C19]">
              Crisis Resources
            </h3>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFFFFF] text-[#C2381E] font-bold border border-[#C2381E]">
            Always Free
          </span>
        </div>

        <p className="text-xs text-[#383E38] leading-relaxed font-medium">
          Immediate, free, and confidential crisis lines for anyone experiencing severe distress, depression, or suicidal thoughts.
        </p>

        <button
          onClick={onOpenCrisis}
          className="w-full py-2.5 px-4 rounded-xl bg-[#C2381E] text-white font-bold text-xs hover:bg-[#A82810] transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95"
        >
          <span>Open Full Crisis Support Directory</span>
        </button>
      </div>

      {/* 2. Membership & Plan Status */}
      <div className="bg-[#FFFFFF] border border-[#DDD6CC] rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2A5A3B]" />
            <h3 className="font-serif italic text-lg font-bold text-[#1A1C19]">
              Membership Plan
            </h3>
          </div>

          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
              user.isPlus
                ? "bg-[#EAF3EB] text-[#1B4B27] border-[#8DC39A]"
                : "bg-[#FAF8F5] text-[#414741] border-[#DDD6CC]"
            }`}
          >
            {user.isPlus ? "Check-In Plus" : "Free Forever Tier"}
          </span>
        </div>

        <p className="text-xs text-[#414741] leading-relaxed font-medium">
          {user.isPlus
            ? "You have full access to all 8+ guided exercises, unlimited reflections, and 30-day observational trends."
            : "Free tier includes unlimited daily check-ins, 3 guided exercises, 5 reflections/month, and 14-day trend history."}
        </p>

        <button
          onClick={onOpenPaywall}
          className="w-full py-2.5 px-4 rounded-xl bg-[#FAF8F5] border border-[#CDC4B6] text-xs font-bold text-[#1A1C19] hover:bg-[#EAE4D9] transition-all flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2A5A3B]" />
          <span>{user.isPlus ? "Manage Subscription" : "Upgrade to Plus ($7.99/mo or $59.99/yr)"}</span>
        </button>
      </div>

      {/* 3. Daily Reminder Notification Preferences */}
      <div className="bg-[#FFFFFF] border border-[#DDD6CC] rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#2A5A3B]" />
            <h3 className="font-serif italic text-lg font-bold text-[#1A1C19]">
              Daily Reminder
            </h3>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={notificationsEnabled}
            aria-label="Toggle daily reminder notification"
            onClick={handleToggleNotifications}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              notificationsEnabled ? "bg-[#2A5A3B]" : "bg-[#CDC4B6]"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-xs ${
                notificationsEnabled ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-[#414741] font-medium">
          Optional daily nudge to pause and log how you are doing. Not enabled by default.
        </p>

        {notificationsEnabled && (
          <div className="flex items-center justify-between pt-2 border-t border-[#DDD6CC] text-xs">
            <label htmlFor="reminder-time" className="text-[#1A1C19] font-bold">
              Preferred Reminder Time:
            </label>
            <input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="bg-[#FAF8F5] border border-[#CDC4B6] rounded-xl px-3 py-1.5 text-xs text-[#1A1C19] font-bold focus:outline-none focus:border-[#2A5A3B]"
            />
          </div>
        )}
      </div>

      {/* 4. Export Data & Therapist Report */}
      <div className="bg-[#FFFFFF] border border-[#DDD6CC] rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-[#3A6485]" />
          <h3 className="font-serif italic text-lg font-bold text-[#1A1C19]">
            Export Your Data
          </h3>
        </div>

        <p className="text-xs text-[#414741] leading-relaxed font-medium">
          You own everything you write. Download your complete history or generate a summary to bring to therapy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={onOpenTherapistExport}
            className="py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#CDC4B6] text-xs font-bold text-[#1A1C19] hover:bg-[#EAE4D9] transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-[#2A5A3B]" />
            <span>Therapist Summary</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#CDC4B6] text-xs font-bold text-[#414741] hover:text-[#1A1C19] hover:bg-[#EAE4D9] transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Raw JSON</span>
          </button>
        </div>
      </div>

      {/* 5. Privacy Guarantee & Policy */}
      <div className="bg-[#FAF8F5] border border-[#DDD6CC] rounded-3xl p-5 space-y-3 text-xs text-[#414741] shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#1A1C19] font-bold">
            <Lock className="w-4 h-4 text-[#2A5A3B]" />
            <span>Data Privacy & Zero-Ad Commitment</span>
          </div>

          <button
            onClick={() => setShowPrivacyNotice(!showPrivacyNotice)}
            className="text-xs text-[#1B4B27] font-bold hover:underline"
          >
            {showPrivacyNotice ? "Hide Details" : "Read Policy"}
          </button>
        </div>

        <p className="leading-relaxed font-medium">
          Check-In operates on a trust-first model. We do not sell user data, run third-party advertising networks, or use private journals to train foundation models.
        </p>

        {showPrivacyNotice && (
          <div className="mt-3 pt-3 border-t border-[#DDD6CC] space-y-2 text-[11px] text-[#383E38] leading-relaxed animate-fade-in font-normal">
            <p>
              <strong className="text-[#1A1C19] font-bold">GDPR & Right to be Forgotten:</strong> You have full control over your data. You can export or erase your check-ins and journal entries at any moment.
            </p>
            <p>
              <strong className="text-[#1A1C19] font-bold">Clinical Boundaries:</strong> Check-In is an emotional regulation and reflective journaling tool. It does not provide medical diagnoses, treatment plans, or emergency intervention services.
            </p>
          </div>
        )}
      </div>

      {/* 6. Account Deletion (Full Data Removal) */}
      <div className="bg-[#FFFFFF] border-2 border-[#F0BCB0] rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#C2381E]">
          <Trash2 className="w-4 h-4" />
          <h3 className="font-serif italic text-lg font-bold text-[#1A1C19]">
            Delete All Account Data
          </h3>
        </div>

        <p className="text-xs text-[#414741] leading-relaxed font-medium">
          Permanently wipes all check-in history, journal entries, and personal preferences from this device and server. This action is irreversible.
        </p>

        {showConfirmDelete ? (
          <div className="bg-[#FDF1EE] p-4 rounded-2xl border border-[#C2381E] space-y-3 animate-fade-in">
            <p className="text-xs font-bold text-[#C2381E]">
              Are you sure? This will delete all {checkIns.length} check-ins and {journalEntries.length} journal reflections immediately.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-2 px-3 rounded-xl bg-[#C2381E] text-white font-bold text-xs hover:bg-[#A82810] transition-all shadow-xs"
              >
                {isDeleting ? "Erasing..." : "Yes, Delete Everything"}
              </button>

              <button
                onClick={() => setShowConfirmDelete(false)}
                className="py-2 px-4 rounded-xl bg-[#FFFFFF] border border-[#DDD6CC] text-xs font-bold text-[#414741] hover:text-[#1A1C19]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="py-2.5 px-4 rounded-xl bg-[#FDF1EE] border border-[#C2381E] text-[#C2381E] text-xs font-bold hover:bg-[#FADCD5] transition-all shadow-xs"
          >
            Permanently Delete My Data
          </button>
        )}
      </div>
    </div>
  );
};
