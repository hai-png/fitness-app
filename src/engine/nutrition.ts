/**
 * Nutrition Engine — Part 3 of the Unified Reference Guide.
 *
 * Implements:
 *   3.1  Nutrition Pyramid enforcement (lower layers > upper layers)
 *   3.2  Diet maturity model (lifestyle wins → calorie → macro → +micro+timing)
 *   3.3  Calorie calculation (TDEE ± deficit/surplus + floor)
 *   3.4  Cut/Bulk/Recomp decisioning (RippedBody + MacroFactor unified)
 *   3.5  Cutting (deficit sizing, 5-tier rate table, Alpert/2-lb cap, adjustments)
 *   3.6  Bulking (4-category rate table, NEAT-buffered surplus, 75:25 split)
 *   3.7  Recomp (McDonald table, Murphy & Koehler <500 kcal threshold)
 *   3.8  Reverse dieting (3-tier protocol + 0.5% BW guardrail)
 *   3.9  Macro setting recipe (5-step protein-first)
 *   3.10 Macro ratio discussion (RippedBody anti-ratio position)
 *   3.11 Micronutrients (fiber, fruit/veg, supplements)
 *   3.13 Keto decisioning (N=1 test protocol)
 *   3.14 Vegan considerations
 *   3.16 buildNutritionPlan() — composes everything into NutritionPlan
 *
 * All functions are pure. No IO. No side effects. Unit-testable.
 */

import type {
  AssessmentResult,
  DietType,
  NutritionPhase,
  NutritionPlan,
  Sex,
  SupplementEntry,
  TrainingStatus,
  User,
  DailyWeightLog,
} from "./schemas";
import {
  CALORIE_FLOOR,
  enforceCalorieFloor,
  effectiveWeeklyLossCapLb,
} from "./assessment";

// ===========================================================================
// 3.4 Cut/Bulk/Recomp decisioning
// ===========================================================================

export type DecisionFocus = "physique" | "health" | "auto";

export interface GoalRecommendation {
  goal: NutritionPhase;
  reason: string;
  physique_action_threshold_bf_pct: number; // men 20 / women 28
  health_action_threshold_bf_pct: number; // men 25 / women 35
}

/**
 * Unified cut/bulk/recomp decision algorithm (Part 3.4.4).
 * Resolves Group E C1 (RippedBody 10-20% vs MacroFactor 25%) and
 * Group E C2 ("leaner builds muscle faster" — debunked, do NOT multiply
 * muscle-gain rate by BF% factor).
 */
export function recommendGoal(args: {
  bf_pct: number;
  sex: Sex;
  training_status: TrainingStatus;
  user_preference?: NutritionPhase;
  focus?: DecisionFocus;
}): GoalRecommendation {
  const { bf_pct, sex, training_status, user_preference, focus = "auto" } = args;
  const offset = sex === "female" ? 8 : 0;
  const bf_adj = bf_pct - offset; // normalize to "male-equivalent"

  const physique_action_threshold_bf_pct = sex === "male" ? 20 : 28;
  const health_action_threshold_bf_pct = sex === "male" ? 25 : 35;

  // Health action threshold fires regardless of focus.
  if (bf_pct > health_action_threshold_bf_pct) {
    return {
      goal: "cut",
      reason: `BF% above health action threshold (${health_action_threshold_bf_pct}%). Cut for health reasons.`,
      physique_action_threshold_bf_pct,
      health_action_threshold_bf_pct,
    };
  }

  if (focus === "health" || (focus === "auto" && bf_adj > 16)) {
    return {
      goal: "cut",
      reason: "Health focus or auto + bf_adj > 16 → cut.",
      physique_action_threshold_bf_pct,
      health_action_threshold_bf_pct,
    };
  }

  // Physique cycle (RippedBody).
  if (bf_adj > 20) {
    return {
      goal: "cut",
      reason: "Above physique cycle upper boundary (20% male-equivalent). Cut.",
      physique_action_threshold_bf_pct,
      health_action_threshold_bf_pct,
    };
  }
  if (bf_adj < 9) {
    return {
      goal: "bulk",
      reason: "Below physique cycle lower boundary (9% male-equivalent). Bulk.",
      physique_action_threshold_bf_pct,
      health_action_threshold_bf_pct,
    };
  }
  if (
    (training_status === "beginner" || training_status === "novice") &&
    bf_adj >= 13 &&
    bf_adj <= 18
  ) {
    return {
      goal: "recomp",
      reason: "Beginner/novice in 13-18% BF recomp window.",
      physique_action_threshold_bf_pct,
      health_action_threshold_bf_pct,
    };
  }
  if (
    (training_status === "intermediate" ||
      training_status === "advanced" ||
      training_status === "elite") &&
    bf_adj > 16
  ) {
    return {
      goal: "cut",
      reason: "Experienced trainee above 16% BF → cut.",
      physique_action_threshold_bf_pct,
      health_action_threshold_bf_pct,
    };
  }

  // Middle range, no forced decision → defer to preference.
  if (user_preference === "cut") {
    return {
      goal: "cut",
      reason: "User preference: cut.",
      physique_action_threshold_bf_pct,
      health_action_threshold_bf_pct,
    };
  }
  if (user_preference === "bulk") {
    return {
      goal: "bulk",
      reason: "User preference: bulk.",
      physique_action_threshold_bf_pct,
      health_action_threshold_bf_pct,
    };
  }
  return {
    goal: "maintain",
    reason: "No forced decision; defaulting to maintain (MacroFactor default for unsure users).",
    physique_action_threshold_bf_pct,
    health_action_threshold_bf_pct,
  };
}

// ===========================================================================
// 3.5 Cutting
// ===========================================================================

export type CutRateLabel =
  | "very_conservative"
  | "conservative"
  | "moderate"
  | "slightly_aggressive"
  | "aggressive";

export interface CutRateTier {
  label: CutRateLabel;
  pct_body_weight_per_week: number;
  relative_deficit_pct: string;
}

/**
 * MacroFactor 5-tier rate table (Part 3.5.2).
 */
export const CUT_RATE_TIERS: CutRateTier[] = [
  { label: "very_conservative", pct_body_weight_per_week: 0.1, relative_deficit_pct: "<5% of TDEE" },
  { label: "conservative", pct_body_weight_per_week: 0.25, relative_deficit_pct: "5-10%" },
  { label: "moderate", pct_body_weight_per_week: 0.625, relative_deficit_pct: "10-20%" },
  { label: "slightly_aggressive", pct_body_weight_per_week: 1.0, relative_deficit_pct: "20-30%" },
  { label: "aggressive", pct_body_weight_per_week: 1.5, relative_deficit_pct: ">30%" },
];

/** Sweet spot for fat loss + FFM retention (Part 3.5.1): 0.6-0.7 % BW/week. */
export const CUT_SWEET_SPOT_PCT = { low: 0.6, high: 0.7 };

/**
 * Cut adjustment formula (Part 3.5.6).
 *   delta_kcal/day = (actual_lb_per_week - target_lb_per_week) × 500
 * Negative delta → reduce intake. Positive → add intake.
 */
export function cutAdjustmentDeltaKcal(
  actual_rate_lb_per_week: number,
  target_rate_lb_per_week: number,
): number {
  return (actual_rate_lb_per_week - target_rate_lb_per_week) * 500;
}

/**
 * Cut troubleshooting checklist (Part 3.5.7) — calorie reduction is LAST.
 * Returns the ordered list of investigation steps plus the user-input gates.
 */
export const CUT_TROUBLESHOOTING_STEPS = [
  "Has diet adherence been consistent over the last 4 weeks? (Need to track food to fairly judge.)",
  "Are hunger pangs the problem? → Swap liquid→whole food; cut sugary foods; more fruit/veg/salads/soups; consider lowering meal frequency.",
  "Is the food environment sabotaging you? → Remove temptations; plan shopping.",
  "Have you revisited your 'why' (motivation)?",
  "Stress management? (Stress = silent killer of muscle; water retention masks fat loss.)",
  "Sleep quality? (Chronic tiredness → fix sleep first.)",
  "Has activity/step count dropped? (Track steps; set minimum, e.g. 5000/day.)",
  "Consider adding cardio (only after the above). Weekly cardio time < half weekly lifting time.",
  "LAST resort: make a calorie reduction. Option 1: re-run TDEE calc. Option 2: drop 5-8% / 100-200 kcal.",
] as const;

// ===========================================================================
// 3.6 Bulking
// ===========================================================================

export type BulkMethod = "relaxed" | "lean" | "controlled_slow";

/**
 * Updated 4-category bulking rate table (Part 3.6.2 — supersedes Source 5).
 * Resolves Group E C3.
 */
export const BULK_RATE_TABLE: Record<
  TrainingStatus,
  { pct_body_weight_per_month: number; method_recommendation: BulkMethod }
> = {
  beginner: { pct_body_weight_per_month: 2.0, method_recommendation: "controlled_slow" },
  novice: { pct_body_weight_per_month: 1.5, method_recommendation: "controlled_slow" },
  intermediate: { pct_body_weight_per_month: 1.0, method_recommendation: "controlled_slow" },
  advanced: { pct_body_weight_per_month: 0.5, method_recommendation: "controlled_slow" },
  elite: { pct_body_weight_per_month: 0.5, method_recommendation: "controlled_slow" },
};

/** Practical floor: 1.5 lb/month. */
export const BULK_FLOOR_LB_PER_MONTH = 1.5;

/**
 * Surplus math (Part 3.6.3) — with +50% NEAT buffer.
 *   daily_surplus_kcal = monthly_gain_target_lb × 150
 */
export function bulkDailySurplusKcal(monthly_gain_target_lb: number): number {
  return monthly_gain_target_lb * 150;
}

/**
 * Cut → bulk transition surplus (Part 3.6.3).
 *   daily_surplus_increase = (weekly_loss_rate_lb × 500) + (monthly_gain_target_lb × 150)
 */
export function cutToBulkTransitionKcal(
  weekly_loss_rate_lb: number,
  monthly_gain_target_lb: number,
): number {
  return weekly_loss_rate_lb * 500 + monthly_gain_target_lb * 150;
}

/**
 * Bulk adjustment formula (Part 3.6.8).
 *   delta_kcal/day = (target_lb_per_month - actual_lb_per_month) × 150
 * Positive delta → add calories (gaining too slow). Negative → reduce.
 */
export function bulkAdjustmentDeltaKcal(
  target_lb_per_month: number,
  actual_lb_per_month: number,
): number {
  return (target_lb_per_month - actual_lb_per_month) * 150;
}

/** Bulk macro split (Part 3.6.5): 75:25 carbs:fats by kcal. */
export const BULK_SURPLUS_SPLIT = { carbs_pct: 0.75, fat_pct: 0.25 };

// ===========================================================================
// 3.7 Recomp
// ===========================================================================

/**
 * McDonald monthly muscle-gain table (Part 3.7.1).
 * Women = ~50% of men.
 */
export const MCDONALD_MUSCLE_GAIN_KG: Record<
  TrainingStatus,
  { male: [number, number]; female: [number, number] }
> = {
  beginner: { male: [0.7, 1.0], female: [0.35, 0.5] },
  novice: { male: [0.7, 1.0], female: [0.35, 0.5] },
  intermediate: { male: [0.45, 0.7], female: [0.22, 0.35] },
  advanced: { male: [0.2, 0.45], female: [0.1, 0.22] },
  elite: { male: [0.0, 0.2], female: [0.0, 0.1] },
};

/**
 * Recomp potential buckets by BF% (Part 3.7.2).
 */
export function recompPotential(
  sex: Sex,
  bf_pct: number,
): "excellent" | "good" | "limited" {
  if (sex === "male") {
    if (bf_pct > 25) return "excellent";
    if (bf_pct >= 15) return "good";
    return "limited";
  }
  if (bf_pct > 35) return "excellent";
  if (bf_pct >= 25) return "good";
  return "limited";
}

/**
 * Recomp calorie target (Part 3.7.3).
 * Murphy & Koehler 2021 (Part 3.7.4): deficits <500 kcal/day allow recomp.
 */
export function recompCalorieTarget(
  tdee_kcal: number,
  potential: "excellent" | "good" | "limited",
): { target_kcal: number; deficit_kcal: number } | null {
  if (potential === "limited") return null; // Skip recomp; do traditional bulk/cut.
  const deficit_pct = potential === "excellent" ? 0.15 : 0.05;
  const deficit_kcal = Math.min(tdee_kcal * deficit_pct, 500); // Hard cap <500 kcal
  return { target_kcal: tdee_kcal - deficit_kcal, deficit_kcal };
}

// ===========================================================================
// 3.8 Reverse dieting
// ===========================================================================

export type ReverseDietTier = "conservative" | "moderate" | "aggressive";

export const REVERSE_DIET_TIERS: Record<
  ReverseDietTier,
  { weekly_increment_kcal: number; typical_duration_weeks: [number, number]; best_for: string }
> = {
  conservative: {
    weekly_increment_kcal: 50,
    typical_duration_weeks: [12, 20],
    best_for: "Coming off 16+ week diets; easy gainers; minimal fat gain priority",
  },
  moderate: {
    weekly_increment_kcal: 100,
    typical_duration_weeks: [6, 10],
    best_for: "Most people after standard 8-16 week diets",
  },
  aggressive: {
    weekly_increment_kcal: 150,
    typical_duration_weeks: [4, 7],
    best_for: "High metabolisms; athletes needing fast return; shorter diets",
  },
};

/** Reverse diet schedule math (Part 3.8.2). */
export function reverseDietSchedule(args: {
  current_calories: number;
  maintenance_calories: number;
  tier: ReverseDietTier;
}): { weeks_to_maintenance: number; weekly_calories: number[] } {
  const inc = REVERSE_DIET_TIERS[args.tier].weekly_increment_kcal;
  const gap = args.maintenance_calories - args.current_calories;
  const weeks = Math.max(1, Math.ceil(gap / inc));
  const schedule: number[] = [];
  for (let w = 0; w <= weeks; w++) {
    schedule.push(args.current_calories + w * inc);
  }
  return { weeks_to_maintenance: weeks, weekly_calories: schedule };
}

/** Reverse diet weight-gain guardrail (Part 3.8.3): >0.5% BW/week → slow down. */
export const REVERSE_DIET_GUARDRAIL_PCT = 0.005;

// ===========================================================================
// 3.9 Macro setting recipe (5-step, protein-first)
// ===========================================================================

export interface MacroTargets {
  protein_g: number;
  fat_g: number;
  carb_g: number;
  protein_basis: "bodyweight" | "lbm" | "target_bw" | "cm_height";
  protein_rate_g_per_lb: number;
  fat_pct_of_calories: number;
  fat_floor_g: number;
  macro_pct_calories: { protein: number; fat: number; carbs: number };
}

/**
 * Compute protein target in g/lb (Part 3.9 Step 2).
 */
export function proteinRateGPerLb(args: {
  phase: NutritionPhase;
  diet_type?: DietType;
  age_years: number;
  is_obese: boolean; // BMI >= 30
  is_pregnant_or_lactating: boolean;
}): { rate_g_per_lb: number; basis: "bodyweight" | "cm_height"; note?: string } {
  // Obese: use 1 g per cm of height to avoid overshooting on total BW.
  if (args.is_obese) {
    return {
      rate_g_per_lb: 0,
      basis: "cm_height",
      note: "Obese user: protein set to 1 g per cm of height (avoid overshooting on total body weight).",
    };
  }

  let rate: number;
  switch (args.phase) {
    case "cut":
      rate = args.diet_type === "vegan" ? 1.2 : 1.1; // midpoint of 1.0-1.2 (1.2 high end for vegan)
      break;
    case "bulk":
    case "maintain":
      rate = args.diet_type === "vegan" ? 1.0 : 0.85; // midpoint of 0.7-1.0
      break;
    case "recomp":
      rate = 0.95; // midpoint of 0.8-1.1
      break;
    case "reverse_diet":
      rate = 0.85;
      break;
    default:
      rate = 0.85;
  }

  // Age > 65 floor: 1.0-1.2 g/kg ≈ 0.45-0.55 g/lb MINIMUM for anabolic resistance.
  // Convert to g/lb floor: 1.0 g/kg ≈ 0.45 g/lb. Apply as floor on the rate.
  if (args.age_years > 65) {
    rate = Math.max(rate, 0.55);
  }

  return { rate_g_per_lb: rate, basis: "bodyweight" };
}

/**
 * Compute protein grams from rate + body weight (or alternative basis).
 */
export function proteinGrams(args: {
  rate_g_per_lb: number;
  basis: "bodyweight" | "lbm" | "target_bw" | "cm_height";
  weight_kg: number;
  lean_body_mass_kg?: number;
  target_weight_kg?: number;
  height_cm?: number;
  age_years: number;
  is_pregnant_or_lactating: boolean;
}): number {
  let g: number;
  const lb = args.weight_kg * 2.2046226218;
  switch (args.basis) {
    case "lbm":
      if (args.lean_body_mass_kg === undefined) {
        throw new Error("proteinGrams: lean_body_mass_kg required for lbm basis");
      }
      g = args.lean_body_mass_kg * 2.2046226218 * args.rate_g_per_lb;
      break;
    case "target_bw":
      if (args.target_weight_kg === undefined) {
        throw new Error("proteinGrams: target_weight_kg required for target_bw basis");
      }
      g = args.target_weight_kg * 2.2046226218 * args.rate_g_per_lb;
      break;
    case "cm_height":
      // Obese: 1 g per cm of height.
      if (args.height_cm === undefined) {
        throw new Error("proteinGrams: height_cm required for cm_height basis");
      }
      g = args.height_cm * 1.0;
      break;
    case "bodyweight":
    default:
      g = lb * args.rate_g_per_lb;
  }

  // Pregnancy / lactation: +25 g/day absolute.
  if (args.is_pregnant_or_lactating) g += 25;

  return g;
}

/**
 * Compute fat target (Part 3.9 Step 3).
 */
export function fatGrams(args: {
  target_calories_kcal: number;
  phase: NutritionPhase;
  diet_type?: DietType;
  weight_kg: number;
}): { fat_g: number; fat_pct: number; floor_g: number } {
  // Floor: max(0.5 g/kg BW, 40 g/day) — Part 3.9 Step 3.
  const floor_g = Math.max(args.weight_kg * 0.5, 40);

  let pct: number;
  if (args.diet_type === "vegan") {
    pct = 0.2; // 15-25% midpoint
  } else if (args.phase === "cut") {
    pct = 0.2; // 15-25% midpoint
  } else {
    pct = 0.25; // 20-30% midpoint
  }

  let fat_g = (args.target_calories_kcal * pct) / 9;
  fat_g = Math.max(fat_g, floor_g);
  // Recompute actual % after floor applied
  const actual_pct = (fat_g * 9) / args.target_calories_kcal;
  return { fat_g, fat_pct: actual_pct, floor_g };
}

/**
 * Round macro to nearest 5 g (Part 3.9 Step 5).
 */
export function roundMacro5(g: number): number {
  return Math.round(g / 5) * 5;
}

/**
 * Compute the full macro target set (Part 3.9 — full 5-step recipe).
 *
 * Step 1: calories (already computed by caller — passed in)
 * Step 2: protein (g/lb basis; vegan bumped to high end; obese uses cm-height; >65 floor)
 * Step 3: fat (% of calories, with absolute floor)
 * Step 4: carbs = residual
 * Step 5: round to nearest 5 g
 */
export function computeMacros(args: {
  target_calories_kcal: number;
  weight_kg: number;
  lean_body_mass_kg?: number;
  target_weight_kg?: number;
  height_cm: number;
  age_years: number;
  sex: Sex;
  phase: NutritionPhase;
  diet_type?: DietType;
  is_obese: boolean;
  is_pregnant_or_lactating: boolean;
}): MacroTargets {
  const is_pregnant_or_lactating = args.is_pregnant_or_lactating;
  const rateResult = proteinRateGPerLb({
    phase: args.phase,
    diet_type: args.diet_type,
    age_years: args.age_years,
    is_obese: args.is_obese,
    is_pregnant_or_lactating,
  });

  const protein_g_raw = proteinGrams({
    rate_g_per_lb: rateResult.rate_g_per_lb,
    basis: rateResult.basis,
    weight_kg: args.weight_kg,
    lean_body_mass_kg: args.lean_body_mass_kg,
    target_weight_kg: args.target_weight_kg,
    height_cm: args.height_cm,
    age_years: args.age_years,
    is_pregnant_or_lactating,
  });

  const fat_result = fatGrams({
    target_calories_kcal: args.target_calories_kcal,
    phase: args.phase,
    diet_type: args.diet_type,
    weight_kg: args.weight_kg,
  });

  // Step 4: carbs residual.
  const carb_g_raw =
    (args.target_calories_kcal - protein_g_raw * 4 - fat_result.fat_g * 9) / 4;

  // Step 5: round to nearest 5 g.
  const protein_g = roundMacro5(protein_g_raw);
  const fat_g = roundMacro5(fat_result.fat_g);
  const carb_g = roundMacro5(Math.max(0, carb_g_raw));

  // Derived display: % of calories.
  const total_kcal = protein_g * 4 + fat_g * 9 + carb_g * 4;
  const macro_pct_calories = {
    protein: (protein_g * 4) / total_kcal,
    fat: (fat_g * 9) / total_kcal,
    carbs: (carb_g * 4) / total_kcal,
  };

  return {
    protein_g,
    fat_g,
    carb_g,
    protein_basis: rateResult.basis,
    protein_rate_g_per_lb: rateResult.rate_g_per_lb,
    fat_pct_of_calories: fat_result.fat_pct,
    fat_floor_g: fat_result.floor_g,
    macro_pct_calories,
  };
}

// ===========================================================================
// 3.11 Micronutrients
// ===========================================================================

/** Fiber target (Part 3.11.1): 14 g per 1000 kcal. */
export function fiberTargetG(target_calories_kcal: number): number {
  return Math.round(14 * (target_calories_kcal / 1000));
}

/** Fruit & vegetable cups per day (Part 3.11.2). */
export function fruitVegCups(
  target_calories_kcal: number,
): { fruit: number; veg: number } {
  if (target_calories_kcal < 2000) return { fruit: 2, veg: 2 };
  if (target_calories_kcal < 3000) return { fruit: 3, veg: 3 };
  return { fruit: 4, veg: 4 };
}

/**
 * Evidence-based supplement stack (Part 3.11.5).
 * Returns a base stack plus optional vegan additions (Part 3.14.2).
 */
export function supplementStack(args: {
  diet_type?: DietType;
  sex: Sex;
}): SupplementEntry[] {
  const base: SupplementEntry[] = [
    { name: "Creatine monohydrate", daily_dose: "5 g", rationale: "Most-studied ergogenic aid; boosts phosphocreatine; cognitive benefit." },
    { name: "Vitamin D3", daily_dose: "1000-3000 IU", rationale: "Common deficiency; bone health, hormones." },
    { name: "Omega-3 EPA+DHA", daily_dose: "1-2 g", rationale: "Cardiovascular; anti-inflammatory." },
  ];

  if (args.diet_type === "vegan") {
    base.push(
      { name: "Vitamin B12", daily_dose: "2.4-6 μg", rationale: "~50% of vegans deficient; anemia + irreversible nervous system degeneration." },
      { name: "Iron", daily_dose: args.sex === "female" ? "33 mg" : "14 mg", rationale: "Lack of red meat." },
      { name: "Zinc", daily_dose: args.sex === "female" ? "12 mg" : "16.5 mg", rationale: "Poor absorption from plants." },
      { name: "Calcium", daily_dose: "500-1000 mg", rationale: "Poorer absorption on vegan diet." },
    );
  }

  return base;
}

// ===========================================================================
// 3.13 Keto decisioning
// ===========================================================================

export interface KetoDecisionInput {
  has_pcos: boolean;
  has_oligomenorrhea: boolean;
  family_history_diabetes: boolean;
  is_advanced_age: boolean;
  is_sedentary_with_obesity: boolean;
  is_resistance_trained: boolean;
}

/**
 * Keto decisioning (Part 3.13).
 * Returns: 'higher_fat_trial' | 'default_high_carb' | 'keto_possible'.
 */
export function ketoDecision(input: KetoDecisionInput): {
  recommendation: "higher_fat_trial" | "default_high_carb" | "keto_possible";
  reason: string;
} {
  // Insulin-resistance indicators → consider higher-fat.
  if (
    input.has_pcos ||
    input.has_oligomenorrhea ||
    input.family_history_diabetes ||
    input.is_advanced_age
  ) {
    return {
      recommendation: "higher_fat_trial",
      reason: "Insulin-resistance indicator present. Consider N=1 4-month test: 40% fat vs 20% fat arms.",
    };
  }
  // Sedentary + obese but no IR flag → fix lifestyle first.
  if (input.is_sedentary_with_obesity) {
    return {
      recommendation: "default_high_carb",
      reason: "Insulin resistance likely transient; fix lifestyle first (default high-carb).",
    };
  }
  // Resistance-trained athletes: "potential pros typically not worth the cons."
  if (input.is_resistance_trained) {
    return {
      recommendation: "default_high_carb",
      reason: "Resistance-trained athletes: keto not worth the cons of low-carb.",
    };
  }
  return {
    recommendation: "keto_possible",
    reason: "No contraindications; keto may be trialed if user prefers.",
  };
}

// ===========================================================================
// 3.16 buildNutritionPlan
// ===========================================================================

/**
 * Compute initial-adjustment-eligible date (Part 3.5.5, 3.6.4).
 *   cut: +4 weeks (men), +4 weeks (women — same cycle phase)
 *   bulk: +6-7 weeks (use 7 = 49 days conservative)
 *   recomp: +8 weeks (no adjustment during recomp; switch to cut/bulk when progress stalls)
 *   maintain: +12 weeks (no adjustment expected)
 *   reverse_diet: +1 week (weekly increment)
 */
export function nextAdjustmentEligibleDate(
  phase: NutritionPhase,
  phase_start_date: string,
  sex: Sex,
): string {
  const start = new Date(phase_start_date);
  let days: number;
  switch (phase) {
    case "cut":
      days = 28; // 4 weeks
      break;
    case "bulk":
      days = 49; // 7 weeks
      break;
    case "recomp":
      days = 56; // 8 weeks
      break;
    case "reverse_diet":
      days = 7;
      break;
    case "maintain":
    default:
      days = 84;
  }
  // Female cut: still 4 weeks (one full menstrual cycle), but UI should compare same-phase weeks.
  void sex; // currently no sex-based extension; reserved for future cycle-aware logic.
  start.setDate(start.getDate() + days);
  return start.toISOString().slice(0, 10);
}

/**
 * Compute target calories for a given phase.
 * Applies Alpert cap and 2-lb/wk cap for cuts; floor for all phases.
 */
export function computeTargetCalories(args: {
  tdee_kcal: number;
  phase: NutritionPhase;
  sex: Sex;
  body_weight_kg: number;
  body_fat_pct?: number;
  target_rate_pct?: number; // % per week (cut) or % per month (bulk)
  training_status: TrainingStatus;
}): {
  target_calories_kcal: number;
  calorie_delta_kcal: number;
  target_rate_lb_per_period: number;
  alpert_max_deficit_kcal?: number;
  weekly_loss_cap_lb: number;
  calorie_floor_kcal: number;
} {
  const floor = CALORIE_FLOOR[args.sex];

  if (args.phase === "maintain") {
    const target = enforceCalorieFloor(args.sex, args.tdee_kcal);
    return {
      target_calories_kcal: target,
      calorie_delta_kcal: 0,
      target_rate_lb_per_period: 0,
      weekly_loss_cap_lb: 0,
      calorie_floor_kcal: floor,
    };
  }

  if (args.phase === "cut") {
    // Default target rate: 0.625% (sweet spot midpoint).
    const rate_pct = args.target_rate_pct ?? CUT_SWEET_SPOT_PCT.low + 0.025;
    const body_weight_lb = args.body_weight_kg * 2.2046226218;
    const target_rate_lb_per_week = (rate_pct / 100) * body_weight_lb;

    // Alpert cap (lb/week) → convert to kcal/day deficit.
    const weekly_cap_lb = effectiveWeeklyLossCapLb(args.body_weight_kg, args.body_fat_pct);
    const effective_rate_lb_per_week = Math.min(target_rate_lb_per_week, weekly_cap_lb);
    const deficit_kcal = effective_rate_lb_per_week * 500;

    const alpert_max =
      args.body_fat_pct !== undefined
        ? 22 * (body_weight_lb * (args.body_fat_pct / 100))
        : undefined;

    let target = args.tdee_kcal - deficit_kcal;
    target = enforceCalorieFloor(args.sex, target);

    return {
      target_calories_kcal: target,
      calorie_delta_kcal: target - args.tdee_kcal,
      target_rate_lb_per_period: effective_rate_lb_per_week,
      alpert_max_deficit_kcal: alpert_max,
      weekly_loss_cap_lb: weekly_cap_lb,
      calorie_floor_kcal: floor,
    };
  }

  if (args.phase === "bulk") {
    // Default: training-status-based rate from updated 4-category table.
    const rate_pct =
      args.target_rate_pct ?? BULK_RATE_TABLE[args.training_status].pct_body_weight_per_month;
    const body_weight_lb = args.body_weight_kg * 2.2046226218;
    const target_rate_lb_per_month = Math.max(
      BULK_FLOOR_LB_PER_MONTH,
      (rate_pct / 100) * body_weight_lb,
    );
    const surplus_kcal = bulkDailySurplusKcal(target_rate_lb_per_month);
    let target = args.tdee_kcal + surplus_kcal;
    target = enforceCalorieFloor(args.sex, target);

    return {
      target_calories_kcal: target,
      calorie_delta_kcal: target - args.tdee_kcal,
      target_rate_lb_per_period: target_rate_lb_per_month,
      weekly_loss_cap_lb: 0,
      calorie_floor_kcal: floor,
    };
  }

  if (args.phase === "recomp") {
    if (args.body_fat_pct === undefined) {
      // No BF% → cannot compute recomp potential; default to maintenance.
      const target = enforceCalorieFloor(args.sex, args.tdee_kcal);
      return {
        target_calories_kcal: target,
        calorie_delta_kcal: 0,
        target_rate_lb_per_period: 0,
        weekly_loss_cap_lb: 0,
        calorie_floor_kcal: floor,
      };
    }
    const potential = recompPotential(args.sex, args.body_fat_pct);
    const recomp_target = recompCalorieTarget(args.tdee_kcal, potential);
    const target = enforceCalorieFloor(
      args.sex,
      recomp_target?.target_kcal ?? args.tdee_kcal,
    );
    return {
      target_calories_kcal: target,
      calorie_delta_kcal: target - args.tdee_kcal,
      target_rate_lb_per_period: 0,
      weekly_loss_cap_lb: 0,
      calorie_floor_kcal: floor,
    };
  }

  // reverse_diet: starts at current calories; handled by reverse-diet scheduler.
  const target = enforceCalorieFloor(args.sex, args.tdee_kcal);
  return {
    target_calories_kcal: target,
    calorie_delta_kcal: 0,
    target_rate_lb_per_period: 0,
    weekly_loss_cap_lb: 0,
    calorie_floor_kcal: floor,
  };
}

/**
 * Compute initial macro tolerance (Part 3.9).
 * ±10% per macro, 90% of time. ±5% if sub-10% BF (men) / sub-18% (women).
 */
export function macroTolerancePct(sex: Sex, bf_pct?: number): number {
  if (bf_pct === undefined) return 0.1;
  const sub_10_threshold = sex === "male" ? 10 : 18;
  return bf_pct < sub_10_threshold ? 0.05 : 0.1;
}

/**
 * Build a complete NutritionPlan from a User + AssessmentResult.
 *
 * This is the canonical entry point used by the rest of the engine.
 */
export function buildNutritionPlan(args: {
  user: User;
  assessment: AssessmentResult;
  phase?: NutritionPhase; // override user.primary_goal if provided
  target_rate_pct?: number;
}): NutritionPlan {
  const user = args.user;
  const assessment = args.assessment;
  const phase = args.phase ?? user.primary_goal;
  const bf_pct = assessment.body_fat_pct;
  const bmi_val = assessment.bmi ?? 0;
  const is_obese = bmi_val >= 30;

  const calorie_result = computeTargetCalories({
    tdee_kcal: assessment.tdee_kcal,
    phase,
    sex: user.sex,
    body_weight_kg: user.weight_kg,
    body_fat_pct: bf_pct,
    target_rate_pct: args.target_rate_pct,
    training_status: user.training_status,
  });

  const macros = computeMacros({
    target_calories_kcal: calorie_result.target_calories_kcal,
    weight_kg: user.weight_kg,
    lean_body_mass_kg: assessment.lean_body_mass_kg,
    target_weight_kg: user.target_weight_kg,
    height_cm: user.height_cm,
    age_years: user.age_years,
    sex: user.sex,
    phase,
    diet_type: user.diet_type,
    is_obese,
    is_pregnant_or_lactating: user.is_pregnant || user.is_breastfeeding,
  });

  const fiber = fiberTargetG(calorie_result.target_calories_kcal);
  const cups = fruitVegCups(calorie_result.target_calories_kcal);
  const supplements = supplementStack({ diet_type: user.diet_type, sex: user.sex });

  const today = new Date().toISOString().slice(0, 10);
  const next_eligible = nextAdjustmentEligibleDate(phase, today, user.sex);

  return {
    user_id: user.id,
    plan_id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    created_at: new Date().toISOString(),
    version: 1,
    phase,
    phase_start_date: today,
    tdee_kcal: assessment.tdee_kcal,
    tdee_method: assessment.tdee_method,
    target_calories_kcal: calorie_result.target_calories_kcal,
    calorie_delta_kcal: calorie_result.calorie_delta_kcal,
    target_rate_pct: args.target_rate_pct ?? 0,
    target_rate_lb_per_period: calorie_result.target_rate_lb_per_period,
    alpert_max_deficit_kcal: calorie_result.alpert_max_deficit_kcal,
    weekly_loss_cap_lb: calorie_result.weekly_loss_cap_lb,
    calorie_floor_kcal: calorie_result.calorie_floor_kcal,
    protein_g: macros.protein_g,
    protein_basis: macros.protein_basis,
    protein_rate_g_per_lb: macros.protein_rate_g_per_lb,
    fat_g: macros.fat_g,
    fat_pct_of_calories: macros.fat_pct_of_calories,
    fat_floor_g: macros.fat_floor_g,
    carb_g: macros.carb_g,
    macro_pct_calories: macros.macro_pct_calories,
    fiber_target_g: fiber,
    fruit_cups_per_day: cups.fruit,
    veg_cups_per_day: cups.veg,
    supplements,
    last_adjustment_date: undefined,
    next_adjustment_eligible_date: next_eligible,
    adjustment_history: [],
    macro_tolerance_pct: macroTolerancePct(user.sex, bf_pct),
    tolerance_compliance_target_pct: 0.9,
  };
}

// ===========================================================================
// Adjustment application
// ===========================================================================

/**
 * Apply a macro adjustment (Part 3.5.6 / 3.6.8) to an existing plan.
 * For cuts: split reduction 1:1 to 2:1 carbs:fats by kcal.
 * For bulks: split addition 3:1 to 2:1 carbs:fats by kcal (75:25).
 * Protein held constant.
 */
export function applyMacroAdjustment(args: {
  plan: NutritionPlan;
  delta_kcal: number;
  reason: string;
  date?: string;
}): NutritionPlan {
  const date = args.date ?? new Date().toISOString().slice(0, 10);
  const new_target = args.plan.target_calories_kcal + args.delta_kcal;
  const floored = Math.max(new_target, args.plan.calorie_floor_kcal);
  const actual_delta = floored - args.plan.target_calories_kcal;

  let carbs_kcal_delta: number;
  let fat_kcal_delta: number;
  if (args.plan.phase === "cut") {
    // 1:1 to 2:1 carbs:fats → use 1.5:1 (midpoint).
    carbs_kcal_delta = actual_delta * (1.5 / 2.5);
    fat_kcal_delta = actual_delta * (1 / 2.5);
  } else if (args.plan.phase === "bulk") {
    // 3:1 to 2:1 → use 2.5:1 (midpoint).
    carbs_kcal_delta = actual_delta * (2.5 / 3.5);
    fat_kcal_delta = actual_delta * (1 / 3.5);
  } else {
    // Default: 50/50.
    carbs_kcal_delta = actual_delta * 0.5;
    fat_kcal_delta = actual_delta * 0.5;
  }

  const new_carb_g = roundMacro5(Math.max(0, args.plan.carb_g + carbs_kcal_delta / 4));
  const new_fat_g = roundMacro5(Math.max(args.plan.fat_floor_g, args.plan.fat_g + fat_kcal_delta / 9));

  const total_kcal = args.plan.protein_g * 4 + new_fat_g * 9 + new_carb_g * 4;
  const macro_pct = {
    protein: (args.plan.protein_g * 4) / total_kcal,
    fat: (new_fat_g * 9) / total_kcal,
    carbs: (new_carb_g * 4) / total_kcal,
  };

  const next_eligible = nextAdjustmentEligibleDate(args.plan.phase, date, "male"); // sex unused

  return {
    ...args.plan,
    target_calories_kcal: floored,
    calorie_delta_kcal: floored - args.plan.tdee_kcal,
    carb_g: new_carb_g,
    fat_g: new_fat_g,
    macro_pct_calories: macro_pct,
    last_adjustment_date: date,
    next_adjustment_eligible_date: next_eligible,
    adjustment_history: [
      ...args.plan.adjustment_history,
      { date, delta_kcal: actual_delta, reason: args.reason },
    ],
  };
}

/**
 * Compute the recommended cut/bulk adjustment from observed weight data.
 *
 * Returns null if not enough data or not yet eligible.
 */
export function recommendAdjustment(args: {
  plan: NutritionPlan;
  daily_weights: DailyWeightLog[];
  today_date?: string;
}): { eligible: boolean; delta_kcal: number; reason: string } | null {
  const today = args.today_date ?? new Date().toISOString().slice(0, 10);
  if (today < args.plan.next_adjustment_eligible_date) {
    return {
      eligible: false,
      delta_kcal: 0,
      reason: `Not yet eligible for adjustment. Next eligible: ${args.plan.next_adjustment_eligible_date}.`,
    };
  }

  const rate = (() => {
    // crude: take last 28 days of weights, compute weekly rate.
    if (args.daily_weights.length < 14) return null;
    const sorted = [...args.daily_weights].sort((a, b) => a.date.localeCompare(b.date));
    const recent = sorted.slice(-28);
    if (recent.length < 14) return null;
    const n = recent.length;
    const xs = recent.map((_, i) => i);
    const ys = recent.map((l) => l.weight_kg);
    const xMean = xs.reduce((s, x) => s + x, 0) / n;
    const yMean = ys.reduce((s, y) => s + y, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - xMean) * (ys[i] - yMean);
      den += (xs[i] - xMean) ** 2;
    }
    if (den === 0) return 0;
    return (num / den) * 7 * 2.2046226218; // kg/day → lb/week
  })();

  if (rate === null) {
    return { eligible: false, delta_kcal: 0, reason: "Insufficient weight data." };
  }

  if (args.plan.phase === "cut") {
    const target_rate = args.plan.target_rate_lb_per_period; // lb/week
    const delta = cutAdjustmentDeltaKcal(rate, target_rate);
    if (Math.abs(delta) < 50) {
      return { eligible: true, delta_kcal: 0, reason: "On target; no adjustment needed." };
    }
    return {
      eligible: true,
      delta_kcal: delta,
      reason: `Actual rate ${rate.toFixed(2)} lb/wk vs target ${target_rate.toFixed(2)} lb/wk → ${delta > 0 ? "add" : "reduce"} ${Math.abs(delta).toFixed(0)} kcal/day.`,
    };
  }

  if (args.plan.phase === "bulk") {
    const target_rate_monthly = args.plan.target_rate_lb_per_period; // lb/month
    const actual_rate_monthly = rate * 4.33; // weekly → monthly
    const delta = bulkAdjustmentDeltaKcal(target_rate_monthly, actual_rate_monthly);
    if (Math.abs(delta) < 50) {
      return { eligible: true, delta_kcal: 0, reason: "On target; no adjustment needed." };
    }
    return {
      eligible: true,
      delta_kcal: delta,
      reason: `Actual rate ${actual_rate_monthly.toFixed(2)} lb/mo vs target ${target_rate_monthly.toFixed(2)} lb/mo → ${delta > 0 ? "add" : "reduce"} ${Math.abs(delta).toFixed(0)} kcal/day.`,
    };
  }

  return { eligible: false, delta_kcal: 0, reason: "Phase does not support auto-adjustment." };
}
