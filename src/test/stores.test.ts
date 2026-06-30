import { describe, it, expect, beforeEach } from "vitest";
import { useUserStore } from "../store/useUserStore";
import { useLogsStore } from "../store/useLogsStore";
import { useCommerceStore } from "../store/useCommerceStore";
import type { Assessment, PersonalPlan, CartItem, Order } from "../types";

// Sample fixtures
const SAMPLE_ASSESSMENT: Assessment = {
  name: "Test",
  age: 30,
  gender: "male",
  weight: 80,
  height: 180,
  goal: "muscle-gain",
  activityLevel: "moderate",
  workoutPreference: "gym",
  frequency: 3,
  dietType: "anything",
  allergies: "",
};

const SAMPLE_PLAN: PersonalPlan = {
  workoutPlan: {
    title: "Test Plan",
    description: "desc",
    difficulty: "Intermediate",
    weeklySchedule: [],
    tips: [],
  },
  nutritionPlan: {
    dietType: "anything",
    dailyCalories: 2500,
    macros: { protein: 150, carbs: 300, fat: 80 },
    guidelines: [],
    mealSuggestions: [],
  },
};

const SAMPLE_CART_ITEM: CartItem = {
  id: "prod-1",
  name: "Whey Protein",
  price: 49.99,
  image: "https://example.com/img.jpg",
  quantity: 1,
  type: "marketplace",
};

const SAMPLE_ORDER: Order = {
  id: "ord-1",
  items: [SAMPLE_CART_ITEM],
  total: 54.98,
  date: "Jan 1, 2026",
  status: "pending",
  deliveryAddress: "123 Test St",
  type: "marketplace",
};

beforeEach(() => {
  // Reset all stores between tests
  useUserStore.getState().reset();
  useLogsStore.getState().reset();
  useCommerceStore.getState().reset();
  localStorage.clear();
});

describe("useUserStore", () => {
  it("starts with null assessment and plan", () => {
    const s = useUserStore.getState();
    expect(s.assessment).toBeNull();
    expect(s.personalPlan).toBeNull();
  });

  it("setBoth stores assessment + plan atomically", () => {
    useUserStore.getState().setBoth(SAMPLE_ASSESSMENT, SAMPLE_PLAN);
    const s = useUserStore.getState();
    expect(s.assessment).toEqual(SAMPLE_ASSESSMENT);
    expect(s.personalPlan).toEqual(SAMPLE_PLAN);
  });

  it("updateWeight mutates only the weight field on the assessment", () => {
    useUserStore.getState().setBoth(SAMPLE_ASSESSMENT, SAMPLE_PLAN);
    useUserStore.getState().updateWeight(82.5);
    expect(useUserStore.getState().assessment?.weight).toBe(82.5);
    // Other fields preserved
    expect(useUserStore.getState().assessment?.name).toBe("Test");
  });

  it("updateWorkoutPlan replaces the workout plan only", () => {
    useUserStore.getState().setBoth(SAMPLE_ASSESSMENT, SAMPLE_PLAN);
    const newPlan = { ...SAMPLE_PLAN.workoutPlan, title: "Updated" };
    useUserStore.getState().updateWorkoutPlan(newPlan);
    expect(useUserStore.getState().personalPlan?.workoutPlan.title).toBe("Updated");
    // Nutrition plan untouched
    expect(useUserStore.getState().personalPlan?.nutritionPlan.dailyCalories).toBe(2500);
  });

  it("reset clears both assessment and plan", () => {
    useUserStore.getState().setBoth(SAMPLE_ASSESSMENT, SAMPLE_PLAN);
    useUserStore.getState().reset();
    expect(useUserStore.getState().assessment).toBeNull();
    expect(useUserStore.getState().personalPlan).toBeNull();
  });

  it("persists to localStorage under the 'fitlife:user' key", () => {
    useUserStore.getState().setBoth(SAMPLE_ASSESSMENT, SAMPLE_PLAN);
    // zustand persist is synchronous for localStorage
    const raw = localStorage.getItem("fitlife:user");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.assessment.name).toBe("Test");
  });
});

describe("useLogsStore", () => {
  it("addWeightLog dedupes by today's date (replaces existing same-day log)", () => {
    useLogsStore.getState().addWeightLog(80);
    useLogsStore.getState().addWeightLog(81.5);
    const logs = useLogsStore.getState().weightLogs;
    expect(logs).toHaveLength(1);
    expect(logs[0].value).toBe(81.5);
  });

  it("addWaterLog appends (multiple per day allowed)", () => {
    useLogsStore.getState().addWaterLog(250);
    useLogsStore.getState().addWaterLog(500);
    expect(useLogsStore.getState().waterLogs).toHaveLength(2);
  });

  it("clearTodayWaterLogs removes only today's entries", () => {
    // Inject a fake old entry directly via setState
    useLogsStore.setState({
      waterLogs: [
        { date: "2020-01-01", amountMl: 999 },
        { date: new Date().toISOString().split("T")[0], amountMl: 250 },
      ],
    });
    useLogsStore.getState().clearTodayWaterLogs();
    const logs = useLogsStore.getState().waterLogs;
    expect(logs).toHaveLength(1);
    expect(logs[0].amountMl).toBe(999);
  });

  it("addWorkoutLog prepends new logs (most recent first)", () => {
    useLogsStore.getState().addWorkoutLog({
      date: "2026-01-01",
      workoutTitle: "Old",
      durationMinutes: 30,
      caloriesBurned: 200,
    });
    useLogsStore.getState().addWorkoutLog({
      date: "2026-01-02",
      workoutTitle: "New",
      durationMinutes: 45,
      caloriesBurned: 400,
    });
    const logs = useLogsStore.getState().workoutLogs;
    expect(logs).toHaveLength(2);
    expect(logs[0].workoutTitle).toBe("New");
  });
});

describe("useCommerceStore", () => {
  it("addToCart adds a new item", () => {
    useCommerceStore.getState().addToCart(SAMPLE_CART_ITEM);
    expect(useCommerceStore.getState().cart).toHaveLength(1);
  });

  it("addToCart increments quantity when same id+type already in cart", () => {
    useCommerceStore.getState().addToCart(SAMPLE_CART_ITEM);
    useCommerceStore.getState().addToCart(SAMPLE_CART_ITEM);
    const cart = useCommerceStore.getState().cart;
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it("addToCart treats different types as separate line items", () => {
    useCommerceStore.getState().addToCart(SAMPLE_CART_ITEM);
    useCommerceStore.getState().addToCart({ ...SAMPLE_CART_ITEM, type: "meal" });
    expect(useCommerceStore.getState().cart).toHaveLength(2);
  });

  it("updateCartQty removes the item when qty drops below 1", () => {
    useCommerceStore.getState().addToCart(SAMPLE_CART_ITEM);
    useCommerceStore.getState().updateCartQty("prod-1", 0);
    expect(useCommerceStore.getState().cart).toHaveLength(0);
  });

  it("clearCartByType removes only items of that type", () => {
    useCommerceStore.getState().addToCart(SAMPLE_CART_ITEM);
    useCommerceStore.getState().addToCart({ ...SAMPLE_CART_ITEM, type: "meal" });
    useCommerceStore.getState().clearCartByType("marketplace");
    const cart = useCommerceStore.getState().cart;
    expect(cart).toHaveLength(1);
    expect(cart[0].type).toBe("meal");
  });

  it("addOrder prepends to history AND clears cart items of the same type", () => {
    useCommerceStore.getState().addToCart(SAMPLE_CART_ITEM);
    useCommerceStore.getState().addToCart({ ...SAMPLE_CART_ITEM, id: "meal-1", type: "meal" });
    useCommerceStore.getState().addOrder(SAMPLE_ORDER);
    const s = useCommerceStore.getState();
    expect(s.orderHistory).toHaveLength(1);
    expect(s.orderHistory[0].id).toBe("ord-1");
    // marketplace item cleared, meal item retained
    expect(s.cart).toHaveLength(1);
    expect(s.cart[0].type).toBe("meal");
  });
});
