/**
 * Adaptive TDEE Engine — Part 4.1 of the Unified Reference Guide.
 *
 * Implements the statistical-blend (Bayesian) model:
 *   TDEE_adaptive(t) = α(t) × TDEE_prior + (1 − α(t)) × TDEE_observed(t)
 *
 *   TDEE_prior       = Mifflin_St_Jeor(user) × SAF[user.activity_level]
 *                      (with RippedBody -5% / -3% BMR adjustments applied)
 *   TDEE_observed(t) = mean_intake(t − N, t)
 *                      − (Δweight(t − N, t) × energy_density) / N_days
 *   energy_density   = 3500 kcal/lb (≈7700 kcal/kg) [energy-content only — Part 4.5]
 *   N                = window size in days (recommended 7–14)
 *   α(t)             = monotonically decreasing weight on prior
 *                      recommended: α(t) = exp(−t / τ), τ ≈ 14 days (half-life ~10 days)
 *
 * Resolves Group C C7 (statistical-blend vs first-principles) and C10
 * ("adaptive TDEE" used as marketing term by some sources).
 *
 * All functions are pure. No IO. No side effects. Unit-testable.
 */

import type {
  DailyIntakeLog,
  DailyWeightLog,
  User,
} from "./schemas";
import {
  KCAL_PER_LB_FAT,
  applyRippedBodyBmrAdjustments,
  mifflinStJeor,
  SAF,
} from "./assessment";

// ===========================================================================
// Constants
// ===========================================================================

/** Time constant for the prior-decay function. Half-life ~10 days. */
export const TAU_DAYS = 14;

/** Default window size for observed-TDEE computation. */
export const DEFAULT_WINDOW_DAYS = 7;

/** Confidence minimum — below this many days of data, prior dominates. */
export const MIN_DAYS_FOR_DATA_DRIVEN = 30;

// ===========================================================================
// Prior
// ===========================================================================

/**
 * Compute the prior TDEE = Mifflin-St Jeor × SAF (with RippedBody adjustments).
 * This is what we fall back to before we have enough observed data.
 */
export function computePriorTdee(user: User): {
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
  return { bmr_kcal: bmr, tdee_kcal: bmr * factor, activity_factor: factor };
}

// ===========================================================================
// Observed TDEE
// ===========================================================================

/**
 * Compute observed TDEE from a window of intake + weight data.
 *   TDEE_observed = mean_intake − (Δweight × energy_density) / N_days
 *
 * Positive Δweight (gaining) → subtract MORE from intake (intake exceeds expenditure).
 * Negative Δweight (losing) → subtract LESS from intake (intake below expenditure).
 *
 * @returns null if insufficient data.
 */
export function computeObservedTdee(args: {
  intakes: DailyIntakeLog[];
  weights: DailyWeightLog[];
  window_days?: number;
  energy_density_kcal_per_lb?: number; // default 3500
}): { tdee_kcal: number; n_days: number; mean_intake: number; delta_weight_lb: number } | null {
  const window = args.window_days ?? DEFAULT_WINDOW_DAYS;
  const energy_density = args.energy_density_kcal_per_lb ?? KCAL_PER_LB_FAT;

  if (args.intakes.length < window || args.weights.length < 2) {
    return null;
  }

  // Sort by date.
  const intakes = [...args.intakes].sort((a, b) => a.date.localeCompare(b.date));
  const weights = [...args.weights].sort((a, b) => a.date.localeCompare(b.date));

  // Take the most recent `window` intake days.
  const recent_intakes = intakes.slice(-window);
  const mean_intake =
    recent_intakes.reduce((s, l) => s + l.kcal, 0) / recent_intakes.length;

  // Take the most recent weight and the weight `window` days prior.
  const recent_weight = weights[weights.length - 1];
  const start_idx = Math.max(0, weights.length - 1 - window);
  const start_weight = weights[start_idx];
  const delta_weight_kg = recent_weight.weight_kg - start_weight.weight_kg;
  const delta_weight_lb = delta_weight_kg * 2.2046226218;

  // TDEE_observed = mean_intake − (Δweight × energy_density) / N_days
  const n_days = Math.abs(
    new Date(recent_weight.date).getTime() - new Date(start_weight.date).getTime(),
  ) / (1000 * 60 * 60 * 24);
  if (n_days === 0) return null;

  const tdee = mean_intake - (delta_weight_lb * energy_density) / n_days;
  return { tdee_kcal: tdee, n_days, mean_intake, delta_weight_lb };
}

// ===========================================================================
// Posterior blend
// ===========================================================================

/**
 * Compute the prior-decay weight α(t) at time t (days since start of data).
 *   α(t) = exp(−t / τ)
 *
 *   t = 0 days logged:     α = 1.0 → fully prior
 *   t = 14 days:           α ≈ 0.37
 *   t = 30 days:           α ≈ 0.12
 *   t = 60 days:           α ≈ 0.014 → effectively fully data-driven
 */
export function priorWeightAlpha(days_logged: number, tau_days: number = TAU_DAYS): number {
  // E-17 fix: clamp days_logged to >= 0. A negative input (clock skew or
  // caller bug) would produce alpha = exp(positive) > 1, which makes the
  // convex blend extrapolate outside [min, max] (e.g. 1.43*prior - 0.43*observed).
  const clamped = Math.max(0, days_logged);
  return Math.exp(-clamped / tau_days);
}

/**
 * Compute the adaptive TDEE — the canonical blend.
 *   TDEE_adaptive(t) = α(t) × TDEE_prior + (1 − α(t)) × TDEE_observed(t)
 *
 * E-22 fix: this function now calls detectOutliers internally. When the
 * outlier confidence_indicator is "low", alpha is clamped to >= 0.5 so the
 * blend stays prior-heavy — previously a user with 30 days of gamed data
 * (10,000 kcal intake, no weight change) would get alpha ≈ 0.12 and a
 * wildly wrong observed-driven TDEE.
 *
 * E-23 fix: the observed TDEE is clamped to [0.5 × prior, 2 × prior] before
 * blending. A gamed or buggy input that produces observed = 10,000 kcal no
 * longer dominates the blend.
 *
 * @returns the blended TDEE plus a confidence score (0-1) and the outlier flags.
 */
export function computeAdaptiveTdee(args: {
  user: User;
  intakes: DailyIntakeLog[];
  weights: DailyWeightLog[];
  days_logged?: number; // override; otherwise computed from earliest log date
  window_days?: number;
  tau_days?: number;
  body_weight_kg?: number; // for outlier detection; falls back to user.weight_kg
}): {
  adaptive_tdee_kcal: number;
  prior_tdee_kcal: number;
  observed_tdee_kcal: number | null;
  alpha: number;
  confidence: number;
  n_days_data: number;
  outliers: OutlierFlags | null;
} {
  const prior = computePriorTdee(args.user);

  // Determine days_logged: use the earliest weight or intake log if not given.
  let days_logged = args.days_logged;
  if (days_logged === undefined) {
    const all_dates = [...args.intakes.map((l) => l.date), ...args.weights.map((l) => l.date)].sort();
    if (all_dates.length === 0) {
      days_logged = 0;
    } else {
      const earliest = new Date(all_dates[0]).getTime();
      const latest = new Date(all_dates[all_dates.length - 1]).getTime();
      // E-17: clamp to >= 0 (clock skew defense).
      days_logged = Math.max(0, (latest - earliest) / (1000 * 60 * 60 * 24));
    }
  }

  let alpha = priorWeightAlpha(days_logged, args.tau_days ?? TAU_DAYS);
  const observed = computeObservedTdee({
    intakes: args.intakes,
    weights: args.weights,
    window_days: args.window_days,
  });

  // E-22: run outlier detection. When confidence is "low", clamp alpha to
  // >= 0.5 so the blend stays prior-heavy and the outliers don't dominate.
  const body_weight_kg = args.body_weight_kg ?? args.user.weight_kg;
  const outliers =
    args.intakes.length > 0 || args.weights.length > 0
      ? detectOutliers({
          intakes: args.intakes,
          weights: args.weights,
          body_weight_kg,
        })
      : null;
  if (outliers && outliers.confidence_indicator === "low") {
    alpha = Math.max(alpha, 0.5);
  }

  if (observed === null) {
    return {
      adaptive_tdee_kcal: prior.tdee_kcal,
      prior_tdee_kcal: prior.tdee_kcal,
      observed_tdee_kcal: null,
      alpha: 1.0,
      confidence: 0,
      n_days_data: 0,
      outliers,
    };
  }

  // E-23: clamp observed TDEE to a plausible band around the prior.
  // Gamed data (e.g. 10,000 kcal logged with no weight change) would
  // otherwise produce observed = 10,000 and dominate the blend even with
  // the E-22 alpha clamp. The [0.5, 2.0] band is generous but excludes
  // physiologically impossible values.
  const observed_clamped = Math.min(
    Math.max(observed.tdee_kcal, prior.tdee_kcal * 0.5),
    prior.tdee_kcal * 2.0,
  );

  const blended = alpha * prior.tdee_kcal + (1 - alpha) * observed_clamped;
  // Confidence: 0 when fully prior, → 1 as alpha → 0 AND data is clean.
  // E-22: when outliers flag low confidence, cap confidence at 0.3 so the
  // UI's confidence bar doesn't give false reassurance.
  let confidence = Math.max(0, Math.min(1, 1 - alpha));
  if (outliers && outliers.confidence_indicator === "low") {
    confidence = Math.min(confidence, 0.3);
  }

  return {
    adaptive_tdee_kcal: blended,
    prior_tdee_kcal: prior.tdee_kcal,
    observed_tdee_kcal: observed_clamped,
    alpha,
    confidence,
    n_days_data: observed.n_days,
    outliers,
  };
}

// ===========================================================================
// Outlier detection (Part 4.1.3)
// ===========================================================================

export interface OutlierFlags {
  incomplete_logging_days: string[]; // days where intake is much lower than mean
  large_water_weight_jumps: string[]; // single-day weight delta > 2% of body weight
  confidence_indicator: "low" | "medium" | "high";
}

/**
 * Detect outliers in intake + weight logs.
 * - Incomplete logging: intake < N standard deviations below mean.
 * - Large water-weight jumps: single-day weight delta > ~2% of body weight.
 * - Confidence: low when data is sparse / recent outliers; high when N > 30 days clean.
 */
export function detectOutliers(args: {
  intakes: DailyIntakeLog[];
  weights: DailyWeightLog[];
  body_weight_kg: number;
  n_std_dev?: number; // default 2
}): OutlierFlags {
  const n_std = args.n_std_dev ?? 2;

  // Incomplete logging: days where intake is < n_std std devs below mean.
  const intakes_sorted = [...args.intakes].sort((a, b) => a.date.localeCompare(b.date));
  const mean_intake =
    intakes_sorted.reduce((s, l) => s + l.kcal, 0) / Math.max(1, intakes_sorted.length);
  const variance =
    intakes_sorted.reduce((s, l) => s + (l.kcal - mean_intake) ** 2, 0) /
    Math.max(1, intakes_sorted.length);
  const std = Math.sqrt(variance);
  const incomplete_logging_days = intakes_sorted
    .filter((l) => l.kcal < mean_intake - n_std * std)
    .map((l) => l.date);

  // Large water-weight jumps.
  const weights_sorted = [...args.weights].sort((a, b) => a.date.localeCompare(b.date));
  const threshold_kg = args.body_weight_kg * 0.02;
  const large_water_weight_jumps: string[] = [];
  for (let i = 1; i < weights_sorted.length; i++) {
    const delta = Math.abs(weights_sorted[i].weight_kg - weights_sorted[i - 1].weight_kg);
    if (delta > threshold_kg) {
      large_water_weight_jumps.push(weights_sorted[i].date);
    }
  }

  // Confidence indicator.
  const n_days = Math.min(intakes_sorted.length, weights_sorted.length);
  let confidence_indicator: "low" | "medium" | "high" = "low";
  if (n_days >= 30 && incomplete_logging_days.length === 0 && large_water_weight_jumps.length === 0) {
    confidence_indicator = "high";
  } else if (n_days >= 14) {
    confidence_indicator = "medium";
  }

  return { incomplete_logging_days, large_water_weight_jumps, confidence_indicator };
}

// ===========================================================================
// Smoothing (Part 4.1.4)
// ===========================================================================

/**
 * 7-day rolling average of weight.
 * Re-evaluate TDEE every 4-6 weeks.
 */
export function rollingAverageWeight(
  weights: DailyWeightLog[],
  days: number = 7,
): number | null {
  if (weights.length < days) return null;
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const window = sorted.slice(-days);
  return window.reduce((s, l) => s + l.weight_kg, 0) / days;
}

/**
 * 7-day EWMA (exponentially-weighted moving average) of weight.
 * More responsive to recent changes than the simple rolling average.
 */
export function ewmaWeight(
  weights: DailyWeightLog[],
  alpha: number = 2 / (7 + 1), // standard 7-day EWMA smoothing factor
): number | null {
  if (weights.length === 0) return null;
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  let ewma = sorted[0].weight_kg;
  for (let i = 1; i < sorted.length; i++) {
    ewma = alpha * sorted[i].weight_kg + (1 - alpha) * ewma;
  }
  return ewma;
}
