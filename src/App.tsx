import { useState, useEffect } from "react";
import Onboarding from "./components/Onboarding";
import TrainingTab from "./components/TrainingTab";
import MealOrderingTab from "./components/MealOrderingTab";
import ProgressTab from "./components/ProgressTab";
import MarketplaceTab from "./components/MarketplaceTab";
import ProfileTab from "./components/ProfileTab";

import { Assessment, PersonalPlan, CartItem, Order, WeightLog, WaterLog, WorkoutLog } from "./types";
import { 
  Dumbbell, 
  UtensilsCrossed, 
  Activity, 
  ShoppingBag, 
  User, 
  Wifi, 
  Battery, 
  Signal 
} from "lucide-react";

export default function App() {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [personalPlan, setPersonalPlan] = useState<PersonalPlan | null>(null);
  const [activeTab, setActiveTab] = useState<"training" | "meals" | "progress" | "marketplace" | "profile">("training");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  // Seed progress logs with initial realistic entries
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([
    { date: "2026-06-23", value: 76.5 },
    { date: "2026-06-25", value: 75.8 },
    { date: "2026-06-28", value: 75.2 }
  ]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([
    {
      date: "2026-06-25",
      workoutTitle: "Monday - Full Body Power Focus",
      durationMinutes: 45,
      caloriesBurned: 315
    }
  ]);

  // Live status clock inside phone mockup
  const [timeStr, setTimeStr] = useState<string>("09:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let mins = now.getMinutes().toString().padStart(2, "0");
      let ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setTimeStr(`${hours}:${mins} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Cart operations
  const handleAddToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === newItem.id && item.type === newItem.type);
      if (existing) {
        return prev.map(item => 
          item.id === newItem.id && item.type === newItem.type
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };

  const handleUpdateCartQty = (id: string, qty: number) => {
    if (qty < 1) {
      handleRemoveFromCart(id);
      return;
    }
    setCart((prev) => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const handleCheckout = (newOrder: Order) => {
    setOrderHistory((prev) => [newOrder, ...prev]);
    // Clear items of the checked out type from the cart
    const itemTypeToCheck = newOrder.id.includes("mkt") ? "marketplace" : "meal";
    setCart((prev) => prev.filter(item => item.type !== itemTypeToCheck));
  };

  // Onboarding callbacks
  const handleOnboardingComplete = (plan: PersonalPlan, userAssessment: Assessment) => {
    setAssessment(userAssessment);
    setPersonalPlan(plan);
    setActiveTab("training");
    // Append starting weight log from questionnaire
    setWeightLogs((prev) => {
      const today = new Date().toISOString().split("T")[0];
      const exists = prev.some(l => l.date === today);
      if (exists) return prev;
      return [...prev, { date: today, value: userAssessment.weight }];
    });
  };

  // Progress Logging
  const handleAddWeightLog = (weight: number) => {
    const today = new Date().toISOString().split("T")[0];
    setWeightLogs((prev) => {
      const cleaned = prev.filter(l => l.date !== today);
      return [...cleaned, { date: today, value: weight }];
    });
    // Dynamically update weight inside user assessment state
    if (assessment) {
      setAssessment(prev => prev ? { ...prev, weight } : null);
    }
  };

  const handleAddWaterLog = (amountMl: number) => {
    const today = new Date().toISOString().split("T")[0];
    setWaterLogs((prev) => [
      ...prev,
      { date: today, amountMl }
    ]);
  };

  const handleClearWaterLogs = () => {
    const today = new Date().toISOString().split("T")[0];
    setWaterLogs((prev) => prev.filter(l => l.date !== today));
  };

  const handleLogWorkout = (log: WorkoutLog) => {
    setWorkoutLogs((prev) => [log, ...prev]);
  };

  const handleResetOnboarding = () => {
    setAssessment(null);
    setPersonalPlan(null);
    setCart([]);
    setOrderHistory([]);
    setWaterLogs([]);
  };

  return (
    <div className="min-h-screen bg-[#EFECE6] flex items-center justify-center py-0 md:py-8 font-sans antialiased selection:bg-[#E63946]/20 select-none">
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
            <>
              {activeTab === "training" && (
                <TrainingTab 
                  workoutPlan={personalPlan.workoutPlan} 
                  onLogWorkout={handleLogWorkout}
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
                  assessment={assessment}
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
            </>
          )}
        </div>

        {/* Bottom Tab Bar (renders only when onboarding is complete) */}
        {assessment && personalPlan && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#1A1A1A]/10 py-2.5 px-4 flex justify-between items-center z-30 flex-shrink-0 pb-5 md:pb-3.5">
            {[
              { id: "training", label: "Training", icon: <Dumbbell className="w-5 h-5" /> },
              { id: "meals", label: "Meals Prep", icon: <UtensilsCrossed className="w-5 h-5" /> },
              { id: "progress", label: "Logs", icon: <Activity className="w-5 h-5" /> },
              { id: "marketplace", label: "Store", icon: <ShoppingBag className="w-5 h-5" /> },
              { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`btn-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
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
