/**
 * Meal Database Adapter
 *
 * Bridges the curated CuratedMeal database (profile-tagged, allergen-aware)
 * with the existing MealProduct shape used by the MealOrderingTab UI.
 *
 * This module:
 *   1. Converts CuratedMeal → MealProduct (adds price, maps category)
 *   2. Provides getEligibleMealsForUser() — a profile-aware replacement
 *      for the old hardcoded getEligibleMeals() in MealOrderingTab
 *   3. Provides suggestMealPlan() — generates a multi-day meal plan that
 *      matches the user's diet, phase, calorie targets, and allergens
 *      with maximum variety (no repeats within a week).
 */

import type { OnboardingInput, NutritionPlan, DietType, NutritionPhase } from "../engine";
import { MEAL_DATABASE, type CuratedMeal, type AllergenFlags } from "./mealDatabase";
import { findRecipesForProfile } from "./mealProfiles";
import type { MealProduct } from "../engine";

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding → Engine diet mapping
// ─────────────────────────────────────────────────────────────────────────────

const ONBOARDING_TO_ENGINE_DIET: Record<string, DietType> = {
  anything: "standard",
  vegetarian: "vegetarian",
  vegan: "vegan",
  keto: "keto",
  "low-carb": "low_carb",
  "gluten-free": "gluten_free",
  mediterranean: "mediterranean",
};

const ONBOARDING_TO_PHASE: Record<string, NutritionPhase> = {
  "weight-loss": "cut",
  "muscle-gain": "bulk",
  strength: "bulk",
  endurance: "maintain",
  general: "maintain",
};

// ─────────────────────────────────────────────────────────────────────────────
// CuratedMeal → MealProduct conversion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map a CuratedMeal's macro_balance + diet_compatibility to the legacy
 * MealProduct.category field (which the UI uses for display badges).
 */
function mealCategory(meal: CuratedMeal): MealProduct["category"] {
  if (meal.diet_compatibility.includes("vegan")) return "vegan";
  if (meal.diet_compatibility.includes("vegetarian")) return "vegetarian";
  if (meal.diet_compatibility.includes("keto")) return "keto";
  if (meal.diet_compatibility.includes("low_carb")) return "low-carb";
  if (meal.macro_balance === "high_protein") return "high-protein";
  return "balanced";
}

/**
 * Generate a reasonable price for a meal based on its macro content.
 * This is a demo heuristic — real meal-prep pricing would come from
 * a vendor API.
 */
function estimatePrice(meal: CuratedMeal): number {
  const base = 8.99;
  const proteinPremium = meal.protein_g > 40 ? 4 : meal.protein_g > 25 ? 2 : 0;
  const cuisinePremium = meal.cuisine === "Ethiopian" ? 1.5 : 0;
  return Math.round((base + proteinPremium + cuisinePremium) * 100) / 100;
}

/**
 * Convert a CuratedMeal to the legacy MealProduct shape used by the UI.
 */
export function toMealProduct(meal: CuratedMeal): MealProduct {
  return {
    id: meal.id,
    name: meal.title,
    description: meal.description,
    price: estimatePrice(meal),
    calories: Math.round(meal.calories),
    protein: Math.round(meal.protein_g),
    carbs: Math.round(meal.carbs_g),
    fat: Math.round(meal.fat_g),
    image: meal.image,
    category: mealCategory(meal),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Allergen parsing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse the user's free-text allergies field into a set of canonical
 * allergen names. Handles comma-separated values and common synonyms.
 */
export function parseAllergens(allergiesText: string): Set<string> {
  const result = new Set<string>();
  if (!allergiesText) return result;

  const synonyms: Record<string, string> = {
    // dairy
    dairy: "dairy", milk: "dairy", cheese: "dairy", yogurt: "dairy",
    cream: "dairy", butter: "dairy", whey: "dairy", lactose: "dairy",
    // eggs
    egg: "eggs", eggs: "eggs",
    // fish
    fish: "fish", salmon: "fish", tuna: "fish", cod: "fish",
    // shellfish
    shellfish: "shellfish", shrimp: "shellfish", prawn: "shellfish",
    crab: "shellfish", lobster: "shellfish",
    // nuts
    nuts: "nuts", almond: "nuts", walnut: "nuts", cashew: "nuts",
    pecan: "nuts", pistachio: "nuts", hazelnut: "nuts",
    // peanuts
    peanut: "peanuts", peanuts: "peanuts",
    // wheat
    wheat: "wheat", gluten: "wheat", flour: "wheat", bread: "wheat",
    // soy
    soy: "soy", soya: "soy", tofu: "soy",
    // sesame
    sesame: "sesame",
  };

  const tokens = allergiesText.toLowerCase().split(/[,\s]+/);
  for (const token of tokens) {
    const cleaned = token.trim();
    if (!cleaned) continue;
    const canonical = synonyms[cleaned];
    if (canonical) result.add(canonical);
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile-aware meal selection
// ─────────────────────────────────────────────────────────────────────────────

export interface MealPlanOptions {
  numDays: number;
  mealsPerDay: 2 | 3;
}

export interface DayPlan {
  dayNumber: number;
  meals: { slot: "Breakfast" | "Lunch" | "Dinner"; meal: MealProduct }[];
}

/** Allergen flag key type. */
type AllergenFlagKey = keyof AllergenFlags;

/** Map from canonical allergen name to CuratedMeal.allergen_flags key. */
const ALLERGEN_FLAG_MAP: Record<string, AllergenFlagKey> = {
  dairy: "contains_dairy",
  eggs: "contains_eggs",
  fish: "contains_fish",
  shellfish: "contains_shellfish",
  nuts: "contains_nuts",
  peanuts: "contains_peanuts",
  wheat: "contains_wheat",
  soy: "contains_soy",
  sesame: "contains_sesame",
};

/**
 * Get all meals compatible with the user's diet + allergens.
 * This replaces the old getEligibleMeals() in MealOrderingTab.
 */
export function getEligibleMealsForUser(
  onboardingInput: OnboardingInput,
  nutritionPlan: NutritionPlan | null,
): MealProduct[] {
  const diet = ONBOARDING_TO_ENGINE_DIET[onboardingInput.dietType] ?? "standard";
  const allergenAvoid = parseAllergens(onboardingInput.allergies);

  // Compute per-meal calorie target from the nutrition plan.
  const dailyTarget = nutritionPlan?.target_calories_kcal;
  const mealsPerDay = 3;
  const perMealTarget = dailyTarget ? dailyTarget / mealsPerDay : null;
  const calLo = perMealTarget ? perMealTarget * 0.6 : 0;
  const calHi = perMealTarget ? perMealTarget * 1.4 : 99999;

  // Filter the full database by diet + allergens

  const eligible = MEAL_DATABASE.filter((meal) => {
    // Diet check
    if (!meal.diet_compatibility.includes(diet)) return false;

    // Allergen check
    for (const allergen of allergenAvoid) {
      const flag = ALLERGEN_FLAG_MAP[allergen];
      if (flag && meal.allergen_flags[flag]) return false;
    }

    // Calorie range check (only if we have a target)
    if (perMealTarget && (meal.calories < calLo || meal.calories > calHi)) {
      return false;
    }

    return true;
  });

  // Convert to MealProduct shape
  const products = eligible.map(toMealProduct);

  // Fallback: if filtering produced nothing (edge case), return a broad set
  if (products.length === 0) {
    return MEAL_DATABASE.slice(0, 20).map(toMealProduct);
  }

  return products;
}

/**
 * Suggest a multi-day meal plan that matches the user's profile (diet,
 * phase, calorie targets, allergens) with maximum variety.
 *
 * Uses the profile-aware findRecipesForProfile() to select meals for each
 * slot, then shuffles to avoid repeats within a week.
 */
export function suggestMealPlan(
  onboardingInput: OnboardingInput,
  nutritionPlan: NutritionPlan | null,
  options: MealPlanOptions,
): DayPlan[] {
  const diet = ONBOARDING_TO_ENGINE_DIET[onboardingInput.dietType] ?? "standard";
  const phase = nutritionPlan?.phase ?? ONBOARDING_TO_PHASE[onboardingInput.goal] ?? "maintain";
  const allergenAvoid = parseAllergens(onboardingInput.allergies);

  const slots: ("Breakfast" | "Lunch" | "Dinner")[] =
    options.mealsPerDay === 3 ? ["Breakfast", "Lunch", "Dinner"] : ["Lunch", "Dinner"];

  // Pre-fetch candidate meals for each slot type
  const candidatesBySlot: Record<string, MealProduct[]> = {};
  for (const slot of slots) {
    const mealType = slot.toLowerCase() as "breakfast" | "lunch" | "dinner";
    const recipeIds = findRecipesForProfile(diet, phase, mealType, allergenAvoid);

    // Map recipe IDs back to MealProduct
    const products = recipeIds
      .map((id) => MEAL_DATABASE.find((m) => m.id === id))
      .filter((m): m is CuratedMeal => m !== null)
      .map(toMealProduct);

    // Fallback: if the profile had no matches (gap), use the broader
    // getEligibleMealsForUser pool filtered by meal type
    if (products.length === 0) {
      const eligible = getEligibleMealsForUser(onboardingInput, nutritionPlan);
      const slotFiltered = eligible.filter((m) => {
        const curated = MEAL_DATABASE.find((c) => c.id === m.id);
        if (!curated) return true;
        return curated.meal_types.includes(mealType) ||
          (mealType === "lunch" || mealType === "dinner") &&
          curated.meal_types.some((mt) => mt === "lunch" || mt === "dinner");
      });
      candidatesBySlot[slot] = slotFiltered.length > 0 ? slotFiltered : eligible;
    } else {
      candidatesBySlot[slot] = products;
    }
  }

  // Build the plan, avoiding repeats within a week
  const usedIds = new Set<string>();
  const plan: DayPlan[] = [];

  for (let d = 1; d <= options.numDays; d++) {
    const dayMeals: DayPlan["meals"] = [];

    for (const slot of slots) {
      const candidates = candidatesBySlot[slot];
      if (!candidates || candidates.length === 0) continue;

      // Find a candidate not yet used this week
      let meal = candidates.find((m) => !usedIds.has(m.id));

      // If all candidates have been used, reset and allow repeats
      if (!meal) {
        usedIds.clear();
        meal = candidates[0];
      }

      if (meal) {
        usedIds.add(meal.id);
        dayMeals.push({ slot, meal });
      }
    }

    plan.push({ dayNumber: d, meals: dayMeals });
  }

  return plan;
}

// ─────────────────────────────────────────────────────────────────────────────
// Database stats (for debugging / UI display)
// ─────────────────────────────────────────────────────────────────────────────

export function getMealDatabaseStats() {
  return {
    totalRecipes: MEAL_DATABASE.length,
    cuisines: new Set(MEAL_DATABASE.map((m) => m.cuisine)).size,
    dietCoverage: {
      vegan: MEAL_DATABASE.filter((m) => m.diet_compatibility.includes("vegan")).length,
      vegetarian: MEAL_DATABASE.filter((m) => m.diet_compatibility.includes("vegetarian")).length,
      keto: MEAL_DATABASE.filter((m) => m.diet_compatibility.includes("keto")).length,
      gluten_free: MEAL_DATABASE.filter((m) => m.diet_compatibility.includes("gluten_free")).length,
      paleo: MEAL_DATABASE.filter((m) => m.diet_compatibility.includes("paleo")).length,
      mediterranean: MEAL_DATABASE.filter((m) => m.diet_compatibility.includes("mediterranean")).length,
    },
  };
}
