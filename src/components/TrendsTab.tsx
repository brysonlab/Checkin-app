import React, { useState } from "react";
import { TrendingUp, Sparkles, Lock, Calendar, Lightbulb, BarChart2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { CheckInItem, UserProfile } from "../types";
import { MOODS } from "../data/moodsData";

interface TrendsTabProps {
  user: UserProfile;
  checkIns: CheckInItem[];
  onOpenPaywall: () => void;
  onNavigateToCheckIn: () => void;
}

export const TrendsTab: React.FC<TrendsTabProps> = ({
  user,
  checkIns,
  onOpenPaywall,
  onNavigateToCheckIn,
}) => {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);

  const handleSelectRange = (range: 7 | 14 | 30) => {
    if (range === 30 && !user.isPlus) {
      onOpenPaywall();
      return;
    }
    setTimeRange(range);
  };

  // Build sequential timeline data for the chosen range
  const chartData = [];
  const today = new Date();

  for (let i = timeRange - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const item = checkIns.find((c) => c.date === dateStr);

    chartData.push({
      dateStr,
      displayDate: d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" }),
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
      mood: item ? item.mood : null,
      moodLabel: item ? MOODS.find((m) => m.id === item.mood)?.label : undefined,
      note: item ? item.note : undefined,
      hasNote: !!(item && item.note),
    });
  }

  // Observational Pattern Insights (Non-diagnostic)
  const loggedItems = checkIns.filter((c) => {
    const checkDate = new Date(c.date);
    const diffDays = Math.floor((today.getTime() - checkDate.getTime()) / (1000 * 3600 * 24));
    return diffDays < timeRange;
  });

  const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  loggedItems.forEach((c) => {
    if (moodCounts[c.mood as keyof typeof moodCounts] !== undefined) {
      moodCounts[c.mood as keyof typeof moodCounts]++;
    }
  });

  // Calculate weekday averages to find subtle observational patterns
  const weekdayMoods: Record<string, number[]> = {};
  loggedItems.forEach((c) => {
    const day = new Date(c.date).toLocaleDateString(undefined, { weekday: "long" });
    if (!weekdayMoods[day]) weekdayMoods[day] = [];
    weekdayMoods[day].push(c.mood);
  });

  let patternCallout = "You are building a compassionate, non-judgmental record of how your days feel.";
  let lowestDay = "";
  let highestDay = "";
  let minAvg = 99;
  let maxAvg = 0;

  Object.keys(weekdayMoods).forEach((day) => {
    const avg = weekdayMoods[day].reduce((a, b) => a + b, 0) / weekdayMoods[day].length;
    if (avg < minAvg && weekdayMoods[day].length >= 2) {
      minAvg = avg;
      lowestDay = day;
    }
    if (avg > maxAvg && weekdayMoods[day].length >= 2) {
      maxAvg = avg;
      highestDay = day;
    }
  });

  if (lowestDay) {
    patternCallout = `Observational note: Your energy and mood tended to dip slightly on ${lowestDay}s over recent weeks.`;
  } else if (highestDay) {
    patternCallout = `Observational note: You frequently recorded more spacious, steady feelings on ${highestDay}s.`;
  } else if (loggedItems.length >= 5) {
    patternCallout = `You have completed ${loggedItems.length} check-ins in this period. Tracking regularly helps recognize subtle shifts before overwhelm peaks.`;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.mood === null) {
        return (
          <div className="bg-[#FFFFFF] border border-[#DDD6CC] p-2.5 rounded-xl text-xs text-[#5C635C] shadow-md">
            <span>{data.displayDate} ({data.weekday}): No check-in logged</span>
          </div>
        );
      }
      const moodObj = MOODS.find((m) => m.id === data.mood);
      return (
        <div className="bg-[#FFFFFF] border-2 border-[#DDD6CC] p-3 rounded-2xl text-xs shadow-lg space-y-1">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-[#1A1C19]">{data.displayDate} ({data.weekday})</span>
            <span className="font-bold" style={{ color: moodObj?.color }}>
              {moodObj?.label} ({data.mood}/5)
            </span>
          </div>
          {data.note && (
            <p className="text-[11px] text-[#1A1C19] italic max-w-xs pt-1 border-t border-[#DDD6CC] font-medium">
              "{data.note}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#1A1C19]">
            Mood History & Trends
          </h2>
          <p className="text-xs sm:text-sm text-[#414741] mt-1 font-medium">
            Observing patterns over time without judgment or clinical pressure.
          </p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between bg-[#FAF8F5] border border-[#DDD6CC] rounded-2xl p-1.5 shadow-xs">
        <button
          onClick={() => handleSelectRange(7)}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            timeRange === 7 ? "bg-[#2A5A3B] text-white shadow-xs" : "text-[#414741] hover:text-[#1A1C19]"
          }`}
        >
          7 Days
        </button>

        <button
          onClick={() => handleSelectRange(14)}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            timeRange === 14 ? "bg-[#2A5A3B] text-white shadow-xs" : "text-[#414741] hover:text-[#1A1C19]"
          }`}
        >
          14 Days
        </button>

        <button
          onClick={() => handleSelectRange(30)}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
            timeRange === 30
              ? "bg-[#2A5A3B] text-white shadow-xs"
              : "text-[#414741] hover:text-[#1A1C19]"
          }`}
        >
          <span>30 Days</span>
          {!user.isPlus && <Lock className="w-3.5 h-3.5 text-[#C2780E]" />}
        </button>
      </div>

      {/* Main Chart Card */}
      <div className="bg-[#FFFFFF] border border-[#DDD6CC] rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs text-[#414741] px-1">
          <span className="font-bold text-[#1A1C19]">Daily Mood Trajectory</span>
          <span className="font-semibold text-[#5C635C]">5: Great · 1: Rough</span>
        </div>

        {loggedItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#5C635C] space-y-3">
            <BarChart2 className="w-8 h-8 text-[#BDB3A4] mx-auto" />
            <p className="font-medium">No check-ins logged for this time window yet.</p>
            <button
              onClick={onNavigateToCheckIn}
              className="py-2 px-4 rounded-xl bg-[#2A5A3B] text-white font-bold text-xs hover:bg-[#20472E] transition-all shadow-xs"
            >
              Log Today's Mood
            </button>
          </div>
        ) : (
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#DDD6CC" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#414741"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="#414741"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#2A5A3B"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: "#2A5A3B", strokeWidth: 2, stroke: "#FFFFFF" }}
                  activeDot={{ r: 7, fill: "#FFFFFF", stroke: "#2A5A3B", strokeWidth: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Observational Pattern Callout (Non-Diagnostic) */}
      <div className="bg-[#FAF8F5] border border-[#DDD6CC] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#1A1C19] shadow-xs">
        <Lightbulb className="w-5 h-5 text-[#C2780E] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-[#1A1C19]">Gentle Observations</div>
          <p className="leading-relaxed text-[#383E38] font-medium">{patternCallout}</p>
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="bg-[#FFFFFF] border border-[#DDD6CC] rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="font-serif italic text-base font-bold text-[#1A1C19]">
          Distribution ({loggedItems.length} {loggedItems.length === 1 ? "entry" : "entries"})
        </h3>

        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((m) => {
            const count = moodCounts[m.id as keyof typeof moodCounts] || 0;
            const pct = loggedItems.length > 0 ? Math.round((count / loggedItems.length) * 100) : 0;
            return (
              <div
                key={m.id}
                className="bg-[#FAF8F5] border border-[#DDD6CC] rounded-2xl p-2.5 text-center flex flex-col items-center justify-between shadow-xs"
              >
                <span className="text-[11px] font-bold" style={{ color: m.color }}>
                  {m.label}
                </span>
                <span className="text-base font-bold text-[#1A1C19] my-1 font-serif italic">
                  {count}
                </span>
                <span className="text-[10px] text-[#484E48] font-semibold">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
