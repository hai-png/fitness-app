/**
 * @file CoreMetricsTab.tsx — Sub-tab 1 of the Progress / Analytics view.
 *
 * Renders the "Volume & Trends" sub-tab inside <ProgressTab />:
 *   - Two summary cards (Active Volume + Tempo & Density)
 *   - Rolling Periodic Velocity panel (7 / 30 / 365 day deltas vs. prior window)
 *   - Muscular Conditioning Focus splits (Strength 1-5 / Hypertrophy 6-12 /
 *     Endurance 13+ rep ranges, derived live from the filtered log set)
 *   - The 1RM Estimator widget (<OneRMEstimator />)
 *   - Configurable secondary-muscle load multiplier slider
 *
 * Pure presentational component — every value it consumes is passed in via
 * props so the parent <ProgressTab /> retains ownership of all state and
 * memoised computations.
 */
import { Activity, TrendingDown, TrendingUp, Sliders } from "lucide-react";
import {
  ExerciseLog,
  calculateCoreMetrics,
  calculateRollingTrends,
} from "../../data/analyticsEngine";
import { OneRMEstimator } from "../OneRMEstimator";

export interface CoreMetricsTabProps {
  /** Pre-computed aggregate metrics (volume / sets / density) for the filtered log window. */
  coreMetrics: ReturnType<typeof calculateCoreMetrics>;
  /** Rolling 7 / 30 / 365-day totals + percent diffs vs. the prior identical window. */
  rollingTrends: ReturnType<typeof calculateRollingTrends>;
  /** Active synergy coefficient applied to secondary (arms/shoulders) muscles. */
  multiplierSecondary: number;
  /** Setter for `multiplierSecondary`. */
  setMultiplierSecondary: (v: number) => void;
  /** Exercise logs already narrowed by the parent's date filter. */
  filteredLogs: ExerciseLog[];
}

/**
 * Renders the "Volume & Trends" sub-tab.
 *
 * Behaviour is identical to the original `renderCoreMetricsTab()` closure
 * inside ProgressTab.tsx — only the wrapping has changed (closure → component).
 */
export function CoreMetricsTab({
  coreMetrics,
  rollingTrends,
  multiplierSecondary,
  setMultiplierSecondary,
  filteredLogs,
}: CoreMetricsTabProps) {
  // Group sets by Focus
  let strengthSets = 0;
  let hypertrophySets = 0;
  let enduranceSets = 0;
  let totalWorking = 0;

  filteredLogs.forEach((ex) => {
    ex.sets.forEach((s) => {
      if (s.isWarmUp) return;
      totalWorking++;
      if (s.reps <= 5) strengthSets++;
      else if (s.reps <= 12) hypertrophySets++;
      else enduranceSets++;
    });
  });

  const strengthPct = totalWorking > 0 ? Math.round((strengthSets / totalWorking) * 100) : 0;
  const hypertrophyPct =
    totalWorking > 0 ? Math.round((hypertrophySets / totalWorking) * 100) : 0;
  const endurancePct = totalWorking > 0 ? Math.round((enduranceSets / totalWorking) * 100) : 0;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Overall summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm relative overflow-hidden">
          <span className="text-[8px] font-bold font-mono uppercase tracking-widest text-[#E63946] block mb-1">
            Active Volume
          </span>
          <div className="text-xl font-serif font-black italic tracking-tight text-[#1A1A1A]">
            {coreMetrics.totalVolume.toLocaleString()}{" "}
            <span className="text-xs not-italic font-sans font-medium text-[#1A1A1A]/50">kg</span>
          </div>
          <p className="text-[10px] text-[#1A1A1A]/60 font-serif italic mt-1 leading-normal">
            Based on {coreMetrics.totalWorkingSets} working sets (excl. warm-ups) with secondary
            muscles @ {multiplierSecondary}x.
          </p>
        </div>

        <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm relative overflow-hidden">
          <span className="text-[8px] font-bold font-mono uppercase tracking-widest text-[#E63946] block mb-1">
            Tempo & Density
          </span>
          <div className="text-xl font-serif font-black italic tracking-tight text-[#1A1A1A]">
            {coreMetrics.volumePerMinute}{" "}
            <span className="text-xs not-italic font-sans font-medium text-[#1A1A1A]/50">
              kg/min
            </span>
          </div>
          <p className="text-[10px] text-[#1A1A1A]/60 font-serif italic mt-1 leading-normal">
            Accumulating mechanical tension inside a total session length of{" "}
            {coreMetrics.totalDuration} minutes.
          </p>
        </div>
      </div>

      {/* Rolling Windows & Periodic Comparisons */}
      <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
          <Activity className="w-4 h-4 text-[#E63946]" />
          Rolling Periodic Velocity
        </h3>
        <p className="text-[10px] text-[#1A1A1A]/60 mb-4 font-serif italic leading-relaxed">
          Compares absolute muscular load lifted across recent cycles against prior identical
          windows to verify systematic velocity.
        </p>

        <div className="grid grid-cols-3 gap-2 text-center">
          {/* 7 Days */}
          <div className="bg-[#F9F8F6] border border-[#1A1A1A]/5 p-2.5">
            <span className="text-[8px] uppercase tracking-wider font-bold text-[#1A1A1A]/40 block">
              Last 7 Days
            </span>
            <span className="text-xs font-mono font-bold block mt-1 text-[#1A1A1A]">
              {(rollingTrends.vol7 / 1000).toFixed(1)}t
            </span>
            <span
              className={`text-[9px] font-bold inline-flex items-center gap-0.5 mt-1 font-mono ${
                rollingTrends.diff7 >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {rollingTrends.diff7 >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {rollingTrends.diff7 >= 0 ? "+" : ""}
              {rollingTrends.diff7.toFixed(1)}%
            </span>
          </div>

          {/* 30 Days */}
          <div className="bg-[#F9F8F6] border border-[#1A1A1A]/5 p-2.5">
            <span className="text-[8px] uppercase tracking-wider font-bold text-[#1A1A1A]/40 block">
              Last 30 Days
            </span>
            <span className="text-xs font-mono font-bold block mt-1 text-[#1A1A1A]">
              {(rollingTrends.vol30 / 1000).toFixed(1)}t
            </span>
            <span
              className={`text-[9px] font-bold inline-flex items-center gap-0.5 mt-1 font-mono ${
                rollingTrends.diff30 >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {rollingTrends.diff30 >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {rollingTrends.diff30 >= 0 ? "+" : ""}
              {rollingTrends.diff30.toFixed(1)}%
            </span>
          </div>

          {/* 365 Days */}
          <div className="bg-[#F9F8F6] border border-[#1A1A1A]/5 p-2.5">
            <span className="text-[8px] uppercase tracking-wider font-bold text-[#1A1A1A]/40 block">
              Last Year
            </span>
            <span className="text-xs font-mono font-bold block mt-1 text-[#1A1A1A]">
              {(rollingTrends.vol365 / 1000).toFixed(1)}t
            </span>
            <span
              className={`text-[9px] font-bold inline-flex items-center gap-0.5 mt-1 font-mono ${
                rollingTrends.diff365 >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {rollingTrends.diff365 >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {rollingTrends.diff365 >= 0 ? "+" : ""}
              {rollingTrends.diff365.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Training Focus splits based on reps range */}
      <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-2">
          <Sliders className="w-4 h-4 text-[#E63946]" />
          Muscular Conditioning Focus
        </h3>
        <p className="text-[10px] text-[#1A1A1A]/60 mb-4 font-serif italic leading-relaxed">
          Classifies working sets by target fiber recruitment: Strength (1-5 reps), Hypertrophy
          (6-12 reps), and Endurance (13+ reps).
        </p>

        <div className="space-y-3.5">
          {/* Strength */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
              <span>Strength Power (1-5 reps)</span>
              <span className="font-mono text-xs">{strengthPct}%</span>
            </div>
            <div className="h-2 bg-[#1A1A1A]/5 overflow-hidden">
              <div
                className="h-full bg-[#E63946] transition-all"
                style={{ width: `${strengthPct}%` }}
              />
            </div>
          </div>

          {/* Hypertrophy */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
              <span>Myofibrillar Hypertrophy (6-12 reps)</span>
              <span className="font-mono text-xs">{hypertrophyPct}%</span>
            </div>
            <div className="h-2 bg-[#1A1A1A]/5 overflow-hidden">
              <div
                className="h-full bg-indigo-900 transition-all"
                style={{ width: `${hypertrophyPct}%` }}
              />
            </div>
          </div>

          {/* Endurance */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
              <span>Sarcoplasmic Endurance (13+ reps)</span>
              <span className="font-mono text-xs">{endurancePct}%</span>
            </div>
            <div className="h-2 bg-[#1A1A1A]/5 overflow-hidden">
              <div
                className="h-full bg-emerald-700 transition-all"
                style={{ width: `${endurancePct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 1RM Estimation Calculator Widget (extracted to <OneRMEstimator />) */}
      <OneRMEstimator />

      {/* Configurable Multiplier settings */}
      <div className="bg-white border border-[#1A1A1A]/10 p-3.5 rounded-none shadow-sm flex items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-bold text-[#1A1A1A] uppercase tracking-tight block text-[10.5px]">
            Configure Load Parameters
          </span>
          <span className="text-[9px] text-[#1A1A1A]/50 italic block mt-0.5">
            Adjust synergy coefficients for secondary arms/shoulders.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#E63946] font-bold">
            {multiplierSecondary}x
          </span>
          <input
            id="slider-synergy-coefficient"
            type="range"
            min="0.0"
            max="1.0"
            step="0.1"
            value={multiplierSecondary}
            onChange={(e) => setMultiplierSecondary(parseFloat(e.target.value))}
            className="w-20 h-1 bg-[#1A1A1A]/10 accent-[#E63946]"
          />
        </div>
      </div>
    </div>
  );
}
