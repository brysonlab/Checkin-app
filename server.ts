import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import {
  generateJournalReflection,
  getGeminiModelName,
} from "./src/server/geminiService.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

// In-memory persistent data store with mock user ID support
interface CheckInItem {
  id: string;
  userId: string;
  date: string;
  time: string;
  mood: number; // 1 to 5
  note?: string;
  tags?: string[];
  updatedAt: string;
}

interface VentJournalItem {
  id: string;
  userId: string;
  date: string;
  timestamp: number;
  text: string;
  reflection?: string;
  isFlaggedCrisis?: boolean;
}

interface UserState {
  id: string;
  email?: string;
  name?: string;
  isPlus: boolean;
  trialEndsAt?: string;
  subscriptionPlan?: "free" | "monthly" | "yearly";
  completedSessions: string[];
  focusAreas: string[];
  reminderTime?: string;
  notificationsEnabled: boolean;
  createdAt: string;
}

// Safety risk keywords dictionary for server-side evaluation
const CRISIS_INDICATORS = [
  "suicide",
  "kill myself",
  "want to die",
  "end it all",
  "end my life",
  "hurt myself",
  "self harm",
  "self-harm",
  "not worth living",
  "better off dead",
  "take my life",
  "cutting myself",
  "overdose",
  "hang myself",
  "slit my",
  "jump off",
  "no reason to live",
  "can't go on anymore",
  "goodbye note",
];

// Anonymized safety metrics log (no personal text stored)
let safetyTriggerCount = 0;

// Database mock storage
const checkInsStore: Map<string, CheckInItem> = new Map();
const journalStore: Map<string, VentJournalItem> = new Map();
const usersStore: Map<string, UserState> = new Map();

// Helper to get or create default user
function getUser(userId: string): UserState {
  if (!usersStore.has(userId)) {
    usersStore.set(userId, {
      id: userId,
      email: "guest@checkin.internal",
      isPlus: false,
      subscriptionPlan: "free",
      completedSessions: [],
      focusAreas: ["General check-ins"],
      notificationsEnabled: false,
      createdAt: new Date().toISOString(),
    });
  }
  return usersStore.get(userId)!;
}

// Helper to scan text for crisis risk
function scanForCrisis(text: string): { isCrisis: boolean; matchedKeyword?: string } {
  if (!text) return { isCrisis: false };
  const lower = text.toLowerCase();
  for (const keyword of CRISIS_INDICATORS) {
    if (lower.includes(keyword)) {
      return { isCrisis: true, matchedKeyword: keyword };
    }
  }
  return { isCrisis: false };
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    model: getGeminiModelName(),
    timestamp: new Date().toISOString(),
  });
});

// 2. Safety text check
app.post("/api/safety/check", (req: Request, res: Response) => {
  const { text } = req.body;
  const result = scanForCrisis(text || "");
  if (result.isCrisis) {
    safetyTriggerCount++;
  }
  res.json({
    isCrisis: result.isCrisis,
    disclaimer: "Check-In is not a replacement for medical care or emergency crisis response.",
  });
});

// 3. Vent Journal Reflection Endpoint (Strictly server-side with Gemini + Crisis Gateway)
app.post("/api/vent/reflect", async (req: Request, res: Response) => {
  try {
    const { text, userId = "default-user", entryId } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Text is required." });
    }

    // Step 1: Safety & Crisis Check ALWAYS FIRST (Pre-empts AI entirely)
    const safetyCheck = scanForCrisis(text);
    if (safetyCheck.isCrisis) {
      safetyTriggerCount++;
      return res.json({
        isCrisis: true,
        reflection: null,
        message: "We noticed language that suggests you may be in distress. Your safety is our highest priority.",
        crisisResources: {
          usLifeline: "988 (Call or Text)",
          usTextLine: "Text HOME to 741741",
          intlHelp: "https://findahelpline.com",
        },
      });
    }

    // Step 2: Rate/Quota Check for Freemium Tier
    const user = getUser(userId);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const userEntriesThisMonth = Array.from(journalStore.values()).filter(
      (j) => j.userId === userId && j.date.startsWith(currentMonth)
    );

    const isFreeTier = !user.isPlus;
    const isAtLimit = isFreeTier && userEntriesThisMonth.length >= 5;

    // Step 3: Generate warm, validating, non-advice reflection via Google Cloud Gemini
    const reflectionResult = await generateJournalReflection(text);
    const reflection = reflectionResult.reflection;

    // Save journal entry
    const savedEntry: VentJournalItem = {
      id: entryId || `vent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      date: new Date().toISOString().slice(0, 10),
      timestamp: Date.now(),
      text,
      reflection,
      isFlaggedCrisis: false,
    };
    journalStore.set(savedEntry.id, savedEntry);

    res.json({
      isCrisis: false,
      entry: savedEntry,
      reflection,
      source: reflectionResult.source,
      modelUsed: reflectionResult.modelUsed,
      monthlyEntriesCount: userEntriesThisMonth.length + 1,
      isAtLimit,
      isPlus: user.isPlus,
    });
  } catch (error: any) {
    console.error("[Vent Endpoint Error]", error?.message || error);
    res.status(500).json({ error: "Failed to generate reflection." });
  }
});

// 4. Check-Ins CRUD
app.get("/api/checkins", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "default-user";
  const userCheckIns = Array.from(checkInsStore.values())
    .filter((c) => c.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));
  res.json({ checkIns: userCheckIns });
});

app.post("/api/checkins", (req: Request, res: Response) => {
  const { userId = "default-user", date, mood, note, tags = [] } = req.body;
  if (!date || mood === undefined) {
    return res.status(400).json({ error: "Date and mood are required." });
  }

  // Pre-scan note for crisis language
  const safety = scanForCrisis(note || "");
  if (safety.isCrisis) {
    safetyTriggerCount++;
  }

  const id = `${userId}_${date}`;
  const existing = checkInsStore.get(id);

  const checkIn: CheckInItem = {
    id,
    userId,
    date,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    mood: Number(mood),
    note: note || "",
    tags,
    updatedAt: new Date().toISOString(),
  };

  checkInsStore.set(id, checkIn);
  res.json({ checkIn, isExistingUpdate: !!existing, safetyRiskDetected: safety.isCrisis });
});

app.delete("/api/checkins/:date", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "default-user";
  const date = req.params.date;
  const id = `${userId}_${date}`;
  const deleted = checkInsStore.delete(id);
  res.json({ success: deleted });
});

// 5. Journal Entries
app.get("/api/journal", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "default-user";
  const entries = Array.from(journalStore.values())
    .filter((j) => j.userId === userId)
    .sort((a, b) => b.timestamp - a.timestamp);
  res.json({ entries });
});

app.delete("/api/journal/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = journalStore.delete(id);
  res.json({ success: deleted });
});

app.delete("/api/journal", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "default-user";
  let count = 0;
  for (const [id, entry] of journalStore.entries()) {
    if (entry.userId === userId) {
      journalStore.delete(id);
      count++;
    }
  }
  res.json({ success: true, deletedCount: count });
});

// 6. User profile, preferences & session tracking
app.get("/api/user", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "default-user";
  const user = getUser(userId);
  res.json({ user });
});

app.post("/api/user", (req: Request, res: Response) => {
  const { userId = "default-user", updates } = req.body;
  const user = getUser(userId);
  const updatedUser = { ...user, ...updates };
  usersStore.set(userId, updatedUser);
  res.json({ user: updatedUser });
});

app.post("/api/sessions/complete", (req: Request, res: Response) => {
  const { userId = "default-user", sessionId } = req.body;
  const user = getUser(userId);
  if (sessionId && !user.completedSessions.includes(sessionId)) {
    user.completedSessions.push(sessionId);
    usersStore.set(userId, user);
  }
  res.json({ completedSessions: user.completedSessions });
});

// 7. Subscription & Entitlements Management (RevenueCat/Stripe Simulation)
app.post("/api/subscription/upgrade", (req: Request, res: Response) => {
  const { userId = "default-user", plan = "monthly", startTrial = false } = req.body;
  const user = getUser(userId);
  user.isPlus = true;
  user.subscriptionPlan = plan;
  if (startTrial) {
    const trialDate = new Date();
    trialDate.setDate(trialDate.getDate() + 7);
    user.trialEndsAt = trialDate.toISOString();
  } else {
    user.trialEndsAt = undefined;
  }
  usersStore.set(userId, user);
  res.json({
    success: true,
    user,
    message: startTrial ? "7-day free trial started." : "Check-In Plus activated.",
  });
});

app.post("/api/subscription/cancel", (req: Request, res: Response) => {
  const { userId = "default-user" } = req.body;
  const user = getUser(userId);
  user.isPlus = false;
  user.subscriptionPlan = "free";
  user.trialEndsAt = undefined;
  usersStore.set(userId, user);
  res.json({ success: true, user, message: "Subscription returned to Free tier." });
});

// 8. Data Export (GDPR / Data Sovereignty & Therapist Sharing)
app.get("/api/account/export", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "default-user";
  const user = getUser(userId);
  const userCheckIns = Array.from(checkInsStore.values()).filter((c) => c.userId === userId);
  const userJournal = Array.from(journalStore.values()).filter((j) => j.userId === userId);

  const exportPayload = {
    app: "Check-In Mental Health Micro-Support",
    exportDate: new Date().toISOString(),
    user: {
      id: user.id,
      focusAreas: user.focusAreas,
      completedSessionsCount: user.completedSessions.length,
      createdAt: user.createdAt,
    },
    checkInsCount: userCheckIns.length,
    checkIns: userCheckIns,
    journalCount: userJournal.length,
    journalEntries: userJournal.map((j) => ({
      date: j.date,
      timestamp: j.timestamp,
      text: j.text,
      reflection: j.reflection,
    })),
    privacyNotice: "This data was exported directly by the user. Check-In does not sell or share data.",
  };

  res.setHeader("Content-Disposition", `attachment; filename=checkin_export_${Date.now()}.json`);
  res.json(exportPayload);
});

// 9. Full Account Deletion (GDPR Right to be Forgotten)
app.delete("/api/account", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "default-user";

  // Wipe checkins
  for (const [id, c] of checkInsStore.entries()) {
    if (c.userId === userId) checkInsStore.delete(id);
  }
  // Wipe journal
  for (const [id, j] of journalStore.entries()) {
    if (j.userId === userId) journalStore.delete(id);
  }
  // Wipe user
  usersStore.delete(userId);

  res.json({ success: true, message: "All account records permanently deleted." });
});

// 10. Safety Layer Anonymized Metrics (Zero raw content exposed)
app.get("/api/safety/stats", (_req: Request, res: Response) => {
  res.json({
    totalCrisisInterventions: safetyTriggerCount,
    disclaimer: "Strict zero-content privacy enforced. Only trigger occurrences are counted for safety auditing.",
  });
});

// Catch-all for API routes so they return JSON 404 and NEVER fall through to the React SPA
app.all("/api/*", (_req: Request, res: Response) => {
  res.status(404).json({ error: "API route not found" });
});
app.all("/api", (_req: Request, res: Response) => {
  res.status(404).json({ error: "API route not found" });
});

// ----------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ error: "API route not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Check-In server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app };

