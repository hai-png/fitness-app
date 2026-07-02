/**
 * BuilderDayEditor
 *
 * Renders the "Active Builder Day Editor" panel inside the SplitBuilder modal:
 * the day-name / duration / split-focus fields, the delete-day button, the
 * per-exercise list (rendered via `BuilderExerciseRow` children), and the
 * "Add new exercise from database" picker (category filter + exercise select +
 * add button).
 *
 * Pure presentational component. All mutations are delegated up via callbacks.
 */

import { Trash2, BookOpen } from "lucide-react";
import type { WeeklyScheduleDay, Exercise } from "../../engine";
import { EXERCISE_DATABASE } from "../../data/workoutTemplates";
import BuilderExerciseRow from "./BuilderExerciseRow";

// Categories list for exercise DB lookup
const CATEGORIES = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"];

interface BuilderDayEditorProps {
  /** The active day being edited (guaranteed non-null by parent gating). */
  day: WeeklyScheduleDay;
  /** Index of the active day (used for ids + labels). */
  selectedBuilderDayIndex: number;
  /** Update a single field on the active day (name, duration, activityType). */
  onUpdateDayField: (field: keyof WeeklyScheduleDay, val: string | number) => void;
  /** Remove the active day. */
  onRemoveDay: (dayIdx: number) => void;
  /** Update a single field on an exercise in this day. */
  onUpdateExerciseField: (exIdx: number, field: keyof Exercise, val: string | number) => void;
  /** Remove an exercise from this day. */
  onRemoveExercise: (exIdx: number) => void;
  /** Add the currently-selected DB exercise to this day. */
  onAddExercise: () => void;
  /** Currently-selected muscle category filter. */
  selectedDBCategory: string;
  /** Change the muscle category filter. */
  onSelectDBCategory: (cat: string) => void;
  /** Currently-selected exercise name from the DB. */
  selectedDBExerciseName: string;
  /** Change the selected exercise name from the DB. */
  onSelectDBExerciseName: (name: string) => void;
}

export default function BuilderDayEditor({
  day,
  selectedBuilderDayIndex,
  onUpdateDayField,
  onRemoveDay,
  onUpdateExerciseField,
  onRemoveExercise,
  onAddExercise,
  selectedDBCategory,
  onSelectDBCategory,
  selectedDBExerciseName,
  onSelectDBExerciseName,
}: BuilderDayEditorProps) {
  return (
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
            value={day.day}
            onChange={(e) => onUpdateDayField("day", e.target.value)}
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
            value={day.durationMinutes}
            onChange={(e) =>
              onUpdateDayField("durationMinutes", parseInt(e.target.value) || 45)
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
            value={day.activityType}
            onChange={(e) => onUpdateDayField("activityType", e.target.value)}
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
            onClick={() => onRemoveDay(selectedBuilderDayIndex)}
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

        {day.exercises.length === 0 ? (
          <div className="text-center py-5 text-[#1A1A1A]/30 text-xs italic font-serif bg-[#F9F8F6]">
            No exercises loaded. Add from the exercise database below!
          </div>
        ) : (
          <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
            {day.exercises.map((ex, exIdx) => (
              <BuilderExerciseRow
                key={exIdx}
                ex={ex}
                exIdx={exIdx}
                onUpdateField={onUpdateExerciseField}
                onRemove={onRemoveExercise}
              />
            ))}
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
                onChange={(e) => onSelectDBCategory(e.target.value)}
                className="w-full bg-white border border-[#1A1A1A]/15 px-2 py-1 text-xs"
              >
                {CATEGORIES.map((cat) => (
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
                onChange={(e) => onSelectDBExerciseName(e.target.value)}
                className="w-full bg-white border border-[#1A1A1A]/15 px-2 py-1 text-xs font-bold"
              >
                {EXERCISE_DATABASE.filter(
                  (e) =>
                    e.targetMuscle.toLowerCase() ===
                      selectedDBCategory.toLowerCase() ||
                    (selectedDBCategory === "Core" &&
                      ["Core", "Lower Abs", "Obliques"].includes(e.targetMuscle)) ||
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
            onClick={onAddExercise}
            disabled={!selectedDBExerciseName}
            className="w-full mt-3.5 py-1.5 bg-[#1A1A1A] hover:bg-[#E63946] disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Add Selected Exercise to Day {selectedBuilderDayIndex + 1}
          </button>
        </div>
      </div>
    </div>
  );
}
