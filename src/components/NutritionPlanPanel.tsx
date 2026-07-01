import { useMemo, useState } from "react";
import {
  PieChart,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Pill,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
// A-24: targeted imports — types from schemas, functions from nutrition.
// Avoids the engine barrel so the assessment + adaptiveTdee modules don't
// get pulled into this panel's bundle graph unnecessarily.
import type { NutritionPlan, DailyWeightLog } from "../engine/schemas";
import { recommendAdjustment, applyMacroAdjustment } from "../engine/nutrition";
import { toast } from "./Toast";

interface NutritionPlanPanelProps {
  /** The cached engine NutritionPlan. */
  plan: NutritionPlan;
  /** Daily weight logs (for adjustment recommendations). */
  weightLogs: DailyWeightLog[];
  /** Called when the user applies a recommended adjustment. */
  onApplyAdjustment: (updatedPlan: NutritionPlan) => void;
}

/**
 * Nutrition Plan Panel — surfaces the engine's NutritionPlan with:
 *   - Phase + target calories + macro breakdown
 *   - Alpert ceiling + weekly loss cap (for cuts)
 *   - Fiber + fruit/veg targets
 *   - Supplement stack
 *   - Adjustment recommendations (from recommendAdjustment)
 *   - Manual adjustment entry
 *   - Adjustment history
 *
 * Implements Step 5 of IMPLEMENTATION_REPORT.md next steps.
 */
export default function NutritionPlanPanel({
  plan,
  weightLogs,
  onApplyAdjustment,
}: NutritionPlanPanelProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [manualDelta, setManualDelta] = useState("");
  const [manualReason, setManualReason] = useState("");

  // Compute adjustment recommendation from observed weight data.
  const recommendation = useMemo(() => {
    return recommendAdjustment({ plan, daily_weights: weightLogs });
  }, [plan, weightLogs]);

  // Macro % for display
  const pPct = Math.round(plan.macro_pct_calories.protein * 100);
  const fPct = Math.round(plan.macro_pct_calories.fat * 100);
  const cPct = Math.round(plan.macro_pct_calories.carbs * 100);

  const handleApplyRecommended = () => {
    if (!recommendation?.eligible || recommendation.delta_kcal === 0) {
      toast.info("No adjustment to apply", recommendation?.reason ?? "—");
      return;
    }
    const updated = applyMacroAdjustment({
      plan,
      delta_kcal: recommendation.delta_kcal,
      reason: recommendation.reason,
    });
    onApplyAdjustment(updated);
    toast.success(
      "Adjustment applied",
      `${recommendation.delta_kcal > 0 ? "+" : ""}${recommendation.delta_kcal.toFixed(0)} kcal/day. New target: ${updated.target_calories_kcal} kcal.`,
    );
  };

  const handleApplyManual = () => {
    const delta = parseFloat(manualDelta);
    if (Number.isNaN(delta) || delta === 0) {
      toast.error("Invalid delta", "Enter a non-zero number of kcal/day to adjust.");
      return;
    }
    const reason = manualReason.trim() || `Manual adjustment of ${delta > 0 ? "+" : ""}${delta} kcal`;
    const updated = applyMacroAdjustment({ plan, delta_kcal: delta, reason });
    onApplyAdjustment(updated);
    setManualDelta("");
    setManualReason("");
    toast.success("Manual adjustment applied", `New target: ${updated.target_calories_kcal} kcal/day.`);
  };

  const phaseLabel = phaseToLabel(plan.phase);
  const daysUntilEligible = daysBetween(new Date().toISOString().slice(0, 10), plan.next_adjustment_eligible_date);

  return (
    <div className="space-y-4">
      {/* Phase + calories header */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#E63946]" />
            Engine Nutrition Plan
          </h3>
          <span className="text-[9px] uppercase font-bold text-white bg-[#E63946] px-2 py-1 rounded-none tracking-wider">
            {phaseLabel}
          </span>
        </div>

        <div className="bg-[#F9F8F6] border border-[#1A1A1A]/5 rounded-none p-3 text-center mb-3">
          <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/40 block tracking-wider font-mono">
            Target Daily Intake
          </span>
          <span className="text-2xl font-black text-[#1A1A1A] mt-1 block">
            {plan.target_calories_kcal}{" "}
            <span className="text-xs text-[#1A1A1A]/60 font-semibold">kcal / day</span>
          </span>
          <span className="text-[10px] text-[#1A1A1A]/60 font-mono mt-0.5 block">
            TDEE {plan.tdee_kcal} · Δ {plan.calorie_delta_kcal >= 0 ? "+" : ""}
            {plan.calorie_delta_kcal} kcal
          </span>
        </div>

        {/* Macro bars */}
        <div className="space-y-2.5">
          <MacroBar
            label="Protein"
            sublabel={`${plan.protein_g}g · ${plan.protein_rate_g_per_lb.toFixed(2)} g/lb`}
            pct={pPct}
            color="bg-[#E63946]"
            icon={<Beef className="w-3 h-3" />}
          />
          <MacroBar
            label="Carbs"
            sublabel={`${plan.carb_g}g`}
            pct={cPct}
            color="bg-[#1A1A1A]"
            icon={<Wheat className="w-3 h-3" />}
          />
          <MacroBar
            label="Fat"
            sublabel={`${plan.fat_g}g · ${(plan.fat_pct_of_calories * 100).toFixed(0)}%`}
            pct={fPct}
            color="bg-[#1A1A1A]/40"
            icon={<Droplet className="w-3 h-3" />}
          />
        </div>

        {/* Caps row */}
        <div className="grid grid-cols-3 gap-1 mt-3 text-[9px] font-mono">
          <CapPill label="Floor" value={`${plan.calorie_floor_kcal} kcal`} />
          {plan.alpert_max_deficit_kcal !== undefined && (
            <CapPill label="Alpert cap" value={`${Math.round(plan.alpert_max_deficit_kcal)} kcal`} />
          )}
          {plan.phase === "cut" && (
            <CapPill label="Loss cap" value={`${plan.weekly_loss_cap_lb.toFixed(2)} lb/wk`} />
          )}
        </div>
      </div>

      {/* Adjustment recommendation */}
      <div
        className={`bg-white border rounded-none p-4 ${
          recommendation?.eligible && recommendation.delta_kcal !== 0
            ? "border-amber-300"
            : "border-[#1A1A1A]/10"
        }`}
      >
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
          <TrendingUp className="w-4 h-4 text-[#E63946]" />
          Adjustment Recommendation
        </h3>

        {recommendation?.eligible ? (
          <>
            <div className="flex items-start gap-2 mb-3">
              {recommendation.delta_kcal === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : recommendation.delta_kcal > 0 ? (
                <TrendingUp className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <TrendingDown className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-xs text-[#1A1A1A]/80 font-bold">
                  {recommendation.delta_kcal === 0
                    ? "On target"
                    : `${recommendation.delta_kcal > 0 ? "Add" : "Reduce"} ${Math.abs(recommendation.delta_kcal).toFixed(0)} kcal/day`}
                </p>
                <p className="text-[10px] text-[#1A1A1A]/60 font-serif italic mt-0.5">
                  {recommendation.reason}
                </p>
              </div>
            </div>
            {recommendation.delta_kcal !== 0 && (
              <button
                type="button"
                onClick={handleApplyRecommended}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-none uppercase tracking-widest transition-all"
              >
                Apply Recommended Adjustment
              </button>
            )}
          </>
        ) : (
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-[#1A1A1A]/40 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-[#1A1A1A]/60 font-bold">Not yet eligible</p>
              <p className="text-[10px] text-[#1A1A1A]/50 font-serif italic mt-0.5">
                {recommendation?.reason ?? "—"}
              </p>
              {daysUntilEligible > 0 && (
                <p className="text-[9px] text-[#1A1A1A]/40 font-mono mt-1">
                  Next eligible in {daysUntilEligible} day(s) ({plan.next_adjustment_eligible_date})
                </p>
              )}
            </div>
          </div>
        )}

        {/* Manual adjustment */}
        <div className="mt-4 pt-3 border-t border-[#1A1A1A]/5">
          <div className="text-[8px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider font-mono mb-2">
            Manual Adjustment
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              step="10"
              value={manualDelta}
              onChange={(e) => setManualDelta(e.target.value)}
              placeholder="±kcal"
              className="engine-input w-20"
            />
            <input
              type="text"
              value={manualReason}
              onChange={(e) => setManualReason(e.target.value)}
              placeholder="Reason (optional)"
              className="engine-input flex-1"
            />
            <button
              type="button"
              onClick={handleApplyManual}
              className="px-3 py-2 bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold rounded-none uppercase tracking-widest transition-all"
            >
              Apply
            </button>
          </div>
          <p className="text-[9px] text-[#1A1A1A]/50 mt-1 font-serif italic">
            Negative = reduce (cut troubleshooting). Positive = add (bulk stalling).
            Macros adjust automatically (protein held constant; carbs:fats split per phase).
          </p>
        </div>
      </div>

      {/* Micronutrients */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
          <PieChart className="w-4 h-4 text-[#E63946]" />
          Micronutrient Targets
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <MetricBox label="Fiber" value={`${plan.fiber_target_g} g`} sub="14 g / 1000 kcal" />
          <MetricBox label="Fruit" value={`${plan.fruit_cups_per_day} cups`} sub="per day" />
          <MetricBox label="Veg" value={`${plan.veg_cups_per_day} cups`} sub="per day" />
        </div>
      </div>

      {/* Supplement stack */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
          <Pill className="w-4 h-4 text-[#E63946]" />
          Supplement Stack
        </h3>
        <div className="space-y-1.5">
          {plan.supplements.map((s, i) => (
            <div key={`supp-${i}-${s.name}`} className="flex justify-between items-center bg-[#F9F8F6] p-2 border border-[#1A1A1A]/5">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-[#1A1A1A] block">{s.name}</span>
                <span className="text-[9px] text-[#1A1A1A]/60 font-serif italic block">{s.rationale}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#E63946] flex-shrink-0 ml-2">{s.daily_dose}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Adjustment history */}
      {plan.adjustment_history.length > 0 && (
        <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#E63946]" />
              Adjustment History ({plan.adjustment_history.length})
            </h3>
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showHistory && (
            <div className="mt-3 space-y-1.5">
              {plan.adjustment_history
                .slice()
                .reverse()
                .map((entry, i) => (
                  <div key={`adj-${i}-${entry.date}`} className="flex justify-between items-center bg-[#F9F8F6] p-2 border border-[#1A1A1A]/5 text-[10px]">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[#1A1A1A]/60">{entry.date}</span>
                      <span className="font-serif italic text-[#1A1A1A]/70 ml-2">{entry.reason}</span>
                    </div>
                    <span
                      className={`font-mono font-bold flex-shrink-0 ml-2 ${
                        entry.delta_kcal > 0 ? "text-emerald-600" : "text-[#E63946]"
                      }`}
                    >
                      {entry.delta_kcal > 0 ? "+" : ""}
                      {entry.delta_kcal.toFixed(0)} kcal
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Tolerance footer */}
      <div className="bg-[#E63946]/5 border border-[#E63946]/15 p-3 rounded-none flex items-start gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-[#E63946] flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-[#1A1A1A]/70 font-serif italic leading-relaxed">
          Tolerance: ±{(plan.macro_tolerance_pct * 100).toFixed(0)}% per macro, {(plan.tolerance_compliance_target_pct * 100).toFixed(0)}% of time.
          {plan.last_adjustment_date && (
            <> Last adjusted {plan.last_adjustment_date}.</>
          )}
        </p>
      </div>
    </div>
  );
}

// --- sub-components ---

function MacroBar({
  label,
  sublabel,
  pct,
  color,
  icon,
}: {
  label: string;
  sublabel: string;
  pct: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold text-[#1A1A1A]/80 mb-1">
        <span className="flex items-center gap-1">
          {icon}
          {label}
        </span>
        <span className="text-[#1A1A1A] font-mono text-[10px]">{sublabel} ({pct}%)</span>
      </div>
      <div className="w-full h-1.5 bg-[#F9F8F6] border border-[#1A1A1A]/5 rounded-none overflow-hidden">
        <div style={{ width: `${Math.max(2, pct)}%` }} className={`h-full ${color}`} />
      </div>
    </div>
  );
}

function CapPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#F9F8F6] p-1.5 border border-[#1A1A1A]/5 text-center">
      <span className="block text-[8px] uppercase text-[#1A1A1A]/40">{label}</span>
      <span className="text-[10px] font-bold text-[#1A1A1A]">{value}</span>
    </div>
  );
}

function MetricBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#F9F8F6] p-2 border border-[#1A1A1A]/5 text-center">
      <span className="block text-[8px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider font-mono">
        {label}
      </span>
      <span className="text-sm font-bold text-[#1A1A1A] block mt-0.5">{value}</span>
      {sub && <span className="text-[8px] text-[#1A1A1A]/50 font-mono">{sub}</span>}
    </div>
  );
}

// --- helpers ---

function phaseToLabel(phase: NutritionPlan["phase"]): string {
  switch (phase) {
    case "cut":
      return "Cut";
    case "bulk":
      return "Bulk";
    case "recomp":
      return "Recomp";
    case "maintain":
      return "Maintain";
    case "reverse_diet":
      return "Reverse Diet";
    default:
      return phase;
  }
}

function daysBetween(fromDate: string, toDate: string): number {
  const from = new Date(fromDate).getTime();
  const to = new Date(toDate).getTime();
  return Math.ceil((to - from) / (1000 * 60 * 60 * 24));
}
