/**
 * Meal plan generator — builds a personalized meal plan from the recipe
 * database based on the user's nutrition plan (target calories + macros),
 * diet type, allergies, and goal.
 *
 * A-20 fix: replaces the fake hardcoded meal suggestions in planGenerator.ts
 * (which returned generic names like "Savory Turkey Sausage & Egg White
 * Scramble" with no relationship to the user's actual macros or diet).
 *
 * The generator:
 * 1. Filters recipes by diet type (vegan/vegetarian/omni) + allergies.
 * 2. Scores each recipe by how well its macros match the user's per-meal targets.
 * 3. Picks the best-scoring recipe for each meal slot (breakfast/lunch/dinner).
 * 4. Returns a MealPlan with real recipes, real nutrition, and real images.
 */

import type { NutritionPlan, OnboardingDietType } from "../engine/schemas";
import { RECIPES, type Recipe } from "../data/recipeDatabase";

export interface MealSlot {
  slot: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  recipe: Recipe;
}

export interface DayMealPlan {
  dayNumber: number;
  meals: MealSlot[];
  total_kcal: number;
  total_protein_g: number;
  total_carb_g: number;
  total_fat_g: number;
}

export interface GeneratedMealPlan {
  days: DayMealPlan[];
  target_calories_kcal: number;
  target_protein_g: number;
  target_carb_g: number;
  target_fat_g: number;
}

/** Map OnboardingDietType to recipe diet_types vocabulary. */
function mapDietType(diet: OnboardingDietType): string[] {
  switch (diet) {
    case "vegan":
      return ["VEGAN", "VEGAN_ETHIOPIAN"];
    case "vegetarian":
      return ["VEGAN", "VEGAN_ETHIOPIAN", "OMNI"]; // vegetarians can eat vegan + omni (filter out meat later)
    default:
      return ["OMNI", "OMNI_ETHIOPIAN", "VEGAN", "VEGAN_ETHIOPIAN"]; // omni eats everything
  }
}

/** Check if a recipe is compatible with the user's diet type. */
function isDietCompatible(recipe: Recipe, allowedDietTypes: string[], userDiet: OnboardingDietType): boolean {
  const recipeDiets = recipe.diet_types;
  if (recipeDiets.some((d) => allowedDietTypes.includes(d))) {
    // For vegetarians, also check that the recipe isn't explicitly meat
    if (userDiet === "vegetarian") {
      const meatAllergens = ["meat", "beef", "pork", "chicken", "fish", "seafood"];
      const ingredients = recipe.allergens;
      if (ingredients.some((a) => meatAllergens.includes(a.toLowerCase()))) {
        return false;
      }
    }
    return true;
  }
  return false;
}

/** Check if a recipe contains any of the user's allergens. */
function containsAllergen(recipe: Recipe, allergies: string): boolean {
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

/** Score a recipe by how well its macros match the per-meal target. Lower = better. */
function scoreRecipe(recipe: Recipe, target_kcal: number, target_protein: number): number {
  const n = recipe.nutrition_per_serving;
  if (!n) return Infinity;
  // Weighted macro distance: calories matter most, protein second.
  const kcalDiff = Math.abs(n.kcal - target_kcal) / target_kcal;
  const proteinDiff = Math.abs(n.protein_g - target_protein) / Math.max(target_protein, 1);
  return kcalDiff * 0.6 + proteinDiff * 0.4;
}

/**
 * Build a personalized meal plan from the recipe database.
 *
 * @param nutritionPlan - The engine's NutritionPlan (target calories + macros)
 * @param dietType - The user's diet preference
 * @param allergies - Comma-separated allergen list
 * @param numDays - Number of days to plan (default 5)
 * @param mealsPerDay - 2 (lunch+dinner) or 3 (breakfast+lunch+dinner), default 3
 */
export function buildMealPlan(
  nutritionPlan: NutritionPlan,
  dietType: OnboardingDietType,
  allergies: string,
  numDays: number = 5,
  mealsPerDay: number = 3,
): GeneratedMealPlan {
  const target_kcal = nutritionPlan.target_calories_kcal;
  const target_protein = nutritionPlan.protein_g;
  const target_carb = nutritionPlan.carb_g;
  const target_fat = nutritionPlan.fat_g;

  // Per-meal targets (assume breakfast=25%, lunch=35%, dinner=35%, snack=5%)
  const perMealTarget = mealsPerDay === 3
    ? { breakfast: { kcal: target_kcal * 0.25, protein: target_protein * 0.25 },
        lunch: { kcal: target_kcal * 0.35, protein: target_protein * 0.35 },
        dinner: { kcal: target_kcal * 0.35, protein: target_protein * 0.35 } }
    : { lunch: { kcal: target_kcal * 0.5, protein: target_protein * 0.5 },
        dinner: { kcal: target_kcal * 0.5, protein: target_protein * 0.5 } } as Record<string, { kcal: number; protein: number }>;

  // Filter recipes by diet + allergies
  const allowedDietTypes = mapDietType(dietType);
  const eligible = RECIPES.filter(
    (r) => isDietCompatible(r, allowedDietTypes, dietType) && !containsAllergen(r, allergies),
  );

  // Fallback: if no recipes match (very restrictive allergies), use all recipes
  const pool = eligible.length > 0 ? eligible : RECIPES;

  // Categorize by meal type
  const breakfastRecipes = pool.filter((r) => r.meal_types.includes("breakfast"));
  const lunchRecipes = pool.filter((r) => r.meal_types.includes("lunch") || r.meal_types.includes("dinner"));
  const dinnerRecipes = pool.filter((r) => r.meal_types.includes("dinner") || r.meal_types.includes("lunch"));
  const snackRecipes = pool.filter((r) => r.meal_types.includes("snack"));

  // If not enough breakfast recipes, fall back to lunch/dinner pool
  const breakfastPool = breakfastRecipes.length >= 3 ? breakfastRecipes : lunchRecipes;
  const lunchPool = lunchRecipes.length >= 3 ? lunchRecipes : pool;
  const dinnerPool = dinnerRecipes.length >= 3 ? dinnerRecipes : pool;
  const snackPool = snackRecipes.length >= 1 ? snackRecipes : pool;

  const days: DayMealPlan[] = [];
  const usedRecipeIds = new Set<string>();

  for (let d = 1; d <= numDays; d++) {
    const meals: MealSlot[] = [];

    const slots: { slot: MealSlot["slot"]; pool: Recipe[]; target: { kcal: number; protein: number } }[] = [];
    if (mealsPerDay === 3) {
      slots.push({ slot: "Breakfast", pool: breakfastPool, target: perMealTarget.breakfast });
      slots.push({ slot: "Lunch", pool: lunchPool, target: perMealTarget.lunch });
      slots.push({ slot: "Dinner", pool: dinnerPool, target: perMealTarget.dinner });
    } else {
      slots.push({ slot: "Lunch", pool: lunchPool, target: perMealTarget.lunch });
      slots.push({ slot: "Dinner", pool: dinnerPool, target: perMealTarget.dinner });
    }

    for (const { slot, pool: slotPool, target } of slots) {
      // Score and sort, preferring unused recipes for variety
      const scored = slotPool
        .filter((r) => r.nutrition_per_serving)
        .map((r) => ({ recipe: r, score: scoreRecipe(r, target.kcal, target.protein) + (usedRecipeIds.has(r.id) ? 0.3 : 0) }))
        .sort((a, b) => a.score - b.score);

      const picked = scored[0]?.recipe ?? slotPool[0];
      if (picked) usedRecipeIds.add(picked.id);
      meals.push({ slot, recipe: picked });
    }

    // Add a snack if 3 meals + the user's target is high enough
    if (mealsPerDay === 3 && target_kcal > 2200 && snackPool.length > 0) {
      const snack = snackPool[Math.floor(Math.random() * Math.min(snackPool.length, 5))];
      meals.push({ slot: "Snack", recipe: snack });
    }

    const total_kcal = meals.reduce((s, m) => s + (m.recipe.nutrition_per_serving?.kcal ?? 0), 0);
    const total_protein_g = meals.reduce((s, m) => s + (m.recipe.nutrition_per_serving?.protein_g ?? 0), 0);
    const total_carb_g = meals.reduce((s, m) => s + (m.recipe.nutrition_per_serving?.carb_g ?? 0), 0);
    const total_fat_g = meals.reduce((s, m) => s + (m.recipe.nutrition_per_serving?.fat_g ?? 0), 0);

    days.push({ dayNumber: d, meals, total_kcal, total_protein_g, total_carb_g, total_fat_g });
  }

  return {
    days,
    target_calories_kcal: target_kcal,
    target_protein_g: target_protein,
    target_carb_g: target_carb,
    target_fat_g: target_fat,
  };
}
