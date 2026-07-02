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
      // Migrate legacy persisted state across schema versions so existing users
      // do not lose their onboarding data on upgrade. Each version step receives
      // the previous version's state and must return the next version's shape.
      migrate: (persisted: unknown, fromVersion: number) => {
        let s = (persisted ?? {}) as Record<string, unknown>;
        // v0 → v1: initial schema (no-op; v0 had no version field)
        // v1 → v2: added engineProfile + cachedAssessmentResult + cachedNutritionPlan
        if (fromVersion < 2) {
          s = {
            ...s,
            engineProfile: s.engineProfile ?? {},
            cachedAssessmentResult: s.cachedAssessmentResult ?? null,
            cachedNutritionPlan: s.cachedNutritionPlan ?? null,
          };
        }
        // v2 → v3: renamed assessment→onboardingInput, personalPlan→workoutPlan
        if (fromVersion < 3) {
          s = {
            ...s,
            onboardingInput:
              s.onboardingInput ?? (s.assessment as OnboardingInput | undefined) ?? null,
            workoutPlan:
              s.workoutPlan ?? (s.personalPlan as WorkoutPlan | undefined) ?? null,
            engineProfile: s.engineProfile ?? {},
            cachedAssessmentResult: s.cachedAssessmentResult ?? null,
            cachedNutritionPlan: s.cachedNutritionPlan ?? null,
          };
          delete s.assessment;
          delete s.personalPlan;
        }
        return s as unknown as UserState;
      },
    },
  ),
);
