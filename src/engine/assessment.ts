/**
 * Assessment Engine — Part 1 of the Unified Reference Guide.
 *
 * Implements:
 *   1.1  Body-fat % estimation (Navy, JP3, JP7, CUN-BAE, method selection)
 *   1.2  Anthropometric indices (BMI, WHtR, WHR, ABSI)
 *   1.3  Ideal Body Weight (Devine, Robinson, Miller, Hamwi, BMI-range)
 *   1.4  RMR (Mifflin-St Jeor, Harris-Benedict 1984, Cunningham/Katch-McArdle)
 *        + RippedBody -5%/-3% adjustments
 *   1.5  TDEE (Mifflin × SAF canonical, IOM DLW EER alternative)
 *   1.6  Maximum fat-loss ceiling (Alpert 22 kcal/lb fat/day + 2 lb/wk cap)
 *   1.7  Muscle mass / FFMI
 *   1.8  Maximum muscular potential (Berkhan)
 *   1.9  Progress tracking utilities (weekly average, trend interpretation)
 *   1.10 Hydration (fatcalc 6-step formula)
 *   1.11 runAssessment() — composes everything into AssessmentResult
 *
 * All functions are pure. No IO. No side effects. Unit-testable.
 */

import type {
  ActivityLevel,
  AssessmentResult,
  BodyFatMethod,
  DietType,
  DailyWeightLog,
  OnboardingInput,
  OnboardingGoal,
  OnboardingActivityLevel,
  OnboardingDietType,
  PrimaryGoal,
  Sex,
  TrainingStatus,
  User,
} from "./schemas";

// ===========================================================================
// Constants
// ===========================================================================

export const KCAL_PER_LB_FAT = 3500; // energy content (Part 4.5)
export const KCAL_PER_KG_FAT = 7700;
export const ALPERT_KCAL_PER_LB_FAT_PER_DAY = 22; // canonical (Part 1.6, Part 5 B-C5)
export const POP_WEEKLY_LOSS_CAP_LB = 2.0;

export const CALORIE_FLOOR = { female: 1200, male: 1500 } as const;

// SAF 5-level activity factors (Part 1.5.2)
export const SAF: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

// IOM DLW EER PA coefficients (Part 1.5.4)
export const IOM_PA: Record<
  ActivityLevel,
  { male: number; female: number }
> = {
  sedentary: { male: 1.0, female: 1.0 },
  light: { male: 1.11, female: 1.12 },
  moderate: { male: 1.25, female: 1.27 },
  very_active: { male: 1.48, female: 1.45 },
  // IOM has 4 levels; map extra_active → very_active PA
  extra_active: { male: 1.48, female: 1.45 },
};

// ===========================================================================
// 1.1 Body-fat % estimation
// ===========================================================================

/**
 * US Navy body-fat % (Part 1.1.1).
 *
 * Uses the canonical RippedBody inch form internally (Hodgdon & Beckett 1984,
 * DoD Instruction 1308.3). Accepts cm inputs and converts to inches — the
 * "cm form" sometimes published online (495/(1.0324 - 0.19077×log10(...)) - 450)
 * is actually a Siri density equation that does NOT apply to circumference
 * data and produces nonsensical values (>200%). The reference guide notes the
 * cm form is "mathematically identical after unit conversion" — implemented
 * here by converting cm→in and applying the inch form.
 *
 * Resolves Group A C2 — pick the RippedBody-published inch form for correctness.
 *
 * @returns BF% as a number; throws if log10 argument is non-positive.
 */
export function usNavyBfPct(
  sex: Sex,
  height_cm: number,
  neck_cm: number,
  abdomen_or_waist_cm: number,
  hip_cm?: number,
): number {
  const CM_PER_IN = 2.54;
  const height_in = height_cm / CM_PER_IN;
  const neck_in = neck_cm / CM_PER_IN;
  const abdomen_or_waist_in = abdomen_or_waist_cm / CM_PER_IN;

  if (sex === "male") {
    const diff = abdomen_or_waist_in - neck_in;
    if (diff <= 0) {
      throw new Error(
        "US Navy (male): abdomen must exceed neck for log10 to be defined",
      );
    }
    return (
      86.01 * Math.log10(diff) -
      70.041 * Math.log10(height_in) +
      36.76
    );
  }
  // female
  if (hip_cm === undefined) {
    throw new Error("US Navy (female): hip_cm is required");
  }
  const hip_in = hip_cm / CM_PER_IN;
  const diff = abdomen_or_waist_in + hip_in - neck_in;
  if (diff <= 0) {
    throw new Error(
      "US Navy (female): waist+hip must exceed neck for log10 to be defined",
    );
  }
  return (
    163.205 * Math.log10(diff) -
    97.684 * Math.log10(height_in) -
    78.387
  );
}

/**
 * Jackson-Pollock 7-site skinfold (Part 1.1.2).
 * S7 = sum of 7 skinfolds in mm:
 *   chest, midaxillary, triceps, subscapular, abdomen, suprailiac, thigh.
 *
 * Returns BF% via Siri equation: BF% = (495 / BD) − 450.
 */
export function jp7BfPct(sex: Sex, age_years: number, s7_mm: number): number {
  const bd =
    sex === "male"
      ? 1.112 -
        0.00043499 * s7_mm +
        0.00000055 * s7_mm * s7_mm -
        0.00028826 * age_years
      : 1.097 -
        0.00046971 * s7_mm +
        0.00000056 * s7_mm * s7_mm -
        0.00012828 * age_years;
  return siriBfPct(bd);
}

/**
 * Jackson-Pollock 3-site skinfold (Part 1.1.2).
 * Men:   S3 = chest + abdomen + thigh
 * Women: S3 = triceps + suprailiac + thigh
 */
export function jp3BfPct(sex: Sex, age_years: number, s3_mm: number): number {
  const bd =
    sex === "male"
      ? 1.10938 -
        0.0008267 * s3_mm +
        0.0000016 * s3_mm * s3_mm -
        0.0002574 * age_years
      : 1.0994921 -
        0.0009929 * s3_mm +
        0.0000023 * s3_mm * s3_mm -
        0.0001392 * age_years;
  return siriBfPct(bd);
}

/** Siri body-density → BF% conversion. */
export function siriBfPct(body_density: number): number {
  return 495 / body_density - 450;
}

/**
 * CUN-BAE (Part 1.1.3) — BMI-based fallback when no circumference/skinfold data.
 * Gómez-Ambrosi et al., Diabetes Care 2012.
 * sex_code = 0 male, 1 female.
 */
export function cunBaeBfPct(
  sex: Sex,
  age_years: number,
  bmi: number,
): number {
  const s = sex === "male" ? 0 : 1;
  return (
    -44.988 +
    0.503 * age_years +
    10.689 * s +
    3.172 * bmi -
    0.026 * bmi * bmi +
    0.181 * bmi * s -
    0.02 * age_years * bmi -
    0.0059 * age_years * s +
    0.00018 * age_years * bmi * s
  );
}

/**
 * Jackson 2002 BMI→BF% regression (Part 1.4.4) — used to bootstrap Cunningham
 * RMR when no BF% is available but user is athletic.
 */
export function jacksonBmiToBfPct(
  sex: Sex,
  age_years: number,
  bmi: number,
): number {
  const ln_bmi = Math.log(bmi);
  return sex === "male"
    ? 0.14 * age_years + 37.31 * ln_bmi - 103.94
    : 0.14 * age_years + 39.96 * ln_bmi - 102.01;
}

/**
 * Method accuracy table (Part 1.1.5). Canonical — uses error %, not
 * RippedBody's informal "most-to-least" listing order.
 */
export const BF_METHOD_ACCURACY: Record<
  BodyFatMethod,
  { plus_minus_pct: number; label: string }
> = {
  jp7: { plus_minus_pct: 3, label: "Jackson-Pollock 7-site (skilled)" },
  jp3: { plus_minus_pct: 3.5, label: "Jackson-Pollock 3-site" },
  jp4: { plus_minus_pct: 3.5, label: "Jackson-Pollock 4-site" },
  durnin_womersley: { plus_minus_pct: 3.5, label: "Durnin-Womersley 4-site" },
  navy: { plus_minus_pct: 3.5, label: "US Navy (circumference)" },
  dexa: { plus_minus_pct: 5, label: "DEXA scan" },
  cun_bae: { plus_minus_pct: 4.5, label: "CUN-BAE (BMI-based)" },
  ai_photo: { plus_minus_pct: 3, label: "AI photo analysis (front+side)" },
  manual: { plus_minus_pct: 0, label: "Manual entry" },
};

/**
 * ACE body-fat % classification (Part 1.1.6).
 */
export function classifyBfPct(sex: Sex, bf_pct: number): string {
  if (sex === "male") {
    if (bf_pct < 6) return "Essential fat";
    if (bf_pct <= 13) return "Athlete";
    if (bf_pct <= 17) return "Fitness";
    if (bf_pct <= 24) return "Average";
    return "Obese";
  }
  if (bf_pct < 14) return "Essential fat";
  if (bf_pct <= 20) return "Athlete";
  if (bf_pct <= 24) return "Fitness";
  if (bf_pct <= 31) return "Average";
  return "Obese";
}

/**
 * Clamp BF% to essential-fat minimum (Part 1.1.1).
 */
export function clampBfPct(sex: Sex, bf_pct: number): number {
  const min = sex === "male" ? 2 : 10;
  return Math.max(bf_pct, min);
}

// ===========================================================================
// 1.2 Anthropometric indices
// ===========================================================================

/** BMI (Part 1.2.1). */
export function bmi(weight_kg: number, height_cm: number): number {
  const h_m = height_cm / 100;
  return weight_kg / (h_m * h_m);
}

/** WHO BMI category. */
export function bmiCategory(bmi_val: number): string {
  if (bmi_val < 18.5) return "Underweight";
  if (bmi_val < 25) return "Normal weight";
  if (bmi_val < 30) return "Overweight";
  if (bmi_val < 35) return "Obese class I";
  if (bmi_val < 40) return "Obese class II";
  return "Obese class III";
}

/** Waist-to-Height Ratio (Part 1.2.2). */
export function whtr(waist_cm: number, height_cm: number): number {
  return waist_cm / height_cm;
}

/**
 * WHtR category using Ashwell sex-specific cut-points (Part 1.2.2).
 * Universal rule: <0.5 = healthy.
 */
export function whtrCategory(sex: Sex, ratio: number): string {
  if (sex === "male") {
    if (ratio < 0.43) return "Underweight";
    if (ratio <= 0.52) return "Healthy";
    if (ratio <= 0.62) return "Overweight";
    return "Obese";
  }
  if (ratio < 0.42) return "Underweight";
  if (ratio <= 0.49) return "Healthy";
  if (ratio <= 0.54) return "Overweight";
  return "Obese";
}

/** Waist-to-Hip Ratio (Part 1.2.3). */
export function whr(waist_cm: number, hip_cm: number): number {
  return waist_cm / hip_cm;
}

/**
 * WHR WHO sex-specific thresholds (Part 1.2.3).
 * Men >0.90, Women >0.85 = concern; >1.0 = significantly elevated (any sex).
 */
export function whrCategory(sex: Sex, ratio: number): string {
  if (ratio > 1.0) return "Substantially elevated risk";
  const threshold = sex === "male" ? 0.9 : 0.85;
  return ratio > threshold ? "Elevated risk" : "Low risk";
}

/**
 * ABSI (A Body Shape Index) — Part 1.2.4.
 * SI units: waist_m, weight_kg, height_m.
 */
export function absi(
  waist_cm: number,
  weight_kg: number,
  height_cm: number,
): number {
  const waist_m = waist_cm / 100;
  const height_m = height_cm / 100;
  return waist_m * Math.pow(weight_kg, -2 / 3) * Math.pow(height_m, 5 / 6);
}

/**
 * ABSI z-score band → risk category (Part 1.2.4).
 * Note: precise z-score requires NHANES 1999-2004 reference tables by age × sex;
 * engineers implementing a full ABSI feature must source those tables.
 * This function only classifies a *given* z-score.
 */
export function absiCategoryFromZ(z: number): string {
  if (z < -0.868) return "Low";
  if (z < -0.272) return "Below Average";
  if (z < 0.229) return "Average";
  if (z < 0.798) return "Above Average";
  return "High";
}

// ===========================================================================
// 1.3 Ideal Body Weight (IBW)
// ===========================================================================

/**
 * IBW formulas (Part 1.3). All use a 5 ft (60 in) baseline + slope kg/inch.
 * Frame size adjustment: × 0.90 small, × 1.00 medium, × 1.10 large.
 */
export interface IbwResult {
  devine_kg: number;
  robinson_kg: number;
  miller_kg: number;
  hamwi_kg: number;
}

const IBW_COEFFICIENTS = {
  male: { devine: [50.0, 2.3], robinson: [52.0, 1.9], miller: [56.2, 1.41], hamwi: [48.0, 2.7] },
  female: { devine: [45.5, 2.3], robinson: [49.0, 1.7], miller: [53.1, 1.36], hamwi: [45.4, 2.2] },
};

export function idealBodyWeight(sex: Sex, height_cm: number): IbwResult {
  const height_in = height_cm / 2.54;
  const inchesOver5ft = Math.max(0, height_in - 60);
  const c = IBW_COEFFICIENTS[sex];

  return {
    devine_kg: c.devine[0] + c.devine[1] * inchesOver5ft,
    robinson_kg: c.robinson[0] + c.robinson[1] * inchesOver5ft,
    miller_kg: c.miller[0] + c.miller[1] * inchesOver5ft,
    hamwi_kg: c.hamwi[0] + c.hamwi[1] * inchesOver5ft,
  };
}

/** BMI-based healthy weight range (WHO 18.5–24.9). */
export function bmiHealthyRange(height_cm: number): { low: number; high: number } {
  const h_m = height_cm / 100;
  return { low: 18.5 * h_m * h_m, high: 24.9 * h_m * h_m };
}

// ===========================================================================
// 1.4 Resting metabolic rate (RMR / BMR)
// ===========================================================================

/** Mifflin-St Jeor (Part 1.4.1) — canonical default. */
export function mifflinStJeor(
  sex: Sex,
  weight_kg: number,
  height_cm: number,
  age_years: number,
): number {
  const base = 9.99 * weight_kg + 6.25 * height_cm - 4.92 * age_years;
  return sex === "male" ? base + 5 : base - 161;
}

/** Harris-Benedict revised (1984, Roza & Shizgal) — Part 1.4.2. */
export function harrisBenedict1984(
  sex: Sex,
  weight_kg: number,
  height_cm: number,
  age_years: number,
): number {
  return sex === "male"
    ? 13.397 * weight_kg + 4.799 * height_cm - 5.677 * age_years + 88.362
    : 9.247 * weight_kg + 3.098 * height_cm - 4.33 * age_years + 447.593;
}

/**
 * Cunningham (1991) / Katch-McArdle — Part 1.4.3.
 * Requires lean body mass. Use when BF% is known and user is athletic.
 */
export function cunningham(lean_body_mass_kg: number): number {
  return 370 + 21.6 * lean_body_mass_kg;
}

/** Compute LBM from body weight + BF%. */
export function leanBodyMass(weight_kg: number, bf_pct: number): number {
  return weight_kg * (1 - bf_pct / 100);
}

/**
 * RippedBody BMR adjustments (Part 1.4.5).
 * - Currently in deficit → × 0.95
 * - Weight-reduced (>10% below all-time-high) → × 0.97
 * Penalties compound multiplicatively.
 */
export function applyRippedBodyBmrAdjustments(
  bmr: number,
  is_currently_in_deficit: boolean,
  is_weight_reduced: boolean,
): number {
  let out = bmr;
  if (is_currently_in_deficit) out *= 0.95;
  if (is_weight_reduced) out *= 0.97;
  return out;
}

/** Helper: is the user > 10% below all-time-high weight? */
export function isWeightReduced(
  current_weight_kg: number,
  all_time_high_weight_kg?: number,
): boolean {
  if (!all_time_high_weight_kg) return false;
  return current_weight_kg < all_time_high_weight_kg * 0.9;
}

// ===========================================================================
// 1.5 Total Daily Energy Expenditure (TDEE)
// ===========================================================================

/**
 * Mifflin × SAF (Part 1.5.3) — canonical default TDEE pipeline.
 * Applies RippedBody adjustments + minimum calorie floor.
 */
export function tdeeFromMifflinAndSaf(user: User): {
  bmr_kcal: number;
  tdee_kcal: number;
  activity_factor: number;
} {
  const rawBmr = mifflinStJeor(
    user.sex,
    user.weight_kg,
    user.height_cm,
    user.age_years,
  );
  const bmr = applyRippedBodyBmrAdjustments(
    rawBmr,
    user.is_currently_in_deficit,
    user.is_weight_reduced,
  );
  const factor = SAF[user.activity_level];
  const tdee = bmr * factor;
  return { bmr_kcal: bmr, tdee_kcal: tdee, activity_factor: factor };
}

/**
 * IOM DLW EER (Part 1.5.4) — advanced alternative for under-18, over-65,
 * or DLW-validated-accuracy use cases.
 */
export function tdeeFromIomDlwEer(user: User): {
  tdee_kcal: number;
  activity_factor: number;
} {
  const height_m = user.height_cm / 100;
  const pa = IOM_PA[user.activity_level][user.sex];
  const eer =
    user.sex === "male"
      ? 662 - 9.53 * user.age_years + pa * (15.91 * user.weight_kg + 539.6 * height_m)
      : 354 - 6.91 * user.age_years + pa * (9.36 * user.weight_kg + 726 * height_m);
  return { tdee_kcal: eer, activity_factor: pa };
}

/** Enforce minimum calorie floor (Part 0.3). */
export function enforceCalorieFloor(sex: Sex, kcal: number): number {
  return Math.max(kcal, CALORIE_FLOOR[sex]);
}

// ===========================================================================
// 1.6 Maximum fat-loss ceiling
// ===========================================================================

/**
 * Alpert maximum daily calorie deficit (Part 1.6.1).
 * Canonical constant: 22 kcal/lb fat/day (corrected; original 31 had a math error).
 */
export function alpertMaxDailyDeficitKcal(
  body_weight_kg: number,
  bf_pct: number,
): number {
  const body_weight_lb = body_weight_kg * 2.2046226218;
  const fat_lb = body_weight_lb * (bf_pct / 100);
  return ALPERT_KCAL_PER_LB_FAT_PER_DAY * fat_lb;
}

/** Alpert max weekly fat loss in lb. */
export function alpertMaxWeeklyLossLb(
  body_weight_kg: number,
  bf_pct: number,
): number {
  return (alpertMaxDailyDeficitKcal(body_weight_kg, bf_pct) * 7) / KCAL_PER_LB_FAT;
}

/**
 * Effective weekly loss cap (Part 1.6.2) — lower of Alpert and 2 lb/wk.
 */
export function effectiveWeeklyLossCapLb(
  body_weight_kg: number,
  bf_pct?: number,
): number {
  if (bf_pct === undefined) return POP_WEEKLY_LOSS_CAP_LB;
  return Math.min(alpertMaxWeeklyLossLb(body_weight_kg, bf_pct), POP_WEEKLY_LOSS_CAP_LB);
}

// ===========================================================================
// 1.7 Muscle mass & FFMI
// ===========================================================================

/**
 * FFMI (Part 1.7.3).
 *   FFMI = FFM(kg) / height(m)²
 *   Normalized FFMI = FFMI + 6.3 × (1.8 − height_m)
 */
export function ffmi(
  weight_kg: number,
  bf_pct: number,
  height_cm: number,
): { ffmi: number; normalized_ffmi: number } {
  const ffm_kg = leanBodyMass(weight_kg, bf_pct);
  const height_m = height_cm / 100;
  const raw = ffm_kg / (height_m * height_m);
  const normalized = raw + 6.3 * (1.8 - height_m);
  return { ffmi: raw, normalized_ffmi: normalized };
}

// ===========================================================================
// 1.8 Maximum muscular potential
// ===========================================================================

/**
 * Berkhan formula (Part 1.8.1) — max stage-shredded bodyweight (5–6% BF men).
 *   Max stage-shredded weight (kg) = Height (cm) − 100
 * For women, the offset is less well-established; we apply −105 as a conservative
 * adjustment (8 cm additional offset reflecting women's higher essential fat).
 */
export function berkhanMaxStageShreddedKg(
  sex: Sex,
  height_cm: number,
): number {
  return sex === "male" ? height_cm - 100 : height_cm - 105;
}

// ===========================================================================
// 1.9 Progress tracking utilities
// ===========================================================================

/**
 * Weekly (7-day) rolling average of weight (Part 1.9.3).
 * Returns null if insufficient data.
 */
export function weeklyAverageWeightKg(
  daily_weights: DailyWeightLog[],
): number | null {
  if (daily_weights.length < 7) return null;
  const sorted = [...daily_weights].sort((a, b) => a.date.localeCompare(b.date));
  const last7 = sorted.slice(-7);
  return last7.reduce((sum, l) => sum + l.weight_kg, 0) / 7;
}

/**
 * 14-day rolling average (for slow cut rates — Part 4.2.2).
 */
export function rollingAverageWeightKg(
  daily_weights: DailyWeightLog[],
  days: number,
): number | null {
  if (daily_weights.length < days) return null;
  const sorted = [...daily_weights].sort((a, b) => a.date.localeCompare(b.date));
  const window = sorted.slice(-days);
  return window.reduce((sum, l) => sum + l.weight_kg, 0) / days;
}

/**
 * Compute weekly rate of weight change (lb/week) from a sorted daily-weights array.
 * Uses simple linear regression slope × 7.
 */
export function weeklyRateLbPerWeek(
  daily_weights: DailyWeightLog[],
): number | null {
  if (daily_weights.length < 7) return null;
  const sorted = [...daily_weights].sort((a, b) => a.date.localeCompare(b.date));
  const n = sorted.length;
  const xs = sorted.map((_, i) => i);
  const ys = sorted.map((l) => l.weight_kg);
  const xMean = xs.reduce((s, x) => s + x, 0) / n;
  const yMean = ys.reduce((s, y) => s + y, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  if (den === 0) return 0;
  const slope_kg_per_day = num / den;
  // Negative slope = weight loss; positive = gain. Convert kg/day → lb/week.
  return slope_kg_per_day * 7 * 2.2046226218;
}

/**
 * Trend interpretation (Part 4.2.3).
 * Returns an action recommendation: 'adaptation_phase', 'wait', 'act', or 'monitor'.
 */
export function interpretWeightTrend(
  daily_weights: DailyWeightLog[],
  phase: "cut" | "bulk" | "recomp" | "maintain",
  days_into_phase: number,
  weeks_into_phase: number,
): { action: "adaptation_phase" | "wait" | "act" | "monitor"; reason: string } {
  if (days_into_phase < 14) {
    return {
      action: "adaptation_phase",
      reason: "First 1-2 weeks: water + glycogen + gut content shifts dominate. Do not adjust.",
    };
  }

  const weekly = weeklyAverageWeightKg(daily_weights);
  const prior = rollingAverageWeightKg(daily_weights, 14);
  if (weekly === null || prior === null) {
    return { action: "wait", reason: "Insufficient data." };
  }
  // delta uses prior 14-day avg vs current 7-day avg
  const delta = weekly - prior;

  if (phase === "cut") {
    if (delta >= 0) {
      if (weeks_into_phase < 4) {
        return {
          action: "wait",
          reason: "Water retention may be masking fat loss; wait ≥ 4 weeks.",
        };
      }
      return {
        action: "act",
        reason: "Run troubleshooting checklist; reduce calories LAST.",
      };
    }
    return {
      action: "monitor",
      reason: "Compute actual_rate vs target_rate; adjust if off by > 0.25 lb/week.",
    };
  }

  if (phase === "bulk") {
    if (weeks_into_phase < 6) {
      return {
        action: "wait",
        reason: "Glycogen + water + gut content confound; wait 6-7 weeks.",
      };
    }
    return {
      action: "monitor",
      reason: "Compute actual_rate vs target_rate; adjust if off by > 0.25 lb/month.",
    };
  }

  return { action: "monitor", reason: "Stable weight expected; track measurements instead." };
}

// ===========================================================================
// 1.10 Hydration
// ===========================================================================

export type ExerciseIntensity = "none" | "light" | "moderate" | "intense" | "custom";
export type Climate = "cold" | "temperate" | "hot" | "hot_humid";

const EXERCISE_SWEAT_ML_PER_HR: Record<Exclude<ExerciseIntensity, "custom">, number> = {
  none: 0,
  light: 300,
  moderate: 500,
  intense: 800,
};

const CLIMATE_MULTIPLIER: Record<Climate, number> = {
  cold: 0.95,
  temperate: 1.0,
  hot: 1.3,
  hot_humid: 1.4,
};

/**
 * fatcalc 6-step hydration formula (Part 1.10.1).
 * Conservative sex adjustment: +300 mL male (resolves Group B C9).
 */
export function dailyWaterIntakeL(args: {
  weight_kg: number;
  sex: Sex;
  exercise_intensity: ExerciseIntensity;
  exercise_hours: number;
  custom_sweat_rate_ml_per_hr?: number;
  climate: Climate;
  is_pregnant: boolean;
  is_breastfeeding: boolean;
}): {
  total_L: number;
  breakdown: {
    base_L: number;
    sex_adjustment_L: number;
    exercise_add_L: number;
    climate_multiplier: number;
    pregnancy_add_L: number;
    breastfeeding_add_L: number;
  };
} {
  const base_L = args.weight_kg * 0.03;
  const sex_adjustment_L = args.sex === "male" ? 0.3 : 0;
  const sweat_rate =
    args.exercise_intensity === "custom"
      ? args.custom_sweat_rate_ml_per_hr ?? 0
      : EXERCISE_SWEAT_ML_PER_HR[args.exercise_intensity];
  const exercise_add_L = (sweat_rate * args.exercise_hours) / 1000;
  const climate_multiplier = CLIMATE_MULTIPLIER[args.climate];
  const pregnancy_add_L = args.is_pregnant ? 0.3 : 0;
  const breastfeeding_add_L = args.is_breastfeeding ? 0.7 : 0;

  const subtotal_L =
    (base_L + sex_adjustment_L) * climate_multiplier + exercise_add_L;
  const total_L = subtotal_L + pregnancy_add_L + breastfeeding_add_L;

  return {
    total_L,
    breakdown: {
      base_L,
      sex_adjustment_L,
      exercise_add_L,
      climate_multiplier,
      pregnancy_add_L,
      breastfeeding_add_L,
    },
  };
}

// ===========================================================================
// 1.11 Full assessment pipeline
// ===========================================================================

/**
 * Population exclusions (Part 0.4).
 * Returns true (with reasons) if user is in an excluded population.
 */
export function checkPopulationExclusions(user: User): {
  excluded: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  if (user.age_years < 18) {
    reasons.push("Under 18: pediatric formulas (IOM DLW EER) required, not Mifflin.");
  }
  if (user.is_pregnant) reasons.push("Pregnant: do not generate cut/bulk plans without clinician.");
  if (user.is_breastfeeding) reasons.push("Breastfeeding: do not generate aggressive deficit plans.");
  if (user.has_eating_disorder_history) {
    reasons.push("History of eating disorder: do not surface macro/calorie tracking without clinician.");
  }
  if (user.has_kidney_disease) {
    reasons.push("Kidney disease: high-protein plans contraindicated; consult clinician.");
  }
  return { excluded: reasons.length > 0, reasons };
}

/**
 * Run the full Assessment pipeline (Part 1.11) for a user.
 * Computes body composition (if data available), anthropometric indices,
 * IBW, RMR, TDEE, Alpert ceiling, FFMI, Berkhan max, and hydration.
 *
 * This is the canonical entry point used by the rest of the engine.
 */
export function runAssessment(user: User): AssessmentResult {
  const exclusions = checkPopulationExclusions(user);

  // Body composition
  let body_fat_pct: number | undefined;
  let body_fat_method: string;
  let fat_mass_kg: number | undefined;
  let lean_body_mass_kg: number | undefined;

  if (user.body_fat_pct !== undefined) {
    body_fat_pct = clampBfPct(user.sex, user.body_fat_pct);
    body_fat_method = user.body_fat_method ?? "manual";
    fat_mass_kg = user.weight_kg * (body_fat_pct / 100);
    lean_body_mass_kg = leanBodyMass(user.weight_kg, body_fat_pct);
  } else if (
    user.body_fat_method === "navy" &&
    user.waist_cm &&
    user.neck_cm &&
    user.height_cm
  ) {
    body_fat_pct = clampBfPct(
      user.sex,
      usNavyBfPct(user.sex, user.height_cm, user.neck_cm, user.waist_cm, user.hip_cm),
    );
    body_fat_method = "navy";
    fat_mass_kg = user.weight_kg * (body_fat_pct / 100);
    lean_body_mass_kg = leanBodyMass(user.weight_kg, body_fat_pct);
  } else {
    // Fall back to CUN-BAE (BMI-based) so we always have a number.
    const bmi_val = bmi(user.weight_kg, user.height_cm);
    body_fat_pct = clampBfPct(user.sex, cunBaeBfPct(user.sex, user.age_years, bmi_val));
    body_fat_method = "cun_bae";
    fat_mass_kg = user.weight_kg * (body_fat_pct / 100);
    lean_body_mass_kg = leanBodyMass(user.weight_kg, body_fat_pct);
  }

  const bmi_val = bmi(user.weight_kg, user.height_cm);
  const bmi_cat = bmiCategory(bmi_val);

  // WHtR
  let whtr_val: number | undefined;
  let whtr_cat: string | undefined;
  if (user.waist_cm && user.height_cm) {
    whtr_val = whtr(user.waist_cm, user.height_cm);
    whtr_cat = whtrCategory(user.sex, whtr_val);
  }

  // WHR
  let whr_val: number | undefined;
  let whr_cat: string | undefined;
  if (user.waist_cm && user.hip_cm) {
    whr_val = whr(user.waist_cm, user.hip_cm);
    whr_cat = whrCategory(user.sex, whr_val);
  }

  // ABSI (z-score requires NHANES lookup tables — left undefined here)
  let absi_val: number | undefined;
  if (user.waist_cm) {
    absi_val = absi(user.waist_cm, user.weight_kg, user.height_cm);
  }

  // IBW
  const ibw = idealBodyWeight(user.sex, user.height_cm);
  const bmi_range = bmiHealthyRange(user.height_cm);

  // RMR (Mifflin-St Jeor + RippedBody adjustments — canonical default)
  const { bmr_kcal, tdee_kcal, activity_factor } = tdeeFromMifflinAndSaf(user);

  // Alpert + cap
  const alpert_deficit =
    body_fat_pct !== undefined
      ? alpertMaxDailyDeficitKcal(user.weight_kg, body_fat_pct)
      : undefined;
  const weekly_cap = effectiveWeeklyLossCapLb(
    user.weight_kg,
    body_fat_pct,
  );

  // FFMI
  let ffmi_val: { ffmi: number; normalized_ffmi: number } | undefined;
  if (body_fat_pct !== undefined) {
    ffmi_val = ffmi(user.weight_kg, body_fat_pct, user.height_cm);
  }

  // Berkhan max
  const berkhan_max = berkhanMaxStageShreddedKg(user.sex, user.height_cm);

  // Hydration (defaults: temperate climate, no exercise, no pregnancy add)
  const hydration = dailyWaterIntakeL({
    weight_kg: user.weight_kg,
    sex: user.sex,
    exercise_intensity: "none",
    exercise_hours: 0,
    climate: "temperate",
    is_pregnant: user.is_pregnant,
    is_breastfeeding: user.is_breastfeeding,
  });

  return {
    user_id: user.id,
    timestamp: new Date().toISOString(),
    body_fat_pct,
    body_fat_method,
    body_fat_confidence_band: {
      plus_minus_pct:
        BF_METHOD_ACCURACY[user.body_fat_method ?? "cun_bae"]?.plus_minus_pct ?? 4.5,
    },
    fat_mass_kg,
    lean_body_mass_kg,
    bmi: bmi_val,
    bmi_category: bmi_cat,
    whtr: whtr_val,
    whtr_category: whtr_cat,
    whr: whr_val,
    whr_category: whr_cat,
    absi: absi_val,
    ibw_devine_kg: ibw.devine_kg,
    ibw_robinson_kg: ibw.robinson_kg,
    ibw_miller_kg: ibw.miller_kg,
    ibw_hamwi_kg: ibw.hamwi_kg,
    bmi_healthy_weight_range_kg: bmi_range,
    bmr_kcal,
    bmr_formula: "mifflin_st_jeor",
    tdee_kcal,
    tdee_method: "mifflin_x_saf",
    activity_factor,
    max_daily_deficit_kcal: alpert_deficit,
    max_weekly_fat_loss_lbs:
      alpert_deficit !== undefined ? (alpert_deficit * 7) / KCAL_PER_LB_FAT : undefined,
    effective_weekly_loss_cap_lbs: weekly_cap,
    ffmi: ffmi_val?.ffmi,
    normalized_ffmi: ffmi_val?.normalized_ffmi,
    berkhan_max_stage_shredded_kg: berkhan_max,
    daily_water_intake_L: hydration.total_L,
    hydration_breakdown: hydration.breakdown,
    population_excluded: exclusions.excluded,
    exclusion_reasons: exclusions.reasons,
  };
}

// ===========================================================================
// Factory: create engine User from OnboardingInput + EngineProfile
// ===========================================================================

/**
 * EngineProfile — optional fields captured post-onboarding that make the
 * engine's formulas more accurate (body-fat %, circumferences, training
 * status, etc.).
 */
export interface EngineProfile {
  sex?: Sex;
  all_time_high_weight_kg?: number;
  is_currently_in_deficit?: boolean;
  body_fat_pct?: number;
  body_fat_method?: BodyFatMethod;
  waist_cm?: number;
  hip_cm?: number;
  neck_cm?: number;
  training_status?: TrainingStatus;
  activity_level?: ActivityLevel;
  sleep_hours_avg?: number;
  stress_0_5?: number;
}

function mapGoal(goal: OnboardingGoal): PrimaryGoal {
  switch (goal) {
    case "weight-loss": return "cut";
    case "muscle-gain":
    case "strength": return "bulk";
    default: return "maintain";
  }
}

function mapActivityLevel(level: OnboardingActivityLevel): ActivityLevel {
  switch (level) {
    case "sedentary": return "sedentary";
    case "light": return "light";
    case "moderate": return "moderate";
    case "active": return "very_active";
    default: return "sedentary";
  }
}

function mapDietType(diet: OnboardingDietType): DietType {
  switch (diet) {
    case "anything": return "standard";
    case "vegetarian": return "vegetarian";
    case "vegan": return "vegan";
    case "keto": return "keto";
    case "low-carb": return "low_carb";
    case "gluten-free": return "gluten_free";
    case "mediterranean": return "mediterranean";
    default: return "standard";
  }
}

function mapSex(gender: string): Sex {
  const lower = gender.toLowerCase();
  if (lower.startsWith("f") || lower.includes("woman") || lower.includes("female")) {
    return "female";
  }
  return "male";
}

function inferTrainingStatus(frequency: number, goal: OnboardingGoal): TrainingStatus {
  if (goal === "strength" || goal === "muscle-gain") {
    if (frequency >= 5) return "intermediate";
    if (frequency >= 3) return "novice";
    return "beginner";
  }
  if (frequency >= 4) return "novice";
  return "beginner";
}

/**
 * Create an engine User from onboarding form data + optional engine profile.
 *
 * This is the canonical factory — not a shim or adapter. The OnboardingInput
 * captures what the form collects; the EngineProfile captures the additional
 * fields that make the engine more accurate. Together they produce a complete
 * engine User.
 */
export function createUserFromOnboarding(
  input: OnboardingInput,
  profile?: EngineProfile,
): User {
  const sex = profile?.sex ?? mapSex(input.gender);
  const goal = mapGoal(input.goal);
  const activity_level = profile?.activity_level ?? mapActivityLevel(input.activityLevel);
  const training_status = profile?.training_status ?? inferTrainingStatus(input.frequency, input.goal);
  const all_time_high = profile?.all_time_high_weight_kg;
  const is_weight_reduced = all_time_high !== undefined
    ? input.weight < all_time_high * 0.9
    : false;

  return {
    id: `user_${input.name.replace(/\s+/g, "_").toLowerCase()}_${input.age}`,
    sex,
    age_years: input.age,
    height_cm: input.height,
    weight_kg: input.weight,
    all_time_high_weight_kg: all_time_high,
    unit_system: "metric",
    is_pregnant: false,
    is_breastfeeding: false,
    has_eating_disorder_history: false,
    has_kidney_disease: false,
    body_fat_pct: profile?.body_fat_pct,
    body_fat_method: profile?.body_fat_method,
    waist_cm: profile?.waist_cm,
    hip_cm: profile?.hip_cm,
    neck_cm: profile?.neck_cm,
    activity_level,
    training_days_per_week: input.frequency,
    training_status,
    primary_goal: goal,
    diet_type: mapDietType(input.dietType),
    is_currently_in_deficit: profile?.is_currently_in_deficit ?? (goal === "cut"),
    is_weight_reduced,
    sleep_hours_avg: profile?.sleep_hours_avg,
    stress_0_5: profile?.stress_0_5,
  };
}
