/**
 * UI-only types — re-exported from the engine schemas for backward
 * compatibility.
 *
 * A-02: new code should import UI types from this file:
 *   import type { CartItem, OnboardingInput } from "../types/ui";
 *
 * This keeps the dependency graph clean: a component that needs `CartItem`
 * no longer needs to know about the engine barrel. The engine barrel
 * (`src/engine/index.ts`) still re-exports these for existing call sites.
 *
 * The canonical definitions live in `src/engine/schemas.ts` (single source
 * of truth). This file is a thin re-export so that future migrations can
 * move the definitions here without breaking imports.
 */

export type {
  OnboardingGoal,
  OnboardingActivityLevel,
  OnboardingWorkoutPreference,
  OnboardingDietType,
  OnboardingInput,
  Exercise,
  WeeklyScheduleDay,
  WorkoutPlan,
  MealSuggestion,
  MealProduct,
  MarketplaceProduct,
  CartItem,
  Order,
  WaterLog,
  WorkoutLog,
} from "../engine/schemas";
