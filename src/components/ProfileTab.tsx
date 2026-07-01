import { useState, useMemo } from "react";
// A-24: targeted type-only imports from schemas — ProfileTab is a type-only
// consumer of the engine. Using the targeted module path lets the bundler
// elide this statement at build time and keeps the engine barrel (which
// re-exports assessment/nutrition/adaptiveTdee) out of this bundle.
import type {
  OnboardingInput,
  NutritionPlan,
  Order,
  EngineProfile,
} from "../engine/schemas";
import { toast, confirmDialog } from "./Toast";
import AssessmentSettings from "./AssessmentSettings";
import EngineInsights from "./EngineInsights";
import NutritionPlanPanel from "./NutritionPlanPanel";
import { useUserStore } from "../store/useUserStore";
import { useLogsStore } from "../store/useLogsStore";
import { useIntakeStore } from "../store/useIntakeStore";
import { useEngine } from "../store/useEngine";
import { generateMealSuggestions } from "../data/planGenerator";
import {
  User,
  Heart,
  RefreshCw,
  FileText,
  ShoppingBag,
  Compass,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface ProfileTabProps {
  assessment: OnboardingInput;
  nutritionPlan: NutritionPlan | null;
  orderHistory: Order[];
  onResetOnboarding: () => void;
}

export default function ProfileTab({
  assessment,
  nutritionPlan,
  orderHistory,
  onResetOnboarding,
}: ProfileTabProps) {
  const engineProfile = useUserStore((s) => s.engineProfile);
  const updateEngineProfile = useUserStore((s) => s.updateEngineProfile);
  const clearEngineCaches = useUserStore((s) => s.clearEngineCaches);

  const [formResetKey, setFormResetKey] = useState(0);

  const weightLogs = useLogsStore((s) => s.weightLogs);
  const intakeLogs = useIntakeStore((s) => s.intakeLogs);

  const { assessmentResult, nutritionPlan: engineNutritionPlan, applyAdjustment } = useEngine();

  // Generate meal suggestions from the engine nutrition plan.
  const mealSuggestions = useMemo(() => {
    if (!nutritionPlan) return [];
    return generateMealSuggestions({
      input: assessment,
      targetCalories: nutritionPlan.target_calories_kcal,
      proteinG: nutritionPlan.protein_g,
    });
  }, [nutritionPlan, assessment]);

  // Generate guidelines from the engine nutrition plan.
  const guidelines = useMemo(() => {
    if (!nutritionPlan) return [];
    const lines: string[] = [
      `Consume ${nutritionPlan.protein_g}g of protein daily to support muscle recovery and satiety.`,
      `Aim to consume your largest carbohydrate meal within 2 hours after your workout.`,
      `Maintain strict hydration by drinking at least ${Math.round(nutritionPlan.tdee_kcal / 1000 * 0.7)} liters of fresh water daily.`,
      `Fiber target: ${nutritionPlan.fiber_target_g}g/day. Fruit: ${nutritionPlan.fruit_cups_per_day} cups. Veg: ${nutritionPlan.veg_cups_per_day} cups.`,
    ];
    if (assessment.dietType === "vegan") {
      lines.push("Supplement with B12 daily and combine pea/brown-rice protein sources for a complete amino profile.");
    }
    if (assessment.allergies) {
      lines.push(`Strictly verify all food labels to remain completely free of: ${assessment.allergies}.`);
    }
    const phaseLabel = nutritionPlan.phase === "cut" ? "Fat-loss phase" :
      nutritionPlan.phase === "bulk" ? "Muscle-building phase" :
      nutritionPlan.phase === "recomp" ? "Recomposition phase" : "Maintenance phase";
    lines.push(
      `${phaseLabel}: target ${nutritionPlan.target_calories_kcal} kcal/day ` +
      `(${nutritionPlan.calorie_delta_kcal >= 0 ? "+" : ""}${nutritionPlan.calorie_delta_kcal} from TDEE ${nutritionPlan.tdee_kcal}).`,
    );
    if (nutritionPlan.alpert_max_deficit_kcal !== undefined) {
      lines.push(
        `Max safe deficit: ${Math.round(nutritionPlan.alpert_max_deficit_kcal)} kcal/day ` +
        `(Alpert ceiling). Weekly loss cap: ${nutritionPlan.weekly_loss_cap_lb.toFixed(2)} lb/wk.`,
      );
    }
    return lines;
  }, [nutritionPlan, assessment]);

  const handleResetConfirm = async () => {
    const ok = await confirmDialog({
      title: "Reset everything?",
      message:
        "Are you sure you want to reset your training split, nutritional targets, and clear active plans? This will return you to the onboarding questionnaire.",
      confirmLabel: "Reset All",
      cancelLabel: "Keep My Data",
      destructive: true,
    });
    if (ok) {
      onResetOnboarding();
      toast.success("Reset complete", "You're back at the onboarding questionnaire.");
    }
  };

  const handleSaveProfile = (partial: Partial<EngineProfile>) => {
    updateEngineProfile(partial);
    setFormResetKey((k) => k + 1);
  };

  const handleClearProfile = () => {
    updateEngineProfile({
      body_fat_pct: undefined,
      body_fat_method: undefined,
      waist_cm: undefined,
      hip_cm: undefined,
      neck_cm: undefined,
      all_time_high_weight_kg: undefined,
      sleep_hours_avg: undefined,
      stress_0_5: undefined,
      is_currently_in_deficit: undefined,
    });
    clearEngineCaches();
    setFormResetKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6] text-[#1A1A1A] overflow-y-auto p-4 md:p-6 pb-24">
      <div className="mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E63946] underline underline-offset-4 block mb-2">
          05 — Coaching HQ
        </span>
        <h1 className="text-3xl font-serif font-black italic text-[#1A1A1A] mt-3 tracking-tight">
          Coaching HQ & Profile
        </h1>
      </div>

      {assessmentResult && engineNutritionPlan && (
        <div className="bg-gradient-to-r from-[#E63946]/10 to-[#E63946]/5 border border-[#E63946]/20 p-3 rounded-none mb-6 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-[#E63946] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-[#1A1A1A]">
              Engine-powered insights active
            </p>
            <p className="text-[10px] text-[#1A1A1A]/70 font-serif italic mt-0.5">
              Below are evidence-based assessments and nutrition recommendations computed from the
              Unified Reference Guide formulas. Update your engine profile to refine.
            </p>
          </div>
        </div>
      )}

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
            <span className="text-[10px] font-bold text-[#E63946] truncate block uppercase">
              {assessment.dietType}
            </span>
          </div>
        </div>

        {assessment.allergies && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#E63946] bg-[#E63946]/5 px-2.5 py-1.5 border border-[#E63946]/15 rounded-none font-serif italic">
            <AlertTriangle className="w-3.5 h-3.5 text-[#E63946] flex-shrink-0" />
            <span>Allergen Warning: Sensitive to {assessment.allergies}</span>
          </div>
        )}
      </div>

      <AssessmentSettings
        key={formResetKey}
        engineProfile={engineProfile}
        onSave={handleSaveProfile}
        onReset={handleClearProfile}
        fallbackGender={assessment.gender}
      />

      {assessmentResult && (
        <EngineInsights
          assessment={assessmentResult}
          weightLogs={weightLogs}
          intakeLogs={intakeLogs}
          currentWeightKg={assessment.weight}
          onboardingInput={assessment}
          engineProfile={engineProfile}
        />
      )}

      {engineNutritionPlan && (
        <NutritionPlanPanel
          plan={engineNutritionPlan}
          weightLogs={weightLogs}
          onApplyAdjustment={applyAdjustment}
        />
      )}

      {guidelines.length > 0 && (
        <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 mb-6 mt-6">
          <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
            <FileText className="w-4 h-4 text-[#E63946]" />
            Nutritional Guidelines
          </h3>
          <div className="space-y-2.5">
            {guidelines.map((line, idx) => (
              <div
                key={`guideline-${idx}-${line.slice(0, 12)}`}
                className="flex gap-2 text-xs text-[#1A1A1A]/70 bg-[#F9F8F6]/30 p-2.5 rounded-none border border-[#1A1A1A]/5 leading-relaxed font-serif italic"
              >
                <Heart className="w-4 h-4 text-[#E63946] flex-shrink-0 mt-0.5" />
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {mealSuggestions.length > 0 && (
        <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 mb-6">
          <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
            <Compass className="w-4 h-4 text-[#E63946]" />
            Ideal Meal Schedule
          </h3>
          <div className="space-y-3">
            {mealSuggestions.map((meal, idx) => (
              <div
                key={`meal-${idx}-${meal.name.slice(0, 12)}`}
                className="flex justify-between items-center gap-3 bg-[#F9F8F6] p-3 rounded-none border border-[#1A1A1A]/5"
              >
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
                  <span className="text-[10px] text-[#E63946] font-semibold font-mono">
                    {meal.proteinGrams}g Pro
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 mb-6">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
          <ShoppingBag className="w-4 h-4 text-[#E63946]" />
          Paid Orders History
        </h3>
        {orderHistory.length === 0 ? (
          // F-L7 fix: standardized empty state (icon + heading +
          // description + CTA) matching the MarketplaceTab pattern. The
          // original was a single italic line of text with no visual
          // hierarchy, no CTA, and no icon.
          <div className="text-center py-8 px-4 flex flex-col items-center">
            <ShoppingBag className="w-10 h-10 text-[#1A1A1A]/30 mb-2" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/80">
              No Completed Orders Yet
            </h4>
            <p className="text-[10px] text-[#1A1A1A]/60 mt-1 font-serif italic max-w-xs leading-relaxed">
              Preps ordered from the Meals Prep tab and gear purchased from the
              Store will appear here with their delivery status.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orderHistory.map((ord) => (
              <div
                key={ord.id}
                className="p-3 bg-[#F9F8F6] border border-[#1A1A1A]/5 rounded-none text-xs space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1A1A1A] tracking-tight">{ord.id}</span>
                  <span className="text-[9px] uppercase font-bold text-white bg-[#E63946] px-2 py-0.5 rounded-none">
                    {ord.status}
                  </span>
                </div>
                <div className="text-[10px] text-[#1A1A1A]/60 space-y-0.5 font-serif italic">
                  {ord.items.map((item, i) => (
                    <div key={`order-item-${i}-${item.id}`} className="flex justify-between">
                      <span className="truncate max-w-[200px]">
                        • {item.name} (x{item.quantity})
                      </span>
                      <span className="font-bold text-[#1A1A1A]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#1A1A1A]/10 pt-1.5 flex justify-between items-center text-[10px]">
                  <span className="text-[#1A1A1A]/40">{ord.date}</span>
                  <span className="font-bold text-[#1A1A1A]">
                    Paid Total: ${ord.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
