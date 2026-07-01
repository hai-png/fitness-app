import { describe, it, expect, beforeEach, vi } from "vitest";
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
  it("starts with null onboarding input and workout plan", async () => {
    const s = useUserStore.getState();
    expect(s.onboardingInput).toBeNull();
    expect(s.workoutPlan).toBeNull();
  });

  it("setBoth stores onboarding input + workout plan atomically", async () => {
    useUserStore.getState().setBoth(SAMPLE_INPUT, SAMPLE_WORKOUT_PLAN);
    const s = useUserStore.getState();
    expect(s.onboardingInput).toEqual(SAMPLE_INPUT);
    expect(s.workoutPlan).toEqual(SAMPLE_WORKOUT_PLAN);
  });

  it("updateWeight mutates only the weight field on the onboarding input", async () => {
    useUserStore.getState().setBoth(SAMPLE_INPUT, SAMPLE_WORKOUT_PLAN);
    useUserStore.getState().updateWeight(82.5);
    expect(useUserStore.getState().onboardingInput?.weight).toBe(82.5);
    expect(useUserStore.getState().onboardingInput?.name).toBe("Test");
  });

  it("updateWorkoutPlan replaces the workout plan only", async () => {
    useUserStore.getState().setBoth(SAMPLE_INPUT, SAMPLE_WORKOUT_PLAN);
    const newPlan = { ...SAMPLE_WORKOUT_PLAN, title: "Updated" };
    useUserStore.getState().updateWorkoutPlan(newPlan);
    expect(useUserStore.getState().workoutPlan?.title).toBe("Updated");
  });

  it("reset clears both onboarding input and workout plan", async () => {
    useUserStore.getState().setBoth(SAMPLE_INPUT, SAMPLE_WORKOUT_PLAN);
    useUserStore.getState().reset();
    expect(useUserStore.getState().onboardingInput).toBeNull();
    expect(useUserStore.getState().workoutPlan).toBeNull();
  });

  it("persists to localStorage under the 'fitlife:user' key", async () => {
    useUserStore.getState().setBoth(SAMPLE_INPUT, SAMPLE_WORKOUT_PLAN);
    // S-03: the encrypted storage is async — wait a tick for setItem to complete.
    await new Promise((r) => setTimeout(r, 50));
    const raw = localStorage.getItem("fitlife:user");
    expect(raw).not.toBeNull();
    // S-03: the value may be encrypted (starts with "enc:") or plaintext
    // (if Web Crypto / IndexedDB is unavailable in the test env). Check both.
    if (raw!.startsWith("enc:")) {
      // Encrypted — can't parse the JSON, but the key exists and has content.
      expect(raw!.length).toBeGreaterThan(10);
    } else {
      const parsed = JSON.parse(raw!);
      expect(parsed.state.onboardingInput.name).toBe("Test");
    }
  });
});

describe("useLogsStore", () => {
  it("addWeightLog dedupes by today's date (replaces existing same-day log)", async () => {
    useLogsStore.getState().addWeightLog(80);
    useLogsStore.getState().addWeightLog(81.5);
    const logs = useLogsStore.getState().weightLogs;
    expect(logs).toHaveLength(1);
    expect(logs[0].weight_kg).toBe(81.5);
  });

  it("addWaterLog appends (multiple per day allowed)", async () => {
    useLogsStore.getState().addWaterLog(250);
    useLogsStore.getState().addWaterLog(500);
    expect(useLogsStore.getState().waterLogs).toHaveLength(2);
  });

  it("clearTodayWaterLogs removes only today's entries", async () => {
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

  it("addWorkoutLog prepends new logs (most recent first)", async () => {
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
  it("addToCart adds a new item", async () => {
    useCommerceStore.getState().addToCart(SAMPLE_CART_ITEM);
    expect(useCommerceStore.getState().cart).toHaveLength(1);
  });

  it("addToCart increments quantity when same id+type already in cart", async () => {
    useCommerceStore.getState().addToCart(SAMPLE_CART_ITEM);
    useCommerceStore.getState().addToCart(SAMPLE_CART_ITEM);
    const cart = useCommerceStore.getState().cart;
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it("addToCart treats different types as separate line items", async () => {
    useCommerceStore.getState().addToCart(SAMPLE_CART_ITEM);
    useCommerceStore.getState().addToCart({ ...SAMPLE_CART_ITEM, type: "meal" });
    expect(useCommerceStore.getState().cart).toHaveLength(2);
  });

  it("updateCartQty removes the item when qty drops below 1", async () => {
    useCommerceStore.getState().addToCart(SAMPLE_CART_ITEM);
    useCommerceStore.getState().updateCartQty("prod-1", 0);
    expect(useCommerceStore.getState().cart).toHaveLength(0);
  });

  it("clearCartByType removes only items of that type", async () => {
    useCommerceStore.getState().addToCart(SAMPLE_CART_ITEM);
    useCommerceStore.getState().addToCart({ ...SAMPLE_CART_ITEM, type: "meal" });
    useCommerceStore.getState().clearCartByType("marketplace");
    const cart = useCommerceStore.getState().cart;
    expect(cart).toHaveLength(1);
    expect(cart[0].type).toBe("meal");
  });

  it("addOrder prepends to history AND clears cart items of the same type", async () => {
    useCommerceStore.getState().addToCart(SAMPLE_CART_ITEM);
    useCommerceStore.getState().addToCart({ ...SAMPLE_CART_ITEM, id: "meal-1", type: "meal" });
    useCommerceStore.getState().addOrder(SAMPLE_ORDER);
    const s = useCommerceStore.getState();
    expect(s.orderHistory).toHaveLength(1);
    expect(s.orderHistory[0].id).toBe("ord-1");
    expect(s.cart).toHaveLength(1);
    expect(s.cart[0].type).toBe("meal");
  });
});

// ===========================================================================
// F-H8: Store migration tests.
// A-15/F-C1 added migrate functions to every persisted store so a version
// bump no longer silently wipes user data. These tests verify the migration
// from each prior version's persisted shape to the current shape.
// ===========================================================================

describe("useUserStore migration (F-H8)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("migrates v2 persisted state (assessment/personalPlan) → v3 (onboardingInput/workoutPlan)", async () => {
    // Simulate a v2-era persisted payload under the legacy field names.
    const v2Payload = {
      state: {
        assessment: { ...SAMPLE_INPUT },
        personalPlan: { ...SAMPLE_WORKOUT_PLAN },
        engineProfile: {},
        cachedAssessmentResult: null,
        cachedNutritionPlan: null,
      },
      version: 2,
    };
    localStorage.setItem("fitlife:user", JSON.stringify(v2Payload));

    // Re-import the store fresh so the persist middleware runs the migration.
    // vitest modules cache means we need to reset + reimport.
    vi.resetModules();
    const { useUserStore: freshStore } = await import("../store/useUserStore");
    const s = freshStore.getState();

    // The v2 fields should have been renamed to v3 fields.
    expect(s.onboardingInput).not.toBeNull();
    expect(s.onboardingInput?.name).toBe("Test");
    expect(s.workoutPlan).not.toBeNull();
    expect(s.workoutPlan?.title).toBe("Test Plan");
    // Legacy field names should not leak through.
    expect((s as unknown as Record<string, unknown>).assessment).toBeUndefined();
    expect((s as unknown as Record<string, unknown>).personalPlan).toBeUndefined();
  });

  it("preserves current-version (v3) state without modification", async () => {
    const v3Payload = {
      state: {
        onboardingInput: { ...SAMPLE_INPUT },
        workoutPlan: { ...SAMPLE_WORKOUT_PLAN },
        engineProfile: {},
        cachedAssessmentResult: null,
        cachedNutritionPlan: null,
      },
      version: 3,
    };
    localStorage.setItem("fitlife:user", JSON.stringify(v3Payload));
    vi.resetModules();
    const { useUserStore: freshStore } = await import("../store/useUserStore");
    const s = freshStore.getState();
    expect(s.onboardingInput?.name).toBe("Test");
    expect(s.workoutPlan?.title).toBe("Test Plan");
  });
});

describe("useLogsStore migration (F-H8)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("preserves log history across a version-1 reload (identity migrate)", async () => {
    const v1Payload = {
      state: {
        weightLogs: [{ date: "2026-06-01", weight_kg: 80 }],
        waterLogs: [],
        workoutLogs: [],
        exerciseLogs: [],
      },
      version: 1,
    };
    localStorage.setItem("fitlife:logs", JSON.stringify(v1Payload));
    vi.resetModules();
    const { useLogsStore: freshStore } = await import("../store/useLogsStore");
    const s = freshStore.getState();
    expect(s.weightLogs).toHaveLength(1);
    expect(s.weightLogs[0].weight_kg).toBe(80);
  });
});
