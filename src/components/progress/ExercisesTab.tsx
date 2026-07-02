/**
 * @file ExercisesTab.tsx — Sub-tab 3 of the Progress / Analytics view.
 *
 * Renders the "Lifts & Plateaus" sub-tab inside <ProgressTab />:
 *   - Trend Trajectory analysis panel: an exercise selector dropdown, a status
 *     badge (Accelerating / Steady / Slipping), a smoothed-vs-raw toggle, and
 *     the inline SVG line chart (drawn by the local `renderTrendChart()`)
 *   - Personal Records row (Gold all-time + Silver last-60-days) with an
 *     optional premature-peak warning
 *   - Plateau Watch & Recommendations: lists every exercise whose top weights
 *     have stalled across recent sessions, with engine-supplied recs
 *   - Set-by-Set Patterns Feedback: scans the last 15 logs for AMRAP / Failure
 *     / Drop Set entries and prints a tailored tip per anomaly set
 *
 * Pure presentational component — all data flows in via props. The nested
 * `renderTrendChart()` is intentionally kept as a local closure inside this
 * component (per the A-01 split spec).
 */
import { Clock, Sliders, Info } from "lucide-react";
import {
  ExerciseLog,
  ExerciseAnalysis,
  PersonalRecord,
} from "../../data/analyticsEngine";

export interface ExercisesTabProps {
  /** Per-exercise progression analyses (status, plateau, max weight, etc.). */
  exerciseProgressions: ExerciseAnalysis[];
  /** Per-exercise Gold/Silver PRs + premature-peak flags. */
  personalRecords: PersonalRecord[];
  /** Name of the exercise currently selected for trend analysis. */
  selectedAnalysisEx: string;
  /** Setter for `selectedAnalysisEx`. */
  setSelectedAnalysisEx: (v: string) => void;
  /** Whether the trend chart shows a 3-session moving average (true) or raw peaks (false). */
  isSmoothedTrend: boolean;
  /** Setter for `isSmoothedTrend`. */
  setIsSmoothedTrend: (v: boolean) => void;
  /** Exercise logs already narrowed by the parent's date filter. */
  filteredLogs: ExerciseLog[];
  /** Unique sorted exercise names from the full (unfiltered) log — populates the selector. */
  activeExNames: string[];
}

/**
 * Renders the "Lifts & Plateaus" sub-tab.
 *
 * Behaviour is identical to the original `renderExercisesTab()` closure
 * inside ProgressTab.tsx — only the wrapping has changed (closure → component).
 * The local `renderTrendChart()` closure is preserved verbatim.
 */
export function ExercisesTab({
  exerciseProgressions,
  personalRecords,
  selectedAnalysisEx,
  setSelectedAnalysisEx,
  isSmoothedTrend,
  setIsSmoothedTrend,
  filteredLogs,
  activeExNames,
}: ExercisesTabProps) {
  // Current selected exercise analysis details
  const selectedExAnalysis =
    exerciseProgressions.find((e) => e.name === selectedAnalysisEx) || exerciseProgressions[0];

  // Find PRs for selected
  const selectedPR = personalRecords.find((p) => p.exerciseName === selectedAnalysisEx);

  // Filter historical sets logs to plot SVG chart
  const selectedExHistory = [...filteredLogs]
    .filter((l) => l.exerciseName === selectedAnalysisEx)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // SVG Chart Plotter
  const renderTrendChart = () => {
    if (selectedExHistory.length < 2) {
      return (
        <div className="flex flex-col items-center justify-center h-28 text-[#1A1A1A]/40 text-xs font-serif italic border border-[#1A1A1A]/5 bg-[#F9F8F6] p-3 text-center">
          <Clock className="w-5 h-5 mb-1 text-[#1A1A1A]/30" />
          <span>
            Generate multiple sessions of {selectedAnalysisEx} to render trend trajectories.
          </span>
        </div>
      );
    }

    // Compute values depending on Smoothed toggle
    const rawPoints = selectedExHistory.map((sess, idx) => {
      const working = sess.sets.filter((s) => !s.isWarmUp).map((s) => s.weight);
      const maxWeight = working.length > 0 ? Math.max(...working) : 0;
      return { idx, weight: maxWeight, date: sess.date };
    });

    // Simple 3-session moving average
    const plottedPoints = rawPoints.map((pt, index) => {
      if (isSmoothedTrend) {
        const startIdx = Math.max(0, index - 2);
        const slice = rawPoints.slice(startIdx, index + 1);
        const sum = slice.reduce((s, p) => s + p.weight, 0);
        const avg = sum / slice.length;
        return { ...pt, weight: Math.round(avg * 10) / 10 };
      }
      return pt;
    });

    const width = 310;
    const height = 90;
    const weightsList = plottedPoints.map((p) => p.weight);
    // Guard against empty arrays (Math.max(...[]) returns -Infinity)
    const minW = weightsList.length > 0 ? Math.min(...weightsList) - 2.5 : 0;
    const maxW = weightsList.length > 0 ? Math.max(...weightsList) + 2.5 : 1;
    const range = maxW - minW || 1;

    const coords = plottedPoints.map((pt, i) => {
      const x = (i / (plottedPoints.length - 1)) * (width - 24) + 12;
      const y = height - ((pt.weight - minW) / range) * (height - 20) - 10;
      return { x, y, weight: pt.weight, date: pt.date };
    });

    const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");

    return (
      <div className="relative border border-[#1A1A1A]/10 p-3 bg-[#F9F8F6] rounded-none">
        <div className="flex justify-between items-center text-[8px] font-mono text-[#1A1A1A]/40 uppercase mb-2">
          <span>TRAJECTORY PLOT</span>
          <span className="text-[#E63946]">
            {isSmoothedTrend ? "Stable (Smoothed Moving Avg)" : "Reactive (Raw Peak)"}
          </span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
          {/* Guidelines */}
          <line
            x1="0"
            y1={10}
            x2={width}
            y2={10}
            stroke="#1A1A1A"
            strokeOpacity="0.06"
            strokeDasharray="2 2"
          />
          <line
            x1="0"
            y1={height - 10}
            x2={width}
            y2={height - 10}
            stroke="#1A1A1A"
            strokeOpacity="0.06"
            strokeDasharray="2 2"
          />

          {/* Line Path */}
          <path
            d={path}
            fill="none"
            stroke="#E63946"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Nodes */}
          {coords.map((c, i) => (
            <g key={i}>
              <circle
                cx={c.x}
                cy={c.y}
                r="2.5"
                fill="#FFFFFF"
                stroke="#E63946"
                strokeWidth="1.5"
              />
              {(i === 0 || i === coords.length - 1) && (
                <text
                  x={c.x}
                  y={c.y - 7}
                  textAnchor="middle"
                  fill="#1A1A1A"
                  fontSize="7"
                  fontWeight="bold"
                  className="font-mono"
                >
                  {c.weight}kg
                </text>
              )}
            </g>
          ))}
        </svg>

        <div className="flex justify-between items-center text-[7.5px] font-mono text-[#1A1A1A]/40 mt-1">
          {/* Q-07: safe — renderTrendChart early-returns when selectedExHistory.length < 2. */}
          <span>{coords[0]?.date}</span>
          <span>{coords[coords.length - 1]?.date}</span>
        </div>
      </div>
    );
  };

  // Stalled / Plateau exercises watcher
  const plateauExercises = exerciseProgressions.filter((e) => e.plateauDetected);

  // Latest Set-by-Set feedback details
  const recentExerciseWithAnomaly = filteredLogs.slice(-15).reverse();

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Dynamic selectors for exercise trend analysis */}
      <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-serif font-bold text-sm text-[#1A1A1A]">
            Trend Trajectory analysis
          </h3>
          <select
            id="select-analysis-ex"
            value={selectedAnalysisEx}
            onChange={(e) => setSelectedAnalysisEx(e.target.value)}
            className="bg-[#F9F8F6] border border-[#1A1A1A]/10 text-xs px-2 py-1 font-bold text-[#1A1A1A]"
          >
            {activeExNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Selector details & chart */}
        {selectedExAnalysis && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 border uppercase rounded ${
                    selectedExAnalysis.statusLabel === "Accelerating"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                      : selectedExAnalysis.statusLabel === "Slipping"
                        ? "bg-rose-50 text-rose-800 border-rose-100"
                        : "bg-neutral-50 text-neutral-800 border-neutral-100"
                  }`}
                >
                  {selectedExAnalysis.statusLabel}
                </span>
                <span className="text-[9px] font-mono text-[#1A1A1A]/45">
                  Confidence: {selectedExAnalysis.confidence} ({selectedExAnalysis.sessionCount}{" "}
                  sessions)
                </span>
              </div>

              {/* Smoothed Toggle Button */}
              <button
                id="btn-toggle-smoothed"
                onClick={() => setIsSmoothedTrend(!isSmoothedTrend)}
                className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#E63946] border border-[#E63946]/15 hover:bg-[#E63946]/5 px-2 py-1"
              >
                {isSmoothedTrend ? "Reactive (Raw)" : "Stable (Smoothed)"}
              </button>
            </div>

            {renderTrendChart()}

            {/* Personal Records panel */}
            {selectedPR && (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-[#1A1A1A]/5 pt-3">
                <div>
                  <span className="text-[8px] text-[#1A1A1A]/40 uppercase block">
                    Gold PR (All-Time)
                  </span>
                  <span className="font-bold text-[#1A1A1A]">{selectedPR.goldValue}kg</span>
                  <span className="text-[8.5px] text-[#1A1A1A]/45 block italic mt-0.5">
                    {selectedPR.dateGold}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-[#1A1A1A]/40 uppercase block">
                    Silver PR (Last 60 Days)
                  </span>
                  <span className="font-bold text-[#E63946]">{selectedPR.silverValue}kg</span>
                  <span className="text-[8.5px] text-[#1A1A1A]/45 block italic mt-0.5">
                    {selectedPR.dateSilver}
                  </span>
                </div>

                {/* Warn about premature PRs if detected */}
                {selectedPR.prematureFlagged && (
                  <div className="col-span-2 bg-amber-50 text-amber-800 border border-amber-100 p-2.5 rounded-none text-[10.5px] mt-1.5 leading-normal">
                    <span className="font-bold uppercase tracking-wide block text-[8px] text-amber-700">
                      ⚠️ Premature Peak Detected
                    </span>
                    {selectedPR.prematureDetails}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Plateau Detection watch panel */}
      <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-1.5">
          <Sliders className="w-4 h-4 text-[#E63946]" />
          Plateau Watch & Recommendations
        </h3>
        <p className="text-[10px] text-[#1A1A1A]/60 mb-3 font-serif italic leading-relaxed">
          Checks if top weights have stalled or deteriorated across consecutive sessions, and
          provides specific athletic adjustments.
        </p>

        {plateauExercises.length === 0 ? (
          <div className="text-center py-4 bg-[#F9F8F6] border border-[#1A1A1A]/5 text-xs text-[#1A1A1A]/40 font-serif italic">
            No flat stall lines flagged! Consistent progressive overload detected across active
            movements.
          </div>
        ) : (
          <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
            {plateauExercises.map((p) => (
              <div key={p.name} className="bg-amber-50/40 border border-amber-100 p-3 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-[#1A1A1A] uppercase tracking-tight text-[11px]">
                    {p.name}
                  </span>
                  <span className="text-[8px] font-mono bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                    STALLED
                  </span>
                </div>
                <p className="text-[10.5px] text-[#1A1A1A]/70 italic leading-normal font-serif">
                  {p.plateauRecommendation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Set-by-Set Analysis & Patterns Feedback */}
      <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-1">
          <Info className="w-4 h-4 text-[#E63946]" />
          Set-by-Set Patterns Feedback
        </h3>
        <p className="text-[10px] text-[#1A1A1A]/60 mb-3 font-serif italic leading-relaxed">
          Scans individual mechanical set structures (AMRAP, Failure, Drop Sets) to prescribe
          exact adjustments.
        </p>

        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {recentExerciseWithAnomaly.slice(0, 5).map((log, idx) => {
            // Find if this log has anomalies (e.g. Failure, AMRAP or Drop Set in sets)
            const anomalySets = log.sets.filter((s) => s.type !== "Normal" && !s.isWarmUp);
            if (anomalySets.length === 0) return null;

            return (
              <div
                key={idx}
                className="bg-[#F9F8F6] border border-[#1A1A1A]/5 p-3 rounded-none text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-[#1A1A1A] uppercase tracking-tight text-[10.5px]">
                      {log.exerciseName}
                    </h4>
                    <span className="text-[8.5px] font-mono text-[#1A1A1A]/40 block">
                      {log.date}
                    </span>
                  </div>
                  <span className="text-[8px] bg-indigo-900 text-white font-mono font-bold px-1.5 py-0.5 rounded">
                    PATTERN DETECTED
                  </span>
                </div>

                <div className="mt-2.5 space-y-1.5">
                  {anomalySets.map((set, sIdx) => {
                    let tip = "";
                    if (set.type === "AMRAP") {
                      tip = `AMRAP completed successfully (${set.reps} reps @ ${set.weight}kg). Your neuromuscular endurance is high. Suggest increasing working load by +2.5kg next week to stimulate further mechanical hypertrophy.`;
                    } else if (set.type === "Failure") {
                      tip = `Hit failure early on set (${set.reps} reps @ ${set.weight}kg). Consider increasing rest length to 120-180 seconds between compound sets to allow ATP replenishment, or reduce weight by 5% to lock down your target rep volumes.`;
                    } else if (set.type === "Drop Set") {
                      tip = `Metabolic Drop Set completed (${set.reps} reps @ ${set.weight}kg). Executed high-volume depletion. Perfect for sarcoplasmic stimulation. Consume rapid-acting carbs post-workout.`;
                    }

                    return (
                      <div
                        key={sIdx}
                        className="border-l-2 border-[#E63946] pl-2.5 py-1 text-[10.5px] text-[#1A1A1A]/75 leading-relaxed font-serif italic"
                      >
                        <strong className="font-sans not-italic font-bold text-[8.5px] text-[#1A1A1A]/50 block uppercase mb-0.5">
                          SET {sIdx + 3} Focus ({set.type})
                        </strong>
                        {tip}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
