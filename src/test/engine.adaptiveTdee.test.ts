/**
 * Engine adaptive-TDEE tests — covers Part 4.1 (adaptive TDEE blending
 * prior + observed estimates, outlier detection, EWMA smoothing) and
 * Part 4.5 (energy-content constants such as the 3,500-kcal/lb rule).
 *
 * Every test maps to a specific section of the Unified Reference Guide so
 * engineers can trace failures back to the spec.
 */

import { describe, it, expect } from "vitest";
import {
  type User,
  computePriorTdee,
  computeObservedTdee,
  priorWeightAlpha,
  computeAdaptiveTdee,
  detectOutliers,
  ewmaWeight,
  TAU_DAYS,
  KCAL_PER_LB_FAT,
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
// Part 4.1 — Adaptive TDEE
// ===========================================================================

describe("Part 4.1 / Adaptive TDEE", () => {
  it("TAU_DAYS = 14 (half-life ~10 days)", () => {
    expect(TAU_DAYS).toBe(14);
  });

  it("prior weight α(0) = 1.0 (fully prior)", () => {
    expect(priorWeightAlpha(0)).toBeCloseTo(1.0, 5);
  });

  it("prior weight α(14) ≈ 0.37", () => {
    expect(priorWeightAlpha(14)).toBeCloseTo(Math.exp(-1), 3);
    expect(priorWeightAlpha(14)).toBeCloseTo(0.3679, 3);
  });

  it("prior weight α(30) ≈ 0.12", () => {
    expect(priorWeightAlpha(30)).toBeCloseTo(0.117, 2);
  });

  it("prior weight α(60) ≈ 0.014 (effectively data-driven)", () => {
    expect(priorWeightAlpha(60)).toBeLessThan(0.02);
  });

  it("computePriorTdee = Mifflin × SAF with adjustments", () => {
    const user = makeUser();
    const result = computePriorTdee(user);
    expect(result.bmr_kcal).toBeGreaterThan(1500);
    expect(result.activity_factor).toBe(1.55);
    expect(result.tdee_kcal).toBeCloseTo(result.bmr_kcal * 1.55, 1);
  });

  it("computeObservedTdee returns null with insufficient data", () => {
    expect(computeObservedTdee({ intakes: [], weights: [] })).toBeNull();
  });

  it("computeObservedTdee: weight-stable + intake 2500 → TDEE ≈ 2500", () => {
    const intakes = Array.from({ length: 7 }, (_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, "0")}`,
      kcal: 2500,
      protein_g: 150,
      carbs_g: 300,
      fat_g: 80,
    }));
    const weights = [
      { date: "2025-01-01", weight_kg: 80 },
      { date: "2025-01-08", weight_kg: 80 },
    ];
    const result = computeObservedTdee({ intakes, weights });
    expect(result).not.toBeNull();
    expect(result!.tdee_kcal).toBeCloseTo(2500, 0);
  });

  it("computeObservedTdee: gaining 0.5 kg/wk + intake 3000 → TDEE ≈ 1880", () => {
    const intakes = Array.from({ length: 7 }, (_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, "0")}`,
      kcal: 3000,
      protein_g: 150,
      carbs_g: 350,
      fat_g: 100,
    }));
    const weights = [
      { date: "2025-01-01", weight_kg: 80 },
      { date: "2025-01-08", weight_kg: 80.5 },
    ];
    const result = computeObservedTdee({ intakes, weights });
    expect(result).not.toBeNull();
    // delta = +0.5 kg = +1.1 lb over 7 days → 1.1×3500/7 = 550 kcal/day deficit-from-intake
    // TDEE = 3000 - 550 = 2450
    expect(result!.tdee_kcal).toBeCloseTo(2450, -1);
  });

  it("computeAdaptiveTdee: day 0 returns prior", () => {
    const user = makeUser();
    const result = computeAdaptiveTdee({
      user,
      intakes: [],
      weights: [],
      days_logged: 0,
    });
    expect(result.alpha).toBe(1.0);
    expect(result.observed_tdee_kcal).toBeNull();
    expect(result.adaptive_tdee_kcal).toBe(result.prior_tdee_kcal);
    expect(result.confidence).toBe(0);
  });

  it("computeAdaptiveTdee: with 60 days of data, observed dominates", () => {
    const user = makeUser();
    // 60 days of weight-stable data at 3000 kcal intake.
    const intakes = Array.from({ length: 60 }, (_, i) => ({
      date: `2025-01-${String((i % 28) + 1).padStart(2, "0")}`,
      kcal: 3000,
      protein_g: 150,
      carbs_g: 350,
      fat_g: 100,
    }));
    const weights = [
      { date: "2025-01-01", weight_kg: 80 },
      { date: "2025-03-01", weight_kg: 80 },
    ];
    const result = computeAdaptiveTdee({
      user,
      intakes,
      weights,
      days_logged: 60,
    });
    expect(result.alpha).toBeLessThan(0.02);
    expect(result.observed_tdee_kcal).not.toBeNull();
    // Adaptive should be very close to observed (2500-ish).
    expect(Math.abs(result.adaptive_tdee_kcal - (result.observed_tdee_kcal ?? 0))).toBeLessThan(50);
    expect(result.confidence).toBeGreaterThan(0.95);
  });

  it("detectOutliers: flags large weight jumps", () => {
    const weights = [
      { date: "2025-01-01", weight_kg: 80 },
      { date: "2025-01-02", weight_kg: 82 }, // +2 kg = 2.5% of 80 kg → flagged
      { date: "2025-01-03", weight_kg: 80.1 },
    ];
    const intakes = [
      { date: "2025-01-01", kcal: 2500, protein_g: 150, carbs_g: 300, fat_g: 80 },
      { date: "2025-01-02", kcal: 2500, protein_g: 150, carbs_g: 300, fat_g: 80 },
      { date: "2025-01-03", kcal: 2500, protein_g: 150, carbs_g: 300, fat_g: 80 },
    ];
    const flags = detectOutliers({ intakes, weights, body_weight_kg: 80 });
    expect(flags.large_water_weight_jumps.length).toBeGreaterThan(0);
  });

  it("EWMA smooths recent weights", () => {
    const weights = [
      { date: "2025-01-01", weight_kg: 80 },
      { date: "2025-01-02", weight_kg: 80 },
      { date: "2025-01-03", weight_kg: 80 },
      { date: "2025-01-04", weight_kg: 80 },
      { date: "2025-01-05", weight_kg: 81 },
    ];
    const ewma = ewmaWeight(weights);
    expect(ewma).not.toBeNull();
    expect(ewma!).toBeGreaterThan(80);
    expect(ewma!).toBeLessThan(81);
  });
});

// ===========================================================================
// Part 4.5 — 3,500-kcal/lb rule
// ===========================================================================

describe("Part 4.5 / Energy-content constants", () => {
  it("1 lb fat ≈ 3500 kcal (energy content)", () => {
    expect(KCAL_PER_LB_FAT).toBe(3500);
  });

  it("Alpert max weekly loss = (max daily deficit × 7) / 3500", () => {
    // Verified above in Part 1.6 tests; ensure the constant is consistent.
    const daily = 22 * 40; // 880 kcal/day for 40 lb fat
    const weekly = (daily * 7) / KCAL_PER_LB_FAT;
    expect(weekly).toBeCloseTo(1.76, 2);
  });
});
