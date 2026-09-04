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
    <nav className="sticky bottom-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-lg border-t border-[#DDD6CC] px-2 py-1.5 safe-area-pb shadow-xs">
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
                  ? "text-[#1B4B27]"
                  : "text-[#4D534D] hover:text-[#1A1C19] hover:bg-[#F3EFE6]"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110 text-[#2A5A3B] stroke-[2.5]" : "text-[#5C635C] stroke-[2]"}`} />
                {tab.badge === "dot" && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#2A5A3B] ring-2 ring-[#FFFFFF]" />
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? "font-bold text-[#1B4B27]" : "font-medium text-[#4D534D]"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
