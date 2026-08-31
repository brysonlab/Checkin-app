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
          <div className="bg-[#FFFFFF] border border-[#E8E4DF] p-2.5 rounded-xl text-xs text-[#7C827B] shadow-md">
            <span>{data.displayDate} ({data.weekday}): No check-in logged</span>
          </div>
        );
      }
      const moodObj = MOODS.find((m) => m.id === data.mood);
      return (
        <div className="bg-[#FFFFFF] border border-[#E8E4DF] p-3 rounded-2xl text-xs shadow-md space-y-1">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-[#2D302E]">{data.displayDate} ({data.weekday})</span>
            <span className="font-semibold" style={{ color: moodObj?.color }}>
              {moodObj?.label} ({data.mood}/5)
            </span>
          </div>
          {data.note && (
            <p className="text-[11px] text-[#4A5049] italic max-w-xs pt-1 border-t border-[#E8E4DF]">
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
          <h2 className="font-serif italic text-2xl sm:text-3xl font-medium text-[#2D302E]">
            Mood History & Trends
          </h2>
          <p className="text-xs sm:text-sm text-[#7C827B] mt-1">
            Observing patterns over time without judgment or clinical pressure.
          </p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between bg-[#FAF8F5] border border-[#E8E4DF] rounded-2xl p-1.5 shadow-xs">
        <button
          onClick={() => handleSelectRange(7)}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            timeRange === 7 ? "bg-[#8E9F85] text-white shadow-xs" : "text-[#7C827B] hover:text-[#2D302E]"
          }`}
        >
          7 Days
        </button>

        <button
          onClick={() => handleSelectRange(14)}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            timeRange === 14 ? "bg-[#8E9F85] text-white shadow-xs" : "text-[#7C827B] hover:text-[#2D302E]"
          }`}
        >
          14 Days
        </button>

        <button
          onClick={() => handleSelectRange(30)}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 ${
            timeRange === 30
              ? "bg-[#8E9F85] text-white shadow-xs"
              : "text-[#7C827B] hover:text-[#2D302E]"
          }`}
        >
          <span>30 Days</span>
          {!user.isPlus && <Lock className="w-3 h-3 text-[#D29F54]" />}
        </button>
      </div>

      {/* Main Chart Card */}
      <div className="bg-[#FFFFFF] border border-[#E8E4DF] rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs text-[#7C827B] px-1">
          <span className="font-semibold text-[#2D302E]">Daily Mood Trajectory</span>
          <span>5: Great · 1: Rough</span>
        </div>

        {loggedItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#7C827B] space-y-3">
            <BarChart2 className="w-8 h-8 text-[#D9D4CC] mx-auto" />
            <p>No check-ins logged for this time window yet.</p>
            <button
              onClick={onNavigateToCheckIn}
              className="py-2 px-4 rounded-xl bg-[#8E9F85] text-white font-bold text-xs hover:bg-[#7D8F75] transition-all shadow-xs"
            >
              Log Today's Mood
            </button>
          </div>
        ) : (
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#E8E4DF" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#A8A29E"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="#A8A29E"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#8E9F85"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#8E9F85", strokeWidth: 2, stroke: "#FFFFFF" }}
                  activeDot={{ r: 6, fill: "#FFFFFF", stroke: "#8E9F85", strokeWidth: 2 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Observational Pattern Callout (Non-Diagnostic) */}
      <div className="bg-[#FAF8F5] border border-[#E8E4DF] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#4A5049] shadow-xs">
        <Lightbulb className="w-5 h-5 text-[#D29F54] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-[#2D302E]">Gentle Observations</div>
          <p className="leading-relaxed text-[#7C827B]">{patternCallout}</p>
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="bg-[#FFFFFF] border border-[#E8E4DF] rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="font-serif italic text-base font-medium text-[#2D302E]">
          Distribution ({loggedItems.length} {loggedItems.length === 1 ? "entry" : "entries"})
        </h3>

        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((m) => {
            const count = moodCounts[m.id as keyof typeof moodCounts] || 0;
            const pct = loggedItems.length > 0 ? Math.round((count / loggedItems.length) * 100) : 0;
            return (
              <div
                key={m.id}
                className="bg-[#FAF8F5] border border-[#E8E4DF] rounded-2xl p-2.5 text-center flex flex-col items-center justify-between shadow-xs"
              >
                <span className="text-[11px] font-semibold" style={{ color: m.color }}>
                  {m.label}
                </span>
                <span className="text-base font-bold text-[#2D302E] my-1 font-serif italic">
                  {count}
                </span>
                <span className="text-[10px] text-[#7C827B]">
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
