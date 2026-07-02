/**
 * PresetPrograms
 *
 * Renders the "Duration-Based Program Presets Selector" modal (Modal 1 in the
 * original TrainingTab). Displays a vertical list of `DURATION_PROGRAMS` cards
 * (PPL, Upper/Lower, etc.); clicking a card calls `onApplyProgram(preset)`.
 *
 * Pure presentational component. The parent should mount this conditionally
 * (`{isOpen && <PresetPrograms ... />}`) so the modal only exists when open.
 */

import { Sparkles, X } from "lucide-react";
import { DURATION_PROGRAMS, type ProgramPreset } from "../../data/workoutTemplates";

interface PresetProgramsProps {
  /** Close the modal without applying a program. */
  onClose: () => void;
  /** Apply the chosen preset program (replaces the active workout plan). */
  onApplyProgram: (preset: ProgramPreset) => void;
}

export default function PresetPrograms({
  onClose,
  onApplyProgram,
}: PresetProgramsProps) {
  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#F9F8F6] border border-[#1A1A1A]/20 w-full max-w-md max-h-[85vh] flex flex-col rounded-none overflow-hidden shadow-2xl">
        <div className="bg-[#1A1A1A] text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E63946]" />
            <h3 className="font-serif italic font-bold text-base uppercase tracking-wider">
              Select Goal-Specific Plan
            </h3>
          </div>
          <button
            id="btn-close-presets"
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 flex-grow">
          <p className="text-xs text-[#1A1A1A]/60 font-serif italic mb-2 leading-relaxed">
            Choose a structured, duration-based athletic program designed with target sets, reps
            and progressions mapped for your direct goal:
          </p>

          {DURATION_PROGRAMS.map((prog) => (
            <div
              key={prog.id}
              role="button"
              tabIndex={0}
              className="bg-white border border-[#1A1A1A]/10 p-4 relative overflow-hidden group hover:border-[#1A1A1A]/30 transition-all cursor-pointer"
              onClick={() => onApplyProgram(prog)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onApplyProgram(prog);
                }
              }}
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
            </div>
          ))}
        </div>

        <div className="p-4 bg-white border-t border-[#1A1A1A]/10 flex justify-end">
          <button
            id="btn-close-presets-footer"
            onClick={onClose}
            className="text-xs uppercase font-bold bg-[#1A1A1A]/5 text-[#1A1A1A]/60 border border-[#1A1A1A]/10 px-4 py-2 hover:bg-[#1A1A1A] hover:text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
