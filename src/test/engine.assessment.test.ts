/**
 * Engine assessment tests — covers Part 0 (foundations) and Part 1.1–1.11
 * of the engine: body-fat estimation, anthropometric indices, ideal body
 * weight, RMR/TDEE, Alpert fat-loss ceiling, FFMI, Berkhan max, progress
 * tracking, hydration, and the top-level runAssessment() entry point.
 *
 * Every test maps to a specific section of the Unified Reference Guide so
 * engineers can trace failures back to the spec.
 */

import { describe, it, expect } from "vitest";
import {
  type User,
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
