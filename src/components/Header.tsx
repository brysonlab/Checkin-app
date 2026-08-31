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
    <header className="sticky top-0 z-30 bg-[#FDFCF9]/95 backdrop-blur-md border-b border-[#E8E4DF] px-4 py-3 flex items-center justify-between">
      {/* Brand logo / Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#8E9F85] flex items-center justify-center shadow-xs">
          <Heart className="w-4 h-4 text-[#FDFCF9] fill-[#FDFCF9]" />
        </div>
        <div>
          <h1 className="font-serif italic text-lg font-semibold tracking-tight text-[#2D302E] leading-none">
            Check-In
          </h1>
          <p className="text-[11px] text-[#7C827B] font-medium tracking-wide">
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
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F0F4EE] border border-[#8E9F85]/40 text-[#4D6045] text-xs font-medium hover:bg-[#E5ECE2] transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[#8E9F85]" />
            <span>Plus Active</span>
          </button>
        ) : (
          <button
            onClick={onOpenPaywall}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F7F3EE] border border-[#8E9F85]/40 text-[#53684B] text-xs font-semibold hover:bg-[#F0F4EE] hover:border-[#8E9F85] transition-all"
          >
            <Sparkles className="w-3 h-3 text-[#8E9F85]" />
            <span>Try Plus</span>
          </button>
        )}

        {/* Persistent 1-Tap Crisis Access */}
        <button
          onClick={onOpenCrisis}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D97B66] text-[#FFFFFF] text-xs font-semibold hover:bg-[#C86A55] transition-all shadow-xs"
          title="Immediate free crisis support and resources"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-white" />
          <span>Crisis Support</span>
        </button>
      </div>
    </header>
  );
};
