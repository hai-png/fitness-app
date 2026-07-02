import { describe, it, expect, beforeEach } from "vitest";
import { useUserStore } from "../store/useUserStore";
import { useLogsStore } from "../store/useLogsStore";
import { useCommerceStore } from "../store/useCommerceStore";
import type { OnboardingInput, WorkoutPlan, CartItem, Order } from "../engine";

const SAMPLE_INPUT: OnboardingInput = {
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

const SAMPLE_WORKOUT_PLAN: WorkoutPlan = {
  title: "Test Plan",
  description: "desc",
  difficulty: "Intermediate",
  weeklySchedule: [],
  tips: [],
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
  useUserStore.getState().reset();
  useLogsStore.getState().reset();
  useCommerceStore.getState().reset();
  localStorage.clear();
});

describe("useUserStore", () => {
  it("starts with null onboarding input and workout plan", () => {
    const s = useUserStore.getState();
    expect(s.onboardingInput).toBeNull();
    expect(s.workoutPlan).toBeNull();
  });

  it("setBoth stores onboarding input + workout plan atomically", () => {
    useUserStore.getState().setBoth(SAMPLE_INPUT, SAMPLE_WORKOUT_PLAN);
    const s = useUserStore.getState();
    expect(s.onboardingInput).toEqual(SAMPLE_INPUT);
    expect(s.workoutPlan).toEqual(SAMPLE_WORKOUT_PLAN);
  });

  it("updateWeight mutates only the weight field on the onboarding input", () => {
    useUserStore.getState().setBoth(SAMPLE_INPUT, SAMPLE_WORKOUT_PLAN);
    useUserStore.getState().updateWeight(82.5);
    expect(useUserStore.getState().onboardingInput?.weight).toBe(82.5);
    expect(useUserStore.getState().onboardingInput?.name).toBe("Test");
  });

  it("updateWorkoutPlan replaces the workout plan only", () => {
    useUserStore.getState().setBoth(SAMPLE_INPUT, SAMPLE_WORKOUT_PLAN);
    const newPlan = { ...SAMPLE_WORKOUT_PLAN, title: "Updated" };
    useUserStore.getState().updateWorkoutPlan(newPlan);
    expect(useUserStore.getState().workoutPlan?.title).toBe("Updated");
  });

  it("reset clears both onboarding input and workout plan", () => {
    useUserStore.getState().setBoth(SAMPLE_INPUT, SAMPLE_WORKOUT_PLAN);
    useUserStore.getState().reset();
    expect(useUserStore.getState().onboardingInput).toBeNull();
    expect(useUserStore.getState().workoutPlan).toBeNull();
  });

  it("persists to localStorage under the 'fitlife:user' key", () => {
    useUserStore.getState().setBoth(SAMPLE_INPUT, SAMPLE_WORKOUT_PLAN);
    const raw = localStorage.getItem("fitlife:user");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.onboardingInput.name).toBe("Test");
  });
});

describe("useLogsStore", () => {
  it("addWeightLog dedupes by today's date (replaces existing same-day log)", () => {
    useLogsStore.getState().addWeightLog(80);
    useLogsStore.getState().addWeightLog(81.5);
    const logs = useLogsStore.getState().weightLogs;
    expect(logs).toHaveLength(1);
    // Q-07: safe — controlled test data, logs has exactly 1 element.
    expect(logs[0]!.weight_kg).toBe(81.5);
  });

  it("addWaterLog appends (multiple per day allowed)", () => {
    useLogsStore.getState().addWaterLog(250);
    useLogsStore.getState().addWaterLog(500);
    expect(useLogsStore.getState().waterLogs).toHaveLength(2);
  });

  it("clearTodayWaterLogs removes only today's entries", () => {
    useLogsStore.setState({
      waterLogs: [
        { date: "2020-01-01", amountMl: 999 },
        // Q-07: safe — toISOString().split("T") always yields at least one element.
        { date: new Date().toISOString().split("T")[0]!, amountMl: 250 },
      ],
    });
    useLogsStore.getState().clearTodayWaterLogs();
    const logs = useLogsStore.getState().waterLogs;
    expect(logs).toHaveLength(1);
    // Q-07: safe — controlled test data, logs has exactly 1 element after clear.
    expect(logs[0]!.amountMl).toBe(999);
  });

  it("addWorkoutLog appends new logs (chronological order — A-07 fix)", () => {
    // A-07: all stores now use chronological order (oldest first) for
    // consistency. Previously workoutLogs prepended (newest first) which
    // was inconsistent with weightLogs and waterLogs.
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
    // Q-07: safe — controlled test data, logs has exactly 2 elements.
    expect(logs[0]!.workoutTitle).toBe("Old");
    expect(logs[1]!.workoutTitle).toBe("New");
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
    // Q-07: safe — controlled test data, cart has exactly 1 element.
    expect(cart[0]!.quantity).toBe(2);
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
    // Q-07: safe — controlled test data, cart has exactly 1 element.
    expect(cart[0]!.type).toBe("meal");
  });

  it("addOrder prepends to history AND clears cart items of the same type", () => {
    useCommerceStore.getState().addToCart(SAMPLE_CART_ITEM);
    useCommerceStore.getState().addToCart({ ...SAMPLE_CART_ITEM, id: "meal-1", type: "meal" });
    useCommerceStore.getState().addOrder(SAMPLE_ORDER);
    const s = useCommerceStore.getState();
    expect(s.orderHistory).toHaveLength(1);
    // Q-07: safe — controlled test data.
    expect(s.orderHistory[0]!.id).toBe("ord-1");
    expect(s.cart).toHaveLength(1);
    expect(s.cart[0]!.type).toBe("meal");
  });
});
