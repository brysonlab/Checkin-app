export type TabType = "checkin" | "sessions" | "vent" | "trends" | "settings";

export interface MoodConfig {
  id: number;
  label: string;
  subtext: string;
  size: number;
  color: string;
  activeBorder: string;
  bgGlow: string;
  shapeClass: string;
}

export interface CheckInItem {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  time: string;
  mood: number; // 1 (Rough) to 5 (Great)
  note?: string;
  tags?: string[];
  updatedAt: string;
}

export interface VentJournalItem {
  id: string;
  userId: string;
  date: string;
  timestamp: number;
  text: string;
  reflection?: string;
  isFlaggedCrisis?: boolean;
}

export interface GuidedSession {
  id: string;
  title: string;
  duration: string;
  tag: string;
  tagColor?: string;
  summary: string;
  isFree: boolean;
  breathingType?: "box" | "relaxing" | "none";
  steps: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  isPlus: boolean;
  trialEndsAt?: string;
  subscriptionPlan: "free" | "monthly" | "yearly";
  completedSessions: string[];
  focusAreas: string[];
  reminderTime?: string;
  notificationsEnabled: boolean;
  createdAt: string;
}

export interface CrisisResource {
  name: string;
  phone?: string;
  text?: string;
  description: string;
  coverage: string;
  url?: string;
  badge?: string;
}
