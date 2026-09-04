import React from "react";
import { ShieldAlert, Sparkles, Heart } from "lucide-react";
import { UserProfile, TabType } from "../types";

interface HeaderProps {
  user: UserProfile;
  activeTab: TabType;
  onOpenCrisis: () => void;
  onOpenPaywall: () => void;
  onSelectTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenCrisis,
  onOpenPaywall,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#DDD6CC] px-4 py-3 flex items-center justify-between shadow-xs">
      {/* Brand logo / Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#2A5A3B] flex items-center justify-center shadow-xs">
          <Heart className="w-4 h-4 text-[#FFFFFF] fill-[#FFFFFF]" />
        </div>
        <div>
          <h1 className="font-serif italic text-lg font-bold tracking-tight text-[#1A1C19] leading-none">
            Check-In
          </h1>
          <p className="text-[11px] text-[#484E48] font-semibold tracking-wide">
            Daily Micro-Support
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Plus / Trial Status Pill */}
        {user.isPlus ? (
          <button
            onClick={onOpenPaywall}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF3EB] border border-[#2A5A3B] text-[#1B4B27] text-xs font-bold hover:bg-[#D7E9D9] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2A5A3B]" />
            <span>Plus Active</span>
          </button>
        ) : (
          <button
            onClick={onOpenPaywall}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#CDC4B6] text-[#2A5A3B] text-xs font-bold hover:bg-[#EAF3EB] hover:border-[#2A5A3B] transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2A5A3B]" />
            <span>Try Plus</span>
          </button>
        )}

        {/* Persistent 1-Tap Crisis Access */}
        <button
          onClick={onOpenCrisis}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C2381E] text-[#FFFFFF] text-xs font-bold hover:bg-[#A92E17] transition-all shadow-xs active:scale-95"
          title="Immediate free crisis support and resources"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-white" />
          <span>Crisis Support</span>
        </button>
      </div>
    </header>
  );
};
