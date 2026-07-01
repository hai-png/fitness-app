import { useState } from "react";
import {
  User,
  Ruler,
  Activity,
  Dumbbell,
  Moon,
  Brain,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  ActivityLevel,
  BodyFatMethod,
  Sex,
  TrainingStatus,
} from "../engine";
import type { EngineProfile } from "../engine/assessment";
import { toast } from "./Toast";

interface AssessmentSettingsProps {
  /** Current engine profile (from useUserStore). */
  engineProfile: EngineProfile;
  /** Caller-provided save handler. Receives the partial update. */
  onSave: (partial: Partial<EngineProfile>) => void;
  /** Caller-provided reset handler. */
  onReset?: () => void;
  /** Legacy gender from Assessment — used as fallback for the sex selector. */
  fallbackGender?: string;
  /**
   * Optional remount key. When this value changes, the component's internal
   * form state is re-initialized from engineProfile. This avoids the
   * setState-in-effect anti-pattern by leveraging React's remount mechanism.
   */
  resetKey?: string | number;
}

/**
 * Assessment Settings — captures the engine-only fields that the legacy
 * Assessment type doesn't have. These fields make the engine's formulas
 * more accurate (e.g. body_fat_pct enables Cunningham RMR + Alpert ceiling;
 * waist/neck/hip enable US Navy BF% + WHtR + WHR + ABSI; all_time_high_weight
 * enables the -3% weight-reduced BMR adjustment).
 *
 * Implements Step 2 of IMPLEMENTATION_REPORT.md next steps.
 *
 * Note: The parent should pass a `resetKey` that changes when the form
 * should re-initialize (e.g. after a save or clear). This triggers a React
 * remount via the `key` prop, avoiding the setState-in-effect anti-pattern.
 */
export default function AssessmentSettings({
  engineProfile,
  onSave,
  onReset,
  fallbackGender,
}: AssessmentSettingsProps) {
  const [expanded, setExpanded] = useState(false);

  // Local form state — synced from engineProfile on mount/changes.
  const [sex, setSex] = useState<Sex | "">(
    engineProfile.sex ?? (fallbackGender ? inferSex(fallbackGender) : ""),
  );
  const [bodyFatPct, setBodyFatPct] = useState<string>(
    engineProfile.body_fat_pct?.toString() ?? "",
  );
  const [bodyFatMethod, setBodyFatMethod] = useState<BodyFatMethod>(
    engineProfile.body_fat_method ?? "manual",
  );
  const [waist, setWaist] = useState<string>(engineProfile.waist_cm?.toString() ?? "");
  const [hip, setHip] = useState<string>(engineProfile.hip_cm?.toString() ?? "");
  const [neck, setNeck] = useState<string>(engineProfile.neck_cm?.toString() ?? "");
  const [allTimeHigh, setAllTimeHigh] = useState<string>(
    engineProfile.all_time_high_weight_kg?.toString() ?? "",
  );
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>(
    engineProfile.training_status ?? "novice",
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    engineProfile.activity_level ?? "moderate",
  );
  const [isInDeficit, setIsInDeficit] = useState<boolean>(
    engineProfile.is_currently_in_deficit ?? false,
  );
  const [sleepHours, setSleepHours] = useState<string>(
    engineProfile.sleep_hours_avg?.toString() ?? "",
  );
  const [stress, setStress] = useState<string>(engineProfile.stress_0_5?.toString() ?? "");

  // NOTE: This component relies on the parent passing a `key` prop (derived
  // from a resetKey) to force a remount when the form should re-initialize
  // after a save/clear. This avoids the setState-in-effect anti-pattern.

  const handleSave = () => {
    const partial: Partial<EngineProfile> = {
      sex: sex || undefined,
      body_fat_pct: bodyFatPct ? clampNum(parseFloat(bodyFatPct), 2, 60) : undefined,
      body_fat_method: bodyFatPct ? bodyFatMethod : undefined,
      waist_cm: waist ? clampNum(parseFloat(waist), 30, 200) : undefined,
      hip_cm: hip ? clampNum(parseFloat(hip), 30, 200) : undefined,
      neck_cm: neck ? clampNum(parseFloat(neck), 20, 80) : undefined,
      all_time_high_weight_kg: allTimeHigh ? clampNum(parseFloat(allTimeHigh), 30, 400) : undefined,
      training_status: trainingStatus,
      activity_level: activityLevel,
      is_currently_in_deficit: isInDeficit,
      sleep_hours_avg: sleepHours ? clampNum(parseFloat(sleepHours), 0, 16) : undefined,
      stress_0_5: stress ? clampNum(parseInt(stress), 0, 5) : undefined,
    };
    onSave(partial);
    toast.success(
      "Engine profile saved",
      "Re-assessment will use these values for more accurate formulas.",
    );
  };

  const handleReset = () => {
    setBodyFatPct("");
    setWaist("");
    setHip("");
    setNeck("");
    setAllTimeHigh("");
    setSleepHours("");
    setStress("");
    setBodyFatMethod("manual");
    setIsInDeficit(false);
    onReset?.();
    toast.info("Engine profile cleared", "Engine will fall back to heuristic defaults.");
  };

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 mb-6">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-[#E63946]" />
          Engine Assessment Settings
        </h3>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[#1A1A1A]/40" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#1A1A1A]/40" />
        )}
      </button>

      {!expanded && (
        <p className="text-[10px] text-[#1A1A1A]/60 mt-2 leading-relaxed font-serif italic">
          Tap to expand. Capture body-fat %, circumferences, training status, and lifestyle
          factors to make the engine&apos;s formulas more accurate.
        </p>
      )}

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Sex */}
          <Field label="Biological sex" icon={<User className="w-3 h-3" />}>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as Sex | "")}
              className="engine-input"
            >
              <option value="">Use legacy gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </Field>

          {/* Body composition */}
          <div className="border-t border-[#1A1A1A]/5 pt-3">
            <div className="text-[8px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider font-mono mb-2">
              Body Composition
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Body fat %" icon={<Activity className="w-3 h-3" />}>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="60"
                  value={bodyFatPct}
                  onChange={(e) => setBodyFatPct(e.target.value)}
                  placeholder="e.g. 18"
                  className="engine-input"
                />
              </Field>
              <Field label="Method" icon={<Activity className="w-3 h-3" />}>
                <select
                  value={bodyFatMethod}
                  onChange={(e) => setBodyFatMethod(e.target.value as BodyFatMethod)}
                  className="engine-input"
                  disabled={!bodyFatPct}
                >
                  <option value="manual">Manual entry</option>
                  <option value="navy">US Navy (circumference)</option>
                  <option value="jp3">Jackson-Pollock 3-site</option>
                  <option value="jp7">Jackson-Pollock 7-site</option>
                  <option value="durnin_womersley">Durnin-Womersley 4-site</option>
                  <option value="cun_bae">CUN-BAE (BMI-based)</option>
                  <option value="dexa">DEXA scan</option>
                  <option value="ai_photo">AI photo analysis</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Circumferences */}
          <div className="border-t border-[#1A1A1A]/5 pt-3">
            <div className="text-[8px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider font-mono mb-2">
              Circumferences (cm)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Waist" icon={<Ruler className="w-3 h-3" />}>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="200"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder="e.g. 85"
                  className="engine-input"
                />
              </Field>
              <Field label="Hip" icon={<Ruler className="w-3 h-3" />}>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="200"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                  placeholder="e.g. 100"
                  className="engine-input"
                />
              </Field>
              <Field label="Neck" icon={<Ruler className="w-3 h-3" />}>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="80"
                  value={neck}
                  onChange={(e) => setNeck(e.target.value)}
                  placeholder="e.g. 38"
                  className="engine-input"
                />
              </Field>
            </div>
            <p className="text-[9px] text-[#1A1A1A]/50 mt-1 font-serif italic">
              Waist + neck (men) or waist + hip + neck (women) enables US Navy BF%.
              Waist alone enables WHtR, WHR, ABSI.
            </p>
          </div>

          {/* Training */}
          <div className="border-t border-[#1A1A1A]/5 pt-3">
            <div className="text-[8px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider font-mono mb-2">
              Training
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Training status" icon={<Dumbbell className="w-3 h-3" />}>
                <select
                  value={trainingStatus}
                  onChange={(e) => setTrainingStatus(e.target.value as TrainingStatus)}
                  className="engine-input"
                >
                  <option value="beginner">Beginner (first few months)</option>
                  <option value="novice">Novice (weekly load progress)</option>
                  <option value="intermediate">Intermediate (monthly progress)</option>
                  <option value="advanced">Advanced (multi-month progress)</option>
                  <option value="elite">Elite (multi-year progress)</option>
                </select>
              </Field>
              <Field label="Activity level (SAF)" icon={<Activity className="w-3 h-3" />}>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="engine-input"
                >
                  <option value="sedentary">Sedentary (×1.2)</option>
                  <option value="light">Light (×1.375)</option>
                  <option value="moderate">Moderate (×1.55)</option>
                  <option value="very_active">Very active (×1.725)</option>
                  <option value="extra_active">Extra active (×1.9)</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Lifestyle */}
          <div className="border-t border-[#1A1A1A]/5 pt-3">
            <div className="text-[8px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider font-mono mb-2">
              Lifestyle & History
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="All-time high weight (kg)" icon={<User className="w-3 h-3" />}>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="400"
                  value={allTimeHigh}
                  onChange={(e) => setAllTimeHigh(e.target.value)}
                  placeholder="e.g. 95"
                  className="engine-input"
                />
              </Field>
              <Field label="Sleep (hrs/night)" icon={<Moon className="w-3 h-3" />}>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="16"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  placeholder="e.g. 7.5"
                  className="engine-input"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Field label="Stress (0–5)" icon={<Brain className="w-3 h-3" />}>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="5"
                  value={stress}
                  onChange={(e) => setStress(e.target.value)}
                  placeholder="0 = none, 5 = extreme"
                  className="engine-input"
                />
              </Field>
              <Field label="Currently in deficit?" icon={<Activity className="w-3 h-3" />}>
                <label className="flex items-center gap-2 text-xs text-[#1A1A1A]/70 mt-1">
                  <input
                    type="checkbox"
                    checked={isInDeficit}
                    onChange={(e) => setIsInDeficit(e.target.checked)}
                    className="w-4 h-4 accent-[#E63946]"
                  />
                  <span>Yes (applies −5% BMR)</span>
                </label>
              </Field>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-[#1A1A1A]/5">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2.5 bg-[#E63946] hover:bg-[#c92f3b] text-white text-xs font-bold rounded-none flex items-center justify-center gap-1.5 transition-all uppercase tracking-widest"
            >
              <Save className="w-3.5 h-3.5" />
              Save Profile
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2.5 bg-white border border-[#1A1A1A]/15 hover:border-[#1A1A1A] text-[#1A1A1A]/60 text-xs font-bold rounded-none flex items-center justify-center gap-1.5 transition-all uppercase tracking-widest"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- helpers ---

function inferSex(gender: string): Sex {
  const lower = gender.toLowerCase();
  if (lower.startsWith("f") || lower.includes("woman") || lower.includes("female")) {
    return "female";
  }
  return "male";
}

function clampNum(v: number, min: number, max: number): number {
  if (Number.isNaN(v)) return min;
  return Math.max(min, Math.min(max, v));
}

// Reusable field wrapper
function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[9px] uppercase font-bold text-[#1A1A1A]/60 tracking-wider font-mono flex items-center gap-1">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
