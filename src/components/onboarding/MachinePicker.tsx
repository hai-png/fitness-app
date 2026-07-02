/**
 * MachinePicker
 *
 * Machine availability checklist rendered inside StepGymSelection once a
 * gym has been selected. Lists every entry from MACHINE_CATEGORIES grouped
 * by movement category (Push / Pull / Legs / Arms), plus a "Select All" /
 * "Clear" toolbar and a small summary banner reflecting how many machines
 * are currently logged.
 *
 * Pure presentational component — owns no state.
 */

import { Check, SlidersHorizontal } from "lucide-react";
import type { OnboardingInput } from "../../engine";
import { MACHINE_CATEGORIES } from "./gymData";

interface MachinePickerProps {
  /** Current onboarding form state (read for selectedGymName + availableMachines). */
  form: OnboardingInput;
  /** Update a single form field. Mirrors the parent's `handleFieldChange`. */
  onFieldChange: (field: keyof OnboardingInput, value: string | number | string[]) => void;
}

export default function MachinePicker({ form, onFieldChange }: MachinePickerProps) {
  return (
    <div className="bg-white border border-[#1A1A1A]/10 p-3 mt-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[#1A1A1A]/5 pb-2">
        <div>
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">
            Log {form.selectedGymName} Machines
          </h5>
          <p className="text-[9px] text-[#1A1A1A]/50 font-serif italic">
            Toggle machines available at your branch.
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              const all = Object.values(MACHINE_CATEGORIES).flatMap((c) => c.map((m) => m.name));
              onFieldChange("availableMachines", all);
            }}
            className="text-[8px] font-bold uppercase tracking-wider text-[#E63946] hover:underline"
          >
            Select All
          </button>
          <span className="text-[#1A1A1A]/20 text-[8px]">•</span>
          <button
            type="button"
            onClick={() => onFieldChange("availableMachines", [])}
            className="text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {Object.entries(MACHINE_CATEGORIES).map(([category, machines]) => (
          <div key={category} className="space-y-1.5">
            <span className="text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/40 bg-[#1A1A1A]/5 px-1.5 py-0.5 rounded-none inline-block">
              {category} Machines
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {machines.map((m) => {
                const isChecked = (form.availableMachines || []).includes(m.name);
                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => {
                      const current = form.availableMachines || [];
                      const next = isChecked
                        ? current.filter((x) => x !== m.name)
                        : [...current, m.name];
                      onFieldChange("availableMachines", next);
                    }}
                    className={`w-full p-2 rounded-none border text-left transition-all flex items-center justify-between text-[11px] ${
                      isChecked
                        ? "bg-[#1A1A1A]/5 border-[#1A1A1A] text-[#1A1A1A]"
                        : "bg-white border-[#1A1A1A]/5 text-[#1A1A1A]/60 hover:border-[#1A1A1A]/15"
                    }`}
                  >
                    <div>
                      <span className="font-bold uppercase tracking-wide text-[10px]">{m.name}</span>
                      <p className="text-[9px] text-[#1A1A1A]/50 font-serif italic mt-0.5">
                        {m.desc}
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-none border flex items-center justify-center shrink-0 ${
                        isChecked
                          ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                          : "border-[#1A1A1A]/25"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#E63946]/5 border border-[#E63946]/10 p-2.5 text-[10px] text-[#1A1A1A]/80 font-serif italic flex items-center gap-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-[#E63946]" />
        <span>
          {form.availableMachines && form.availableMachines.length > 0 ? (
            <>
              <strong>{form.availableMachines.length} machines</strong> logged. Workout
              recommendations will be dynamically tuned.
            </>
          ) : (
            <>
              No machines logged. Workouts will default to standard barbell & dumbbell exercises.
            </>
          )}
        </span>
      </div>
    </div>
  );
}
