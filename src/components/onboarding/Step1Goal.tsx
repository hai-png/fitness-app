import type { OnboardingStepProps } from "./Step0Profile";

/**
 * Step 1 — Goal + frequency.
 *
 * Renders: primary aspiration (goal) radio cards, weekly workout frequency
 * buttons.
 *
 * Extracted verbatim from Onboarding.tsx (A-05 decomposition). No JSX, CSS
 * classes, ids, or business logic were modified.
 */
export default function Step1Goal({ form, handleFieldChange }: OnboardingStepProps) {
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
          {[
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
          ].map((g) => (
            <button
              key={g.id}
              id={`btn-goal-${g.id}`}
              type="button"
              onClick={() => handleFieldChange("goal", g.id)}
              className={`w-full p-4 text-left rounded-none border transition-all duration-200 ${
                form.goal === g.id
                  ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
                  : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#F9F8F6] hover:border-[#1A1A1A]/30"
              }`}
            >
              <h4 className="text-sm font-bold uppercase tracking-tight">
                {g.title}
              </h4>
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
          {[2, 3, 4, 5].map((num) => (
            <button
              key={num}
              id={`btn-freq-${num}`}
              type="button"
              onClick={() => handleFieldChange("frequency", num)}
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
