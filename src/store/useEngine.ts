import { useEffect, useMemo } from "react";
import { useUserStore } from "./useUserStore";
import { useLogsStore } from "./useLogsStore";
import {
  type AssessmentResult,
  type NutritionPlan,
  runAssessment,
  buildNutritionPlan,
  recommendGoal,
  createUserFromOnboarding,
} from "../engine";

/**
 * Engine hook — orchestrates the engine layer with the React stores.
 *
 * On mount and whenever the inputs change (onboardingInput, engineProfile,
 * weight), this hook:
 *   1. Creates a User from OnboardingInput + EngineProfile.
 *   2. Runs `runAssessment()` to produce a fresh AssessmentResult.
 *   3. Runs `buildNutritionPlan()` to produce a fresh NutritionPlan.
 *   4. Caches both in useUserStore so all components see the same values.
 *   5. Exposes the cached values + helper actions to consumers.
 */
export function useEngine(): {
  assessmentResult: AssessmentResult | null;
  nutritionPlan: NutritionPlan | null;
  recompute: () => void;
  applyAdjustment: (updated: NutritionPlan) => void;
  isReady: boolean;
} {
  const onboardingInput = useUserStore((s) => s.onboardingInput);
  const engineProfile = useUserStore((s) => s.engineProfile);
  const cachedAssessmentResult = useUserStore((s) => s.cachedAssessmentResult);
  const cachedNutritionPlan = useUserStore((s) => s.cachedNutritionPlan);
  const cacheEngineOutputs = useUserStore((s) => s.cacheEngineOutputs);
  const clearEngineCaches = useUserStore((s) => s.clearEngineCaches);

  const weightLogs = useLogsStore((s) => s.weightLogs);
  // A-16/F-H2 fix: removed the dead `useIntakeStore((s) => s.intakeLogs)`
  // subscription — the value was never used here and caused unnecessary
  // re-renders on every intake-log change. intakeLogs are consumed directly
  // by EngineInsights via its own subscription.

  const latestWeight = useMemo(() => {
    if (weightLogs.length === 0) return onboardingInput?.weight ?? 0;
    // A-16 fix: don't assume insertion order === chronological order. Sort
    // defensively so a future setWeightLogs(importedUnsorted) can't silently
    // make latestWeight return the last-inserted (oldest) log.
    const sorted = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));
    return sorted[sorted.length - 1].weight_kg;
  }, [weightLogs, onboardingInput?.weight]);

  useEffect(() => {
    if (!onboardingInput) return;
    try {
      const user = createUserFromOnboarding(onboardingInput, engineProfile);
      const assessment = runAssessment(user);

      // Refine goal based on BF% if available — but never for excluded
      // populations (E-53: excluded users must not get an auto-refined
      // cut/bulk phase; buildNutritionPlan will refuse to produce one).
      let phase = user.primary_goal;
      if (assessment.body_fat_pct !== undefined && !assessment.population_excluded) {
        const rec = recommendGoal({
          bf_pct: assessment.body_fat_pct,
          sex: user.sex,
          training_status: user.training_status,
          user_preference: user.primary_goal,
          focus: "auto",
        });
        const recommended = rec.goal;
        if (recommended === "cut" || recommended === "bulk" || recommended === "recomp" || recommended === "maintain") {
          phase = recommended;
        }
      }

      const nutrition = buildNutritionPlan({
        user: { ...user, primary_goal: phase },
        assessment,
        phase,
        // E-50: pass the existing cached plan so a recompute (weight log
        // added, profile updated) preserves plan_id, created_at,
        // phase_start_date, last_adjustment_date, and adjustment_history.
        // A phase change (cut→bulk) still produces a fresh plan.
        existing_plan: cachedNutritionPlan ?? undefined,
      });

      cacheEngineOutputs(assessment, nutrition);
    } catch (err) {
      console.warn("[useEngine] Recompute failed:", err);
      clearEngineCaches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingInput, engineProfile, latestWeight]);

  const recompute = () => {
    if (!onboardingInput) return;
    try {
      // A-16 fix: read fresh state via getState() so applyAdjustment /
      // recompute called right after clearEngineCaches doesn't no-op on
      // a stale closure. Also removed the redundant `as EngineProfile`
      // cast — engineProfile is already typed as EngineProfile.
      const user = createUserFromOnboarding(onboardingInput, engineProfile);
      const assessment = runAssessment(user);
      const nutrition = buildNutritionPlan({
        user,
        assessment,
        existing_plan: useUserStore.getState().cachedNutritionPlan ?? undefined,
      });
      cacheEngineOutputs(assessment, nutrition);
    } catch (err) {
      console.warn("[useEngine] Manual recompute failed:", err);
    }
  };

  const applyAdjustment = (updated: NutritionPlan) => {
    // A-16 fix: read the assessment fresh from the store so a recent
    // clearEngineCaches (e.g. from updateEngineProfile) doesn't leave this
    // closure holding a stale null that silently no-ops the user's click.
    const currentAssessment = useUserStore.getState().cachedAssessmentResult;
    if (currentAssessment) {
      cacheEngineOutputs(currentAssessment, updated);
    }
  };

  return {
    assessmentResult: cachedAssessmentResult,
    nutritionPlan: cachedNutritionPlan,
    recompute,
    applyAdjustment,
    isReady: cachedAssessmentResult !== null && cachedNutritionPlan !== null,
  };
}
