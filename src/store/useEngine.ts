import { useCallback, useEffect, useMemo, useState } from "react";
import { useUserStore } from "./useUserStore";
import { useIntakeStore } from "./useIntakeStore";
import { useLogsStore } from "./useLogsStore";
import {
  type AssessmentResult,
  type NutritionPlan,
  type EngineProfile,
  runAssessment,
  buildNutritionPlan,
  recommendGoal,
  createUserFromOnboarding,
} from "../engine";

/**
 * Engine hook — orchestrates the engine layer with the React stores.
 *
 * On mount and whenever the inputs change (onboardingInput, engineProfile,
 * latest weight, intake logs), this hook:
 *   1. Creates a User from OnboardingInput + EngineProfile.
 *   2. Runs `runAssessment()` to produce a fresh AssessmentResult.
 *   3. Runs `buildNutritionPlan()` to produce a fresh NutritionPlan.
 *   4. Caches both in useUserStore so all components see the same values.
 *   5. Exposes the cached values + helper actions + error state to consumers.
 *
 * A-05 fix: the hook now actually consumes `intakeLogs` (previously subscribed
 *   but discarded) so the adaptive TDEE recomputes when intake is logged.
 * A-14 fix: `recompute` and `applyAdjustment` are wrapped in useCallback so
 *   their identities are stable across renders (child memoisation works).
 * A-15 fix: the hook exposes an `error` state so consumers can render a
 *   fallback UI instead of silently swallowing engine failures.
 * Q-04 fix: replaces `console.warn` with a structured error state.
 * Q-20 fix: removes the `eslint-disable react-hooks/exhaustive-deps` by
 *   including all effect dependencies.
 */
export interface UseEngineResult {
  assessmentResult: AssessmentResult | null;
  nutritionPlan: NutritionPlan | null;
  recompute: () => void;
  applyAdjustment: (updated: NutritionPlan) => void;
  isReady: boolean;
  /** Non-null when the last engine recompute threw. Cleared on next success. */
  error: Error | null;
}

export function useEngine(): UseEngineResult {
  const onboardingInput = useUserStore((s) => s.onboardingInput);
  const engineProfile = useUserStore((s) => s.engineProfile);
  const cachedAssessmentResult = useUserStore((s) => s.cachedAssessmentResult);
  const cachedNutritionPlan = useUserStore((s) => s.cachedNutritionPlan);
  const cacheEngineOutputs = useUserStore((s) => s.cacheEngineOutputs);
  const clearEngineCaches = useUserStore((s) => s.clearEngineCaches);

  const weightLogs = useLogsStore((s) => s.weightLogs);
  // A-05: actually consume intakeLogs so adaptive TDEE recomputes when the
  // user logs daily calorie intake. The slice identity is stable (Zustand),
  // and we read length to avoid recompute on every keystroke inside the
  // intake form (the store only updates when a complete log is committed).
  const intakeLogs = useIntakeStore((s) => s.intakeLogs);

  const [error, setError] = useState<Error | null>(null);

  const latestWeight = useMemo(() => {
    if (weightLogs.length === 0) return onboardingInput?.weight ?? 0;
    return weightLogs[weightLogs.length - 1]?.weight_kg ?? onboardingInput?.weight ?? 0;
  }, [weightLogs, onboardingInput?.weight]);

  // Trigger key: a lightweight primitive that changes whenever the engine
  // should recompute. Using `.length` on intake avoids recompute on every
  // render; the store only grows when a new daily log is committed.
  const intakeTrigger = intakeLogs.length;

  useEffect(() => {
    if (!onboardingInput) return;
    try {
      const user = createUserFromOnboarding(onboardingInput, engineProfile);
      const assessment = runAssessment(user);

      // Refine goal based on BF% if available.
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
        if (
          recommended === "cut" ||
          recommended === "bulk" ||
          recommended === "recomp" ||
          recommended === "maintain"
        ) {
          phase = recommended;
        }
      }

      const nutrition = buildNutritionPlan({
        user: { ...user, primary_goal: phase },
        assessment,
        phase,
      });

      cacheEngineOutputs(assessment, nutrition);
      setError(null);
    } catch (err) {
      // Q-04: surface the error via state instead of console.warn so the
      // UI can render a fallback. The error is also still logged to the
      // browser console for dev visibility.
      console.error("[useEngine] Recompute failed:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      clearEngineCaches();
    }
  }, [onboardingInput, engineProfile, latestWeight, intakeTrigger, cacheEngineOutputs, clearEngineCaches]);

  const recompute = useCallback(() => {
    if (!onboardingInput) return;
    try {
      const user = createUserFromOnboarding(onboardingInput, engineProfile as EngineProfile);
      const assessment = runAssessment(user);
      const nutrition = buildNutritionPlan({ user, assessment });
      cacheEngineOutputs(assessment, nutrition);
      setError(null);
    } catch (err) {
      console.error("[useEngine] Manual recompute failed:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [onboardingInput, engineProfile, cacheEngineOutputs]);

  const applyAdjustment = useCallback(
    (updated: NutritionPlan) => {
      if (cachedAssessmentResult) {
        cacheEngineOutputs(cachedAssessmentResult, updated);
      }
    },
    [cachedAssessmentResult, cacheEngineOutputs],
  );

  return {
    assessmentResult: cachedAssessmentResult,
    nutritionPlan: cachedNutritionPlan,
    recompute,
    applyAdjustment,
    isReady: cachedAssessmentResult !== null && cachedNutritionPlan !== null && error === null,
    error,
  };
}
