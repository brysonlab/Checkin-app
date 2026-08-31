import React, { useRef } from "react";
import { X, Printer, Download, ShieldCheck, Heart } from "lucide-react";
import { CheckInItem, VentJournalItem, UserProfile } from "../types";
import { MOODS } from "../data/moodsData";

interface TherapistExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  checkIns: CheckInItem[];
  journalEntries: VentJournalItem[];
}

export const TherapistExportModal: React.FC<TherapistExportModalProps> = ({
  isOpen,
  onClose,
  user,
  checkIns,
  journalEntries,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const last14CheckIns = [...checkIns]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);

  const avgScore =
    checkIns.length > 0
      ? (checkIns.reduce((acc, c) => acc + c.mood, 0) / checkIns.length).toFixed(1)
      : "N/A";

  const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  checkIns.forEach((c) => {
    if (moodCounts[c.mood as keyof typeof moodCounts] !== undefined) {
      moodCounts[c.mood as keyof typeof moodCounts]++;
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            reportTitle: "Check-In Client Self-Report",
            generatedAt: new Date().toISOString(),
            user: { name: user.name, focusAreas: user.focusAreas },
            summary: {
              totalCheckIns: checkIns.length,
              averageMoodScore: avgScore,
              distribution: moodCounts,
            },
            checkIns,
            journalCount: journalEntries.length,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `checkin_therapist_summary_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D302E]/60 backdrop-blur-sm animate-fade-in overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] border border-[#E8E4DF] rounded-3xl p-6 text-[#2D302E] shadow-xl my-8 print:border-none print:bg-white print:text-black print:p-0 print:shadow-none">
        {/* Actions bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DF] mb-5 print:hidden">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#8E9F85]" />
            <h2 className="font-serif italic text-lg font-semibold text-[#2D302E]">
              Therapist / Clinical Summary
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#2D302E] hover:bg-[#F0EDE6] transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#8E9F85]" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#2D302E] hover:bg-[#F0EDE6] transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#8E9F85]" />
              <span>JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#7C827B] hover:text-[#2D302E] hover:bg-[#FAF8F5] transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div ref={printRef} className="space-y-6 text-sm text-[#4A5049] print:text-black">
          {/* Header info */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E4DF] print:bg-gray-50 print:border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif italic text-xl font-bold text-[#2D302E] print:text-black">
                  Check-In Emotional Trajectory Summary
                </h3>
                <p className="text-xs text-[#7C827B] print:text-gray-600 mt-1">
                  Prepared for: <span className="text-[#2D302E] print:text-black font-semibold">{user.name || "Client"}</span> · Exported on {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#F0F4EE] text-[#4D6045] font-semibold border border-[#8E9F85]/30 print:border-gray-300 print:text-gray-800">
                  Client Self-Report
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-[#E8E4DF] print:border-gray-200 text-center">
              <div>
                <div className="text-[11px] text-[#7C827B] print:text-gray-600">Total Check-Ins</div>
                <div className="text-lg font-bold text-[#2D302E] print:text-black">{checkIns.length}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#7C827B] print:text-gray-600">Average Mood (1-5)</div>
                <div className="text-lg font-bold font-serif italic text-[#53684B] print:text-black">{avgScore} / 5.0</div>
              </div>
              <div>
                <div className="text-[11px] text-[#7C827B] print:text-gray-600">Focus Areas</div>
                <div className="text-xs font-medium text-[#2D302E] print:text-black truncate">
                  {user.focusAreas.join(", ") || "General"}
                </div>
              </div>
            </div>
          </div>

          {/* Mood Distribution */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#7C827B] print:text-gray-600 font-semibold mb-2">
              Mood Breakdown Over Logged Days
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => {
                const count = moodCounts[m.id as keyof typeof moodCounts] || 0;
                const pct = checkIns.length > 0 ? Math.round((count / checkIns.length) * 100) : 0;
                return (
                  <div key={m.id} className="bg-[#FAF8F5] p-2.5 rounded-xl text-center border border-[#E8E4DF] print:border-gray-200 print:bg-gray-50">
                    <div className="text-xs font-semibold" style={{ color: m.color }}>{m.label}</div>
                    <div className="text-base font-bold text-[#2D302E] print:text-black mt-0.5">{count}</div>
                    <div className="text-[10px] text-[#7C827B] print:text-gray-500">{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent check-in entries with notes */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#7C827B] print:text-gray-600 font-semibold mb-2">
              Recent Check-Ins & Notes (Last 14 Logs)
            </h4>
            {last14CheckIns.length === 0 ? (
              <p className="text-xs text-[#7C827B] italic">No check-ins logged yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 print:max-h-none">
                {last14CheckIns.map((c) => {
                  const moodObj = MOODS.find((m) => m.id === c.mood);
                  return (
                    <div key={c.id} className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E4DF] flex items-start justify-between gap-3 print:border-gray-200 print:bg-gray-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#2D302E] print:text-black">{c.date}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: `${moodObj?.color}25`, color: moodObj?.color }}>
                            {moodObj?.label} ({c.mood}/5)
                          </span>
                        </div>
                        {c.note ? (
                          <p className="text-xs text-[#4A5049] print:text-gray-800 mt-1.5 italic">
                            "{c.note}"
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#7C827B] print:text-gray-500 mt-1">No note attached</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Clinical Disclaimer */}
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DF] flex items-start gap-2.5 text-[11px] text-[#7C827B] print:border-gray-200 print:bg-gray-100 print:text-gray-600">
            <ShieldCheck className="w-4 h-4 text-[#8E9F85] flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#2D302E]">Notice:</strong> This document represents subjective client self-monitoring data recorded in the Check-In micro-support app. It is not an automated diagnosis or psychological evaluation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
