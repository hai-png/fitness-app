import { Modal } from "../Modal";
import { DURATION_PROGRAMS, type ProgramPreset } from "../../data/workoutTemplates";

/**
 * ProgramSelectorModal — the "Preset Programs" picker (Modal #1 in
 * TrainingTab). Lists the DURATION_PROGRAMS catalog as full-width cards and
 * invokes `onApplyProgram(preset)` when one is clicked.
 *
 * Extracted verbatim from TrainingTab.tsx (lines 669–712) during A-05
 * god-component decomposition. No JSX, CSS classes, ids, or business logic
 * were changed.
 */
interface ProgramSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onApplyProgram: (preset: ProgramPreset) => void;
}

export default function ProgramSelectorModal({
  open,
  onClose,
  onApplyProgram,
}: ProgramSelectorModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Preset Programs" maxWidthClass="max-w-md">
      <div className="p-4 overflow-y-auto space-y-4 max-h-[70vh]">
        <p className="text-xs text-[#1A1A1A]/60 font-serif italic mb-2 leading-relaxed">
          Choose a structured, duration-based athletic program designed with target sets, reps
          and progressions mapped for your direct goal:
        </p>

        {DURATION_PROGRAMS.map((prog) => (
          <button
            type="button"
            key={prog.id}
            className="bg-white border border-[#1A1A1A]/10 p-4 relative overflow-hidden group hover:border-[#1A1A1A]/30 transition-all cursor-pointer w-full text-left block"
            onClick={() => onApplyProgram(prog)}
          >
            <div className="absolute right-3 top-3 bg-[#E63946] text-white text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest font-mono">
              {prog.durationWeeks} Weeks
            </div>

            <h4 className="text-sm font-bold uppercase tracking-tight text-[#1A1A1A] group-hover:text-[#E63946] transition-colors">
              {prog.name}
            </h4>
            <p className="text-[11px] text-[#1A1A1A]/50 uppercase tracking-widest font-mono font-semibold mt-0.5">
              Goal: {prog.goal.replace("-", " ")}
            </p>

            <p className="text-xs mt-2 text-[#1A1A1A]/70 leading-relaxed font-serif italic">
              {prog.description}
            </p>

            <div className="mt-3 pt-2.5 border-t border-[#1A1A1A]/5 flex justify-between items-center text-[10px] uppercase font-bold text-[#1A1A1A]/50">
              <span>Split: {prog.splitTemplate.name}</span>
              <span className="text-[#E63946] flex items-center gap-1 font-mono">
                Apply Program →
              </span>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
