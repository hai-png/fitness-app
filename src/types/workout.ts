/**
 * Workout UI domain types — the weekly schedule shape used by the workout
 * plan generator, curated exercise DB, and Training tab. Distinct from
 * `TrainingPlan` (the spec-level engine type for progression, periodization,
 * volume landmarks, etc.).
 *
 * A-22 (audit 2026-08): extracted from `src/engine/schemas.ts` to keep that
 * module focused on engine-domain types only. `src/engine/schemas.ts`
 * re-exports these types for backward compatibility, and `src/types/index.ts`
 * is the convenience barrel for callers that want a single import surface.
 */

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  instruction: string;
  targetMuscle?: string;
  videoUrl?: string;
  steps?: string[];
}

export interface WeeklyScheduleDay {
  day: string;
  activityType: string;
  durationMinutes: number;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  title: string;
  description: string;
  difficulty: string;
  weeklySchedule: WeeklyScheduleDay[];
  tips: string[];
  durationWeeks?: number;
  currentWeek?: number;
  goalType?: string;
}
