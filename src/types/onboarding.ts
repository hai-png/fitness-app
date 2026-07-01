/**
 * Onboarding domain types — the form data collected during the multi-step
 * onboarding wizard. Distinct from `User` (which includes engine-only fields
 * like body_fat_pct, waist_cm, etc. that are captured separately via
 * EngineProfile).
 *
 * A-22 (audit 2026-08): extracted from `src/engine/schemas.ts` to keep that
 * module focused on engine-domain types only. `src/engine/schemas.ts`
 * re-exports these types for backward compatibility, and `src/types/index.ts`
 * is the convenience barrel for callers that want a single import surface.
 */

export type OnboardingGoal =
  | "weight-loss"
  | "muscle-gain"
  | "strength"
  | "endurance"
  | "general";

export type OnboardingActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active";

export type OnboardingWorkoutPreference =
  | "home"
  | "gym"
  | "outdoor"
  | "hybrid";

export type OnboardingDietType =
  | "anything"
  | "vegetarian"
  | "vegan"
  | "keto"
  | "low-carb"
  | "gluten-free"
  | "mediterranean";

export type OnboardingCuisinePreference =
  | "american"
  | "ethiopian"
  | "mexican"
  | "italian"
  | "thai"
  | "mediterranean"
  | "indian"
  | "japanese"
  | "no-preference";

export type OnboardingGender =
  | "male"
  | "female"
  | "non-binary"
  | "prefer-not-to-say";

export interface OnboardingInput {
  name: string;
  age: number;
  // E-43/S-19 fix: tightened from `string` to a union matching the server
  // zod schema. Previously mapSex() silently mis-gendered users via prefix
  // matching ('transgender male' → 't' → 'male'); now the form sends one
  // of these exact values. 'prefer-not-to-say' is mapped to 'male' as the
  // engine default (sex-specific formulas require a binary input; a future
  // revision should let users specify sex-for-calculations separately).
  gender: OnboardingGender;
  weight: number; // kg
  height: number; // cm
  goal: OnboardingGoal;
  activityLevel: OnboardingActivityLevel;
  workoutPreference: OnboardingWorkoutPreference;
  frequency: number; // days per week
  dietType: OnboardingDietType;
  cuisinePreference: OnboardingCuisinePreference;
  allergies: string;
  selectedGymName?: string;
  availableMachines?: string[];
}
