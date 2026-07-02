/**
 * StepProfile
 *
 * Onboarding Step 0 — basic biometric profile collection.
 * Renders the name input, age + gender row, and weight + height row.
 * All field writes flow through the shared `onFieldChange` callback so the
 * parent Onboarding form state stays the single source of truth.
 */

import type { OnboardingInput } from "../../engine";

interface StepProfileProps {
  /** Current onboarding form state (read for controlled-input values). */
  form: OnboardingInput;
  /** Update a single form field. Mirrors the parent's `handleFieldChange`. */
  onFieldChange: (field: keyof OnboardingInput, value: string | number | string[]) => void;
}

export default function StepProfile({ form, onFieldChange }: StepProfileProps) {
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
          onChange={(e) => onFieldChange("name", e.target.value)}
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
            onChange={(e) => onFieldChange("age", parseInt(e.target.value) || 25)}
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
            onChange={(e) => onFieldChange("gender", e.target.value)}
            className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Non-binary</option>
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
            onChange={(e) => onFieldChange("weight", parseFloat(e.target.value) || 70)}
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
            onChange={(e) => onFieldChange("height", parseInt(e.target.value) || 170)}
            className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
