import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Assessment, PersonalPlan } from "../types";

/**
 * User store — holds the onboarding assessment and the AI-generated
 * personal plan. Persisted to localStorage so a page refresh does NOT
 * force the user back through onboarding.
 */
interface UserState {
  assessment: Assessment | null;
  personalPlan: PersonalPlan | null;
  setAssessment: (a: Assessment) => void;
  setPersonalPlan: (p: PersonalPlan) => void;
  setBoth: (a: Assessment, p: PersonalPlan) => void;
  updateWorkoutPlan: (p: PersonalPlan["workoutPlan"]) => void;
  /** Update just the weight field (kept in sync with the latest weight log). */
  updateWeight: (kg: number) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      assessment: null,
      personalPlan: null,

      setAssessment: (a) => set({ assessment: a }),
      setPersonalPlan: (p) => set({ personalPlan: p }),
      setBoth: (a, p) => set({ assessment: a, personalPlan: p }),

      updateWorkoutPlan: (plan) =>
        set((s) =>
          s.personalPlan ? { personalPlan: { ...s.personalPlan, workoutPlan: plan } } : {},
        ),

      updateWeight: (kg) =>
        set((s) => (s.assessment ? { assessment: { ...s.assessment, weight: kg } } : {})),

      reset: () => set({ assessment: null, personalPlan: null }),
    }),
    {
      name: "fitlife:user",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
