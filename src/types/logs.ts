/**
 * App-specific log types — water and workout logs (no engine formula
 * equivalents; used purely for progress tracking UI).
 *
 * A-22 (audit 2026-08): extracted from `src/engine/schemas.ts` to keep that
 * module focused on engine-domain types only. `src/engine/schemas.ts`
 * re-exports these types for backward compatibility, and `src/types/index.ts`
 * is the convenience barrel for callers that want a single import surface.
 */

export interface WaterLog {
  date: string; // YYYY-MM-DD
  amountMl: number;
}

export interface WorkoutLog {
  date: string;
  workoutTitle: string;
  durationMinutes: number;
  caloriesBurned: number;
}
