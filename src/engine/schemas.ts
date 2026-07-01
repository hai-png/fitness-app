/**
 * Engine Schemas — the single source of truth for ALL TypeScript types in the
 * FitLife Hub application.
 *
 * This file consolidates:
 *   - Fitness types (from the Unified Reference Guide)
 *   - Log types (weight, water, workout, intake)
 *   - Onboarding input (form data)
 *   - Workout UI types (weekly schedule, exercises)
 *   - Commerce types (products, cart, orders)
 *
 * There is no separate `src/types.ts`. Every component imports from here
 * or from the engine barrel (`src/engine/index.ts`).
 *
 * Reference: /home/z/my-project/download/unified_fitness_systems_reference.md
 */

// ---------------------------------------------------------------------------
// Part 0.5 — Master User schema
// ---------------------------------------------------------------------------

export type Sex = "male" | "female";
export type UnitSystem = "metric" | "imperial";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "very_active"
  | "extra_active";

export type TrainingStatus =
  | "beginner"
  | "novice"
  | "intermediate"
  | "advanced"
  | "elite";

export type PrimaryGoal = "cut" | "bulk" | "recomp" | "maintain";

export type DietType =
  | "standard"
  | "vegan"
  | "vegetarian"
  | "keto"
  | "paleo"
  | "mediterranean"
  | "low_carb"
  | "gluten_free";

export type BodyFatMethod =
  | "navy"
  | "jp3"
  | "jp4"
  | "jp7"
  | "durnin_womersley"
  | "cun_bae"
  | "manual"
  | "dexa";

export type MenstrualCyclePhase =
  | "follicular"
  | "ovulation"
  | "luteal"
  | "menstrual"
  | null;

export interface User {
  // Identity & demographics
  id: string;
  sex: Sex;
  age_years: number; // >= 18 (pediatric use IOM DLW branch)
  height_cm: number; // 140–220 typical adult range
  weight_kg: number; // current, latest measurement
  all_time_high_weight_kg?: number; // for weight-reduced-state BMR adjustment
  unit_system: UnitSystem;

  // Population exclusions (must be false to enable all features)
  is_pregnant: boolean;
  is_breastfeeding: boolean;
  has_eating_disorder_history: boolean;
  has_kidney_disease: boolean;

  // Body composition (optional — drives many formula branches)
  body_fat_pct?: number; // 0–60 typical; undefined = unknown
  body_fat_method?: BodyFatMethod;
  waist_cm?: number; // see measurement protocol per method (Part 1.2)
  hip_cm?: number; // women: widest point
  neck_cm?: number; // base of neck

  // Activity
  activity_level: ActivityLevel;
  steps_per_day_avg?: number; // for adaptive TDEE sanity-check
  training_days_per_week: number; // 0–7
  training_status: TrainingStatus;

  // Goal
  primary_goal: PrimaryGoal;
  target_weight_kg?: number;
  target_bf_pct?: number;
  target_date?: string; // ISO date

  // Diet flags
  diet_type?: DietType;
  is_currently_in_deficit: boolean; // drives RippedBody -5% BMR adjustment
  is_weight_reduced: boolean; // >10% below all-time-high → -3% BMR

  // Lifestyle
  sleep_hours_avg?: number; // plateau troubleshooting input
  stress_0_5?: number; // 0 = none, 5 = extreme
  menstrual_cycle_phase?: MenstrualCyclePhase;

  // Computed caches (recomputed by Part 1 pipeline)
  cached_bmr_kcal?: number;
  cached_tdee_kcal?: number;
  cached_adaptive_tdee_kcal?: number; // after ≥4 weeks of data
}

// ---------------------------------------------------------------------------
// Part 1.11 — AssessmentResult
// ---------------------------------------------------------------------------

export interface AssessmentResult {
  user_id: string;
  timestamp: string; // ISO 8601

  // Body composition
  body_fat_pct?: number; // computed via selected method
  body_fat_method: string;
  body_fat_confidence_band: { plus_minus_pct: number };
  fat_mass_kg?: number;
  lean_body_mass_kg?: number;

  // Anthropometric indices
  bmi?: number;
  bmi_category?: string;
  whtr?: number;
  whtr_category?: string;
  whr?: number;
  whr_category?: string;
  absi?: number;
  absi_z_score?: number;
  absi_category?: string;
  absi_hazard_ratio?: number;

  // Ideal weight
  ibw_devine_kg?: number;
  ibw_robinson_kg?: number;
  ibw_miller_kg?: number;
  ibw_hamwi_kg?: number;
  bmi_healthy_weight_range_kg?: { low: number; high: number };

  // Energy
  bmr_kcal: number; // after RippedBody adjustments
  bmr_formula: "mifflin_st_jeor" | "harris_benedict_1984" | "katch_mc_ardle";
  tdee_kcal: number;
  tdee_method: "mifflin_x_saf" | "iom_dlw_eer" | "adaptive";
  activity_factor: number;
  adaptive_tdee_kcal?: number; // populated after ≥4 weeks of data
  adaptive_tdee_confidence?: number; // 0–1

  // Maximums
  max_daily_deficit_kcal?: number; // 22 × fat_lbs
  max_weekly_fat_loss_lbs?: number;
  effective_weekly_loss_cap_lbs: number;

  // Muscle
  skeletal_muscle_mass_kg?: number;
  skeletal_muscle_pct?: number;
  ffmi?: number;
  normalized_ffmi?: number;
  berkhan_max_stage_shredded_kg?: number;

  // Hydration
  daily_water_intake_L: number;
  hydration_breakdown: {
    base_L: number;
    sex_adjustment_L: number;
    exercise_add_L: number;
    climate_multiplier: number;
    pregnancy_add_L: number;
    breastfeeding_add_L: number;
  };

  // Population exclusion flags (echoed for UI gating)
  population_excluded: boolean;
  exclusion_reasons: string[];

  // E-57: medical disclaimer surfaced alongside every assessment.
  disclaimer?: string;
}

// ---------------------------------------------------------------------------
// Part 2.7 — Training log entry
// ---------------------------------------------------------------------------

export type ExerciseCategory =
  | "lower_free_weight_compound"
  | "lower_machine_or_upper_free_weight_press"
  | "upper_machine_or_pulling_compound"
  | "isolation";

export type MovementPattern =
  | "squat"
  | "hip_hinge"
  | "vertical_push"
  | "vertical_pull"
  | "horizontal_push"
  | "horizontal_pull"
  | "isolation";

export type ProgressionScheme = "linear" | "adp"; // ADP = Autoregulated Double Progression

export type KeyLiftStatus =
  | "progressing_recovered"
  | "not_progressing_recovered"
  | "not_progressing_not_recovered";

export interface TrainingSetLog {
  set_number: number;
  load_kg: number;
  reps_achieved: number;
  rir_achieved: number; // user-reported reps in reserve
  rpe_achieved?: number;
  completed: boolean;
  notes?: string;
}

export interface TrainingLogExercise {
  exercise_name: string;
  exercise_category: ExerciseCategory;
  movement_pattern: MovementPattern;
  target_reps: [number, number]; // [lower, upper] e.g. [10, 15]
  target_rir: [number, number]; // [upper_rir, lower_rir] e.g. [2, 0]
  progression_scheme: ProgressionScheme;
  sets: TrainingSetLog[];
  next_session_load_kg: number; // computed by ADP or linear algorithm
  primary_muscle_group: string;
  secondary_muscle_groups: string[];
}

export interface TrainingLogEntry {
  user_id: string;
  session_date: string; // ISO 8601 date
  session_id: string; // groups sets within a session
  exercises: TrainingLogExercise[];
  session_duration_min: number;
  perceived_difficulty_1_10?: number;
  pre_session_sleep_hours?: number;
  pre_session_stress_0_5?: number;
  pre_session_fatigue_0_5?: number;
  post_session_recovered?: boolean;
}

// ---------------------------------------------------------------------------
// Part 2.8 — TrainingPlan
// ---------------------------------------------------------------------------

export type TrainingGoal =
  | "hypertrophy"
  | "strength"
  | "powerbuilding"
  | "cut_retention"
  | "general_fitness";

export type SplitType =
  | "full_body"
  | "upper_lower"
  | "push_pull_legs"
  | "body_part_split"
  | "custom";

export interface TrainingPlanExercise {
  exercise_name: string;
  movement_pattern: MovementPattern;
  exercise_category: ExerciseCategory;
  sets: number;
  reps: [number, number];
  rir: [number, number];
  rest_seconds: number;
  is_primary: boolean;
  primary_muscle_group: string;
  secondary_muscle_groups: string[];
}

export interface PeriodizationBlock {
  phase: "volume" | "load" | "peak";
  length_weeks: number;
  main_lift_protocol: string;
  secondary_lift_protocol: string;
}

export interface TrainingPlan {
  user_id: string;
  plan_id: string;
  created_at: string;
  version: number;
  goal: TrainingGoal;

  // Layer 1: Adherence
  days_per_week: number;
  split_type: SplitType;

  // Layer 2: VIF
  weekly_sets_per_muscle: Record<string, number>;
  muscle_group_frequency_per_week: Record<string, number>;
  intensity_protocol: {
    rep_ranges: Record<string, [number, number]>;
    rir_targets: Record<string, [number, number]>;
  };

  // Layer 3: Progression
  progression_scheme: ProgressionScheme;
  linear_increment_lb: { compound: number; other: number };
  adp_load_adjustment_pct: number;

  // Layer 4: Exercise selection
  exercises: TrainingPlanExercise[];

  // Layer 5: Rest
  default_rest_seconds: number;

  // Layer 6: Tempo
  tempo_protocol?: string;

  // Periodization
  periodization?: { blocks: PeriodizationBlock[] };

  // Deload
  deload_trigger: "reactive" | "scheduled";
  deload_protocol: {
    volume_reduction_pct: number;
    intensity_maintained: boolean;
    frequency_maintained: boolean;
  };

  // Specialization
  specialization?: {
    priority_muscles: string[];
    maintenance_muscles: string[];
    cycle_length_weeks: number;
  };
}

// ---------------------------------------------------------------------------
// Part 3.16 — NutritionPlan
// ---------------------------------------------------------------------------

export type NutritionPhase =
  | "cut"
  | "bulk"
  | "recomp"
  | "maintain"
  | "reverse_diet";

export type TdeeMethod = "mifflin_x_saf" | "iom_dlw_eer" | "adaptive";

export type ProteinBasis =
  | "bodyweight"
  | "lbm"
  | "target_bw"
  | "cm_height";

export interface SupplementEntry {
  name: string;
  daily_dose: string;
  rationale: string;
}

export interface MacroAdjustmentEntry {
  date: string;
  delta_kcal: number;
  reason: string;
}

export interface SubjectiveRatings {
  sleep_0_5: number;
  stress_0_5: number;
  hunger_0_5: number;
  fatigue_0_5: number;
}

export interface NutritionPlan {
  user_id: string;
  plan_id: string;
  created_at: string;
  version: number;

  // Phase
  phase: NutritionPhase;
  phase_start_date: string;
  phase_target_end_date?: string;

  // Layer 1: Calories
  tdee_kcal: number;
  tdee_method: TdeeMethod;
  target_calories_kcal: number;
  calorie_delta_kcal: number; // negative for cut, positive for bulk
  target_rate_pct: number; // % per week (cut) or % per month (bulk)
  target_rate_lb_per_period: number;

  // Caps applied
  alpert_max_deficit_kcal?: number;
  weekly_loss_cap_lb: number;
  calorie_floor_kcal: number;

  // Layer 2: Macros (state variables)
  protein_g: number;
  protein_basis: ProteinBasis;
  protein_rate_g_per_lb: number;
  fat_g: number;
  fat_pct_of_calories: number;
  fat_floor_g: number;
  carb_g: number; // residual

  // Derived display
  macro_pct_calories: { protein: number; fat: number; carbs: number };

  // Layer 3: Micros
  fiber_target_g: number;
  fruit_cups_per_day: number;
  veg_cups_per_day: number;

  // Layer 4: Timing
  meal_frequency_per_day?: number;
  pre_workout_protein_g?: number;
  post_workout_carbs_g?: number;
  macro_cycling?: {
    training_day_carbs_g: number;
    rest_day_carbs_g: number;
    training_days_per_week: number;
  };

  // Layer 5: Supplements
  supplements: SupplementEntry[];

  // Adjustment state machine
  last_adjustment_date?: string;
  next_adjustment_eligible_date: string;
  adjustment_history: MacroAdjustmentEntry[];

  // Tracking inputs
  diet_adherence_pct?: number;
  training_adherence_pct?: number;
  subjective_ratings?: SubjectiveRatings;

  // Tolerance
  macro_tolerance_pct: number;
  tolerance_compliance_target_pct: number;

  // E-57: medical disclaimer surfaced alongside every nutrition plan.
  disclaimer?: string;
}

// ---------------------------------------------------------------------------
// Part 3.17 — MealPlan
// ---------------------------------------------------------------------------

export interface MealItem {
  food_name: string;
  quantity_g: number;
  serving_size_description?: string;
  measured_state: "raw" | "cooked";
  computed_macros: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    kcal: number;
  };
  is_leafy_green_uncounted?: boolean;
}

export interface Meal {
  meal_name: string;
  meal_time?: string;
  target_macros: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    kcal: number;
  };
  items: MealItem[];
  construction_order: number;
}

export interface MealPlan {
  user_id: string;
  plan_id: string;
  nutrition_plan_id: string;
  meals: Meal[];
  daily_totals: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    kcal: number;
    fiber_g: number;
  };
  rotation_set_size?: number;
  eating_out_protocol_applied?: boolean;
}

// ---------------------------------------------------------------------------
// Weight log (used by adaptive TDEE + adjustments)
// ---------------------------------------------------------------------------

export interface DailyWeightLog {
  date: string; // YYYY-MM-DD
  weight_kg: number;
}

export interface DailyIntakeLog {
  date: string; // YYYY-MM-DD
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

// ---------------------------------------------------------------------------
// EngineProfile — optional fields captured post-onboarding that make the
// engine's formulas more accurate (body-fat %, circumferences, training
// status, etc.). Lives in schemas.ts because this file is the single source
// of truth for ALL TypeScript types in the app (per README + ARCHITECTURE.md).
// `src/engine/assessment.ts` re-exports this interface for backward
// compatibility with existing imports.
// ---------------------------------------------------------------------------

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

// ===========================================================================
// Onboarding input — the form data collected during onboarding.
// Distinct from User (which includes engine-only fields like body_fat_pct,
// waist_cm, etc. that are captured separately via EngineProfile).
// ===========================================================================

export type OnboardingGoal =
  | "weight-loss"
  | "muscle-gain"
  | "strength"
  | "endurance"
  | "general";

export type OnboardingActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active";

export type OnboardingWorkoutPreference =
  | "home"
  | "gym"
  | "outdoor"
  | "hybrid";

export type OnboardingDietType =
  | "anything"
  | "vegetarian"
  | "vegan"
  | "keto"
  | "low-carb"
  | "gluten-free"
  | "mediterranean";

export type OnboardingGender = "male" | "female" | "non-binary" | "prefer-not-to-say";

export interface OnboardingInput {
  name: string;
  age: number;
  // E-43/S-19 fix: tightened from `string` to a union matching the server
  // zod schema. Previously mapSex() silently mis-gendered users via prefix
  // matching ('transgender male' → 't' → 'male'); now the form sends one
  // of these exact values. 'prefer-not-to-say' is mapped to 'male' as the
  // engine default (sex-specific formulas require a binary input; a future
  // revision should let users specify sex-for-calculations separately).
  gender: OnboardingGender;
  weight: number; // kg
  height: number; // cm
  goal: OnboardingGoal;
  activityLevel: OnboardingActivityLevel;
  workoutPreference: OnboardingWorkoutPreference;
  frequency: number; // days per week
  dietType: OnboardingDietType;
  allergies: string;
  selectedGymName?: string;
  availableMachines?: string[];
}

// ===========================================================================
// Workout UI types — the weekly schedule shape used by the workout plan
// generator, curated exercise DB, and Training tab.
// Distinct from TrainingPlan (which is the spec-level engine type for
// progression, periodization, volume landmarks, etc.).
// ===========================================================================

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  instruction: string;
  targetMuscle?: string;
  videoUrl?: string;
  steps?: string[];
}

export interface WeeklyScheduleDay {
  day: string;
  activityType: string;
  durationMinutes: number;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  title: string;
  description: string;
  difficulty: string;
  weeklySchedule: WeeklyScheduleDay[];
  tips: string[];
  durationWeeks?: number;
  currentWeek?: number;
  goalType?: string;
}

// ===========================================================================
// Meal suggestion — used by the meal-ordering UI to display per-meal
// macro targets. Generated from the engine NutritionPlan.
// ===========================================================================

export interface MealSuggestion {
  mealType: string;
  name: string;
  description: string;
  calories: number;
  proteinGrams: number;
}

// ===========================================================================
// Commerce types — marketplace + meal-prep ordering domain.
// No engine formulas; these are pure data shapes.
// ===========================================================================

export interface MealProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image: string;
  category: "high-protein" | "low-carb" | "keto" | "vegetarian" | "vegan" | "balanced";
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  category: "supplements" | "equipment" | "apparel" | "accessories";
  badge?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  type: "meal" | "marketplace";
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered";
  deliveryAddress: string;
  type: "meal" | "marketplace";
}

// ===========================================================================
// App-specific log types — water and workout logs (no engine formula
// equivalents; used purely for progress tracking UI).
// ===========================================================================

export interface WaterLog {
  date: string; // YYYY-MM-DD
  amountMl: number;
}

export interface WorkoutLog {
  date: string;
  workoutTitle: string;
  durationMinutes: number;
  caloriesBurned: number;
}
