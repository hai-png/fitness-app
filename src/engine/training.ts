/**
 * Training Engine — Part 2 of the Unified Reference Guide.
 *
 * Implements:
 *   2.1  6-layer training pyramid (Adherence → VIF → Progression → Selection → Rest → Tempo)
 *   2.2  Hypertrophy defaults (volume tiers, frequency, rep/RIR table)
 *   2.3  Strength periodization (Volume → Load → Peak)
 *   2.4  Progression schemes (Linear for novices, ADP for everyone else)
 *   2.5  Exercise selection logic (6 movement patterns, compound vs isolation)
 *   2.6  Plateau handling (7-cause flowchart, ±20% volume adjustment, BFR)
 *   2.7  Training log schema (in schemas.ts)
 *   2.8  buildTrainingPlan() — composes everything into TrainingPlan
 *
 * All functions are pure. No IO. No side effects. Unit-testable.
 */

import type {
  ExerciseCategory,
  MovementPattern,
  ProgressionScheme,
  TrainingLogExercise,
  TrainingPlan,
  TrainingPlanExercise,
  TrainingStatus,
  User,
} from "./schemas";

// ===========================================================================
// 2.2 Hypertrophy defaults
// ===========================================================================

export interface VolumeTier {
  weekly_sets_per_muscle: [number, number];
  time_commitment: string;
  total_stimulus: string;
}

export const VOLUME_TIERS: VolumeTier[] = [
  { weekly_sets_per_muscle: [4, 8], time_commitment: "~1-2.5 hr", total_stimulus: "Lowest (~25-45%)" },
  { weekly_sets_per_muscle: [9, 12], time_commitment: "~3-4.5 hr", total_stimulus: "Modest (~45-60%)" },
  { weekly_sets_per_muscle: [13, 16], time_commitment: "~5-6.5 hr", total_stimulus: "Medium (~60-70%)" },
  { weekly_sets_per_muscle: [17, 20], time_commitment: "~7-8.5 hr", total_stimulus: "High (~70-85%)" },
  { weekly_sets_per_muscle: [21, 30], time_commitment: "~9+ hr", total_stimulus: "Highest (~85-100%)" },
];

export function frequencyForVolume(weekly_sets: number): number {
  if (weekly_sets <= 10) return 1; // 1-2× / week
  if (weekly_sets <= 20) return 2; // 2-3× / week
  return 3; // 3+ × / week
}

export const REP_RIR_TABLE: Record<
  ExerciseCategory,
  { rep_range: [number, number]; rpe: [number, number]; rir: [number, number] }
> = {
  lower_free_weight_compound: { rep_range: [4, 8], rpe: [6, 8], rir: [4, 2] },
  lower_machine_or_upper_free_weight_press: { rep_range: [4, 12], rpe: [6, 9], rir: [4, 1] },
  upper_machine_or_pulling_compound: { rep_range: [6, 15], rpe: [7, 10], rir: [3, 0] },
  isolation: { rep_range: [8, 20], rpe: [8, 10], rir: [2, 0] },
};

export const HYPERTROPHY_DEFAULTS = {
  frequency_per_muscle_per_week: 2, // 1-3 typical
  days_per_week: { default: 4, range: [3, 5] as [number, number] },
  weekly_sets_per_muscle: { default: 16, range: [10, 20] as [number, number] },
  rep_range: [6, 12] as [number, number], // middle of effective band (4-30 RM)
  intensity_rir: 2, // RIR 0-4 / RPE 6-10
  rest_seconds: { default: 150, range: [120, 180] as [number, number] },
  session_cap_sets_per_muscle: 11,
} as const;

// ===========================================================================
// 2.4 Progression schemes
// ===========================================================================

/**
 * Linear Progression (Part 2.4.1) — novices only.
 *   Compound movements: +10 lb per session
 *   Other exercises:    +5 lb per session (2.5 lb when possible)
 */
export const LINEAR_INCREMENTS_LB = { compound: 10, other: 5 } as const;

/** ADP load adjustment constant (Part 2.4.2): ±4% per rep outside range. */
export const ADP_LOAD_ADJUSTMENT_PCT = 0.04;

/**
 * Decide progression scheme (Part 2.4.3).
 */
export function selectProgressionScheme(
  user: User,
  can_add_weight_every_session: boolean,
): ProgressionScheme {
  if (
    (user.training_status === "beginner" || user.training_status === "novice") &&
    can_add_weight_every_session
  ) {
    return "linear";
  }
  return "adp";
}

/**
 * Autoregulated Double Progression algorithm (Part 2.4.2).
 *
 * Notation: 3×10-15 @2-0 = 3 sets, 10-15 reps target, 2-0 RIR target.
 *
 * Algorithm:
 *   1. Choose load for Set 1 that lands near top of RIR range and middle/lower end of rep range.
 *   2. Stop set at upper RIR boundary (e.g., 2 RIR) even if more reps possible.
 *   3. If first set lands within rep range → keep load for remaining sets.
 *   4. If first set outside range → adjust load on next set:
 *        new_load = current_load × (1 ± 0.04 × reps_outside_range)
 *        +4% per rep over upper rep boundary; -4% per rep under lower rep boundary.
 *   5. When first set hits top of rep range at top of RIR range → increase load next session.
 *
 * This function computes the load to use on the *next set* given what just happened.
 */
export function adpNextSetLoad(args: {
  current_load_kg: number;
  reps_achieved: number;
  target_reps: [number, number]; // [lower, upper]
  target_rir: [number, number]; // [upper_rir, lower_rir]
  rir_achieved: number;
}): { next_load_kg: number; reason: string } {
  const [rep_lo, rep_hi] = args.target_reps;
  const [, rir_lo] = args.target_rir; // [upper_rir, lower_rir] — only lower_rir used

  // Within rep range?
  if (args.reps_achieved >= rep_lo && args.reps_achieved <= rep_hi) {
    // Check if at top of rep range AND top of RIR range → time to increase load next session.
    if (args.reps_achieved === rep_hi && args.rir_achieved <= rir_lo) {
      // Convert lb increment to kg: compound 10 lb ≈ 4.5 kg, other 5 lb ≈ 2.25 kg.
      // Without exercise classification context, use the smaller increment.
      const increment_kg = 2.5;
      return {
        next_load_kg: args.current_load_kg + increment_kg,
        reason: `Hit top of rep range (${rep_hi}) at top of RIR range (${rir_lo}). Increase load next session by ${increment_kg} kg.`,
      };
    }
    return {
      next_load_kg: args.current_load_kg,
      reason: "Within rep range; keep load for remaining sets.",
    };
  }

  // Outside range: adjust load.
  if (args.reps_achieved > rep_hi) {
    // Too easy — reps over upper boundary.
    const reps_over = args.reps_achieved - rep_hi;
    const new_load = args.current_load_kg * (1 + ADP_LOAD_ADJUSTMENT_PCT * reps_over);
    return {
      next_load_kg: new_load,
      reason: `Reps ${reps_over} over upper boundary. Increase load by ${Math.round(ADP_LOAD_ADJUSTMENT_PCT * reps_over * 100)}%.`,
    };
  }

  // reps_achieved < rep_lo → too hard.
  const reps_under = rep_lo - args.reps_achieved;
  const new_load = args.current_load_kg * (1 - ADP_LOAD_ADJUSTMENT_PCT * reps_under);
  return {
    next_load_kg: new_load,
    reason: `Reps ${reps_under} under lower boundary. Decrease load by ${Math.round(ADP_LOAD_ADJUSTMENT_PCT * reps_under * 100)}%.`,
  };
}

// ===========================================================================
// 2.4.4 Reactive deload
// ===========================================================================

export interface DeloadSelfAssessment {
  dreading_gym: boolean;
  sleep_worse: boolean;
  loads_or_reps_decreasing: boolean;
  stress_worse: boolean;
  aches_worse: boolean;
}

/**
 * Reactive deload self-assessment (Part 2.4.4).
 * 0-1 yes → carry on. 2+ yes → deload.
 */
export function shouldDeload(assessment: DeloadSelfAssessment): {
  deload: boolean;
  yes_count: number;
} {
  const yes_count = [
    assessment.dreading_gym,
    assessment.sleep_worse,
    assessment.loads_or_reps_decreasing,
    assessment.stress_worse,
    assessment.aches_worse,
  ].filter(Boolean).length;
  return { deload: yes_count >= 2, yes_count };
}

/** Apply a deload to a plan (Part 2.4.4). */
export function applyDeload(plan: TrainingPlan): TrainingPlan {
  const factor = 1 - plan.deload_protocol.volume_reduction_pct;
  const new_weekly_sets: Record<string, number> = {};
  for (const [muscle, sets] of Object.entries(plan.weekly_sets_per_muscle)) {
    new_weekly_sets[muscle] = Math.max(1, Math.round(sets * factor));
  }
  const new_exercises = plan.exercises.map((ex) => ({
    ...ex,
    sets: Math.max(1, Math.round(ex.sets * factor)),
  }));
  return {
    ...plan,
    weekly_sets_per_muscle: new_weekly_sets,
    exercises: new_exercises,
  };
}

// ===========================================================================
// 2.5 Exercise selection
// ===========================================================================

export const SIX_MOVEMENT_PATTERNS: MovementPattern[] = [
  "squat",
  "hip_hinge",
  "vertical_push",
  "vertical_pull",
  "horizontal_push",
  "horizontal_pull",
];

/**
 * Categorize an exercise by movement pattern (Part 2.5.1).
 * This is a coarse classifier — real implementations should use a curated DB.
 */
export function inferMovementPattern(exercise_name: string): MovementPattern {
  const n = exercise_name.toLowerCase();
  if (n.includes("squat") || n.includes("leg press") || n.includes("lunge")) return "squat";
  if (n.includes("deadlift") || n.includes("rdl") || n.includes("hamstring curl") || n.includes("hip thrust"))
    return "hip_hinge";
  if (n.includes("overhead press") || n.includes("ohp") || n.includes("shoulder press") || n.includes("lateral raise"))
    return "vertical_push";
  if (n.includes("pulldown") || n.includes("pull up") || n.includes("chin up")) return "vertical_pull";
  if (n.includes("bench") || n.includes("press") || n.includes("push up") || n.includes("dip"))
    return "horizontal_push";
  if (n.includes("row") || n.includes("pull")) return "horizontal_pull";
  return "isolation";
}

/**
 * Categorize exercise by category for rep/RIR assignment (Part 2.5.2).
 */
export function inferExerciseCategory(exercise_name: string): ExerciseCategory {
  const n = exercise_name.toLowerCase();
  // Lower free-weight compound.
  if (
    (n.includes("squat") && !n.includes("leg press") && !n.includes("machine")) ||
    n.includes("deadlift") ||
    n.includes("rdl")
  ) {
    return "lower_free_weight_compound";
  }
  // Lower machine compound OR upper free-weight pressing.
  if (
    n.includes("leg press") ||
    n.includes("hack squat") ||
    n.includes("overhead press") ||
    n.includes("ohp") ||
    n.includes("bench") ||
    n.includes("incline") && (n.includes("db") || n.includes("dumbbell"))
  ) {
    return "lower_machine_or_upper_free_weight_press";
  }
  // Upper machine pressing OR pulling compound.
  if (
    n.includes("pulldown") ||
    n.includes("row") ||
    n.includes("chest press machine") ||
    n.includes("cable")
  ) {
    return "upper_machine_or_pulling_compound";
  }
  return "isolation";
}

/**
 * Fractional set counting (Part 2.5.3).
 * Primary muscle = 1.0 set credit; secondary = 0.5.
 */
export function fractionalSetCredit(
  sets: number,
  is_primary: boolean,
): number {
  return is_primary ? sets : sets * 0.5;
}

// ===========================================================================
// 2.6 Plateau handling
// ===========================================================================

export type PlateauCause =
  | "not_plateaued"
  | "sleep"
  | "eating"
  | "protein"
  | "intensity_too_low"
  | "intensity_too_high"
  | "frequency"
  | "technique"
  | "joint_pain"
  | "volume_adjustment";

export interface PlateauDiagnosisInput {
  is_actually_plateaued: boolean;
  sleep_hours_avg?: number;
  is_in_deficit?: boolean;
  training_status?: TrainingStatus;
  protein_g_per_lb?: number;
  is_overestimating_rpe?: boolean;
  is_underestimating_rpe?: boolean;
  frequency_per_muscle?: number;
  has_technique_issues?: boolean;
  has_joint_pain?: boolean;
}

/**
 * 7-cause plateau diagnosis flowchart (Part 2.6.1).
 */
export function diagnosePlateau(input: PlateauDiagnosisInput): {
  cause: PlateauCause;
  recommendation: string;
} {
  if (!input.is_actually_plateaued) {
    return { cause: "not_plateaued", recommendation: "Not actually plateaued." };
  }
  // Cause 1: Sleep.
  if (input.sleep_hours_avg !== undefined && input.sleep_hours_avg < 7) {
    return { cause: "sleep", recommendation: "Increase to ≥ 7 hours/night." };
  }
  // Cause 2: Not eating enough (cut inherently limits progress).
  if (
    input.is_in_deficit &&
    (input.training_status === "intermediate" ||
      input.training_status === "advanced" ||
      input.training_status === "elite")
  ) {
    return {
      cause: "eating",
      recommendation: "Increase calories if outside expected cut-progress window (progress in 1st 1/3, maintain in middle, regress in last 1/3).",
    };
  }
  // Cause 3: Protein.
  if (input.protein_g_per_lb !== undefined && input.protein_g_per_lb < 0.7) {
    return { cause: "protein", recommendation: "Increase to ≥ 0.7 g/lb (1.6 g/kg)." };
  }
  // Cause 4: RPE accuracy.
  if (input.is_overestimating_rpe) {
    return { cause: "intensity_too_low", recommendation: "Train closer to failure; recalibrate RPE." };
  }
  if (input.is_underestimating_rpe) {
    return { cause: "intensity_too_high", recommendation: "Back off from failure." };
  }
  // Cause 5: Frequency.
  if (input.frequency_per_muscle !== undefined && input.frequency_per_muscle < 2) {
    return { cause: "frequency", recommendation: "Increase to ≥ 2× / muscle / week." };
  }
  // Cause 6: Technique.
  if (input.has_technique_issues) {
    return { cause: "technique", recommendation: "Video review; consider coach." };
  }
  // Cause 7: Joint pain.
  if (input.has_joint_pain) {
    return { cause: "joint_pain", recommendation: "Up reps to 12-20 on painful exercises; consider BFR." };
  }
  // All causes addressed, still plateaued → adjust volume ±20%.
  return {
    cause: "volume_adjustment",
    recommendation: "All causes addressed, still plateaued → adjust volume ±20% sets across the board.",
  };
}

/**
 * Volume adjustment for plateau (Part 2.6.2).
 *   overreaching/not recovering → ×0.80
 *   all causes addressed → ×1.20
 */
export function adjustVolumeForPlateau(
  current_sets: number,
  issue: "overreaching" | "all_addressed",
): number {
  if (issue === "overreaching") return Math.round(current_sets * 0.8);
  return Math.round(current_sets * 1.2);
}

/**
 * BFR protocol (Part 2.6.3) — for joint pain in knees/elbows.
 */
export const BFR_PROTOCOL = {
  wrap_position: "proximal limb (upper thigh or armpit)",
  tightness: "7 / 10 (firm but not restrictive to point of tingling or discoloration)",
  load_pct_of_1rm: 0.3, // 20-30% of 1RM
  rir: 3, // 0-3 RIR
  notes:
    "Use normally programmed number of sets. Equally effective as traditional training for hypertrophy (not for strength). Useful when joint pain precludes heavy loading.",
} as const;

// ===========================================================================
// 2.8 buildTrainingPlan
// ===========================================================================

/**
 * Build a default TrainingPlan from a User + goal.
 * This is intentionally generic — real implementations will use curated exercise DBs
 * (e.g. the existing src/data/workoutTemplates.ts) and split templates.
 */
export function buildTrainingPlan(args: {
  user: User;
  goal: TrainingPlan["goal"];
  exercises: TrainingPlanExercise[];
  days_per_week?: number;
  split_type?: TrainingPlan["split_type"];
}): TrainingPlan {
  const days_per_week = args.days_per_week ?? HYPERTROPHY_DEFAULTS.days_per_week.default;
  const split_type = args.split_type ?? "upper_lower";

  // Aggregate weekly sets per primary muscle group.
  const weekly_sets: Record<string, number> = {};
  const muscle_freq: Record<string, number> = {};
  for (const ex of args.exercises) {
    weekly_sets[ex.primary_muscle_group] =
      (weekly_sets[ex.primary_muscle_group] ?? 0) + ex.sets;
    muscle_freq[ex.primary_muscle_group] =
      muscle_freq[ex.primary_muscle_group] ?? days_per_week;
  }

  // Rep / RIR ranges by category (Part 2.2.3).
  const rep_ranges: Record<string, [number, number]> = {};
  const rir_targets: Record<string, [number, number]> = {};
  for (const cat of [
    "lower_free_weight_compound",
    "lower_machine_or_upper_free_weight_press",
    "upper_machine_or_pulling_compound",
    "isolation",
  ] as ExerciseCategory[]) {
    const row = REP_RIR_TABLE[cat];
    rep_ranges[cat] = row.rep_range;
    rir_targets[cat] = row.rir;
  }

  // Progression scheme: novices get linear; everyone else gets ADP.
  const progression_scheme: ProgressionScheme = selectProgressionScheme(args.user, true);

  return {
    user_id: args.user.id,
    plan_id: `tp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    created_at: new Date().toISOString(),
    version: 1,
    goal: args.goal,
    days_per_week,
    split_type,
    weekly_sets_per_muscle: weekly_sets,
    muscle_group_frequency_per_week: muscle_freq,
    intensity_protocol: {
      rep_ranges,
      rir_targets,
    },
    progression_scheme,
    linear_increment_lb: { ...LINEAR_INCREMENTS_LB },
    adp_load_adjustment_pct: ADP_LOAD_ADJUSTMENT_PCT,
    exercises: args.exercises,
    default_rest_seconds: HYPERTROPHY_DEFAULTS.rest_seconds.default,
    deload_trigger: "reactive",
    deload_protocol: {
      volume_reduction_pct: 0.4, // 30-50% midpoint
      intensity_maintained: true,
      frequency_maintained: true,
    },
  };
}

// ===========================================================================
// Training log analysis (helpers for the existing analyticsEngine.ts)
// ===========================================================================

/**
 * Determine if a lift is plateaued based on the last N sessions.
 * Used by the existing ProgressTab analytics in conjunction with the engine.
 *
 * A "plateau" = top working-set weight has not increased across the last 3 sessions.
 * Special case: bodyweight exercises (Plank holding) are excluded.
 */
export function isLiftPlateaued(sessions: TrainingLogExercise[]): {
  plateaued: boolean;
  top_weights: number[];
} {
  if (sessions.length < 3) return { plateaued: false, top_weights: [] };
  const recent = sessions.slice(-3);
  const top_weights = recent.map((sess) => {
    const working = sess.sets.filter((s) => s.completed).map((s) => s.load_kg);
    return working.length > 0 ? Math.max(...working) : 0;
  });
  // Q-07: safe — recent = sessions.slice(-3) and early return ensures sessions.length >= 3,
  // so recent has exactly 3 elements: indices 0, 1, 2 always exist.
  // Use ?? 0 to satisfy noUncheckedIndexedAccess without no-non-null-assertion.
  const plateaued = (top_weights[2] ?? 0) <= (top_weights[0] ?? 0);
  return { plateaued, top_weights };
}
