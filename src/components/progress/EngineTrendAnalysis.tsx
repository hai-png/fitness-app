/**
 * EngineTrendAnalysis — extracted from ProgressTab.tsx (A-01 god-component split).
 *
 * Displays the engine's evidence-based trend analysis: weekly average weight,
 * rate of change (lb/week), adaptation phase, and action recommendation
 * (act / wait / adaptation_phase / monitor).
 *
 * Requires at least 7 days of weight data to render the full panel;
 * otherwise shows a "needs more data" callout.
 */
import { useMemo } from "react";
import { TrendingUp, Activity } from "lucide-react";
import type { DailyWeightLog } from "../../engine";
import {
  weeklyAverageWeightKg,
  weeklyRateLbPerWeek,
  interpretWeightTrend,
} from "../../engine";
import { useUserStore } from "../../store/useUserStore";
import { useIntakeStore } from "../../store/useIntakeStore";

interface EngineTrendAnalysisProps {
  weightLogs: DailyWeightLog[];
}

export function EngineTrendAnalysis({ weightLogs }: EngineTrendAnalysisProps) {
  const onboardingInput = useUserStore((s) => s.onboardingInput);
  const engineProfile = useUserStore((s) => s.engineProfile);
  const intakeLogs = useIntakeStore((s) => s.intakeLogs);

  const dailyWeights = weightLogs;

  const weeklyAvg = useMemo(() => weeklyAverageWeightKg(dailyWeights), [dailyWeights]);
  const rateLbPerWeek = useMemo(() => weeklyRateLbPerWeek(dailyWeights), [dailyWeights]);

  const phase: "cut" | "bulk" | "recomp" | "maintain" = (() => {
    const goal = onboardingInput?.goal;
    if (goal === "weight-loss") return "cut";
    if (goal === "muscle-gain" || goal === "strength") return "bulk";
    return "maintain";
  })();

  const daysIntoPhase = dailyWeights.length;
  const weeksIntoPhase = Math.floor(daysIntoPhase / 7);

  const trend = useMemo(
    () => interpretWeightTrend(dailyWeights, phase, daysIntoPhase, weeksIntoPhase),
    [dailyWeights, phase, daysIntoPhase, weeksIntoPhase],
  );

  const intakeDays = intakeLogs.length;
  const avgIntake =
    intakeDays > 0
      ? Math.round(intakeLogs.reduce((s, l) => s + l.kcal, 0) / intakeDays)
      : null;

  if (dailyWeights.length < 7) {
    return (
      <div className="mt-3 bg-[#E63946]/5 border border-[#E63946]/15 p-3 rounded-none">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-[#E63946] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-[#1A1A1A]">
              Engine trend analysis needs more data
            </p>
            <p className="text-[9px] text-[#1A1A1A]/60 font-serif italic mt-0.5">
              Log weight daily for at least 7 days to unlock evidence-based trend insights
              (weekly rate, adaptation-phase detection, cut/bulk adjustment recommendations).
              Currently have {dailyWeights.length}/7 days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const actionColor =
    trend.action === "act"
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : trend.action === "wait"
        ? "text-blue-700 bg-blue-50 border-blue-200"
        : trend.action === "adaptation_phase"
          ? "text-purple-700 bg-purple-50 border-purple-200"
          : "text-emerald-700 bg-emerald-50 border-emerald-200";

  return (
    <div className="mt-3 bg-white border border-[#1A1A1A]/10 p-3 rounded-none">
      <div className="flex items-center gap-1.5 mb-2">
        <TrendingUp className="w-3.5 h-3.5 text-[#E63946]" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] font-mono">
          Engine Trend Analysis
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <div className="bg-[#F9F8F6] p-1.5 border border-[#1A1A1A]/5 text-center">
          <span className="block text-[8px] uppercase text-[#1A1A1A]/40">Weekly Avg</span>
          <span className="text-[11px] font-bold text-[#1A1A1A]">
            {weeklyAvg !== null ? `${weeklyAvg.toFixed(1)} kg` : "—"}
          </span>
        </div>
        <div className="bg-[#F9F8F6] p-1.5 border border-[#1A1A1A]/5 text-center">
          <span className="block text-[8px] uppercase text-[#1A1A1A]/40">Rate</span>
          <span
            className={`text-[11px] font-bold ${
              rateLbPerWeek !== null && rateLbPerWeek < 0
                ? "text-emerald-600"
                : rateLbPerWeek !== null && rateLbPerWeek > 0
                  ? "text-amber-600"
                  : "text-[#1A1A1A]"
            }`}
          >
            {rateLbPerWeek !== null ? `${rateLbPerWeek.toFixed(2)} lb/wk` : "—"}
          </span>
        </div>
        <div className="bg-[#F9F8F6] p-1.5 border border-[#1A1A1A]/5 text-center">
          <span className="block text-[8px] uppercase text-[#1A1A1A]/40">Phase</span>
          <span className="text-[11px] font-bold text-[#E63946] uppercase">{phase}</span>
        </div>
      </div>

      <div className={`p-2 border rounded-none ${actionColor}`}>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 flex-shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {trend.action.replace(/_/g, " ")}
          </span>
        </div>
        <p className="text-[9px] mt-0.5 font-serif italic">{trend.reason}</p>
      </div>

      <div className="mt-2 flex items-center justify-between text-[9px] text-[#1A1A1A]/60 font-mono">
        <span>
          Intake logs: {intakeDays} day(s)
          {avgIntake !== null && ` · avg ${avgIntake} kcal`}
        </span>
        <span className="text-[#E63946]">
          {intakeDays >= 30
            ? "Adaptive TDEE ready"
            : `${30 - intakeDays} days to adaptive TDEE`}
        </span>
      </div>

      {engineProfile.is_currently_in_deficit !== undefined && (
        <p className="text-[8px] text-[#1A1A1A]/40 font-serif italic mt-1">
          Deficit flag: {engineProfile.is_currently_in_deficit ? "active (−5% BMR)" : "inactive"}
        </p>
      )}
    </div>
  );
}

export default EngineTrendAnalysis;
