import type { OnboardingStepProps } from "./Step0Profile";

/**
 * Step 3 — Nutritional foundation.
 *
 * Renders: dietary category, cuisine preference (including Ethiopian),
 * and a free-text allergies & sensitivities input.
 */
export default function Step3Review({ form, handleFieldChange }: OnboardingStepProps) {
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
          {[
            { id: "anything", label: "Anything / Balanced" },
            { id: "vegetarian", label: "Vegetarian" },
            { id: "vegan", label: "Vegan" },
            { id: "keto", label: "Ketogenic (Low Carb)" },
            { id: "low-carb", label: "Low Carb (Moderate)" },
            { id: "gluten-free", label: "Gluten-Free" },
            { id: "mediterranean", label: "Mediterranean" },
          ].map((diet) => (
            <button
              key={diet.id}
              id={`btn-diet-${diet.id}`}
              type="button"
              onClick={() => handleFieldChange("dietType", diet.id)}
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
          htmlFor="select-cuisine-preference"
          className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-2 uppercase tracking-wider mt-4"
        >
          Cuisine Preference
        </label>
        <select
          id="select-cuisine-preference"
          value={form.cuisinePreference}
          onChange={(e) => handleFieldChange("cuisinePreference", e.target.value)}
          className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none"
        >
          <option value="no-preference">No preference (variety)</option>
          <option value="american">American</option>
          <option value="ethiopian">Ethiopian 🇪🇹</option>
          <option value="mexican">Mexican</option>
          <option value="italian">Italian</option>
          <option value="thai">Thai</option>
          <option value="mediterranean">Mediterranean</option>
          <option value="indian">Indian</option>
          <option value="japanese">Japanese</option>
        </select>
        <p className="text-[10px] text-[#1A1A1A]/50 mt-1.5 font-serif italic leading-relaxed">
          Your meal delivery plan will prefer recipes from this cuisine when available.
        </p>
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
          onChange={(e) => handleFieldChange("allergies", e.target.value)}
          className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none focus:ring-0"
        />
        <p className="text-[10px] text-[#1A1A1A]/50 mt-2 font-serif italic leading-relaxed">
          Our paid meal delivery service tab will badge or restrict recommended preps
          with these triggers.
        </p>
      </div>
    </div>
  );
}
