import { useEffect, useMemo } from "react";
import { useUserStore } from "./useUserStore";
import { useIntakeStore } from "./useIntakeStore";
import { useLogsStore } from "./useLogsStore";
import {
  type AssessmentResult,
  type NutritionPlan,
  type User,
  runAssessment,
  buildNutritionPlan,
  recommendGoal,
  createUserFromOnboarding,
  type EngineProfile,
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
  useIntakeStore((s) => s.intakeLogs);

  const latestWeight = useMemo(() => {
    if (weightLogs.length === 0) return onboardingInput?.weight ?? 0;
    return weightLogs[weightLogs.length - 1].weight_kg;
  }, [weightLogs, onboardingInput?.weight]);

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
        if (recommended === "cut" || recommended === "bulk" || recommended === "recomp" || recommended === "maintain") {
          phase = recommended;
        }
      }

      const nutrition = buildNutritionPlan({
        user: { ...user, primary_goal: phase },
        assessment,
        phase,
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
      const user = createUserFromOnboarding(onboardingInput, engineProfile as EngineProfile);
      const assessment = runAssessment(user);
      const nutrition = buildNutritionPlan({ user, assessment });
      cacheEngineOutputs(assessment, nutrition);
    } catch (err) {
      console.warn("[useEngine] Manual recompute failed:", err);
    }
  };

  const applyAdjustment = (updated: NutritionPlan) => {
    if (cachedAssessmentResult) {
      cacheEngineOutputs(cachedAssessmentResult, updated);
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
