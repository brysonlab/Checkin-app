import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { CrisisModal } from "./components/CrisisModal";
import { OnboardingModal } from "./components/OnboardingModal";
import { PaywallModal } from "./components/PaywallModal";
import { TherapistExportModal } from "./components/TherapistExportModal";
import { CheckInTab } from "./components/CheckInTab";
import { SessionsTab } from "./components/SessionsTab";
import { VentTab } from "./components/VentTab";
import { TrendsTab } from "./components/TrendsTab";
import { SettingsTab } from "./components/SettingsTab";
import { TabType, UserProfile, CheckInItem, VentJournalItem } from "./types";
import { StorageService, defaultUser } from "./utils/storage";
import { ShieldCheck, Sparkles, Heart } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("checkin");
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [checkIns, setCheckIns] = useState<CheckInItem[]>([]);
  const [journalEntries, setJournalEntries] = useState<VentJournalItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState<boolean>(false);
  const [isCrisisSafetyTriggered, setIsCrisisSafetyTriggered] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isTherapistExportOpen, setIsTherapistExportOpen] = useState<boolean>(false);

  // Initialize data on load
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [userData, checkInsData, journalData] = await Promise.all([
          StorageService.getUser(),
          StorageService.getCheckIns(),
          StorageService.getJournalEntries(),
        ]);

        setUser(userData);
        setCheckIns(checkInsData);
        setJournalEntries(journalData);

        // Check if onboarding is needed
        if (!StorageService.isOnboardingCompleted()) {
          setIsOnboardingOpen(true);
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const hasCheckedInToday = checkIns.some((c) => c.date === todayStr);

  const handleOnboardingComplete = async (focusAreas: string[], name: string, email: string) => {
    StorageService.setOnboardingCompleted();
    setIsOnboardingOpen(false);
    const updated = await StorageService.updateUser({
      focusAreas,
      name,
      email,
    });
    setUser(updated);
  };

  const handleCheckInSaved = (savedItem: CheckInItem) => {
    setCheckIns((prev) => {
      const filtered = prev.filter((c) => c.date !== savedItem.date);
      return [savedItem, ...filtered];
    });
  };

  const handleSessionCompleted = (sessionId: string) => {
    setUser((prev) => {
      if (prev.completedSessions.includes(sessionId)) return prev;
      return { ...prev, completedSessions: [...prev.completedSessions, sessionId] };
    });
  };

  const handleJournalAdded = (entry: VentJournalItem) => {
    setJournalEntries((prev) => [entry, ...prev]);
  };

  const handleJournalDeleted = (id: string) => {
    setJournalEntries((prev) => prev.filter((j) => j.id !== id));
  };

  const handleUpgrade = async (plan: "monthly" | "yearly", startTrial: boolean) => {
    const updated = await StorageService.upgradeSubscription(plan, startTrial);
    setUser(updated);
  };

  const handleCancelPlan = async () => {
    const updated = await StorageService.cancelSubscription();
    setUser(updated);
  };

  const handleResetAllData = () => {
    setUser(defaultUser);
    setCheckIns([]);
    setJournalEntries([]);
    setActiveTab("checkin");
    setIsOnboardingOpen(true);
  };

  const openCrisisModal = (triggeredBySafety = false) => {
    setIsCrisisSafetyTriggered(triggeredBySafety);
    setIsCrisisModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F1EB] flex items-center justify-center text-[#7C827B]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#8E9F85] border-t-transparent animate-spin" />
          <span className="text-sm font-serif italic text-[#4A5049]">Opening Check-In...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EB] text-[#2D302E] flex justify-center selection:bg-[#8E9F85]/20">
      {/* Mobile-first centered app shell container */}
      <div className="w-full max-w-md min-h-screen bg-[#FDFCF9] flex flex-col shadow-xl border-x border-[#E8E4DF] relative">
        {/* Sticky Header */}
        <Header
          user={user}
          activeTab={activeTab}
          onOpenCrisis={() => openCrisisModal(false)}
          onOpenPaywall={() => setIsPaywallOpen(true)}
          onSelectTab={setActiveTab}
        />

        {/* Persistent 1-tap Disclaimer Sub-Bar */}
        <div className="bg-[#F7F3EE] border-b border-[#E8E4DF] px-4 py-1.5 flex items-center justify-between text-[11px] text-[#7C827B]">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8E9F85] flex-shrink-0" />
            <span className="truncate">Not a substitute for therapy · 24/7 Crisis Support (988)</span>
          </div>

          <button
            onClick={() => openCrisisModal(false)}
            className="text-[10px] text-[#D97B66] font-semibold hover:underline flex-shrink-0 ml-2"
          >
            Lifeline info
          </button>
        </div>

        {/* Main Tab Content */}
        <main className="flex-1 p-4 sm:p-5 overflow-y-auto">
          {activeTab === "checkin" && (
            <CheckInTab
              user={user}
              checkIns={checkIns}
              onCheckInSaved={handleCheckInSaved}
              onOpenCrisis={() => openCrisisModal(true)}
              onNavigateToSessions={() => setActiveTab("sessions")}
            />
          )}

          {activeTab === "sessions" && (
            <SessionsTab
              user={user}
              onSessionCompleted={handleSessionCompleted}
              onOpenPaywall={() => setIsPaywallOpen(true)}
            />
          )}

          {activeTab === "vent" && (
            <VentTab
              user={user}
              journalEntries={journalEntries}
              onEntryAdded={handleJournalAdded}
              onEntryDeleted={handleJournalDeleted}
              onOpenCrisis={() => openCrisisModal(true)}
              onOpenPaywall={() => setIsPaywallOpen(true)}
            />
          )}

          {activeTab === "trends" && (
            <TrendsTab
              user={user}
              checkIns={checkIns}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onNavigateToCheckIn={() => setActiveTab("checkin")}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab
              user={user}
              checkIns={checkIns}
              journalEntries={journalEntries}
              onOpenCrisis={() => openCrisisModal(false)}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onOpenTherapistExport={() => setIsTherapistExportOpen(true)}
              onUserUpdated={setUser}
              onResetAllData={handleResetAllData}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <Navigation
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          hasCheckedInToday={hasCheckedInToday}
        />

        {/* Global Modals */}
        <CrisisModal
          isOpen={isCrisisModalOpen}
          isTriggeredBySafetyCheck={isCrisisSafetyTriggered}
          onClose={() => setIsCrisisModalOpen(false)}
        />

        <OnboardingModal
          isOpen={isOnboardingOpen}
          onComplete={handleOnboardingComplete}
          onOpenCrisis={() => openCrisisModal(false)}
        />

        <PaywallModal
          isOpen={isPaywallOpen}
          user={user}
          onClose={() => setIsPaywallOpen(false)}
          onUpgrade={handleUpgrade}
          onCancelPlan={handleCancelPlan}
        />

        <TherapistExportModal
          isOpen={isTherapistExportOpen}
          user={user}
          checkIns={checkIns}
          journalEntries={journalEntries}
          onClose={() => setIsTherapistExportOpen(false)}
        />
      </div>
    </div>
  );
}
