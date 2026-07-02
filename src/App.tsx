import { useState, useEffect, lazy, Suspense } from "react";
import type { ReactNode } from "react";
import Onboarding from "./components/Onboarding";
import { ErrorBoundary } from "./components/ErrorBoundary";

const TrainingTab = lazy(() => import("./components/TrainingTab"));
const MealOrderingTab = lazy(() => import("./components/MealOrderingTab"));
const ProgressTab = lazy(() => import("./components/ProgressTab"));
const MarketplaceTab = lazy(() => import("./components/MarketplaceTab"));
const ProfileTab = lazy(() => import("./components/ProfileTab"));

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

// A-10: hoisted to module level so the array identity is stable across
// renders. The icons are static; recreating them every render caused the
// bottom navigation to re-render on every clock tick (every 10s).
const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
  { id: "training", label: "Training", icon: <Dumbbell className="w-5 h-5" /> },
  { id: "meals", label: "Meals Prep", icon: <UtensilsCrossed className="w-5 h-5" /> },
  { id: "progress", label: "Logs", icon: <Activity className="w-5 h-5" /> },
  { id: "marketplace", label: "Store", icon: <ShoppingBag className="w-5 h-5" /> },
  { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
];

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
    // Q-15: 1-second interval so the clock is accurate to the minute.
    // The previous 10-second interval meant the clock could be up to 10s off.
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // A-09: removed 8 useless wrapper handlers. The two handlers that remain
  // do real multi-step work (handleOnboardingComplete orchestrates 3 store
  // calls; handleAddWeightLog updates both the log store and the user store;
  // handleResetOnboarding resets 3 stores). The other handlers were
  // one-line forwarders that just called the store function with the same
  // args — components now receive the store functions directly.
  const handleOnboardingComplete = (plan: WorkoutPlan, input: OnboardingInput) => {
    setBoth(input, plan);
    setActiveTab("training");
    addWeightLog(input.weight);
  };

  const handleAddWeightLog = (weight: number) => {
    addWeightLog(weight);
    updateWeight(weight);
  };

  const handleResetOnboarding = () => {
    resetUser();
    resetLogs();
    resetCommerce();
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#EFECE6] flex items-center justify-center font-sans">
        <div className="text-[#1A1A1A]/40 text-xs font-mono uppercase tracking-widest animate-pulse">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFECE6] flex items-center justify-center py-0 md:py-8 font-sans antialiased selection:bg-[#E63946]/20 select-none">
      <ToastViewport />
      <ConfirmViewport />

      <div className="relative w-full md:w-[410px] h-screen md:h-[840px] md:max-h-[92vh] md:rounded-[48px] md:border-8 md:border-[#1A1A1A] bg-[#F9F8F6] text-[#1A1A1A] overflow-hidden flex flex-col shadow-[0_25px_60px_-15px_rgba(26,26,26,0.15)]">
        <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1A1A1A] rounded-full z-50">
          <div className="absolute right-6 top-1.5 w-2.5 h-2.5 rounded-full bg-[#1A1A1A] border border-white/10" />
        </div>

        <div className="flex justify-between items-center px-6 pt-3 md:pt-4 pb-2.5 bg-[#F9F8F6] text-[#1A1A1A]/60 text-[11px] font-mono z-30 select-none flex-shrink-0 border-b border-[#1A1A1A]/5">
          <span>{timeStr}</span>
          <div className="flex items-center gap-1.5 text-[#1A1A1A]/70">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-[#1A1A1A] fill-current" />
          </div>
        </div>

        <div className="flex-grow overflow-hidden relative pb-16">
          {!onboardingInput || !workoutPlan ? (
            <Onboarding onComplete={handleOnboardingComplete} />
          ) : (
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full text-[#1A1A1A]/40 text-xs font-mono uppercase tracking-widest animate-pulse">
                  Loading…
                </div>
              }
            >
              {/* A-04: per-tab ErrorBoundary so a crash in one tab does not
                  take down the whole app. resetKey clears the error state
                  when the user navigates away from the broken tab. */}
              <ErrorBoundary label="Training" resetKey={activeTab}>
                {activeTab === "training" && (
                  <TrainingTab
                    workoutPlan={workoutPlan}
                    onLogWorkout={addWorkoutLog}
                    onUpdateWorkoutPlan={updateWorkoutPlan}
                  />
                )}
              </ErrorBoundary>

              <ErrorBoundary label="Meal Prep" resetKey={activeTab}>
                {activeTab === "meals" && (
                  <MealOrderingTab
                    assessment={onboardingInput}
                    nutritionPlan={nutritionPlan}
                    cart={cart}
                    onAddToCart={addToCart}
                    onRemoveFromCart={removeFromCart}
                    onUpdateCartQty={updateCartQty}
                    onCheckout={addOrder}
                  />
                )}
              </ErrorBoundary>

              <ErrorBoundary label="Logs" resetKey={activeTab}>
                {activeTab === "progress" && (
                  <ProgressTab
                    weightLogs={weightLogs}
                    waterLogs={waterLogs}
                    workoutLogs={workoutLogs}
                    onAddWeightLog={handleAddWeightLog}
                    onAddWaterLog={addWaterLog}
                    onClearWaterLogs={clearTodayWaterLogs}
                  />
                )}
              </ErrorBoundary>

              <ErrorBoundary label="Store" resetKey={activeTab}>
                {activeTab === "marketplace" && (
                  <MarketplaceTab
                    cart={cart}
                    onAddToCart={addToCart}
                    onRemoveFromCart={removeFromCart}
                    onUpdateCartQty={updateCartQty}
                    onCheckout={addOrder}
                  />
                )}
              </ErrorBoundary>

              <ErrorBoundary label="Profile" resetKey={activeTab}>
                {activeTab === "profile" && (
                  <ProfileTab
                    assessment={onboardingInput}
                    nutritionPlan={nutritionPlan}
                    orderHistory={orderHistory}
                    onResetOnboarding={handleResetOnboarding}
                  />
                )}
              </ErrorBoundary>
            </Suspense>
          )}
        </div>

        {onboardingInput && workoutPlan && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#1A1A1A]/10 py-2.5 px-4 flex justify-between items-center z-30 flex-shrink-0 pb-5 md:pb-3.5">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`btn-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center flex-1 transition-all py-1 ${
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
          </div>
        )}

        <div className="hidden md:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#1A1A1A]/15 rounded-full z-40" />
      </div>
    </div>
  );
}
