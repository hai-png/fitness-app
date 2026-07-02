/**
 * Engine nutrition tests — covers Part 3.4–3.16 of the engine: cut/bulk/recomp
 * decisioning, cutting and bulking rate tables, recomp potential, reverse
 * dieting, macro recipe, micronutrients, keto decisioning, the top-level
 * buildNutritionPlan() entry point, and the applyMacroAdjustment /
 * recommendAdjustment helpers.
 *
 * Every test maps to a specific section of the Unified Reference Guide so
 * engineers can trace failures back to the spec.
 */

import { describe, it, expect } from "vitest";
import {
  type User,
  runAssessment,
  recommendGoal,
  CUT_RATE_TIERS,
  CUT_SWEET_SPOT_PCT,
  cutAdjustmentDeltaKcal,
  BULK_RATE_TABLE,
  bulkDailySurplusKcal,
  cutToBulkTransitionKcal,
  bulkAdjustmentDeltaKcal,
  BULK_SURPLUS_SPLIT,
  MCDONALD_MUSCLE_GAIN_KG,
  recompPotential,
  recompCalorieTarget,
  REVERSE_DIET_TIERS,
  reverseDietSchedule,
  REVERSE_DIET_GUARDRAIL_PCT,
  proteinRateGPerLb,
  proteinGrams,
  fatGrams,
  roundMacro5,
  computeMacros,
  fiberTargetG,
  fruitVegCups,
  supplementStack,
  ketoDecision,
  buildNutritionPlan,
  applyMacroAdjustment,
  recommendAdjustment,
  nextAdjustmentEligibleDate,
  CALORIE_FLOOR,
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
// Part 3.4 — Cut/Bulk/Recomp decisioning
// ===========================================================================

describe("Part 3.4 / Cut/Bulk/Recomp decisioning", () => {
  it("health action threshold fires above 25% (men) / 35% (women)", () => {
    const result = recommendGoal({
      bf_pct: 28,
      sex: "male",
      training_status: "intermediate",
      focus: "physique",
    });
    expect(result.goal).toBe("cut");
    expect(result.health_action_threshold_bf_pct).toBe(25);
  });

  it("physique cycle: >20% male-equivalent → cut", () => {
    const result = recommendGoal({
      bf_pct: 22,
      sex: "male",
      training_status: "intermediate",
      focus: "physique",
    });
    expect(result.goal).toBe("cut");
  });

  it("physique cycle: <9% male-equivalent → bulk", () => {
    const result = recommendGoal({
      bf_pct: 8,
      sex: "male",
      training_status: "intermediate",
      focus: "physique",
    });
    expect(result.goal).toBe("bulk");
  });

  it("beginner in 13-18% BF range → recomp", () => {
    const result = recommendGoal({
      bf_pct: 15,
      sex: "male",
      training_status: "beginner",
      focus: "physique",
    });
    expect(result.goal).toBe("recomp");
  });

  it("experienced trainee >16% BF → cut", () => {
    const result = recommendGoal({
      bf_pct: 17,
      sex: "male",
      training_status: "advanced",
      focus: "physique",
    });
    expect(result.goal).toBe("cut");
  });

  it("middle range, no preference → maintain", () => {
    const result = recommendGoal({
      bf_pct: 12,
      sex: "male",
      training_status: "intermediate",
      focus: "physique",
    });
    expect(result.goal).toBe("maintain");
  });

  it("female thresholds = male + 8 (Part 3.4.2)", () => {
    const result = recommendGoal({
      bf_pct: 30,
      sex: "female",
      training_status: "intermediate",
      focus: "physique",
    });
    expect(result.goal).toBe("cut"); // 30% female = 22% male-equivalent → cut
    expect(result.physique_action_threshold_bf_pct).toBe(28);
  });
});

// ===========================================================================
// Part 3.5 — Cutting
// ===========================================================================

describe("Part 3.5 / Cutting", () => {
  it("MacroFactor 5-tier rate table has 5 tiers (Part 3.5.2)", () => {
    expect(CUT_RATE_TIERS).toHaveLength(5);
    expect(CUT_RATE_TIERS[0].label).toBe("very_conservative");
    expect(CUT_RATE_TIERS[0].pct_body_weight_per_week).toBe(0.1);
    expect(CUT_RATE_TIERS[4].label).toBe("aggressive");
    expect(CUT_RATE_TIERS[4].pct_body_weight_per_week).toBe(1.5);
  });

  it("sweet spot is 0.6-0.7% BW/week (Part 3.5.1)", () => {
    expect(CUT_SWEET_SPOT_PCT.low).toBe(0.6);
    expect(CUT_SWEET_SPOT_PCT.high).toBe(0.7);
  });

  it("cut adjustment formula: delta = (actual - target) × 500 (Part 3.5.6)", () => {
    // Target 1.0 lb/wk, actual 0.5 lb/wk → delta = -250 (reduce)
    expect(cutAdjustmentDeltaKcal(0.5, 1.0)).toBe(-250);
    // Target 1.0, actual 1.3 → delta = +150 (add). Use toBeCloseTo for FP precision.
    expect(cutAdjustmentDeltaKcal(1.3, 1.0)).toBeCloseTo(150, 5);
  });
});

// ===========================================================================
// Part 3.6 — Bulking
// ===========================================================================

describe("Part 3.6 / Bulking", () => {
  it("4-category rate table matches Part 3.6.2 (resolves Group E C3)", () => {
    expect(BULK_RATE_TABLE.beginner.pct_body_weight_per_month).toBe(2.0);
    expect(BULK_RATE_TABLE.novice.pct_body_weight_per_month).toBe(1.5);
    expect(BULK_RATE_TABLE.intermediate.pct_body_weight_per_month).toBe(1.0);
    expect(BULK_RATE_TABLE.advanced.pct_body_weight_per_month).toBe(0.5);
  });

  it("surplus math with +50% NEAT buffer: 150 kcal/day per lb/month (Part 3.6.3)", () => {
    // Worked example from guide: 2.4 lb/month target → 360 kcal/day surplus
    expect(bulkDailySurplusKcal(2.4)).toBe(360);
  });

  it("cut→bulk transition: weekly_loss×500 + monthly_gain×150 (Part 3.6.3)", () => {
    // 1.0 lb/wk loss + 1.8 lb/mo gain target → 500 + 270 = 770
    expect(cutToBulkTransitionKcal(1.0, 1.8)).toBe(770);
  });

  it("bulk adjustment: delta = (target - actual) × 150 (Part 3.6.8)", () => {
    expect(bulkAdjustmentDeltaKcal(2.0, 1.0)).toBe(150); // need to add 150 kcal
    expect(bulkAdjustmentDeltaKcal(1.0, 2.0)).toBe(-150); // need to reduce 150
  });

  it("bulk surplus split is 75:25 carbs:fats (Part 3.6.5)", () => {
    expect(BULK_SURPLUS_SPLIT.carbs_pct).toBe(0.75);
    expect(BULK_SURPLUS_SPLIT.fat_pct).toBe(0.25);
  });
});

// ===========================================================================
// Part 3.7 — Recomp
// ===========================================================================

describe("Part 3.7 / Recomp", () => {
  it("McDonald muscle-gain table (Part 3.7.1): women = 50% of men", () => {
    expect(MCDONALD_MUSCLE_GAIN_KG.beginner.male[0]).toBe(0.7);
    expect(MCDONALD_MUSCLE_GAIN_KG.beginner.female[0]).toBeCloseTo(0.35, 5);
  });

  it("recomp potential buckets (Part 3.7.2)", () => {
    expect(recompPotential("male", 28)).toBe("excellent");
    expect(recompPotential("male", 20)).toBe("good");
    expect(recompPotential("male", 12)).toBe("limited");
    expect(recompPotential("female", 38)).toBe("excellent");
    expect(recompPotential("female", 28)).toBe("good");
    expect(recompPotential("female", 22)).toBe("limited");
  });

  it("recomp calorie target caps deficit at 500 kcal (Part 3.7.4 — Murphy & Koehler)", () => {
    // TDEE 3000, excellent potential → 15% deficit = 450 kcal (< 500 cap)
    const result = recompCalorieTarget(3000, "excellent");
    expect(result).not.toBeNull();
    expect(result!.deficit_kcal).toBeLessThanOrEqual(500);
  });

  it("recomp returns null for limited potential", () => {
    expect(recompCalorieTarget(3000, "limited")).toBeNull();
  });
});

// ===========================================================================
// Part 3.8 — Reverse dieting
// ===========================================================================

describe("Part 3.8 / Reverse dieting", () => {
  it("3-tier protocol matches Part 3.8.1", () => {
    expect(REVERSE_DIET_TIERS.conservative.weekly_increment_kcal).toBe(50);
    expect(REVERSE_DIET_TIERS.moderate.weekly_increment_kcal).toBe(100);
    expect(REVERSE_DIET_TIERS.aggressive.weekly_increment_kcal).toBe(150);
  });

  it("weight-gain guardrail = 0.5% BW/week (Part 3.8.3)", () => {
    expect(REVERSE_DIET_GUARDRAIL_PCT).toBe(0.005);
  });

  it("schedule math: 500 kcal gap at +100/wk → 5 weeks", () => {
    const schedule = reverseDietSchedule({
      current_calories: 2000,
      maintenance_calories: 2500,
      tier: "moderate",
    });
    expect(schedule.weeks_to_maintenance).toBe(5);
    expect(schedule.weekly_calories[0]).toBe(2000);
    expect(schedule.weekly_calories[5]).toBe(2500);
  });
});

// ===========================================================================
// Part 3.9 — Macro recipe
// ===========================================================================

describe("Part 3.9 / Macro recipe", () => {
  it("cutting protein = 1.0-1.2 g/lb (midpoint 1.1) for non-vegan", () => {
    const result = proteinRateGPerLb({
      phase: "cut",
      diet_type: "standard",
      age_years: 30,
      is_obese: false,
      is_pregnant_or_lactating: false,
    });
    expect(result.rate_g_per_lb).toBeGreaterThanOrEqual(1.0);
    expect(result.rate_g_per_lb).toBeLessThanOrEqual(1.2);
    expect(result.basis).toBe("bodyweight");
  });

  it("vegan cutting protein = 1.2 g/lb (high end)", () => {
    const result = proteinRateGPerLb({
      phase: "cut",
      diet_type: "vegan",
      age_years: 30,
      is_obese: false,
      is_pregnant_or_lactating: false,
    });
    expect(result.rate_g_per_lb).toBe(1.2);
  });

  it("obese user uses cm-height basis (avoid overshooting on total BW)", () => {
    const result = proteinRateGPerLb({
      phase: "cut",
      diet_type: "standard",
      age_years: 30,
      is_obese: true,
      is_pregnant_or_lactating: false,
    });
    expect(result.basis).toBe("cm_height");
  });

  it("age >65 floor: 0.55 g/lb minimum", () => {
    const result = proteinRateGPerLb({
      phase: "maintain",
      diet_type: "standard",
      age_years: 70,
      is_obese: false,
      is_pregnant_or_lactating: false,
    });
    expect(result.rate_g_per_lb).toBeGreaterThanOrEqual(0.55);
  });

  it("pregnancy/lactation adds +25 g/day absolute (Part 3.9 Step 2)", () => {
    const g = proteinGrams({
      rate_g_per_lb: 1.0,
      basis: "bodyweight",
      weight_kg: 60,
      age_years: 30,
      is_pregnant_or_lactating: true,
    });
    const expected = 60 * 2.2046226218 * 1.0 + 25;
    expect(g).toBeCloseTo(expected, 1);
  });

  it("fat floor = max(0.5 g/kg, 40 g/day) (Part 3.9 Step 3)", () => {
    const result = fatGrams({
      target_calories_kcal: 1500,
      phase: "cut",
      weight_kg: 50,
    });
    // 0.5 g/kg × 50 = 25 g → use 40 floor
    expect(result.floor_g).toBe(40);
  });

  it("roundMacro5 rounds to nearest 5 g", () => {
    expect(roundMacro5(137)).toBe(135);
    expect(roundMacro5(138)).toBe(140);
    expect(roundMacro5(140)).toBe(140);
    expect(roundMacro5(2.5)).toBe(5);
    expect(roundMacro5(0)).toBe(0);
  });

  it("computeMacros produces P + F + C ≈ target calories", () => {
    const result = computeMacros({
      target_calories_kcal: 2500,
      weight_kg: 80,
      height_cm: 178,
      age_years: 30,
      sex: "male",
      phase: "maintain",
      diet_type: "standard",
      is_obese: false,
      is_pregnant_or_lactating: false,
    });
    const total = result.protein_g * 4 + result.fat_g * 9 + result.carb_g * 4;
    // Allow ±5% rounding tolerance from the 5g rounding.
    expect(total).toBeGreaterThan(2500 * 0.95);
    expect(total).toBeLessThan(2500 * 1.05);
  });

  it("macro % calories sums to ~1.0", () => {
    const result = computeMacros({
      target_calories_kcal: 2500,
      weight_kg: 80,
      height_cm: 178,
      age_years: 30,
      sex: "male",
      phase: "cut",
      diet_type: "standard",
      is_obese: false,
      is_pregnant_or_lactating: false,
    });
    const sum =
      result.macro_pct_calories.protein +
      result.macro_pct_calories.fat +
      result.macro_pct_calories.carbs;
    expect(sum).toBeCloseTo(1.0, 2);
  });
});

// ===========================================================================
// Part 3.11 — Micronutrients
// ===========================================================================

describe("Part 3.11 / Micronutrients", () => {
  it("fiber = 14 g per 1000 kcal (Part 3.11.1)", () => {
    expect(fiberTargetG(2000)).toBe(28);
    expect(fiberTargetG(3000)).toBe(42);
    expect(fiberTargetG(1500)).toBe(21);
  });

  it("fruit/veg cups scale with calories (Part 3.11.2)", () => {
    expect(fruitVegCups(1800)).toEqual({ fruit: 2, veg: 2 });
    expect(fruitVegCups(2500)).toEqual({ fruit: 3, veg: 3 });
    expect(fruitVegCups(3500)).toEqual({ fruit: 4, veg: 4 });
  });

  it("supplement stack includes base 3 (Part 3.11.5)", () => {
    const stack = supplementStack({ diet_type: "standard", sex: "male" });
    expect(stack.length).toBe(3);
    expect(stack.find((s) => s.name.includes("Creatine"))).toBeDefined();
    expect(stack.find((s) => s.name.includes("Vitamin D"))).toBeDefined();
    expect(stack.find((s) => s.name.includes("Omega-3"))).toBeDefined();
  });

  it("vegan stack adds B12, iron, zinc, calcium (Part 3.14.2)", () => {
    const stack = supplementStack({ diet_type: "vegan", sex: "female" });
    expect(stack.find((s) => s.name.includes("B12"))).toBeDefined();
    expect(stack.find((s) => s.name.includes("Iron"))).toBeDefined();
    expect(stack.find((s) => s.name.includes("Iron"))!.daily_dose).toContain("33"); // women dose
    expect(stack.find((s) => s.name.includes("Zinc"))).toBeDefined();
    expect(stack.find((s) => s.name.includes("Calcium"))).toBeDefined();
  });
});

// ===========================================================================
// Part 3.13 — Keto decisioning
// ===========================================================================

describe("Part 3.13 / Keto decisioning", () => {
  it("PCOS → higher-fat trial", () => {
    const result = ketoDecision({
      has_pcos: true,
      has_oligomenorrhea: false,
      family_history_diabetes: false,
      is_advanced_age: false,
      is_sedentary_with_obesity: false,
      is_resistance_trained: false,
    });
    expect(result.recommendation).toBe("higher_fat_trial");
  });

  it("sedentary + obese without IR flag → default high-carb", () => {
    const result = ketoDecision({
      has_pcos: false,
      has_oligomenorrhea: false,
      family_history_diabetes: false,
      is_advanced_age: false,
      is_sedentary_with_obesity: true,
      is_resistance_trained: false,
    });
    expect(result.recommendation).toBe("default_high_carb");
  });

  it("resistance-trained → default high-carb (pros not worth cons)", () => {
    const result = ketoDecision({
      has_pcos: false,
      has_oligomenorrhea: false,
      family_history_diabetes: false,
      is_advanced_age: false,
      is_sedentary_with_obesity: false,
      is_resistance_trained: true,
    });
    expect(result.recommendation).toBe("default_high_carb");
  });
});

// ===========================================================================
// Part 3.16 — buildNutritionPlan
// ===========================================================================

describe("Part 3.16 / buildNutritionPlan", () => {
  it("produces a complete NutritionPlan for a cut", () => {
    const user = makeUser({
      body_fat_pct: 18,
      body_fat_method: "manual",
      primary_goal: "cut",
    });
    const assessment = runAssessment(user);
    const plan = buildNutritionPlan({ user, assessment });

    expect(plan.phase).toBe("cut");
    expect(plan.target_calories_kcal).toBeLessThan(assessment.tdee_kcal);
    expect(plan.target_calories_kcal).toBeGreaterThanOrEqual(CALORIE_FLOOR.male);
    expect(plan.protein_g).toBeGreaterThan(0);
    expect(plan.fat_g).toBeGreaterThanOrEqual(plan.fat_floor_g);
    expect(plan.carb_g).toBeGreaterThanOrEqual(0);
    expect(plan.fiber_target_g).toBeGreaterThan(0);
    expect(plan.supplements.length).toBeGreaterThanOrEqual(3);
    expect(plan.macro_tolerance_pct).toBe(0.1); // not sub-10% BF
  });

  it("produces a bulk plan with surplus", () => {
    const user = makeUser({
      body_fat_pct: 12,
      body_fat_method: "manual",
      primary_goal: "bulk",
    });
    const assessment = runAssessment(user);
    const plan = buildNutritionPlan({ user, assessment });

    expect(plan.phase).toBe("bulk");
    expect(plan.target_calories_kcal).toBeGreaterThan(assessment.tdee_kcal);
    expect(plan.target_rate_lb_per_period).toBeGreaterThan(0);
  });

  it("sub-10% BF user gets ±5% tolerance (Part 3.9)", () => {
    const user = makeUser({
      body_fat_pct: 8,
      body_fat_method: "manual",
      primary_goal: "maintain",
      sex: "male",
    });
    const assessment = runAssessment(user);
    const plan = buildNutritionPlan({ user, assessment });
    expect(plan.macro_tolerance_pct).toBe(0.05);
  });

  it("next adjustment eligible date is +28 days for cut (Part 3.5.5)", () => {
    const result = nextAdjustmentEligibleDate("cut", "2025-01-01", "male");
    expect(result).toBe("2025-01-29");
  });

  it("next adjustment eligible date is +49 days for bulk (Part 3.6.4)", () => {
    const result = nextAdjustmentEligibleDate("bulk", "2025-01-01", "male");
    expect(result).toBe("2025-02-19");
  });
});

// ===========================================================================
// Part 3.5.6 / 3.6.8 — applyMacroAdjustment
// ===========================================================================

describe("applyMacroAdjustment", () => {
  it("cut reduction splits 1.5:1 carbs:fats (midpoint of 1:1 to 2:1)", () => {
    const user = makeUser({ body_fat_pct: 20, primary_goal: "cut" });
    const assessment = runAssessment(user);
    const plan = buildNutritionPlan({ user, assessment });
    const original_carbs = plan.carb_g;
    const original_fat = plan.fat_g;
    const adjusted = applyMacroAdjustment({
      plan,
      delta_kcal: -250,
      reason: "Stalled cut",
    });
    // Should reduce carbs more than fats (1.5:1 split).
    expect(adjusted.carb_g).toBeLessThan(original_carbs);
    expect(adjusted.fat_g).toBeLessThanOrEqual(original_fat);
    expect(adjusted.target_calories_kcal).toBeLessThan(plan.target_calories_kcal);
  });

  it("never goes below calorie floor", () => {
    const user = makeUser({ sex: "female", weight_kg: 50, height_cm: 160, body_fat_pct: 25, primary_goal: "cut" });
    const assessment = runAssessment(user);
    const plan = buildNutritionPlan({ user, assessment });
    const adjusted = applyMacroAdjustment({
      plan,
      delta_kcal: -2000,
      reason: "Aggressive reduction",
    });
    expect(adjusted.target_calories_kcal).toBeGreaterThanOrEqual(1200);
  });

  it("records adjustment in history", () => {
    const user = makeUser({ body_fat_pct: 20, primary_goal: "cut" });
    const assessment = runAssessment(user);
    const plan = buildNutritionPlan({ user, assessment });
    const adjusted = applyMacroAdjustment({
      plan,
      delta_kcal: -100,
      reason: "Stalled",
    });
    expect(adjusted.adjustment_history).toHaveLength(1);
    expect(adjusted.adjustment_history[0].reason).toBe("Stalled");
    expect(adjusted.last_adjustment_date).toBeDefined();
  });
});

// ===========================================================================
// recommendAdjustment
// ===========================================================================

describe("recommendAdjustment", () => {
  it("returns not-eligible before the wait window", () => {
    const user = makeUser({ body_fat_pct: 20, primary_goal: "cut" });
    const assessment = runAssessment(user);
    const plan = buildNutritionPlan({ user, assessment });
    const result = recommendAdjustment({ plan, daily_weights: [], today_date: "2025-01-02" });
    expect(result?.eligible).toBe(false);
  });

  it("returns not-eligible with insufficient weight data", () => {
    const user = makeUser({ body_fat_pct: 20, primary_goal: "cut" });
    const assessment = runAssessment(user);
    const plan = buildNutritionPlan({ user, assessment });
    // Force eligibility by setting next_eligible to a past date.
    const eligible_plan = { ...plan, next_adjustment_eligible_date: "2025-01-01" };
    const result = recommendAdjustment({
      plan: eligible_plan,
      daily_weights: [],
      today_date: "2025-03-01",
    });
    expect(result?.eligible).toBe(false);
  });
});
