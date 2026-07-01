import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  OnboardingInput,
  WorkoutPlan,
  AssessmentResult,
  NutritionPlan,
} from "../engine";
import type { EngineProfile } from "../engine/assessment";

/**
 * User store — holds the onboarding input, engine profile, workout plan,
 * and cached engine outputs (AssessmentResult + NutritionPlan).
 *
 * Persisted to localStorage so a page refresh does NOT force the user back
 * through onboarding.
 *
 * A-15/F-C1 fix: a `migrate` function is now defined for every version bump.
 * Without it, zustand's persist middleware silently DISCARDS the persisted
 * state when the version doesn't match — causing total data loss on the next
 * deploy that bumps a version. The v2→v3 migration (assessment→onboardingInput,
 * personalPlan→workoutPlan) is handled here so existing users keep their data.
 */
interface UserState {
  onboardingInput: OnboardingInput | null;
  workoutPlan: WorkoutPlan | null;
  engineProfile: EngineProfile;
  cachedAssessmentResult: AssessmentResult | null;
  cachedNutritionPlan: NutritionPlan | null;

  setOnboardingInput: (a: OnboardingInput) => void;
  setWorkoutPlan: (p: WorkoutPlan) => void;
  setBoth: (a: OnboardingInput, p: WorkoutPlan) => void;
  updateWorkoutPlan: (p: WorkoutPlan) => void;
  updateWeight: (kg: number) => void;
  updateEngineProfile: (partial: Partial<EngineProfile>) => void;
  cacheEngineOutputs: (
    assessment: AssessmentResult,
    nutrition: NutritionPlan,
  ) => void;
  clearEngineCaches: () => void;
  reset: () => void;
}

const EMPTY_ENGINE_PROFILE: EngineProfile = {};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      onboardingInput: null,
      workoutPlan: null,
      engineProfile: { ...EMPTY_ENGINE_PROFILE },
      cachedAssessmentResult: null,
      cachedNutritionPlan: null,

      setOnboardingInput: (a) => set({ onboardingInput: a }),
      setWorkoutPlan: (p) => set({ workoutPlan: p }),
      setBoth: (a, p) => set({ onboardingInput: a, workoutPlan: p }),

      updateWorkoutPlan: (plan) =>
        set((s) =>
          s.workoutPlan ? { workoutPlan: plan } : {},
        ),

      updateWeight: (kg) =>
        set((s) =>
          s.onboardingInput
            ? { onboardingInput: { ...s.onboardingInput, weight: kg } }
            : {},
        ),

      updateEngineProfile: (partial) =>
        set((s) => ({
          engineProfile: { ...s.engineProfile, ...partial },
          cachedAssessmentResult: null,
          cachedNutritionPlan: null,
        })),

      cacheEngineOutputs: (assessmentResult, nutritionPlan) =>
        set({ cachedAssessmentResult: assessmentResult, cachedNutritionPlan: nutritionPlan }),

      clearEngineCaches: () =>
        set({ cachedAssessmentResult: null, cachedNutritionPlan: null }),

      reset: () =>
        set({
          onboardingInput: null,
          workoutPlan: null,
          engineProfile: { ...EMPTY_ENGINE_PROFILE },
          cachedAssessmentResult: null,
          cachedNutritionPlan: null,
        }),
    }),
    {
      name: "fitlife:user",
      storage: createJSONStorage(() => localStorage),
      version: 3, // bumped from 2 — renamed assessment→onboardingInput, personalPlan→workoutPlan
      // A-15/F-C1: migrate preserves user data across schema changes.
      // Without this, any version bump silently wipes localStorage.
      migrate: (persisted: unknown, fromVersion: number) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        const s = persisted as Record<string, unknown>;
        // v2 → v3: rename assessment → onboardingInput, personalPlan → workoutPlan.
        // v1 → v3: same fields existed under the v2 names; the v1→v2 rename
        // (if any) is captured by treating anything <3 uniformly here.
        if (fromVersion < 3) {
          if (s.assessment !== undefined && s.onboardingInput === undefined) {
            s.onboardingInput = s.assessment;
            delete s.assessment;
          }
          if (s.personalPlan !== undefined && s.workoutPlan === undefined) {
            s.workoutPlan = s.personalPlan;
            delete s.personalPlan;
          }
        }
        return s;
      },
    },
  ),
);
