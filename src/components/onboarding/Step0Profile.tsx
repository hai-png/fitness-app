import type { OnboardingInput } from "../../engine";

/**
 * Props shared by every onboarding step.
 */
export interface OnboardingStepProps {
  form: OnboardingInput;
  handleFieldChange: (
    field: keyof OnboardingInput,
    value: OnboardingInput[typeof field],
  ) => void;
}

/**
 * Step 0 — Profile basics.
 *
 * Renders: name, age, gender, weight, height.
 *
 * Extracted verbatim from Onboarding.tsx (A-05 decomposition). No JSX, CSS
 * classes, ids, or business logic were modified — only the wrapping
 * `{step === 0 && (...)}` conditional was removed; the parent renders this
 * component inside that same `AnimatePresence` block.
 */
export default function Step0Profile({ form, handleFieldChange }: OnboardingStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="input-name"
          className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider"
        >
          Your Name
        </label>
        <input
          id="input-name"
          type="text"
          placeholder="e.g. John Doe"
          value={form.name}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none focus:ring-0"
          maxLength={40}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="input-age"
            className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider"
          >
            Age
          </label>
          <input
            id="input-age"
            type="number"
            value={form.age}
            min={14}
            max={100}
            onChange={(e) => handleFieldChange("age", parseInt(e.target.value) || 25)}
            className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="select-gender"
            className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider"
          >
            Gender
          </label>
          <select
            id="select-gender"
            value={form.gender}
            onChange={(e) => handleFieldChange("gender", e.target.value)}
            className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="input-weight"
            className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider"
          >
            Weight (kg)
          </label>
          <input
            id="input-weight"
            type="number"
            value={form.weight}
            min={30}
            max={250}
            onChange={(e) => handleFieldChange("weight", parseFloat(e.target.value) || 70)}
            className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="input-height"
            className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider"
          >
            Height (cm)
          </label>
          <input
            id="input-height"
            type="number"
            value={form.height}
            min={100}
            max={250}
            onChange={(e) => handleFieldChange("height", parseInt(e.target.value) || 170)}
            className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
