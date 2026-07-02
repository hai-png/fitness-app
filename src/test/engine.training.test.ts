/**
 * Engine training tests — covers Part 2.4–2.8 of the engine: progression
 * schemes (linear, ADP), deload triggers, exercise selection / movement
 * pattern inference, plateau diagnosis and volume adjustment, and the
 * top-level buildTrainingPlan() entry point.
 *
 * Every test maps to a specific section of the Unified Reference Guide so
 * engineers can trace failures back to the spec.
 */

import { describe, it, expect } from "vitest";
import {
  type User,
  LINEAR_INCREMENTS_LB,
  ADP_LOAD_ADJUSTMENT_PCT,
  selectProgressionScheme,
  adpNextSetLoad,
  shouldDeload,
  applyDeload,
  inferMovementPattern,
  inferExerciseCategory,
  fractionalSetCredit,
  diagnosePlateau,
  adjustVolumeForPlateau,
  buildTrainingPlan,
} from "../engine";

// ===========================================================================
// Test fixtures
// ===========================================================================

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "test-user-1",
    sex: "male",
    age_years: 30,
    height_cm: 178,
    weight_kg: 80,
    unit_system: "metric",
    is_pregnant: false,
    is_breastfeeding: false,
    has_eating_disorder_history: false,
    has_kidney_disease: false,
    activity_level: "moderate",
    training_days_per_week: 4,
    training_status: "intermediate",
    primary_goal: "maintain",
    is_currently_in_deficit: false,
    is_weight_reduced: false,
    ...overrides,
  };
}

// ===========================================================================
// Part 2.4 — Progression schemes
// ===========================================================================

describe("Part 2.4 / Progression", () => {
  it("linear increments: 10 lb compound, 5 lb other (Part 2.4.1)", () => {
    expect(LINEAR_INCREMENTS_LB.compound).toBe(10);
    expect(LINEAR_INCREMENTS_LB.other).toBe(5);
  });

  it("ADP load adjustment = 4% per rep outside range (Part 2.4.2)", () => {
    expect(ADP_LOAD_ADJUSTMENT_PCT).toBe(0.04);
  });

  it("selectProgressionScheme: novices with weekly progress → linear", () => {
    const user = makeUser({ training_status: "novice" });
    expect(selectProgressionScheme(user, true)).toBe("linear");
  });

  it("selectProgressionScheme: intermediate → ADP", () => {
    const user = makeUser({ training_status: "intermediate" });
    expect(selectProgressionScheme(user, false)).toBe("adp");
  });

  it("ADP: within range → keep load", () => {
    const result = adpNextSetLoad({
      current_load_kg: 80,
      reps_achieved: 12,
      target_reps: [10, 15],
      target_rir: [2, 0],
      rir_achieved: 1,
    });
    expect(result.next_load_kg).toBe(80);
  });

  it("ADP: at top of rep+RIR range → increase load next session", () => {
    const result = adpNextSetLoad({
      current_load_kg: 80,
      reps_achieved: 15,
      target_reps: [10, 15],
      target_rir: [2, 0],
      rir_achieved: 0,
    });
    expect(result.next_load_kg).toBeGreaterThan(80);
  });

  it("ADP: reps over upper boundary → increase load", () => {
    const result = adpNextSetLoad({
      current_load_kg: 80,
      reps_achieved: 18,
      target_reps: [10, 15],
      target_rir: [2, 0],
      rir_achieved: 0,
    });
    // 3 reps over → +12% → 89.6 kg
    expect(result.next_load_kg).toBeCloseTo(89.6, 1);
  });

  it("ADP: reps under lower boundary → decrease load", () => {
    const result = adpNextSetLoad({
      current_load_kg: 80,
      reps_achieved: 7,
      target_reps: [10, 15],
      target_rir: [2, 0],
      rir_achieved: 0,
    });
    // 3 reps under → -12% → 70.4 kg
    expect(result.next_load_kg).toBeCloseTo(70.4, 1);
  });

  it("deload triggers at 2+ yes (Part 2.4.4)", () => {
    expect(shouldDeload({
      dreading_gym: false,
      sleep_worse: false,
      loads_or_reps_decreasing: false,
      stress_worse: false,
      aches_worse: false,
    }).deload).toBe(false);
    expect(shouldDeload({
      dreading_gym: true,
      sleep_worse: true,
      loads_or_reps_decreasing: false,
      stress_worse: false,
      aches_worse: false,
    }).deload).toBe(true);
  });

  it("applyDeload reduces volume by configured percentage", () => {
    const user = makeUser();
    const plan = buildTrainingPlan({
      user,
      goal: "hypertrophy",
      exercises: [
        {
          exercise_name: "Bench Press",
          movement_pattern: "horizontal_push",
          exercise_category: "lower_machine_or_upper_free_weight_press",
          sets: 16,
          reps: [6, 12],
          rir: [2, 0],
          rest_seconds: 150,
          is_primary: true,
          primary_muscle_group: "Chest",
          secondary_muscle_groups: ["Triceps", "Front Delts"],
        },
      ],
    });
    const deloaded = applyDeload(plan);
    // 40% reduction → 16 × 0.6 = 9.6 → 10
    // Q-07: safe — controlled test data, plan.exercises has 1 element.
    expect(deloaded.exercises[0]!.sets).toBe(10);
    expect(deloaded.weekly_sets_per_muscle.Chest).toBe(10);
  });
});

// ===========================================================================
// Part 2.5 — Exercise selection
// ===========================================================================

describe("Part 2.5 / Exercise selection", () => {
  it("infers movement pattern from exercise name", () => {
    expect(inferMovementPattern("Barbell Back Squat")).toBe("squat");
    expect(inferMovementPattern("Romanian Deadlift")).toBe("hip_hinge");
    expect(inferMovementPattern("Overhead Press")).toBe("vertical_push");
    expect(inferMovementPattern("Lat Pulldown")).toBe("vertical_pull");
    expect(inferMovementPattern("Flat Barbell Bench Press")).toBe("horizontal_push");
    expect(inferMovementPattern("Seated Cable Row")).toBe("horizontal_pull");
    expect(inferMovementPattern("Bicep Curl")).toBe("isolation");
  });

  it("infers exercise category for rep/RIR assignment", () => {
    expect(inferExerciseCategory("Barbell Back Squat")).toBe("lower_free_weight_compound");
    expect(inferExerciseCategory("Romanian Deadlift")).toBe("lower_free_weight_compound");
    expect(inferExerciseCategory("Leg Press")).toBe("lower_machine_or_upper_free_weight_press");
    expect(inferExerciseCategory("Overhead Press")).toBe("lower_machine_or_upper_free_weight_press");
    expect(inferExerciseCategory("Lat Pulldown")).toBe("upper_machine_or_pulling_compound");
    expect(inferExerciseCategory("Bicep Curl")).toBe("isolation");
  });

  it("fractional set counting: primary 1.0, secondary 0.5 (Part 2.5.3)", () => {
    expect(fractionalSetCredit(10, true)).toBe(10);
    expect(fractionalSetCredit(10, false)).toBe(5);
  });
});

// ===========================================================================
// Part 2.6 — Plateau handling
// ===========================================================================

describe("Part 2.6 / Plateau handling", () => {
  it("not plateaued → no action", () => {
    const result = diagnosePlateau({ is_actually_plateaued: false });
    expect(result.cause).toBe("not_plateaued");
  });

  it("sleep <7 hours → sleep cause", () => {
    const result = diagnosePlateau({
      is_actually_plateaued: true,
      sleep_hours_avg: 6,
    });
    expect(result.cause).toBe("sleep");
  });

  it("intermediate+ in deficit → eating cause", () => {
    const result = diagnosePlateau({
      is_actually_plateaued: true,
      sleep_hours_avg: 8,
      is_in_deficit: true,
      training_status: "intermediate",
    });
    expect(result.cause).toBe("eating");
  });

  it("protein <0.7 g/lb → protein cause", () => {
    const result = diagnosePlateau({
      is_actually_plateaued: true,
      sleep_hours_avg: 8,
      is_in_deficit: false,
      training_status: "intermediate",
      protein_g_per_lb: 0.5,
    });
    expect(result.cause).toBe("protein");
  });

  it("frequency <2 → frequency cause", () => {
    const result = diagnosePlateau({
      is_actually_plateaued: true,
      sleep_hours_avg: 8,
      is_in_deficit: false,
      training_status: "intermediate",
      protein_g_per_lb: 1.0,
      frequency_per_muscle: 1,
    });
    expect(result.cause).toBe("frequency");
  });

  it("all causes addressed → volume_adjustment", () => {
    const result = diagnosePlateau({
      is_actually_plateaued: true,
      sleep_hours_avg: 8,
      is_in_deficit: false,
      training_status: "intermediate",
      protein_g_per_lb: 1.0,
      frequency_per_muscle: 2,
    });
    expect(result.cause).toBe("volume_adjustment");
  });

  it("adjustVolumeForPlateau: overreaching → ×0.8", () => {
    expect(adjustVolumeForPlateau(20, "overreaching")).toBe(16);
  });

  it("adjustVolumeForPlateau: all addressed → ×1.2", () => {
    expect(adjustVolumeForPlateau(20, "all_addressed")).toBe(24);
  });
});

// ===========================================================================
// Part 2.8 — buildTrainingPlan
// ===========================================================================

describe("Part 2.8 / buildTrainingPlan", () => {
  it("produces a complete TrainingPlan", () => {
    const user = makeUser();
    const plan = buildTrainingPlan({
      user,
      goal: "hypertrophy",
      exercises: [
        {
          exercise_name: "Bench Press",
          movement_pattern: "horizontal_push",
          exercise_category: "lower_machine_or_upper_free_weight_press",
          sets: 12,
          reps: [6, 12],
          rir: [2, 0],
          rest_seconds: 150,
          is_primary: true,
          primary_muscle_group: "Chest",
          secondary_muscle_groups: ["Triceps"],
        },
      ],
    });

    expect(plan.user_id).toBe("test-user-1");
    expect(plan.goal).toBe("hypertrophy");
    expect(plan.days_per_week).toBe(4);
    expect(plan.split_type).toBe("upper_lower");
    expect(plan.weekly_sets_per_muscle.Chest).toBe(12);
    expect(plan.progression_scheme).toBe("adp"); // intermediate → ADP
    expect(plan.deload_trigger).toBe("reactive");
  });
});
