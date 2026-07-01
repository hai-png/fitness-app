/**
 * Curated Recipe Database — 305 recipes covering all dimensions:
 * - Diet: OMNI, OMNI_ETHIOPIAN, VEGAN, VEGAN_ETHIOPIAN
 * - Goal: maintenance, cut, bulk, recomp
 * - Meal types: breakfast, lunch, dinner, snack, dessert, shake
 * - Cuisine: american, ethiopian, mexican, italian, thai, mediterranean, indian, japanese, chinese, korean
 * - Allergens: dairy, eggs, gluten, sesame, fish, soy (16 combos)
 * - Protein density: low, medium, high
 * - Calorie density: low, medium, high
 *
 * Sourced from recipe_database_uncurated.json (v4.0, 305 curated recipes
 * with published nutrition data). Recipes are used as swap alternatives
 * in the meal delivery system — the user sees meal PRODUCTS (from meals.ts)
 * but can swap to any recipe from this database that matches their diet +
 * allergies + macro targets.
 *
 * The curation method ensures every diet × goal × meal_type combination
 * has at least 3 recipes available:
 * - OMNI × bulk × breakfast: 53 options
 * - VEGAN × cut × dinner: 12 options
 * - VEGAN_ETHIOPIAN × maintenance × lunch: 21 options
 * etc.
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
    "id": "R081",
    "name": "Alicha Ater Kik Wot Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 315.0,
      "proteinG": 4.0,
      "carbG": 14.0,
      "fatG": 28.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 25,
    "cookTimeMin": 35,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2022/12/Alicha-Kik-Wot-Yellow-Lentil-Stew-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R082",
    "name": "Alicha Doro Wot Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 520.0,
      "proteinG": 38.0,
      "carbG": 12.0,
      "fatG": 34.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 60,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2022/12/Alicha-Doro-Wot-Ethiopian-Yellow-Chicken-Stew-225x225.jpg",
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
    "id": "R084",
    "name": "Alicha Siga Wot Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 550.0,
      "proteinG": 41.0,
      "carbG": 10.0,
      "fatG": 41.0,
      "fiberG": 0
    },
    "servings": 7,
    "prepTimeMin": 15,
    "cookTimeMin": 45,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2022/12/Alicha-Siga-Wot-Ethiopian-Yellow-Beef-Stew-225x225.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R085",
    "name": "Ambasha (Himbasha) Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 345.0,
      "proteinG": 6.0,
      "carbG": 45.0,
      "fatG": 16.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 40,
    "cookTimeMin": 35,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2023/04/Ambasha-Recipe-225x225.jpg",
    "proteinDensity": "low",
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
    "id": "R087",
    "name": "Asa Kitfo Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "fish"
    ],
    "nutrition": {
      "kcal": 490.0,
      "proteinG": 42.0,
      "carbG": 5.0,
      "fatG": 34.0,
      "fiberG": 0
    },
    "servings": 6,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2023/04/Asa-Kitfo-Fish-Steak-Tartar-Recipe-225x225.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R088",
    "name": "Asa Shorba Recipe: How to Make Ethiopian-Style Fish Soup",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy",
      "fish"
    ],
    "nutrition": {
      "kcal": 500.0,
      "proteinG": 25.0,
      "carbG": 35.0,
      "fatG": 28.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/YeAsa-Ena-YeDinich-Shorba-Fish-Potato-Soup-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R089",
    "name": "Asa Tibs Recipe: How to Make Ethiopian Stir-Fried Fish",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "fish"
    ],
    "nutrition": {
      "kcal": 480.0,
      "proteinG": 38.0,
      "carbG": 10.0,
      "fatG": 32.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Asa-Tibs-Ethiopian-Stir-Fried-Fish-Recipe-225x225.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R090",
    "name": "Asa Wot Recipe: How to Make Ethiopian Spicy Fish Stew",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "fish"
    ],
    "nutrition": {
      "kcal": 420.0,
      "proteinG": 38.0,
      "carbG": 15.0,
      "fatG": 24.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Asa-Wot-Ethiopian-Spicy-Fish-Stew-Recipe-225x225.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R091",
    "name": "Awaze Dabo Recipe: How to Make A Spicy Traditional Ethiopian Bread",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "gluten"
    ],
    "nutrition": {
      "kcal": 620.0,
      "proteinG": 10.0,
      "carbG": 65.0,
      "fatG": 38.0,
      "fiberG": 0
    },
    "servings": 7,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Awaze-Dabo-Spicy-Ethiopian-Bread-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "high"
  },
  {
    "id": "R092",
    "name": "Awaze Tibs Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "bulk"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 620.0,
      "proteinG": 48.0,
      "carbG": 12.0,
      "fatG": 42.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Awaze-Tibs-Extra-Spicy-Stir-Fried-Beef-Recipe-225x225.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "high"
  },
  {
    "id": "R093",
    "name": "Ayib Recipe: How to Make the Iconic Ethiopian Cottage Cheese",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "kcal": 250.0,
      "proteinG": 17.0,
      "carbG": 8.0,
      "fatG": 23.0,
      "fiberG": 0
    },
    "servings": 500,
    "prepTimeMin": 10,
    "cookTimeMin": 15,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2022/12/Ayib-Ethiopian-Cottage-Cheese-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R094",
    "name": "Azifa Recipe: How to Make Ethiopian Green Lentil Salad",
    "mealTypes": [
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
      "kcal": 210.0,
      "proteinG": 7.0,
      "carbG": 26.0,
      "fatG": 9.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Azifa-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R095",
    "name": "Besso Smoothie Recipe",
    "mealTypes": [
      "dinner",
      "dessert",
      "lunch",
      "snack",
      "shake"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "gluten"
    ],
    "nutrition": {
      "kcal": 116.0,
      "proteinG": 2.0,
      "carbG": 26.0,
      "fatG": 0.5,
      "fiberG": 0
    },
    "servings": 3,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2023/04/YeBesso-Duket-Smoothie-Barley-and-Fruit-Juice-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R096",
    "name": "Bozena Shiro Wot Recipe",
    "mealTypes": [
      "dinner",
      "lunch",
      "dessert",
      "snack"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 560.0,
      "proteinG": 37.0,
      "carbG": 30.0,
      "fatG": 36.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Bozena-Shiro-Wot-Ethiopian-Spiced-Chickpea-and-Beef-Stew-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R097",
    "name": "Bula Atmit Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "kcal": 610.0,
      "proteinG": 17.0,
      "carbG": 60.0,
      "fatG": 40.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/YeBula-Atmit-Ethiopian-False-Banana-Roots-Cream-Drink-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "high"
  },
  {
    "id": "R098",
    "name": "Bula Genfo Recipe: How to Make Ethiopian False Banana Root Porridge",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 335.0,
      "proteinG": 3.0,
      "carbG": 28.0,
      "fatG": 22.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Bula-Genfo-Ethiopian-False-Banana-Root-Porridge-Recipe-225x225.jpg",
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
    "id": "R100",
    "name": "Chechebsa Recipe: How to Make Kita Firfir",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 210.0,
      "proteinG": 3.0,
      "carbG": 23.0,
      "fatG": 10.5,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/1_Chechebsa-1024x576-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R101",
    "name": "Chiko Recipe",
    "mealTypes": [
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 200.0,
      "proteinG": 2.0,
      "carbG": 17.0,
      "fatG": 19.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Chiko-Ethiopian-Spiced-Butter-Cookies-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R102",
    "name": "Dabo Kolo: A Spicy and Addictive Ethiopian Snack",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "kcal": 110.0,
      "proteinG": 1.0,
      "carbG": 16.0,
      "fatG": 4.5,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Dabo-Kollo-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R103",
    "name": "Defo Dabo Recipe",
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
    "allergens": [
      "gluten"
    ],
    "nutrition": {
      "kcal": 230.0,
      "proteinG": 4.9,
      "carbG": 42.0,
      "fatG": 4.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/1_Difo-Dabo-II-1024x576-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R104",
    "name": "Dirkosh Recipe: How to Make Dried Injera Chips",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "kcal": 530.0,
      "proteinG": 3.0,
      "carbG": 25.0,
      "fatG": 48.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Dirkosh-1-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R105",
    "name": "Doro Wot Firfir Recipe",
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
      "kcal": 450.0,
      "proteinG": 18.0,
      "carbG": 45.0,
      "fatG": 22.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/YeDoro-Wot-Firfir-Ethiopian-Chicken-Stew-Firfir-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R106",
    "name": "Doro Wot Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "bulk"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 1250.0,
      "proteinG": 83.0,
      "carbG": 13.0,
      "fatG": 89.0,
      "fiberG": 0
    },
    "servings": 7,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Doro-Wot-1-1-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "high"
  },
  {
    "id": "R107",
    "name": "Duba Wot Recipe: How to Make Ethiopian Pumpkin Stew",
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
      "kcal": 120.0,
      "proteinG": 1.0,
      "carbG": 14.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 3,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Duba-Wot-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R108",
    "name": "Dulet Recipe: How to Make Ethiopian Stir-Fried Tripe and Liver",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 300.0,
      "proteinG": 20.0,
      "carbG": 2.0,
      "fatG": 15.0,
      "fiberG": 0
    },
    "servings": 6,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Dulet-Ethiopian-Fried-Tripe-and-Liver-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R109",
    "name": "Enkulal Firfir Recipe: How to Make Ethiopian-Style Scrambled Eggs",
    "mealTypes": [
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
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 240.0,
      "proteinG": 14.0,
      "carbG": 5.0,
      "fatG": 18.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Enkulal-Tibs-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R110",
    "name": "Ergo Recipe: How to Make Ethiopian Yogurt",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "kcal": 195.0,
      "proteinG": 10.0,
      "carbG": 15.0,
      "fatG": 11.0,
      "fiberG": 0
    },
    "servings": 7,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Ergo-Ethiopian-Yogurt-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R111",
    "name": "Ethiopian Fruits, Vegetables, and Telba Smoothie Recipe",
    "mealTypes": [
      "lunch",
      "shake",
      "snack",
      "dinner"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 70.0,
      "proteinG": 1.5,
      "carbG": 14.0,
      "fatG": 1.5,
      "fiberG": 0
    },
    "servings": 7,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2023/04/Fruits-Vegetables-and-Telba-Flaxseeds-Smoothie-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R112",
    "name": "Ethiopian Ful Medames Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "kcal": 160.0,
      "proteinG": 3.0,
      "carbG": 14.0,
      "fatG": 11.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Ful-Ethiopian-Spicy-Fava-Beans-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R113",
    "name": "Ethiopian Lentil Vegetable Soup Recipe",
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
      "kcal": 300.0,
      "proteinG": 12.0,
      "carbG": 35.0,
      "fatG": 14.0,
      "fiberG": 12.0
    },
    "servings": 4,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2023/04/Lentil-Vegetable-Soup-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R114",
    "name": "Ethiopian Spris Juice Recipe",
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
      "kcal": 440.0,
      "proteinG": 4.0,
      "carbG": 80.0,
      "fatG": 14.0,
      "fiberG": 8.0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Spris-Ethiopian-Layered-Juice-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R115",
    "name": "Fasolia Wot Recipe: How to Make Ethiopian Green Beans Stew",
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
      "kcal": 180.0,
      "proteinG": 4.0,
      "carbG": 20.0,
      "fatG": 8.0,
      "fiberG": 6.0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2023/04/Fossolia-Wot-Ethiopian-String-Beans-Stew-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R116",
    "name": "Firfir Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 320.0,
      "proteinG": 7.0,
      "carbG": 45.0,
      "fatG": 14.0,
      "fiberG": 6.0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Firfir-2-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R117",
    "name": "Fossolia Recipe: How to Make Ethiopian Green Beans Salad",
    "mealTypes": [
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 250.0,
      "proteinG": 3.0,
      "carbG": 22.0,
      "fatG": 14.0,
      "fiberG": 6.0
    },
    "servings": 4,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Fossolia-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R118",
    "name": "Gebs Atmit Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "kcal": 200.0,
      "proteinG": 3.0,
      "carbG": 12.0,
      "fatG": 14.0,
      "fiberG": 2.0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/YeGebs-Atmit-Ethiopian-Barley-Cream-Drink-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R119",
    "name": "Genfo Recipe: How to Make Ethiopian Porridge",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 200.0,
      "proteinG": 4.0,
      "carbG": 22.0,
      "fatG": 10.0,
      "fiberG": 3.0
    },
    "servings": 1,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/01/Genfo-01-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R120",
    "name": "Gomen Besiga Recipe: How to Make Ethiopian Collard Green Salad with Meat",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "kcal": 320.0,
      "proteinG": 18.0,
      "carbG": 8.0,
      "fatG": 24.0,
      "fiberG": 4.0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Gomen-Besiga-2-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R121",
    "name": "Gomen Recipe: How to Make Ethiopian Collard Green Salad",
    "mealTypes": [
      "lunch"
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
      "kcal": 180.0,
      "proteinG": 4.0,
      "carbG": 12.0,
      "fatG": 12.0,
      "fiberG": 6.0
    },
    "servings": 3,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Gomen-1-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R122",
    "name": "Gored Gored Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "bulk"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 650.0,
      "proteinG": 45.0,
      "carbG": 2.0,
      "fatG": 30.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Gored-Gored-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "high"
  },
  {
    "id": "R123",
    "name": "Gubet Tibs Recipe: How to Make Ethiopian Fried Liver",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 400.0,
      "proteinG": 50.0,
      "carbG": 8.0,
      "fatG": 10.0,
      "fiberG": 0
    },
    "servings": 6,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Gubet-Tibs-Ethiopian-Fried-Liver-Recipe-225x225.jpg",
    "proteinDensity": "high",
    "calorieDensity": "medium"
  },
  {
    "id": "R124",
    "name": "Ingudai Tibs Recipe: How to Make Ethiopian Saut\u00e9ed Mushrooms",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "kcal": 220.0,
      "proteinG": 6.0,
      "carbG": 18.0,
      "fatG": 12.0,
      "fiberG": 4.0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Ingudai-Tibs-Ethiopian-Sauteed-Mushrooms-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R125",
    "name": "Injera Recipe: How to Make the Iconic Ethiopian Flatbread",
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
    "allergens": [
      "gluten"
    ],
    "nutrition": {
      "kcal": 100.0,
      "proteinG": 3.0,
      "carbG": 20.0,
      "fatG": 1.0,
      "fiberG": 2.0
    },
    "servings": 4,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Injera-1-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R126",
    "name": "Kategna Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "kcal": 360.0,
      "proteinG": 4.0,
      "carbG": 22.0,
      "fatG": 28.0,
      "fiberG": 2.0
    },
    "servings": 4,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/04/Kategna-HQ-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R127",
    "name": "Key Sir Recipe: How to Make Ethiopian Beets and Potatoes Salad",
    "mealTypes": [
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
      "kcal": 300.0,
      "proteinG": 6.0,
      "carbG": 48.0,
      "fatG": 9.0,
      "fiberG": 10.0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Key-Sir-Ethiopian-Beets-and-Potatoes-Salad-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R128",
    "name": "Key Wot Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "bulk"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 650.0,
      "proteinG": 38.0,
      "carbG": 10.0,
      "fatG": 50.0,
      "fiberG": 2.0
    },
    "servings": 7,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Key-Wot-2-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "high"
  },
  {
    "id": "R129",
    "name": "Kikil Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 450.0,
      "proteinG": 25.0,
      "carbG": 18.0,
      "fatG": 30.0,
      "fiberG": 4.0
    },
    "servings": 7,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Kikil-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R130",
    "name": "Kinche Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 200.0,
      "proteinG": 5.0,
      "carbG": 22.0,
      "fatG": 10.0,
      "fiberG": 2.0
    },
    "servings": 1,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Kinche-2-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R131",
    "name": "Kita (Kicha) Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 220.0,
      "proteinG": 4.0,
      "carbG": 32.0,
      "fatG": 7.0,
      "fiberG": 3.0
    },
    "servings": 4,
    "prepTimeMin": 30,
    "cookTimeMin": 20,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2023/04/Kita-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R132",
    "name": "Kitfo Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "bulk"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 900.0,
      "proteinG": 85.0,
      "carbG": 0,
      "fatG": 21.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Kitfo-2-1-1-225x225.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "high"
  },
  {
    "id": "R133",
    "name": "Kocho Recipe",
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
      "kcal": 200.0,
      "proteinG": 3.0,
      "carbG": 45.0,
      "fatG": 0.5,
      "fiberG": 10.0
    },
    "servings": 4,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2023/04/Kocho-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R134",
    "name": "Kolo: The Ultimate Crunchy Ethiopian Snack",
    "mealTypes": [
      "snack",
      "dessert"
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
      "kcal": 150.0,
      "proteinG": 4.0,
      "carbG": 10.0,
      "fatG": 12.0,
      "fiberG": 4.0
    },
    "servings": 1,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Kolo-1-2-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R135",
    "name": "Minchet Abish Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "kcal": 600.0,
      "proteinG": 25.0,
      "carbG": 10.0,
      "fatG": 40.0,
      "fiberG": 2.0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Minchet-Abish-2-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "high"
  },
  {
    "id": "R136",
    "name": "Misir Kik Wot Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "kcal": 280.0,
      "proteinG": 14.0,
      "carbG": 32.0,
      "fatG": 10.0,
      "fiberG": 12.0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Misir-Wot-1-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R137",
    "name": "Misir Sambusa Recipe: How to Make Ethiopian Lentil Samosa",
    "mealTypes": [
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 200.0,
      "proteinG": 4.0,
      "carbG": 18.0,
      "fatG": 12.0,
      "fiberG": 3.0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/YeMisir-Sambusa-Ethiopian-Lentil-Samosa-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R138",
    "name": "Quanta Firfir Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 550.0,
      "proteinG": 30.0,
      "carbG": 35.0,
      "fatG": 30.0,
      "fiberG": 4.0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Quanta-Firfir-1-1-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R139",
    "name": "Quanta: How to Make Ethiopian Spiced Beef Jerky",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 320.0,
      "proteinG": 30.0,
      "carbG": 2.0,
      "fatG": 22.0,
      "fiberG": 0
    },
    "servings": 10,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2023/04/Quanta-Ethiopian-Spiced-Beef-Jerky-Recipe-225x225.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R140",
    "name": "Shimbra Alicha Fitfit Recipe",
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
      "kcal": 650.0,
      "proteinG": 14.0,
      "carbG": 45.0,
      "fatG": 50.0,
      "fiberG": 12.0
    },
    "servings": 3,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2023/04/YeShinbera-Alicha-Fitfit-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "high"
  },
  {
    "id": "R141",
    "name": "Shimbra Asa Wot Recipe",
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
      "kcal": 700.0,
      "proteinG": 12.0,
      "carbG": 40.0,
      "fatG": 55.0,
      "fiberG": 8.0
    },
    "servings": 6,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2025/04/Shimbra-Asa-Wot-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "high"
  },
  {
    "id": "R142",
    "name": "Shimbra Kita (Kicha) Recipe",
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
      "kcal": 140.0,
      "proteinG": 6.0,
      "carbG": 20.0,
      "fatG": 2.5,
      "fiberG": 3.0
    },
    "servings": 2,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Shimbra-Chickpea-Kita-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R143",
    "name": "Shiro Wot Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "kcal": 450.0,
      "proteinG": 10.0,
      "carbG": 65.0,
      "fatG": 38.0,
      "fiberG": 5.0
    },
    "servings": 3,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Shiro-1-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R144",
    "name": "Siga Shorba Recipe: How to Make Ethiopian-Style Beef Soup",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 450.0,
      "proteinG": 12.0,
      "carbG": 30.0,
      "fatG": 15.0,
      "fiberG": 3.0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/YeSiga-Ena-YeAtkilit-Shorba-Ethiopian-Beef-Vegetable-Soup-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R145",
    "name": "Suf Fitfit Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 360.0,
      "proteinG": 11.0,
      "carbG": 28.0,
      "fatG": 24.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 35,
    "cookTimeMin": 15,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Yesuf-Fitfit-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R146",
    "name": "Suf Weha Recipe: How to Make Ethiopian Safflower Juice",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 430.0,
      "proteinG": 10.0,
      "carbG": 18.0,
      "fatG": 38.0,
      "fiberG": 0
    },
    "servings": 6,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2023/04/YeSuf-Weha-Ethiopian-Sunflower-Seeds-Juice-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R147",
    "name": "Telba Fitfit Recipe",
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
      "kcal": 248.0,
      "proteinG": 10.0,
      "carbG": 21.0,
      "fatG": 19.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/YeTelba-Fitfit-Ethiopian-Flaxseed-Fitfit-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R148",
    "name": "Telba Juice Recipe: How to Make Ethiopian Flaxseed Drink",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 130.0,
      "proteinG": 4.0,
      "carbG": 12.0,
      "fatG": 8.0,
      "fiberG": 0
    },
    "servings": 6,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2023/04/Telba-Ethiopian-Flaxseed-Beverage-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R149",
    "name": "Tibs Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 480.0,
      "proteinG": 28.0,
      "carbG": 12.0,
      "fatG": 34.0,
      "fiberG": 0
    },
    "servings": 3,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Tibs-2-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R150",
    "name": "Tikil Gomen Recipe: How to Make Authentic Ethiopian Cabbage Salad",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 140.0,
      "proteinG": 2.0,
      "carbG": 14.0,
      "fatG": 11.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Tikil-Gomen-1-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R151",
    "name": "Timatim Salad Recipe: How to Make Ethiopian-Style Tomato Salad",
    "mealTypes": [
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 210.0,
      "proteinG": 2.0,
      "carbG": 18.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Timatim-Salad-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R152",
    "name": "Tosign Shai Recipe: How to Make Ethiopian-Style Thyme Tea",
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
      "kcal": 5.0,
      "proteinG": 0.1,
      "carbG": 1.0,
      "fatG": 0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2024/02/Tosign-Shai-Ethiopian-Thyme-Tea-Recipe-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R153",
    "name": "YeBeg Alicha Wot Recipe: How to Make Ethiopian Mild Lamb Stew",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 600.0,
      "proteinG": 40.0,
      "carbG": 10.0,
      "fatG": 45.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Alicha-Wot-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "high"
  },
  {
    "id": "R154",
    "name": "YeBeg Key Wot Recipe: How to Make Ethiopian Spicy Lamb Stew",
    "mealTypes": [
      "dinner",
      "lunch",
      "dessert",
      "snack"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [],
    "nutrition": {
      "kcal": 600.0,
      "proteinG": 32.0,
      "carbG": 18.0,
      "fatG": 42.0,
      "fiberG": 0
    },
    "servings": 7,
    "prepTimeMin": 15,
    "cookTimeMin": 50,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/2022/12/YeBeg-Wot-Ethiopian-Lamb-Stew-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "high"
  },
  {
    "id": "R155",
    "name": "Zilzil Tibs Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI_ETHIOPIAN"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "ethiopian",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 450.0,
      "proteinG": 28.0,
      "carbG": 12.0,
      "fatG": 32.0,
      "fiberG": 0
    },
    "servings": 3,
    "prepTimeMin": 30,
    "cookTimeMin": 40,
    "imageUrl": "https://ethiopian-food.org/wp-content/uploads/Zilzil-Tibs-1-1-225x225.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R156",
    "name": "3 Ingredient Chocolate Protein Mug Cake Recipe",
    "mealTypes": [
      "snack",
      "dessert"
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
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 331.0,
      "proteinG": 33.0,
      "carbG": 32.0,
      "fatG": 5.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/mugcake800.jpg",
    "proteinDensity": "medium",
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
    "id": "R158",
    "name": "Amoretti Easy Banana Nut Protein Shake Recipe",
    "mealTypes": [
      "shake",
      "snack"
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
      "kcal": 521.0,
      "proteinG": 34.0,
      "carbG": 36.0,
      "fatG": 19.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/easy_banana_nut_protein_shake.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R159",
    "name": "Antoine Vaillant's Anabolic Tropic Protein Shake Recipe",
    "mealTypes": [
      "lunch",
      "shake",
      "snack",
      "dinner"
    ],
    "dietTypes": [
      "VEGAN"
    ],
    "goalFit": [
      "bulk"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 1320.0,
      "proteinG": 55.0,
      "carbG": 264.0,
      "fatG": 5.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/antoine_vaillant_anabolic_protein_shake.jpg",
    "proteinDensity": "low",
    "calorieDensity": "high"
  },
  {
    "id": "R160",
    "name": "Baked Spinach, Mushroom & Gouda Quiche Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 170.0,
      "proteinG": 19.1,
      "carbG": 4.7,
      "fatG": 8.9,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/quche-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R161",
    "name": "Banana And Oats Protein Shake Recipe",
    "mealTypes": [
      "shake",
      "snack",
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 554.0,
      "proteinG": 59.0,
      "carbG": 68.2,
      "fatG": 6.1,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/banana-and-oat-protein-shake.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R162",
    "name": "Banana Walnut Protein Bars Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 204.0,
      "proteinG": 16.0,
      "carbG": 22.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/walnut-protein-bar-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R163",
    "name": "Banana, Cinnamon and Peanut Butter Protein Shake Recipe",
    "mealTypes": [
      "shake",
      "snack"
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 391.0,
      "proteinG": 38.0,
      "carbG": 42.4,
      "fatG": 10.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/banana-cinnamon-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R164",
    "name": "Beef Chop Suey Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "chinese",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 490.0,
      "proteinG": 38.0,
      "carbG": 50.0,
      "fatG": 16.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/chop-suey-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R165",
    "name": "Berry-Nutty Breakfast Oat Bars Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 164.0,
      "proteinG": 5.0,
      "carbG": 27.0,
      "fatG": 4.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/fruit-bars-450.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R166",
    "name": "Black Forest Protein Brownies Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 146.0,
      "proteinG": 14.0,
      "carbG": 22.0,
      "fatG": 2.0,
      "fiberG": 0
    },
    "servings": 8,
    "prepTimeMin": 15,
    "cookTimeMin": 25,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/black-forest-brownies-feature.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
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
    "id": "R168",
    "name": "Bodybuilder's Double Beef & Bacon Cheeseburger Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 475.0,
      "proteinG": 53.1,
      "carbG": 19.2,
      "fatG": 17.3,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/smokehouse_bacon_double_white_cheddar_burger.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R169",
    "name": "Bodybuilders Lean Beef Enchiladas Recipes",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 470.0,
      "proteinG": 52.0,
      "carbG": 49.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/beef_enchiladas_recipe.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R170",
    "name": "Bodybuilders Low Fat Chicken Curry Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "indian",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 373.0,
      "proteinG": 32.0,
      "carbG": 35.0,
      "fatG": 13.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/bodybuilders-curry-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R171",
    "name": "Bodybuilders' Steak & Grilled Cheese Sandwich Recipe",
    "mealTypes": [
      "lunch"
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
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 391.0,
      "proteinG": 38.3,
      "carbG": 35.5,
      "fatG": 9.5,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/bodybuilders_steak_grilled_cheese_sandwich_recipe.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R172",
    "name": "Braised Beef Blumenberg With Mushrooms And Cauliflower Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 206.0,
      "proteinG": 29.0,
      "carbG": 5.5,
      "fatG": 7.5,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/braised-beef-450.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R173",
    "name": "Cheesey Baked Zucchini Eggs Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 149.5,
      "proteinG": 19.5,
      "carbG": 6.0,
      "fatG": 4.9,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/eggs-450.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R174",
    "name": "Chicken Marsala On A Bed Of Zuchinni Noodles Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk"
    ],
    "cuisine": "american",
    "allergens": [
      "gluten"
    ],
    "nutrition": {
      "kcal": 655.0,
      "proteinG": 70.0,
      "carbG": 33.0,
      "fatG": 27.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/chicken-marsala-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "high"
  },
  {
    "id": "R175",
    "name": "Chocolate Banana Oat Protein Muffins Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 146.0,
      "proteinG": 7.4,
      "carbG": 17.2,
      "fatG": 5.6,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/protein-muffins-450.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
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
    "id": "R177",
    "name": "Chocolate Peanut Butter Cup Protein Mugcake",
    "mealTypes": [
      "snack",
      "dessert"
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
      "dairy",
      "eggs",
      "gluten"
    ],
    "nutrition": {
      "kcal": 335.0,
      "proteinG": 33.0,
      "carbG": 36.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 10,
    "cookTimeMin": 2,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/choc-pb-mug-cake-feature_0.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R178",
    "name": "Chocolate Peanut Butter Protein Bark Recipe",
    "mealTypes": [
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 220.0,
      "proteinG": 24.0,
      "carbG": 13.0,
      "fatG": 8.0,
      "fiberG": 0
    },
    "servings": 3,
    "prepTimeMin": 10,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/pb-fudge-bark.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R179",
    "name": "Chocolate Peanut Butter Protein Granola Recipe",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 116.0,
      "proteinG": 5.0,
      "carbG": 14.0,
      "fatG": 5.0,
      "fiberG": 0
    },
    "servings": 10,
    "prepTimeMin": 10,
    "cookTimeMin": 25,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/choc-pb-granola-feature.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R180",
    "name": "Cinnamon French Toast With Strawberries Recipe",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [
      "eggs",
      "gluten"
    ],
    "nutrition": {
      "kcal": 292.0,
      "proteinG": 16.0,
      "carbG": 39.0,
      "fatG": 8.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/cinnamon-french-toast-450.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R181",
    "name": "Crunchy Protein Treats Made With Rice Krispies",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 131.0,
      "proteinG": 7.0,
      "carbG": 18.0,
      "fatG": 4.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/protein_treats_made_with_rice_krispies.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R182",
    "name": "Deep Dish Pepperoni Pizza Lasagna Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "italian",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 520.0,
      "proteinG": 57.0,
      "carbG": 38.0,
      "fatG": 17.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 20,
    "cookTimeMin": 30,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/pepperoni-pizza-lasagna.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R183",
    "name": "Double Chocolate Protein Avocado Brownies Recipe",
    "mealTypes": [
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 174.0,
      "proteinG": 8.0,
      "carbG": 17.0,
      "fatG": 8.0,
      "fiberG": 0
    },
    "servings": 9,
    "prepTimeMin": 5,
    "cookTimeMin": 35,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/brownies-feature.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R184",
    "name": "Drizzled Protein Coated Almond Bites Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 223.0,
      "proteinG": 22.0,
      "carbG": 8.0,
      "fatG": 13.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/almond-bites-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R185",
    "name": "FitMiss Vanilla Chai Protein Muffins Recipe",
    "mealTypes": [
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 77.0,
      "proteinG": 8.7,
      "carbG": 5.6,
      "fatG": 2.3,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/vanilla-chai-muffins-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R186",
    "name": "Game Day Bulking Nachos Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 589.0,
      "proteinG": 43.0,
      "carbG": 56.0,
      "fatG": 26.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/bulking_nachos.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R187",
    "name": "Grill Healthy: Spicy Sriracha Lean Beef Burger Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 446.0,
      "proteinG": 58.0,
      "carbG": 27.2,
      "fatG": 9.9,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/spicy-sriracha-burger-featured.jpg",
    "proteinDensity": "high",
    "calorieDensity": "medium"
  },
  {
    "id": "R188",
    "name": "Half Pound Teriyaki Turkey Burger Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "japanese",
    "allergens": [
      "sesame"
    ],
    "nutrition": {
      "kcal": 513.0,
      "proteinG": 63.0,
      "carbG": 54.0,
      "fatG": 5.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 5,
    "cookTimeMin": 20,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/teryaki-vurger-feature-1.jpg",
    "proteinDensity": "high",
    "calorieDensity": "medium"
  },
  {
    "id": "R189",
    "name": "Healthy & Delicious Apple Turnover Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 357.0,
      "proteinG": 6.0,
      "carbG": 50.0,
      "fatG": 19.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 20,
    "cookTimeMin": 20,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/apple-turnover-feature.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R190",
    "name": "Healthy Chili Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 488.0,
      "proteinG": 36.8,
      "carbG": 51.0,
      "fatG": 15.4,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/healthy-chili-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R191",
    "name": "Healthy Chocolate Peanut Butter Caramel Apples Recipe",
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
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 271.0,
      "proteinG": 13.0,
      "carbG": 47.0,
      "fatG": 8.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/halloween_apples_macros.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R192",
    "name": "Healthy Chocolate Peanut Butter Protein Brownies Recipe",
    "mealTypes": [
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 141.0,
      "proteinG": 14.0,
      "carbG": 17.0,
      "fatG": 4.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/chocolate_peanut_butter_protein_brownies_recipe.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R193",
    "name": "Healthy Chocolate Raspberry Dessert Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 159.0,
      "proteinG": 9.0,
      "carbG": 21.0,
      "fatG": 5.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/healthy-raspberry-dessert-450.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
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
    "id": "R195",
    "name": "Healthy High Protein Cinnamon Coffee Cake Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 194.0,
      "proteinG": 21.5,
      "carbG": 18.9,
      "fatG": 4.2,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/protein-coffee-cake-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R196",
    "name": "Healthy Low Cal Lasagna Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "kcal": 205.0,
      "proteinG": 25.6,
      "carbG": 18.6,
      "fatG": 3.6,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/healthy-lasagna.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R197",
    "name": "Healthy, High Protein Strawberry Toaster Strudel Recipe",
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
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 114.0,
      "proteinG": 17.0,
      "carbG": 10.5,
      "fatG": 4.3,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/strawberry-450.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R198",
    "name": "Healthy, Tasty Almond Butter Cookie Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 120.0,
      "proteinG": 6.9,
      "carbG": 7.9,
      "fatG": 6.7,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/almond-cookies-450.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R199",
    "name": "Hearty Pumpkin Spice Protein Waffles Recipe",
    "mealTypes": [
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 400.0,
      "proteinG": 46.0,
      "carbG": 43.0,
      "fatG": 5.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/pumpkin_spice_protein_waffles.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R200",
    "name": "High Protein Blueberry Almond Pancakes Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 779.0,
      "proteinG": 87.0,
      "carbG": 78.0,
      "fatG": 16.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 10,
    "cookTimeMin": 20,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/untitled_design.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "high"
  },
  {
    "id": "R201",
    "name": "High Protein Breakfast Banana Split Recipe",
    "mealTypes": [
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 427.0,
      "proteinG": 49.0,
      "carbG": 42.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 40,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/banana-split-feature.jpg",
    "proteinDensity": "medium",
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
    "id": "R203",
    "name": "High Protein Chicken Meatballs Recipe",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 519.0,
      "proteinG": 57.0,
      "carbG": 32.0,
      "fatG": 15.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 10,
    "cookTimeMin": 15,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/chicken-meatball-recipe-feature.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R204",
    "name": "High Protein Chipotle Cheddar Vegetarian Quesadilla Recipe",
    "mealTypes": [
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "mexican",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 287.0,
      "proteinG": 32.6,
      "carbG": 29.8,
      "fatG": 10.6,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/chipotle-cheddar-veggie-quesadilla-featured.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R205",
    "name": "High Protein Chocolate Peanut Butter Pancakes Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
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
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 340.0,
      "proteinG": 42.0,
      "carbG": 25.0,
      "fatG": 8.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 15,
    "cookTimeMin": 20,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/pb-pancakes-feature.jpg",
    "proteinDensity": "high",
    "calorieDensity": "medium"
  },
  {
    "id": "R206",
    "name": "High Protein Churro Scones Recipe",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 266.0,
      "proteinG": 12.0,
      "carbG": 32.0,
      "fatG": 10.0,
      "fiberG": 0
    },
    "servings": 8,
    "prepTimeMin": 15,
    "cookTimeMin": 25,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/churro-protein-scone-thumb.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R207",
    "name": "High Protein Fruit & Yogurt Squares Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 63.0,
      "proteinG": 8.0,
      "carbG": 5.5,
      "fatG": 1.0,
      "fiberG": 0
    },
    "servings": 6,
    "prepTimeMin": 10,
    "cookTimeMin": 120,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/fruit-squares-feature.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R208",
    "name": "High Protein Grilled Chili Cheese Fries Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 463.0,
      "proteinG": 33.0,
      "carbG": 47.0,
      "fatG": 15.0,
      "fiberG": 0
    },
    "servings": 6,
    "prepTimeMin": 5,
    "cookTimeMin": 30,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/chili-cheese-fries-feature.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R209",
    "name": "High Protein Lean Turkey Reuben Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "gluten"
    ],
    "nutrition": {
      "kcal": 410.0,
      "proteinG": 49.0,
      "carbG": 28.0,
      "fatG": 11.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/high-protein-turkey-reuben.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R210",
    "name": "High Protein Ranch Turkey Burger Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
    "allergens": [],
    "nutrition": {
      "kcal": 345.0,
      "proteinG": 49.0,
      "carbG": 29.0,
      "fatG": 3.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 5,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/ranch_turkey_burger.jpg",
    "proteinDensity": "high",
    "calorieDensity": "medium"
  },
  {
    "id": "R211",
    "name": "High Protein Strawberry Shortcake Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 240.0,
      "proteinG": 24.0,
      "carbG": 27.0,
      "fatG": 4.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 15,
    "cookTimeMin": 7,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/strawberry-shortcake-feature.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R212",
    "name": "High-Protein Grilled Chicken Gyros Recipe",
    "mealTypes": [
      "lunch"
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 359.0,
      "proteinG": 57.7,
      "carbG": 22.5,
      "fatG": 7.9,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/high-protein-grilled-chicken-gyros-recipe.jpg",
    "proteinDensity": "high",
    "calorieDensity": "medium"
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
    "id": "R214",
    "name": "Holiday Season Sweet Potato Casserole Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 235.0,
      "proteinG": 7.0,
      "carbG": 39.0,
      "fatG": 6.0,
      "fiberG": 0
    },
    "servings": 8,
    "prepTimeMin": 20,
    "cookTimeMin": 40,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/sweet-potato-casserole-feature.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
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
    "id": "R216",
    "name": "Honey BBQ Slow Cooker Chicken Wings Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 347.0,
      "proteinG": 21.0,
      "carbG": 25.0,
      "fatG": 18.0,
      "fiberG": 0
    },
    "servings": 12,
    "prepTimeMin": 20,
    "cookTimeMin": 180,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/hone-bbq-wings-feature.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R217",
    "name": "Jen Jewell's Bikini Booty Protein Smoothie Recipe",
    "mealTypes": [
      "shake",
      "snack"
    ],
    "dietTypes": [
      "VEGAN"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 295.0,
      "proteinG": 30.0,
      "carbG": 27.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/bikini_booty.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R218",
    "name": "Joe Ohrablo's Protein Oatmeal Pancakes Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
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
      "kcal": 445.0,
      "proteinG": 30.0,
      "carbG": 50.0,
      "fatG": 13.7,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/ohrablo-pancakes-450.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R219",
    "name": "Kurt Weidner's Saturday Blueberry Muffins Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
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
      "eggs"
    ],
    "nutrition": {
      "kcal": 476.0,
      "proteinG": 39.0,
      "carbG": 53.0,
      "fatG": 12.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/kuty-blueberry-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R220",
    "name": "Kurt Weidner's Sweet Potato Waffles Recipe",
    "mealTypes": [
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
      "eggs"
    ],
    "nutrition": {
      "kcal": 415.0,
      "proteinG": 41.0,
      "carbG": 45.0,
      "fatG": 2.5,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/weidner-waffles-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R221",
    "name": "Leftover Roast Turkey BLT Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 381.0,
      "proteinG": 53.0,
      "carbG": 22.0,
      "fatG": 9.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/leftover_roast_turkey_blt_recipe.jpg",
    "proteinDensity": "high",
    "calorieDensity": "medium"
  },
  {
    "id": "R222",
    "name": "Low Calorie Chocolate Protein Cupcakes Recipe",
    "mealTypes": [
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 121.0,
      "proteinG": 14.0,
      "carbG": 5.0,
      "fatG": 5.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/chocolate_protein_cupcakes.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R223",
    "name": "Low Calorie Pizza Rolls Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "italian",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 116.0,
      "proteinG": 5.0,
      "carbG": 14.0,
      "fatG": 5.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 30,
    "cookTimeMin": 15,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/pizza-rolls-feature.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R224",
    "name": "Low-Fat, High-Protein Vegetarian BBQ Cobb Salad Recipe",
    "mealTypes": [
      "lunch",
      "dessert",
      "snack"
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
      "kcal": 372.0,
      "proteinG": 39.7,
      "carbG": 50.7,
      "fatG": 1.2,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/protein_packed_vegetarian_bbq_cobb_salad_feature.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R225",
    "name": "Mexican Style Stuffed Peppers Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 328.0,
      "proteinG": 43.0,
      "carbG": 39.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 20,
    "cookTimeMin": 30,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/stuffed-bell-peppers-feature.jpg",
    "proteinDensity": "high",
    "calorieDensity": "medium"
  },
  {
    "id": "R226",
    "name": "Mini Turkey Cheddar & Peppers Quiche Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "italian",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 85.0,
      "proteinG": 9.0,
      "carbG": 1.0,
      "fatG": 5.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/quiche.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R227",
    "name": "Monster Mass Turbo Bulking Oatmeal Recipe",
    "mealTypes": [
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
      "kcal": 895.0,
      "proteinG": 62.0,
      "carbG": 103.0,
      "fatG": 27.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/monster-mass-450.jpg",
    "proteinDensity": "low",
    "calorieDensity": "high"
  },
  {
    "id": "R228",
    "name": "Muscle Mac Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "sesame"
    ],
    "nutrition": {
      "kcal": 629.0,
      "proteinG": 63.0,
      "carbG": 57.0,
      "fatG": 15.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 15,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/ms_mac.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "high"
  },
  {
    "id": "R229",
    "name": "No Powder, No Problem - Tuna Protein Shake Recipe",
    "mealTypes": [
      "lunch",
      "shake",
      "snack",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "fish"
    ],
    "nutrition": {
      "kcal": 703.0,
      "proteinG": 52.0,
      "carbG": 64.0,
      "fatG": 29.5,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/tuna-shake-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "high"
  },
  {
    "id": "R230",
    "name": "Nutritious Hot Body Turkey Chili Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 228.0,
      "proteinG": 33.0,
      "carbG": 22.0,
      "fatG": 2.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/turkey-chili-450.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R231",
    "name": "Peach Mango Protein Soft Serve Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 355.0,
      "proteinG": 35.0,
      "carbG": 42.0,
      "fatG": 4.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 15,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/peach-mango-feature.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R232",
    "name": "Peanut Butter Chocolate Chip Protein French Toast Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
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
      "eggs",
      "gluten"
    ],
    "nutrition": {
      "kcal": 450.0,
      "proteinG": 40.0,
      "carbG": 46.0,
      "fatG": 13.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 5,
    "cookTimeMin": 10,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/pb-cc-french-toast.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R233",
    "name": "Peanut Butter Maple Glaze Banana Bread Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 122.0,
      "proteinG": 4.0,
      "carbG": 21.0,
      "fatG": 4.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/peanut-butter-450_0.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R234",
    "name": "Protein Packed Chili Dog Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 531.0,
      "proteinG": 55.0,
      "carbG": 44.0,
      "fatG": 15.0,
      "fiberG": 0
    },
    "servings": 3,
    "prepTimeMin": 10,
    "cookTimeMin": 30,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/chili-dog-feature.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R235",
    "name": "Protein Packed Chocolate Ice Cream Sandwiches Recipe",
    "mealTypes": [
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 241.0,
      "proteinG": 25.0,
      "carbG": 28.5,
      "fatG": 3.0,
      "fiberG": 0
    },
    "servings": 3,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/protein-packed-chocolate-ice-cream-sandwiches-featured.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R236",
    "name": "Protein Packed Grilled Steak Burrito Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 571.0,
      "proteinG": 58.0,
      "carbG": 32.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/protein_packed_grilled_steak_burrito.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R237",
    "name": "Protein Packed Puppy Chow Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 218.0,
      "proteinG": 14.2,
      "carbG": 19.0,
      "fatG": 9.6,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/protein-puppy-chow.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R238",
    "name": "Protein Packed Sweet Potato Shepherds Pie",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 428.0,
      "proteinG": 53.0,
      "carbG": 36.0,
      "fatG": 9.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 10,
    "cookTimeMin": 60,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/shepherds_pie.jpg",
    "proteinDensity": "high",
    "calorieDensity": "medium"
  },
  {
    "id": "R239",
    "name": "Protein Pumpkin Pancakes With Oats Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
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
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 370.0,
      "proteinG": 41.0,
      "carbG": 23.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/protein-pumpkin-pancakes-450.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R240",
    "name": "Protein-Packed Smoky Bison Chili Recipe",
    "mealTypes": [
      "dinner",
      "lunch",
      "dessert",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 405.0,
      "proteinG": 41.2,
      "carbG": 29.2,
      "fatG": 13.7,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/bison_feature.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R241",
    "name": "Pulled BBQ Chicken Potato Skins Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 327.0,
      "proteinG": 38.0,
      "carbG": 28.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 80,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/bbq-chicken-potato-skin-recipe.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R242",
    "name": "Pumpkin Spice Protein Donuts With Cream Cheese Frosting Recipe",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 179.0,
      "proteinG": 10.0,
      "carbG": 23.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 8,
    "prepTimeMin": 15,
    "cookTimeMin": 10,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/pumpkin-donuts-feature.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R243",
    "name": "Quick & Easy Protein Brown Rice Pudding Recipe",
    "mealTypes": [
      "shake",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 244.0,
      "proteinG": 18.0,
      "carbG": 26.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 25,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/brown-rice-pudding-feature.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R244",
    "name": "RJ Perkins' Pumpkin Spice Pancakes Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
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
      "eggs"
    ],
    "nutrition": {
      "kcal": 460.0,
      "proteinG": 25.0,
      "carbG": 75.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/rj-perkins-4501.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R245",
    "name": "Red Velvet Protein Pancakes Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
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
      "kcal": 609.0,
      "proteinG": 74.0,
      "carbG": 58.0,
      "fatG": 9.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 15,
    "cookTimeMin": 15,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/red-velvet-feature.jpg",
    "proteinDensity": "high",
    "calorieDensity": "high"
  },
  {
    "id": "R246",
    "name": "Salsa And Chicken Whole Wheat Pizza Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 505.0,
      "proteinG": 33.5,
      "carbG": 44.5,
      "fatG": 25.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/chicken-salsa-pizza.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R247",
    "name": "Scivation Whey Cupcakes Recipe by Debi",
    "mealTypes": [
      "dinner",
      "lunch",
      "dessert",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 104.0,
      "proteinG": 22.0,
      "carbG": 1.0,
      "fatG": 1.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/scivation-whey-cupcake-450.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R248",
    "name": "Scrambled Eggs With Cheese Recipe",
    "mealTypes": [
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
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 370.0,
      "proteinG": 45.0,
      "carbG": 20.0,
      "fatG": 19.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/scrambled-eggs-cheese-450.jpg",
    "proteinDensity": "high",
    "calorieDensity": "medium"
  },
  {
    "id": "R249",
    "name": "Sesame CranButter Sirloin Steak Tip Skewers Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "american",
    "allergens": [
      "sesame"
    ],
    "nutrition": {
      "kcal": 274.0,
      "proteinG": 33.6,
      "carbG": 10.2,
      "fatG": 10.4,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/ss_feature.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R250",
    "name": "Shaun's Chili Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
    "allergens": [],
    "nutrition": {
      "kcal": 360.0,
      "proteinG": 30.5,
      "carbG": 25.4,
      "fatG": 15.5,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/shaun-chili-280.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R251",
    "name": "Simple & Creamy Protein Tiramisu Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 264.0,
      "proteinG": 28.0,
      "carbG": 34.0,
      "fatG": 3.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 20,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/tiramisu-feature.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R252",
    "name": "Simple Low Carb Orange Chicken Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "american",
    "allergens": [
      "sesame"
    ],
    "nutrition": {
      "kcal": 290.0,
      "proteinG": 53.0,
      "carbG": 18.0,
      "fatG": 3.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 15,
    "cookTimeMin": 30,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/orange_chicken.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R253",
    "name": "Single Serve High Protein Apple Butter Cake Recipe",
    "mealTypes": [
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 239.0,
      "proteinG": 12.3,
      "carbG": 19.5,
      "fatG": 14.3,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/cake-450.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R254",
    "name": "Snickerdoodle Pecan Protein French Toast Sticks",
    "mealTypes": [
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
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 348.0,
      "proteinG": 40.0,
      "carbG": 29.0,
      "fatG": 8.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 10,
    "cookTimeMin": 18,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/french-toast-feature.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R255",
    "name": "Soft Serve Protein Ice Cream Recipe",
    "mealTypes": [
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 170.0,
      "proteinG": 26.0,
      "carbG": 9.0,
      "fatG": 2.5,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/ice-cream-450.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R256",
    "name": "Spicy Scrambled Eggs Recipe",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs",
      "gluten"
    ],
    "nutrition": {
      "kcal": 507.0,
      "proteinG": 50.0,
      "carbG": 34.0,
      "fatG": 19.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/spicyeggs.png",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R257",
    "name": "Strawberry Protein Cheesecake Recipe",
    "mealTypes": [
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 206.0,
      "proteinG": 25.0,
      "carbG": 32.0,
      "fatG": 2.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 20,
    "cookTimeMin": 75,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/strawberry_cheesecake.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R258",
    "name": "Summer BBQ Pulled Pork & Coleslaw Sandwiches Recipe",
    "mealTypes": [
      "lunch"
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 372.0,
      "proteinG": 37.2,
      "carbG": 35.2,
      "fatG": 9.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/summer_bbq_pulled_pork_sandwich_recipe.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R259",
    "name": "Sundried Tomato & Herb Scrambled Egg Grilled Cheese Recipe",
    "mealTypes": [
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
      "eggs",
      "gluten"
    ],
    "nutrition": {
      "kcal": 436.0,
      "proteinG": 44.3,
      "carbG": 38.4,
      "fatG": 10.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/sundried_tomato_herb_scrambled_egg_grilled_cheese.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R260",
    "name": "Swedish Beef Patties With Onions Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 300.0,
      "proteinG": 16.0,
      "carbG": 20.0,
      "fatG": 16.9,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/swedish-450.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R261",
    "name": "Sweet & Simple Cinnamon Rolls Recipe",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 297.0,
      "proteinG": 10.0,
      "carbG": 35.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 15,
    "cookTimeMin": 15,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/cinnamon-rolls-feature.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R262",
    "name": "Thai Spiced Chicken Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "indian",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 266.0,
      "proteinG": 43.0,
      "carbG": 8.0,
      "fatG": 3.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/thai-chicken-450.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R263",
    "name": "The Bounce-Back Protein Smoothie Recipe",
    "mealTypes": [
      "shake",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 227.0,
      "proteinG": 20.0,
      "carbG": 30.0,
      "fatG": 3.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 5,
    "cookTimeMin": 1,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/bounce-back-recipe-feautre.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R264",
    "name": "Triple Chocolate Chip Deep Dish Protein Cookie Recipe",
    "mealTypes": [
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 289.0,
      "proteinG": 17.0,
      "carbG": 29.0,
      "fatG": 12.0,
      "fiberG": 0
    },
    "servings": 8,
    "prepTimeMin": 10,
    "cookTimeMin": 20,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/recipe/deep-dish-cookie-feature.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R265",
    "name": "Turkey Sausage Frittata With Egg Whites Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 190.0,
      "proteinG": 25.5,
      "carbG": 8.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 0,
    "cookTimeMin": 0,
    "imageUrl": "https://cdn.muscleandstrength.com/sites/default/files/field/image/recipe/sausage-450.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R266",
    "name": "20 Minute Thai Beef Rice Bowl",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [
      "sesame"
    ],
    "nutrition": {
      "kcal": 520.0,
      "proteinG": 0,
      "carbG": 49.0,
      "fatG": 16.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 15,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/20%20minute%20Thai%20Beef%20Bowl%2011.jpeg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R267",
    "name": "Almond and Walnut Tabbouleh Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 170.0,
      "proteinG": 3.0,
      "carbG": 8.0,
      "fatG": 15.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 8,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/almond-and-walnut-tabbouleh-recipe-002.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R268",
    "name": "BBQ Chicken Sweet Potato Toast",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "italian",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 289.0,
      "proteinG": 21.0,
      "carbG": 35.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 3,
    "prepTimeMin": 5,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/unnamed-10-3.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R269",
    "name": "Bacon and Guacamole Deviled Eggs",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 123.0,
      "proteinG": 11.0,
      "carbG": 1.5,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 12,
    "prepTimeMin": 5,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/bacon-gucamole-deviled-egg-recipe%203.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R270",
    "name": "Baked Chicken Parmesan with Zucchini Pasta",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "italian",
    "allergens": [
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 330.0,
      "proteinG": 19.0,
      "carbG": 33.0,
      "fatG": 17.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 5,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Buffalo-Chicken-Parmesan-1.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R271",
    "name": "Baked Spicy Chicken Wings (Paleo)",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 176.0,
      "proteinG": 9.0,
      "carbG": 1.5,
      "fatG": 15.0,
      "fiberG": 0
    },
    "servings": 8,
    "prepTimeMin": 10,
    "cookTimeMin": 45,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/healthy-baked-chicken-wings-recipe%20(2).jpeg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R272",
    "name": "Beef Pita Pockets",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "gluten"
    ],
    "nutrition": {
      "kcal": 460.0,
      "proteinG": 38.0,
      "carbG": 36.0,
      "fatG": 18.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 3,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Beef%20Pita%20Pocket.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R273",
    "name": "Buffalo Chicken Meal Prep",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 220.0,
      "proteinG": 35.0,
      "carbG": 3.0,
      "fatG": 6.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 7,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Buffalo-Chicken-Meal-Prep-1.jpeg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R274",
    "name": "Cheesy Keto Taco Casserole Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 420.0,
      "proteinG": 34.0,
      "carbG": 11.0,
      "fatG": 26.0,
      "fiberG": 0
    },
    "servings": 6,
    "prepTimeMin": 10,
    "cookTimeMin": 30,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/keto-taco-casserole.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R275",
    "name": "Chicken Burrito Bowl",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 430.0,
      "proteinG": 41.0,
      "carbG": 40.0,
      "fatG": 11.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 9,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta-Chicken-Burrito-Bowl-1-1.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R276",
    "name": "Chicken and Mushroom Sauced-Noodle Recipe",
    "mealTypes": [
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [],
    "nutrition": {
      "kcal": 510.0,
      "proteinG": 46.0,
      "carbG": 33.0,
      "fatG": 20.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 15,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Chicken-and-Mushroom-Sauced-Noodle-Recipe-Square-1.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R277",
    "name": "Chilaquiles Chicken Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 540.0,
      "proteinG": 42.0,
      "carbG": 45.0,
      "fatG": 23.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 10,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Chilaquiles-Chicken-Recipe-Square.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R278",
    "name": "Chocolate Protein Lava Cake",
    "mealTypes": [
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 357.0,
      "proteinG": 23.0,
      "carbG": 19.0,
      "fatG": 21.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 5,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/protein-chocolate-lava-cake-recipe.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R279",
    "name": "Clean Eating Recipes: Balsamic Glazed Steak Rolls",
    "mealTypes": [
      "lunch",
      "dinner"
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
    "allergens": [],
    "nutrition": {
      "kcal": 365.0,
      "proteinG": 30.0,
      "carbG": 10.0,
      "fatG": 22.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 15,
    "cookTimeMin": 20,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Imported_Blog_Media/clean-eating-balsamic-glazed-steak-rolls-2.png",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R280",
    "name": "Coconut Cashew Keto Fried Chicken Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "eggs"
    ],
    "nutrition": {
      "kcal": 420.0,
      "proteinG": 30.0,
      "carbG": 6.0,
      "fatG": 27.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 10,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/keto-fried-chicken-recipe-for-keto-meal-prep.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R281",
    "name": "Coconut-Curry Chicken Bowl Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "indian",
    "allergens": [],
    "nutrition": {
      "kcal": 260.0,
      "proteinG": 28.0,
      "carbG": 33.0,
      "fatG": 5.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 15,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/coconut-curry-chicken-bowl-recipe-1.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R282",
    "name": "Creamy Keto Chicken Casserole Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 430.0,
      "proteinG": 26.0,
      "carbG": 10.0,
      "fatG": 31.0,
      "fiberG": 0
    },
    "servings": 8,
    "prepTimeMin": 10,
    "cookTimeMin": 30,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/keto-chicken-casserole-in-meal-prep-container.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R283",
    "name": "Curried Chicken Salad (Paleo)",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "indian",
    "allergens": [],
    "nutrition": {
      "kcal": 140.0,
      "proteinG": 13.0,
      "carbG": 4.0,
      "fatG": 8.0,
      "fiberG": 0
    },
    "servings": 8,
    "prepTimeMin": 15,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/paleo%20chicken%20salad%20curried%20high%20protein%20(1).jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R284",
    "name": "Dark Chocolate Black Bean Protein Brownies",
    "mealTypes": [
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 110.0,
      "proteinG": 11.0,
      "carbG": 10.0,
      "fatG": 6.0,
      "fiberG": 0
    },
    "servings": 12,
    "prepTimeMin": 10,
    "cookTimeMin": 25,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/goeey-black-bean-brownie-recipe.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R285",
    "name": "Delicious Asian Turkey Lettuce Wraps",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "japanese",
    "allergens": [],
    "nutrition": {
      "kcal": 302.0,
      "proteinG": 25.0,
      "carbG": 23.0,
      "fatG": 11.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 5,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/unnamed-40.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R286",
    "name": "Delicious Keto Breakfast Sandwich Recipe",
    "mealTypes": [
      "lunch",
      "breakfast",
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 650.0,
      "proteinG": 31.0,
      "carbG": 11.0,
      "fatG": 52.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 15,
    "cookTimeMin": 20,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/keto-breakfast-sandwich-recipe.jpg",
    "proteinDensity": "low",
    "calorieDensity": "high"
  },
  {
    "id": "R287",
    "name": "Drool-Worthy Chicken Cobb Salad Recipe",
    "mealTypes": [
      "lunch"
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
      "eggs"
    ],
    "nutrition": {
      "kcal": 440.0,
      "proteinG": 34.0,
      "carbG": 39.0,
      "fatG": 18.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 7,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/chicken-cobb-salad-recipe.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
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
    "id": "R289",
    "name": "Easy Chicken Tacos Pibil Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "mexican",
    "allergens": [],
    "nutrition": {
      "kcal": 275.0,
      "proteinG": 27.0,
      "carbG": 17.0,
      "fatG": 10.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Easy-Chicken-Tacos-Pibil-Recipe..jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R290",
    "name": "Easy Keto Fried Rice",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "eggs",
      "sesame"
    ],
    "nutrition": {
      "kcal": 385.0,
      "proteinG": 26.0,
      "carbG": 13.0,
      "fatG": 27.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 15,
    "cookTimeMin": 15,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/how%20to%20make%20cauliflower%20rice%20-%20trifecta-9-.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R291",
    "name": "Easy Quick Paleo Chili Beef",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [],
    "nutrition": {
      "kcal": 410.0,
      "proteinG": 41.0,
      "carbG": 20.0,
      "fatG": 17.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 20,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Paleo%20Beef%20Chili.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R292",
    "name": "Easy Steak Birria Tacos Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [],
    "nutrition": {
      "kcal": 430.0,
      "proteinG": 34.0,
      "carbG": 33.0,
      "fatG": 20.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 15,
    "cookTimeMin": 20,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Quick-Steak-Birria-Tacos-Recipe-Trifecta-Square.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R293",
    "name": "Easy Steak Fajita Bowl Reicpe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 420.0,
      "proteinG": 32.0,
      "carbG": 31.0,
      "fatG": 18.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 5,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20A%20La%20Carte%20Recipe%20Photos/steak-fajita-bowl-recipe-in-plate.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R294",
    "name": "Easy Sweet and Sour Chicken Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 440.0,
      "proteinG": 40.0,
      "carbG": 44.0,
      "fatG": 9.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 10,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Easy-Sweet-and-Sour-Chicken-Recipe-Square.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R295",
    "name": "Fall Chicken and Rice Soup",
    "mealTypes": [
      "dinner",
      "lunch"
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
    "allergens": [],
    "nutrition": {
      "kcal": 330.0,
      "proteinG": 39.0,
      "carbG": 27.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 20,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Winter%20Chicken%20Soup-1.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R296",
    "name": "Fast Chicken Shawarma & Sweet Potato",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 340.0,
      "proteinG": 39.0,
      "carbG": 26.0,
      "fatG": 9.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Fast-Chicken-Shawarma-with-Sweet-Potato-1.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R297",
    "name": "Fully Loaded Keto Breakfast Parfait",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 340.0,
      "proteinG": 14.0,
      "carbG": 12.0,
      "fatG": 33.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/keto-yogurt-parfait-in-glass.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R298",
    "name": "Gluten Free Protein Waffle Recipe",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 180.0,
      "proteinG": 18.0,
      "carbG": 18.0,
      "fatG": 5.0,
      "fiberG": 0
    },
    "servings": 6,
    "prepTimeMin": 5,
    "cookTimeMin": 10,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Breakfast%20Recipe%20Photos/proteinwafflerecipe.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R299",
    "name": "Grilled Cheese Recipe High-Protein with Pulled Pork",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 310.0,
      "proteinG": 25.0,
      "carbG": 13.0,
      "fatG": 16.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 10,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/highproteingrilledcheese-125kb.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R300",
    "name": "Grilled Pesto Chicken Sandwich",
    "mealTypes": [
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "italian",
    "allergens": [
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 390.0,
      "proteinG": 37.0,
      "carbG": 31.0,
      "fatG": 13.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 5,
    "cookTimeMin": 15,
    "imageUrl": "https://f.hubspotusercontent40.net/hubfs/2498149/chicken-pesto-sandwhich-on-cutting-board.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R301",
    "name": "Healthy Chicken Quesadilla",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 410.0,
      "proteinG": 37.0,
      "carbG": 38.0,
      "fatG": 13.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 7,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Healthy-chicken-quesadilla-ingredients-1.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
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
    "id": "R303",
    "name": "High Protein Chia Seed Pudding Recipe",
    "mealTypes": [
      "shake",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [],
    "nutrition": {
      "kcal": 260.0,
      "proteinG": 21.0,
      "carbG": 10.0,
      "fatG": 11.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 5,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/keto-chia-pudding-recipe.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R304",
    "name": "High Protein Greek Yogurt Parfait\u00a0Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 383.0,
      "proteinG": 32.0,
      "carbG": 36.0,
      "fatG": 12.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 5,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/high-protein-yogurt-parfait-recipe-card.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R305",
    "name": "High Protein Overnight Oats",
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
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 280.0,
      "proteinG": 18.0,
      "carbG": 35.0,
      "fatG": 8.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 10,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/protein-overnight-oats-recipe-2.jpg",
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
    "id": "R307",
    "name": "High Protein Vegan Veggie Pasta",
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
      "kcal": 364.0,
      "proteinG": 19.0,
      "carbG": 42.0,
      "fatG": 17.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 15,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/vegan-meal-prep-veggie-high-protein-pasta-recipe%20(2).jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R308",
    "name": "High-Protein French Toast Recipe",
    "mealTypes": [
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
      "eggs",
      "gluten"
    ],
    "nutrition": {
      "kcal": 370.0,
      "proteinG": 32.0,
      "carbG": 49.0,
      "fatG": 17.0,
      "fiberG": 0
    },
    "servings": 6,
    "prepTimeMin": 5,
    "cookTimeMin": 15,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20A%20La%20Carte%20Recipe%20Photos/proteinfrenchtoastrecipe.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R309",
    "name": "Honey Sriracha Turkey Meatballs",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "eggs",
      "gluten",
      "sesame"
    ],
    "nutrition": {
      "kcal": 310.0,
      "proteinG": 26.0,
      "carbG": 20.0,
      "fatG": 12.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 5,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/unnamed-3-10.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R310",
    "name": "Hunan Chicken Bowl",
    "mealTypes": [
      "dinner",
      "lunch",
      "dessert",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [
      "sesame"
    ],
    "nutrition": {
      "kcal": 370.0,
      "proteinG": 40.0,
      "carbG": 31.0,
      "fatG": 9.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Hunan-Chicken-Bowl-1.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R311",
    "name": "Kale Yeah Turkey Burger Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "gluten"
    ],
    "nutrition": {
      "kcal": 380.0,
      "proteinG": 28.0,
      "carbG": 34.0,
      "fatG": 15.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 4,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20A%20La%20Carte%20Recipe%20Photos/TBTurkeyBurgersq0001.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R312",
    "name": "Keto Avocado Egg Salad",
    "mealTypes": [
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 210.0,
      "proteinG": 15.0,
      "carbG": 4.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 12,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/avocado-egg-salad-recipe-for-meal-prep.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R313",
    "name": "Keto Avocado Smoothie Recipe",
    "mealTypes": [
      "shake",
      "snack"
    ],
    "dietTypes": [
      "VEGAN"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 330.0,
      "proteinG": 27.0,
      "carbG": 11.0,
      "fatG": 20.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 10,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/keto-chocolate-avocado-smoothie-recipe-in-glass.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R314",
    "name": "Keto Avocado Toast",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs",
      "gluten"
    ],
    "nutrition": {
      "kcal": 230.0,
      "proteinG": 8.0,
      "carbG": 5.0,
      "fatG": 21.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 5,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/keto-avocado-toast-for-keto-meal-prep-recipe.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R315",
    "name": "Keto BBQ Chicken Pizza with Cauliflower Crust",
    "mealTypes": [
      "dinner",
      "lunch",
      "snack",
      "dessert"
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
      "eggs"
    ],
    "nutrition": {
      "kcal": 250.0,
      "proteinG": 25.0,
      "carbG": 13.0,
      "fatG": 10.5,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 15,
    "cookTimeMin": 14,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/bbq-chicken-pizza-low-carb-cauliflower-crust-2.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R316",
    "name": "Keto Beef Stew Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 410.0,
      "proteinG": 32.0,
      "carbG": 8.0,
      "fatG": 27.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 10,
    "cookTimeMin": 30,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/keto-beef-stew-recipe-1.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R317",
    "name": "Keto Breakfast Casserole Recipe",
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
    "cuisine": "italian",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 240.0,
      "proteinG": 20.0,
      "carbG": 5.0,
      "fatG": 15.0,
      "fiberG": 0
    },
    "servings": 8,
    "prepTimeMin": 10,
    "cookTimeMin": 25,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/keto-egg-and-cheese-breakfast-casserole.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R318",
    "name": "Keto Cauliflower Mac n' Cheese",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 180.0,
      "proteinG": 3.0,
      "carbG": 7.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 8,
    "prepTimeMin": 10,
    "cookTimeMin": 20,
    "imageUrl": "https://www.trifectanutrition.com/hs-fs/hubfs/keto-cauliflower-mac-and-cheese-recipe.jpg?width=969&quality=low",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R319",
    "name": "Keto Chocolate Pudding",
    "mealTypes": [
      "shake",
      "snack"
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
      "kcal": 190.0,
      "proteinG": 4.0,
      "carbG": 14.0,
      "fatG": 16.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 15,
    "cookTimeMin": 1,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Vegan%20Chocolate%20Pudding-792438-edited.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R320",
    "name": "Keto Deviled Eggs Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "mediterranean",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 230.0,
      "proteinG": 16.0,
      "carbG": 3.0,
      "fatG": 17.0,
      "fiberG": 0
    },
    "servings": 8,
    "prepTimeMin": 5,
    "cookTimeMin": 15,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/keto-deviled-egg-bites-for-keto-breakfast.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R321",
    "name": "Keto Egg Muffin Recipe",
    "mealTypes": [
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 110.0,
      "proteinG": 9.0,
      "carbG": 5.0,
      "fatG": 6.0,
      "fiberG": 0
    },
    "servings": 12,
    "prepTimeMin": 10,
    "cookTimeMin": 25,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/keto-egg-muffin-bites-for-keto-meal-prep.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R322",
    "name": "Keto Green Bean Casserole",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "italian",
    "allergens": [
      "dairy",
      "soy"
    ],
    "nutrition": {
      "kcal": 120.0,
      "proteinG": 4.0,
      "carbG": 6.0,
      "fatG": 10.0,
      "fiberG": 0
    },
    "servings": 10,
    "prepTimeMin": 10,
    "cookTimeMin": 30,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/nonfeatured-green-bean-casserole-1.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R323",
    "name": "Keto Green Smoothie Recipe",
    "mealTypes": [
      "shake",
      "snack"
    ],
    "dietTypes": [
      "VEGAN"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [],
    "nutrition": {
      "kcal": 320.0,
      "proteinG": 38.0,
      "carbG": 7.0,
      "fatG": 24.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 10,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/keto-green-smoothie-recipe-for-meal-prep.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R324",
    "name": "Keto Guacatillo Chicken",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "dairy",
      "nuts"
    ],
    "nutrition": {
      "kcal": 330.0,
      "proteinG": 28.0,
      "carbG": 11.0,
      "fatG": 21.0,
      "fiberG": 0
    },
    "servings": 8,
    "prepTimeMin": 20,
    "cookTimeMin": 20,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Keto-Guacatillo-Chicken-Wrap-Recipe-Plated2.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R325",
    "name": "Keto Low-Carb Oatmeal Recipe",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [],
    "nutrition": {
      "kcal": 450.0,
      "proteinG": 19.0,
      "carbG": 9.0,
      "fatG": 32.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 5,
    "cookTimeMin": 10,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/keto-low-carb-oatmeal-for-keto-meal-prep.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R326",
    "name": "Keto Mashed Cauliflower",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 180.0,
      "proteinG": 3.0,
      "carbG": 7.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 6,
    "prepTimeMin": 10,
    "cookTimeMin": 20,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/mashedcauliflower-1-606981-edited.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R327",
    "name": "Keto Matcha Fat Bombs",
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
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 120.0,
      "proteinG": 6.0,
      "carbG": 4.0,
      "fatG": 10.0,
      "fiberG": 0
    },
    "servings": 9,
    "prepTimeMin": 10,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/keto-green-tea-matcha-fat-bombs%20(611).jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R328",
    "name": "Keto Sheet Pan Eggs & Sausage Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 290.0,
      "proteinG": 20.0,
      "carbG": 6.0,
      "fatG": 21.0,
      "fiberG": 0
    },
    "servings": 8,
    "prepTimeMin": 10,
    "cookTimeMin": 30,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Keto-sheet-pan-eggs-sausage-recipe9.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R329",
    "name": "Keto Strawberry Lavender Smoothie Recipe",
    "mealTypes": [
      "shake",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 380.0,
      "proteinG": 35.0,
      "carbG": 8.0,
      "fatG": 31.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 10,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/keto-strawberry-lavendar-smoothie-recipe-in-glass.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R330",
    "name": "Korean Beef Bowl with Kimchi",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "korean",
    "allergens": [
      "sesame"
    ],
    "nutrition": {
      "kcal": 453.0,
      "proteinG": 28.0,
      "carbG": 51.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/easy-korean-beef-bowl-with-kimchi-recipe-meal-prep.jpeg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R331",
    "name": "Lemon Ginger Protein Cheesecake Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 200.0,
      "proteinG": 21.0,
      "carbG": 15.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 8,
    "prepTimeMin": 10,
    "cookTimeMin": 40,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/protein-cheesecake-recipe-for-meal-prep.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R332",
    "name": "Low Carb Carne Asada Steak Taco Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [],
    "nutrition": {
      "kcal": 340.0,
      "proteinG": 23.0,
      "carbG": 9.0,
      "fatG": 24.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20A%20La%20Carte%20Recipe%20Photos/CarneAsadaTaco0001.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R333",
    "name": "Low Carb Keto Burger Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 390.0,
      "proteinG": 27.0,
      "carbG": 7.0,
      "fatG": 29.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 15,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/keto-burger-recipe-for-keto-meal-prep.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R334",
    "name": "Low-Carb Kelp Noodle Pesto Bowl",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "mediterranean",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 240.0,
      "proteinG": 7.0,
      "carbG": 15.0,
      "fatG": 18.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/kelpnoodlepestobowlsquare.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R335",
    "name": "Low-Carb Portobello Mushroom Bruschetta",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "italian",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 259.0,
      "proteinG": 10.0,
      "carbG": 18.0,
      "fatG": 17.0,
      "fiberG": 0
    },
    "servings": 6,
    "prepTimeMin": 5,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/portobello-mushroom-bruschetta.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R336",
    "name": "Macaroni and Beef",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "italian",
    "allergens": [
      "gluten"
    ],
    "nutrition": {
      "kcal": 530.0,
      "proteinG": 40.0,
      "carbG": 56.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 15,
    "cookTimeMin": 11,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Macaroni%20and%20Beef%20Trifecta.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R337",
    "name": "Maple Cinnamon Sweet Potato Waffles",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 190.0,
      "proteinG": 8.0,
      "carbG": 31.0,
      "fatG": 3.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 15,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20A%20La%20Carte%20Recipe%20Photos/sweet-potato-cinnamon-waffle-recipe-on-plate.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R338",
    "name": "Mediterranean Chicken Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "mediterranean",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 434.0,
      "proteinG": 30.0,
      "carbG": 37.0,
      "fatG": 19.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 15,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/meal%20prep%20mediterranean%20chicken%20(1).jpeg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R339",
    "name": "No-Bake Protein Peanut Butter Oatmeal Cookie Recipe",
    "mealTypes": [
      "dessert",
      "breakfast",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 200.0,
      "proteinG": 10.0,
      "carbG": 20.0,
      "fatG": 10.0,
      "fiberG": 0
    },
    "servings": 12,
    "prepTimeMin": 10,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/no-bake-protein-cookies.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R340",
    "name": "Open-Faced Egg Sandwich",
    "mealTypes": [
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "italian",
    "allergens": [
      "eggs",
      "gluten"
    ],
    "nutrition": {
      "kcal": 263.0,
      "proteinG": 29.0,
      "carbG": 33.0,
      "fatG": 30.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 10,
    "cookTimeMin": 1,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/pesto-egg-sandwich-2.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R341",
    "name": "Paleo Aromatic Greens with Coconut Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [],
    "nutrition": {
      "kcal": 110.0,
      "proteinG": 5.0,
      "carbG": 10.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 10,
    "prepTimeMin": 10,
    "cookTimeMin": 10,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Paleo-Aromatic-Greens-with-Coconut-Recipe-Sq.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R342",
    "name": "Paleo Beef Sloppy Joe",
    "mealTypes": [
      "dinner",
      "lunch"
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
    "allergens": [],
    "nutrition": {
      "kcal": 320.0,
      "proteinG": 26.0,
      "carbG": 19.0,
      "fatG": 15.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 30,
    "cookTimeMin": 15,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Paleo%20Trifecta%20Sloppy%20Joe.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R343",
    "name": "Paleo Cashew Chicken Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
    "allergens": [],
    "nutrition": {
      "kcal": 340.0,
      "proteinG": 38.0,
      "carbG": 21.0,
      "fatG": 11.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 15,
    "cookTimeMin": 20,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Paleo-Cashew-Chicken-Recipe-Main4.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R344",
    "name": "Paleo Chicken Broccoli Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "sesame"
    ],
    "nutrition": {
      "kcal": 300.0,
      "proteinG": 28.0,
      "carbG": 24.0,
      "fatG": 10.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 15,
    "cookTimeMin": 15,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Paleo-Chicken-and-Broccoli-Recipe1.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R345",
    "name": "Paleo Chicken Pesto Stuffed Sweet Potato Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "italian",
    "allergens": [],
    "nutrition": {
      "kcal": 380.0,
      "proteinG": 27.0,
      "carbG": 15.0,
      "fatG": 24.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 15,
    "cookTimeMin": 30,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Gluten_Free_Paleo-Meatloaf_Recipe_8.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R346",
    "name": "Paleo Chocolate Protein Pudding",
    "mealTypes": [
      "shake",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 190.0,
      "proteinG": 8.0,
      "carbG": 22.0,
      "fatG": 9.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 10,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Paleo_Chocolate_Protein-Pudding_Trifecta2.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R347",
    "name": "Paleo Coconut Yogurt Parfait Recipe",
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
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 380.0,
      "proteinG": 6.0,
      "carbG": 32.0,
      "fatG": 27.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Paleo-Coconut-Yogurt-Parfait-Recipe-Sq.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R348",
    "name": "Paleo Porridge with Caramelized Bananas Recipe",
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
    "cuisine": "thai",
    "allergens": [],
    "nutrition": {
      "kcal": 290.0,
      "proteinG": 6.0,
      "carbG": 28.0,
      "fatG": 19.0,
      "fiberG": 0
    },
    "servings": 3,
    "prepTimeMin": 1440,
    "cookTimeMin": 10,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Paleo-Porridge-with-Caramelized-Banana-Al-Fresco-Recipe-Card.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R349",
    "name": "Paleo Pumpkin Spice Protein Smoothie Recipe",
    "mealTypes": [
      "shake",
      "snack"
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
      "kcal": 190.0,
      "proteinG": 12.0,
      "carbG": 33.0,
      "fatG": 3.5,
      "fiberG": 0
    },
    "servings": 7,
    "prepTimeMin": 10,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Paleo-Pumpkin-Spice-Protein-Smoothie-Recipe-Card3.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R350",
    "name": "Paleo Roasted Spiced Nuts Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 130.0,
      "proteinG": 4.0,
      "carbG": 8.0,
      "fatG": 10.0,
      "fiberG": 0
    },
    "servings": 17,
    "prepTimeMin": 10,
    "cookTimeMin": 30,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Paleo-Roasted-Spiced-Nuts-Recipe-Square.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R351",
    "name": "Paleo Shakshuka Breakfast Recipe",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 140.0,
      "proteinG": 9.0,
      "carbG": 6.0,
      "fatG": 8.0,
      "fiberG": 0
    },
    "servings": 14,
    "prepTimeMin": 20,
    "cookTimeMin": 50,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Paleo-Breakfast-Egg-and-Sausage-Casserole-Recipe-Card.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R352",
    "name": "Paleo Shakshuka Breakfast Recipe",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 240.0,
      "proteinG": 10.0,
      "carbG": 23.0,
      "fatG": 12.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 15,
    "cookTimeMin": 18,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Paleo-Shakshouka-Breakfast-Recipe-Card2.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R353",
    "name": "Paleo Sweet Potato Hash with Sausage & Egg Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 220.0,
      "proteinG": 19.0,
      "carbG": 40.0,
      "fatG": 18.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 30,
    "cookTimeMin": 30,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Paleo-Sweet-Potato-Hash-with-Sausage-Egg-Recipe-Card.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R354",
    "name": "Paleo Thai Turkey Larb Recipe",
    "mealTypes": [
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "thai",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 270.0,
      "proteinG": 33.0,
      "carbG": 8.0,
      "fatG": 12.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 15,
    "cookTimeMin": 15,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Paleo-Thai-Turkey-Larb-Recipe-Main2-1.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R355",
    "name": "Perfect Meal Prep Scrambled Eggs",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "eggs"
    ],
    "nutrition": {
      "kcal": 144.0,
      "proteinG": 12.6,
      "carbG": 1.0,
      "fatG": 10.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 15,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Keto-Shrimp-Avocado-Salad-RecipeSq.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R356",
    "name": "Pork Bites Recipe High-Protein and Low-Calorie",
    "mealTypes": [
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "italian",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 80.0,
      "proteinG": 6.0,
      "carbG": 2.0,
      "fatG": 5.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 12,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/porkbites-125kb.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "low"
  },
  {
    "id": "R357",
    "name": "Pulled Pork Nachos Recipe High-Protein",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 490.0,
      "proteinG": 32.0,
      "carbG": 35.0,
      "fatG": 23.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 3,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/nachos-125kb-1.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R358",
    "name": "Quick Beef Enchilada",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 530.0,
      "proteinG": 42.0,
      "carbG": 57.0,
      "fatG": 21.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 10,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Beef%20Enchiladas%20Trifecta.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R359",
    "name": "Quick Shredded Chicken Slider",
    "mealTypes": [
      "lunch",
      "dinner"
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 420.0,
      "proteinG": 31.0,
      "carbG": 50.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Quick-chicken-sliders-1-1.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R360",
    "name": "Quick Spaghetti & Beef Marinara",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "kcal": 450.0,
      "proteinG": 38.0,
      "carbG": 37.0,
      "fatG": 16.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 15,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Imported_Blog_Media/spaghettimeatsauce.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R361",
    "name": "Red, White, and Bleu Bison Burger Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "dairy",
      "gluten"
    ],
    "nutrition": {
      "kcal": 350.0,
      "proteinG": 33.0,
      "carbG": 35.0,
      "fatG": 9.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 4,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20A%20La%20Carte%20Recipe%20Photos/TBBisonBlueBurgersq001.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R362",
    "name": "Savory Vegan Portobello Pot Roast Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 330.0,
      "proteinG": 22.0,
      "carbG": 28.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 15,
    "cookTimeMin": 30,
    "imageUrl": "https://www.trifectanutrition.com/hs-fs/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/VeganPortobelloPotRoastRecipesq0002.jpg?width=719&quality=high",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R363",
    "name": "Simple Keto Chili Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
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
      "dairy"
    ],
    "nutrition": {
      "kcal": 440.0,
      "proteinG": 36.0,
      "carbG": 11.0,
      "fatG": 25.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 25,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/keto-chili-recipe.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R364",
    "name": "Sloppy Joe Recipe High-Protein with Pulled Pork",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "gluten"
    ],
    "nutrition": {
      "kcal": 410.0,
      "proteinG": 27.0,
      "carbG": 52.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 12,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/sloppyjoe-125kb.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R365",
    "name": "Sriracha Honey Sesame Chicken",
    "mealTypes": [
      "dinner",
      "lunch",
      "dessert",
      "snack"
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
      "sesame"
    ],
    "nutrition": {
      "kcal": 360.0,
      "proteinG": 41.0,
      "carbG": 27.0,
      "fatG": 6.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Sriracha-Honey-Sesame-Chicken.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R366",
    "name": "Steak and Avocado Lettuce Wraps",
    "mealTypes": [
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 317.0,
      "proteinG": 26.0,
      "carbG": 7.0,
      "fatG": 21.0,
      "fiberG": 0
    },
    "servings": 6,
    "prepTimeMin": 15,
    "cookTimeMin": 20,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Meat%20Lettuce%20Wraps.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R367",
    "name": "Strawberry Watermelon Protein Shake Recipe",
    "mealTypes": [
      "lunch",
      "shake",
      "snack",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy"
    ],
    "nutrition": {
      "kcal": 215.0,
      "proteinG": 27.0,
      "carbG": 21.0,
      "fatG": 3.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 5,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Watermelon-Oatmeal-Smoothie-5-4-1.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  },
  {
    "id": "R368",
    "name": "Tamarind-Chipotle Steak Nachos",
    "mealTypes": [
      "snack",
      "dessert"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [],
    "nutrition": {
      "kcal": 470.0,
      "proteinG": 33.0,
      "carbG": 33.0,
      "fatG": 23.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 5,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Tamarind-Chipotle-Steak-Nachos-recipe-meal-prep-clean-eating-3.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R369",
    "name": "Teriyaki Beef & Rice Bowl",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "japanese",
    "allergens": [
      "sesame"
    ],
    "nutrition": {
      "kcal": 400.0,
      "proteinG": 36.0,
      "carbG": 29.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 15,
    "cookTimeMin": 10,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Teriyaki%20Beef%20and%20Rice%20Bowl.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R370",
    "name": "Teriyaki Chicken Pineapple Bowls",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "bulk",
      "maintenance"
    ],
    "cuisine": "japanese",
    "allergens": [
      "sesame"
    ],
    "nutrition": {
      "kcal": 510.0,
      "proteinG": 51.0,
      "carbG": 51.0,
      "fatG": 9.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 5,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20A%20La%20Carte%20Recipe%20Photos/chicken-teriyaki-bowl-on-plate-for-meal-prep.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R371",
    "name": "Thai Peanut Chicken Meal Prep",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [],
    "nutrition": {
      "kcal": 370.0,
      "proteinG": 40.0,
      "carbG": 9.0,
      "fatG": 18.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 10,
    "cookTimeMin": 10,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta-Thai-Peanut-Chicken-Meal-Prep-1.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R372",
    "name": "Thai Steak Salad Recipe",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "cuisine": "thai",
    "allergens": [
      "sesame"
    ],
    "nutrition": {
      "kcal": 390.0,
      "proteinG": 32.0,
      "carbG": 12.0,
      "fatG": 24.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 8,
    "cookTimeMin": 4,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20A%20La%20Carte%20Recipe%20Photos/ThaiSteakSaladRecipe0003.jpg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R373",
    "name": "The Best Healthy Apple Crisp",
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
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 210.0,
      "proteinG": 3.0,
      "carbG": 36.0,
      "fatG": 7.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/apple-crisp-in-meal-prep-container.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R374",
    "name": "The Fluffiest Keto Cloud 'Bread' Of All Time Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 170.0,
      "proteinG": 3.0,
      "carbG": 1.0,
      "fatG": 6.0,
      "fiberG": 0
    },
    "servings": 12,
    "prepTimeMin": 15,
    "cookTimeMin": 20,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/The-fluffiest-keto-cloud-bread-of-all-time-recipe1-1.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R375",
    "name": "Trifecta Five Minute Burger",
    "mealTypes": [
      "dinner",
      "lunch"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "recomp",
      "maintenance"
    ],
    "cuisine": "mexican",
    "allergens": [
      "gluten"
    ],
    "nutrition": {
      "kcal": 460.0,
      "proteinG": 36.0,
      "carbG": 27.0,
      "fatG": 24.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 3,
    "cookTimeMin": 5,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Five%20Minute%20Burger.jpeg",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
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
  },
  {
    "id": "R379",
    "name": "Vegan Mediterranean Breakfast Skillet",
    "mealTypes": [
      "breakfast"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "mediterranean",
    "allergens": [],
    "nutrition": {
      "kcal": 360.0,
      "proteinG": 22.0,
      "carbG": 28.0,
      "fatG": 18.0,
      "fiberG": 0
    },
    "servings": 5,
    "prepTimeMin": 10,
    "cookTimeMin": 12,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/TBVeganMedSkillethd0001.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R380",
    "name": "Vegan Piquillo Pepper Pasta Alfredo",
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
      "proteinG": 21.0,
      "carbG": 54.0,
      "fatG": 14.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 8,
    "cookTimeMin": 12,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/TBVeganRedAlfredosq.jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R381",
    "name": "Vegan Pumpkin Pie Chia Pudding",
    "mealTypes": [
      "shake",
      "snack"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [],
    "nutrition": {
      "kcal": 180.0,
      "proteinG": 4.0,
      "carbG": 25.0,
      "fatG": 8.0,
      "fiberG": 0
    },
    "servings": 2,
    "prepTimeMin": 5,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/pumpkin-pie-chia-seed-pudding.jpg",
    "proteinDensity": "low",
    "calorieDensity": "low"
  },
  {
    "id": "R382",
    "name": "Vegan Roasted Veggie Sandwich",
    "mealTypes": [
      "lunch"
    ],
    "dietTypes": [
      "VEGAN"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "mediterranean",
    "allergens": [
      "gluten"
    ],
    "nutrition": {
      "kcal": 341.0,
      "proteinG": 20.0,
      "carbG": 52.0,
      "fatG": 8.0,
      "fiberG": 0
    },
    "servings": 1,
    "prepTimeMin": 5,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/vegan-meal-prep-roasted-veggie-sandwich%20(5).jpg",
    "proteinDensity": "low",
    "calorieDensity": "medium"
  },
  {
    "id": "R383",
    "name": "Vegan Vanilla Chai Protein Smoothie Recipe",
    "mealTypes": [
      "lunch",
      "shake",
      "snack",
      "dinner"
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
    "allergens": [],
    "nutrition": {
      "kcal": 320.0,
      "proteinG": 31.0,
      "carbG": 42.0,
      "fatG": 10.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 0,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/Vegan-Vanilla-Chai-Protein-Smoothie-Recipe-Trifecta-1-1.png",
    "proteinDensity": "medium",
    "calorieDensity": "medium"
  },
  {
    "id": "R384",
    "name": "Vegetable Egg White Frittata Recipe",
    "mealTypes": [
      "lunch",
      "dinner"
    ],
    "dietTypes": [
      "OMNI"
    ],
    "goalFit": [
      "maintenance"
    ],
    "cuisine": "american",
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition": {
      "kcal": 140.0,
      "proteinG": 23.0,
      "carbG": 5.0,
      "fatG": 3.0,
      "fiberG": 0
    },
    "servings": 4,
    "prepTimeMin": 5,
    "cookTimeMin": 45,
    "imageUrl": "https://www.trifectanutrition.com/hubfs/vegetable-egg-white-frittata-recipe-slice.jpg",
    "proteinDensity": "high",
    "calorieDensity": "low"
  }
];
