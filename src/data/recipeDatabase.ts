/**
 * Recipe database — 197 recipes with full nutrition data.
 * Sourced from recipe_database_uncurated.json (v4.0, 355 total entries,
 * 197 meal recipes with published/estimated nutrition).
 * A-20 fix: replaces the fake hardcoded meal suggestions in planGenerator.ts.
 */

export interface Recipe {
  id: string;
  name: string;
  meal_types: string[];
  diet_types: string[];
  goal_fit: string[];
  allergens: string[];
  nutrition_per_serving: {
    kcal: number;
    protein_g: number;
    carb_g: number;
    fat_g: number;
    fiber_g: number;
    sugar_g?: number;
  };
  servings: number;
  prep_time_min?: number | null;
  cook_time_min?: number | null;
  image_url: string;
  cuisine: string;
}

export const RECIPES: Recipe[] = [
  {
    "id": "R001",
    "name": "Mini Stuffed Peppers Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 97.0,
      "protein_g": 5.0,
      "carb_g": 4.0,
      "fat_g": 6.0,
      "fiber_g": 1.0,
      "sugar_g": 4.0
    },
    "servings": 8,
    "prep_time_min": 10,
    "cook_time_min": 10,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2015/08/Mini-Stuffed-Peppers-Recipe-10.jpg",
    "cuisine": "american"
  },
  {
    "id": "R003",
    "name": "Baked Tacos (Easy Taco Bake)",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 225.0,
      "protein_g": 10.0,
      "carb_g": 16.0,
      "fat_g": 14.0,
      "fiber_g": 2.0,
      "sugar_g": 5.0
    },
    "servings": 8,
    "prep_time_min": 10,
    "cook_time_min": 20,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2024/02/Baked-Tacos-Recipe-12.jpg",
    "cuisine": "mexican, tex-mex"
  },
  {
    "id": "R006",
    "name": "Best Hamburger Patty Recipe (Grilled or Stovetop)",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition_per_serving": {
      "kcal": 430.0,
      "protein_g": 28.0,
      "carb_g": 6.0,
      "fat_g": 32.0,
      "fiber_g": 1.0,
      "sugar_g": 1.0
    },
    "servings": 6,
    "prep_time_min": 15,
    "cook_time_min": 8,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2020/07/best-hamburger-patties-1.jpg",
    "cuisine": "american"
  },
  {
    "id": "R007",
    "name": "Best Homemade Mac and Cheese Recipe",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 409.0,
      "protein_g": 16.0,
      "carb_g": 35.0,
      "fat_g": 22.0,
      "fiber_g": 1.0,
      "sugar_g": 2.0
    },
    "servings": 8,
    "prep_time_min": 10,
    "cook_time_min": 15,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2019/10/homemade-mac-and-cheese-recipe-32.jpg",
    "cuisine": "american"
  },
  {
    "id": "R009",
    "name": "Best Huevos Rancheros Recipe",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 1019.0,
      "protein_g": 47.0,
      "carb_g": 60.0,
      "fat_g": 65.0,
      "fiber_g": 14.0,
      "sugar_g": 3.0
    },
    "servings": 5,
    "prep_time_min": 5,
    "cook_time_min": 20,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2017/10/the-best-huevos-ranchero-recipe-16.jpg",
    "cuisine": "mexican"
  },
  {
    "id": "R010",
    "name": "Italian Pasta Salad Recipe",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 363.0,
      "protein_g": 12.0,
      "carb_g": 33.0,
      "fat_g": 20.0,
      "fiber_g": 2.0,
      "sugar_g": 4.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 8,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2019/10/italian-pasta-salad-recipe-14.jpg",
    "cuisine": "italian"
  },
  {
    "id": "R011",
    "name": "Best Macaroni Salad Recipe",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "eggs",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 362.0,
      "protein_g": 5.0,
      "carb_g": 34.0,
      "fat_g": 22.0,
      "fiber_g": 1.0,
      "sugar_g": 5.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 10,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2022/06/Best-Macaroni-Salad-Recipe-11.jpg",
    "cuisine": "american"
  },
  {
    "id": "R012",
    "name": "Thai Chicken Panang Curry Recipe",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "fish",
      "nuts"
    ],
    "nutrition_per_serving": {
      "kcal": 340.0,
      "protein_g": 24.0,
      "carb_g": 8.0,
      "fat_g": 23.0,
      "fiber_g": 2.0,
      "sugar_g": 4.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 22,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2017/09/Panang-chicken-curry-recipe-14.jpg",
    "cuisine": "thai"
  },
  {
    "id": "R013",
    "name": "Bone In Ribeye Steak Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 583.0,
      "protein_g": 46.0,
      "carb_g": 3.0,
      "fat_g": 44.0,
      "fiber_g": 0.5,
      "sugar_g": 0.1
    },
    "servings": 2,
    "prep_time_min": 5,
    "cook_time_min": 10,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2024/09/Bone-In-Ribeye-Steak-Recipe-216.jpg",
    "cuisine": "american"
  },
  {
    "id": "R020",
    "name": "Chopped Steak with Mushroom Gravy Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "eggs",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 487.0,
      "protein_g": 36.0,
      "carb_g": 14.0,
      "fat_g": 30.0,
      "fiber_g": 2.0,
      "sugar_g": 4.0
    },
    "servings": 6,
    "prep_time_min": 20,
    "cook_time_min": 30,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2020/03/tots-1-2.jpg",
    "cuisine": "american"
  },
  {
    "id": "R023",
    "name": "Chicken Tortellini Soup Recipe",
    "meal_types": [
      "lunch"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 356.0,
      "protein_g": 29.0,
      "carb_g": 30.0,
      "fat_g": 13.0,
      "fiber_g": 4.0,
      "sugar_g": 6.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 32,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2021/10/chicken-tortellini-soup-recipe-5.jpg",
    "cuisine": "italian"
  },
  {
    "id": "R024",
    "name": "Chopped Brisket Recipe",
    "meal_types": [
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 657.0,
      "protein_g": 54.0,
      "carb_g": 63.0,
      "fat_g": 20.0,
      "fiber_g": 3.0,
      "sugar_g": 27.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 450,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2020/01/Crock-Pot-Brisket-Sandwiches-Texas-BBQ-Beef-20.jpg",
    "cuisine": "american"
  },
  {
    "id": "R025",
    "name": "Easy Baked Corned Beef and Cabbage in the Oven",
    "meal_types": [
      "dinner",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 572.0,
      "protein_g": 34.0,
      "carb_g": 41.0,
      "fat_g": 30.0,
      "fiber_g": 9.0,
      "sugar_g": 16.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 180,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2021/01/Easy-Baked-Corned-Beef-and-Cabbage-in-the-Oven-15.jpg",
    "cuisine": "american, irish"
  },
  {
    "id": "R026",
    "name": "Holy Guacamole Dip",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 127.0,
      "protein_g": 1.0,
      "carb_g": 8.0,
      "fat_g": 11.0,
      "fiber_g": 5.0,
      "sugar_g": 0.0
    },
    "servings": 8,
    "prep_time_min": 10,
    "cook_time_min": 0,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2020/06/easy-guacamole-6.jpg",
    "cuisine": "mexican"
  },
  {
    "id": "R027",
    "name": "Easy Caesar Dressing Recipe",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "eggs",
      "fish"
    ],
    "nutrition_per_serving": {
      "kcal": 144.0,
      "protein_g": 2.0,
      "carb_g": 1.0,
      "fat_g": 15.0,
      "fiber_g": 0.03,
      "sugar_g": 0.2
    },
    "servings": 8,
    "prep_time_min": 10,
    "cook_time_min": 0,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2024/09/Easy-Caesar-Dressing-16.jpg",
    "cuisine": "american, italian"
  },
  {
    "id": "R028",
    "name": "Shrimp Jambalaya Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "shellfish"
    ],
    "nutrition_per_serving": {
      "kcal": 462.0,
      "protein_g": 32.0,
      "carb_g": 45.0,
      "fat_g": 17.0,
      "fiber_g": 3.0,
      "sugar_g": 7.0
    },
    "servings": 6,
    "prep_time_min": 20,
    "cook_time_min": 35,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2019/10/jambalaya-recipe-20.jpg",
    "cuisine": "american"
  },
  {
    "id": "R029",
    "name": "Easy Shrimp Quesadilla Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "shellfish",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 396.0,
      "protein_g": 16.0,
      "carb_g": 33.0,
      "fat_g": 22.0,
      "fiber_g": 3.0,
      "sugar_g": 4.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 30,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2022/02/Easy-Shrimp-Quesadilla-Recipe-7.jpg",
    "cuisine": "american, central american, mexican, south american, tex-mex"
  },
  {
    "id": "R030",
    "name": "Salsa Verde Chicken Enchiladas.",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "corn",
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 433.0,
      "protein_g": 25.0,
      "carb_g": 21.0,
      "fat_g": 28.0,
      "fiber_g": 2.0,
      "sugar_g": 5.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 40,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2021/08/chicken-enchiladas-salsa-verde-9.jpg",
    "cuisine": "american, mexican"
  },
  {
    "id": "R031",
    "name": "Chicken Enchilada Suiza",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "corn",
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 307.0,
      "protein_g": 19.0,
      "carb_g": 17.0,
      "fat_g": 18.0,
      "fiber_g": 2.0,
      "sugar_g": 3.0
    },
    "servings": 8,
    "prep_time_min": 20,
    "cook_time_min": 50,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2019/01/Enchiladas-Suizas-Creamy-Chicken-Enchiladas-are-bold-and-zesty-with-veggie-apcked-salsa-verde-and-a-rich-creamy-sauce-21.jpg",
    "cuisine": "mexican"
  },
  {
    "id": "R033",
    "name": "Ethiopian Lentils Recipe (Misir Wot Recipe with Ayib)",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 304.0,
      "protein_g": 22.0,
      "carb_g": 35.0,
      "fat_g": 9.0,
      "fiber_g": 15.0,
      "sugar_g": 5.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 40,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2012/03/ethiopian-mesir-wat-ayib-recipe-12.jpg",
    "cuisine": "american, ethiopian"
  },
  {
    "id": "R038",
    "name": "Sweet Cornbread Recipe",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "corn",
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 371.0,
      "protein_g": 7.0,
      "carb_g": 45.0,
      "fat_g": 19.0,
      "fiber_g": 2.0,
      "sugar_g": 14.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 30,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2024/11/Homemade-Cornbread-26.jpg",
    "cuisine": "american, southern"
  },
  {
    "id": "R039",
    "name": "Homemade Yum Yum Sauce",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "eggs"
    ],
    "nutrition_per_serving": {
      "kcal": 162.0,
      "protein_g": 1.0,
      "carb_g": 5.0,
      "fat_g": 16.0,
      "fiber_g": 0.0,
      "sugar_g": 5.0
    },
    "servings": 8,
    "prep_time_min": 5,
    "cook_time_min": 0,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2017/07/Homemade-Yum-Yum-Sauce-10.jpg",
    "cuisine": "japanese"
  },
  {
    "id": "R044",
    "name": "Kitfo (Ethiopian Steak Tartare Recipe)",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "fish"
    ],
    "nutrition_per_serving": {
      "kcal": 405.0,
      "protein_g": 21.0,
      "carb_g": 1.0,
      "fat_g": 35.0,
      "fiber_g": 1.0,
      "sugar_g": 1.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 0,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2021/03/Kitfo-Ethiopian-Steak-Tartare-Recipe-9.jpg",
    "cuisine": "african, ethiopian"
  },
  {
    "id": "R045",
    "name": "Korean Chicken Skewers Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "sesame",
      "soy"
    ],
    "nutrition_per_serving": {
      "kcal": 159.0,
      "protein_g": 24.0,
      "carb_g": 4.0,
      "fat_g": 4.0,
      "fiber_g": 0.0,
      "sugar_g": 6.0
    },
    "servings": 8,
    "prep_time_min": 20,
    "cook_time_min": 10,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2019/06/korean-chicken-skewers-recipe-12.jpg",
    "cuisine": "korean"
  },
  {
    "id": "R047",
    "name": "Jalapeno Cheddar Cornbread Recipe",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "corn",
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 515.0,
      "protein_g": 16.0,
      "carb_g": 49.0,
      "fat_g": 29.0,
      "fiber_g": 3.0,
      "sugar_g": 9.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 30,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2024/02/jalapeno-cheddar-cornbread-recipe-thumbnail-2.jpg",
    "cuisine": "american, southern"
  },
  {
    "id": "R052",
    "name": "Slow Cooker Tater Tots",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 133.0,
      "protein_g": 1.0,
      "carb_g": 19.0,
      "fat_g": 6.0,
      "fiber_g": 1.0,
      "sugar_g": 0.0
    },
    "servings": 8,
    "prep_time_min": 10,
    "cook_time_min": 0,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2017/01/taco-tater-tots-13.jpg",
    "cuisine": "tex-mex"
  },
  {
    "id": "R054",
    "name": "Teriyaki BBQ Grilled Shrimp Skewers",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "fish",
      "shellfish"
    ],
    "nutrition_per_serving": {
      "kcal": 205.0,
      "protein_g": 19.0,
      "carb_g": 29.0,
      "fat_g": 1.0,
      "fiber_g": 4.0,
      "sugar_g": 22.0
    },
    "servings": 8,
    "prep_time_min": 20,
    "cook_time_min": 4,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2018/06/bbq-shrimp-skewers-13.jpg",
    "cuisine": "american"
  },
  {
    "id": "R055",
    "name": "Best Margarita Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 300.0,
      "protein_g": 0.0,
      "carb_g": 32.0,
      "fat_g": 0.0,
      "fiber_g": 0.0,
      "sugar_g": 29.0
    },
    "servings": 8,
    "prep_time_min": 10,
    "cook_time_min": 0,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2019/05/best-margarita-recipe-7.jpg",
    "cuisine": "mexican"
  },
  {
    "id": "R057",
    "name": "Cheese Grits Recipe + Video",
    "meal_types": [
      "breakfast",
      "side"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "corn",
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 411.0,
      "protein_g": 14.0,
      "carb_g": 33.0,
      "fat_g": 25.0,
      "fiber_g": 1.0,
      "sugar_g": 7.0
    },
    "servings": 6,
    "prep_time_min": 5,
    "cook_time_min": 20,
    "image_url": "https://www.aspicyperspective.com/wp-content/uploads/2020/06/cheese-grits-18.jpg",
    "cuisine": "american, southern"
  },
  {
    "id": "R068",
    "name": "Easy Chinese Potato Salad Recipe",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "nuts"
    ],
    "nutrition_per_serving": {
      "kcal": 266.0,
      "protein_g": 4.0,
      "carb_g": 32.0,
      "fat_g": 14.0,
      "fiber_g": 4.0,
      "sugar_g": 4.0
    },
    "servings": 2,
    "prep_time_min": 10,
    "cook_time_min": 5,
    "image_url": "https://boondockingrecipes.com/wp-content/uploads/2026/05/Chinese-Potato-Salad-Recipe-1.png",
    "cuisine": "asian"
  },
  {
    "id": "R071",
    "name": "Filipino Pineapple Coleslaw Recipe",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "eggs"
    ],
    "nutrition_per_serving": {
      "kcal": 217.0,
      "protein_g": 2.0,
      "carb_g": 19.0,
      "fat_g": 16.0,
      "fiber_g": 3.0,
      "sugar_g": 13.0
    },
    "servings": 8,
    "prep_time_min": 30,
    "cook_time_min": 0,
    "image_url": "https://boondockingrecipes.com/wp-content/uploads/2026/05/a-documentary-style-food-photograph-of-f_Qk3qdS4UUQSG9Y3-46FOVw_6h0VtASCRwuZiFegMJ_9tw_cover.png",
    "cuisine": "pacific islands"
  },
  {
    "id": "R072",
    "name": "Great Honduran Salpic\u00f3n Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 638.0,
      "protein_g": 41.0,
      "carb_g": 14.0,
      "fat_g": 46.0,
      "fiber_g": 3.0,
      "sugar_g": 9.0
    },
    "servings": 4,
    "prep_time_min": 120,
    "cook_time_min": 60,
    "image_url": "https://boondockingrecipes.com/wp-content/uploads/2026/05/Honduran-Salpicon-2.png",
    "cuisine": "honduran"
  },
  {
    "id": "R093",
    "name": "Spanish Apple Tart Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition_per_serving": {
      "kcal": 1073.0,
      "protein_g": 11.0,
      "carb_g": 100.0,
      "fat_g": 72.0,
      "fiber_g": 6.0,
      "sugar_g": 40.0
    },
    "servings": 4,
    "prep_time_min": 15,
    "cook_time_min": 0,
    "image_url": "https://boondockingrecipes.com/wp-content/uploads/2026/06/Spanish-Apple-Tart-2.jpg",
    "cuisine": "spanish"
  },
  {
    "id": "R094",
    "name": "Spanish Panellets Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 146.0,
      "protein_g": 3.0,
      "carb_g": 20.0,
      "fat_g": 7.0,
      "fiber_g": 2.0,
      "sugar_g": 16.0
    },
    "servings": 8,
    "prep_time_min": 45,
    "cook_time_min": 5,
    "image_url": "https://boondockingrecipes.com/wp-content/uploads/2026/06/Spanish-Panellets-Recipe-6.jpg",
    "cuisine": "spainish"
  },
  {
    "id": "R095",
    "name": "Spanish Perrunillas Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 284.0,
      "protein_g": 9.0,
      "carb_g": 56.0,
      "fat_g": 5.0,
      "fiber_g": 7.0,
      "sugar_g": 17.0
    },
    "servings": 8,
    "prep_time_min": 30,
    "cook_time_min": 20,
    "image_url": "https://boondockingrecipes.com/wp-content/uploads/2026/06/Spanish-Perrunillas-Recipe-6.jpg",
    "cuisine": "spainish"
  },
  {
    "id": "R096",
    "name": "Spanish Polvor\u00f3nes Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 118.0,
      "protein_g": 3.0,
      "carb_g": 20.0,
      "fat_g": 3.0,
      "fiber_g": 1.0,
      "sugar_g": 10.0
    },
    "servings": 8,
    "prep_time_min": 30,
    "cook_time_min": 30,
    "image_url": "https://boondockingrecipes.com/wp-content/uploads/2026/06/Spanish-Polvorones-Recipe-1.jpg",
    "cuisine": "spainish"
  },
  {
    "id": "R097",
    "name": "Spanish Sponge Cake Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 492.0,
      "protein_g": 9.0,
      "carb_g": 75.0,
      "fat_g": 18.0,
      "fiber_g": 1.0,
      "sugar_g": 39.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 45,
    "image_url": "https://boondockingrecipes.com/wp-content/uploads/2026/06/Spanish-Sponge-Cake-Recipe-3.jpg",
    "cuisine": "spainish"
  },
  {
    "id": "R101",
    "name": "Beef and Butternut Squash Stew",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 693.0,
      "protein_g": 43.0,
      "carb_g": 48.0,
      "fat_g": 32.0,
      "fiber_g": 7.0,
      "sugar_g": 15.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 70,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2013/01/Beef-Butternut-Squash-Stew-Recipe-2.jpg",
    "cuisine": ""
  },
  {
    "id": "R102",
    "name": "Beef and Cabbage Soup",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 262.0,
      "protein_g": 22.0,
      "carb_g": 20.0,
      "fat_g": 11.0,
      "fiber_g": 6.0,
      "sugar_g": 10.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 70,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2025/02/Beef-and-Cabbage-Soup-Recipe-4.jpg",
    "cuisine": ""
  },
  {
    "id": "R103",
    "name": "Ultimate Beef Bourguignon",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 674.0,
      "protein_g": 50.0,
      "carb_g": 14.0,
      "fat_g": 45.0,
      "fiber_g": 1.0,
      "sugar_g": 3.0
    },
    "servings": 6,
    "prep_time_min": 30,
    "cook_time_min": 180,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2025/02/Beef-Bourguignon-Recipe-2.jpg",
    "cuisine": "french"
  },
  {
    "id": "R104",
    "name": "BEST Macaroni Salad",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "eggs",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 185.0,
      "protein_g": 3.0,
      "carb_g": 21.0,
      "fat_g": 10.0,
      "fiber_g": 2.0,
      "sugar_g": 3.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 0,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2016/08/Macaroni-Salad-7-square.jpg",
    "cuisine": "american"
  },
  {
    "id": "R108",
    "name": "Classic Potato Salad",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "eggs"
    ],
    "nutrition_per_serving": {
      "kcal": 687.0,
      "protein_g": 10.0,
      "carb_g": 44.0,
      "fat_g": 57.0,
      "fiber_g": 6.0,
      "sugar_g": 6.0
    },
    "servings": 6,
    "prep_time_min": 15,
    "cook_time_min": 0,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2015/07/Potato-Salad-3.jpg",
    "cuisine": "american"
  },
  {
    "id": "R109",
    "name": "Creamy Chicken Tortilla Soup",
    "meal_types": [
      "lunch"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "corn",
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 483.375,
      "protein_g": 19.349999999999998,
      "carb_g": 31.8,
      "fat_g": 32.6625,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 4,
    "prep_time_min": 15,
    "cook_time_min": 25,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2013/09/Chicken-Tortilla-Soup-2.jpg",
    "cuisine": "mexican"
  },
  {
    "id": "R113",
    "name": "Doro Wat (Ethiopian Spiced Chicken)",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 647.0,
      "protein_g": 43.0,
      "carb_g": 11.0,
      "fat_g": 53.0,
      "fiber_g": 1.0,
      "sugar_g": 5.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 150,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2013/08/Doro-Wat-5_edited.jpg",
    "cuisine": "african, ethiopian"
  },
  {
    "id": "R115",
    "name": "Gomen (Ethiopian Collard Greens)",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 115.0,
      "protein_g": 0.0,
      "carb_g": 3.0,
      "fat_g": 11.0,
      "fiber_g": 0.0,
      "sugar_g": 1.0
    },
    "servings": 4,
    "prep_time_min": 10,
    "cook_time_min": 15,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2019/02/Gomen-1-square.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "R116",
    "name": "Hachee (Dutch Beef &amp; Onion Stew)",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 415.0,
      "protein_g": 33.0,
      "carb_g": 18.0,
      "fat_g": 24.0,
      "fiber_g": 3.0,
      "sugar_g": 6.0
    },
    "servings": 6,
    "prep_time_min": 30,
    "cook_time_min": 180,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2014/01/Hachee-Recipe-3.jpg",
    "cuisine": "dutch"
  },
  {
    "id": "R117",
    "name": "Beef and Barley Stew",
    "meal_types": [
      "dinner",
      "lunch",
      "snack"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "gluten"
    ],
    "nutrition_per_serving": {
      "kcal": 409.0,
      "protein_g": 48.0,
      "carb_g": 22.0,
      "fat_g": 11.0,
      "fiber_g": 4.0,
      "sugar_g": 4.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 50,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2014/02/Beef-Barley-Soup-6-square.jpg",
    "cuisine": "american"
  },
  {
    "id": "R118",
    "name": "Homemade Chicken Broth",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 309.0,
      "protein_g": 22.0,
      "carb_g": 7.0,
      "fat_g": 21.0,
      "fiber_g": 2.0,
      "sugar_g": 3.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 90,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2023/12/Homemade-Chicken-Broth-Recipe-3.jpg",
    "cuisine": ""
  },
  {
    "id": "R120",
    "name": "Jerk Chicken Kabobs",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 352.0,
      "protein_g": 39.0,
      "carb_g": 39.0,
      "fat_g": 5.0,
      "fiber_g": 6.0,
      "sugar_g": 28.0
    },
    "servings": 4,
    "prep_time_min": 20,
    "cook_time_min": 15,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2023/05/Jerk-Chicken-Kabobs-2.jpg",
    "cuisine": "caribbean, jamaican"
  },
  {
    "id": "R121",
    "name": "Jamaican Jerk Chicken",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 309.0,
      "protein_g": 29.0,
      "carb_g": 5.0,
      "fat_g": 15.0,
      "fiber_g": 1.0,
      "sugar_g": 4.0
    },
    "servings": 4,
    "prep_time_min": 15,
    "cook_time_min": 40,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2021/01/Jerk-Chicken-10.jpg",
    "cuisine": "caribbean, jamaican"
  },
  {
    "id": "R122",
    "name": "Lavash (Armenian Flatbread)",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 156.0,
      "protein_g": 4.0,
      "carb_g": 29.0,
      "fat_g": 2.0,
      "fiber_g": 1.0,
      "sugar_g": 1.0
    },
    "servings": 8,
    "prep_time_min": 30,
    "cook_time_min": 10,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2023/10/Lavash-Recipe-11.jpg",
    "cuisine": "armenian, mediterranean, middle eastern, turkish"
  },
  {
    "id": "R124",
    "name": "Misir Wat (Ethiopian Spiced Red Lentils)",
    "meal_types": [
      "dinner",
      "side"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 227.0,
      "protein_g": 10.0,
      "carb_g": 23.0,
      "fat_g": 10.0,
      "fiber_g": 9.0,
      "sugar_g": 2.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 55,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2018/04/Misir-Wat-5-square.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "R125",
    "name": "Lefse (Norwegian Potato Flatbread)",
    "meal_types": [
      "breakfast",
      "side"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 202.0,
      "protein_g": 4.0,
      "carb_g": 29.0,
      "fat_g": 8.0,
      "fiber_g": 2.0,
      "sugar_g": 2.0
    },
    "servings": 8,
    "prep_time_min": 25,
    "cook_time_min": 10,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2025/05/Lefse-Recipe-12.jpg",
    "cuisine": "norwegian"
  },
  {
    "id": "R126",
    "name": "Old Fashioned Beef Stew",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 468.0,
      "protein_g": 36.0,
      "carb_g": 27.0,
      "fat_g": 25.0,
      "fiber_g": 5.0,
      "sugar_g": 6.0
    },
    "servings": 6,
    "prep_time_min": 15,
    "cook_time_min": 180,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2020/02/Beef-Stew-4.jpg",
    "cuisine": "all, american"
  },
  {
    "id": "R130",
    "name": "Sega Wat (Spicy Ethiopian Beef Stew)",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 485.0,
      "protein_g": 34.0,
      "carb_g": 8.0,
      "fat_g": 35.0,
      "fiber_g": 1.0,
      "sugar_g": 3.0
    },
    "servings": 6,
    "prep_time_min": 15,
    "cook_time_min": 90,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2018/02/Sega-Wat-2-square-cropped.jpg",
    "cuisine": "african, ethiopian"
  },
  {
    "id": "R131",
    "name": "Skillet Cornbread",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "corn",
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 419.0,
      "protein_g": 7.0,
      "carb_g": 42.0,
      "fat_g": 25.0,
      "fiber_g": 4.0,
      "sugar_g": 9.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 30,
    "image_url": "https://www.daringgourmet.com/wp-content/uploads/2022/07/Skillet-Cornbread-11.jpg",
    "cuisine": "american, southern"
  },
  {
    "id": "R134",
    "name": "E-A-S-Y Cake Mix and Cool Whip Cookies",
    "meal_types": [
      "snack"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "eggs"
    ],
    "nutrition_per_serving": {
      "kcal": 125.6,
      "protein_g": 1.4,
      "carb_g": 19.1,
      "fat_g": 5.0,
      "fiber_g": 0.2,
      "sugar_g": 14.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 12,
    "image_url": "https://img.sndimg.com/food/image/upload/q_92,fl_progressive,w_1200,c_scale/v1/img/recipes/14/74/96/pics7RUtg.jpg",
    "cuisine": ""
  },
  {
    "id": "R135",
    "name": "Leftover Mashed Potato Pancakes",
    "meal_types": [
      "breakfast",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "eggs",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 266.9,
      "protein_g": 8.8,
      "carb_g": 49.0,
      "fat_g": 3.7,
      "fiber_g": 3.6,
      "sugar_g": 3.3
    },
    "servings": 2,
    "prep_time_min": 5,
    "cook_time_min": 30,
    "image_url": "https://img.sndimg.com/food/image/upload/q_92,fl_progressive,w_1200,c_scale/v1/img/recipes/90/54/QgpKo1rxQpSiZmN5F5jj_untitled-4303.jpg",
    "cuisine": ""
  },
  {
    "id": "R136",
    "name": "Simple Oven-Roasted Corn on the Cob",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "corn",
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 164.2,
      "protein_g": 4.1,
      "carb_g": 24.8,
      "fat_g": 7.5,
      "fiber_g": 2.8,
      "sugar_g": 5.4
    },
    "servings": 4,
    "prep_time_min": 5,
    "cook_time_min": 25,
    "image_url": "https://img.sndimg.com/food/image/upload/q_92,fl_progressive,w_1200,c_scale/v1/img/recipes/24/91/68/Em4Eg8X8Q8iZcyRte9NR_oven-roasted-corn-on-cob_3521.jpg",
    "cuisine": ""
  },
  {
    "id": "R139",
    "name": "The Best Belgian Waffles",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 636.0,
      "protein_g": 13.6,
      "carb_g": 67.3,
      "fat_g": 34.7,
      "fiber_g": 1.7,
      "sugar_g": 12.9
    },
    "servings": 6,
    "prep_time_min": 15,
    "cook_time_min": 25,
    "image_url": "https://img.sndimg.com/food/image/upload/q_92,fl_progressive,w_1200,c_scale/v1/img/recipes/63/07/1/Oey61BTvKAEV0tVQz4gU_untitled-1868.jpg",
    "cuisine": ""
  },
  {
    "id": "R140",
    "name": "Ethiopian Wild Rice Pilaf",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "recomp",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 365.0,
      "protein_g": 17.0,
      "carb_g": 76.0,
      "fat_g": 1.0,
      "fiber_g": 13.0,
      "sugar_g": 6.3
    },
    "servings": 4,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Ethiopian-Wild-Rice-Pilaf-WP.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R141",
    "name": "Savoy Cabbage Rolls",
    "meal_types": [
      "dinner",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 128.0,
      "protein_g": 4.4,
      "carb_g": 27.0,
      "fat_g": 1.1,
      "fiber_g": 3.3,
      "sugar_g": 4.7
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Savoy-Cabbage-Rolls-wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R142",
    "name": "10-Minute Tofu Scramble",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "corn",
      "soy"
    ],
    "nutrition_per_serving": {
      "kcal": 324.0,
      "protein_g": 18.0,
      "carb_g": 50.0,
      "fat_g": 8.0,
      "fiber_g": 11.0,
      "sugar_g": 2.0
    },
    "servings": 1,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/2026/02/10-minute-tofu-scramble-widened.jpg?auto=webp",
    "cuisine": ""
  },
  {
    "id": "R143",
    "name": "Chocolate Pancakes",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "nuts",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 236.625,
      "protein_g": 7.9875,
      "carb_g": 13.5,
      "fat_g": 18.825,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Chocolate-Buttermilk-Pancakes-LR.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R144",
    "name": "Egyptian Breakfast Beans (Ful Medames)",
    "meal_types": [
      "breakfast",
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 70.875,
      "protein_g": 2.8125,
      "carb_g": 15.75,
      "fat_g": 0.225,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 4,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/egyptian_breakfast_beans-WP1.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R145",
    "name": "Gluten-Free Crepes",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 375.0,
      "protein_g": 12.0,
      "carb_g": 62.0,
      "fat_g": 12.0,
      "fiber_g": 9.0,
      "sugar_g": 9.0
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/2024/03/Classic-French-Crepes-Wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": "french"
  },
  {
    "id": "R146",
    "name": "Jammy Blueberry Quinoa Pancakes",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 316.0,
      "protein_g": 9.0,
      "carb_g": 65.0,
      "fat_g": 3.0,
      "fiber_g": 9.0,
      "sugar_g": 26.0
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/2026/01/Jammy-Blueberry-Quinoa-Pancakes.webp?auto=webp",
    "cuisine": "american"
  },
  {
    "id": "R147",
    "name": "Oatmeal-Lemon Pancakes with Raspberry-Date Syrup",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "corn",
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 106.0,
      "protein_g": 2.4,
      "carb_g": 23.0,
      "fat_g": 1.4,
      "fiber_g": 3.1,
      "sugar_g": 9.5
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Oatmeal-Lemon-Pancakes-with-Raspberry-Date-Syrup-wordpress-1.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": "american"
  },
  {
    "id": "R148",
    "name": "Tempeh BLT with Vegan Mayo",
    "meal_types": [
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "soy",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 606.0,
      "protein_g": 66.0,
      "carb_g": 83.0,
      "fat_g": 16.0,
      "fiber_g": 19.0,
      "sugar_g": 31.0
    },
    "servings": 4,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/2026/01/TEmpeh-BLT.webp?auto=webp",
    "cuisine": "american"
  },
  {
    "id": "R149",
    "name": "Air-Fryer Pub Fries with Vinegar",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 179.0,
      "protein_g": 5.0,
      "carb_g": 41.0,
      "fat_g": 0.0,
      "fiber_g": 3.0,
      "sugar_g": 1.0
    },
    "servings": 7,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/2025/07/Vinegar-Pub-Fries-Wordpress.jpg?auto=webp",
    "cuisine": "english"
  },
  {
    "id": "R150",
    "name": "Ethiopian Collard Greens and Chard",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 147.0,
      "protein_g": 6.6,
      "carb_g": 17.4,
      "fat_g": 8.7,
      "fiber_g": 8.1,
      "sugar_g": 1.9
    },
    "servings": 2,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Easy-Sauteed-Collards-and-Chard-3x2-1.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": "ethiopian"
  },
  {
    "id": "R151",
    "name": "Napa Cabbage Salad",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "soy"
    ],
    "nutrition_per_serving": {
      "kcal": 85.0,
      "protein_g": 3.9,
      "carb_g": 12.0,
      "fat_g": 3.4,
      "fiber_g": 1.7,
      "sugar_g": 4.9
    },
    "servings": 6,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Napa-Cabbage-Salad-wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R152",
    "name": "Quick and Easy Injera",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 162.0,
      "protein_g": 1.7,
      "carb_g": 15.0,
      "fat_g": 7.0,
      "fiber_g": 1.5,
      "sugar_g": 1.0
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/2024/02/Almost-Instant-Injera-wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": "ethopian"
  },
  {
    "id": "R153",
    "name": "Roasted Sweet Potato Wedges",
    "meal_types": [
      "dinner",
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 303.0,
      "protein_g": 6.0,
      "carb_g": 70.0,
      "fat_g": 0.4,
      "fiber_g": 11.0,
      "sugar_g": 14.0
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/sweet-potato-wedges-wordpress-scaled.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R154",
    "name": "Spicy French Fries",
    "meal_types": [
      "snack"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 152.0,
      "protein_g": 4.3,
      "carb_g": 35.0,
      "fat_g": 0.4,
      "fiber_g": 3.3,
      "sugar_g": 1.5
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Spicy-Fries.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R155",
    "name": "Tikil Gomen (Ethiopian-Style Cabbage, Potatoes, and Carrots)",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 94.0,
      "protein_g": 2.9,
      "carb_g": 22.0,
      "fat_g": 0.3,
      "fiber_g": 4.6,
      "sugar_g": 6.2
    },
    "servings": 6,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Tikil-Gomen-Ethiopian-Style-Cabbage-Potatoes-and-Carrots-wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": "ethiopian"
  },
  {
    "id": "R156",
    "name": "Warm Spiced Eggplant Salad",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 135.75,
      "protein_g": 8.025,
      "carb_g": 17.625,
      "fat_g": 4.425,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 3,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Warm-Spiced-Eggplant-Salad-wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": "ethiopian"
  },
  {
    "id": "R159",
    "name": "Smoky Sweet Potato Fries with Dipping Sauce",
    "meal_types": [
      "side",
      "snack"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "soy"
    ],
    "nutrition_per_serving": {
      "kcal": 177.0,
      "protein_g": 4.0,
      "carb_g": 39.0,
      "fat_g": 1.0,
      "fiber_g": 5.0,
      "sugar_g": 13.0
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/2026/01/Sweet-Potato-Fries-and-Ranch-Dip.webp?auto=webp",
    "cuisine": "american"
  },
  {
    "id": "R160",
    "name": "30-Minute Chili",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 235.0,
      "protein_g": 13.0,
      "carb_g": 45.0,
      "fat_g": 1.8,
      "fiber_g": 16.0,
      "sugar_g": 6.5
    },
    "servings": 7,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/30-Minute-Chili-for-wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R161",
    "name": "8-Ingredient Lentil Soup with Potatoes and Kale",
    "meal_types": [
      "dinner",
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 431.0,
      "protein_g": 22.0,
      "carb_g": 87.0,
      "fat_g": 1.0,
      "fiber_g": 13.0,
      "sugar_g": 5.0
    },
    "servings": 7,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/2024/08/Hearty-Lentil-Vegetable-Soup-Wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": "american"
  },
  {
    "id": "R162",
    "name": "African Yam Stew",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "corn",
      "dairy",
      "nuts"
    ],
    "nutrition_per_serving": {
      "kcal": 593.0,
      "protein_g": 29.5,
      "carb_g": 115.3,
      "fat_g": 13.4,
      "fiber_g": 32.4,
      "sugar_g": 13.1
    },
    "servings": 6,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/African-Yam-Stew-300kb.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R163",
    "name": "Chipotle Butternut Squash Soup",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 217.0,
      "protein_g": 5.7,
      "carb_g": 52.0,
      "fat_g": 1.1,
      "fiber_g": 9.2,
      "sugar_g": 21.0
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/2024/10/Chipotle-Spiced-Butternut-Squash-Soup-Wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": "american"
  },
  {
    "id": "R164",
    "name": "Chipotle-Potato Wild Rice Soup",
    "meal_types": [
      "dinner",
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 489.0,
      "protein_g": 19.0,
      "carb_g": 82.0,
      "fat_g": 12.0,
      "fiber_g": 11.0,
      "sugar_g": 8.0
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/2024/11/Chipotle-Potato-Wild-Rice-Soup-Wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": "american"
  },
  {
    "id": "R165",
    "name": "Clean-Your-Pantry Lentil-Vegetable Stew",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 386.0,
      "protein_g": 24.0,
      "carb_g": 72.0,
      "fat_g": 1.8,
      "fiber_g": 14.4,
      "sugar_g": 6.0
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Clean-Your-Pantry-Lentil-Vegetable-Stew-wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R166",
    "name": "Creamy Wild Rice Soup",
    "meal_types": [
      "dinner",
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "nuts",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 150.0,
      "protein_g": 7.05,
      "carb_g": 21.0,
      "fat_g": 4.5,
      "fiber_g": 4.05,
      "sugar_g": 6.3
    },
    "servings": 6,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Creamy-Wild-Rice-Soup-for-website.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R167",
    "name": "Curried Tomato Lentil Soup (Shorba Addis)",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 243.0,
      "protein_g": 10.0,
      "carb_g": 50.0,
      "fat_g": 1.2,
      "fiber_g": 7.1,
      "sugar_g": 7.4
    },
    "servings": 3,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Tomato-Lentil-Soup-2-300kb.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R168",
    "name": "Delicata Squash and Roasted Cabbage Stew",
    "meal_types": [
      "dinner",
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 236.0,
      "protein_g": 9.2,
      "carb_g": 51.5,
      "fat_g": 1.3,
      "fiber_g": 9.9,
      "sugar_g": 12.5
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Delicata-and-Roasted-Cabbage-Soup-wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": "german"
  },
  {
    "id": "R169",
    "name": "French Onion Gnocchi Soup",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 412.0,
      "protein_g": 16.0,
      "carb_g": 86.0,
      "fat_g": 1.0,
      "fiber_g": 13.0,
      "sugar_g": 18.0
    },
    "servings": 6,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/2024/03/French-Onion-Baked-Gnocchi-wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": "fusion"
  },
  {
    "id": "R170",
    "name": "Hearty Purple Cabbage Soup",
    "meal_types": [
      "dinner",
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 174.0,
      "protein_g": 7.1,
      "carb_g": 39.0,
      "fat_g": 0.6,
      "fiber_g": 9.5,
      "sugar_g": 13.5
    },
    "servings": 6,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/cabbage-soup-wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R171",
    "name": "Quick and Easy Noodle Soup",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "soy",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 292.0,
      "protein_g": 11.0,
      "carb_g": 60.0,
      "fat_g": 2.4,
      "fiber_g": 8.6,
      "sugar_g": 7.4
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/quick-and-easy-noodle-soup.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R172",
    "name": "Roasted Cauliflower and Sweet Potato Soup",
    "meal_types": [
      "dinner",
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "recomp",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 426.0,
      "protein_g": 17.0,
      "carb_g": 85.0,
      "fat_g": 3.0,
      "fiber_g": 17.0,
      "sugar_g": 13.0
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Roasted-Cauliflower-and-Sweet-Potato-Soup-wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R173",
    "name": "Sage Lentil Stew with Squash and Mushrooms",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 264.0,
      "protein_g": 16.6,
      "carb_g": 50.0,
      "fat_g": 1.0,
      "fiber_g": 8.0,
      "sugar_g": 7.6
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Sage-Lentils-with-Squash-and-Mushrooms-for-wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R174",
    "name": "Shiro Wat (Chickpea Flour Stew)",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "nuts",
      "sesame",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 408.0,
      "protein_g": 6.824999999999999,
      "carb_g": 27.375,
      "fat_g": 31.650000000000002,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 6,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Chickpea-Flour-Stew-Shio-Wat-wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": "ethiopian"
  },
  {
    "id": "R175",
    "name": "Slow-Cooker Vegan Cassoulet",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 538.0,
      "protein_g": 25.0,
      "carb_g": 95.0,
      "fat_g": 3.0,
      "fiber_g": 24.0,
      "sugar_g": 15.0
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Vegan-Cassoulet-Wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": ""
  },
  {
    "id": "R176",
    "name": "Winter Potato-Leek Soup",
    "meal_types": [
      "dinner",
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 171.0,
      "protein_g": 4.7,
      "carb_g": 38.0,
      "fat_g": 0.8,
      "fiber_g": 4.4,
      "sugar_g": 3.2
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.forksoverknives.com/uploads/Winter-Potato-Leek-Soup-wordpress.jpg?format=webp&optimize=high&precrop=16%3A9%2Csmart",
    "cuisine": "american"
  },
  {
    "id": "R177",
    "name": "doro wat - Ethiopian chicken curry",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 434.0,
      "protein_g": 34.0,
      "carb_g": 8.0,
      "fat_g": 29.0,
      "fiber_g": 2.0,
      "sugar_g": 4.0
    },
    "servings": 4,
    "prep_time_min": 20,
    "cook_time_min": 20,
    "image_url": "https://glebekitchen.com/wp-content/uploads/2020/01/dorowatscenetop.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "R178",
    "name": "doro wat \u2013 Ethiopian chicken curry",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 500.25,
      "protein_g": 15.1125,
      "carb_g": 22.5,
      "fat_g": 39.375,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 1,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "",
    "cuisine": ""
  },
  {
    "id": "R192",
    "name": "Azefa - Ethiopian Lentil Salad",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 136.0,
      "protein_g": 6.0,
      "carb_g": 15.0,
      "fat_g": 6.0,
      "fiber_g": 8.0,
      "sugar_g": 1.0
    },
    "servings": 8,
    "prep_time_min": 10,
    "cook_time_min": 35,
    "image_url": "https://globalkitchentravels.com/wp-content/uploads/2013/01/Azefa-LR-FB.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "R193",
    "name": "Azefa \u2013 Ethiopian Lentil Salad",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 418.875,
      "protein_g": 4.9875,
      "carb_g": 16.875,
      "fat_g": 38.287499999999994,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 1,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "",
    "cuisine": ""
  },
  {
    "id": "R195",
    "name": "Chipotle Chicken Chili",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 455.0,
      "protein_g": 35.0,
      "carb_g": 62.0,
      "fat_g": 8.0,
      "fiber_g": 16.0,
      "sugar_g": 10.0
    },
    "servings": 6,
    "prep_time_min": 5,
    "cook_time_min": 15,
    "image_url": "https://globalkitchentravels.com/wp-content/uploads/2020/08/Chicken-Chili-IG.jpg",
    "cuisine": ""
  },
  {
    "id": "R200",
    "name": "Ethiopian Gomen Wat Recipe",
    "meal_types": [
      "dinner",
      "side"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 155.0,
      "protein_g": 4.0,
      "carb_g": 10.0,
      "fat_g": 12.0,
      "fiber_g": 6.0,
      "sugar_g": 2.0
    },
    "servings": 4,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://globalkitchentravels.com/wp-content/uploads/2023/01/Ethiopian-Gomen-Wat-LR.jpg",
    "cuisine": "african, ethiopian"
  },
  {
    "id": "R201",
    "name": "Ethiopian Asa Tibs",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "fish"
    ],
    "nutrition_per_serving": {
      "kcal": 443.93,
      "protein_g": 23.66,
      "carb_g": 10.42,
      "fat_g": 35.34,
      "fiber_g": 4.01,
      "sugar_g": 2.56
    },
    "servings": 6,
    "prep_time_min": 60,
    "cook_time_min": 30,
    "image_url": "https://globalkitchentravels.com/wp-content/uploads/2016/09/tibs-Pin.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "R209",
    "name": "Italian Chicken Farro Salad",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "corn",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 403.0,
      "protein_g": 11.0,
      "carb_g": 72.0,
      "fat_g": 8.0,
      "fiber_g": 5.0,
      "sugar_g": 47.0
    },
    "servings": 8,
    "prep_time_min": 50,
    "cook_time_min": 0,
    "image_url": "https://globalkitchentravels.com/wp-content/uploads/2020/03/Chix-Salad-Lr-FB.jpg",
    "cuisine": ""
  },
  {
    "id": "R212",
    "name": "Mango Chicken Salad",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "corn",
      "eggs"
    ],
    "nutrition_per_serving": {
      "kcal": 204.0,
      "protein_g": 11.0,
      "carb_g": 25.0,
      "fat_g": 7.0,
      "fiber_g": 3.0,
      "sugar_g": 16.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 5,
    "image_url": "https://globalkitchentravels.com/wp-content/uploads/2015/11/Chix-Salad-LR-HERO.jpg",
    "cuisine": "continental"
  },
  {
    "id": "R218",
    "name": "Chicken Masala in the Air Fryer",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 588.0,
      "protein_g": 39.0,
      "carb_g": 5.0,
      "fat_g": 45.0,
      "fiber_g": 2.0,
      "sugar_g": 1.0
    },
    "servings": 4,
    "prep_time_min": 900,
    "cook_time_min": 20,
    "image_url": "https://globalkitchentravels.com/wp-content/uploads/2024/05/Air-Fryer-Masala-Chicken-HERO-LR.jpg",
    "cuisine": "indian"
  },
  {
    "id": "R219",
    "name": "Southern Style Skillet Cornbread",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "corn",
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 121.0,
      "protein_g": 3.0,
      "carb_g": 14.0,
      "fat_g": 6.0,
      "fiber_g": 2.0,
      "sugar_g": 1.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 20,
    "image_url": "https://globalkitchentravels.com/wp-content/uploads/2019/10/Cornbread-FB.jpg",
    "cuisine": "american, southern cuisine"
  },
  {
    "id": "R223",
    "name": "African Cabbage Stew with Ground Beef",
    "meal_types": [
      "dinner",
      "lunch",
      "side"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 388.0,
      "protein_g": 21.0,
      "carb_g": 9.0,
      "fat_g": 30.0,
      "fiber_g": 4.0,
      "sugar_g": 5.0
    },
    "servings": 8,
    "prep_time_min": 10,
    "cook_time_min": 20,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2022/01/African-Cabbage-Stew-with-Ground-Beef-IG-1.jpg",
    "cuisine": "african"
  },
  {
    "id": "R224",
    "name": "African Chicken Peanut Stew",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "nuts"
    ],
    "nutrition_per_serving": {
      "kcal": 504.0,
      "protein_g": 26.0,
      "carb_g": 10.0,
      "fat_g": 41.0,
      "fiber_g": 3.0,
      "sugar_g": 3.0
    },
    "servings": 6,
    "prep_time_min": 5,
    "cook_time_min": 25,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2022/03/African-Chicken-Peanut-Stew-IG-1.jpg",
    "cuisine": "african"
  },
  {
    "id": "R225",
    "name": "Ninja Foodi Chicken Breast",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 321.0,
      "protein_g": 48.0,
      "carb_g": 1.0,
      "fat_g": 13.0,
      "fiber_g": 1.0,
      "sugar_g": 1.0
    },
    "servings": 4,
    "prep_time_min": 20,
    "cook_time_min": 15,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2021/09/Air-Fryer-Chicken-Breast-No-Breading-IG-1.jpg",
    "cuisine": "american"
  },
  {
    "id": "R227",
    "name": "Air Fryer Chicken Leg Quarters",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 387.0,
      "protein_g": 25.0,
      "carb_g": 2.0,
      "fat_g": 33.0,
      "fiber_g": 2.0,
      "sugar_g": 0.0
    },
    "servings": 2,
    "prep_time_min": 5,
    "cook_time_min": 25,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2024/07/Air-Fryer-Chicken-Leg-Quarters-IG-1.jpg",
    "cuisine": "american"
  },
  {
    "id": "R228",
    "name": "Air Fryer Frozen Shrimp",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "shellfish"
    ],
    "nutrition_per_serving": {
      "kcal": 95.0,
      "protein_g": 12.0,
      "carb_g": 1.0,
      "fat_g": 5.0,
      "fiber_g": 0.2,
      "sugar_g": 0.05
    },
    "servings": 4,
    "prep_time_min": 2,
    "cook_time_min": 10,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2022/01/Air-Fryer-Frozen-Shrimp-IG-1.jpg",
    "cuisine": "american"
  },
  {
    "id": "R229",
    "name": "Awaze Tibs - Ethiopian Beef Tibs Recipe",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 486.0,
      "protein_g": 20.0,
      "carb_g": 3.0,
      "fat_g": 43.0,
      "fiber_g": 2.0,
      "sugar_g": 0.2
    },
    "servings": 6,
    "prep_time_min": 5,
    "cook_time_min": 20,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2022/07/Awaze-Tibe-Egyptian-Beef-Tibs-Recipe-IG-1.jpg",
    "cuisine": "african"
  },
  {
    "id": "R231",
    "name": "Berbere Chicken (Delicious Ethiopian Chicken)",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 295.0,
      "protein_g": 18.0,
      "carb_g": 3.0,
      "fat_g": 22.0,
      "fiber_g": 2.0,
      "sugar_g": 0.1
    },
    "servings": 4,
    "prep_time_min": 10,
    "cook_time_min": 20,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2023/10/Berbere-Chicken-IG-1.jpg",
    "cuisine": "african"
  },
  {
    "id": "R236",
    "name": "Chicken Suya",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "nuts"
    ],
    "nutrition_per_serving": {
      "kcal": 118.0,
      "protein_g": 9.0,
      "carb_g": 1.0,
      "fat_g": 9.0,
      "fiber_g": 1.0,
      "sugar_g": 0.1
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 20,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2024/07/Chicken-Suya-IG-1.jpg",
    "cuisine": "nigerian"
  },
  {
    "id": "R237",
    "name": "Coconut Cauliflower Rice",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 57.0,
      "protein_g": 1.0,
      "carb_g": 2.0,
      "fat_g": 5.0,
      "fiber_g": 1.0,
      "sugar_g": 1.0
    },
    "servings": 4,
    "prep_time_min": 0,
    "cook_time_min": 10,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2021/10/Coconut-Cauliflower-Rice-IG-1.jpg",
    "cuisine": "american"
  },
  {
    "id": "R239",
    "name": "Curry Cauliflower Rice",
    "meal_types": [
      "dinner",
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 177.0,
      "protein_g": 3.0,
      "carb_g": 10.0,
      "fat_g": 15.0,
      "fiber_g": 4.0,
      "sugar_g": 4.0
    },
    "servings": 4,
    "prep_time_min": 5,
    "cook_time_min": 15,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2019/04/Curry-Cauliflower-Rice-IG-2.jpg",
    "cuisine": "asian"
  },
  {
    "id": "R240",
    "name": "Doro Wat (Ethiopian Chicken Stew)",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 608.0,
      "protein_g": 39.0,
      "carb_g": 9.0,
      "fat_g": 45.0,
      "fiber_g": 2.0,
      "sugar_g": 3.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 55,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2023/09/Doro-Wat-Spicy-Ethiopian-Chicken-Stew-IG-1.jpg",
    "cuisine": "african, ethiopian"
  },
  {
    "id": "R243",
    "name": "Fried Chicken Drumsticks",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 122.0,
      "protein_g": 13.0,
      "carb_g": 1.0,
      "fat_g": 7.0,
      "fiber_g": 1.0,
      "sugar_g": 1.0
    },
    "servings": 6,
    "prep_time_min": 5,
    "cook_time_min": 20,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2021/10/Fried-Chicken-Drumsticks-IG-1.jpg",
    "cuisine": "african, american"
  },
  {
    "id": "R244",
    "name": "Jamaican Goat Curry Recipe",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 219.0,
      "protein_g": 29.0,
      "carb_g": 3.0,
      "fat_g": 9.0,
      "fiber_g": 1.0,
      "sugar_g": 2.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 60,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2022/12/Goat-Curry-IG-1.jpg",
    "cuisine": "asian"
  },
  {
    "id": "R246",
    "name": "Gomen Wat (Ethiopian Collard Greens)",
    "meal_types": [
      "dinner",
      "side"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 93.0,
      "protein_g": 3.0,
      "carb_g": 8.0,
      "fat_g": 7.0,
      "fiber_g": 4.0,
      "sugar_g": 2.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 25,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2024/01/Gomen-Wat-Ethiopian-Collard-Greens-IG-1.jpg",
    "cuisine": ""
  },
  {
    "id": "R247",
    "name": "Grilled Boneless Chicken Thighs",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 250.0,
      "protein_g": 19.0,
      "carb_g": 1.0,
      "fat_g": 19.0,
      "fiber_g": 1.0,
      "sugar_g": 0.0
    },
    "servings": 4,
    "prep_time_min": 5,
    "cook_time_min": 10,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2023/01/Grilled-Boneless-Chicken-Thighs-IG-1.jpg",
    "cuisine": "american"
  },
  {
    "id": "R248",
    "name": "Grilled T-Bone Steak",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 756.0,
      "protein_g": 71.0,
      "carb_g": 1.0,
      "fat_g": 50.0,
      "fiber_g": 1.0,
      "sugar_g": 1.0
    },
    "servings": 2,
    "prep_time_min": 2,
    "cook_time_min": 18,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2023/01/How-to-Cook-T-Bone-Steak-IG-1.jpg",
    "cuisine": "american"
  },
  {
    "id": "R249",
    "name": "Groundnut Soup",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "nuts",
      "shellfish"
    ],
    "nutrition_per_serving": {
      "kcal": 513.0,
      "protein_g": 29.0,
      "carb_g": 11.0,
      "fat_g": 41.0,
      "fiber_g": 4.0,
      "sugar_g": 4.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 45,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2024/07/Groundnut-Soup-IG-1.jpg",
    "cuisine": "african, nigerian"
  },
  {
    "id": "R251",
    "name": "Instant Pot Pork Chops",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 458.0,
      "protein_g": 36.0,
      "carb_g": 2.0,
      "fat_g": 35.0,
      "fiber_g": 1.0,
      "sugar_g": 1.0
    },
    "servings": 4,
    "prep_time_min": 5,
    "cook_time_min": 40,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2020/09/Instant-Pot-Pork-Chops-IG-1.jpg",
    "cuisine": "american"
  },
  {
    "id": "R253",
    "name": "Keto Cauliflower Potato Salad",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 178.0,
      "protein_g": 7.0,
      "carb_g": 6.0,
      "fat_g": 14.0,
      "fiber_g": 2.0,
      "sugar_g": 2.0
    },
    "servings": 6,
    "prep_time_min": 5,
    "cook_time_min": 30,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2022/01/Keto-Cauliflower-Potato-Salad-IG-1.jpg",
    "cuisine": "american"
  },
  {
    "id": "R254",
    "name": "Keto Fried Shrimp",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "eggs",
      "gluten",
      "nuts",
      "shellfish",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 418.0,
      "protein_g": 40.0,
      "carb_g": 4.0,
      "fat_g": 28.0,
      "fiber_g": 1.0,
      "sugar_g": 0.4
    },
    "servings": 4,
    "prep_time_min": 5,
    "cook_time_min": 10,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2024/07/Keto-Fried-Shrimp-IG-1.jpg",
    "cuisine": "american"
  },
  {
    "id": "R255",
    "name": "Keto Gravy",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 29.0,
      "protein_g": 1.0,
      "carb_g": 1.0,
      "fat_g": 3.0,
      "fiber_g": 1.0,
      "sugar_g": 1.0
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 10,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2021/11/Keto-Gravy-IG-1.jpg",
    "cuisine": "american"
  },
  {
    "id": "R261",
    "name": "Ninja Foodi Pork Chops",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 119.0,
      "protein_g": 14.0,
      "carb_g": 1.0,
      "fat_g": 6.0,
      "fiber_g": 0.0,
      "sugar_g": 1.0
    },
    "servings": 4,
    "prep_time_min": 2,
    "cook_time_min": 25,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2022/03/Ninja-Foodi-Pork-Chops-IG-1.jpg",
    "cuisine": "american"
  },
  {
    "id": "R262",
    "name": "Ninja Foodi Whole Chicken (Air Fryer Rotisserie Chicken)",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 239.0,
      "protein_g": 17.0,
      "carb_g": 1.0,
      "fat_g": 19.0,
      "fiber_g": 1.0,
      "sugar_g": 0.0
    },
    "servings": 6,
    "prep_time_min": 5,
    "cook_time_min": 60,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2021/11/Ninja-Foodi-Whole-Chicken-IG-1.jpg",
    "cuisine": "american"
  },
  {
    "id": "R270",
    "name": "Sega Wat (Ethiopian Beef Stew)",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 335.0,
      "protein_g": 33.0,
      "carb_g": 7.0,
      "fat_g": 18.0,
      "fiber_g": 2.0,
      "sugar_g": 2.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 60,
    "image_url": "https://lowcarbafrica.com/wp-content/uploads/2023/10/Sega-Wat-Spicy-Ethiopian-Beef-Stew-IG-1.jpg",
    "cuisine": "african"
  },
  {
    "id": "R275",
    "name": "Vegan Baked Gnocchi with Arrabbiata",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 662.0,
      "protein_g": 15.0,
      "carb_g": 79.0,
      "fat_g": 33.0,
      "fiber_g": 7.0,
      "sugar_g": 7.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 30,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2018/03/vegan-baked-gnocchi-with-arrabbiata-3-720x720.jpg",
    "cuisine": "italian"
  },
  {
    "id": "R276",
    "name": "Vegan Buffalo Pizza",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "soy"
    ],
    "nutrition_per_serving": {
      "kcal": 714.0,
      "protein_g": 33.0,
      "carb_g": 78.0,
      "fat_g": 31.0,
      "fiber_g": 8.0,
      "sugar_g": 9.0
    },
    "servings": 3,
    "prep_time_min": 30,
    "cook_time_min": 15,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2017/12/vegan-buffalo-pizza-11-480x480.jpg",
    "cuisine": "american"
  },
  {
    "id": "R277",
    "name": "Caramelized Onion White Bean Dip",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 94.0,
      "protein_g": 4.0,
      "carb_g": 14.0,
      "fat_g": 3.0,
      "fiber_g": 3.0,
      "sugar_g": 2.0
    },
    "servings": 4,
    "prep_time_min": 10,
    "cook_time_min": 30,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2020/08/caramelized-onion-white-bean-dip-4-480x480.jpg",
    "cuisine": "american"
  },
  {
    "id": "R281",
    "name": "Easy Vegan Cornbread",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "corn",
      "dairy",
      "gluten",
      "nuts",
      "soy",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 107.0,
      "protein_g": 2.0,
      "carb_g": 14.0,
      "fat_g": 5.0,
      "fiber_g": 1.0,
      "sugar_g": 2.0
    },
    "servings": 8,
    "prep_time_min": 15,
    "cook_time_min": 25,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2019/11/vegan-cornbread-9-480x480.jpg",
    "cuisine": "american"
  },
  {
    "id": "R283",
    "name": "Garlic Scape Pizza",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 394.125,
      "protein_g": 2.7375,
      "carb_g": 13.8375,
      "fat_g": 37.7625,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 3,
    "prep_time_min": 60,
    "cook_time_min": 10,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2019/06/garlic-scape-pizza-6-480x480.jpg",
    "cuisine": "american"
  },
  {
    "id": "R286",
    "name": "Homemade Kale Soda Bread",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "soy",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 164.0,
      "protein_g": 5.0,
      "carb_g": 30.0,
      "fat_g": 3.0,
      "fiber_g": 2.0,
      "sugar_g": 2.0
    },
    "servings": 1,
    "prep_time_min": 15,
    "cook_time_min": 40,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2020/03/kale-soda-bread-7-480x480.jpg",
    "cuisine": "irish"
  },
  {
    "id": "R287",
    "name": "Easy Homemade Vegan Gnocchi Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 194.0,
      "protein_g": 5.0,
      "carb_g": 34.0,
      "fat_g": 4.0,
      "fiber_g": 2.0,
      "sugar_g": 0.0
    },
    "servings": 2,
    "prep_time_min": 30,
    "cook_time_min": 10,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2018/02/homemade-vegan-gnocchi-7-480x480.jpg",
    "cuisine": "italian"
  },
  {
    "id": "R288",
    "name": "Jamaican Black-eyed Pea Curry",
    "meal_types": [
      "dinner",
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 217.0,
      "protein_g": 8.0,
      "carb_g": 33.0,
      "fat_g": 7.0,
      "fiber_g": 7.0,
      "sugar_g": 5.0
    },
    "servings": 8,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2019/01/Jamaican-black-eyed-pea-curry-6-480x480.jpg",
    "cuisine": "jamaican"
  },
  {
    "id": "R290",
    "name": "Jamaican Jerk Tempeh",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "soy"
    ],
    "nutrition_per_serving": {
      "kcal": 190.0,
      "protein_g": 16.0,
      "carb_g": 9.0,
      "fat_g": 12.0,
      "fiber_g": 1.0,
      "sugar_g": 2.0
    },
    "servings": 6,
    "prep_time_min": 5,
    "cook_time_min": 10,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2021/10/jamaican-jerk-tempeh-3-720x720.jpg",
    "cuisine": "jamaican"
  },
  {
    "id": "R291",
    "name": "Jamaican Red Beans and Rice",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 301.0,
      "protein_g": 12.0,
      "carb_g": 39.0,
      "fat_g": 12.0,
      "fiber_g": 7.0,
      "sugar_g": 1.0
    },
    "servings": 8,
    "prep_time_min": 10,
    "cook_time_min": 30,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2021/10/jamaican-red-beans-and-rice-7-720x720.jpg",
    "cuisine": "jamaican"
  },
  {
    "id": "R294",
    "name": "Peanut Tofu Spring Rolls",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "nuts",
      "soy"
    ],
    "nutrition_per_serving": {
      "kcal": 240.0,
      "protein_g": 11.0,
      "carb_g": 24.0,
      "fat_g": 12.0,
      "fiber_g": 3.0,
      "sugar_g": 5.0
    },
    "servings": 8,
    "prep_time_min": 20,
    "cook_time_min": 10,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2021/01/peanut-tofu-spring-rolls-2-720x720.jpg",
    "cuisine": "vietnamese"
  },
  {
    "id": "R295",
    "name": "Pesto Leek Pizza with Coconut Bacon",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "corn",
      "soy"
    ],
    "nutrition_per_serving": {
      "kcal": 684.375,
      "protein_g": 9.375,
      "carb_g": 30.0,
      "fat_g": 62.6625,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 3,
    "prep_time_min": 30,
    "cook_time_min": 10,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2019/05/pesto-leek-pizza-5-480x480.jpg",
    "cuisine": "italian"
  },
  {
    "id": "R296",
    "name": "Smashed Potato Pesto Pizzas",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 668.25,
      "protein_g": 9.1125,
      "carb_g": 25.4625,
      "fat_g": 62.175,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 8,
    "prep_time_min": 10,
    "cook_time_min": 40,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2017/06/smashed-potato-pizza-7-480x480.jpg",
    "cuisine": "american"
  },
  {
    "id": "R300",
    "name": "Seasoned Black Beans",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 180.0,
      "protein_g": 9.0,
      "carb_g": 26.0,
      "fat_g": 5.0,
      "fiber_g": 6.0,
      "sugar_g": 1.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 25,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2020/07/seasoned-black-beans-14-480x480.jpg",
    "cuisine": ""
  },
  {
    "id": "R301",
    "name": "Smoky Collard Greens",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "soy"
    ],
    "nutrition_per_serving": {
      "kcal": 84.0,
      "protein_g": 4.0,
      "carb_g": 10.0,
      "fat_g": 4.0,
      "fiber_g": 5.0,
      "sugar_g": 3.0
    },
    "servings": 4,
    "prep_time_min": 10,
    "cook_time_min": 8,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2019/07/smoky-collard-greens-pinterest-480x480.jpg",
    "cuisine": "american"
  },
  {
    "id": "R302",
    "name": "Sweet Corn Risotto",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "corn",
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 261.0,
      "protein_g": 6.0,
      "carb_g": 35.0,
      "fat_g": 9.0,
      "fiber_g": 3.0,
      "sugar_g": 7.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 30,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2021/08/sweet-corn-risotto-11-720x720.jpg",
    "cuisine": "italian-american"
  },
  {
    "id": "R304",
    "name": "Tofu and Udon Noodle Almond Butter Stir Fry",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "corn",
      "dairy",
      "nuts",
      "sesame",
      "soy"
    ],
    "nutrition_per_serving": {
      "kcal": 702.375,
      "protein_g": 18.150000000000002,
      "carb_g": 50.1,
      "fat_g": 51.975,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 6,
    "prep_time_min": 30,
    "cook_time_min": 15,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2018/10/DSC_0894-e1492025349299-720x720.jpg",
    "cuisine": "pan-asian"
  },
  {
    "id": "R305",
    "name": "Vegan Apple Pecan Cinnamon Rolls",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 366.0,
      "protein_g": 0.0,
      "carb_g": 0.0,
      "fat_g": 0.0,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 8,
    "prep_time_min": 105,
    "cook_time_min": 40,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2017/10/apple-pecan-cinnamon-rolls-6-720x720.jpg",
    "cuisine": "american"
  },
  {
    "id": "R306",
    "name": "Vegan Barbacoa Tacos",
    "meal_types": [
      "snack"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "corn",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 161.0,
      "protein_g": 16.0,
      "carb_g": 18.0,
      "fat_g": 3.0,
      "fiber_g": 3.0,
      "sugar_g": 2.0
    },
    "servings": 8,
    "prep_time_min": 10,
    "cook_time_min": 35,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2021/03/vegan-barbacoa-tacos-9-720x720.jpg",
    "cuisine": ""
  },
  {
    "id": "R307",
    "name": "Vegan Berbere Mac and Cheese",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 299.0,
      "protein_g": 10.0,
      "carb_g": 36.0,
      "fat_g": 14.0,
      "fiber_g": 2.0,
      "sugar_g": 9.0
    },
    "servings": 8,
    "prep_time_min": 10,
    "cook_time_min": 35,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2021/03/vegan-berbere-mac-and-cheese-13-720x720.jpg",
    "cuisine": "ethiopian-american"
  },
  {
    "id": "R310",
    "name": "Vegan Cheese Fondue",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "soy",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 209.625,
      "protein_g": 9.1875,
      "carb_g": 41.85,
      "fat_g": 2.025,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 5,
    "prep_time_min": 10,
    "cook_time_min": 10,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2018/12/cheese-fondue-3-480x480.jpg",
    "cuisine": "swiss"
  },
  {
    "id": "R312",
    "name": "Vegan Creamy Garlic Noodles",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 245.0,
      "protein_g": 8.0,
      "carb_g": 28.0,
      "fat_g": 12.0,
      "fiber_g": 3.0,
      "sugar_g": 1.0
    },
    "servings": 8,
    "prep_time_min": 5,
    "cook_time_min": 15,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2022/01/vegan-creamy-garlic-noodles-1.jpg",
    "cuisine": "american"
  },
  {
    "id": "R313",
    "name": "Vegan Creamy Garlic Pasta with Shaved Brussels Sprouts",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 297.0,
      "protein_g": 10.0,
      "carb_g": 36.0,
      "fat_g": 14.0,
      "fiber_g": 4.0,
      "sugar_g": 3.0
    },
    "servings": 8,
    "prep_time_min": 10,
    "cook_time_min": 25,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2021/01/shaved-brussels-sprouts-creamy-garlic-pasta-9-720x720.jpg",
    "cuisine": "american"
  },
  {
    "id": "R315",
    "name": "Vegan French Onion Soup",
    "meal_types": [
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 412.0,
      "protein_g": 11.0,
      "carb_g": 57.0,
      "fat_g": 13.0,
      "fiber_g": 4.0,
      "sugar_g": 21.0
    },
    "servings": 6,
    "prep_time_min": 10,
    "cook_time_min": 90,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2021/12/vegan-French-onion-soup-12-720x720.jpg",
    "cuisine": "french"
  },
  {
    "id": "R319",
    "name": "Vegan Ramen with Miso Tahini Broth",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "corn",
      "sesame",
      "soy"
    ],
    "nutrition_per_serving": {
      "kcal": 364.0,
      "protein_g": 10.0,
      "carb_g": 46.0,
      "fat_g": 16.0,
      "fiber_g": 5.0,
      "sugar_g": 14.0
    },
    "servings": 6,
    "prep_time_min": 15,
    "cook_time_min": 15,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2019/04/vegan-ramen-with-miso-tahini-broth-6-480x480.jpg",
    "cuisine": "japanese"
  },
  {
    "id": "R320",
    "name": "Vegan Seitan Steaks",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "soy",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 452.0,
      "protein_g": 67.0,
      "carb_g": 24.0,
      "fat_g": 9.0,
      "fiber_g": 3.0,
      "sugar_g": 3.0
    },
    "servings": 2,
    "prep_time_min": 20,
    "cook_time_min": 35,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2021/08/vegan-seitan-steaks-2-720x720.jpg",
    "cuisine": "american"
  },
  {
    "id": "R322",
    "name": "Vegan Sweet Corn Velout\u00e9",
    "meal_types": [
      "lunch"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "corn"
    ],
    "nutrition_per_serving": {
      "kcal": 419.625,
      "protein_g": 3.6375,
      "carb_g": 19.5,
      "fat_g": 38.2125,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 4,
    "prep_time_min": 60,
    "cook_time_min": 25,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2019/01/sweetcornveloute-title-720x720.jpg",
    "cuisine": "french"
  },
  {
    "id": "R323",
    "name": "Vegan White Bean Wild Rice Soup",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 333.0,
      "protein_g": 12.0,
      "carb_g": 42.0,
      "fat_g": 14.0,
      "fiber_g": 10.0,
      "sugar_g": 5.0
    },
    "servings": 5,
    "prep_time_min": 15,
    "cook_time_min": 65,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2021/12/vegan-white-bean-wild-rice-soup-7-720x720.jpg",
    "cuisine": "french"
  },
  {
    "id": "R324",
    "name": "Waffle Fry Nachos with Vegan Queso",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 135.375,
      "protein_g": 3.2624999999999997,
      "carb_g": 20.8125,
      "fat_g": 5.775,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 4,
    "prep_time_min": 10,
    "cook_time_min": 30,
    "image_url": "https://www.thecuriouschickpea.com/wp-content/uploads/2019/03/waffle-fry-nachos-2-480x480.jpg",
    "cuisine": "mexican"
  },
  {
    "id": "R328",
    "name": "Ethiopian Tomato Salad",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 394.125,
      "protein_g": 1.7625000000000002,
      "carb_g": 13.8375,
      "fat_g": 38.0625,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 1,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://thespiceadventuress.com/wp-content/uploads/2015/01/53.jpg",
    "cuisine": "african, ethiopian"
  },
  {
    "id": "R329",
    "name": "Fire Roasted Capsicum, Tomato and Mozzarella Salad",
    "meal_types": [
      "dinner",
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 338.25,
      "protein_g": 0.3375,
      "carb_g": 1.4625,
      "fat_g": 37.575,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 1,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://thespiceadventuress.com/wp-content/uploads/2017/06/2.jpg",
    "cuisine": "modern australian"
  },
  {
    "id": "R330",
    "name": "Chocolate Protein Lava Cake",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "nuts"
    ],
    "nutrition_per_serving": {
      "kcal": 357.0,
      "protein_g": 23.0,
      "carb_g": 19.0,
      "fat_g": 21.0,
      "fiber_g": 0.0,
      "sugar_g": 4.5
    },
    "servings": 2,
    "prep_time_min": 5,
    "cook_time_min": 5,
    "image_url": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/protein-chocolate-lava-cake-recipe.jpg",
    "cuisine": "american"
  },
  {
    "id": "R331",
    "name": "Almond and Walnut Tabbouleh Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 170.0,
      "protein_g": 3.0,
      "carb_g": 8.0,
      "fat_g": 15.0,
      "fiber_g": 0.0,
      "sugar_g": 4.0
    },
    "servings": 4,
    "prep_time_min": 10,
    "cook_time_min": 8,
    "image_url": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/almond-and-walnut-tabbouleh-recipe-002.jpg",
    "cuisine": "lebanese, american"
  },
  {
    "id": "R333",
    "name": "Coconut Cashew Keto Fried Chicken Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 420.0,
      "protein_g": 30.0,
      "carb_g": 6.0,
      "fat_g": 27.0,
      "fiber_g": 0.0,
      "sugar_g": 3.0
    },
    "servings": 4,
    "prep_time_min": 10,
    "cook_time_min": 10,
    "image_url": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/keto-fried-chicken-recipe-for-keto-meal-prep.jpg",
    "cuisine": "american"
  },
  {
    "id": "R337",
    "name": "Grilled Cheese Recipe High-Protein with Pulled Pork",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 310.0,
      "protein_g": 25.0,
      "carb_g": 13.0,
      "fat_g": 16.0,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 4,
    "prep_time_min": 5,
    "cook_time_min": 10,
    "image_url": "https://www.trifectanutrition.com/hubfs/highproteingrilledcheese-125kb.jpg",
    "cuisine": "american"
  },
  {
    "id": "R338",
    "name": "High Protein Chia Seed Pudding Recipe",
    "meal_types": [
      "snack"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 260.0,
      "protein_g": 21.0,
      "carb_g": 10.0,
      "fat_g": 11.0,
      "fiber_g": 0.0,
      "sugar_g": 2.0
    },
    "servings": 1,
    "prep_time_min": 5,
    "cook_time_min": 0,
    "image_url": "https://www.trifectanutrition.com/hubfs/keto-chia-pudding-recipe.jpg",
    "cuisine": "american"
  },
  {
    "id": "R339",
    "name": "High-Protein French Toast Recipe",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "eggs",
      "gluten",
      "nuts",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 370.0,
      "protein_g": 32.0,
      "carb_g": 49.0,
      "fat_g": 17.0,
      "fiber_g": 0.0,
      "sugar_g": 6.0
    },
    "servings": 6,
    "prep_time_min": 5,
    "cook_time_min": 15,
    "image_url": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20A%20La%20Carte%20Recipe%20Photos/proteinfrenchtoastrecipe.jpg",
    "cuisine": "american"
  },
  {
    "id": "R340",
    "name": "High Protein Pesto Pasta Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 420.0,
      "protein_g": 20.0,
      "carb_g": 49.0,
      "fat_g": 18.0,
      "fiber_g": 0.0,
      "sugar_g": 3.0
    },
    "servings": 4,
    "prep_time_min": 10,
    "cook_time_min": 12,
    "image_url": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/TBVeganPestoPastasq0001.jpg",
    "cuisine": "american,italian,mediterranean"
  },
  {
    "id": "R341",
    "name": "High-Protein Vegan Tuna Salad Recipe",
    "meal_types": [
      "dinner",
      "lunch",
      "side",
      "snack"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "sesame",
      "soy"
    ],
    "nutrition_per_serving": {
      "kcal": 300.0,
      "protein_g": 22.0,
      "carb_g": 33.0,
      "fat_g": 11.0,
      "fiber_g": 0.0,
      "sugar_g": 4.0
    },
    "servings": 4,
    "prep_time_min": 5,
    "cook_time_min": 0,
    "image_url": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/vegannotunasaladsq0005.jpg",
    "cuisine": "vegan, vegetarian"
  },
  {
    "id": "R342",
    "name": "Homemade Vegetarian Chili Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 390.0,
      "protein_g": 24.0,
      "carb_g": 41.0,
      "fat_g": 16.0,
      "fiber_g": 0.0,
      "sugar_g": 13.0
    },
    "servings": 4,
    "prep_time_min": 10,
    "cook_time_min": 20,
    "image_url": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/vegetarian-chili-recipe-in-meal-prep-container02.jpg",
    "cuisine": "american"
  },
  {
    "id": "R343",
    "name": "Keto Low-Carb Oatmeal Recipe",
    "meal_types": [
      "breakfast",
      "snack"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "recomp",
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "nuts"
    ],
    "nutrition_per_serving": {
      "kcal": 450.0,
      "protein_g": 19.0,
      "carb_g": 9.0,
      "fat_g": 32.0,
      "fiber_g": 0.0,
      "sugar_g": 7.0
    },
    "servings": 1,
    "prep_time_min": 5,
    "cook_time_min": 10,
    "image_url": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Keto%20Recipe%20Photos/keto-low-carb-oatmeal-for-keto-meal-prep.jpg",
    "cuisine": "american"
  },
  {
    "id": "R345",
    "name": "Pork Bites Recipe High-Protein and Low-Calorie",
    "meal_types": [
      "snack"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "nuts"
    ],
    "nutrition_per_serving": {
      "kcal": 80.0,
      "protein_g": 6.0,
      "carb_g": 2.0,
      "fat_g": 5.0,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 4,
    "prep_time_min": 10,
    "cook_time_min": 12,
    "image_url": "https://www.trifectanutrition.com/hubfs/porkbites-125kb.jpg",
    "cuisine": "american"
  },
  {
    "id": "R346",
    "name": "Pulled Pork Nachos Recipe High-Protein",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 490.0,
      "protein_g": 32.0,
      "carb_g": 35.0,
      "fat_g": 23.0,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 4,
    "prep_time_min": 10,
    "cook_time_min": 3,
    "image_url": "https://www.trifectanutrition.com/hubfs/nachos-125kb-1.jpg",
    "cuisine": "american"
  },
  {
    "id": "R347",
    "name": "Savoury Grilled Tofu and Rice Bowl",
    "meal_types": [
      "lunch",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "soy"
    ],
    "nutrition_per_serving": {
      "kcal": 470.0,
      "protein_g": 29.0,
      "carb_g": 55.0,
      "fat_g": 17.0,
      "fiber_g": 0.0,
      "sugar_g": 4.0
    },
    "servings": 4,
    "prep_time_min": 5,
    "cook_time_min": 6,
    "image_url": "https://www.trifectanutrition.com/hubfs/high-protein-vegan-recipes-meal-prep-grilled-tofu-and-quinoa%20(3).jpg",
    "cuisine": "american,asian"
  },
  {
    "id": "R348",
    "name": "Sloppy Joe Recipe High-Protein with Pulled Pork",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "gluten",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 410.0,
      "protein_g": 27.0,
      "carb_g": 52.0,
      "fat_g": 14.0,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    "servings": 4,
    "prep_time_min": 10,
    "cook_time_min": 12,
    "image_url": "https://www.trifectanutrition.com/hubfs/sloppyjoe-125kb.jpg",
    "cuisine": "american"
  },
  {
    "id": "R349",
    "name": "Vegan Beyond Burger Tacos",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 500.0,
      "protein_g": 30.0,
      "carb_g": 38.0,
      "fat_g": 24.0,
      "fiber_g": 0.0,
      "sugar_g": 2.0
    },
    "servings": 8,
    "prep_time_min": 8,
    "cook_time_min": 10,
    "image_url": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/vegan-taco-recipe-002.jpg",
    "cuisine": "mexican, american"
  },
  {
    "id": "R350",
    "name": "Savory Vegan Portobello Pot Roast Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "corn"
    ],
    "nutrition_per_serving": {
      "kcal": 330.0,
      "protein_g": 22.0,
      "carb_g": 28.0,
      "fat_g": 14.0,
      "fiber_g": 0.0,
      "sugar_g": 5.0
    },
    "servings": 5,
    "prep_time_min": 15,
    "cook_time_min": 30,
    "image_url": "https://www.trifectanutrition.com/hs-fs/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/VeganPortobelloPotRoastRecipesq0002.jpg?width=719&quality=high",
    "cuisine": "american"
  },
  {
    "id": "R351",
    "name": "Vegan BBQ Tofu Stir Fry Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "corn",
      "soy"
    ],
    "nutrition_per_serving": {
      "kcal": 390.0,
      "protein_g": 25.0,
      "carb_g": 41.0,
      "fat_g": 14.0,
      "fiber_g": 0.0,
      "sugar_g": 7.0
    },
    "servings": 4,
    "prep_time_min": 10,
    "cook_time_min": 15,
    "image_url": "https://www.trifectanutrition.com/hubfs/Vegan-BBQ-Tofu-Stir-Fry-Recipe-1-1-1.png",
    "cuisine": "american,asian"
  },
  {
    "id": "R352",
    "name": "Vegan California Burger Recipe",
    "meal_types": [
      "dinner"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 530.0,
      "protein_g": 30.0,
      "carb_g": 42.0,
      "fat_g": 28.0,
      "fiber_g": 0.0,
      "sugar_g": 6.0
    },
    "servings": 4,
    "prep_time_min": 10,
    "cook_time_min": 8,
    "image_url": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/VeganCaliforniaBurgerRecipesquare0004.jpg",
    "cuisine": "american"
  },
  {
    "id": "R353",
    "name": "Vegan Mediterranean Breakfast Skillet",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 360.0,
      "protein_g": 22.0,
      "carb_g": 28.0,
      "fat_g": 18.0,
      "fiber_g": 0.0,
      "sugar_g": 5.0
    },
    "servings": 5,
    "prep_time_min": 10,
    "cook_time_min": 12,
    "image_url": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/TBVeganMedSkillethd0001.jpg",
    "cuisine": "american,mediterranean"
  },
  {
    "id": "R354",
    "name": "Vegan Pumpkin Pie Chia Pudding",
    "meal_types": [
      "snack"
    ],
    "diet_types": [
      "OMNI"
    ],
    "goal_fit": [
      "maintenance"
    ],
    "allergens": [
      "dairy",
      "nuts"
    ],
    "nutrition_per_serving": {
      "kcal": 180.0,
      "protein_g": 4.0,
      "carb_g": 25.0,
      "fat_g": 8.0,
      "fiber_g": 0.0,
      "sugar_g": 8.0
    },
    "servings": 2,
    "prep_time_min": 5,
    "cook_time_min": 0,
    "image_url": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/pumpkin-pie-chia-seed-pudding.jpg",
    "cuisine": "american"
  },
  {
    "id": "R355",
    "name": "Vegan Southwest Baked Sweet Potato Recipe",
    "meal_types": [
      "dinner",
      "side"
    ],
    "diet_types": [
      "VEGAN"
    ],
    "goal_fit": [
      "cut",
      "bulk",
      "maintenance"
    ],
    "allergens": [
      "corn",
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 470.0,
      "protein_g": 26.0,
      "carb_g": 32.0,
      "fat_g": 7.0,
      "fiber_g": 0.0,
      "sugar_g": 6.0
    },
    "servings": 4,
    "prep_time_min": 10,
    "cook_time_min": 30,
    "image_url": "https://www.trifectanutrition.com/hubfs/Trifecta%20Blog%20Recipe%20Photos/TB%20Vegan%20Recipe%20Photos/loaded-vegan-southwest-sweet-potato-recipe-005.jpg",
    "cuisine": "southwest, american, mexican "
  },
  {
    "id": "ETH001",
    "name": "Anebabero",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [],
    "allergens": [
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 370.0,
      "protein_g": 13.0,
      "carb_g": 75.0,
      "fat_g": 2.0,
      "fiber_g": 8.0
    },
    "servings": 5,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://ethiopian-food.org/wp-content/uploads/2024/02/Anebabero-Recipe-150x150.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "ETH002",
    "name": "Ayib",
    "meal_types": [
      "snack"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 250.0,
      "protein_g": 17.0,
      "carb_g": 8.0,
      "fat_g": 23.0,
      "fiber_g": 0
    },
    "servings": 4,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://ethiopian-food.org/wp-content/uploads/2022/12/Ayib-Ethiopian-Cottage-Cheese-150x150.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "ETH003",
    "name": "Azifa",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 210.0,
      "protein_g": 7.0,
      "carb_g": 26.0,
      "fat_g": 9.0,
      "fiber_g": 6.0
    },
    "servings": 1,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://ethiopian-food.org/wp-content/uploads/Azifa-1-1-150x150.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "ETH004",
    "name": "Chechebsa",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [],
    "allergens": [
      "dairy",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 210.0,
      "protein_g": 3.0,
      "carb_g": 23.0,
      "fat_g": 10.5,
      "fiber_g": 1.0
    },
    "servings": 1,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://ethiopian-food.org/wp-content/uploads/1_Chechebsa-1024x576-150x150.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "ETH005",
    "name": "Chiko",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [],
    "allergens": [
      "dairy",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 200.0,
      "protein_g": 2.0,
      "carb_g": 17.0,
      "fat_g": 19.0,
      "fiber_g": 2.0
    },
    "servings": 4,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://ethiopian-food.org/wp-content/uploads/2024/02/Chiko-Ethiopian-Spiced-Butter-Cookies-Recipe-150x150.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "ETH006",
    "name": "Enkulal Firfir",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [],
    "allergens": [
      "dairy",
      "eggs"
    ],
    "nutrition_per_serving": {
      "kcal": 240.0,
      "protein_g": 14.0,
      "carb_g": 5.0,
      "fat_g": 18.0,
      "fiber_g": 1.0
    },
    "servings": 1,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://ethiopian-food.org/wp-content/uploads/Enkulal-Tibs-1-1-150x150.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "ETH007",
    "name": "Fossolia",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 250.0,
      "protein_g": 3.0,
      "carb_g": 22.0,
      "fat_g": 14.0,
      "fiber_g": 6.0
    },
    "servings": 4,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://ethiopian-food.org/wp-content/uploads/Fossolia-1-1-150x150.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "ETH008",
    "name": "Kategna",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [],
    "allergens": [
      "dairy"
    ],
    "nutrition_per_serving": {
      "kcal": 360.0,
      "protein_g": 4.0,
      "carb_g": 22.0,
      "fat_g": 28.0,
      "fiber_g": 2.0
    },
    "servings": 4,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://ethiopian-food.org/wp-content/uploads/2024/04/Kategna-HQ-150x150.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "ETH009",
    "name": "Kinche",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [],
    "allergens": [
      "dairy",
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 200.0,
      "protein_g": 5.0,
      "carb_g": 22.0,
      "fat_g": 10.0,
      "fiber_g": 2.0
    },
    "servings": 1,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://ethiopian-food.org/wp-content/uploads/Kinche-2-1-1-150x150.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "ETH010",
    "name": "Misir Sambusa",
    "meal_types": [
      "snack"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [],
    "allergens": [
      "eggs"
    ],
    "nutrition_per_serving": {
      "kcal": 200.0,
      "protein_g": 4.0,
      "carb_g": 18.0,
      "fat_g": 12.0,
      "fiber_g": 3.0,
      "sugar_g": 0.0
    },
    "servings": 5,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://ethiopian-food.org/wp-content/uploads/2024/02/YeMisir-Sambusa-Ethiopian-Lentil-Samosa-Recipe-150x150.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "ETH011",
    "name": "Sinig",
    "meal_types": [
      "snack"
    ],
    "diet_types": [
      "OMNI_ETHIOPIAN"
    ],
    "goal_fit": [],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 130.0,
      "protein_g": 1.0,
      "carb_g": 4.0,
      "fat_g": 12.0,
      "fiber_g": 1.0
    },
    "servings": 5,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://ethiopian-food.org/wp-content/uploads/2024/02/Sinig-Ethiopian-Stuffed-Jalapenos-Recipe-150x150.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "ETH012",
    "name": "Suf Fitfit",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 360.0,
      "protein_g": 11.0,
      "carb_g": 28.0,
      "fat_g": 24.0,
      "fiber_g": 6.0
    },
    "servings": 1,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://ethiopian-food.org/wp-content/uploads/Yesuf-Fitfit-1-1-150x150.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "ETH013",
    "name": "Telba Fitfit",
    "meal_types": [
      "breakfast"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [],
    "allergens": [
      "wheat"
    ],
    "nutrition_per_serving": {
      "kcal": 248.0,
      "protein_g": 10.0,
      "carb_g": 21.0,
      "fat_g": 19.0,
      "fiber_g": 7.0
    },
    "servings": 5,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://ethiopian-food.org/wp-content/uploads/2024/02/YeTelba-Fitfit-Ethiopian-Flaxseed-Fitfit-Recipe-150x150.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "ETH014",
    "name": "Tikil Gomen",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 140.0,
      "protein_g": 2.0,
      "carb_g": 14.0,
      "fat_g": 11.0,
      "fiber_g": 3.0,
      "sugar_g": 0.0
    },
    "servings": 2,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://ethiopian-food.org/wp-content/uploads/Tikil-Gomen-1-1-1-150x150.jpg",
    "cuisine": "ethiopian"
  },
  {
    "id": "ETH015",
    "name": "Timatim Salad",
    "meal_types": [
      "side"
    ],
    "diet_types": [
      "VEGAN_ETHIOPIAN"
    ],
    "goal_fit": [],
    "allergens": [],
    "nutrition_per_serving": {
      "kcal": 210.0,
      "protein_g": 2.0,
      "carb_g": 18.0,
      "fat_g": 14.0,
      "fiber_g": 3.0,
      "sugar_g": 0.0
    },
    "servings": 1,
    "prep_time_min": 0,
    "cook_time_min": 0,
    "image_url": "https://ethiopian-food.org/wp-content/uploads/Timatim-Salad-1-1-150x150.jpg",
    "cuisine": "ethiopian"
  }
];
