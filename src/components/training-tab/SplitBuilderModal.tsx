import type { Dispatch, SetStateAction } from "react";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { Modal } from "../Modal";
import type { Exercise, WeeklyScheduleDay } from "../../engine";
import { EXERCISE_DATABASE, SPLIT_TEMPLATES } from "../../data/workoutTemplates";

/**
 * SplitBuilderModal — the granular workout-split builder & scratch creator
 * (Modal #3 in TrainingTab). Renders preset-split template buttons, global
 * metadata inputs (title / difficulty / description), a per-day editor with
 * add/remove days, a per-day exercise editor (sets / reps / rest /
 * instruction), an exercise-database picker (filter by muscle group → pick
 * exercise → "Add to Day"), and footer Cancel / Save actions.
 *
 * Extracted verbatim from TrainingTab.tsx (lines 851–1289) during A-05
 * god-component decomposition. No JSX, CSS classes, ids, or business logic
 * were changed. All builder state + handlers continue to be owned by the
 * parent (the "adjust state during render" sync blocks, the
 * `defaultDBExerciseNameForCategory` helper, and the save/cancel handlers
 * all live in TrainingTab because they read/write `workoutPlan` and other
 * parent-scoped state); they are passed in as props so the inline event
 * handlers remain byte-identical to the originals.
 *
 * The static `categories` list (the muscle-group filter options for the
 * exercise-database picker) is the one piece of non-state data that lived
 * inside the parent function; it is reproduced verbatim here as a
 * module-level constant so neither its values nor its identity change.
 */
const categories = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"];

interface SplitBuilderModalProps {
  open: boolean;
  onClose: () => void;
  builderSchedule: WeeklyScheduleDay[];
  builderTitle: string;
  setBuilderTitle: Dispatch<SetStateAction<string>>;
  builderDescription: string;
  setBuilderDescription: Dispatch<SetStateAction<string>>;
  builderDifficulty: string;
  setBuilderDifficulty: Dispatch<SetStateAction<string>>;
  selectedBuilderDayIndex: number;
  setSelectedBuilderDayIndex: Dispatch<SetStateAction<number>>;
  selectedDBCategory: string;
  setSelectedDBCategory: Dispatch<SetStateAction<string>>;
  selectedDBExerciseName: string;
  setSelectedDBExerciseName: Dispatch<SetStateAction<string>>;
  handleBuilderAddDay: () => void;
  handleBuilderRemoveDay: (dayIdx: number) => void;
  handleBuilderUpdateDayField: (field: keyof WeeklyScheduleDay, val: string | number) => void;
  handleBuilderAddExerciseToDay: () => void;
  handleBuilderRemoveExerciseFromDay: (exIdx: number) => void;
  handleBuilderUpdateExerciseField: (
    exIdx: number,
    field: keyof Exercise,
    val: string | number,
  ) => void;
  handleSaveBuilderPlan: () => void;
  handleBuilderApplyTemplate: (templateIndex: number) => void;
}

export default function SplitBuilderModal({
  open,
  onClose,
  builderSchedule,
  builderTitle,
  setBuilderTitle,
  builderDescription,
  setBuilderDescription,
  builderDifficulty,
  setBuilderDifficulty,
  selectedBuilderDayIndex,
  setSelectedBuilderDayIndex,
  selectedDBCategory,
  setSelectedDBCategory,
  selectedDBExerciseName,
  setSelectedDBExerciseName,
  handleBuilderAddDay,
  handleBuilderRemoveDay,
  handleBuilderUpdateDayField,
  handleBuilderAddExerciseToDay,
  handleBuilderRemoveExerciseFromDay,
  handleBuilderUpdateExerciseField,
  handleSaveBuilderPlan,
  handleBuilderApplyTemplate,
}: SplitBuilderModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Split Builder" maxWidthClass="max-w-md">
      <div className="flex flex-col max-h-[85vh]">
        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-grow">
          {/* Quick Config templates */}
          <div className="bg-white border border-[#1A1A1A]/10 p-3 mb-2">
            <span className="text-[9px] uppercase tracking-wider font-bold text-[#1A1A1A]/50 block mb-2">
              Load Preset Split Configuration
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SPLIT_TEMPLATES.map((t, idx) => (
                <button
                  key={idx}
                  id={`btn-load-template-${idx}`}
                  onClick={() => handleBuilderApplyTemplate(idx)}
                  type="button"
                  className="p-2 border border-[#1A1A1A]/10 bg-[#F9F8F6] hover:bg-[#1A1A1A] hover:text-white transition-all text-left rounded-none text-xs"
                >
                  <strong className="block uppercase tracking-tight text-[10px]">
                    {t.name}
                  </strong>
                  <span className="text-[9px] opacity-70 italic font-serif block mt-0.5 truncate">
                    {t.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Global Metadata Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="input-builder-title"
                className="block text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
              >
                Routine Title
              </label>
              <input
                id="input-builder-title"
                type="text"
                value={builderTitle}
                onChange={(e) => setBuilderTitle(e.target.value)}
                className="w-full bg-white border border-[#1A1A1A]/15 px-3 py-2 text-xs focus:border-[#1A1A1A] focus:outline-none"
                placeholder="My Tailored Workout Split"
              />
            </div>
            <div>
              <label
                htmlFor="select-builder-difficulty"
                className="block text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
              >
                Workout Difficulty
              </label>
              <select
                id="select-builder-difficulty"
                value={builderDifficulty}
                onChange={(e) => setBuilderDifficulty(e.target.value)}
                className="w-full bg-white border border-[#1A1A1A]/15 px-3 py-2 text-xs focus:border-[#1A1A1A] focus:outline-none"
              >
                <option value="Beginner-Friendly">Beginner-Friendly</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="textarea-builder-desc"
              className="block text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
            >
              Split Description
            </label>
            <textarea
              id="textarea-builder-desc"
              rows={2}
              value={builderDescription}
              onChange={(e) => setBuilderDescription(e.target.value)}
              className="w-full bg-white border border-[#1A1A1A]/15 px-3 py-1.5 text-xs focus:border-[#1A1A1A] focus:outline-none font-serif italic"
              placeholder="Tell us what makes this split effective..."
            />
          </div>

          {/* Days Tab Manager */}
          <div className="border-t border-[#1A1A1A]/10 pt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/60">
                Customize Specific Split Days
              </span>
              <button
                id="btn-builder-add-day"
                type="button"
                onClick={handleBuilderAddDay}
                className="flex items-center gap-1 text-[10px] font-bold bg-[#1A1A1A] text-white hover:bg-[#E63946] px-2 py-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Day
              </button>
            </div>

            {/* Day Buttons Tabs */}
            {builderSchedule.length === 0 ? (
              <div className="text-center py-6 text-[#1A1A1A]/30 text-xs italic font-serif">
                No training days are scheduled. Click &quot;Add Day&quot; or load a template
                split above to start from scratch!
              </div>
            ) : (
              <>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {builderSchedule.map((day, dIdx) => (
                    <button
                      key={dIdx}
                      id={`btn-builder-day-tab-${dIdx}`}
                      type="button"
                      onClick={() => setSelectedBuilderDayIndex(dIdx)}
                      className={`flex-shrink-0 px-3 py-2 text-xs font-mono font-bold uppercase tracking-tight border ${
                        selectedBuilderDayIndex === dIdx
                          ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                          : "bg-white text-[#1A1A1A]/50 border-[#1A1A1A]/10 hover:border-[#1A1A1A]/20"
                      }`}
                    >
                      Day {dIdx + 1}
                    </button>
                  ))}
                </div>

                {/* Active Builder Day Editor */}
                {builderSchedule[selectedBuilderDayIndex] && (
                  <div className="bg-white border border-[#1A1A1A]/10 p-3 mt-2.5 space-y-3.5">
                    {/* Day fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-end">
                      <div className="md:col-span-2">
                        <label
                          htmlFor={`input-builder-day-name-${selectedBuilderDayIndex}`}
                          className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-1"
                        >
                          Day Name
                        </label>
                        <input
                          id={`input-builder-day-name-${selectedBuilderDayIndex}`}
                          type="text"
                          value={builderSchedule[selectedBuilderDayIndex].day}
                          onChange={(e) => handleBuilderUpdateDayField("day", e.target.value)}
                          className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs font-bold focus:border-[#1A1A1A]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`input-builder-day-duration-${selectedBuilderDayIndex}`}
                          className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-1"
                        >
                          Duration (Min)
                        </label>
                        <input
                          id={`input-builder-day-duration-${selectedBuilderDayIndex}`}
                          type="number"
                          value={builderSchedule[selectedBuilderDayIndex].durationMinutes}
                          onChange={(e) =>
                            handleBuilderUpdateDayField(
                              "durationMinutes",
                              parseInt(e.target.value) || 45,
                            )
                          }
                          className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs focus:border-[#1A1A1A]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <div>
                        <label
                          htmlFor={`select-builder-day-focus-${selectedBuilderDayIndex}`}
                          className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-1"
                        >
                          Split Focus
                        </label>
                        <select
                          id={`select-builder-day-focus-${selectedBuilderDayIndex}`}
                          value={builderSchedule[selectedBuilderDayIndex].activityType}
                          onChange={(e) =>
                            handleBuilderUpdateDayField("activityType", e.target.value)
                          }
                          className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs"
                        >
                          <option value="Strength">Strength / Hypertrophy</option>
                          <option value="Cardio">Metabolic Cardio / HIIT</option>
                          <option value="Rest">Dedicated Rest Recovery</option>
                          <option value="Stretching">Active Stretching / Yoga</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-end">
                        <button
                          id="btn-builder-remove-day"
                          type="button"
                          onClick={() => handleBuilderRemoveDay(selectedBuilderDayIndex)}
                          className="flex items-center gap-1 text-[10px] font-bold text-red-600 hover:text-white hover:bg-red-600 px-2.5 py-1.5 border border-red-600/20 transition-all font-mono"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Day{" "}
                          {selectedBuilderDayIndex + 1}
                        </button>
                      </div>
                    </div>

                    {/* Exercise List Editor */}
                    <div className="border-t border-[#1A1A1A]/5 pt-3">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-[#1A1A1A]/40 block mb-2">
                        Exercises in this split day
                      </span>

                      {builderSchedule[selectedBuilderDayIndex].exercises.length === 0 ? (
                        <div className="text-center py-5 text-[#1A1A1A]/30 text-xs italic font-serif bg-[#F9F8F6]">
                          No exercises loaded. Add from the exercise database below!
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                          {builderSchedule[selectedBuilderDayIndex].exercises.map(
                            (ex, exIdx) => (
                              <div
                                key={exIdx}
                                className="bg-[#F9F8F6] border border-[#1A1A1A]/5 p-2 flex flex-col gap-2 relative"
                              >
                                {/* Top line Name & Delete */}
                                <div className="flex justify-between items-center gap-2">
                                  <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-tight">
                                    {exIdx + 1}. {ex.name}
                                  </span>
                                  <button
                                    aria-label="Remove exercise"
                                    id={`btn-builder-delete-ex-${exIdx}`}
                                    type="button"
                                    onClick={() => handleBuilderRemoveExerciseFromDay(exIdx)}
                                    className="text-[#1A1A1A]/40 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Inputs sets, reps, rest, instruction */}
                                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                                  <div>
                                    <label
                                      htmlFor={`input-builder-ex-sets-${exIdx}`}
                                      className="block text-[8px] text-[#1A1A1A]/40 font-bold uppercase mb-0.5"
                                    >
                                      Sets
                                    </label>
                                    <input
                                      id={`input-builder-ex-sets-${exIdx}`}
                                      type="number"
                                      value={ex.sets}
                                      onChange={(e) =>
                                        handleBuilderUpdateExerciseField(
                                          exIdx,
                                          "sets",
                                          parseInt(e.target.value) || 3,
                                        )
                                      }
                                      className="w-full bg-white border border-[#1A1A1A]/10 px-2 py-1"
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor={`input-builder-ex-reps-${exIdx}`}
                                      className="block text-[8px] text-[#1A1A1A]/40 font-bold uppercase mb-0.5"
                                    >
                                      Reps
                                    </label>
                                    <input
                                      id={`input-builder-ex-reps-${exIdx}`}
                                      type="text"
                                      value={ex.reps}
                                      onChange={(e) =>
                                        handleBuilderUpdateExerciseField(
                                          exIdx,
                                          "reps",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full bg-white border border-[#1A1A1A]/10 px-2 py-1 font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor={`input-builder-ex-rest-${exIdx}`}
                                      className="block text-[8px] text-[#1A1A1A]/40 font-bold uppercase mb-0.5"
                                    >
                                      Rest (Sec)
                                    </label>
                                    <input
                                      id={`input-builder-ex-rest-${exIdx}`}
                                      type="number"
                                      value={ex.restSeconds}
                                      onChange={(e) =>
                                        handleBuilderUpdateExerciseField(
                                          exIdx,
                                          "restSeconds",
                                          parseInt(e.target.value) || 60,
                                        )
                                      }
                                      className="w-full bg-white border border-[#1A1A1A]/10 px-2 py-1"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label
                                    htmlFor={`input-builder-ex-instruction-${exIdx}`}
                                    className="block text-[8px] text-[#1A1A1A]/40 font-bold uppercase mb-0.5"
                                  >
                                    Instruction Notes
                                  </label>
                                  <input
                                    id={`input-builder-ex-instruction-${exIdx}`}
                                    type="text"
                                    value={ex.instruction}
                                    onChange={(e) =>
                                      handleBuilderUpdateExerciseField(
                                        exIdx,
                                        "instruction",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-white border border-[#1A1A1A]/10 px-2 py-1 text-[11px]"
                                  />
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}

                      {/* ADD NEW EXERCISE FROM DATABASE SECTION */}
                      <div className="mt-3 bg-[#F9F8F6]/80 border border-[#1A1A1A]/10 p-3">
                        <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 flex items-center gap-1 mb-2">
                          <BookOpen className="w-3.5 h-3.5" /> Exercise Database Search / Filter
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {/* Category Filter */}
                          <div>
                            <label
                              htmlFor="select-builder-muscle-category"
                              className="block text-[8px] uppercase font-semibold text-[#1A1A1A]/40 mb-0.5"
                            >
                              Filter Muscles
                            </label>
                            <select
                              id="select-builder-muscle-category"
                              value={selectedDBCategory}
                              onChange={(e) => setSelectedDBCategory(e.target.value)}
                              className="w-full bg-white border border-[#1A1A1A]/15 px-2 py-1 text-xs"
                            >
                              {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Target Exercise select */}
                          <div>
                            <label
                              htmlFor="select-builder-exercise-name"
                              className="block text-[8px] uppercase font-semibold text-[#1A1A1A]/40 mb-0.5"
                            >
                              Select Exercise
                            </label>
                            <select
                              id="select-builder-exercise-name"
                              value={selectedDBExerciseName}
                              onChange={(e) => setSelectedDBExerciseName(e.target.value)}
                              className="w-full bg-white border border-[#1A1A1A]/15 px-2 py-1 text-xs font-bold"
                            >
                              {EXERCISE_DATABASE.filter(
                                (e) =>
                                  e.targetMuscle.toLowerCase() ===
                                    selectedDBCategory.toLowerCase() ||
                                  (selectedDBCategory === "Core" &&
                                    ["Core", "Lower Abs", "Obliques"].includes(
                                      e.targetMuscle,
                                    )) ||
                                  (selectedDBCategory === "Back" &&
                                    ["Lats", "Mid Back", "Upper Back", "Lower Back"].includes(
                                      e.targetMuscle,
                                    )) ||
                                  (selectedDBCategory === "Legs" &&
                                    ["Quads", "Hamstrings", "Glutes"].includes(e.targetMuscle)),
                              ).map((e) => (
                                <option key={e.name} value={e.name}>
                                  {e.name} ({e.targetMuscle})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <button
                          id="btn-builder-add-ex"
                          type="button"
                          onClick={handleBuilderAddExerciseToDay}
                          disabled={!selectedDBExerciseName}
                          className="w-full mt-3.5 py-1.5 bg-[#1A1A1A] hover:bg-[#E63946] disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                          Add Selected Exercise to Day {selectedBuilderDayIndex + 1}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#1A1A1A]/10 flex justify-between gap-3">
          <button
            id="btn-builder-cancel"
            onClick={onClose}
            className="text-xs uppercase font-bold bg-[#1A1A1A]/5 text-[#1A1A1A]/60 border border-[#1A1A1A]/10 px-5 py-3 hover:bg-[#1A1A1A] hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            id="btn-builder-save"
            onClick={handleSaveBuilderPlan}
            className="text-xs uppercase font-bold bg-[#E63946] hover:bg-[#d62828] text-white px-6 py-3 transition-all font-mono"
          >
            Save New Splitting Routine
          </button>
        </div>
      </div>
    </Modal>
  );
}
