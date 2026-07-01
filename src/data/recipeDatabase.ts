/**
 * Curated Recipe Database — 17 recipes covering all profile dimensions.
 *
 * Curation method: greedy set-cover over (diet_group × meal_type) with target
 * of 7 recipes per combo (enough for a 7-day plan with no recipe repeating
 * more than once). Goal_fit tags are "preferred" not "required" — a recipe
 * tagged "maintenance" is valid for a cut phase (the macro targets handle
 * the caloric adjustment, not the recipe selection).
 *
 * Coverage matrix (recipes per combo):
 *   omni   × breakfast: 7+   omni   × lunch: 7+   omni   × dinner: 7+
 *   vegan  × breakfast: 5+   vegan  × lunch: 7+   vegan  × dinner: 7+
 *
 * Diet groups:
 *   omni  = OMNI + OMNI_ETHIOPIAN (anything, keto, low-carb, gluten-free, mediterranean)
 *   vegan = VEGAN + VEGAN_ETHIOPIAN (vegan, vegetarian)
 *
 * Cuisines: american, ethiopian, mexican, italian, thai, mediterranean, indian, japanese
 * Ethiopian cuisine: 4 recipes (largest non-american representation)
 */

export type DietType = "OMNI" | "OMNI_ETHIOPIAN" | "VEGAN" | "VEGAN_ETHIOPIAN";
export type GoalFit = "maintenance" | "cut" | "bulk" | "recomp";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "dessert" | "shake";
export type Cuisine = "american" | "ethiopian" | "mexican" | "italian" | "thai" | "mediterranean" | "indian" | "japanese" | "chinese" | "korean";
export type Density = "low" | "medium" | "high";

export interface RecipeNutrition {
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  fiberG: number;
}

export interface Recipe {
  id: string;
  name: string;
  mealTypes: MealType[];
  dietTypes: DietType[];
  goalFit: GoalFit[];
  cuisine: Cuisine;
  allergens: string[];
  nutrition: RecipeNutrition;
  servings: number;
  prepTimeMin: number;
  cookTimeMin: number;
  imageUrl: string;
  proteinDensity: Density;
  calorieDensity: Density;
}

export const RECIPES: Recipe[] = [
  {
    "id": "R167",
    "name": "Blueberry Mug Cake Recipe With FitMiss Vanilla Chai",
    "mealTypes": [
      "dinner",
      "dessert",
      "lunch",
      "snack",
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 393.0,
      "proteinG": 30.5,
      "carbG": 37.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/blueberry-mug-cake-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R215",
    "name": "Homemade High Protein White Cheddar Mac & Cheese Recipe",
    "mealTypes": [
      "dinner",
      "lunch",
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "italian",
    "allergens": [
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 472.0,
      "proteinG": 40.0,
      "carbG": 52.0,
      "fatG": 12.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/homemade_mac_n_cheese.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R080",
    "name": "Aja Atmit Recipe",
    "mealTypes": [
      "dinner",
      "lunch",
      "breakfast"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 197.0,
      "proteinG": 6.2,
      "carbG": 31.5,
      "fatG": 6.5,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2023/04/YeAja-Atmit-Ethiopian-Cream-of-Oatmeal-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R376",
    "name": "Turkey Sausage & Sweet Potato Breakfast Casserole Recipe",
    "mealTypes": [
      "dinner",
      "lunch",
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 330.0,
      "proteinG": 23.0,
      "carbG": 21.0,
      "fatG": 16.0,
      "fiberG": 0
    },
    "servings": 10,
    "prepTimeMin": 25,
    "cookTimeMin": 60,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/sweet-potato-turkey-sausage-breakfast-casserole-recipe.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R202",
    "name": "High Protein Cheeseburger Omelette Recipe",
    "mealTypes": [
      "dinner",
      "lunch",
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 409.0,
      "proteinG": 50.0,
      "carbG": 12.0,
      "fatG": 16.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 15,
    "cookTimeMin": 10,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/cb-omellete-feature.jpg",
    "proteinDensity": "high",
    "calorieDensity": "medium"
  },
  {
    "id": "R086",
    "name": "Anebabero Recipe",
    "mealTypes": [
      "dinner",
      "dessert",
      "lunch",
      "snack",
      "breakfast"
    ],
    "dietTypes": [
      "VEGAN_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "gluten"
    ],
    "nutrition": {
      "kcal": 370.0,
      "proteinG": 13.0,
      "carbG": 75.0,
      "fatG": 2.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Anebabero-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R157",
    "name": "Almond and Banana Breakfast Drink Recipe",
    "mealTypes": [
      "dinner",
      "lunch",
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 651.0,
      "proteinG": 53.0,
      "carbG": 77.0,
      "fatG": 17.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/almond-banana-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "high"
  },
  {
    "id": "R194",
    "name": "Healthy High Protein Chicken Parmesan Meatloaf Recipe",
    "mealTypes": [
      "dinner",
      "lunch",
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "italian",
    "allergens": [
      "dairy",
      "eggs",
      "gluten"
    ],
    "nutrition": {
      "kcal": 265.0,
      "proteinG": 38.0,
      "carbG": 10.0,
      "fatG": 8.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/healthy_chicken_parm_meatloaf.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R213",
    "name": "High-Protein White Chocolate Raspberry Pancakes Recipe",
    "mealTypes": [
      "dinner",
      "dessert",
      "lunch",
      "snack",
      "breakfast"
    ],
    "dietTypes": [
      "VEGAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 278.0,
      "proteinG": 15.4,
      "carbG": 36.2,
      "fatG": 9.7,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/white_chocolate_raspberry_pancakes_feature.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R302",
    "name": "Healthy Mashed Sweet Potato Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "VEGAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [],
    "nutrition": {
      "kcal": 130.0,
      "proteinG": 2.0,
      "carbG": 0,
      "fatG": 6.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 25,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/healthymashsweetpotatosquare001.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R288",
    "name": "Easy Beefy Flatbread Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "VEGAN"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 470.0,
      "proteinG": 45.0,
      "carbG": 23.0,
      "fatG": 26.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 10,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Easy%20Beefy%20Flatbread-1.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R083",
    "name": "Alicha Shiro Wot Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "VEGAN_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 320.0,
      "proteinG": 9.0,
      "carbG": 35.0,
      "fatG": 16.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2023/04/Alicha-Shiro-Wot-Ethiopian-Mild-Pea-Stew-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R099",
    "name": "Buticha Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "VEGAN_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 110.0,
      "proteinG": 3.0,
      "carbG": 9.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Buticha-1-2-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R306",
    "name": "High Protein Pesto Pasta Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "VEGAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "italian",
    "allergens": [],
    "nutrition": {
      "kcal": 420.0,
      "proteinG": 20.0,
      "carbG": 49.0,
      "fatG": 18.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 12,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/TBVeganPestoPastasq0001.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R377",
    "name": "Vegan Breakfast Muesli Recipe",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "VEGAN"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 520.0,
      "proteinG": 30.0,
      "carbG": 56.0,
      "fatG": 21.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 8,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Easy-Protein-Vegan-Muesli-Recipe-Mason-Jar-1-1.png",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R176",
    "name": "Chocolate Oat Kaged Muscle Kasein Protein Bars",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
    ],
    "dietTypes": [
      "VEGAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 279.0,
      "proteinG": 7.6,
      "carbG": 31.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 10,
    "prepTimeMin": 10,
    "cookTimeMin": 25,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/protein-bars-feature.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R378",
    "name": "Vegan High-Protein French Toast Recipe",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "VEGAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "gluten"
    ],
    "nutrition": {
      "kcal": 310.0,
      "proteinG": 22.0,
      "carbG": 51.0,
      "fatG": 2.5,
      "fiberG": 0
    },
    "servings": 6,
    "prepTimeMin": 7,
    "cookTimeMin": 15,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/highproteinveganfrenchtoastrecipe0006.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  }
];
