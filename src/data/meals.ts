/**
 * Meal product catalog — the user-facing SKU list for the paid meal delivery
 * service. These are PRODUCTS (with prices, images, and macro labels), NOT
 * recipes. The internal recipe database (cuisine, prep time, ingredients) is
 * backend IP and never surfaces in the UI.
 *
 * Catalog (12 SKUs, organized by category for easier filtering):
 *   - high-protein (3): meal-1, meal-7, meal-8
 *   - balanced      (2): meal-2, meal-12
 *   - vegan         (3): meal-3, meal-9, meal-10
 *   - low-carb      (2): meal-4, meal-6
 *   - keto          (2): meal-5, meal-11
 *
 * The `MealProduct` interface lives in `src/engine/schemas.ts` and is the
 * single source of truth for the shape (id, name, description, price,
 * calories, protein, carbs, fat, image, category).
 */
import type { MealProduct } from "../engine";

// ---------------------------------------------------------------------------
// High-protein (3 SKUs)
// ---------------------------------------------------------------------------
const HIGH_PROTEIN: MealProduct[] = [
  {
    id: "meal-1",
    name: "Flame-Grilled Angus Steak & Asparagus",
    description:
      "Premium sliced grass-fed steak paired with garlic-roasted asparagus spears and clean sweet potato mash.",
    price: 14.99,
    calories: 520,
    protein: 45,
    carbs: 32,
    fat: 16,
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
    category: "high-protein",
  },
  {
    id: "meal-7",
    name: "Lemon Pepper Chicken Power Bowl",
    description:
      "Double chicken breast over jasmine rice with roasted bell peppers, black beans, and a zesty lemon-tahini drizzle.",
    price: 13.49,
    calories: 560,
    protein: 50,
    carbs: 48,
    fat: 12,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
    category: "high-protein",
  },
  {
    id: "meal-8",
    name: "Wild Cod & Quinoa Protein Plate",
    description:
      "Flaky baked Atlantic cod on a bed of herb quinoa with steamed green beans and a squeeze of fresh lime.",
    price: 15.99,
    calories: 480,
    protein: 44,
    carbs: 38,
    fat: 10,
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=80",
    category: "high-protein",
  },
];

// ---------------------------------------------------------------------------
// Balanced (2 SKUs)
// ---------------------------------------------------------------------------
const BALANCED: MealProduct[] = [
  {
    id: "meal-2",
    name: "Teriyaki Glazed Atlantic Salmon Bowl",
    description:
      "Pan-seared Atlantic salmon fillet with organic brown rice, steamed broccoli, and low-sodium teriyaki glaze.",
    price: 16.49,
    calories: 580,
    protein: 38,
    carbs: 45,
    fat: 18,
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=80",
    category: "balanced",
  },
  {
    id: "meal-12",
    name: "Mediterranean Grain & Grilled Veggie Bowl",
    description:
      "Warm farro tossed with grilled zucchini, eggplant, cherry tomatoes, kalamata olives, and a lemon-herb vinaigrette.",
    price: 11.99,
    calories: 470,
    protein: 18,
    carbs: 62,
    fat: 16,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80",
    category: "balanced",
  },
];

// ---------------------------------------------------------------------------
// Vegan (3 SKUs)
// ---------------------------------------------------------------------------
const VEGAN: MealProduct[] = [
  {
    id: "meal-3",
    name: "Sesame Baked Tofu Buddha Bowl",
    description:
      "Crispy sesame tofu, edamame, shredded red cabbage, quinoa, and a savory tahini ginger dressing.",
    price: 11.99,
    calories: 440,
    protein: 22,
    carbs: 55,
    fat: 12,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80",
    category: "vegan",
  },
  {
    id: "meal-9",
    name: "Smoky Black Bean & Sweet Potato Stew",
    description:
      "Slow-cooked Cuban-style black beans with roasted sweet potato cubes, cilantro, and a kick of chipotle.",
    price: 11.49,
    calories: 420,
    protein: 19,
    carbs: 68,
    fat: 8,
    image:
      "https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=500&auto=format&fit=crop&q=80",
    category: "vegan",
  },
  {
    id: "meal-10",
    name: "Coconut Chickpea Curry with Basmati",
    description:
      "Creamy coconut milk simmered with chickpeas, spinach, and warm Indian spices, served over fluffy basmati rice.",
    price: 12.99,
    calories: 510,
    protein: 21,
    carbs: 70,
    fat: 15,
    image:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500&auto=format&fit=crop&q=80",
    category: "vegan",
  },
];

// ---------------------------------------------------------------------------
// Low-carb (2 SKUs)
// ---------------------------------------------------------------------------
const LOW_CARB: MealProduct[] = [
  {
    id: "meal-4",
    name: "Zesty Herb Chicken Breast & Cauliflower Rice",
    description:
      "Lemon-herb marinated chicken breast served over fluffy cilantro-lime cauliflower rice and grilled zucchini.",
    price: 12.99,
    calories: 360,
    protein: 42,
    carbs: 12,
    fat: 8,
    image:
      "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&auto=format&fit=crop&q=80",
    category: "low-carb",
  },
  {
    id: "meal-6",
    name: "Tuscan Turkey Meatballs & Zoodles",
    description:
      "Savory slow-baked lean turkey meatballs in a rich marinara sauce, served over fresh zucchini noodles.",
    price: 12.49,
    calories: 390,
    protein: 34,
    carbs: 18,
    fat: 14,
    image:
      "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500&auto=format&fit=crop&q=80",
    category: "low-carb",
  },
];

// ---------------------------------------------------------------------------
// Keto (2 SKUs)
// ---------------------------------------------------------------------------
const KETO: MealProduct[] = [
  {
    id: "meal-5",
    name: "Keto Chipotle Beef Chili",
    description:
      "Slow-simmered minced lean beef with custom chipotle spices, topped with cheddar cheese and avocado chunks. Zero beans.",
    price: 13.99,
    calories: 610,
    protein: 48,
    carbs: 8,
    fat: 38,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
    category: "keto",
  },
  {
    id: "meal-11",
    name: "Pesto Salmon with Avocado & Greens",
    description:
      "Baked salmon fillet crusted with basil pesto, served over a bed of arugula, avocado wedges, and toasted pine nuts.",
    price: 16.99,
    calories: 590,
    protein: 40,
    carbs: 9,
    fat: 44,
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=80",
    category: "keto",
  },
];

export const MEAL_PRODUCTS: MealProduct[] = [
  ...HIGH_PROTEIN,
  ...BALANCED,
  ...VEGAN,
  ...LOW_CARB,
  ...KETO,
];
