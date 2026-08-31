import { CheckInItem, VentJournalItem, UserProfile } from "../types";

const LOCAL_STORAGE_KEYS = {
  CHECKINS: "checkin_app_entries_v2",
  JOURNAL: "checkin_app_journal_v2",
  USER: "checkin_app_user_v2",
  ONBOARDING_DONE: "checkin_app_onboarding_done_v2",
  CRISIS_TRIGGERED: "checkin_app_crisis_shown_v2",
};

export const defaultUser: UserProfile = {
  id: "user_primary",
  email: "you@checkin.internal",
  name: "You",
  isPlus: false,
  subscriptionPlan: "free",
  completedSessions: [],
  focusAreas: ["General check-ins", "Anxiety relief"],
  reminderTime: "20:00",
  notificationsEnabled: false,
  createdAt: new Date().toISOString(),
};

export const StorageService = {
  // Check-ins
  async getCheckIns(): Promise<CheckInItem[]> {
    try {
      const res = await fetch("/api/checkins?userId=user_primary");
      if (res.ok) {
        const data = await res.json();
        if (data.checkIns && Array.isArray(data.checkIns)) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.CHECKINS, JSON.stringify(data.checkIns));
          return data.checkIns;
        }
      }
    } catch {
      // fallback to local storage
    }
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.CHECKINS);
    return cached ? JSON.parse(cached) : [];
  },

  async saveCheckIn(checkIn: Partial<CheckInItem>): Promise<{ checkIn: CheckInItem; safetyRiskDetected?: boolean }> {
    const today = checkIn.date || new Date().toISOString().slice(0, 10);
    const fullCheckIn: CheckInItem = {
      id: `user_primary_${today}`,
      userId: "user_primary",
      date: today,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mood: checkIn.mood ?? 3,
      note: checkIn.note || "",
      tags: checkIn.tags || [],
      updatedAt: new Date().toISOString(),
    };

    let safetyRiskDetected = false;

    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullCheckIn),
      });
      if (res.ok) {
        const data = await res.json();
        safetyRiskDetected = !!data.safetyRiskDetected;
      }
    } catch {
      // offline
    }

    const current = await this.getCheckIns();
    const filtered = current.filter((c) => c.date !== today);
    const updated = [fullCheckIn, ...filtered];
    localStorage.setItem(LOCAL_STORAGE_KEYS.CHECKINS, JSON.stringify(updated));

    return { checkIn: fullCheckIn, safetyRiskDetected };
  },

  async deleteCheckIn(date: string): Promise<boolean> {
    try {
      await fetch(`/api/checkins/${date}?userId=user_primary`, { method: "DELETE" });
    } catch {
      // ignore
    }
    const current = await this.getCheckIns();
    const updated = current.filter((c) => c.date !== date);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CHECKINS, JSON.stringify(updated));
    return true;
  },

  // Vent & Journal
  async getJournalEntries(): Promise<VentJournalItem[]> {
    try {
      const res = await fetch("/api/journal?userId=user_primary");
      if (res.ok) {
        const data = await res.json();
        if (data.entries && Array.isArray(data.entries)) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.JOURNAL, JSON.stringify(data.entries));
          return data.entries;
        }
      }
    } catch {
      // fallback
    }
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.JOURNAL);
    return cached ? JSON.parse(cached) : [];
  },

  async submitVent(text: string): Promise<{
    isCrisis: boolean;
    entry?: VentJournalItem;
    message?: string;
    monthlyEntriesCount?: number;
    isAtLimit?: boolean;
    isPlus?: boolean;
  }> {
    try {
      const res = await fetch("/api/vent/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          userId: "user_primary",
          entryId: `vent_${Date.now()}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.entry) {
          const current = await this.getJournalEntries();
          const updated = [data.entry, ...current];
          localStorage.setItem(LOCAL_STORAGE_KEYS.JOURNAL, JSON.stringify(updated));
        }
        return data;
      }
    } catch (e) {
      console.error("API vent error:", e);
    }

    // Offline fallback reflection
    const fallbackEntry: VentJournalItem = {
      id: `vent_${Date.now()}`,
      userId: "user_primary",
      date: new Date().toISOString().slice(0, 10),
      timestamp: Date.now(),
      text,
      reflection: "Thank you for putting this into words. Taking a moment to express what you feel is an act of gentle self-care.",
      isFlaggedCrisis: false,
    };
    const current = await this.getJournalEntries();
    const updated = [fallbackEntry, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEYS.JOURNAL, JSON.stringify(updated));

    return {
      isCrisis: false,
      entry: fallbackEntry,
      monthlyEntriesCount: 1,
      isAtLimit: false,
      isPlus: false,
    };
  },

  async deleteJournalEntry(id: string): Promise<boolean> {
    try {
      await fetch(`/api/journal/${id}`, { method: "DELETE" });
    } catch {
      // fallback
    }
    const current = await this.getJournalEntries();
    const updated = current.filter((j) => j.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.JOURNAL, JSON.stringify(updated));
    return true;
  },

  async clearAllJournal(): Promise<boolean> {
    try {
      await fetch("/api/journal?userId=user_primary", { method: "DELETE" });
    } catch {
      // fallback
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.JOURNAL, JSON.stringify([]));
    return true;
  },

  // User Profile & Subscription
  async getUser(): Promise<UserProfile> {
    try {
      const res = await fetch("/api/user?userId=user_primary");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch {
      // fallback
    }
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    return cached ? JSON.parse(cached) : defaultUser;
  },

  async updateUser(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user_primary", updates }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch {
      // fallback
    }
    const current = await this.getUser();
    const updated = { ...current, ...updates };
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(updated));
    return updated;
  },

  async completeSession(sessionId: string): Promise<string[]> {
    try {
      const res = await fetch("/api/sessions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user_primary", sessionId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.completedSessions) {
          const user = await this.getUser();
          user.completedSessions = data.completedSessions;
          localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
          return data.completedSessions;
        }
      }
    } catch {
      // fallback
    }
    const user = await this.getUser();
    if (!user.completedSessions.includes(sessionId)) {
      user.completedSessions = [...user.completedSessions, sessionId];
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
    }
    return user.completedSessions;
  },

  async upgradeSubscription(plan: "monthly" | "yearly", startTrial = false): Promise<UserProfile> {
    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user_primary", plan, startTrial }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch {
      // fallback
    }
    const user = await this.getUser();
    user.isPlus = true;
    user.subscriptionPlan = plan;
    if (startTrial) {
      const t = new Date();
      t.setDate(t.getDate() + 7);
      user.trialEndsAt = t.toISOString();
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  async cancelSubscription(): Promise<UserProfile> {
    try {
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user_primary" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch {
      // fallback
    }
    const user = await this.getUser();
    user.isPlus = false;
    user.subscriptionPlan = "free";
    user.trialEndsAt = undefined;
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  async deleteAccount(): Promise<boolean> {
    try {
      await fetch("/api/account?userId=user_primary", { method: "DELETE" });
    } catch {
      // ignore
    }
    localStorage.clear();
    return true;
  },

  isOnboardingCompleted(): boolean {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ONBOARDING_DONE) === "true";
  },

  setOnboardingCompleted(): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ONBOARDING_DONE, "true");
  },
};
