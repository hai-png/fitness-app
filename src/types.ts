export interface Assessment {
  name: string;
  age: number;
  gender: string;
  weight: number; // in kg
  height: number; // in cm
  goal: "weight-loss" | "muscle-gain" | "strength" | "endurance" | "general";
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  workoutPreference: "home" | "gym" | "outdoor" | "hybrid";
  frequency: number; // days per week: 2, 3, 4, 5
  dietType: "anything" | "vegetarian" | "vegan" | "keto" | "low-carb" | "gluten-free" | "mediterranean";
  allergies: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  instruction: string;
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
}

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealSuggestion {
  mealType: string;
  name: string;
  description: string;
  calories: number;
  proteinGrams: number;
}

export interface NutritionPlan {
  dietType: string;
  dailyCalories: number;
  macros: Macros;
  guidelines: string[];
  mealSuggestions: MealSuggestion[];
}

export interface PersonalPlan {
  workoutPlan: WorkoutPlan;
  nutritionPlan: NutritionPlan;
}

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
}

export interface WeightLog {
  date: string; // YYYY-MM-DD
  value: number; // kg
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  amountMl: number; // ml
}

export interface WorkoutLog {
  date: string;
  workoutTitle: string;
  durationMinutes: number;
  caloriesBurned: number;
}
