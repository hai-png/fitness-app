/**
 * StepGoal
 *
 * Onboarding Step 1 — primary fitness aspiration + weekly frequency.
 * Renders 5 goal-selection cards (weight-loss / muscle-gain / strength /
 * endurance / general) and a 4-button frequency grid (2/3/4/5 days).
 * All field writes flow through the shared `onFieldChange` callback.
 */

import type { OnboardingInput } from "../../engine";

interface StepGoalProps {
  /** Current onboarding form state (read for selected-button styling). */
  form: OnboardingInput;
  /** Update a single form field. Mirrors the parent's `handleFieldChange`. */
  onFieldChange: (field: keyof OnboardingInput, value: string | number | string[]) => void;
}

/** Static goal-card catalog (id drives the OnboardingInput.goal value). */
const GOAL_OPTIONS: { id: string; title: string; desc: string }[] = [
  {
    id: "weight-loss",
    title: "Fat Shred & Slimming",
    desc: "Burn calories, boost metabolism, lose body fat",
  },
  {
    id: "muscle-gain",
    title: "Lean Muscle Hypertrophy",
    desc: "Build size, increase muscle mass, density",
  },
  {
    id: "strength",
    title: "Pure Mechanical Strength",
    desc: "Lift heavier, improve power, core stabilization",
  },
  {
    id: "endurance",
    title: "Cardio & Stamina Builder",
    desc: "Boost VO2 max, endurance, lung capacity",
  },
  {
    id: "general",
    title: "Active Wellness & Tonus",
    desc: "Feel energetic, flexible, overall mobility",
  },
];

/** Static frequency button catalog (days per week). */
const FREQUENCY_OPTIONS: number[] = [2, 3, 4, 5];

export default function StepGoal({ form, onFieldChange }: StepGoalProps) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="btn-goal-weight-loss"
          className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-2 uppercase tracking-wider"
        >
          Primary Aspiration
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {GOAL_OPTIONS.map((g) => (
            <button
              key={g.id}
              id={`btn-goal-${g.id}`}
              type="button"
              onClick={() => onFieldChange("goal", g.id)}
              className={`w-full p-4 text-left rounded-none border transition-all duration-200 ${
                form.goal === g.id
                  ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
                  : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#F9F8F6] hover:border-[#1A1A1A]/30"
              }`}
            >
              <h4 className="text-sm font-bold uppercase tracking-tight">{g.title}</h4>
              <p
                className={`text-xs mt-1 leading-relaxed ${form.goal === g.id ? "text-white/70" : "text-[#1A1A1A]/50"}`}
              >
                {g.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="btn-freq-2"
          className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-2 uppercase tracking-wider mt-4"
        >
          Weekly Workout Frequency
        </label>
        <div className="grid grid-cols-4 gap-2">
          {FREQUENCY_OPTIONS.map((num) => (
            <button
              key={num}
              id={`btn-freq-${num}`}
              type="button"
              onClick={() => onFieldChange("frequency", num)}
              className={`py-3 text-center rounded-none border font-bold text-sm transition-all uppercase tracking-wider ${
                form.frequency === num
                  ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                  : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A] hover:border-[#1A1A1A]/30"
              }`}
            >
              {num} Days
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
