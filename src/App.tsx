import { useState, useEffect, lazy, Suspense } from "react";
import Onboarding from "./components/Onboarding";

// Code-split the tab components so they only load when the user navigates
// to them. Onboarding (which runs once per user) is no longer in the main
// bundle of any tab, and the 1,670-line ProgressTab is only fetched when
// the user opens the Logs tab.
const TrainingTab = lazy(() => import("./components/TrainingTab"));
const MealOrderingTab = lazy(() => import("./components/MealOrderingTab"));
const ProgressTab = lazy(() => import("./components/ProgressTab"));
const MarketplaceTab = lazy(() => import("./components/MarketplaceTab"));
const ProfileTab = lazy(() => import("./components/ProfileTab"));

import type {
  Assessment,
  PersonalPlan,
  CartItem,
  Order,
  WeightLog,
  WaterLog,
  WorkoutLog,
  WorkoutPlan,
} from "./types";
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
import { ToastViewport, ConfirmViewport } from "./components/Toast";

type TabId = "training" | "meals" | "progress" | "marketplace" | "profile";

export default function App() {
  // --- Persisted stores (replace the previous 8 useState + 11 callbacks) ---
  const hydrated = useHydrated();
  const assessment = useUserStore((s) => s.assessment);
  const personalPlan = useUserStore((s) => s.personalPlan);
  const setBoth = useUserStore((s) => s.setBoth);
  const updateWorkoutPlan = useUserStore((s) => s.updateWorkoutPlan);
  const updateWeight = useUserStore((s) => s.updateWeight);
  const resetUser = useUserStore((s) => s.reset);

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

  // --- Non-persisted UI state ---
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
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- Bridge callbacks (let child components keep their existing prop APIs) ---
  const handleOnboardingComplete = (plan: PersonalPlan, userAssessment: Assessment) => {
    setBoth(userAssessment, plan);
    setActiveTab("training");
    // Seed today's weight log from the questionnaire value (no-op if already logged)
    addWeightLog(userAssessment.weight);
  };

  const handleAddWeightLog = (weight: number) => {
    addWeightLog(weight);
    updateWeight(weight);
  };

  const handleCheckout = (newOrder: Order) => {
    addOrder(newOrder);
  };

  const handleUpdateWorkoutPlan = (updatedPlan: WorkoutPlan) => {
    updateWorkoutPlan(updatedPlan);
  };

  const handleResetOnboarding = () => {
    resetUser();
    resetLogs();
    resetCommerce();
  };

  // Stable cart-operation callbacks (zustand actions are already stable refs)
  const handleAddToCart = (newItem: CartItem) => addToCart(newItem);
  const handleRemoveFromCart = (id: string) => removeFromCart(id);
  const handleUpdateCartQty = (id: string, qty: number) => updateCartQty(id, qty);

  const handleAddWaterLog = (amountMl: number) => addWaterLog(amountMl);
  const handleClearWaterLogs = () => clearTodayWaterLogs();
  const handleLogWorkout = (log: WorkoutLog) => addWorkoutLog(log);

  // --- Loading gate: avoid flashing the onboarding flow before stores rehydrate ---
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#EFECE6] flex items-center justify-center font-sans">
        <div className="text-[#1A1A1A]/40 text-xs font-mono uppercase tracking-widest animate-pulse">
          Loading…
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "training", label: "Training", icon: <Dumbbell className="w-5 h-5" /> },
    { id: "meals", label: "Meals Prep", icon: <UtensilsCrossed className="w-5 h-5" /> },
    { id: "progress", label: "Logs", icon: <Activity className="w-5 h-5" /> },
    { id: "marketplace", label: "Store", icon: <ShoppingBag className="w-5 h-5" /> },
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#EFECE6] flex items-center justify-center py-0 md:py-8 font-sans antialiased selection:bg-[#E63946]/20 select-none">
      {/* Global toast + confirm portals */}
      <ToastViewport />
      <ConfirmViewport />

      {/* Device mock Frame: Centered phone block on desktop, full height on mobile */}
      <div className="relative w-full md:w-[410px] h-screen md:h-[840px] md:max-h-[92vh] md:rounded-[48px] md:border-8 md:border-[#1A1A1A] bg-[#F9F8F6] text-[#1A1A1A] overflow-hidden flex flex-col shadow-[0_25px_60px_-15px_rgba(26,26,26,0.15)]">
        {/* Device camera island notches (only shown on desktop frames) */}
        <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1A1A1A] rounded-full z-50">
          <div className="absolute right-6 top-1.5 w-2.5 h-2.5 rounded-full bg-[#1A1A1A] border border-white/10" />
        </div>

        {/* Device Status Top Bar */}
        <div className="flex justify-between items-center px-6 pt-3 md:pt-4 pb-2.5 bg-[#F9F8F6] text-[#1A1A1A]/60 text-[11px] font-mono z-30 select-none flex-shrink-0 border-b border-[#1A1A1A]/5">
          <span>{timeStr}</span>
          <div className="flex items-center gap-1.5 text-[#1A1A1A]/70">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-[#1A1A1A] fill-current" />
          </div>
        </div>

        {/* Dynamic Core Screen Views */}
        <div className="flex-grow overflow-hidden relative pb-16">
          {!assessment || !personalPlan ? (
            <Onboarding onComplete={handleOnboardingComplete} />
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
                  workoutPlan={personalPlan.workoutPlan}
                  onLogWorkout={handleLogWorkout}
                  onUpdateWorkoutPlan={handleUpdateWorkoutPlan}
                />
              )}
              {activeTab === "meals" && (
                <MealOrderingTab
                  assessment={assessment}
                  personalPlan={personalPlan}
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
                  assessment={assessment}
                  nutritionPlan={personalPlan.nutritionPlan}
                  orderHistory={orderHistory}
                  onResetOnboarding={handleResetOnboarding}
                />
              )}
            </Suspense>
          )}
        </div>

        {/* Bottom Tab Bar (renders only when onboarding is complete) */}
        {assessment && personalPlan && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#1A1A1A]/10 py-2.5 px-4 flex justify-between items-center z-30 flex-shrink-0 pb-5 md:pb-3.5">
            {tabs.map((tab) => {
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

        {/* Home swipe indicator line at bottom of phone mockup */}
        <div className="hidden md:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#1A1A1A]/15 rounded-full z-40" />
      </div>
    </div>
  );
}

// Re-export types used by the bridge callbacks to keep imports clean
export type { WeightLog, WaterLog };
