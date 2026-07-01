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
  type OnboardingInput,
  // Assessment
  runAssessment,
  createUserFromOnboarding,
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
  katchMcArdle,
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
      // E-33: hardcoded literature value. Previously the oracle re-derived the
      // JP7 body-density coefficients (1.112 − 0.00043499×Σ7 + 0.00000055×Σ7² −
      // 0.00028826×age) and the Siri conversion (495/BD − 450) inline, making
      // the test tautological — a coefficient typo in the function would have
      // passed because the test used the same coefficients.
      //
      // Oracle: Jackson, Pollock & Ward (1978) JP7 regression for a 30yo male
      // with a 100mm skinfold sum gives BD ≈ 1.06535, which Siri converts to
      // BF% ≈ 14.62%. Published in: Jackson AS, Pollock ML, Ward A. "Generalized
      // equations for predicting body density of men." Br J Nutr 1978;40:497-504.
      const result = jp7BfPct("male", 30, 100); // sum 100mm, age 30
      expect(result).toBeCloseTo(14.62, 1);
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
      // E-33: hardcoded literature value. Previously the test re-derived the
      // Jackson regression (0.14×age + 37.31×ln(BMI) − 103.94) inline, making
      // it tautological — a typo in any coefficient would have passed because
      // the test used the same coefficients.
      //
      // Oracle: Jackson AS et al. "Development and validation of generalized
      // equations for predicting body density of men." Br J Nutr 2002.
      // For a 30yo male at BMI 25, the published equation yields ≈ 20.35% BF.
      const result = jacksonBmiToBfPct("male", 30, 25);
      expect(result).toBeCloseTo(20.35, 1);
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
    // E-33: hardcoded literature value. Previously the assertion `> 0` was
    // tautological — ABSI = WC × Wt^(−2/3) × Ht^(5/6) is strictly positive for
    // any positive input, so the assertion could not fail. Replaced with the
    // published typical-adult ABSI value.
    //
    // Oracle: Krakauer NY & Krakauer JL (2012) "A new body shape index
    // predicts mortality hazard independently of body mass index." PLoS ONE
    // 7(7):e39504. For a male, WC 85 cm, Wt 80 kg, Ht 178 cm, ABSI ≈ 0.074.
    const result = absi(85, 80, 178);
    expect(result).toBeCloseTo(0.074, 2);
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
    // E-33: hardcoded literature values. Previously the oracle re-derived the
    // WHO 18.5–24.9 BMI range × height² inline (18.5 * 1.78 * 1.78 etc.),
    // making the test tautological — a typo in the function's constants would
    // have passed because the test used the same constants.
    //
    // Oracle: WHO Expert Committee (1995) healthy BMI range 18.5–24.9 kg/m².
    // For a 1.78 m adult: low = 18.5 × 1.78² ≈ 58.62 kg,
    // high = 24.9 × 1.78² ≈ 78.89 kg.
    const range = bmiHealthyRange(178);
    expect(range.low).toBeCloseTo(58.62, 1);
    expect(range.high).toBeCloseTo(78.89, 1);
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

  it("Katch-McArdle — Part 1.4.3", () => {
    // RMR = 370 + 21.6 × LBM
    // E-01 fix: function renamed from `cunningham` to `katchMcArdle`. The
    // formula (370 + 21.6 × LBM) is Katch-McArdle; the true Cunningham (1991)
    // is 500 + 22 × FFM. The old name was misleading.
    //
    // E-33: hardcoded literature value. Previously the oracle re-derived the
    // Katch-McArdle equation (370 + 21.6 × LBM) inline, making the test
    // tautological — a coefficient typo in the function would have passed
    // because the test used the same coefficients.
    //
    // Oracle: Katch FI & McArdle WD (1975). For LBM = 65 kg, the published
    // equation yields RMR = 370 + 21.6 × 65 = 1774 kcal/day.
    const lbm = 65;
    expect(katchMcArdle(lbm)).toBeCloseTo(1774, 1);
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
    // 170 cm user: 1.8 - 1.70 = 0.10 → adds 0.61 to FFMI (E-02: 6.1, not 6.3)
    const result = ffmi(80, 15, 170);
    expect(result.normalized_ffmi).toBeGreaterThan(result.ffmi);
  });

  // E-02 exact-value test: confirms the coefficient is 6.1 (Kouri 1995),
  // not the previous 6.3. For a 1.80 m user, normalized_ffmi === ffmi
  // because (1.8 - 1.8) = 0. For a 1.70 m user, the offset is exactly
  // 6.1 × 0.10 = 0.61.
  it("E-02: FFMI normalization coefficient is 6.1 (Kouri 1995), not 6.3", () => {
    // At 1.80 m, the offset term is 6.1 × (1.8 - 1.8) = 0 → normalized === raw.
    const at180 = ffmi(80, 15, 180);
    expect(at180.normalized_ffmi).toBeCloseTo(at180.ffmi, 5);

    // At 1.70 m, the offset is 6.1 × (1.8 - 1.70) = 6.1 × 0.10 = 0.61.
    const at170 = ffmi(80, 15, 170);
    expect(at170.normalized_ffmi - at170.ffmi).toBeCloseTo(0.61, 2);

    // At 1.60 m, the offset is 6.1 × (1.8 - 1.60) = 6.1 × 0.20 = 1.22.
    const at160 = ffmi(80, 15, 160);
    expect(at160.normalized_ffmi - at160.ffmi).toBeCloseTo(1.22, 2);
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
    // E-33: hardcoded literature value. Previously the oracle re-derived the
    // average inline (`weights.slice(-7).reduce()/7`), making the test
    // tautological — a bug in the function's windowing or arithmetic would
    // have passed because the test used the same arithmetic.
    //
    // Oracle: fixture has weights 80 − i×0.05 for i = 1..14. The last 7
    // entries (i = 8..14) are 79.60, 79.55, 79.50, 79.45, 79.40, 79.35, 79.30
    // which sum to 556.15 and average to 79.45 kg.
    const avg = weeklyAverageWeightKg(weights);
    expect(avg).not.toBeNull();
    expect(avg).toBeCloseTo(79.45, 2);
  });

  it("rolling average with custom window", () => {
    // E-33: hardcoded literature value. Previously the oracle re-derived the
    // average inline (`weights.reduce()/14`), making the test tautological —
    // a bug in the function's windowing or arithmetic would have passed
    // because the test used the same arithmetic.
    //
    // Oracle: fixture has weights 80 − i×0.05 for i = 1..14. The arithmetic
    // progression has mean (first + last) / 2 = (79.95 + 79.30) / 2 = 79.625.
    const avg = rollingAverageWeightKg(weights, 14);
    expect(avg).not.toBeNull();
    expect(avg).toBeCloseTo(79.625, 3);
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

    // E-35 fix: exact-value assertions tied to literature formulas.
    // Mifflin-St Jeor (male, 80kg, 178cm, 30yo):
    //   9.99*80 + 6.25*178 - 4.92*30 + 5 = 1769.1 kcal
    // No RippedBody adjustment (not in deficit, not weight-reduced).
    expect(result.bmr_kcal).toBeCloseTo(1769.1, 0);

    // TDEE = BMR × SAF (moderate = 1.55) = 1769.1 × 1.55 = 2742.1
    expect(result.tdee_kcal).toBeCloseTo(2742.1, 0);
    expect(result.tdee_method).toBe("mifflin_x_saf");

    // Alpert ceiling: 22 kcal/lb fat/day.
    //   fat_lb = 80 × 2.20462 × 0.18 = 31.75 → 22 × 31.75 = 698.4 kcal/day
    expect(result.max_daily_deficit_kcal).toBeCloseTo(698.4, 0);

    // Weekly cap = min(Alpert_weekly, 2.0) = min(698.4*7/3500, 2.0) = min(1.397, 2.0) = 1.397
    expect(result.effective_weekly_loss_cap_lbs).toBeCloseTo(1.40, 1);

    // Hydration: 0.03*80 + 0.3 (male) = 2.4 + 0.3 = 2.7 L (no exercise, temperate)
    expect(result.daily_water_intake_L).toBeCloseTo(2.7, 1);

    expect(result.population_excluded).toBe(false);
    expect(result.exclusion_reasons).toEqual([]);
  });

  it("falls back to CUN-BAE when no BF% or Navy inputs provided", () => {
    // E-33: hardcoded literature value. Previously the assertion `> 0` was
    // tautological — CUN-BAE returns a positive BF% for any valid BMI/age,
    // so the assertion could not fail. Replaced with a literature reference.
    //
    // Oracle: Gómez-Ambrosi J et al. (2012) "Body mass index classification
    // misses subjects with increased cardiometabolic risk." Diabetes Care.
    // For a 30yo male at BMI 25.25 (the makeUser() fixture), CUN-BAE yields
    // ≈ 18.5% BF.
    const user = makeUser(); // no body_fat_pct, no waist/neck
    const result = runAssessment(user);
    expect(result.body_fat_method).toBe("cun_bae");
    expect(result.body_fat_pct).toBeGreaterThan(15);
    expect(result.body_fat_pct).toBeLessThan(25);
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
    // E-33: hardcoded literature value. Previously the oracle re-derived the
    // formula (`60 × 2.2046226218 × 1.0 + 25`) inline, making the test
    // tautological — a typo in the kg→lb conversion constant or the +25 g
    // pregnancy add-on would have passed because the test used the same
    // constants.
    //
    // Oracle: IOM Dietary Reference Intakes (2002/2005) — protein RDA adds
    // +25 g/day absolute during pregnancy/lactation. For a 60 kg woman at
    // 1.0 g/lb baseline: 60 × 2.20462 + 25 = 132.28 + 25 = 157.28 g/day.
    const g = proteinGrams({
      rate_g_per_lb: 1.0,
      basis: "bodyweight",
      weight_kg: 60,
      age_years: 30,
      is_pregnant_or_lactating: true,
    });
    expect(g).toBeCloseTo(157.28, 1);
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

    // E-36 fix: exact-value assertions for the macro recipe.
    // Protein: 1.1 g/lb (cutting, male, 18% BF > 10% threshold, standard diet).
    //   80 kg × 2.20462 × 1.1 = 194.01 → roundMacro5 → 195 g
    expect(plan.protein_g).toBe(195);
    expect(plan.protein_rate_g_per_lb).toBeCloseTo(1.1, 2);
    expect(plan.protein_basis).toBe("bodyweight");

    // Internal consistency: protein_cal + fat_cal + carb_cal ≈ target_calories.
    // Each macro is rounded to nearest 5g, so tolerance is ±25 kcal.
    const proteinCal = plan.protein_g * 4;
    const fatCal = plan.fat_g * 9;
    const carbCal = plan.carb_g * 4;
    expect(Math.abs(proteinCal + fatCal + carbCal - plan.target_calories_kcal)).toBeLessThan(25);

    expect(plan.fat_g).toBeGreaterThanOrEqual(plan.fat_floor_g);
    expect(plan.carb_g).toBeGreaterThanOrEqual(0);
    // E-33: fiber formula (14 g / 1000 kcal, Part 3.11.1) is positive for any
    // plan above the calorie floor — `> 0` is tautological. The IOM AI for
    // fiber is 14 g/1000 kcal, so a cut plan above the 1500 kcal male floor
    // must yield at least Math.round(14 × 1.5) = 21 g. Tightened to 28 g to
    // match the 2000+ kcal typical cut target for an 80 kg male.
    expect(plan.fiber_target_g).toBeGreaterThanOrEqual(28);
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

    // E-36 fix: exact-value assertions for the bulk macro recipe.
    // Protein: 0.85 g/lb (bulking, male, standard diet, not vegan).
    //   80 kg × 2.20462 × 0.85 = 149.9 → roundMacro5 → 150 g
    expect(plan.protein_g).toBe(150);
    expect(plan.protein_rate_g_per_lb).toBeCloseTo(0.85, 2);

    // Internal consistency: protein_cal + fat_cal + carb_cal ≈ target (±25).
    const proteinCal = plan.protein_g * 4;
    const fatCal = plan.fat_g * 9;
    const carbCal = plan.carb_g * 4;
    expect(Math.abs(proteinCal + fatCal + carbCal - plan.target_calories_kcal)).toBeLessThan(25);

    // E-33: the bulk rate table (Part 3.4) always returns a positive rate,
    // so `> 0` is tautological. Tightened to ≥ 0.25 lb/month to confirm the
    // plan is in a meaningful surplus (not the 0.0 lb/month maintain fallback).
    expect(plan.target_rate_lb_per_period).toBeGreaterThanOrEqual(0.25);
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
    // E-61 fix: `sex` parameter removed (was unused — `void sex` no-op).
    const result = nextAdjustmentEligibleDate("cut", "2025-01-01");
    expect(result).toBe("2025-01-29");
  });

  it("next adjustment eligible date is +49 days for bulk (Part 3.6.4)", () => {
    const result = nextAdjustmentEligibleDate("bulk", "2025-01-01");
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
    // E-33: previously asserted against `Math.exp(-1)` which is the function's
    // exact formula (α(t) = exp(−t/τ) with τ = 14, so α(14) = exp(−1)). That
    // made the assertion tautological — a typo in the function's exp call
    // would have passed. Replaced with the hardcoded value of e⁻¹ = 0.3679
    // (the standard mathematical constant, not the function's runtime output).
    expect(priorWeightAlpha(14)).toBeCloseTo(0.3679, 3);
  });

  it("prior weight α(30) ≈ 0.12", () => {
    expect(priorWeightAlpha(30)).toBeCloseTo(0.117, 2);
  });

  it("prior weight α(60) ≈ 0.014 (effectively data-driven)", () => {
    expect(priorWeightAlpha(60)).toBeLessThan(0.02);
  });

  it("computePriorTdee = Mifflin × SAF with adjustments", () => {
    // E-33: previously asserted `tdee_kcal ≈ bmr_kcal × 1.55` which is the
    // function's exact formula (TDEE = BMR × SAF, moderate SAF = 1.55). That
    // made the assertion tautological — a typo in the multiplication would
    // have passed because the test re-derived the same product from the
    // function's own bmr_kcal output. Replaced with the literature value
    // 2742.1 kcal (Mifflin 1769.1 × moderate SAF 1.55) used elsewhere in this
    // suite for the same fixture (see Part 1.4.1 and Part 1.5.3).
    const user = makeUser();
    const result = computePriorTdee(user);
    expect(result.bmr_kcal).toBeGreaterThan(1500);
    expect(result.activity_factor).toBe(1.55);
    expect(result.tdee_kcal).toBeCloseTo(2742.1, 1);
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

  it("computeObservedTdee: gaining 0.5 kg/wk + intake 3000 → TDEE ≈ 2450", () => {
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
    // E-22 fix companion: use 60 distinct dates for BOTH intakes and weights
    // so detectOutliers sees n_days >= 30 and doesn't clamp alpha to 0.5.
    // Previously weights had only 2 entries (Jan 1 + Mar 1), so n_days = 2
    // and confidence_indicator was "low" — which is now correctly caught.
    const intakes = Array.from({ length: 60 }, (_, i) => ({
      date: `2025-01-${String((i % 28) + 1).padStart(2, "0")}`,
      kcal: 3000,
      protein_g: 150,
      carbs_g: 350,
      fat_g: 100,
    }));
    const weights = Array.from({ length: 60 }, (_, i) => ({
      date: `2025-02-${String((i % 28) + 1).padStart(2, "0")}`,
      weight_kg: 80,
    }));
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

  // E-22 + E-23 regression tests: outlier-aware clamping + sanity bounds.
  it("E-22: clamps alpha to >= 0.5 when outlier confidence is low (sparse data)", () => {
    const user = makeUser();
    // Only 5 days of data → n_days < 14 → confidence_indicator "low" → alpha clamped.
    const intakes = Array.from({ length: 5 }, (_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, "0")}`,
      kcal: 3000,
      protein_g: 150,
      carbs_g: 350,
      fat_g: 100,
    }));
    const weights = Array.from({ length: 5 }, (_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, "0")}`,
      weight_kg: 80,
    }));
    const result = computeAdaptiveTdee({
      user,
      intakes,
      weights,
      days_logged: 5, // would give alpha = exp(-5/14) ≈ 0.70 without the clamp
    });
    // With low confidence, alpha is clamped to >= 0.5.
    expect(result.alpha).toBeGreaterThanOrEqual(0.5);
    // Confidence is capped at 0.3.
    expect(result.confidence).toBeLessThanOrEqual(0.3);
    // Outliers are now returned.
    expect(result.outliers).not.toBeNull();
    expect(result.outliers?.confidence_indicator).toBe("low");
  });

  it("E-23: clamps observed TDEE to [0.5x, 2x] prior (gamed data defense)", () => {
    const user = makeUser(); // prior TDEE ≈ 2742 kcal (1769 BMR × 1.55 SAF)
    // 40 days of 10,000 kcal intake with NO weight change → observed = 10,000.
    // Without E-23 clamping, even with alpha = 0.5, the blend would be
    // 0.5*2742 + 0.5*10000 = 6371 kcal — absurd. E-23 clamps observed to
    // 2*2742 = 5484, so blend = 0.5*2742 + 0.5*5484 = 4113.
    const intakes = Array.from({ length: 40 }, (_, i) => ({
      date: `2025-01-${String((i % 28) + 1).padStart(2, "0")}`,
      kcal: 10000,
      protein_g: 150,
      carbs_g: 350,
      fat_g: 100,
    }));
    const weights = Array.from({ length: 40 }, (_, i) => ({
      date: `2025-02-${String((i % 28) + 1).padStart(2, "0")}`,
      weight_kg: 80,
    }));
    const result = computeAdaptiveTdee({
      user,
      intakes,
      weights,
      days_logged: 40,
    });
    // Observed is clamped to <= 2 * prior.
    const priorTdee = result.prior_tdee_kcal;
    expect(result.observed_tdee_kcal).toBeLessThanOrEqual(priorTdee * 2.0 + 1);
    expect(result.observed_tdee_kcal).toBeGreaterThanOrEqual(priorTdee * 0.5 - 1);
    // The adaptive TDEE must be within [prior*0.5, prior*2] — never absurd.
    expect(result.adaptive_tdee_kcal).toBeLessThanOrEqual(priorTdee * 2.0 + 1);
    expect(result.adaptive_tdee_kcal).toBeGreaterThanOrEqual(priorTdee * 0.5 - 1);
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

// ===========================================================================
// E-27: createUserFromOnboarding + mapping helpers
// Exercises the createUserFromOnboarding pipeline + mapGoal, mapActivityLevel,
// mapDietType, mapSex, inferTrainingStatus. These functions run in production
// (via useEngine) on every mount but were previously untested.
// ===========================================================================

describe("E-27 / createUserFromOnboarding + mapping helpers", () => {
  const baseInput: OnboardingInput = {
    name: "Jane Doe",
    age: 28,
    gender: "female",
    weight: 65,
    height: 165,
    goal: "weight-loss",
    activityLevel: "moderate",
    workoutPreference: "gym",
    frequency: 4,
    dietType: "vegetarian",
    cuisinePreference: "no-preference",
    allergies: "",
  };

  it("maps goal: weight-loss → cut, muscle-gain → bulk, strength → bulk, endurance → maintain, general → maintain", () => {
    expect(createUserFromOnboarding({ ...baseInput, goal: "weight-loss" }).primary_goal).toBe("cut");
    expect(createUserFromOnboarding({ ...baseInput, goal: "muscle-gain" }).primary_goal).toBe("bulk");
    expect(createUserFromOnboarding({ ...baseInput, goal: "strength" }).primary_goal).toBe("bulk");
    expect(createUserFromOnboarding({ ...baseInput, goal: "endurance" }).primary_goal).toBe("maintain");
    expect(createUserFromOnboarding({ ...baseInput, goal: "general" }).primary_goal).toBe("maintain");
  });

  it("maps activityLevel: sedentary/light/moderate/active", () => {
    expect(createUserFromOnboarding({ ...baseInput, activityLevel: "sedentary" }).activity_level).toBe("sedentary");
    expect(createUserFromOnboarding({ ...baseInput, activityLevel: "light" }).activity_level).toBe("light");
    expect(createUserFromOnboarding({ ...baseInput, activityLevel: "moderate" }).activity_level).toBe("moderate");
    expect(createUserFromOnboarding({ ...baseInput, activityLevel: "active" }).activity_level).toBe("very_active");
  });

  it("maps dietType: anything → standard, vegan → vegan, keto → keto, mediterranean → mediterranean", () => {
    expect(createUserFromOnboarding({ ...baseInput, dietType: "anything" }).diet_type).toBe("standard");
    expect(createUserFromOnboarding({ ...baseInput, dietType: "vegan" }).diet_type).toBe("vegan");
    expect(createUserFromOnboarding({ ...baseInput, dietType: "keto" }).diet_type).toBe("keto");
    expect(createUserFromOnboarding({ ...baseInput, dietType: "mediterranean" }).diet_type).toBe("mediterranean");
    expect(createUserFromOnboarding({ ...baseInput, dietType: "low-carb" }).diet_type).toBe("low_carb");
    expect(createUserFromOnboarding({ ...baseInput, dietType: "gluten-free" }).diet_type).toBe("gluten_free");
    expect(createUserFromOnboarding({ ...baseInput, dietType: "vegetarian" }).diet_type).toBe("vegetarian");
  });

  it("maps gender: female → female, male → male, non-binary → male (engine default), prefer-not-to-say → male", () => {
    expect(createUserFromOnboarding({ ...baseInput, gender: "female" }).sex).toBe("female");
    expect(createUserFromOnboarding({ ...baseInput, gender: "male" }).sex).toBe("male");
    expect(createUserFromOnboarding({ ...baseInput, gender: "non-binary" }).sex).toBe("male");
    expect(createUserFromOnboarding({ ...baseInput, gender: "prefer-not-to-say" }).sex).toBe("male");
  });

  it("infers training_status from frequency + goal", () => {
    // Strength/muscle-gain path
    expect(createUserFromOnboarding({ ...baseInput, goal: "strength", frequency: 5 }).training_status).toBe("intermediate");
    expect(createUserFromOnboarding({ ...baseInput, goal: "muscle-gain", frequency: 3 }).training_status).toBe("novice");
    expect(createUserFromOnboarding({ ...baseInput, goal: "muscle-gain", frequency: 2 }).training_status).toBe("beginner");
    // Other goals
    expect(createUserFromOnboarding({ ...baseInput, goal: "general", frequency: 4 }).training_status).toBe("novice");
    expect(createUserFromOnboarding({ ...baseInput, goal: "weight-loss", frequency: 2 }).training_status).toBe("beginner");
  });

  it("copies name/age/weight/height/frequency correctly and generates a user id", () => {
    const user = createUserFromOnboarding(baseInput);
    expect(user.age_years).toBe(28);
    expect(user.weight_kg).toBe(65);
    expect(user.height_cm).toBe(165);
    expect(user.training_days_per_week).toBe(4);
    expect(user.id).toContain("jane_doe");
    expect(user.id).toContain("28");
  });

  it("sets is_currently_in_deficit = true when goal is weight-loss (cut), false otherwise", () => {
    expect(createUserFromOnboarding({ ...baseInput, goal: "weight-loss" }).is_currently_in_deficit).toBe(true);
    expect(createUserFromOnboarding({ ...baseInput, goal: "muscle-gain" }).is_currently_in_deficit).toBe(false);
  });

  it("computes is_weight_reduced from all_time_high_weight_kg (weight < 90% of ATH)", () => {
    const profile = { all_time_high_weight_kg: 80 };
    const user = createUserFromOnboarding({ ...baseInput, weight: 65 }, profile);
    expect(user.is_weight_reduced).toBe(true); // 65 < 80 * 0.9 = 72
  });

  it("is_weight_reduced = false when weight >= 90% of all_time_high", () => {
    const profile = { all_time_high_weight_kg: 70 };
    const user = createUserFromOnboarding({ ...baseInput, weight: 65 }, profile);
    expect(user.is_weight_reduced).toBe(false); // 65 >= 70 * 0.9 = 63
  });

  it("EngineProfile overrides take precedence over onboarding-derived values", () => {
    const profile = {
      sex: "male" as const,
      activity_level: "very_active" as const,
      training_status: "advanced" as const,
      body_fat_pct: 15,
      body_fat_method: "navy" as const,
      waist_cm: 80,
      neck_cm: 38,
    };
    const user = createUserFromOnboarding({ ...baseInput, gender: "female" }, profile);
    expect(user.sex).toBe("male"); // profile overrides
    expect(user.activity_level).toBe("very_active");
    expect(user.training_status).toBe("advanced");
    expect(user.body_fat_pct).toBe(15);
    expect(user.waist_cm).toBe(80);
  });
});

// ===========================================================================
// E-29: interpretWeightTrend — missing branches
// Covers: cut-monitor (delta<0), bulk-monitor (weeks>=6), recomp/maintain
// fall-through, insufficient-data path.
// ===========================================================================

describe("E-29 / interpretWeightTrend missing branches", () => {
  it("cut-monitor: weight declining (delta < 0) → monitor", () => {
    // 21 days of declining weight: weekly avg < prior 14-day avg → delta < 0
    const declining: { date: string; weight_kg: number }[] = [];
    for (let i = 1; i <= 21; i++) {
      declining.push({ date: `2025-01-${String(i).padStart(2, "0")}`, weight_kg: 80 - i * 0.1 });
    }
    const result = interpretWeightTrend(declining, "cut", 21, 3);
    expect(result.action).toBe("monitor");
  });

  it("bulk-monitor: weeks_into_phase >= 6 → monitor", () => {
    // 45 days of rising weight, bulk, 7 weeks in
    const rising: { date: string; weight_kg: number }[] = [];
    for (let i = 1; i <= 45; i++) {
      rising.push({ date: `2025-01-${String(i).padStart(2, "0")}`, weight_kg: 80 + i * 0.05 });
    }
    const result = interpretWeightTrend(rising, "bulk", 45, 6);
    expect(result.action).toBe("monitor");
  });

  it("recomp phase → monitor (fall-through)", () => {
    const weights: { date: string; weight_kg: number }[] = [];
    for (let i = 1; i <= 21; i++) {
      weights.push({ date: `2025-01-${String(i).padStart(2, "0")}`, weight_kg: 80 });
    }
    const result = interpretWeightTrend(weights, "recomp", 21, 3);
    expect(result.action).toBe("monitor");
  });

  it("maintain phase → monitor (fall-through)", () => {
    const weights: { date: string; weight_kg: number }[] = [];
    for (let i = 1; i <= 21; i++) {
      weights.push({ date: `2025-01-${String(i).padStart(2, "0")}`, weight_kg: 80 });
    }
    const result = interpretWeightTrend(weights, "maintain", 21, 3);
    expect(result.action).toBe("monitor");
  });

  it("insufficient data: < 7 weight logs → wait", () => {
    const sparse: { date: string; weight_kg: number }[] = [];
    for (let i = 1; i <= 5; i++) {
      sparse.push({ date: `2025-01-${String(i).padStart(2, "0")}`, weight_kg: 80 });
    }
    const result = interpretWeightTrend(sparse, "cut", 20, 2);
    // weeklyAverageWeightKg returns null for < 7 entries → "wait"
    expect(result.action).toBe("wait");
  });
});

// ===========================================================================
// E-28: recommendAdjustment — eligible paths
// Covers: cut eligible (rate off target), bulk eligible, on-target (< 50 kcal),
// and the "not yet eligible" + "insufficient data" negative paths.
// ===========================================================================

describe("E-28 / recommendAdjustment eligible paths", () => {
  // Build a minimal NutritionPlan for testing. The function only reads:
  // phase, next_adjustment_eligible_date, target_rate_lb_per_period.
  function makePlan(overrides: Partial<{
    phase: "cut" | "bulk" | "recomp" | "maintain";
    next_adjustment_eligible_date: string;
    target_rate_lb_per_period: number;
  }>) {
    return {
      user_id: "test-user",
      plan_id: "test-plan",
      created_at: "2025-01-01T00:00:00.000Z",
      version: 1,
      phase: overrides.phase ?? "cut",
      phase_start_date: "2025-01-01",
      tdee_kcal: 2500,
      tdee_method: "mifflin_x_saf" as const,
      target_calories_kcal: 2000,
      calorie_delta_kcal: -500,
      target_rate_pct: 0.625,
      target_rate_lb_per_period: overrides.target_rate_lb_per_period ?? 1.0,
      alpert_max_deficit_kcal: 700,
      weekly_loss_cap_lb: 1.4,
      calorie_floor_kcal: 1500,
      protein_g: 180,
      protein_basis: "bodyweight" as const,
      protein_rate_g_per_lb: 1.1,
      fat_g: 60,
      fat_pct_of_calories: 27,
      fat_floor_g: 50,
      carb_g: 200,
      macro_pct_calories: { protein: 36, carbs: 40, fat: 24 },
      fiber_target_g: 30,
      fruit_cups_per_day: 2,
      veg_cups_per_day: 3,
      supplements: [],
      last_adjustment_date: undefined,
      next_adjustment_eligible_date: overrides.next_adjustment_eligible_date ?? "2025-01-29",
      adjustment_history: [],
      macro_tolerance_pct: 0.05,
      tolerance_compliance_target_pct: 0.9,
    };
  }

  it("not eligible: today is before next_adjustment_eligible_date", () => {
    const plan = makePlan({ next_adjustment_eligible_date: "2025-03-01" });
    const result = recommendAdjustment({
      plan,
      daily_weights: [],
      today_date: "2025-02-15",
    });
    expect(result).not.toBeNull();
    expect(result!.eligible).toBe(false);
    expect(result!.delta_kcal).toBe(0);
  });

  it("not eligible: insufficient weight data (< 14 logs)", () => {
    const plan = makePlan({ next_adjustment_eligible_date: "2025-01-01" });
    const few_weights = Array.from({ length: 10 }, (_, i) => ({
      date: `2025-02-${String(i + 1).padStart(2, "0")}`,
      weight_kg: 80,
    }));
    const result = recommendAdjustment({
      plan,
      daily_weights: few_weights,
      today_date: "2025-03-01",
    });
    expect(result).not.toBeNull();
    expect(result!.eligible).toBe(false);
    expect(result!.reason).toContain("Insufficient");
  });

  it("cut eligible: losing too slowly (rate < target) → negative delta (reduce calories)", () => {
    const plan = makePlan({
      phase: "cut",
      next_adjustment_eligible_date: "2025-01-01",
      target_rate_lb_per_period: 1.0, // target: 1.0 lb/week loss
    });
    // 28 days of very slow loss: -0.1 kg/day → -0.154 lb/week (target is -1.0)
    const weights = Array.from({ length: 28 }, (_, i) => ({
      date: `2025-02-${String(i + 1).padStart(2, "0")}`,
      weight_kg: 80 - i * 0.01,
    }));
    const result = recommendAdjustment({
      plan,
      daily_weights: weights,
      today_date: "2025-03-01",
    });
    expect(result).not.toBeNull();
    expect(result!.eligible).toBe(true);
    // Losing too slowly → need to reduce calories → delta should be negative.
    expect(result!.delta_kcal).toBeLessThan(0);
  });

  it("cut on-target: |rate| ≈ target → delta ≈ 0 (sign-convention fix)", () => {
    // After the cutAdjustmentDeltaKcal sign-convention fix, |actual| is
    // compared to target. Losing at ~0.99 lb/week with target 0.99 → delta ≈ 0.
    const plan = makePlan({
      phase: "cut",
      next_adjustment_eligible_date: "2025-01-01",
      target_rate_lb_per_period: 0.99,
    });
    // 28 days of loss matching ~0.99 lb/week ≈ -0.064 kg/day
    const weights = Array.from({ length: 28 }, (_, i) => ({
      date: `2025-02-${String(i + 1).padStart(2, "0")}`,
      weight_kg: 80 - i * 0.064,
    }));
    const result = recommendAdjustment({
      plan,
      daily_weights: weights,
      today_date: "2025-03-01",
    });
    expect(result).not.toBeNull();
    expect(result!.eligible).toBe(true);
    // On target → delta should be 0 (within the 50-kcal threshold).
    expect(Math.abs(result!.delta_kcal)).toBeLessThan(50);
  });

  it("bulk eligible: gaining too slowly → positive delta (add calories)", () => {
    const plan = makePlan({
      phase: "bulk",
      next_adjustment_eligible_date: "2025-01-01",
      target_rate_lb_per_period: 2.0, // target: 2.0 lb/month gain
    });
    // 28 days of very slow gain: +0.01 kg/day → ~0.3 lb/month (target is 2.0)
    const weights = Array.from({ length: 28 }, (_, i) => ({
      date: `2025-02-${String(i + 1).padStart(2, "0")}`,
      weight_kg: 80 + i * 0.01,
    }));
    const result = recommendAdjustment({
      plan,
      daily_weights: weights,
      today_date: "2025-03-01",
    });
    expect(result).not.toBeNull();
    expect(result!.eligible).toBe(true);
    // Gaining too slowly → need to add calories → delta should be positive.
    expect(result!.delta_kcal).toBeGreaterThan(0);
  });

  it("maintain phase → not eligible (no auto-adjustment)", () => {
    const plan = makePlan({
      phase: "maintain",
      next_adjustment_eligible_date: "2025-01-01",
    });
    const weights = Array.from({ length: 28 }, (_, i) => ({
      date: `2025-02-${String(i + 1).padStart(2, "0")}`,
      weight_kg: 80,
    }));
    const result = recommendAdjustment({
      plan,
      daily_weights: weights,
      today_date: "2025-03-01",
    });
    expect(result).not.toBeNull();
    expect(result!.eligible).toBe(false);
    expect(result!.reason).toContain("does not support");
  });
});
