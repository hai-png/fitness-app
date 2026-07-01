/**
 * CustomSetLoggerModal — extracted from ProgressTab.tsx (A-04-further
 * decomposition).
 *
 * F-C2: accessible <Modal> for logging a custom exercise set. All state and
 * the submit / category-change handlers stay in ProgressTab; this component
 * owns only the form layout and presentation. Rendered at the ProgressTab
 * root (not inside ExerciseProgressionView) so the "Log Custom Set" trigger
 * button works regardless of which sub-tab is active.
 */
import React from "react";
import { Modal } from "../Modal";
import { EXERCISE_DATABASE } from "../../data/workoutTemplates";

type SetIntensityType = "Normal" | "AMRAP" | "Failure" | "Drop Set";

interface CustomSetLoggerModalProps {
  isLogFormOpen: boolean;
  setIsLogFormOpen: (open: boolean) => void;
  logExName: string;
  setLogExName: (val: string) => void;
  logExMuscle: string;
  logExWeight: string;
  setLogExWeight: (val: string) => void;
  logExReps: string;
  setLogExReps: (val: string) => void;
  logExType: SetIntensityType;
  setLogExType: (val: SetIntensityType) => void;
  logExIsWarmUp: boolean;
  setLogExIsWarmUp: (val: boolean) => void;
  handleLogCustomSetSubmit: (e: React.FormEvent) => void;
  handleMuscleCategoryChange: (cat: string) => void;
}

export default function CustomSetLoggerModal({
  isLogFormOpen,
  setIsLogFormOpen,
  logExName,
  setLogExName,
  logExMuscle,
  logExWeight,
  setLogExWeight,
  logExReps,
  setLogExReps,
  logExType,
  setLogExType,
  logExIsWarmUp,
  setLogExIsWarmUp,
  handleLogCustomSetSubmit,
  handleMuscleCategoryChange,
}: CustomSetLoggerModalProps) {
  return (
    <Modal
      open={isLogFormOpen}
      onClose={() => setIsLogFormOpen(false)}
      title="Log Custom Set"
      maxWidthClass="max-w-sm"
    >
      <form onSubmit={handleLogCustomSetSubmit} className="p-4 space-y-3.5">
        {/* Category selector */}
        <div>
          <label
            htmlFor="select-custom-log-category"
            className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
          >
            Muscle Category
          </label>
          <select
            id="select-custom-log-category"
            value={logExMuscle}
            onChange={(e) => handleMuscleCategoryChange(e.target.value)}
            className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs focus:outline-none"
          >
            <option value="Chest">Chest</option>
            <option value="Lats">Lats</option>
            <option value="Mid Back">Mid Back</option>
            <option value="Upper Back">Upper Back</option>
            <option value="Quads">Quads</option>
            <option value="Hamstrings">Hamstrings</option>
            <option value="Glutes">Glutes</option>
            <option value="Shoulders">Shoulders</option>
            <option value="Biceps">Biceps</option>
            <option value="Triceps">Triceps</option>
            <option value="Core">Core</option>
            <option value="Cardio">Cardio</option>
          </select>
        </div>

        {/* Exercise Selection list depending on category */}
        <div>
          <label
            htmlFor="select-custom-log-exercise-name"
            className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
          >
            Exercise Name
          </label>
          <select
            id="select-custom-log-exercise-name"
            value={logExName}
            onChange={(e) => setLogExName(e.target.value)}
            className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs focus:outline-none"
          >
            {EXERCISE_DATABASE.filter(
              (e) =>
                e.targetMuscle.toLowerCase() === logExMuscle.toLowerCase() ||
                (logExMuscle === "Core" &&
                  ["Core", "Lower Abs", "Obliques"].includes(e.targetMuscle)) ||
                (logExMuscle === "Lats" &&
                  ["Lats", "Mid Back", "Upper Back"].includes(e.targetMuscle)) ||
                (logExMuscle === "Mid Back" &&
                  ["Lats", "Mid Back", "Upper Back"].includes(e.targetMuscle)) ||
                (logExMuscle === "Upper Back" &&
                  ["Lats", "Mid Back", "Upper Back"].includes(e.targetMuscle)) ||
                (logExMuscle === "Quads" &&
                  ["Quads", "Hamstrings", "Glutes"].includes(e.targetMuscle)) ||
                (logExMuscle === "Hamstrings" &&
                  ["Quads", "Hamstrings", "Glutes"].includes(e.targetMuscle)) ||
                (logExMuscle === "Glutes" &&
                  ["Quads", "Hamstrings", "Glutes"].includes(e.targetMuscle)),
            ).map((e) => (
              <option key={e.name} value={e.name}>
                {e.name}
              </option>
            ))}
            {/* Default back up option if none filtered */}
            <option value={logExName}>{logExName}</option>
          </select>
        </div>

        {/* Load weight & Reps */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="input-custom-log-weight"
              className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
            >
              Weight Load (kg)
            </label>
            <input
              id="input-custom-log-weight"
              type="number"
              step="0.5"
              value={logExWeight}
              onChange={(e) => setLogExWeight(e.target.value)}
              className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#E63946]"
              required
            />
          </div>
          <div>
            <label
              htmlFor="input-custom-log-reps"
              className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
            >
              Repetitions
            </label>
            <input
              id="input-custom-log-reps"
              type="number"
              value={logExReps}
              onChange={(e) => setLogExReps(e.target.value)}
              className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#E63946]"
              required
            />
          </div>
        </div>

        {/* Set category type and Warm-Up toggle */}
        <div className="grid grid-cols-2 gap-3 items-center pt-1">
          <div>
            <label
              htmlFor="select-custom-log-set-type"
              className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
            >
              Set Intensity Type
            </label>
            <select
              id="select-custom-log-set-type"
              value={logExType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setLogExType(e.target.value as "Normal" | "AMRAP" | "Failure" | "Drop Set")
              }
              className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs"
            >
              <option value="Normal">Normal Set</option>
              <option value="AMRAP">AMRAP Set</option>
              <option value="Failure">To Failure Set</option>
              <option value="Drop Set">Drop Set</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input
              id="checkbox-custom-log-warmup"
              type="checkbox"
              checked={logExIsWarmUp}
              onChange={(e) => setLogExIsWarmUp(e.target.checked)}
              className="w-4 h-4 accent-[#E63946]"
            />
            <label
              htmlFor="checkbox-custom-log-warmup"
              className="text-[10px] font-bold uppercase text-[#1A1A1A]/60"
            >
              Warm-Up Set
            </label>
          </div>
        </div>

        {/* Submit button (Modal provides X + Escape + overlay-click for closing) */}
        <div className="pt-4 border-t border-[#1A1A1A]/5">
          <button
            id="btn-submit-custom-log"
            type="submit"
            className="w-full py-2.5 text-center bg-[#E63946] text-white font-bold uppercase tracking-wider text-[10px] font-mono hover:bg-[#d62828]"
          >
            Log Set
          </button>
        </div>
      </form>
    </Modal>
  );
}
