/**
 * Commerce domain types — marketplace + meal-prep ordering. No engine
 * formulas; these are pure data shapes.
 *
 * A-22 (audit 2026-08): extracted from `src/engine/schemas.ts` to keep that
 * module focused on engine-domain types only. `src/engine/schemas.ts`
 * re-exports these types for backward compatibility, and `src/types/index.ts`
 * is the convenience barrel for callers that want a single import surface.
 */

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
