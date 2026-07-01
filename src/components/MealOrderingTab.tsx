import React, { useState, useMemo } from "react";
import { MEAL_PRODUCTS } from "../data/meals";
import { OnboardingInput, MealProduct, CartItem, Order, NutritionPlan } from "../engine";
import { toast } from "./Toast";
import { useSafeTimeout } from "../hooks/useSafeTimeout";
import { Modal } from "./Modal";
import {
  ShoppingBag,
  AlertTriangle,
  Sparkles,
  MapPin,
  CheckCircle,
  Calendar,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
} from "lucide-react";

interface MealOrderingTabProps {
  assessment: OnboardingInput;
  nutritionPlan: NutritionPlan | null;
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onRemoveFromCart: (id: string) => void;
  onUpdateCartQty: (id: string, qty: number) => void;
  onCheckout: (order: Order) => void;
}

interface DayPlan {
  dayNumber: number;
  meals: {
    slot: "Breakfast" | "Lunch" | "Dinner";
    meal: MealProduct;
  }[];
}

export default function MealOrderingTab({
  assessment,
  nutritionPlan,
  onCheckout,
}: MealOrderingTabProps) {
  // F-H4: useSafeTimeout guards all setTimeout callbacks against firing
  // after unmount (prevents state updates on unmounted components and
  // spurious order pushes if the user navigates away mid-checkout).
  const safeTimeout = useSafeTimeout();

  // Configurable Delivery Variables
  const [numDays, setNumDays] = useState<number>(5);
  const [mealsPerDay, setMealsPerDay] = useState<number>(3); // 2 or 3
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  // Custom Swap Modal state
  const [swapTarget, setSwapTarget] = useState<{ dayIndex: number; mealIndex: number } | null>(
    null,
  );

  // Checkout states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [isProcessingOrder, setIsProcessingOrder] = useState<boolean>(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState<boolean>(false);

  const targetCalories =
    nutritionPlan?.target_calories_kcal || Math.round(assessment.weight * 26);

  // Filter products by dietary restriction and allergy. Inlined into the
  // `eligibleMeals` useMemo below so the dep array is exhaustive without
  // needing a separate `getEligibleMeals` function (which would otherwise
  // have to be wrapped in useCallback to satisfy exhaustive-deps).
  const eligibleMeals = useMemo((): MealProduct[] => {
    let filtered = MEAL_PRODUCTS.filter((meal) => {
      // Diet preference alignment
      const diet = assessment.dietType;
      if (diet === "vegan") {
        return meal.category === "vegan";
      } else if (diet === "vegetarian") {
        return meal.category === "vegetarian" || meal.category === "vegan";
      } else if (diet === "keto") {
        return meal.category === "keto" || meal.category === "low-carb";
      } else if (diet === "low-carb") {
        return meal.category === "low-carb" || meal.category === "keto";
      }
      return true; // anything, mediterranean, gluten-free
    });

    // Allergy strict filters
    if (assessment.allergies && filtered.length > 0) {
      const allergyList = assessment.allergies
        .toLowerCase()
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      const safe = filtered.filter((meal) => {
        return !allergyList.some(
          (allergen) =>
            meal.name.toLowerCase().includes(allergen) ||
            meal.description.toLowerCase().includes(allergen),
        );
      });
      // Avoid failing if ALL meals are filtered out due to overlapping labels
      if (safe.length > 0) {
        filtered = safe;
      }
    }

    // Fallback if list ends up completely empty
    if (filtered.length === 0) {
      return MEAL_PRODUCTS;
    }
    return filtered;
    // F-H3 fix: include assessment.allergies so eligibleMeals recomputes when
    // allergies change. Previously this was an un-memoized call that ran every
    // render, and the plan-generation effect didn't depend on it — so changing
    // allergies mid-flow would keep suggesting meals containing the new allergen.
  }, [assessment.dietType, assessment.allergies]);

  // Base plan derived from inputs (replaces the old generatePlanSuggestions
  // useCallback + useEffect pair). Pure function of numDays/mealsPerDay/
  // eligibleMeals, so useMemo is the React-recommended shape.
  const basePlan: DayPlan[] = useMemo(() => {
    const list: DayPlan[] = [];
    const mealSlots: ("Breakfast" | "Lunch" | "Dinner")[] =
      mealsPerDay === 3 ? ["Breakfast", "Lunch", "Dinner"] : ["Lunch", "Dinner"];

    for (let d = 1; d <= numDays; d++) {
      const dayMeals: DayPlan["meals"] = [];
      mealSlots.forEach((slot, slotIdx) => {
        // Pick cyclically from eligible meals to ensure balanced variety over the week
        const mealIndex = (d * 5 + slotIdx * 3) % eligibleMeals.length;
        dayMeals.push({
          slot,
          meal: eligibleMeals[mealIndex],
        });
      });
      list.push({
        dayNumber: d,
        meals: dayMeals,
      });
    }
    return list;
  }, [numDays, mealsPerDay, eligibleMeals]);

  // Manual per-slot swaps keyed by `${dayIndex}-${mealIndex}`. These persist
  // across renders but are RESET when basePlan changes (preserving the
  // original "regenerate-from-scratch on input change" behavior).
  const [manualSwaps, setManualSwaps] = useState<Record<string, MealProduct>>({});
  const [prevBasePlan, setPrevBasePlan] = useState(basePlan);
  if (basePlan !== prevBasePlan) {
    // React-recommended "adjust state during render" pattern (replaces the
    // previous useEffect + setState, which triggered the
    // react-hooks/set-state-in-effect warning). React re-renders synchronously
    // with the new state — no cascading render from an effect.
    setPrevBasePlan(basePlan);
    setManualSwaps({});
  }

  const customPlan: DayPlan[] = useMemo(() => {
    if (Object.keys(manualSwaps).length === 0) return basePlan;
    return basePlan.map((day, dayIndex) => ({
      ...day,
      meals: day.meals.map((m, mealIndex) => {
        const swap = manualSwaps[`${dayIndex}-${mealIndex}`];
        return swap ? { ...m, meal: swap } : m;
      }),
    }));
  }, [basePlan, manualSwaps]);

  // Handle single meal swap
  const executeMealSwap = (replacementMeal: MealProduct) => {
    if (swapTarget === null) return;
    const { dayIndex, mealIndex } = swapTarget;

    setManualSwaps((prev) => ({
      ...prev,
      [`${dayIndex}-${mealIndex}`]: replacementMeal,
    }));
    setSwapTarget(null);
  };

  // Nutrition plan totals calculations
  const totalMealsCount = customPlan.reduce((sum, d) => sum + d.meals.length, 0);
  const totalPlanCalories = customPlan.reduce(
    (sum, d) => sum + d.meals.reduce((s, m) => s + m.meal.calories, 0),
    0,
  );

  const avgDailyCalories = Math.round(totalPlanCalories / numDays) || 0;

  // Pricing calculations
  const basePricePerMeal = 13.49; // Flat plan optimized price
  const rawSubtotal = totalMealsCount * basePricePerMeal;

  // Plan multi-day loyalty discount percentages
  const getDiscountPct = (days: number) => {
    if (days >= 14) return 0.18; // 18% off
    if (days >= 7) return 0.12; // 12% off
    if (days >= 5) return 0.08; // 8% off
    return 0.05; // 5% off
  };

  const discountPct = getDiscountPct(numDays);
  const discountAmount = rawSubtotal * discountPct;
  const deliveryFee = rawSubtotal > 100 ? 0 : 4.99;
  const finalPlanPrice = rawSubtotal - discountAmount + deliveryFee;

  // Trigger custom checkout flow
  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.warning("Address required", "Please enter a delivery address.");
      return;
    }

    setIsProcessingOrder(true);

    safeTimeout(() => {
      setIsProcessingOrder(false);
      setIsOrderSuccess(true);

      const planSummaryItem: CartItem = {
        id: `meal-plan-${numDays}days-${Date.now()}`,
        name: `${numDays}-Day Delivered Meal Plan (${totalMealsCount} preps - ${assessment.dietType.toUpperCase()})`,
        price: finalPlanPrice,
        image:
          customPlan[0]?.meals[0]?.meal?.image ||
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
        quantity: 1,
        type: "meal",
      };

      // Use crypto.randomUUID() for cryptographically safe order IDs.
      // Falls back to timestamp+random for older browsers.
      const orderId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `ord-plan-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

      const newOrder: Order = {
        id: orderId,
        items: [planSummaryItem],
        total: finalPlanPrice,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        status: "processing",
        deliveryAddress: address,
        type: "meal",
      };

      onCheckout(newOrder);

      // Dismiss modals on delay
      safeTimeout(() => {
        setIsOrderSuccess(false);
        setIsCheckoutOpen(false);
        setAddress("");
      }, 3200);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6] text-[#1A1A1A] overflow-y-auto p-4 md:p-6 pb-24">
      {/* Title Header */}
      <div className="mb-5">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E63946] underline underline-offset-4 block mb-2">
          02 — Smart Delivered Meal Plans
        </span>
        <h1 className="text-3xl font-serif font-black italic text-[#1A1A1A] mt-3 tracking-tight leading-none">
          Custom Nutrition Delivered
        </h1>
        <p className="text-[11px] text-[#1A1A1A]/60 mt-1.5 font-serif italic">
          Calibrated system preps vacuum-sealed fresh, delivered to your door.
        </p>
      </div>

      {/* Target Macros Alignment Bar */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 mb-5 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-4 h-4 text-[#E63946]" />
          <h3 className="text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]">
            Target Caloric Match Radar
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-[#F9F8F6] p-2.5 border border-[#1A1A1A]/5 text-center">
            <span className="block text-[8px] uppercase font-bold text-[#1A1A1A]/40">
              Your Daily Target
            </span>
            <span className="text-sm font-bold text-[#1A1A1A] font-mono">
              {targetCalories} kcal
            </span>
          </div>
          <div className="bg-[#F9F8F6] p-2.5 border border-[#1A1A1A]/5 text-center">
            <span className="block text-[8px] uppercase font-bold text-[#1A1A1A]/40">
              Plan Daily Average
            </span>
            <span
              className={`text-sm font-bold font-mono ${Math.abs(avgDailyCalories - targetCalories) < 400 ? "text-[#E63946]" : "text-[#1A1A1A]"}`}
            >
              {avgDailyCalories} kcal
            </span>
          </div>
        </div>

        {/* Progress Alignment Slider */}
        <div className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/5 h-2 rounded-none overflow-hidden relative">
          <div
            className="h-full bg-[#E63946]"
            style={{ width: `${Math.min(100, (avgDailyCalories / targetCalories) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] text-[#1A1A1A]/50 mt-1.5 font-mono">
          <span>0%</span>
          <span>Matched: {Math.round((avgDailyCalories / targetCalories) * 100)}%</span>
          <span>100%</span>
        </div>

        {/* Dietary Pref Badging */}
        <div className="mt-3 pt-2.5 border-t border-[#1A1A1A]/5 flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-bold text-white bg-[#1A1A1A] px-2 py-0.5 uppercase tracking-wide">
            Diet: {assessment.dietType}
          </span>
          {assessment.allergies && (
            <span className="text-[9px] font-bold text-white bg-[#E63946] px-2 py-0.5 uppercase tracking-wide flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> No: {assessment.allergies}
            </span>
          )}
        </div>
      </div>

      {/* Selector Parameters */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 mb-5 shadow-sm space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest mb-2 flex justify-between">
            <span>Duration of Meal Plan</span>
            <span className="text-[#E63946] font-mono lowercase">{numDays} days delivery</span>
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {[3, 5, 7, 10, 14].map((d) => (
              <button
                key={d}
                type="button"
                id={`btn-plan-days-${d}`}
                onClick={() => setNumDays(d)}
                className={`py-2 text-center text-xs font-bold transition-all border ${
                  numDays === d
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A] hover:border-[#1A1A1A]/30"
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest mb-2 flex justify-between">
            <span>Preps Scheduled per Day</span>
            <span className="text-[#E63946] font-mono lowercase">{mealsPerDay} meals</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: 2, label: "2 Meals (Lunch & Dinner)" },
              { val: 3, label: "3 Meals (Breakfast, Lunch, Dinner)" },
            ].map((m) => (
              <button
                key={m.val}
                type="button"
                id={`btn-meals-per-day-${m.val}`}
                onClick={() => setMealsPerDay(m.val)}
                className={`py-2 text-center text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  mealsPerDay === m.val
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A] hover:border-[#1A1A1A]/30"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Day-by-Day Accordion Layout */}
      <div className="space-y-2 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/60 flex items-center justify-between mb-3">
          <span>Daily Menu Timeline</span>
          <button
            type="button"
            onClick={() => setManualSwaps({})}
            className="flex items-center gap-1 text-[9px] hover:text-[#E63946] transition-all font-mono normal-case"
          >
            <RefreshCw className="w-3 h-3" /> Auto-Shuffle
          </button>
        </h3>

        {customPlan.map((dayPlan, dayIdx) => {
          const isExpanded = expandedDay === dayPlan.dayNumber;
          const dayCals = dayPlan.meals.reduce((sum, m) => sum + m.meal.calories, 0);
          const dayPro = dayPlan.meals.reduce((sum, m) => sum + m.meal.protein, 0);

          return (
            <div
              key={dayPlan.dayNumber}
              className="bg-white border border-[#1A1A1A]/10 rounded-none shadow-sm"
            >
              {/* Header section clickable to expand */}
              <button
                type="button"
                id={`btn-expand-day-${dayPlan.dayNumber}`}
                onClick={() => setExpandedDay(isExpanded ? null : dayPlan.dayNumber)}
                className="w-full px-4 py-3 flex items-center justify-between text-left border-b border-[#1A1A1A]/5 hover:bg-[#F9F8F6] transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#E63946]" />
                    Day {dayPlan.dayNumber} Menu
                  </h4>
                  <p className="text-[9px] font-mono text-[#1A1A1A]/50 mt-1">
                    {dayPlan.meals.length} Meals • {dayCals} kcal • {dayPro}g Protein
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#1A1A1A]/60" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#1A1A1A]/60" />
                )}
              </button>

              {/* Day details expanded block */}
              {isExpanded && (
                <div className="p-3.5 space-y-3 bg-[#F9F8F6]/40">
                  {dayPlan.meals.map((slotMeal, mIdx) => (
                    <div
                      key={mIdx}
                      className="bg-white border border-[#1A1A1A]/10 rounded-none p-3 flex gap-3 shadow-sm"
                    >
                      {/* Thumbnail Image */}
                      <img
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        src={slotMeal.meal.image}
                        alt={slotMeal.meal.name}
                        className="w-14 h-14 object-cover flex-shrink-0"
                      />

                      {/* Details of individual meal */}
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[8px] font-bold uppercase tracking-widest text-[#E63946] font-mono">
                            {slotMeal.slot}
                          </span>
                          <span className="text-[10px] font-bold text-[#1A1A1A]/60 font-mono">
                            ${slotMeal.meal.price}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold uppercase tracking-tight text-[#1A1A1A] truncate">
                          {slotMeal.meal.name}
                        </h5>
                        <p className="text-[10px] text-[#1A1A1A]/50 font-serif italic line-clamp-1">
                          {slotMeal.meal.description}
                        </p>
                        <div className="flex gap-2.5 mt-1 text-[9px] font-mono text-[#1A1A1A]/60">
                          <span>{slotMeal.meal.calories} kcal</span>
                          <span>{slotMeal.meal.protein}g Pro</span>
                          <span>{slotMeal.meal.carbs}g Carb</span>
                        </div>
                      </div>

                      {/* Customize / Swap button */}
                      <div className="flex flex-col justify-center flex-shrink-0">
                        <button
                          type="button"
                          id={`btn-swap-day-${dayPlan.dayNumber}-meal-${mIdx}`}
                          onClick={() => setSwapTarget({ dayIndex: dayIdx, mealIndex: mIdx })}
                          className="px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider border border-[#1A1A1A]/15 bg-white hover:border-[#1A1A1A] text-[#1A1A1A] transition-all"
                        >
                          Swap
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Package Value Box */}
      <div className="bg-white border-2 border-[#1A1A1A] rounded-none p-4.5 mb-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bg-[#E63946] text-white text-[8px] font-bold uppercase tracking-wider px-2.5 py-0.5">
          Plan Bundle Discount Applied
        </div>
        <h3 className="font-serif italic font-black text-[#1A1A1A] text-lg mb-1 mt-1 leading-none">
          Custom Delivery Bill Summary
        </h3>
        <p className="text-[10px] text-[#1A1A1A]/50 font-serif italic mb-3">
          Vacuum packed meals prepared inside a strict clinical kitchen.
        </p>

        <div className="space-y-1.5 text-xs border-b border-[#1A1A1A]/10 pb-3">
          <div className="flex justify-between text-[#1A1A1A]/60">
            <span>
              Base Cost ({totalMealsCount} meals @ ${basePricePerMeal}/ea)
            </span>
            <span>${rawSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#E63946] font-bold">
            <span>Multi-Day Plan Discount ({Math.round(discountPct * 100)}% off)</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#1A1A1A]/60">
            <span>Insulated Cold Courier Shipping</span>
            <span>{deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
            Delivered Package Price:
          </span>
          <span className="text-2xl font-black text-[#E63946] font-mono">
            ${finalPlanPrice.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          id="btn-order-meal-plan"
          onClick={handleOpenCheckout}
          className="w-full py-4 bg-[#E63946] hover:bg-[#d62828] text-white font-bold text-xs uppercase tracking-widest rounded-none transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Order Delivered Plan • ${finalPlanPrice.toFixed(2)}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CUSTOM SWAP MODAL — F-C2: uses the accessible <Modal> component. */}
      <Modal
        open={swapTarget !== null}
        onClose={() => setSwapTarget(null)}
        title="Swap Meal"
        maxWidthClass="max-w-sm"
      >
        <div className="p-3 space-y-2.5 max-h-[70vh] overflow-y-auto">
          <p className="text-[9px] text-[#1A1A1A]/50 font-mono uppercase">
            Diet Compliant Options ({eligibleMeals.length})
          </p>
          {eligibleMeals.map((meal) => {
            const isCurrentlySelected =
              customPlan[swapTarget?.dayIndex ?? -1]?.meals[swapTarget?.mealIndex ?? -1]?.meal.id === meal.id;

            return (
              <button
                key={meal.id}
                type="button"
                id={`btn-select-swap-meal-${meal.id}`}
                onClick={() => executeMealSwap(meal)}
                className={`w-full text-left p-2.5 border transition-all flex gap-3 ${
                  isCurrentlySelected
                    ? "bg-[#1A1A1A]/5 border-[#1A1A1A]"
                    : "bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30"
                }`}
              >
                <img
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  src={meal.image}
                  alt={meal.name}
                  className="w-12 h-12 object-cover flex-shrink-0"
                />
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <h5 className="text-xs font-bold uppercase tracking-tight text-[#1A1A1A] truncate">
                      {meal.name}
                    </h5>
                    {isCurrentlySelected && (
                      <span className="text-[#E63946] text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Current
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#1A1A1A]/50 font-serif italic truncate">
                    {meal.description}
                  </p>
                  <div className="flex gap-2.5 mt-0.5 text-[9px] font-mono text-[#1A1A1A]/60">
                    <span>{meal.calories} kcal</span>
                    <span>{meal.protein}g Pro</span>
                    <span>${meal.price}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* SECURE CHECKOUT — F-C2: uses the accessible <Modal> component. */}
      <Modal
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Demo Checkout"
        closeOnOverlayClick={!isProcessingOrder}
      >
        {isOrderSuccess ? (
          <div className="p-8 text-center flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-[#E63946] mb-4 animate-bounce" />
            <h3 className="text-xl font-serif font-black italic text-[#1A1A1A]">
              Demo Plan Confirmed
            </h3>
            <p className="text-[#1A1A1A]/60 text-xs mt-1.5 max-w-xs font-serif italic">
              Your simulated meal-plan subscription is set up. <strong className="not-italic font-bold text-[#E63946]">No payment was processed</strong> and no meals will be delivered.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase text-[#1A1A1A]/50 bg-[#F9F8F6] border border-[#1A1A1A]/10 px-3 py-2 rounded-none">
              <AlertTriangle className="w-4 h-4 text-[#E63946]" />
              <span>Demo mode — no real subscription</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="p-5 space-y-4">
            {/* Demo-mode banner — no real payment is processed */}
            <div className="bg-[#E63946]/5 border border-[#E63946]/15 px-3 py-2.5 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#E63946] flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#1A1A1A]/70 font-serif italic leading-relaxed">
                <strong className="not-italic font-bold text-[#E63946]">Demo only.</strong> No
                real payment is processed and no card details are collected. Submitting will
                simulate an order confirmation for showcase purposes.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <span className="block text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest mb-1.5">
                  Delivered Plan Summary
                </span>
                <div className="bg-[#F9F8F6] px-3 py-2 rounded-none border border-[#1A1A1A]/5 text-xs flex justify-between font-bold">
                  <span className="text-[#1A1A1A]/60">
                    {numDays}-day plan ({totalMealsCount} preps)
                  </span>
                  <span className="text-[#E63946] font-mono">${finalPlanPrice.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="input-checkout-address"
                  className="block text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest mb-1.5"
                >
                  Delivery Street Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-[#1A1A1A]/40" />
                  <input
                    id="input-checkout-address"
                    type="text"
                    placeholder="e.g. 120 Baker Street, London"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full bg-white border border-[#1A1A1A]/15 rounded-none pl-9 pr-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>
            </div>

            <button
              id="btn-submit-order"
              type="submit"
              disabled={isProcessingOrder}
              className="w-full py-3.5 mt-4 bg-[#E63946] hover:bg-[#d62828] text-white font-bold text-xs uppercase tracking-widest rounded-none transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isProcessingOrder ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Preparing Demo Order...
                </>
              ) : (
                <>Place Demo Order • ${finalPlanPrice.toFixed(2)}</>
              )}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
