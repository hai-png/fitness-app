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
    },
  ),
);
