/**
 * useProgressAnalytics — extracts the 13 inline useMemo calls that used to
 * live in ProgressTab.tsx into a single custom hook.
 *
 * A-06 (audit 2026-08): ProgressTab had grown to 13 useMemo hooks scattered
 * between render markup, making it hard to see which computations the
 * component actually performed and which inputs drove them. This hook:
 *   - centralises every analytics computation in one place
 *   - keeps the memo dependency arrays identical to the originals
 *   - returns a `ProgressAnalytics` bundle the four sub-tab components
 *     already consume via their `analytics` prop
 *
 * The hook is intentionally pure-Pure (no React state, no IO) — it accepts
 * the four inputs ProgressTab derives from its own state + stores, and
 * returns the memoised analytics bundle. The shape of the return value
 * matches the `ProgressAnalytics` interface in `progress-tab/types.ts`.
 */
import { useMemo } from "react";
import {
  type ExerciseLog,
  LIFETIME_TIERS,
  calculateCoreMetrics,
  calculateRollingTrends,
  analyzeExerciseProgression,
  calculatePersonalRecords,
  calculateMuscleVolumesAndScores,
} from "../data/analyticsEngine";
import type { ProgressAnalytics } from "../components/progress-tab/types";

/**
 * Compute the full analytics bundle for the ProgressTab.
 *
 * @param exerciseLogs       all-time exercise logs (used for rolling trends + lifetime tonnage)
 * @param filteredLogs       exercise logs after date-range filtering (used for core metrics + PRs)
 * @param multiplierSecondary secondary-muscle volume credit multiplier (user-adjustable slider)
 * @param trainingAge        "Beginner" | "Intermediate" | "Advanced" — drives hypertrophy score thresholds
 * @param todayWaterTotal    today's water intake in ml (passed through to VisualsView)
 * @param weightDiff         currentWeight − initialWeight (passed through to VisualsView)
 * @returns a `ProgressAnalytics` bundle suitable for passing to the sub-tab components
 */
export function useProgressAnalytics(
  exerciseLogs: ExerciseLog[],
  filteredLogs: ExerciseLog[],
  multiplierSecondary: number,
  trainingAge: "Beginner" | "Intermediate" | "Advanced",
  todayWaterTotal: number,
  weightDiff: number,
): ProgressAnalytics {
  // --- CORE METRICS — total volume / sets / reps for the filtered window ---
  const coreMetrics = useMemo(
    () => calculateCoreMetrics(filteredLogs, multiplierSecondary),
    [filteredLogs, multiplierSecondary],
  );

  // --- ROLLING TRENDS — historical windows computed over all-time logs ---
  const rollingTrends = useMemo(
    () => calculateRollingTrends(exerciseLogs),
    [exerciseLogs],
  );

  // --- MUSCLE VOLUMES + HYPERTROPHY SCORES — per-muscle zone analysis ---
  const muscleZonesAndScores = useMemo(
    () => calculateMuscleVolumesAndScores(filteredLogs, trainingAge),
    [filteredLogs, trainingAge],
  );

  // --- MUSCLE BALANCE — top-3 share > 70% flags training asymmetry ---
  const muscleBalanceAnalysis = useMemo(() => {
    const sortedMuscles = [...muscleZonesAndScores].sort(
      (a, b) => b.balancePct - a.balancePct,
    );
    const top3Share = sortedMuscles.slice(0, 3).reduce((sum, item) => sum + item.balancePct, 0);
    const isImbalanced = top3Share > 70;
    return { top3Share, isImbalanced, sortedMuscles };
  }, [muscleZonesAndScores]);

  // --- LIFETIME VOLUME (TONS) — total working mass lifted, all-time ---
  const lifetimeVolumeTons = useMemo(() => {
    const rawVolume = exerciseLogs.reduce((sum, ex) => {
      return sum + ex.sets.reduce((sSum, s) => sSum + (s.isWarmUp ? 0 : s.weight * s.reps), 0);
    }, 0);
    return Math.round((rawVolume / 1000) * 10) / 10; // kg to tons
  }, [exerciseLogs]);

  // --- LIFETIME TIER INFO — current tier, next tier, weeks-to-next estimate ---
  const lifetimeTierInfo = useMemo(() => {
    const currentTierIndex = LIFETIME_TIERS.findIndex(
      (tier) => lifetimeVolumeTons >= tier.minTons && lifetimeVolumeTons < tier.maxTons,
    );
    const currentTier = LIFETIME_TIERS[currentTierIndex] || LIFETIME_TIERS[0];
    const nextTier = LIFETIME_TIERS[currentTierIndex + 1] || null;

    let progressPercent = 100;
    let tonsToNext = 0;
    if (nextTier) {
      const range = nextTier.minTons - currentTier.minTons;
      const progress = lifetimeVolumeTons - currentTier.minTons;
      progressPercent = Math.min(100, Math.round((progress / range) * 100));
      tonsToNext = Math.round((nextTier.minTons - lifetimeVolumeTons) * 10) / 10;
    }

    // Estimate weeks to next tier based on average weekly volume
    const recent4WeeksVolume = filteredLogs
      .filter((l) => {
        const d = new Date(l.date);
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        return d >= fourWeeksAgo;
      })
      .reduce(
        (sum, ex) =>
          sum + ex.sets.reduce((sSum, s) => sSum + (s.isWarmUp ? 0 : s.weight * s.reps), 0),
        0,
      );

    const avgWeeklyTons = recent4WeeksVolume / 4 / 1000; // tons/week
    const weeksToNext =
      avgWeeklyTons > 0 && tonsToNext > 0 ? Math.ceil(tonsToNext / avgWeeklyTons) : 100;

    return {
      current: currentTier.name,
      next: nextTier ? nextTier.name : "Max Tier Reached",
      progressPercent,
      tonsToNext,
      weeksToNext,
      tierIndex: currentTierIndex + 1,
    };
  }, [lifetimeVolumeTons, filteredLogs]);

  // --- EXERCISE PROGRESSION — per-exercise volume/load trend grouping ---
  const exerciseProgressions = useMemo(
    () => analyzeExerciseProgression(filteredLogs),
    [filteredLogs],
  );

  // --- PERSONAL RECORDS — top single-set tonnage per exercise ---
  const personalRecords = useMemo(
    () => calculatePersonalRecords(filteredLogs),
    [filteredLogs],
  );

  // --- ACTIVE EXERCISE NAMES — unique sorted list (for the exercise picker) ---
  const activeExNames = useMemo(
    () => Array.from(new Set(exerciseLogs.map((e) => e.exerciseName))).sort(),
    [exerciseLogs],
  );

  // --- SHARED ANALYTICS BUNDLE ---
  // Bundles every memoised analytics output into a single object the four
  // sub-tab components consume. Wrapped in useMemo so the bundle identity is
  // stable across renders unless one of its inputs actually changes.
  const analytics: ProgressAnalytics = useMemo(
    () => ({
      filteredLogs,
      coreMetrics,
      rollingTrends,
      muscleZonesAndScores,
      muscleBalanceAnalysis,
      lifetimeVolumeTons,
      lifetimeTierInfo,
      exerciseProgressions,
      personalRecords,
      activeExNames,
      todayWaterTotal,
      weightDiff,
    }),
    [
      filteredLogs,
      coreMetrics,
      rollingTrends,
      muscleZonesAndScores,
      muscleBalanceAnalysis,
      lifetimeVolumeTons,
      lifetimeTierInfo,
      exerciseProgressions,
      personalRecords,
      activeExNames,
      todayWaterTotal,
      weightDiff,
    ],
  );

  return analytics;
}
