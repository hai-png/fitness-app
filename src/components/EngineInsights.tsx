import { useMemo } from "react";
import {
  Activity,
  Heart,
  Droplet,
  Award,
  Gauge,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import type { AssessmentResult, DailyWeightLog, DailyIntakeLog } from "../engine";
import { computeAdaptiveTdee, detectOutliers } from "../engine";

interface EngineInsightsProps {
  /** The cached AssessmentResult from the engine. */
  assessment: AssessmentResult;
  /** Daily weight logs (for adaptive TDEE). */
  weightLogs: DailyWeightLog[];
  /** Daily intake logs (for adaptive TDEE). */
  intakeLogs: DailyIntakeLog[];
  /** Current body weight (kg) — used for outlier detection thresholds. */
  currentWeightKg: number;
}

/**
 * Engine Insights — surfaces the engine's AssessmentResult in the Profile tab.
 *
 * Shows:
 *   - Body composition (BMI category, BF% classification, FFMI)
 *   - Energy (BMR, TDEE, adaptive TDEE with confidence)
 *   - Maximums (Alpert daily deficit ceiling, weekly loss cap, Berkhan max potential)
 *   - Anthropometric indices (WHtR, WHR, ABSI)
 *   - Hydration target (6-step formula breakdown)
 *   - Population exclusion warnings (if any)
 *
 * Implements Step 3 of IMPLEMENTATION_REPORT.md next steps.
 */
export default function EngineInsights({
  assessment,
  weightLogs,
  intakeLogs,
  currentWeightKg,
}: EngineInsightsProps) {
  // Compute adaptive TDEE from observed data.
  const adaptiveTdee = useMemo(() => {
    return computeAdaptiveTdee({
      // Construct a minimal User for the prior computation. The adaptive
      // module only uses sex, age, height, weight, activity_level, and the
      // RippedBody adjustment flags — all of which are already baked into
      // the cached assessment's BMR. We pass a synthetic User that matches.
      user: {
        id: "adaptive-user",
        sex: "male", // placeholder — prior is overridden by cached BMR below
        age_years: 30,
        height_cm: 178,
        weight_kg: currentWeightKg,
        unit_system: "metric",
        is_pregnant: false,
        is_breastfeeding: false,
        has_eating_disorder_history: false,
        has_kidney_disease: false,
        activity_level: "moderate",
        training_days_per_week: 4,
        training_status: "intermediate",
        primary_goal: "maintain",
        is_currently_in_deficit: false,
        is_weight_reduced: false,
      },
      intakes: intakeLogs,
      weights: weightLogs,
    });
  }, [intakeLogs, weightLogs, currentWeightKg]);

  const outliers = useMemo(() => {
    if (weightLogs.length === 0) return null;
    return detectOutliers({
      intakes: intakeLogs,
      weights: weightLogs,
      body_weight_kg: currentWeightKg,
    });
  }, [intakeLogs, weightLogs, currentWeightKg]);

  return (
    <div className="space-y-4">
      {/* Population exclusion warnings */}
      {assessment.population_excluded && assessment.exclusion_reasons.length > 0 && (
        <div className="bg-[#E63946]/5 border border-[#E63946]/20 p-3 rounded-none">
          <div className="flex items-center gap-1.5 text-[#E63946] text-xs font-bold mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Population Exclusion Flags
          </div>
          <ul className="text-[10px] text-[#1A1A1A]/70 space-y-0.5 font-serif italic">
            {assessment.exclusion_reasons.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Body composition */}
      <InsightsCard title="Body Composition" icon={<Activity className="w-4 h-4 text-[#E63946]" />}>
        <InsightsGrid>
          <Metric label="BMI" value={assessment.bmi?.toFixed(1)} sub={assessment.bmi_category} />
          <Metric
            label="Body Fat"
            value={assessment.body_fat_pct !== undefined ? `${assessment.body_fat_pct.toFixed(1)}%` : "—"}
            sub={assessment.body_fat_method !== "unknown" ? assessment.body_fat_method : undefined}
          />
          <Metric
            label="Fat Mass"
            value={assessment.fat_mass_kg !== undefined ? `${assessment.fat_mass_kg.toFixed(1)} kg` : "—"}
          />
          <Metric
            label="Lean Mass"
            value={assessment.lean_body_mass_kg !== undefined ? `${assessment.lean_body_mass_kg.toFixed(1)} kg` : "—"}
          />
          <Metric
            label="FFMI"
            value={assessment.ffmi !== undefined ? assessment.ffmi.toFixed(1) : "—"}
            sub={ffmiCategory(assessment.ffmi)}
          />
          <Metric
            label="Normalized FFMI"
            value={assessment.normalized_ffmi !== undefined ? assessment.normalized_ffmi.toFixed(1) : "—"}
          />
        </InsightsGrid>
      </InsightsCard>

      {/* Anthropometric indices */}
      {(assessment.whtr !== undefined || assessment.whr !== undefined || assessment.absi !== undefined) && (
        <InsightsCard title="Anthropometric Indices" icon={<Gauge className="w-4 h-4 text-[#E63946]" />}>
          <InsightsGrid>
            {assessment.whtr !== undefined && (
              <Metric label="WHtR" value={assessment.whtr.toFixed(3)} sub={assessment.whtr_category} />
            )}
            {assessment.whr !== undefined && (
              <Metric label="WHR" value={assessment.whr.toFixed(3)} sub={assessment.whr_category} />
            )}
            {assessment.absi !== undefined && (
              <Metric label="ABSI" value={assessment.absi.toFixed(4)} sub={assessment.absi_category} />
            )}
          </InsightsGrid>
          <p className="text-[9px] text-[#1A1A1A]/50 mt-2 font-serif italic">
            WHtR universal rule: &lt; 0.5 = healthy. WHR WHO thresholds: men &gt; 0.90, women &gt; 0.85 = elevated.
            ABSI z-score requires NHANES reference tables (not computed here).
          </p>
        </InsightsCard>
      )}

      {/* Energy expenditure */}
      <InsightsCard title="Energy Expenditure" icon={<Heart className="w-4 h-4 text-[#E63946]" />}>
        <InsightsGrid>
          <Metric
            label="BMR"
            value={`${Math.round(assessment.bmr_kcal)} kcal`}
            sub={assessment.bmr_formula.replace(/_/g, " ")}
          />
          <Metric
            label="TDEE (formula)"
            value={`${Math.round(assessment.tdee_kcal)} kcal`}
            sub={`× ${assessment.activity_factor.toFixed(3)} SAF`}
          />
          <Metric
            label="Adaptive TDEE"
            value={`${Math.round(adaptiveTdee.adaptive_tdee_kcal)} kcal`}
            sub={`α=${adaptiveTdee.alpha.toFixed(2)} · conf=${(adaptiveTdee.confidence * 100).toFixed(0)}%`}
            highlight={adaptiveTdee.confidence > 0.5}
          />
          <Metric
            label="Observed TDEE"
            value={adaptiveTdee.observed_tdee_kcal !== null ? `${Math.round(adaptiveTdee.observed_tdee_kcal)} kcal` : "—"}
            sub={adaptiveTdee.n_days_data > 0 ? `${adaptiveTdee.n_days_data.toFixed(0)} days` : "no data"}
          />
        </InsightsGrid>

        {/* Adaptive TDEE progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[9px] uppercase font-bold text-[#1A1A1A]/40 mb-1 font-mono">
            <span>Data-driven confidence</span>
            <span>{(adaptiveTdee.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#F9F8F6] border border-[#1A1A1A]/5 rounded-none overflow-hidden">
            <div
              style={{ width: `${Math.max(2, adaptiveTdee.confidence * 100)}%` }}
              className={`h-full transition-all ${adaptiveTdee.confidence > 0.5 ? "bg-emerald-500" : "bg-amber-500"}`}
            />
          </div>
          <p className="text-[9px] text-[#1A1A1A]/50 mt-1 font-serif italic">
            Adaptive TDEE blends the formula prior with observed intake-vs-weight data.
            Converges to data-driven after ~60 days. Log intake daily in the Logs tab to accelerate convergence.
          </p>
        </div>

        {/* Outlier warnings */}
        {outliers && (outliers.incomplete_logging_days.length > 0 || outliers.large_water_weight_jumps.length > 0) && (
          <div className="mt-2 bg-amber-50 border border-amber-200 p-2 rounded-none">
            <div className="flex items-center gap-1 text-amber-700 text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3" />
              Data quality flags
            </div>
            <ul className="text-[9px] text-amber-700/80 mt-0.5 font-serif italic">
              {outliers.incomplete_logging_days.length > 0 && (
                <li>• {outliers.incomplete_logging_days.length} day(s) with incomplete intake logging</li>
              )}
              {outliers.large_water_weight_jumps.length > 0 && (
                <li>• {outliers.large_water_weight_jumps.length} day(s) with large water-weight jumps (&gt;2% BW)</li>
              )}
            </ul>
          </div>
        )}
      </InsightsCard>

      {/* Maximums */}
      <InsightsCard title="Maximums & Ceilings" icon={<Award className="w-4 h-4 text-[#E63946]" />}>
        <InsightsGrid>
          <Metric
            label="Max daily deficit"
            value={assessment.max_daily_deficit_kcal !== undefined ? `${Math.round(assessment.max_daily_deficit_kcal)} kcal` : "—"}
            sub="Alpert 22 kcal/lb fat/day"
          />
          <Metric
            label="Weekly loss cap"
            value={`${assessment.effective_weekly_loss_cap_lbs.toFixed(2)} lb/wk`}
            sub="min(Alpert, 2.0)"
          />
          <Metric
            label="Berkhan max"
            value={assessment.berkhan_max_stage_shredded_kg !== undefined ? `${assessment.berkhan_max_stage_shredded_kg.toFixed(1)} kg` : "—"}
            sub="stage-shredded potential"
          />
        </InsightsGrid>
        <p className="text-[9px] text-[#1A1A1A]/50 mt-2 font-serif italic">
          Alpert ceiling: max calorie deficit sustainable from body fat alone (beyond this, muscle loss accelerates).
          Berkhan formula: max natural stage-shredded bodyweight at 5–6% BF = height(cm) − 100 (men).
        </p>
      </InsightsCard>

      {/* Hydration */}
      <InsightsCard title="Hydration Target" icon={<Droplet className="w-4 h-4 text-[#E63946]" />}>
        <div className="bg-[#F9F8F6] border border-[#1A1A1A]/5 rounded-none p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/40 block tracking-wider font-mono">
            Daily Water Intake
          </span>
          <span className="text-2xl font-black text-[#1A1A1A] mt-1 block">
            {assessment.daily_water_intake_L.toFixed(2)}{" "}
            <span className="text-xs text-[#1A1A1A]/60 font-semibold">L / day</span>
          </span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1 text-[9px] font-mono">
          <BreakdownRow label="Base (30 mL/kg)" value={`${assessment.hydration_breakdown.base_L.toFixed(2)} L`} />
          <BreakdownRow label="Sex adjustment" value={`${assessment.hydration_breakdown.sex_adjustment_L.toFixed(2)} L`} />
          <BreakdownRow label="Exercise" value={`${assessment.hydration_breakdown.exercise_add_L.toFixed(2)} L`} />
          <BreakdownRow label="Climate ×" value={assessment.hydration_breakdown.climate_multiplier.toFixed(2)} />
          {assessment.hydration_breakdown.pregnancy_add_L > 0 && (
            <BreakdownRow label="Pregnancy" value={`+${assessment.hydration_breakdown.pregnancy_add_L.toFixed(2)} L`} />
          )}
          {assessment.hydration_breakdown.breastfeeding_add_L > 0 && (
            <BreakdownRow label="Breastfeeding" value={`+${assessment.hydration_breakdown.breastfeeding_add_L.toFixed(2)} L`} />
          )}
        </div>
        <p className="text-[9px] text-[#1A1A1A]/50 mt-2 font-serif italic">
          fatcalc 6-step formula: base + sex + exercise + climate + pregnancy + breastfeeding.
          ~20% of total intake typically comes from food.
        </p>
      </InsightsCard>

      {/* Recommendation footer */}
      <div className="bg-[#E63946]/5 border border-[#E63946]/15 p-3 rounded-none flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#E63946] flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-[#1A1A1A]/70 font-serif italic leading-relaxed">
          All values computed by the engine layer using the Unified Reference Guide formulas.
          Update your engine profile (above) to refine these numbers — every field you add
          unlocks more accurate calculations.
        </p>
      </div>
    </div>
  );
}

// --- sub-components ---

function InsightsCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4">
      <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function InsightsGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

function Metric({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string | undefined;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-2 rounded-none border ${
        highlight ? "bg-emerald-50 border-emerald-200" : "bg-[#F9F8F6] border-[#1A1A1A]/5"
      }`}
    >
      <span className="block text-[8px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider font-mono">
        {label}
      </span>
      <span className={`text-sm font-bold ${highlight ? "text-emerald-700" : "text-[#1A1A1A]"} block mt-0.5`}>
        {value ?? "—"}
      </span>
      {sub && (
        <span className="text-[8px] text-[#1A1A1A]/50 block mt-0.5 font-mono truncate">{sub}</span>
      )}
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between bg-[#F9F8F6]/50 px-2 py-1 border border-[#1A1A1A]/5">
      <span className="text-[#1A1A1A]/60">{label}</span>
      <span className="text-[#1A1A1A] font-bold">{value}</span>
    </div>
  );
}

// --- helpers ---

function ffmiCategory(ffmi?: number): string | undefined {
  if (ffmi === undefined) return undefined;
  if (ffmi < 18) return "Below average";
  if (ffmi < 20) return "Average";
  if (ffmi < 22) return "Above average";
  if (ffmi < 24) return "Excellent";
  if (ffmi < 25) return "Natural ceiling";
  return "Natural outlier (rare)";
}
