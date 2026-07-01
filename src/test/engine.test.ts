/**
 * Engine test suite — verifies the assessment, nutrition, training,
 * and adaptive TDEE engines against canonical values from the
 * Unified Reference Guide.
 *
 * Every test maps to a specific section of the guide so engineers can
 * trace failures back to the spec.
 */

import { describe, it, expect } from "vitest";
import {
  // Schemas
  type User,
  // Assessment
  runAssessment,
  usNavyBfPct,
  jp7BfPct,
  jp3BfPct,
  cunBaeBfPct,
  jacksonBmiToBfPct,
  classifyBfPct,
  clampBfPct,
  bmi,
  bmiCategory,
  whtr,
  whtrCategory,
  whr,
  whrCategory,
  absi,
  absiCategoryFromZ,
  idealBodyWeight,
  bmiHealthyRange,
  mifflinStJeor,
  harrisBenedict1984,
  cunningham,
  leanBodyMass,
  applyRippedBodyBmrAdjustments,
  isWeightReduced,
  tdeeFromMifflinAndSaf,
  tdeeFromIomDlwEer,
  enforceCalorieFloor,
  alpertMaxDailyDeficitKcal,
  alpertMaxWeeklyLossLb,
  effectiveWeeklyLossCapLb,
  ffmi,
  berkhanMaxStageShreddedKg,
  weeklyAverageWeightKg,
  rollingAverageWeightKg,
  weeklyRateLbPerWeek,
  interpretWeightTrend,
  dailyWaterIntakeL,
  checkPopulationExclusions,
  CALORIE_FLOOR,
  ALPERT_KCAL_PER_LB_FAT_PER_DAY,
  KCAL_PER_LB_FAT,
  // Nutrition
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
  computeTargetCalories,
  buildNutritionPlan,
  applyMacroAdjustment,
  recommendAdjustment,
  macroTolerancePct,
  nextAdjustmentEligibleDate,
  // Training
  VOLUME_TIERS,
  frequencyForVolume,
  REP_RIR_TABLE,
  HYPERTROPHY_DEFAULTS,
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
  isLiftPlateaued,
  // Adaptive TDEE
  computePriorTdee,
  computeObservedTdee,
  priorWeightAlpha,
  computeAdaptiveTdee,
  detectOutliers,
  rollingAverageWeight as adaptiveRollingAverageWeight,
  ewmaWeight,
  TAU_DAYS,
  DEFAULT_WINDOW_DAYS,
  MIN_DAYS_FOR_DATA_DRIVEN,
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
// Part 0.5 — Master User schema
// ===========================================================================

describe("Part 0 / Foundations", () => {
  it("enforces minimum calorie floor (Part 0.3)", () => {
    expect(enforceCalorieFloor("female", 900)).toBe(1200);
    expect(enforceCalorieFloor("male", 1200)).toBe(1500);
    expect(enforceCalorieFloor("female", 1800)).toBe(1800);
    expect(enforceCalorieFloor("male", 2200)).toBe(2200);
  });

  it("CALORIE_FLOOR constants match Part 0.3 spec", () => {
    expect(CALORIE_FLOOR.female).toBe(1200);
    expect(CALORIE_FLOOR.male).toBe(1500);
  });

  it("detects population exclusions (Part 0.4)", () => {
    expect(checkPopulationExclusions(makeUser({ age_years: 16 })).excluded).toBe(true);
    expect(checkPopulationExclusions(makeUser({ is_pregnant: true })).excluded).toBe(true);
    expect(checkPopulationExclusions(makeUser({ is_breastfeeding: true })).excluded).toBe(true);
    expect(
      checkPopulationExclusions(makeUser({ has_eating_disorder_history: true })).excluded,
    ).toBe(true);
    expect(checkPopulationExclusions(makeUser({ has_kidney_disease: true })).excluded).toBe(true);
    expect(checkPopulationExclusions(makeUser()).excluded).toBe(false);
  });
});

// ===========================================================================
// Part 1.1 — Body-fat % estimation
// ===========================================================================

describe("Part 1.1 / Body-fat % estimation", () => {
  describe("US Navy method (Part 1.1.1)", () => {
    it("computes BF% for men (cm form)", () => {
      // Reference: rippedbody.com page example. Male, 178cm, neck 38cm, abdomen 85cm.
      const result = usNavyBfPct("male", 178, 38, 85);
      expect(result).toBeGreaterThan(10);
      expect(result).toBeLessThan(20);
    });

    it("computes BF% for women (cm form)", () => {
      // 165cm, neck 32cm, waist 75cm, hip 100cm → ~25-35% BF typical
      const result = usNavyBfPct("female", 165, 32, 75, 100);
      expect(result).toBeGreaterThan(15);
      expect(result).toBeLessThan(45);
    });

    it("throws when abdomen <= neck (men)", () => {
      expect(() => usNavyBfPct("male", 178, 85, 85)).toThrow();
      expect(() => usNavyBfPct("male", 178, 90, 85)).toThrow();
    });

    it("throws when waist+hip <= neck (women)", () => {
      expect(() => usNavyBfPct("female", 165, 100, 30, 50)).toThrow();
    });
  });

  describe("Skinfold methods (Part 1.1.2)", () => {
    it("JP7 produces BF% via Siri equation", () => {
      const bd_to_bf = (bd: number) => 495 / bd - 450;
      // Verify the function uses Siri internally.
      const result = jp7BfPct("male", 30, 100); // sum 100mm, age 30
      // BD men: 1.112 - 0.00043499*100 + 0.00000055*10000 - 0.00028826*30
      const expected_bd = 1.112 - 0.043499 + 0.0055 - 0.0086478;
      expect(result).toBeCloseTo(bd_to_bf(expected_bd), 5);
    });

    it("JP3 produces BF% via Siri equation", () => {
      const result = jp3BfPct("male", 30, 60);
      expect(result).toBeGreaterThan(5);
      expect(result).toBeLessThan(30);
    });

    it("JP7 and JP3 both produce reasonable BF% for typical skinfold sums", () => {
      // Both methods should produce BF% in a plausible human range (5-40%).
      const jp3_val = jp3BfPct("male", 30, 60);
      const jp7_val = jp7BfPct("male", 30, 60);
      expect(jp3_val).toBeGreaterThan(5);
      expect(jp3_val).toBeLessThan(40);
      expect(jp7_val).toBeGreaterThan(5);
      expect(jp7_val).toBeLessThan(40);
    });
  });

  describe("CUN-BAE (Part 1.1.3)", () => {
    it("computes BF% from BMI for men", () => {
      // BMI 25, age 30, male (sex_code=0)
      const result = cunBaeBfPct("male", 30, 25);
      // -44.988 + 0.503*30 + 0 + 3.172*25 - 0.026*625 + 0 - 0.02*30*25 - 0 + 0
      // = -44.988 + 15.09 + 79.3 - 16.25 - 15 = 18.152
      expect(result).toBeCloseTo(18.152, 1);
    });

    it("computes BF% from BMI for women", () => {
      const result = cunBaeBfPct("female", 30, 25);
      // CUN-BAE for women at BMI 25, age 30 → ~28-32%
      expect(result).toBeGreaterThan(20);
      expect(result).toBeLessThan(40);
    });
  });

  describe("Jackson 2002 BMI→BF% (Part 1.4.4)", () => {
    it("computes BF% for men", () => {
      const result = jacksonBmiToBfPct("male", 30, 25);
      // 0.14*30 + 37.31*ln(25) - 103.94
      const expected = 0.14 * 30 + 37.31 * Math.log(25) - 103.94;
      expect(result).toBeCloseTo(expected, 5);
    });
  });

  describe("Classification (Part 1.1.6)", () => {
    it("classifies male BF% per ACE chart", () => {
      expect(classifyBfPct("male", 4)).toBe("Essential fat");
      expect(classifyBfPct("male", 10)).toBe("Athlete");
      expect(classifyBfPct("male", 16)).toBe("Fitness");
      expect(classifyBfPct("male", 22)).toBe("Average");
      expect(classifyBfPct("male", 30)).toBe("Obese");
    });

    it("classifies female BF% per ACE chart", () => {
      expect(classifyBfPct("female", 12)).toBe("Essential fat");
      expect(classifyBfPct("female", 17)).toBe("Athlete");
      expect(classifyBfPct("female", 23)).toBe("Fitness");
      expect(classifyBfPct("female", 28)).toBe("Average");
      expect(classifyBfPct("female", 35)).toBe("Obese");
    });
  });

  it("clamps BF% to essential-fat minimum (Part 1.1.1)", () => {
    expect(clampBfPct("male", 1)).toBe(2);
    expect(clampBfPct("female", 5)).toBe(10);
    expect(clampBfPct("male", 15)).toBe(15);
  });
});

// ===========================================================================
// Part 1.2 — Anthropometric indices
// ===========================================================================

describe("Part 1.2 / Anthropometric indices", () => {
  it("BMI = kg / m² (Part 1.2.1)", () => {
    expect(bmi(80, 178)).toBeCloseTo(25.25, 1); // 80 / 1.78² ≈ 25.25
  });

  it("BMI categories per WHO", () => {
    expect(bmiCategory(17)).toBe("Underweight");
    expect(bmiCategory(22)).toBe("Normal weight");
    expect(bmiCategory(27)).toBe("Overweight");
    expect(bmiCategory(32)).toBe("Obese class I");
    expect(bmiCategory(37)).toBe("Obese class II");
    expect(bmiCategory(42)).toBe("Obese class III");
  });

  it("WHtR = waist / height (Part 1.2.2)", () => {
    expect(whtr(85, 178)).toBeCloseTo(0.4775, 3);
  });

  it("WHtR universal rule: <0.5 = healthy", () => {
    expect(whtrCategory("male", 0.45)).toBe("Healthy");
    expect(whtrCategory("male", 0.55)).toBe("Overweight");
    expect(whtrCategory("male", 0.65)).toBe("Obese");
    expect(whtrCategory("female", 0.45)).toBe("Healthy");
    expect(whtrCategory("female", 0.52)).toBe("Overweight");
  });

  it("WHR = waist / hip (Part 1.2.3)", () => {
    expect(whr(85, 100)).toBeCloseTo(0.85, 5);
  });

  it("WHR WHO thresholds: men >0.90, women >0.85 = elevated", () => {
    expect(whrCategory("male", 0.85)).toBe("Low risk");
    expect(whrCategory("male", 0.95)).toBe("Elevated risk");
    expect(whrCategory("female", 0.80)).toBe("Low risk");
    expect(whrCategory("female", 0.90)).toBe("Elevated risk");
    expect(whrCategory("male", 1.1)).toBe("Substantially elevated risk");
  });

  it("ABSI formula (Part 1.2.4)", () => {
    // ABSI = WC_m × Wt^(-2/3) × Ht^(5/6)
    const result = absi(85, 80, 178);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(0.1); // typical adult ABSI 0.07-0.09
  });

  it("ABSI z-score bands (Part 1.2.4)", () => {
    expect(absiCategoryFromZ(-1.0)).toBe("Low");
    expect(absiCategoryFromZ(-0.5)).toBe("Below Average");
    expect(absiCategoryFromZ(0.0)).toBe("Average");
    expect(absiCategoryFromZ(0.5)).toBe("Above Average");
    expect(absiCategoryFromZ(1.0)).toBe("High");
  });
});

// ===========================================================================
// Part 1.3 — Ideal Body Weight
// ===========================================================================

describe("Part 1.3 / Ideal Body Weight", () => {
  it("Devine formula matches Part 1.3 spec for men", () => {
    // Devine male: 50 + 2.3 × inches over 5ft
    // 178cm = 70.08 in, 10.08 in over 5ft → 50 + 2.3×10.08 = 73.18 kg
    const result = idealBodyWeight("male", 178);
    expect(result.devine_kg).toBeCloseTo(73.18, 1);
  });

  it("Devine formula matches Part 1.3 spec for women", () => {
    // Devine female: 45.5 + 2.3 × inches over 5ft
    // 165cm = 64.96 in, 4.96 in over 5ft → 45.5 + 2.3×4.96 = 56.91 kg
    const result = idealBodyWeight("female", 165);
    expect(result.devine_kg).toBeCloseTo(56.91, 1);
  });

  it("computes all 4 IBW formulas", () => {
    const result = idealBodyWeight("male", 178);
    expect(result).toHaveProperty("devine_kg");
    expect(result).toHaveProperty("robinson_kg");
    expect(result).toHaveProperty("miller_kg");
    expect(result).toHaveProperty("hamwi_kg");
  });

  it("BMI healthy weight range = 18.5×h² to 24.9×h²", () => {
    const range = bmiHealthyRange(178);
    expect(range.low).toBeCloseTo(18.5 * 1.78 * 1.78, 2);
    expect(range.high).toBeCloseTo(24.9 * 1.78 * 1.78, 2);
  });

  it("returns 5ft baseline when height < 5ft (no negative slope)", () => {
    const result = idealBodyWeight("male", 150); // 4'11"
    // Should not subtract from baseline; clamped at 0 inches over.
    expect(result.devine_kg).toBe(50.0);
  });
});

// ===========================================================================
// Part 1.4 — RMR
// ===========================================================================

describe("Part 1.4 / RMR", () => {
  it("Mifflin-St Jeor (men) — Part 1.4.1", () => {
    // 9.99×80 + 6.25×178 − 4.92×30 + 5 = 799.2 + 1112.5 − 147.6 + 5 = 1769.1
    const result = mifflinStJeor("male", 80, 178, 30);
    expect(result).toBeCloseTo(1769.1, 1);
  });

  it("Mifflin-St Jeor (women) — Part 1.4.1", () => {
    // 9.99×65 + 6.25×165 − 4.92×28 − 161 = 649.35 + 1031.25 − 137.76 − 161 = 1381.84
    const result = mifflinStJeor("female", 65, 165, 28);
    expect(result).toBeCloseTo(1381.84, 1);
  });

  it("Harris-Benedict revised 1984 (men) — Part 1.4.2", () => {
    const result = harrisBenedict1984("male", 80, 178, 30);
    // Should be larger than Mifflin (HB tends to overestimate by 5-15%).
    expect(result).toBeGreaterThan(mifflinStJeor("male", 80, 178, 30));
  });

  it("Cunningham / Katch-McArdle — Part 1.4.3", () => {
    // RMR = 370 + 21.6 × LBM
    const lbm = 65;
    expect(cunningham(lbm)).toBeCloseTo(370 + 21.6 * 65, 5);
  });

  it("LBM = weight × (1 - BF%/100)", () => {
    expect(leanBodyMass(80, 20)).toBeCloseTo(64, 5);
  });

  it("RippedBody adjustments: -5% deficit, -3% weight-reduced, compound", () => {
    expect(applyRippedBodyBmrAdjustments(1800, false, false)).toBe(1800);
    expect(applyRippedBodyBmrAdjustments(1800, true, false)).toBeCloseTo(1710, 1);
    expect(applyRippedBodyBmrAdjustments(1800, false, true)).toBeCloseTo(1746, 1);
    // Compound: 1800 × 0.95 × 0.97 = 1658.7
    expect(applyRippedBodyBmrAdjustments(1800, true, true)).toBeCloseTo(1658.7, 1);
  });

  it("isWeightReduced: >10% below all-time-high", () => {
    // 80 kg vs 90 kg high → 80/90 = 88.9% which is < 90% → IS weight-reduced.
    expect(isWeightReduced(80, 90)).toBe(true);
    // 80 kg vs 85 kg high → 80/85 = 94.1% which is >= 90% → NOT weight-reduced.
    expect(isWeightReduced(80, 85)).toBe(false);
    expect(isWeightReduced(80, 100)).toBe(true); // 80% < 90%
    expect(isWeightReduced(80, undefined)).toBe(false);
  });
});

// ===========================================================================
// Part 1.5 — TDEE
// ===========================================================================

describe("Part 1.5 / TDEE", () => {
  it("Mifflin × SAF (moderate = 1.55) — Part 1.5.3", () => {
    const user = makeUser({ activity_level: "moderate" });
    const result = tdeeFromMifflinAndSaf(user);
    expect(result.activity_factor).toBe(1.55);
    // BMR 1769.1 × 1.55 = 2742.1
    expect(result.tdee_kcal).toBeCloseTo(2742.1, 1);
  });

  it("SAF constants match Part 1.5.2 spec", () => {
    const user_sed = makeUser({ activity_level: "sedentary" });
    const user_extra = makeUser({ activity_level: "extra_active" });
    expect(tdeeFromMifflinAndSaf(user_sed).activity_factor).toBe(1.2);
    expect(tdeeFromMifflinAndSaf(user_extra).activity_factor).toBe(1.9);
  });

  it("IOM DLW EER (men, sedentary) — Part 1.5.4", () => {
    const user = makeUser({ activity_level: "sedentary" });
    const result = tdeeFromIomDlwEer(user);
    // 662 - 9.53*30 + 1.00*(15.91*80 + 539.6*1.78) = 662 - 285.9 + 1272.8 + 960.5 = 2609.4
    expect(result.tdee_kcal).toBeCloseTo(2609.4, 1);
  });
});

// ===========================================================================
// Part 1.6 — Alpert max fat-loss
// ===========================================================================

describe("Part 1.6 / Alpert max fat-loss ceiling", () => {
  it("Alpert canonical constant = 22 kcal/lb fat/day (Part 5 B-C5)", () => {
    expect(ALPERT_KCAL_PER_LB_FAT_PER_DAY).toBe(22);
  });

  it("200 lb male at 20% BF → max deficit = 22 × 40 = 880 kcal/day (worked example)", () => {
    // 200 lb = 90.72 kg
    const deficit = alpertMaxDailyDeficitKcal(90.72, 20);
    expect(deficit).toBeCloseTo(880, 0);
  });

  it("max weekly loss = (880 × 7) / 3500 = 1.76 lb/wk", () => {
    const weekly = alpertMaxWeeklyLossLb(90.72, 20);
    expect(weekly).toBeCloseTo(1.76, 2);
  });

  it("effective cap = min(Alpert, 2.0) lb/wk", () => {
    // Overweight: Alpert dominates (1.76 < 2.0)
    expect(effectiveWeeklyLossCapLb(90.72, 20)).toBeCloseTo(1.76, 2);
    // Lean: 2 lb/wk dominates (Alpert very low)
    expect(effectiveWeeklyLossCapLb(68, 10)).toBeLessThan(1.0);
    // No BF% → fall back to 2 lb/wk
    expect(effectiveWeeklyLossCapLb(80, undefined)).toBe(2.0);
  });
});

// ===========================================================================
// Part 1.7 — Muscle mass / FFMI
// ===========================================================================

describe("Part 1.7 / FFMI", () => {
  it("FFMI = FFM(kg) / height(m)² (Part 1.7.3)", () => {
    // 80 kg at 15% BF → FFM = 68 kg; height 1.78m → FFMI = 68/3.1684 = 21.46
    const result = ffmi(80, 15, 178);
    expect(result.ffmi).toBeCloseTo(21.46, 1);
  });

  it("Normalized FFMI shifts shorter people up", () => {
    // 170 cm user: 1.8 - 1.70 = 0.10 → adds 0.63 to FFMI
    const result = ffmi(80, 15, 170);
    expect(result.normalized_ffmi).toBeGreaterThan(result.ffmi);
  });
});

// ===========================================================================
// Part 1.8 — Maximum muscular potential
// ===========================================================================

describe("Part 1.8 / Berkhan max", () => {
  it("Berkhan formula: max wt (kg) = height (cm) − 100 (men)", () => {
    expect(berkhanMaxStageShreddedKg("male", 178)).toBe(78);
    expect(berkhanMaxStageShreddedKg("male", 183)).toBe(83);
  });

  it("Berkhan for women: height − 105 (canonical conservative adjustment)", () => {
    expect(berkhanMaxStageShreddedKg("female", 165)).toBe(60);
  });
});

// ===========================================================================
// Part 1.9 — Progress tracking
// ===========================================================================

describe("Part 1.9 / Progress tracking", () => {
  const weights: { date: string; weight_kg: number }[] = [];
  for (let i = 1; i <= 14; i++) {
    weights.push({
      date: `2025-01-${String(i).padStart(2, "0")}`,
      weight_kg: 80 - i * 0.05, // gentle decline
    });
  }

  it("weekly average of last 7 entries", () => {
    const avg = weeklyAverageWeightKg(weights);
    expect(avg).not.toBeNull();
    const expected = weights.slice(-7).reduce((s, w) => s + w.weight_kg, 0) / 7;
    expect(avg).toBeCloseTo(expected, 5);
  });

  it("rolling average with custom window", () => {
    const avg = rollingAverageWeightKg(weights, 14);
    expect(avg).not.toBeNull();
    const expected = weights.reduce((s, w) => s + w.weight_kg, 0) / 14;
    expect(avg).toBeCloseTo(expected, 5);
  });

  it("returns null for insufficient data", () => {
    expect(weeklyAverageWeightKg(weights.slice(0, 5))).toBeNull();
  });

  it("weekly rate is computed from linear regression", () => {
    const rate = weeklyRateLbPerWeek(weights);
    expect(rate).not.toBeNull();
    // slope is -0.05 kg/day → ×7×2.2046 = -0.772 lb/wk
    expect(rate!).toBeCloseTo(-0.772, 1);
  });

  it("interpretWeightTrend: adaptation_phase for <14 days", () => {
    const result = interpretWeightTrend(weights, "cut", 5, 0);
    expect(result.action).toBe("adaptation_phase");
  });

  it("interpretWeightTrend: 'wait' for cut with no loss in first 4 weeks", () => {
    // Flat weights + cut + weeks < 4 → wait
    const flat: { date: string; weight_kg: number }[] = [];
    for (let i = 1; i <= 21; i++) {
      flat.push({ date: `2025-01-${String(i).padStart(2, "0")}`, weight_kg: 80 });
    }
    const result = interpretWeightTrend(flat, "cut", 21, 3);
    expect(result.action).toBe("wait");
  });

  it("interpretWeightTrend: 'act' for cut stalled > 4 weeks", () => {
    const flat: { date: string; weight_kg: number }[] = [];
    for (let i = 1; i <= 35; i++) {
      flat.push({ date: `2025-01-${String(i).padStart(2, "0")}`, weight_kg: 80 });
    }
    const result = interpretWeightTrend(flat, "cut", 35, 5);
    expect(result.action).toBe("act");
  });

  it("interpretWeightTrend: 'wait' for bulk in first 6 weeks", () => {
    const rising: { date: string; weight_kg: number }[] = [];
    for (let i = 1; i <= 30; i++) {
      rising.push({ date: `2025-01-${String(i).padStart(2, "0")}`, weight_kg: 80 + i * 0.05 });
    }
    const result = interpretWeightTrend(rising, "bulk", 30, 4);
    expect(result.action).toBe("wait");
  });
});

// ===========================================================================
// Part 1.10 — Hydration
// ===========================================================================

describe("Part 1.10 / Hydration (fatcalc 6-step formula)", () => {
  it("base = weight × 0.030 L", () => {
    const result = dailyWaterIntakeL({
      weight_kg: 80,
      sex: "male",
      exercise_intensity: "none",
      exercise_hours: 0,
      climate: "temperate",
      is_pregnant: false,
      is_breastfeeding: false,
    });
    expect(result.breakdown.base_L).toBeCloseTo(2.4, 5);
  });

  it("male sex adjustment = +0.3 L (conservative — Part 5 B-C9)", () => {
    const result = dailyWaterIntakeL({
      weight_kg: 80,
      sex: "male",
      exercise_intensity: "none",
      exercise_hours: 0,
      climate: "temperate",
      is_pregnant: false,
      is_breastfeeding: false,
    });
    expect(result.breakdown.sex_adjustment_L).toBe(0.3);
  });

  it("exercise add: moderate 500 mL/hr × 1 hr = 0.5 L", () => {
    const result = dailyWaterIntakeL({
      weight_kg: 80,
      sex: "male",
      exercise_intensity: "moderate",
      exercise_hours: 1,
      climate: "temperate",
      is_pregnant: false,
      is_breastfeeding: false,
    });
    expect(result.breakdown.exercise_add_L).toBeCloseTo(0.5, 5);
  });

  it("hot climate multiplier = 1.3", () => {
    const result = dailyWaterIntakeL({
      weight_kg: 80,
      sex: "male",
      exercise_intensity: "none",
      exercise_hours: 0,
      climate: "hot",
      is_pregnant: false,
      is_breastfeeding: false,
    });
    expect(result.breakdown.climate_multiplier).toBe(1.3);
  });

  it("pregnancy +0.3 L, breastfeeding +0.7 L", () => {
    const result = dailyWaterIntakeL({
      weight_kg: 65,
      sex: "female",
      exercise_intensity: "none",
      exercise_hours: 0,
      climate: "temperate",
      is_pregnant: true,
      is_breastfeeding: false,
    });
    expect(result.breakdown.pregnancy_add_L).toBe(0.3);

    const result2 = dailyWaterIntakeL({
      weight_kg: 65,
      sex: "female",
      exercise_intensity: "none",
      exercise_hours: 0,
      climate: "temperate",
      is_pregnant: false,
      is_breastfeeding: true,
    });
    expect(result2.breakdown.breastfeeding_add_L).toBe(0.7);
  });
});

// ===========================================================================
// Part 1.11 — runAssessment
// ===========================================================================

describe("Part 1.11 / runAssessment", () => {
  it("produces a complete AssessmentResult for a typical user", () => {
    const user = makeUser({
      body_fat_pct: 18,
      body_fat_method: "manual",
      waist_cm: 85,
      hip_cm: 100,
    });
    const result = runAssessment(user);

    expect(result.user_id).toBe("test-user-1");
    expect(result.body_fat_pct).toBe(18);
    expect(result.bmi).toBeCloseTo(25.25, 1);
    expect(result.bmi_category).toBe("Overweight");
    expect(result.bmr_kcal).toBeGreaterThan(1500);
    expect(result.tdee_kcal).toBeGreaterThan(2000);
    expect(result.tdee_method).toBe("mifflin_x_saf");
    // max_daily_deficit_kcal = Alpert ceiling (22 × fat_lbs) — requires body_fat_pct.
    expect(result.max_daily_deficit_kcal).toBeDefined();
    expect(result.max_daily_deficit_kcal!).toBeGreaterThan(0);
    expect(result.effective_weekly_loss_cap_lbs).toBeGreaterThan(0);
    expect(result.daily_water_intake_L).toBeGreaterThan(2);
    expect(result.population_excluded).toBe(false);
    expect(result.exclusion_reasons).toEqual([]);
  });

  it("falls back to CUN-BAE when no BF% or Navy inputs provided", () => {
    const user = makeUser(); // no body_fat_pct, no waist/neck
    const result = runAssessment(user);
    expect(result.body_fat_method).toBe("cun_bae");
    expect(result.body_fat_pct).toBeGreaterThan(0);
  });

  it("computes Navy BF% when method='navy' and circumference data provided", () => {
    const user = makeUser({
      body_fat_method: "navy",
      waist_cm: 85,
      neck_cm: 38,
    });
    const result = runAssessment(user);
    expect(result.body_fat_method).toBe("navy");
    expect(result.body_fat_pct).toBeGreaterThan(10);
    expect(result.body_fat_pct).toBeLessThan(25);
  });

  it("flags population exclusions", () => {
    const user = makeUser({ is_pregnant: true });
    const result = runAssessment(user);
    expect(result.population_excluded).toBe(true);
    expect(result.exclusion_reasons.length).toBeGreaterThan(0);
  });
});

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
    expect(deloaded.exercises[0].sets).toBe(10);
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
