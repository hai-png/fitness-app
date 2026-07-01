import { useMemo } from "react";
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
 *
 * F-L1 fix: per-field validation. The parent (Onboarding.tsx) only enforces
 * `name` non-empty before letting the user advance. This component adds
 * inline range validation on age / weight / height so out-of-range values
 * are surfaced immediately (rather than silently accepted and then breaking
 * the engine formulas downstream). The validation is display-only — it
 * shows an inline error message below the input; it does NOT block form
 * state updates, so the user can type a 1 in the age field, see the
 * warning, and continue correcting it. The parent's nextStep handler still
 * gates on `name`, but the inline errors make it obvious when the other
 * fields are wrong.
 */

// F-L1: range thresholds. Tuned to cover realistic adult populations while
// rejecting obvious typos (e.g. 175 cm typed as 17.5 or 1750).
const AGE_MIN = 18;
const AGE_MAX = 120;
const WEIGHT_MIN = 20;
const WEIGHT_MAX = 400;
const HEIGHT_MIN = 100;
const HEIGHT_MAX = 250;

function validateAge(age: number): string | null {
  if (!Number.isFinite(age)) return "Age is required.";
  if (age < AGE_MIN) return `Age must be at least ${AGE_MIN}.`;
  if (age > AGE_MAX) return `Age must be at most ${AGE_MAX}.`;
  return null;
}

function validateWeight(weight: number): string | null {
  if (!Number.isFinite(weight)) return "Weight is required.";
  if (weight < WEIGHT_MIN) return `Weight must be at least ${WEIGHT_MIN} kg.`;
  if (weight > WEIGHT_MAX) return `Weight must be at most ${WEIGHT_MAX} kg.`;
  return null;
}

function validateHeight(height: number): string | null {
  if (!Number.isFinite(height)) return "Height is required.";
  if (height < HEIGHT_MIN) return `Height must be at least ${HEIGHT_MIN} cm.`;
  if (height > HEIGHT_MAX) return `Height must be at most ${HEIGHT_MAX} cm.`;
  return null;
}

function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="text-[9px] text-[#E63946] mt-1 font-serif italic leading-tight"
    >
      {message}
    </p>
  );
}

export default function Step0Profile({ form, handleFieldChange }: OnboardingStepProps) {
  // F-L1: re-derive validation errors on every render. Cheap (3 number
  // comparisons) and avoids stale errors when the parent form prop changes.
  const errors = useMemo(
    () => ({
      age: validateAge(form.age),
      weight: validateWeight(form.weight),
      height: validateHeight(form.height),
    }),
    [form.age, form.weight, form.height],
  );

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
            min={AGE_MIN}
            max={AGE_MAX}
            aria-invalid={errors.age !== null}
            aria-describedby={errors.age ? "input-age-error" : undefined}
            onChange={(e) => handleFieldChange("age", parseInt(e.target.value) || 25)}
            className={`w-full bg-white border rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none ${
              errors.age
                ? "border-[#E63946] focus:border-[#E63946]"
                : "border-[#1A1A1A]/15 focus:border-[#1A1A1A]"
            }`}
          />
          <FieldError message={errors.age} />
          {/* aria-describedby target — also rendered with id so screen
              readers can associate the input with its inline error. */}
          {errors.age && (
            <span id="input-age-error" className="sr-only">
              {errors.age}
            </span>
          )}
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
            min={WEIGHT_MIN}
            max={WEIGHT_MAX}
            aria-invalid={errors.weight !== null}
            aria-describedby={errors.weight ? "input-weight-error" : undefined}
            onChange={(e) => handleFieldChange("weight", parseFloat(e.target.value) || 70)}
            className={`w-full bg-white border rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none ${
              errors.weight
                ? "border-[#E63946] focus:border-[#E63946]"
                : "border-[#1A1A1A]/15 focus:border-[#1A1A1A]"
            }`}
          />
          <FieldError message={errors.weight} />
          {errors.weight && (
            <span id="input-weight-error" className="sr-only">
              {errors.weight}
            </span>
          )}
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
            min={HEIGHT_MIN}
            max={HEIGHT_MAX}
            aria-invalid={errors.height !== null}
            aria-describedby={errors.height ? "input-height-error" : undefined}
            onChange={(e) => handleFieldChange("height", parseInt(e.target.value) || 170)}
            className={`w-full bg-white border rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none ${
              errors.height
                ? "border-[#E63946] focus:border-[#E63946]"
                : "border-[#1A1A1A]/15 focus:border-[#1A1A1A]"
            }`}
          />
          <FieldError message={errors.height} />
          {errors.height && (
            <span id="input-height-error" className="sr-only">
              {errors.height}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
