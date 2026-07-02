/**
 * StepWorkoutPreference
 *
 * Onboarding Step 2 — "Your Training Atmosphere". Renders three sub-sections
 * in their original DOM order:
 *  1. The workout-setting preference cards (home / gym / outdoor / hybrid).
 *  2. Conditionally embeds <StepGymSelection> when "gym" is chosen.
 *  3. The daily-baseline activity-level cards (sedentary / light / moderate /
 *     active).
 *
 * All field writes flow through the shared `onFieldChange` callback so the
 * parent Onboarding form state stays the single source of truth. When the
 * user picks a non-gym preference, the gym + machine selections are cleared;
 * when "gym" is picked without a prior selection, the first NEARBY_GYM is
 * auto-selected to seed the gym picker (mirroring the original inline logic).
 */

import type { OnboardingInput } from "../../engine";
import { NEARBY_GYMS } from "./gymData";
import StepGymSelection from "./StepGymSelection";

interface StepWorkoutPreferenceProps {
  /** Current onboarding form state (read for selected-button styling). */
  form: OnboardingInput;
  /** Update a single form field. Mirrors the parent's `handleFieldChange`. */
  onFieldChange: (field: keyof OnboardingInput, value: string | number | string[]) => void;
}

/** Static workout-setting catalog (id drives the OnboardingInput.workoutPreference value). */
const WORKOUT_PREF_OPTIONS: { id: string; title: string; desc: string }[] = [
  {
    id: "home",
    title: "Home Gym (Calisthenics & Minimal Equipment)",
    desc: "Bodyweight focus, bands, chairs, dumbbells",
  },
  {
    id: "gym",
    title: "Commercial Gym (Barbells, Cables & Machines)",
    desc: "Full power rack access, cables, leg machines",
  },
  {
    id: "outdoor",
    title: "Outdoor Arena (Bars, Parks & Running)",
    desc: "Aerobic base, pullup bars, sprint loops",
  },
  {
    id: "hybrid",
    title: "Hybrid Versatility",
    desc: "A blend of home bodyweight and commercial machinery",
  },
];

/** Static activity-level catalog (id drives the OnboardingInput.activityLevel value). */
const ACTIVITY_LEVEL_OPTIONS: { id: string; label: string; desc: string }[] = [
  { id: "sedentary", label: "Sedentary", desc: "Desk job, few walks" },
  { id: "light", label: "Lightly Active", desc: "1-2h light walk/day" },
  { id: "moderate", label: "Moderately Active", desc: "Active stands, daily run" },
  { id: "active", label: "Very Athlete Active", desc: "Labor work or heavy training" },
];

export default function StepWorkoutPreference({ form, onFieldChange }: StepWorkoutPreferenceProps) {
  /**
   * Click handler for the workout-preference buttons. Mirrors the original
   * inline onClick logic: writes the preference, then clears or seeds the
   * gym + machine selections based on which preference was chosen.
   */
  const handleSelectPreference = (id: string) => {
    onFieldChange("workoutPreference", id);
    if (id !== "gym") {
      onFieldChange("selectedGymName", "");
      onFieldChange("availableMachines", []);
    } else if (!form.selectedGymName) {
      // Default select the first gym
      // Q-07: safe — NEARBY_GYMS is a static non-empty array (3 entries).
      onFieldChange("selectedGymName", NEARBY_GYMS[0]?.name ?? "");
      onFieldChange("availableMachines", NEARBY_GYMS[0]?.defaultMachines ?? []);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="btn-pref-home"
          className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-2 uppercase tracking-wider"
        >
          Workout Setting Preference
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {WORKOUT_PREF_OPTIONS.map((w) => (
            <button
              key={w.id}
              id={`btn-pref-${w.id}`}
              type="button"
              onClick={() => handleSelectPreference(w.id)}
              className={`w-full p-4 text-left rounded-none border transition-all duration-200 ${
                form.workoutPreference === w.id
                  ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
                  : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#F9F8F6] hover:border-[#1A1A1A]/30"
              }`}
            >
              <h4 className="text-sm font-bold uppercase tracking-tight">{w.title}</h4>
              <p
                className={`text-xs mt-1 leading-relaxed ${form.workoutPreference === w.id ? "text-white/70" : "text-[#1A1A1A]/50"}`}
              >
                {w.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {form.workoutPreference === "gym" && (
        <StepGymSelection form={form} onFieldChange={onFieldChange} />
      )}

      <div>
        <label
          htmlFor="btn-act-sedentary"
          className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-2 uppercase tracking-wider mt-4"
        >
          Daily Baseline Activity Level
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ACTIVITY_LEVEL_OPTIONS.map((act) => (
            <button
              key={act.id}
              id={`btn-act-${act.id}`}
              type="button"
              onClick={() => onFieldChange("activityLevel", act.id)}
              className={`p-4 text-left rounded-none border transition-all duration-200 ${
                form.activityLevel === act.id
                  ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
                  : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#F9F8F6] hover:border-[#1A1A1A]/30"
              }`}
            >
              <h5 className="text-xs font-bold uppercase tracking-tight">{act.label}</h5>
              <p
                className={`text-[10px] mt-1 leading-snug ${form.activityLevel === act.id ? "text-white/70" : "text-[#1A1A1A]/50"}`}
              >
                {act.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
