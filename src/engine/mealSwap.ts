/**
 * Meal Swap Engine — finds swap alternatives for any meal based on:
 * 1. Diet compatibility (vegan/vegetarian/omni + Ethiopian variants)
 * 2. Allergy safety (excludes recipes containing user allergens)
 * 3. Macro proximity (scores by how close calories + protein are to target)
 * 4. Cuisine preference (prefers user's selected cuisine when available)
 * 5. Goal fit (prefers recipes tagged for the user's goal: cut/bulk/maintain/recomp)
 * 6. Meal type match (breakfast recipes for breakfast slots, etc.)
 *
 * The swap system works with BOTH meal products (from meals.ts) AND recipes
 * (from recipeDatabase.ts). A meal product is the "default" meal shown in
 * the delivery plan; a recipe is a "swap alternative" the user can pick.
 *
 * Architecture:
 * - MealOrderingTab generates a plan from MEAL_PRODUCTS (12 curated dishes
 *   with prices for the delivery service).
 * - When the user taps "Swap" on a meal, the swap modal shows alternative
 *   recipes from the 305-recipe database that match their diet + allergies
 *   + macro targets. Each alternative shows calories, protein, cuisine,
 *   and prep time.
 * - Selecting an alternative replaces the meal in the plan. The price stays
 *   the same (it's a delivery service — the user pays for the slot, not the
 *   specific recipe).
 */

import { RECIPES, type Recipe, type DietType, type MealType } from "../data/recipeDatabase";
import type { OnboardingDietType, NutritionPlan } from "../engine/schemas";

/** User's onboarding diet mapped to recipe DietType enum. */
export function mapDietToRecipeTypes(diet: OnboardingDietType): DietType[] {
  switch (diet) {
    case "vegan":
      return ["VEGAN", "VEGAN_ETHIOPIAN"];
    case "vegetarian":
      // Vegetarians can eat vegan + omni (we filter out meat via allergens below).
      // Ethiopian vegetarian = vegan Ethiopian (fasting-friendly).
      return ["VEGAN", "VEGAN_ETHIOPIAN", "OMNI", "OMNI_ETHIOPIAN"];
    case "keto":
    case "low-carb":
    case "gluten-free":
    case "mediterranean":
    case "anything":
    default:
      return ["OMNI", "OMNI_ETHIOPIAN", "VEGAN", "VEGAN_ETHIOPIAN"];
  }
}

/** Check if a recipe contains any of the user's allergens. */
export function recipeContainsAllergen(recipe: Recipe, allergies: string): boolean {
  if (!allergies) return false;
  const allergenList = allergies
    .toLowerCase()
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
  if (allergenList.length === 0) return false;
  return recipe.allergens.some((a) =>
    allergenList.some((user) => a.toLowerCase().includes(user) || user.includes(a.toLowerCase())),
  );
}

/** Check if a recipe is compatible with a vegetarian diet (no meat). */
function isVegetarianSafe(recipe: Recipe): boolean {
  // Ethiopian OMNI recipes often contain meat — check allergens list for meat indicators.
  // The recipe database tags meat-containing recipes with allergens like "dairy" (for butter),
  // but meat itself isn't an allergen. We use the diet_types: if a recipe is OMNI_ETHIOPIAN
  // and the user is vegetarian, we need to check ingredients — but since we don't expose
  // ingredients in the curated DB, we fall back to: only VEGAN/VEGAN_ETHIOPIAN recipes
  // are safe for vegetarians who want to avoid meat.
  // This is conservative but safe.
  return recipe.dietTypes.some((d) => d === "VEGAN" || d === "VEGAN_ETHIOPIAN");
}

/** Per-meal macro target derived from the nutrition plan. */
export interface MealTarget {
  kcal: number;
  proteinG: number;
}

/**
 * Score a recipe by how well it matches the target macros.
 * Lower score = better match. Weighted: calories 50%, protein 30%,
 * goal fit 10%, cuisine preference 10%.
 */
export function scoreRecipeForSwap(
  recipe: Recipe,
  target: MealTarget,
  userGoal: string,
  preferredCuisine: string,
): number {
  const n = recipe.nutrition;
  const kcalDiff = Math.abs(n.kcal - target.kcal) / Math.max(target.kcal, 1);
  const proteinDiff = Math.abs(n.proteinG - target.proteinG) / Math.max(target.proteinG, 1);

  // Goal fit bonus: -0.05 if the recipe is tagged for the user's goal.
  const goalBonus = recipe.goalFit.some((g) => g === userGoal) ? -0.05 : 0;

  // Cuisine preference bonus: -0.05 if the recipe matches the user's preferred cuisine.
  const cuisineBonus = recipe.cuisine === preferredCuisine ? -0.05 : 0;

  return kcalDiff * 0.5 + proteinDiff * 0.3 + goalBonus + cuisineBonus;
}

/**
 * Find swap alternatives for a meal slot.
 *
 * @param targetKcal - The target calories for this meal slot
 * @param targetProteinG - The target protein for this meal slot
 * @param dietType - The user's onboarding diet type
 * @param allergies - Comma-separated allergen list
 * @param mealType - The meal slot type ("breakfast" | "lunch" | "dinner")
 * @param userGoal - The user's fitness goal ("cut" | "bulk" | "maintenance" | "recomp")
 * @param preferredCuisine - The user's preferred cuisine (e.g. "ethiopian", "american")
 * @param limit - Max number of alternatives to return (default 8)
 * @returns Array of recipes sorted by best match, each with a score + macro delta
 */
export function findSwapAlternatives(
  target: MealTarget,
  dietType: OnboardingDietType,
  allergies: string,
  mealType: MealType,
  userGoal: string,
  preferredCuisine: string,
  limit: number = 8,
): Array<{ recipe: Recipe; score: number; kcalDelta: number; proteinDelta: number }> {
  const allowedDietTypes = mapDietToRecipeTypes(dietType);

  const candidates = RECIPES.filter((r) => {
    // Diet compatibility
    if (!r.dietTypes.some((d) => allowedDietTypes.includes(d))) return false;
    // Vegetarian safety
    if (dietType === "vegetarian" && !isVegetarianSafe(r)) return false;
    // Allergy safety
    if (recipeContainsAllergen(r, allergies)) return false;
    // Meal type match (a breakfast recipe can swap into a breakfast slot, etc.)
    if (!r.mealTypes.includes(mealType)) return false;
    return true;
  });

  // Score and sort
  const scored = candidates
    .map((recipe) => {
      const score = scoreRecipeForSwap(recipe, target, userGoal, preferredCuisine);
      const kcalDelta = recipe.nutrition.kcal - target.kcal;
      const proteinDelta = recipe.nutrition.proteinG - target.proteinG;
      return { recipe, score, kcalDelta, proteinDelta };
    })
    .sort((a, b) => a.score - b.score);

  return scored.slice(0, limit);
}

/**
 * Compute per-meal targets from a NutritionPlan.
 * Breakfast = 25%, Lunch = 35%, Dinner = 35%, Snack = 5%.
 */
export function computeMealTargets(
  plan: NutritionPlan,
  mealsPerDay: 2 | 3,
): Record<"breakfast" | "lunch" | "dinner" | "snack", MealTarget> {
  const t = plan.target_calories_kcal;
  const p = plan.protein_g;
  if (mealsPerDay === 3) {
    return {
      breakfast: { kcal: t * 0.25, proteinG: p * 0.25 },
      lunch: { kcal: t * 0.35, proteinG: p * 0.35 },
      dinner: { kcal: t * 0.35, proteinG: p * 0.35 },
      snack: { kcal: t * 0.05, proteinG: p * 0.05 },
    };
  }
  return {
    breakfast: { kcal: 0, proteinG: 0 },
    lunch: { kcal: t * 0.5, proteinG: p * 0.5 },
    dinner: { kcal: t * 0.5, proteinG: p * 0.5 },
    snack: { kcal: 0, proteinG: 0 },
  };
}

/**
 * Generate a multi-day meal plan using the recipe database.
 * Each slot is filled with the best-matching recipe for the user's macros,
 * diet, allergies, goal, and cuisine preference.
 *
 * @param plan - The engine's NutritionPlan
 * @param dietType - The user's onboarding diet type
 * @param allergies - Comma-separated allergen list
 * @param numDays - Number of days to plan
 * @param mealsPerDay - 2 (lunch+dinner) or 3 (breakfast+lunch+dinner)
 * @param preferredCuisine - The user's preferred cuisine
 * @returns A multi-day meal plan with real recipes
 */
export function generateRecipeMealPlan(
  plan: NutritionPlan,
  dietType: OnboardingDietType,
  allergies: string,
  numDays: number,
  mealsPerDay: 2 | 3,
  preferredCuisine: string,
): Array<{
  dayNumber: number;
  meals: Array<{
    slot: "Breakfast" | "Lunch" | "Dinner";
    recipe: Recipe;
  }>;
  totalKcal: number;
  totalProteinG: number;
}> {
  const targets = computeMealTargets(plan, mealsPerDay);
  const userGoal = plan.phase === "cut" ? "cut" : plan.phase === "bulk" ? "bulk" : "maintenance";

  const slots: Array<{ slot: "Breakfast" | "Lunch" | "Dinner"; mealType: MealType; target: MealTarget }> = [];
  if (mealsPerDay === 3) {
    slots.push({ slot: "Breakfast", mealType: "breakfast", target: targets.breakfast });
    slots.push({ slot: "Lunch", mealType: "lunch", target: targets.lunch });
    slots.push({ slot: "Dinner", mealType: "dinner", target: targets.dinner });
  } else {
    slots.push({ slot: "Lunch", mealType: "lunch", target: targets.lunch });
    slots.push({ slot: "Dinner", mealType: "dinner", target: targets.dinner });
  }

  const days = [];
  const usedIds = new Set<string>();

  for (let d = 1; d <= numDays; d++) {
    const meals: Array<{ slot: "Breakfast" | "Lunch" | "Dinner"; recipe: Recipe }> = [];

    for (const { slot, mealType, target } of slots) {
      // Find alternatives, preferring unused recipes for variety
      const alternatives = findSwapAlternatives(
        target,
        dietType,
        allergies,
        mealType,
        userGoal,
        preferredCuisine,
        20,
      );

      // Pick the best unused recipe (or the best if all have been used)
      const best = alternatives.find((a) => !usedIds.has(a.recipe.id)) ?? alternatives[0];
      if (best) {
        usedIds.add(best.recipe.id);
        meals.push({ slot, recipe: best.recipe });
      }
    }

    const totalKcal = meals.reduce((s, m) => s + m.recipe.nutrition.kcal, 0);
    const totalProteinG = meals.reduce((s, m) => s + m.recipe.nutrition.proteinG, 0);

    days.push({ dayNumber: d, meals, totalKcal, totalProteinG });
  }

  return days;
}
