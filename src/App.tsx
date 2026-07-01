import { useState, useEffect, useCallback, memo, lazy, Suspense, type ReactNode } from "react";

// A-31 fix: lazy-load Onboarding too. It's 1,166+ LOC and imports `motion`
// (97 kB) — both land in the initial bundle for every visitor even though
// onboarding is only shown once. Lazy-loading moves them to a separate chunk
// that only loads for new users. Returning users (who have onboardingInput +
// workoutPlan persisted) never download it.
const Onboarding = lazy(() => import("./components/Onboarding"));

// F-C4 fix: wrap lazy-loaded tabs in memo so they don't re-render when App
// re-renders for unrelated reasons (e.g. activeTab change). Combined with
// useCallback handlers below, this prevents the 10s clock (now isolated in
// <StatusBar />) and other App state changes from re-rendering the active tab.
const TrainingTab = memo(lazy(() => import("./components/TrainingTab")));
const MealOrderingTab = memo(lazy(() => import("./components/MealOrderingTab")));
const ProgressTab = memo(lazy(() => import("./components/ProgressTab")));
const MarketplaceTab = memo(lazy(() => import("./components/MarketplaceTab")));
const ProfileTab = memo(lazy(() => import("./components/ProfileTab")));

import type {
  OnboardingInput,
  WorkoutPlan,
  CartItem,
  Order,
  WorkoutLog,
} from "./engine";
import {
  Dumbbell,
  UtensilsCrossed,
  Activity,
  ShoppingBag,
  User,
  Wifi,
  Battery,
  Signal,
} from "lucide-react";
import { useUserStore } from "./store/useUserStore";
import { useLogsStore } from "./store/useLogsStore";
import { useCommerceStore } from "./store/useCommerceStore";
import { useHydrated } from "./store/useHydrated";
import { useEngine } from "./store/useEngine";
import { ToastViewport, ConfirmViewport } from "./components/Toast";

type TabId = "training" | "meals" | "progress" | "marketplace" | "profile";

/**
 * StatusBar — the phone-mockup status bar (time + signal/wifi/battery icons).
 *
 * F-C4 fix: the 10-second clock interval lives HERE, not in <App />, so the
 * clock tick only re-renders this tiny component. Previously the clock was in
 * App's local state, which re-rendered the entire tab subtree every 10s
 * (including the 2,140-line ProgressTab's non-memoized render paths). The
 * ARCHITECTURE.md claim that the zustand migration fixed this was false; this
 * extraction actually fixes it.
 */
function StatusBar() {
  const [timeStr, setTimeStr] = useState<string>("09:41");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setTimeStr(`${hours}:${mins} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);
  return (
    // F-M13 fix: status bar as a <header> landmark. The status bar is the
    // top-of-app chrome (clock + signal/wifi/battery) — a banner landmark
    // is the correct semantic role for this kind of masthead content.
    <header className="flex justify-between items-center px-6 pt-3 md:pt-4 pb-2.5 bg-[#F9F8F6] text-[#1A1A1A]/60 text-[11px] font-mono z-30 select-none flex-shrink-0 border-b border-[#1A1A1A]/5">
      <span>{timeStr}</span>
      <div className="flex items-center gap-1.5 text-[#1A1A1A]/70">
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <Battery className="w-4 h-4 text-[#1A1A1A] fill-current" />
      </div>
    </header>
  );
}

export default function App() {
  const hydrated = useHydrated();
  const onboardingInput = useUserStore((s) => s.onboardingInput);
  const workoutPlan = useUserStore((s) => s.workoutPlan);
  const setBoth = useUserStore((s) => s.setBoth);
  const updateWorkoutPlan = useUserStore((s) => s.updateWorkoutPlan);
  const updateWeight = useUserStore((s) => s.updateWeight);
  const resetUser = useUserStore((s) => s.reset);

  const { nutritionPlan } = useEngine();

  const weightLogs = useLogsStore((s) => s.weightLogs);
  const waterLogs = useLogsStore((s) => s.waterLogs);
  const workoutLogs = useLogsStore((s) => s.workoutLogs);
  const addWeightLog = useLogsStore((s) => s.addWeightLog);
  const addWaterLog = useLogsStore((s) => s.addWaterLog);
  const clearTodayWaterLogs = useLogsStore((s) => s.clearTodayWaterLogs);
  const addWorkoutLog = useLogsStore((s) => s.addWorkoutLog);
  const resetLogs = useLogsStore((s) => s.reset);

  const cart = useCommerceStore((s) => s.cart);
  const orderHistory = useCommerceStore((s) => s.orderHistory);
  const addToCart = useCommerceStore((s) => s.addToCart);
  const removeFromCart = useCommerceStore((s) => s.removeFromCart);
  const updateCartQty = useCommerceStore((s) => s.updateCartQty);
  const addOrder = useCommerceStore((s) => s.addOrder);
  const resetCommerce = useCommerceStore((s) => s.reset);

  const [activeTab, setActiveTab] = useState<TabId>("training");

  // F-C4 fix: wrap all handlers in useCallback so they have stable references
  // across renders. This is what makes React.memo on the tab components
  // effective — without useCallback, every App render creates new handler
  // functions, which defeats memo. The zustand store actions in the dep
  // arrays are stable references (zustand guarantees this), so these
  // callbacks are effectively created once.
  const handleOnboardingComplete = useCallback(
    (plan: WorkoutPlan, input: OnboardingInput) => {
      setBoth(input, plan);
      setActiveTab("training");
      addWeightLog(input.weight);
    },
    [setBoth, addWeightLog],
  );

  const handleAddWeightLog = useCallback(
    (weight: number) => {
      addWeightLog(weight);
      updateWeight(weight);
    },
    [addWeightLog, updateWeight],
  );

  const handleCheckout = useCallback(
    (newOrder: Order) => {
      addOrder(newOrder);
    },
    [addOrder],
  );

  const handleUpdateWorkoutPlan = useCallback(
    (updatedPlan: WorkoutPlan) => {
      updateWorkoutPlan(updatedPlan);
    },
    [updateWorkoutPlan],
  );

  const handleResetOnboarding = useCallback(() => {
    resetUser();
    resetLogs();
    resetCommerce();
  }, [resetUser, resetLogs, resetCommerce]);

  const handleAddToCart = useCallback((newItem: CartItem) => addToCart(newItem), [addToCart]);
  const handleRemoveFromCart = useCallback((id: string) => removeFromCart(id), [removeFromCart]);
  const handleUpdateCartQty = useCallback(
    (id: string, qty: number) => updateCartQty(id, qty),
    [updateCartQty],
  );

  const handleAddWaterLog = useCallback((amountMl: number) => addWaterLog(amountMl), [addWaterLog]);
  const handleClearWaterLogs = useCallback(() => clearTodayWaterLogs(), [clearTodayWaterLogs]);
  const handleLogWorkout = useCallback((log: WorkoutLog) => addWorkoutLog(log), [addWorkoutLog]);
  const handleNavigateToMeals = useCallback(() => setActiveTab("meals"), []);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#EFECE6] flex items-center justify-center font-sans">
        <div className="text-[#1A1A1A]/40 text-xs font-mono uppercase tracking-widest animate-pulse">
          Loading…
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: ReactNode }[] = [
    { id: "training", label: "Training", icon: <Dumbbell className="w-5 h-5" /> },
    { id: "meals", label: "Meals Prep", icon: <UtensilsCrossed className="w-5 h-5" /> },
    { id: "progress", label: "Logs", icon: <Activity className="w-5 h-5" /> },
    { id: "marketplace", label: "Store", icon: <ShoppingBag className="w-5 h-5" /> },
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#EFECE6] flex items-center justify-center py-0 md:py-4 lg:py-0 font-sans antialiased selection:bg-[#E63946]/20 select-none">
      <ToastViewport />
      <ConfirmViewport />

      {/* F-H12 fix: on mobile (default) the app is full-screen. On md
          breakpoints (tablet) the phone mockup is preserved for the
          mobile-first visual metaphor. On lg+ breakpoints the phone bezel
          is dropped — the app uses a responsive max-width container so
          desktop users get a wider, more readable layout instead of a
          cramped 410px column. */}
      <div className="relative w-full md:w-[410px] lg:w-full lg:max-w-3xl h-screen md:h-[840px] lg:h-screen lg:max-h-none md:max-h-[92vh] lg:max-h-none md:rounded-[48px] lg:rounded-none md:border-8 lg:border-0 md:border-[#1A1A1A] lg:border-transparent bg-[#F9F8F6] text-[#1A1A1A] overflow-hidden flex flex-col shadow-[0_25px_60px_-15px_rgba(26,26,26,0.15)] lg:shadow-none">
        {/* F-M12 fix: top-level h1 is visually hidden but provides an
            accessible name for the app shell for screen-reader users
            (otherwise the landmark roles below would be nameless). */}
        <h1 className="sr-only">FitLife Hub</h1>

        <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1A1A1A] rounded-full z-50">
          <div className="absolute right-6 top-1.5 w-2.5 h-2.5 rounded-full bg-[#1A1A1A] border border-white/10" />
        </div>

        {/* F-M13 fix: status bar as <header> landmark. */}
        <StatusBar />

        {/* F-M13 fix: tab content area as <main> landmark. */}
        <main className="flex-grow overflow-hidden relative pb-16">
          {!onboardingInput || !workoutPlan ? (
            // A-31: Onboarding is now lazy-loaded — wrap in Suspense.
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full text-[#1A1A1A]/40 text-xs font-mono uppercase tracking-widest animate-pulse">
                  Loading…
                </div>
              }
            >
              <Onboarding onComplete={handleOnboardingComplete} />
            </Suspense>
          ) : (
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full text-[#1A1A1A]/40 text-xs font-mono uppercase tracking-widest animate-pulse">
                  Loading…
                </div>
              }
            >
              {activeTab === "training" && (
                <TrainingTab
                  workoutPlan={workoutPlan}
                  onLogWorkout={handleLogWorkout}
                  onUpdateWorkoutPlan={handleUpdateWorkoutPlan}
                />
              )}
              {activeTab === "meals" && (
                <MealOrderingTab
                  assessment={onboardingInput}
                  nutritionPlan={nutritionPlan}
                  cart={cart}
                  onAddToCart={handleAddToCart}
                  onRemoveFromCart={handleRemoveFromCart}
                  onUpdateCartQty={handleUpdateCartQty}
                  onCheckout={handleCheckout}
                />
              )}
              {activeTab === "progress" && (
                <ProgressTab
                  weightLogs={weightLogs}
                  waterLogs={waterLogs}
                  workoutLogs={workoutLogs}
                  onAddWeightLog={handleAddWeightLog}
                  onAddWaterLog={handleAddWaterLog}
                  onClearWaterLogs={handleClearWaterLogs}
                />
              )}
              {activeTab === "marketplace" && (
                <MarketplaceTab
                  cart={cart}
                  onAddToCart={handleAddToCart}
                  onRemoveFromCart={handleRemoveFromCart}
                  onUpdateCartQty={handleUpdateCartQty}
                  onCheckout={handleCheckout}
                />
              )}
              {activeTab === "profile" && (
                <ProfileTab
                  assessment={onboardingInput}
                  nutritionPlan={nutritionPlan}
                  orderHistory={orderHistory}
                  onResetOnboarding={handleResetOnboarding}
                  onNavigateToMeals={handleNavigateToMeals}
                />
              )}
            </Suspense>
          )}
        </main>

        {onboardingInput && workoutPlan && (
          // F-M13 fix: bottom tab bar as <nav aria-label="Primary"> landmark.
          <nav
            aria-label="Primary"
            className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#1A1A1A]/10 py-2.5 px-4 flex justify-between items-center z-30 flex-shrink-0 pb-5 md:pb-3.5"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`btn-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  // F-M11 fix: py-1 → py-2.5 so each tab button meets the
                  // WCAG 2.5.5 44×44 px touch-target minimum on mobile.
                  className={`flex flex-col items-center justify-center flex-1 transition-all py-2.5 ${
                    isActive
                      ? "text-[#E63946] scale-105 font-bold"
                      : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                  }`}
                >
                  {tab.icon}
                  <span className="text-[9px] mt-1.5 uppercase tracking-wide font-medium">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
        )}

        <div className="hidden md:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#1A1A1A]/15 rounded-full z-40" />
      </div>
    </div>
  );
}
