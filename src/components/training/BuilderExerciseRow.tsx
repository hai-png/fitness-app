/**
 * BuilderExerciseRow
 *
 * Renders a single per-exercise editor row inside the SplitBuilder's active
 * day editor. Shows the exercise name + delete button, three small inputs for
 * sets / reps / rest, and a wider input for instruction notes. All field
 * changes are delegated up via `onUpdateField`; deletion via `onRemove`.
 *
 * Pure presentational component.
 */

import { Trash2 } from "lucide-react";
import type { Exercise } from "../../engine";

interface BuilderExerciseRowProps {
  /** The exercise being edited. */
  ex: Exercise;
  /** Index of this exercise within the day's exercise list (used for ids + callbacks). */
  exIdx: number;
  /** Update a single field on this exercise. */
  onUpdateField: (exIdx: number, field: keyof Exercise, val: string | number) => void;
  /** Remove this exercise from the day. */
  onRemove: (exIdx: number) => void;
}

export default function BuilderExerciseRow({
  ex,
  exIdx,
  onUpdateField,
  onRemove,
}: BuilderExerciseRowProps) {
  return (
    <div className="bg-[#F9F8F6] border border-[#1A1A1A]/5 p-2 flex flex-col gap-2 relative">
      {/* Top line Name & Delete */}
      <div className="flex justify-between items-center gap-2">
        <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-tight">
          {exIdx + 1}. {ex.name}
        </span>
        <button
          id={`btn-builder-delete-ex-${exIdx}`}
          type="button"
          onClick={() => onRemove(exIdx)}
          className="text-[#1A1A1A]/40 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inputs sets, reps, rest, instruction */}
      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
        <div>
          <label
            htmlFor={`input-builder-ex-${exIdx}-sets`}
            className="block text-[8px] text-[#1A1A1A]/40 font-bold uppercase mb-0.5"
          >
            Sets
          </label>
          <input
            id={`input-builder-ex-${exIdx}-sets`}
            type="number"
            value={ex.sets}
            onChange={(e) =>
              onUpdateField(exIdx, "sets", parseInt(e.target.value) || 3)
            }
            className="w-full bg-white border border-[#1A1A1A]/10 px-2 py-1"
          />
        </div>
        <div>
          <label
            htmlFor={`input-builder-ex-${exIdx}-reps`}
            className="block text-[8px] text-[#1A1A1A]/40 font-bold uppercase mb-0.5"
          >
            Reps
          </label>
          <input
            id={`input-builder-ex-${exIdx}-reps`}
            type="text"
            value={ex.reps}
            onChange={(e) => onUpdateField(exIdx, "reps", e.target.value)}
            className="w-full bg-white border border-[#1A1A1A]/10 px-2 py-1 font-mono"
          />
        </div>
        <div>
          <label
            htmlFor={`input-builder-ex-${exIdx}-rest`}
            className="block text-[8px] text-[#1A1A1A]/40 font-bold uppercase mb-0.5"
          >
            Rest (Sec)
          </label>
          <input
            id={`input-builder-ex-${exIdx}-rest`}
            type="number"
            value={ex.restSeconds}
            onChange={(e) =>
              onUpdateField(exIdx, "restSeconds", parseInt(e.target.value) || 60)
            }
            className="w-full bg-white border border-[#1A1A1A]/10 px-2 py-1"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`input-builder-ex-${exIdx}-instruction`}
          className="block text-[8px] text-[#1A1A1A]/40 font-bold uppercase mb-0.5"
        >
          Instruction Notes
        </label>
        <input
          id={`input-builder-ex-${exIdx}-instruction`}
          type="text"
          value={ex.instruction}
          onChange={(e) => onUpdateField(exIdx, "instruction", e.target.value)}
          className="w-full bg-white border border-[#1A1A1A]/10 px-2 py-1 text-[11px]"
        />
      </div>
    </div>
  );
}
