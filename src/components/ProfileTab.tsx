import { Assessment, NutritionPlan, Order } from "../types";
import { 
  User, 
  Scale, 
  Settings, 
  Heart, 
  RefreshCw, 
  FileText, 
  ShoppingBag, 
  ChevronRight, 
  Compass,
  PieChart,
  Calendar,
  AlertTriangle
} from "lucide-react";

interface ProfileTabProps {
  assessment: Assessment;
  nutritionPlan: NutritionPlan;
  orderHistory: Order[];
  onResetOnboarding: () => void;
}

export default function ProfileTab({
  assessment,
  nutritionPlan,
  orderHistory,
  onResetOnboarding
}: ProfileTabProps) {
  // Calculate macros ratios for standard visualization
  const totalMacrosGrams = nutritionPlan.macros.protein + nutritionPlan.macros.carbs + nutritionPlan.macros.fat || 1;
  const pPct = Math.round((nutritionPlan.macros.protein / totalMacrosGrams) * 100);
  const cPct = Math.round((nutritionPlan.macros.carbs / totalMacrosGrams) * 100);
  const fPct = 100 - pPct - cPct;

  const handleResetConfirm = () => {
    if (confirm("Are you sure you want to reset your training split, nutritional targets, and clear active plans? This will return you to the onboarding questionnaire.")) {
      onResetOnboarding();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6] text-[#1A1A1A] overflow-y-auto p-4 md:p-6 pb-24">
      {/* Title */}
      <div className="mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E63946] underline underline-offset-4 block mb-2">
          05 — Coaching HQ
        </span>
        <h1 className="text-3xl font-serif font-black italic text-[#1A1A1A] mt-3 tracking-tight">
          Coaching HQ & Profile
        </h1>
      </div>

      {/* User Bio Card */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#E63946]/5 border border-[#E63946]/10 flex items-center justify-center">
            <User className="w-6 h-6 text-[#E63946]" />
          </div>
          <div>
            <h3 className="font-bold text-[#1A1A1A] text-lg uppercase tracking-tight">
              {assessment.name}
            </h3>
            <p className="text-[10px] text-[#1A1A1A]/60 mt-0.5 uppercase tracking-wider font-semibold font-mono">
              Goal: {assessment.goal.replace("-", " ")}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
          <div className="bg-[#F9F8F6] p-2 rounded-none border border-[#1A1A1A]/5 shadow-sm">
            <span className="block text-[8px] uppercase font-bold text-[#1A1A1A]/40">Age</span>
            <span className="text-xs font-bold text-[#1A1A1A]">{assessment.age} yrs</span>
          </div>
          <div className="bg-[#F9F8F6] p-2 rounded-none border border-[#1A1A1A]/5 shadow-sm">
            <span className="block text-[8px] uppercase font-bold text-[#1A1A1A]/40">Weight</span>
            <span className="text-xs font-bold text-[#1A1A1A]">{assessment.weight} kg</span>
          </div>
          <div className="bg-[#F9F8F6] p-2 rounded-none border border-[#1A1A1A]/5 shadow-sm">
            <span className="block text-[8px] uppercase font-bold text-[#1A1A1A]/40">Height</span>
            <span className="text-xs font-bold text-[#1A1A1A]">{assessment.height} cm</span>
          </div>
          <div className="bg-[#F9F8F6] p-2 rounded-none border border-[#1A1A1A]/5 shadow-sm">
            <span className="block text-[8px] uppercase font-bold text-[#1A1A1A]/40">Diet</span>
            <span className="text-[10px] font-bold text-[#E63946] truncate block uppercase">{assessment.dietType}</span>
          </div>
        </div>

        {assessment.allergies && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#E63946] bg-[#E63946]/5 px-2.5 py-1.5 border border-[#E63946]/15 rounded-none font-serif italic">
            <AlertTriangle className="w-3.5 h-3.5 text-[#E63946] flex-shrink-0" />
            <span>Allergen Warning: Sensitive to {assessment.allergies}</span>
          </div>
        )}
      </div>

      {/* Customized AI Nutrition Plan */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 mb-6">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
          <PieChart className="w-4 h-4 text-[#E63946]" />
          Nutritional Blueprint Target
        </h3>

        {/* Daily calories and macro distributions */}
        <div className="bg-[#F9F8F6] border border-[#1A1A1A]/5 rounded-none p-4 text-center mb-4">
          <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/40 block tracking-wider font-mono">Suggested Daily Intake</span>
          <span className="text-2xl font-black text-[#1A1A1A] mt-1 block">
            {nutritionPlan.dailyCalories} <span className="text-xs text-[#1A1A1A]/60 font-semibold">kcal / day</span>
          </span>
        </div>

        {/* Macro visualizer bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-bold text-[#1A1A1A]/80 mb-1">
              <span>Protein (Build/Maintain)</span>
              <span className="text-[#E63946] font-bold">{nutritionPlan.macros.protein}g ({pPct}%)</span>
            </div>
            <div className="w-full h-1.5 bg-[#F9F8F6] border border-[#1A1A1A]/5 rounded-none overflow-hidden">
              <div style={{ width: `${pPct}%` }} className="h-full bg-[#E63946]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#1A1A1A]/80 mb-1">
              <span>Carbohydrates (Energy)</span>
              <span className="text-[#1A1A1A] font-bold">{nutritionPlan.macros.carbs}g ({cPct}%)</span>
            </div>
            <div className="w-full h-1.5 bg-[#F9F8F6] border border-[#1A1A1A]/5 rounded-none overflow-hidden">
              <div style={{ width: `${cPct}%` }} className="h-full bg-[#1A1A1A]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#1A1A1A]/80 mb-1">
              <span>Fats (Hormonal Health)</span>
              <span className="text-[#1A1A1A]/60 font-bold">{nutritionPlan.macros.fat}g ({fPct}%)</span>
            </div>
            <div className="w-full h-1.5 bg-[#F9F8F6] border border-[#1A1A1A]/5 rounded-none overflow-hidden">
              <div style={{ width: `${fPct}%` }} className="h-full bg-[#1A1A1A]/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines text list */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 mb-6">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
          <FileText className="w-4 h-4 text-[#E63946]" />
          Nutritional Guidelines
        </h3>
        <div className="space-y-2.5">
          {nutritionPlan.guidelines.map((line, idx) => (
            <div key={idx} className="flex gap-2 text-xs text-[#1A1A1A]/70 bg-[#F9F8F6]/30 p-2.5 rounded-none border border-[#1A1A1A]/5 leading-relaxed font-serif italic">
              <Heart className="w-4 h-4 text-[#E63946] flex-shrink-0 mt-0.5" />
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Meal Schedule Suggestions */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 mb-6">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
          <Compass className="w-4 h-4 text-[#E63946]" />
          Ideal Meal Schedule
        </h3>
        <div className="space-y-3">
          {nutritionPlan.mealSuggestions.map((meal, idx) => (
            <div key={idx} className="flex justify-between items-center gap-3 bg-[#F9F8F6] p-3 rounded-none border border-[#1A1A1A]/5">
              <div>
                <span className="text-[8px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider font-mono">
                  {meal.mealType}
                </span>
                <h4 className="text-xs font-bold uppercase tracking-tight text-[#1A1A1A] mt-0.5 leading-snug">
                  {meal.name}
                </h4>
                <p className="text-[10px] text-[#1A1A1A]/60 mt-0.5 leading-relaxed font-serif italic">
                  {meal.description}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="block text-xs font-bold text-[#1A1A1A]">{meal.calories} kcal</span>
                <span className="text-[10px] text-[#E63946] font-semibold font-mono">{meal.proteinGrams}g Pro</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders History List */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 mb-6">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
          <ShoppingBag className="w-4 h-4 text-[#E63946]" />
          Paid Orders History
        </h3>
        {orderHistory.length === 0 ? (
          <div className="text-center py-6 text-[#1A1A1A]/40 text-xs font-serif italic">
            No completed purchases yet. Preps ordered or gear bought will appear here!
          </div>
        ) : (
          <div className="space-y-3">
            {orderHistory.map((ord) => (
              <div key={ord.id} className="p-3 bg-[#F9F8F6] border border-[#1A1A1A]/5 rounded-none text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1A1A1A] tracking-tight">{ord.id}</span>
                  <span className="text-[9px] uppercase font-bold text-white bg-[#E63946] px-2 py-0.5 rounded-none">
                    {ord.status}
                  </span>
                </div>
                
                {/* List item items */}
                <div className="text-[10px] text-[#1A1A1A]/60 space-y-0.5 font-serif italic">
                  {ord.items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate max-w-[200px]">• {item.name} (x{item.quantity})</span>
                      <span className="font-bold text-[#1A1A1A]">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#1A1A1A]/10 pt-1.5 flex justify-between items-center text-[10px]">
                  <span className="text-[#1A1A1A]/40">{ord.date}</span>
                  <span className="font-bold text-[#1A1A1A]">Paid Total: ${ord.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Settings buttons */}
      <div className="pt-4 border-t border-[#1A1A1A]/10 flex flex-col gap-3">
        <button
          id="btn-trigger-reset"
          onClick={handleResetConfirm}
          className="w-full py-3 bg-white border border-[#1A1A1A]/15 hover:border-[#1A1A1A] text-red-600 text-xs font-bold rounded-none flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-widest"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Assessment Questionnaire
        </button>
      </div>
    </div>
  );
}
