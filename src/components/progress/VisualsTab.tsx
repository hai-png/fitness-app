/**
 * @file VisualsTab.tsx — Sub-tab 4 of the Progress / Analytics view.
 *
 * Renders the "Heatmap & Flex" sub-tab inside <ProgressTab />:
 *   - <WorkoutHeatmap /> (already-extracted component, fed raw exerciseLogs)
 *   - A 2-column "Annual Highlighting Flex Cards" grid: 8 shareable cards
 *     covering Volume King, Consistency Engine, Strength Pinnacle, Hypertrophy
 *     Champion, Streak Warrior, Session Density Master, Hydraulic Charger,
 *     and Trajectory Conqueror. Each card opens the share modal.
 *   - The Share Modal popup: shows the selected card's metric, quote, and
 *     description with a "Copy Flex Card" button that writes a pre-formatted
 *     text snippet to the clipboard (with execCommand fallback for non-secure
 *     contexts).
 *
 * Pure presentational component — all data flows in via props. The flex-card
 * data array and streak counter are computed locally because they are only
 * used inside this sub-tab.
 */
import { Sparkles, Award, Share2, Check } from "lucide-react";
import {
  ExerciseLog,
  MuscleVolumeZone,
  calculateEpley1RM,
  calculateCoreMetrics,
} from "../../data/analyticsEngine";
import { WorkoutHeatmap } from "../WorkoutHeatmap";
import { toast } from "../Toast";

/** Shape of a single Flex Card entry rendered in the grid + share modal. */
export interface FlexCardData {
  id: string;
  title: string;
  badge: string;
  metric: string;
  subtitle: string;
  description: string;
  quote: string;
}

export interface VisualsTabProps {
  /** Full (unfiltered) set of exercise logs — feeds the heatmap + flex-card computations. */
  exerciseLogs: ExerciseLog[];
  /** Per-muscle zones/scores — used to surface the top muscle by score. */
  muscleZonesAndScores: MuscleVolumeZone[];
  /** Aggregate metrics — `volumePerMinute` feeds the Session Density Master card. */
  coreMetrics: ReturnType<typeof calculateCoreMetrics>;
  /** Today's water total (ml) — feeds the Hydraulic Charger card. */
  todayWaterTotal: number;
  /** Body weight change over time (kg, signed) — feeds the Trajectory Conqueror card. */
  weightDiff: number;
  /** Currently open share card (or null when the modal is closed). */
  activeShareCard: FlexCardData | null;
  /** Setter for `activeShareCard`. */
  setActiveShareCard: (v: FlexCardData | null) => void;
  /** Whether the share text was just copied (drives the "Copied!" success state). */
  copiedShareText: boolean;
  /** Setter for `copiedShareText`. */
  setCopiedShareText: (v: boolean) => void;
}

/**
 * Renders the "Heatmap & Flex" sub-tab.
 *
 * Behaviour is identical to the original `renderVisualsTab()` closure
 * inside ProgressTab.tsx — only the wrapping has changed (closure → component).
 * The streak computation, flex-card array, and clipboard handlers all live
 * inside this component.
 */
export function VisualsTab({
  exerciseLogs,
  muscleZonesAndScores,
  coreMetrics,
  todayWaterTotal,
  weightDiff,
  activeShareCard,
  setActiveShareCard,
  copiedShareText,
  setCopiedShareText,
}: VisualsTabProps) {
  // 1. Streak computation (the heatmap itself was extracted to <WorkoutHeatmap />,
  //    but currentStreak is still needed by the "Streak Warrior" flex card below).
  const today = new Date();

  // Map logs to dates count
  const workoutCountsByDate: Record<string, number> = {};
  exerciseLogs.forEach((l) => {
    workoutCountsByDate[l.date] = (workoutCountsByDate[l.date] || 0) + 1;
  });

  // Compute streak
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  // Simple streak calculator checking training consistency (at least 1 set logged within 3 days)
  for (let i = 0; i < 365; i++) {
    const checkDateStr = new Date(today);
    checkDateStr.setDate(today.getDate() - i);
    // Q-07: safe — toISOString().split("T") always yields at least one element.
    const [formattedPart] = checkDateStr.toISOString().split("T");
    const formatted = formattedPart as string;

    if (workoutCountsByDate[formatted]) {
      tempStreak++;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
      if (i <= tempStreak) currentStreak = tempStreak; // current active streak
    } else {
      // Allow a 2-day buffer for streak continuation
      const formattedBuffer1 = new Date(checkDateStr);
      formattedBuffer1.setDate(checkDateStr.getDate() - 1);
      const formattedBuffer2 = new Date(checkDateStr);
      formattedBuffer2.setDate(checkDateStr.getDate() - 2);

      const [b1Part] = formattedBuffer1.toISOString().split("T");
      const [b2Part] = formattedBuffer2.toISOString().split("T");
      if (
        !workoutCountsByDate[b1Part as string] &&
        !workoutCountsByDate[b2Part as string]
      ) {
        tempStreak = 0;
      }
    }
  }

  // (renderHeatmap was extracted to <WorkoutHeatmap /> — see component import.)

  // 2. Shareable Flex Cards list
  // Pre-calculate highlights data (guard against empty logs — Math.max(...[])
  // returns -Infinity which would render as "-Infinity kg" in the UI)
  const dayVolumes = exerciseLogs.map((l) =>
    l.sets.reduce((sum, s) => sum + (s.isWarmUp ? 0 : s.weight * s.reps), 0),
  );
  const maxDayVolume = dayVolumes.length > 0 ? Math.max(...dayVolumes) : 0;

  const session1RMs = exerciseLogs.map((l) =>
    Math.max(0, ...l.sets.map((s) => calculateEpley1RM(s.weight, s.reps))),
  );
  const highestCalculated1RM = session1RMs.length > 0 ? Math.max(...session1RMs) : 0;
  const topMuscleScore = muscleZonesAndScores[0]?.muscle || "Chest";
  const totalSessionsNum = Array.from(new Set(exerciseLogs.map((l) => l.date))).length;

  const flexCardsData: FlexCardData[] = [
    {
      id: "volume-king",
      title: "The Volume King",
      badge: "Heavy Lifter",
      metric: `${maxDayVolume.toLocaleString()} kg`,
      subtitle: "Single-Day Max Volume Load",
      description:
        "You accumulated a staggering structural load in a single session, overloading muscle fibers with high mechanical stimulus.",
      quote: "True muscular progress is forged through heavy systematic volume.",
    },
    {
      id: "consistency-engine",
      title: "Consistency Engine",
      badge: "Elite Habit",
      metric: `${totalSessionsNum} Sessions`,
      subtitle: "90-Day Training Consistency",
      description:
        "Consistency creates absolute muscle adaptation. Your physical discipline outpaced the average practitioner.",
      quote: "We are what we repeatedly do. Excellence is a mechanical habit.",
    },
    {
      id: "strength-pinnacle",
      title: "Strength Pinnacle",
      badge: "Estimated 1RM Peak",
      metric: `${Math.round(highestCalculated1RM)} kg`,
      subtitle: "Maximum Estimated 1RM",
      description:
        "Your calculated absolute failure limits highlight an elite central nervous system synchronization rate.",
      quote: "Power is the mechanical output of neural adaptation and mass.",
    },
    {
      id: "hypertrophy-champion",
      title: "Hypertrophy Champion",
      badge: "Primary Stimulus Sector",
      metric: `${topMuscleScore}`,
      subtitle: "Max Stimulus Concentration",
      description:
        "This muscle group maintained the optimal set-rate ratios for systematic hypertrophy adaptation.",
      quote: "Growth occurs where high progressive load meets deep recovery.",
    },
    {
      id: "streak-warrior",
      title: "Streak Warrior",
      badge: "Consistent Momentum",
      metric: `${currentStreak} Days`,
      subtitle: "Active Consistency Streak",
      description:
        "Maintaining an uninterrupted physical load momentum prevents neural decline and ensures steady adaptations.",
      quote: "Never break the chain. Momentum is the wind in your progress sails.",
    },
    {
      id: "density-master",
      title: "Session Density Master",
      badge: "High Work Rate",
      metric: `${coreMetrics.volumePerMinute} kg/min`,
      subtitle: "Muscular Density Output",
      description:
        "You maximized your work capacity, minimizing empty rest gaps to sustain continuous muscle tension.",
      quote: "Density is the metric of focused athletic effort over time.",
    },
    {
      id: "hydraulic-charger",
      title: "Hydraulic Charger",
      badge: "Optimized Hydration",
      metric: `${(todayWaterTotal / 1000).toFixed(1)}L`,
      subtitle: "Daily Liquid Hydration",
      description:
        "Optimal cellular hydration ensures maximum muscle pump, fluid volume recovery, and joints cushioning.",
      quote: "A hydrated muscle is a strong, resilient, and responsive muscle.",
    },
    {
      id: "trajectory-conqueror",
      title: "Trajectory Conqueror",
      badge: "Overload Overlord",
      metric: `${weightDiff >= 0 ? "+" : ""}${weightDiff.toFixed(1)}kg`,
      subtitle: "Weight Change Over Time",
      description:
        "Body weight shifts demonstrate clean metabolic partitions or mass additions consistent with your program.",
      quote: "Mass moves mass. Control the trajectory to dominate the peak.",
    },
  ];

  const handleOpenShare = (card: FlexCardData) => {
    setActiveShareCard(card);
    setCopiedShareText(false);
  };

  const handleCopyShare = async () => {
    // activeShareCard is guaranteed non-null here — the button only renders
    // when the modal is open. Guard anyway to satisfy the type checker.
    if (!activeShareCard) return;
    const shareText = `My Training Card: [${activeShareCard.title} - ${activeShareCard.badge}]\nMetric Peak: ${activeShareCard.metric}\n"${activeShareCard.quote}"\nLogged on FitLife Hub!`;
    // navigator.clipboard is undefined in non-secure (HTTP) contexts and
    // can reject if the user denies the permission. Feature-detect + try/catch.
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setCopiedShareText(true);
        setTimeout(() => setCopiedShareText(false), 2000);
        toast.success("Copied!", "Share text is on your clipboard.");
      } else {
        // Fallback: select-and-execCommand for older browsers / non-secure contexts
        const ta = document.createElement("textarea");
        ta.value = shareText;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopiedShareText(true);
        setTimeout(() => setCopiedShareText(false), 2000);
        toast.success("Copied!", "Share text is on your clipboard.");
      }
    } catch (err) {
      console.error("Clipboard write failed:", err);
      toast.error(
        "Copy failed",
        "Couldn't access the clipboard. Try selecting the text manually.",
      );
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Heatmap rendering (extracted to <WorkoutHeatmap />) */}
      <WorkoutHeatmap exerciseLogs={exerciseLogs} />

      {/* Flex cards header */}
      <div className="border-b border-[#1A1A1A]/10 pb-2 mt-2">
        <h3 className="font-serif font-bold text-sm text-[#1A1A1A] flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#E63946]" />
          Annual Highlighting Flex Cards
        </h3>
        <p className="text-[10px] text-[#1A1A1A]/60 font-serif italic mt-0.5 leading-relaxed">
          Expand or share your physical highlights across social platforms. Crafted with athletic
          display layouts.
        </p>
      </div>

      {/* Visual grid of Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        {flexCardsData.map((card) => (
          <div
            key={card.id}
            role="button"
            tabIndex={0}
            onClick={() => handleOpenShare(card)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpenShare(card);
              }
            }}
            className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none hover:border-[#1A1A1A]/35 transition-all relative flex flex-col justify-between cursor-pointer group shadow-sm overflow-hidden"
          >
            {/* Background watermark badge icon */}
            <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
              <Sparkles className="w-20 h-20 text-[#1A1A1A]" />
            </div>

            <div>
              <span className="text-[7.5px] font-bold font-mono text-[#E63946] uppercase tracking-[0.15em] block mb-1">
                {card.badge}
              </span>
              <h4 className="font-serif italic font-black text-sm text-[#1A1A1A] leading-tight group-hover:text-[#E63946] transition-colors">
                {card.title}
              </h4>
            </div>

            <div className="mt-4 pt-2 border-t border-[#1A1A1A]/5 flex justify-between items-baseline gap-2">
              <span className="text-base font-mono font-black text-[#1A1A1A]">{card.metric}</span>
              <Share2 className="w-3.5 h-3.5 text-[#1A1A1A]/30 group-hover:text-[#E63946] transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* MODAL SHARE CARD POPUP */}
      {activeShareCard && (
        <div className="fixed inset-0 bg-[#1A1A1A]/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] text-white border border-white/10 w-full max-w-sm rounded-none overflow-hidden shadow-2xl flex flex-col">
            {/* Card visual showcase */}
            <div className="p-6 bg-black/40 border-b border-white/5 relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute right-4 top-4 text-[#E63946]">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>

              <span className="text-[8px] font-mono font-bold uppercase tracking-[0.25em] text-[#E63946] mb-1">
                AETHER ATHLETIC ACCOMPLISHMENT
              </span>

              <h3 className="font-serif italic font-black text-xl text-white tracking-tight mt-1">
                {activeShareCard.title}
              </h3>

              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-0.5">
                {activeShareCard.subtitle}
              </span>

              <div className="text-3xl font-mono font-black text-white mt-5 bg-white/5 px-5 py-2.5 border border-white/10 rounded-sm">
                {activeShareCard.metric}
              </div>

              <p className="text-[11px] text-white/70 italic font-serif leading-relaxed mt-4 max-w-[280px]">
                &quot;{activeShareCard.quote}&quot;
              </p>
            </div>

            {/* Explainer / Description */}
            <div className="p-4 bg-[#1A1A1A] space-y-3">
              <p className="text-xs text-white/80 leading-relaxed">
                {activeShareCard.description}
              </p>
            </div>

            {/* Actions */}
            <div className="p-4 bg-black/20 border-t border-white/5 flex gap-2">
              <button
                id="btn-close-share"
                onClick={() => setActiveShareCard(null)}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-bold uppercase tracking-wider text-center"
              >
                Cancel
              </button>
              <button
                id="btn-copy-share-text"
                onClick={handleCopyShare}
                className="flex-1 py-2.5 bg-[#E63946] hover:bg-[#d62828] text-white text-xs font-mono font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5"
              >
                {copiedShareText ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                {copiedShareText ? "Copied!" : "Copy Flex Card"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
