/**
 * StepDiet
 *
 * Onboarding Step 3 (final step) — "Nutritional Foundation". Renders the
 * 7-option dietary-category grid (anything / vegetarian / vegan / keto /
 * low-carb / gluten-free / mediterranean) and a free-text allergies input
 * with a helper paragraph about the meal-delivery service.
 *
 * All field writes flow through the shared `onFieldChange` callback so the
 * parent Onboarding form state stays the single source of truth.
 */

import type { OnboardingInput } from "../../engine";

interface StepDietProps {
  /** Current onboarding form state (read for selected-button styling + allergies value). */
  form: OnboardingInput;
  /** Update a single form field. Mirrors the parent's `handleFieldChange`. */
  onFieldChange: (field: keyof OnboardingInput, value: string | number | string[]) => void;
}

/** Static diet-category catalog (id drives the OnboardingInput.dietType value). */
const DIET_OPTIONS: { id: string; label: string }[] = [
  { id: "anything", label: "Anything / Balanced" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "keto", label: "Ketogenic (Low Carb)" },
  { id: "low-carb", label: "Low Carb (Moderate)" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "mediterranean", label: "Mediterranean" },
];

export default function StepDiet({ form, onFieldChange }: StepDietProps) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="btn-diet-anything"
          className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-2 uppercase tracking-wider"
        >
          Dietary Category
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DIET_OPTIONS.map((diet) => (
            <button
              key={diet.id}
              id={`btn-diet-${diet.id}`}
              type="button"
              onClick={() => onFieldChange("dietType", diet.id)}
              className={`p-3 text-center rounded-none border text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                form.dietType === diet.id
                  ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
                  : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#F9F8F6] hover:border-[#1A1A1A]/30"
              }`}
            >
              {diet.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="input-allergies"
          className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider mt-4"
        >
          Allergies & Food Sensitive Restrictions
        </label>
        <input
          id="input-allergies"
          type="text"
          placeholder="e.g. Peanuts, Dairy, Seafood (or leave blank)"
          value={form.allergies}
          onChange={(e) => onFieldChange("allergies", e.target.value)}
          className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none focus:ring-0"
        />
        <p className="text-[10px] text-[#1A1A1A]/50 mt-2 font-serif italic leading-relaxed">
          Our paid meal delivery service tab will badge or restrict recommended preps with these
          triggers.
        </p>
      </div>
    </div>
  );
}
