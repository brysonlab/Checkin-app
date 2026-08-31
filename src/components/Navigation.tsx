import React from "react";
import { Sun, Sparkles, MessageCircleHeart, TrendingUp, Settings } from "lucide-react";
import { TabType } from "../types";

interface NavigationProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  hasCheckedInToday: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  hasCheckedInToday,
}) => {
  const tabs = [
    {
      id: "checkin" as TabType,
      label: "Today",
      icon: Sun,
      badge: !hasCheckedInToday ? "dot" : undefined,
    },
    {
      id: "sessions" as TabType,
      label: "Sessions",
      icon: Sparkles,
    },
    {
      id: "vent" as TabType,
      label: "Vent",
      icon: MessageCircleHeart,
    },
    {
      id: "trends" as TabType,
      label: "Trends",
      icon: TrendingUp,
    },
    {
      id: "settings" as TabType,
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="sticky bottom-0 z-30 bg-[#FDFCF9]/95 backdrop-blur-lg border-t border-[#E8E4DF] px-2 py-1.5 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-[#53684B]"
                  : "text-[#7C827B] hover:text-[#2D302E] hover:bg-[#F4F1EB]"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110 text-[#8E9F85]" : "text-[#7C827B]"}`} />
                {tab.badge === "dot" && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#8E9F85] ring-2 ring-[#FDFCF9]" />
                )}
              </div>
              <span className={`text-[11px] mt-1 font-medium tracking-tight ${isActive ? "font-semibold text-[#53684B]" : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
